/**
 * 《星隕編年史：霧海遺城》 - 核心遊戲引擎與目標導引狀態機 (Game Engine v2.2 Commercial Edition)
 * 100% 零 Emoji、雙階段智慧避障尋路、機關解鎖自動開門、智能戰鬥出招與章節跳轉支援
 */

class StarfallEngine {
  // 把 EXP 換算成等級；回傳是否升級（呼叫端據此決定 recalcStats 是否補滿 HP/MP）
  _levelUpFromExp() {
    let leveled = false;
    while (this.state.exp >= this.state.maxExp) {
      this.state.exp -= this.state.maxExp;
      this.state.level++;
      this.state.maxExp = Math.round(this.state.maxExp * 1.35);
      this.state.skillPoints += 1;
      leveled = true;
    }
    return leveled;
  }

  abyssModOf(id) {
    return (this.data.abyssMods || []).find(m => m.id === id) || null;
  }

  constructor(data) {
    this.data = data || (typeof window !== "undefined" ? window.GAME_DATA : null);
    this.resetState();
  }

  resetState() {
    this.state = {
      name: "艾爾文 (Elwyn)",
      level: 1,
      exp: 0,
      maxExp: 100,
      hp: 150,
      maxHp: 150,
      mp: 80,
      maxMp: 80,
      baseAtk: 18,
      baseDef: 9,
      baseCrit: 12,
      bonusMaxHp: 0,
      burst: 35,
      gold: 100,
      skillPoints: 1,
      unlockedSkills: ["slash", "star_bolt", "guard", "astral_judgment"],
      talents: {
        vitality: 0,
        arcane: 0,
        precision: 0,
        guardian: 0,
        alchemist: 0,
        explorer: 0
      },
      companion: "lumi",
      unlockedCompanions: ["lumi"],
      equipment: {
        weapon: "rusty_sword",
        armor: "traveler_cloak",
        relic: "cracked_pendant"
      },
      equipUpgrades: {
        weapon: 0,
        armor: 0,
        relic: 0
      },
      inventory: {
        healing_potion: 3,
        mana_elixir: 2,
        moon_herb: 2,
        star_shard: 1
      },
      keys: {},
      chapter: 1,
      subZone: 1,
      inAbyss: false,
      abyssFloor: 0,
      maxAbyssFloor: 0,
      x: 2,
      y: 6,
      flags: {},
      completedEvents: {},
      completedSideQuests: [],
      compassEnabled: false,
      fullMapView: false,
      pulseCooldown: 0,
      pulseVisionSteps: 0,
      weaponElement: "physical",
      viewMode: "2d_pixel",
      viewDefaultVer: 2,
      sharpness: 100,
      polishTurns: 0,
      spiritLevel: 0,
      canteenMeal: null,
      zoneMasteryClaimed: {},
      fieldBuff: null,
      loreUnlocked: [],
      achievements: [],
      bestiaryKills: {},
      board: { prog: {}, done: [] },
      train: {},
      story: {},
      bounty: { slots: [], claimed: 0 },
      visitedZones: {},
      stats: {
        battlesWon: 0,
        shieldsBroken: 0,
        itemsCrafted: 0,
        puzzlesSolved: 0,
        stepsTaken: 0,
        mysteriesResolved: 0,
        shopPurchases: 0,
        secretsFound: 0,
        ambushesTriggered: 0,
        combosTriggered: 0,
        reliquariesOpened: 0,
        perfectCounters: 0,
        partsBroken: 0,
        tailsSevered: 0,
        foresightCounters: 0
      },
      playTimeSeconds: 0,
      exploredByChapter: {}
    };

    this.combat = null;
    this.lastPulseAnim = null;
    this.activeMap = [];
    this.activeEvents = {};
    this.activeLabels = {};
    this.logs = [];
    this.loadChapter(1, true, 1);
    this.recalcStats(true);
  }

  log(msg, type = "info") {
    const entry = {
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      msg,
      type
    };
    this.logs.unshift(entry);
    if (this.logs.length > 60) this.logs.pop();
    if (typeof window !== "undefined" && window.gameUI) {
      window.gameUI.onLogAdded(entry);
    }
  }

  getComputedStats() {
    const s = this.state;
    const t = s.talents;
    let maxHp = 110 + (s.level - 1) * 26 + (t.vitality || 0) * 28 + (s.bonusMaxHp || 0);
    let maxMp = 60 + (s.level - 1) * 10 + (t.arcane || 0) * 15;
    let atk = s.baseAtk + (s.level - 1) * 5 + (t.precision || 0) * 4;
    let def = s.baseDef + (s.level - 1) * 3 + (t.vitality || 0) * 2 + (t.guardian || 0) * 3;
    let crit = s.baseCrit + (t.precision || 0) * 4;
    let mpRegen = 6 + (t.arcane || 0) * 3;
    const tr = s.train || {};
    maxHp += (tr.vit || 0) * 16;
    atk += (tr.atk || 0) * 2;
    def += (tr.def || 0);
    maxMp += (tr.mp || 0) * 9;
    let vision = 6 + (t.explorer || 0) + ((s.pulseVisionSteps || 0) > 0 ? 3 : 0);
    let rewardMult = 1 + (t.explorer || 0) * 0.15;

    const upgs = s.equipUpgrades || { weapon: 0, armor: 0, relic: 0 };
    ["weapon", "armor", "relic"].forEach(slot => {
      const itemId = s.equipment[slot];
      const item = itemId ? this.data.items[itemId] : null;
      const upgLv = upgs[slot] || 0;
      const mult = 1 + upgLv * 0.15;
      if (item && item.stats) {
        if (item.stats.atk) atk += Math.max(item.stats.atk + upgLv * 2, Math.round(item.stats.atk * mult));
        if (item.stats.def) def += Math.max(item.stats.def + upgLv, Math.round(item.stats.def * mult));
        if (item.stats.crit) crit += Math.max(item.stats.crit + upgLv, Math.round(item.stats.crit * mult));
        if (item.stats.maxHp) maxHp += Math.max(item.stats.maxHp + upgLv * 6, Math.round(item.stats.maxHp * mult));
        if (item.stats.maxMp) maxMp += Math.max(item.stats.maxMp + upgLv * 3, Math.round(item.stats.maxMp * mult));
        if (item.stats.goldBonus) rewardMult += item.stats.goldBonus;
      }
    });

    const compObj = this.data.companions && s.companion ? this.data.companions[s.companion] : null;
    if (compObj && compObj.passiveBonus) {
      const pb = compObj.passiveBonus;
      if (pb.maxHp) maxHp += pb.maxHp;
      if (pb.maxMp) maxMp += pb.maxMp;
      if (pb.atk) atk += pb.atk;
      if (pb.def) def += pb.def;
      if (pb.crit) crit += pb.crit;
      if (pb.mpRegen) mpRegen += pb.mpRegen;
      if (pb.vision) vision += pb.vision;
    }

    if (s.fieldBuff && s.fieldBuff.battlesLeft > 0) {
      atk = Math.round(atk * (s.fieldBuff.atkMult || 1.18));
      def = Math.round(def * (s.fieldBuff.defMult || 1.18));
      crit += s.fieldBuff.critBonus || 12;
    }

    // 《魔物獵人》獵人公會星辰貓飯料理增益
    let mealArmor = 0;
    if (s.canteenMeal && s.canteenMeal.battlesLeft > 0) {
      if (s.canteenMeal.atkMult) atk = Math.round(atk * s.canteenMeal.atkMult);
      if (s.canteenMeal.defMult) def = Math.round(def * s.canteenMeal.defMult);
      if (s.canteenMeal.maxHpAdd) maxHp += s.canteenMeal.maxHpAdd;
      if (s.canteenMeal.critAdd) crit += s.canteenMeal.critAdd;
      if (s.canteenMeal.rewardAdd) rewardMult += s.canteenMeal.rewardAdd;
      if (s.canteenMeal.startArmor) mealArmor = s.canteenMeal.startArmor;
    }

    // 《魔物獵人》太刀氣刃計量表加成 (白刃+8%, 黃刃+16%, 紅刃+25%)
    const spiritMults = [1.0, 1.08, 1.16, 1.25];
    const spLv = Math.max(0, Math.min(3, s.spiritLevel || 0));
    atk = Math.round(atk * spiritMults[spLv]);

    if ((s.polishTurns || 0) > 0) {
      crit += 15;
    }

    return {
      maxHp,
      maxMp,
      atk,
      def,
      crit: Math.min(95, crit),
      mpRegen,
      startArmor: (t.guardian || 0) * 18 + (s.fieldBuff && s.fieldBuff.battlesLeft > 0 ? 20 : 0) + mealArmor,
      potionMult: 1 + (t.alchemist || 0) * 0.25,
      vision,
      rewardMult
    };
  }

  // ==================== 《魔物獵人》斬味系統、砥石研磨、3D視角與貓飯料理亭 ====================
  getSharpnessTierInfo() {
    const val = typeof this.state.sharpness === "number" ? this.state.sharpness : 100;
    if (val >= 90) return { tier: "purple", label: "紫斬", color: "#c084fc", mult: 1.38, partMult: 1.35 };
    if (val >= 72) return { tier: "white", label: "白斬", color: "#f8fafc", mult: 1.28, partMult: 1.22 };
    if (val >= 52) return { tier: "blue", label: "藍斬", color: "#38bdf8", mult: 1.18, partMult: 1.12 };
    if (val >= 32) return { tier: "green", label: "綠斬", color: "#4ade80", mult: 1.05, partMult: 1.0 };
    if (val >= 16) return { tier: "yellow", label: "黃斬", color: "#facc15", mult: 0.92, partMult: 0.85 };
    return { tier: "red", label: "紅斬(鈍刀)", color: "#ef4444", mult: 0.68, partMult: 0.6 };
  }

  sharpenWeapon() {
    if (this.combat && this.combat.rt) {
      if (this.combat.rt.sharpenCd > 0) return { ok: false, msg: "磨刀冷卻中" };
      this.combat.rt.sharpenCd = 6;
    }
    this.state.sharpness = 100;
    this.state.polishTurns = 2;
    if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("puzzle");
    const msg = `[砥石研磨] 使用高速砥石打磨武器！斬味恢復至【100 紫斬 (1.38x 傷害)】並獲得 2 次攻擊的【剛刃研磨 (不掉斬味 & 暴擊+15%)】！`;
    if (this.combat) {
      this.combat.log.push(msg);
      this.combat.fx = { text: "SHARPEN! 紫斬 1.38x", color: "#c084fc", ticks: 26 };
    } else {
      this.log(msg, "success");
    }
    if (typeof window !== "undefined" && window.gameUI) {
      window.gameUI.showToast("砥石研磨完成！斬味恢復至【紫斬 1.38x】", "gold");
    }
    return { ok: true, sharpness: 100, msg };
  }

  toggleViewMode() {
    const order = ["3d_shoulder", "3d_orbit", "2d_pixel"];
    const labels = {
      "3d_shoulder": "3D 越肩狩獵視角 (Monster Hunter 3D)",
      "3d_orbit": "3D 廣角戰術視角 (3D Tactical)",
      "2d_pixel": "2D 經典像素視角 (Classic 16-Bit)"
    };
    const cur = this.state.viewMode || "2d_pixel";
    const next = order[(order.indexOf(cur) + 1) % order.length];
    this.state.viewMode = next;
    if (next !== "2d_pixel") {
      this.state.fullMapView = false;
    }
    if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("click");
    this.log(`[視角切換] 已切換為【${labels[next]}】。`, "info");
    if (typeof window !== "undefined" && window.gameUI) {
      window.gameUI.showToast(`切換視角：${labels[next]}`, "teal");
    }
    return { ok: true, viewMode: next, label: labels[next] };
  }

  eatCanteenMeal(mealId = "meat_platter") {
    const meals = {
      meat_platter: {
        id: "meat_platter",
        name: "勇氣全肉拼盤(攻大)",
        atkMult: 1.22,
        defMult: 1.05,
        maxHpAdd: 20,
        critAdd: 8,
        rewardAdd: 0,
        startArmor: 15,
        battlesLeft: 4,
        desc: "攻擊力+22%、最大HP+20、暴擊+8%（持續 4 場狩獵）"
      },
      seafood_stew: {
        id: "seafood_stew",
        name: "深海龍蝦燉鍋(防大)",
        atkMult: 1.06,
        defMult: 1.25,
        maxHpAdd: 40,
        critAdd: 5,
        rewardAdd: 0,
        startArmor: 32,
        battlesLeft: 4,
        desc: "防禦力+25%、最大HP+40、開戰護甲+32（持續 4 場狩獵）"
      },
      golden_fondue: {
        id: "golden_fondue",
        name: "黃金星辰起司鍋(幸運)",
        atkMult: 1.12,
        defMult: 1.12,
        maxHpAdd: 25,
        critAdd: 15,
        rewardAdd: 0.35,
        startArmor: 18,
        battlesLeft: 4,
        desc: "討伐報酬金幣與經驗+35%、暴擊率+15%、攻防+12%（持續 4 場狩獵）"
      }
    };
    const meal = meals[mealId] || meals.meat_platter;
    this.state.canteenMeal = { ...meal };
    this.state.sharpness = 100;
    this.recalcStats(false);
    this.state.hp = Math.min(this.state.maxHp, this.state.hp + Math.round(this.state.maxHp * 0.45));
    this.state.mp = Math.min(this.state.maxMp, this.state.mp + Math.round(this.state.maxMp * 0.45));
    if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("heal");
    const msg = `[艾露貓料理長] 享用【${meal.name}】！${meal.desc}，並恢復 45% 體力與滿額紫斬！`;
    this.log(msg, "achievement");
    if (typeof window !== "undefined" && window.gameUI) {
      window.gameUI.showToast(`貓飯料理完成：【${meal.name}】！`, "gold");
    }
    return { ok: true, meal, msg };
  }

  recalcStats(fullHeal = false) {
    const comp = this.getComputedStats();
    this.state.maxHp = comp.maxHp;
    this.state.maxMp = comp.maxMp;
    if (fullHeal) {
      this.state.hp = comp.maxHp;
      this.state.mp = comp.maxMp;
    } else {
      this.state.hp = Math.min(this.state.hp, comp.maxHp);
      this.state.mp = Math.min(this.state.mp, comp.maxMp);
    }
    return comp;
  }

  selectCompanion(compId) {
    if (!this.state.unlockedCompanions.includes(compId)) return false;
    this.state.companion = compId;
    this.recalcStats(false);
    this.updateFogOfWar();
    const compObj = this.data.companions[compId];
    if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("click");
    this.log(`[星靈夥伴] 已切換隨行夥伴為【${compObj.name}】！`, "success");
    return true;
  }

  unlockAchievement(achId) {
    if (!this.state.achievements.includes(achId)) {
      const ach = this.data.achievements.find(a => a.id === achId);
      if (ach) {
        this.state.achievements.push(achId);
        this.log(`[解鎖成就] 【${ach.name}】— ${ach.desc}`, "achievement");
        if (typeof window !== "undefined" && window.gameUI) {
          window.gameUI.showToast(`[成就解鎖] ${ach.name}`, "gold");
        }
      }
    }
  }

  checkMilestoneAchievements() {
    if (this.state.gold >= 500) this.unlockAchievement("ach_rich");
    if (this.state.level >= 8) this.unlockAchievement("ach_max_level");
    if (this.state.loreUnlocked.length >= 10) this.unlockAchievement("ach_scholar");
    if (this.getWorldLoreCount() >= 15) this.unlockAchievement("ach_loremaster");
    if (this.state.stats.itemsCrafted >= 3) this.unlockAchievement("ach_craftsman");
    if (this.state.stats.shieldsBroken >= 5) this.unlockAchievement("ach_shield_breaker");
    if (this.state.stats.mysteriesResolved >= 1) this.unlockAchievement("ach_mystery_seeker");
    if (this.state.stats.shopPurchases >= 1) this.unlockAchievement("ach_patron");
    if ((this.state.completedSideQuests || []).length >= 3) this.unlockAchievement("ach_side_quest_master");
    if (
      this.state.flags["ch1_shrines_solved"] &&
      this.state.flags["ch2_cipher_solved"] &&
      this.state.flags["ch3_riddle_solved"] &&
      this.state.flags["ch4_cipher_solved"]
    ) {
      this.unlockAchievement("ach_puzzle_master");
    }
  }

  interactTile(x, y, tile, ev) {
    const coord = `${x},${y}`;
    const resolvedEv = ev || this.resolveEventAt(x, y, tile);

    if (tile === "F") {
      this.recalcStats(true);
      this.state.sharpness = 100;
      this.saveGame(0);
      if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("heal");
      this.log("[營火休息] 生命值、星力與武器斬味已完全恢復，並完成了自動存檔（可按 [G] 享用貓飯）。魔物也在林間重新出沒了。", "success");
      if (!this.state.inAbyss) this.respawnEnemies();
      if (typeof window !== "undefined" && window.gameUI) {
        window.gameUI.showToast("[營火休憩] HP/MP/紫斬 全滿 & 已自動存檔 (按 [G] 貓飯)", "teal");
        if (window.gameUI.addMapFloatText) window.gameUI.addMapFloatText(x, y, "HP/MP/紫斬 全滿!", "#4ade80");
      }
      return;
    }

    if (tile === "A") {
      if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("click");
      this.log("[鍛造工坊] 開啟星辰鍛造與鍊金工坊。", "info");
      if (typeof window !== "undefined" && window.gameUI) {
        window.gameUI.openModal("craft");
      }
      return;
    }

    if (tile === "?" && resolvedEv && resolvedEv.type === "mystery") {
      this.activeMap[y][x] = ".";
      this.markEventCompleted(coord);
      if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("mystery");
      const encIdx =
        typeof resolvedEv.encounterIndex === "number"
          ? resolvedEv.encounterIndex % this.data.mysteryEncounters.length
          : Math.floor(Math.random() * this.data.mysteryEncounters.length);
      const encounter = this.data.mysteryEncounters[encIdx];
      this.log(`[奇遇祭壇] 觸發星界奇遇：【${encounter.title}】！`, "chapter");
      if (typeof window !== "undefined" && window.gameUI) {
        window.gameUI.showMysteryModal(encounter);
      }
      return;
    }

    if (!resolvedEv) return;

    if (resolvedEv.type === "npc") {
      if (resolvedEv.storyChain) {
        this.talkStoryNpc(resolvedEv);
        return;
      }
      if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("click");
      let rewardText = "";
      const z = this.state.subZone || 1;
      const rewardFlag = `npc_reward_${this.state.chapter}_${coord}`;
      const rewardFlagZone = `npc_reward_${this.state.chapter}_${z}_${coord}`;

      const rewardClaimed = resolvedEv.sceneId ? !!this.state.flags[`scene_${resolvedEv.sceneId}`] : !!(this.state.flags[rewardFlag] || this.state.flags[rewardFlagZone]);
      if (resolvedEv.firstReward && !rewardClaimed) {
        this.state.flags[rewardFlag] = true;
        this.state.flags[rewardFlagZone] = true;
        if (resolvedEv.firstReward.gold) {
          this.state.gold += resolvedEv.firstReward.gold;
          rewardText += ` +${resolvedEv.firstReward.gold}G`;
        }
        if (resolvedEv.firstReward.items) {
          Object.entries(resolvedEv.firstReward.items).forEach(([id, cnt]) => {
            this.addItem(id, cnt);
            rewardText += ` 【${this.data.items[id].name}】x${cnt}`;
          });
        }
        if (resolvedEv.firstReward.key) {
          this.state.keys[resolvedEv.firstReward.key] = true;
          rewardText += ` 關鍵物品【${this.data.items[resolvedEv.firstReward.key].name}】`;
        }
      }

      if (resolvedEv.sceneId) this.state.flags[`scene_${resolvedEv.sceneId}`] = true; // 場景獎勵只領一次（不依座標）
      const dialogueLines = [...(resolvedEv.dialogue || [])];

      if (resolvedEv.sideQuestId) {
        const sqStatus = this.getSideQuestProgress(resolvedEv.sideQuestId);
        if (sqStatus) {
          const sq = sqStatus.quest;
          if (sqStatus.completed) {
            dialogueLines.push(`【支線委託已完成：${sq.title}】「再次感謝你的鼎力相助，願星光永遠庇佑你的旅途！」`);
          } else if (sqStatus.ready) {
            if (!this.state.completedSideQuests) this.state.completedSideQuests = [];
            this.state.completedSideQuests.push(sq.id);
            if (sq.reqType === "item" && sq.consumeItem) {
              this.state.inventory[sq.reqItem] -= sq.reqCount;
              if (this.state.inventory[sq.reqItem] <= 0) delete this.state.inventory[sq.reqItem];
            }
            const rw = sq.reward || {};
            if (rw.gold) {
              this.state.gold += rw.gold;
              rewardText += ` +${rw.gold}G`;
            }
            if (rw.sp) {
              this.state.skillPoints += rw.sp;
              rewardText += ` +${rw.sp}SP`;
            }
            if (rw.exp) {
              this.state.exp += rw.exp;
              rewardText += ` +${rw.exp}EXP`;
              this._levelUpFromExp();
              this.recalcStats(false);
            }
            if (rw.items) {
              Object.entries(rw.items).forEach(([id, cnt]) => {
                this.addItem(id, cnt);
                const itName = this.data.items[id] ? this.data.items[id].name : id;
                rewardText += ` 【${itName}】x${cnt}`;
              });
            }
            dialogueLines.push(`【完成支線：${sq.title}】${sq.completeMsg}`);
            if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("levelup");
            this.log(`[支線完成] 完成委託【${sq.title}】！獲得豐厚報酬：${rewardText.trim()}`, "achievement");
          } else {
            dialogueLines.push(`【支線進度：${sq.title} (${sqStatus.current}/${sqStatus.target})】目標：${sq.desc}`);
          }
        }
      }

      this.autoOpenUnlockedGates();
      if (typeof window !== "undefined" && window.gameUI) {
        window.gameUI.showDialogueModal(resolvedEv.name, resolvedEv.icon, dialogueLines, rewardText);
      }
      this.checkMilestoneAchievements();
      return;
    }

    if (resolvedEv.type === "lore") {
      const lore = this.data.loreEntries.find(l => l.id === resolvedEv.loreId);
      if (lore) {
        if (!this.state.loreUnlocked.includes(lore.id)) {
          this.state.loreUnlocked.push(lore.id);
        }
        if (resolvedEv.giveKey) {
          this.state.keys[resolvedEv.giveKey] = true;
        }
        if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("chest");
        this.log(`[獲得手札] 發現星辰手札：${lore.title}`, "success");
        if (resolvedEv.extraMsg) this.log(`[關鍵線索] ${resolvedEv.extraMsg}`, "success");
        if (typeof window !== "undefined" && window.gameUI) {
          window.gameUI.showLorePopup(lore, resolvedEv.extraMsg);
        }
        this.checkMilestoneAchievements();
      }
      return;
    }

    if (resolvedEv.type === "chest") {
      this.activeMap[y][x] = ".";
      this.markEventCompleted(coord);
      if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("chest");

      const parts = [];
      if (resolvedEv.reward.gold) {
        const g = Math.round(resolvedEv.reward.gold * this.getComputedStats().rewardMult);
        this.state.gold += g;
        parts.push(`${g} 金幣`);
      }
      if (resolvedEv.reward.items) {
        Object.entries(resolvedEv.reward.items).forEach(([itemId, count]) => {
          this.addItem(itemId, count);
          const itemObj = this.data.items[itemId];
          parts.push(`【${itemObj ? itemObj.name : itemId}】x${count}`);
        });
      }
      if (resolvedEv.reward.loreId && !this.state.loreUnlocked.includes(resolvedEv.reward.loreId)) {
        this.state.loreUnlocked.push(resolvedEv.reward.loreId);
        const lObj = this.data.loreEntries.find(l => l.id === resolvedEv.reward.loreId);
        if (lObj) parts.push(`手札${lObj.title}`);
      }
      const summary = parts.join("、");
      this.log(`[開啟寶箱] 獲得：${summary}！`, "success");
      if (typeof window !== "undefined" && window.gameUI) {
        window.gameUI.showToast(`[獲得寶箱] ${summary}`, "gold");
        if (window.gameUI.addMapFloatText) window.gameUI.addMapFloatText(x, y, `寶箱: ${summary}`, "#facc15");
      }
      this.checkMilestoneAchievements();
      return;
    }

    if (resolvedEv.type === "gather") {
      this.activeMap[y][x] = ".";
      this.markEventCompleted(coord);
      this.addItem(resolvedEv.item, resolvedEv.count);
      const itemObj = this.data.items[resolvedEv.item];
      if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("click");
      this.log(`[素材採集] 獲得：【${itemObj.name}】x${resolvedEv.count}`, "success");
      if (typeof window !== "undefined" && window.gameUI) {
        window.gameUI.showToast(`[採集成功] ${itemObj.name} x${resolvedEv.count}`, "teal");
        if (window.gameUI.addMapFloatText) window.gameUI.addMapFloatText(x, y, `+${resolvedEv.count} ${itemObj.name}`, "#2dd4bf");
      }
      return;
    }

    if (resolvedEv.type === "switch") {
      if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("puzzle");
      this.state.flags[resolvedEv.id] = true;
      if (resolvedEv.flag) this.state.flags[resolvedEv.flag] = true;

      if (this.state.flags["sanctum_altar_1"] && this.state.flags["sanctum_altar_2"]) {
        this.state.flags["ch5_z1_obelisks_purified"] = true;
      }

      if (resolvedEv.group === "ch1_shrines") {
        this.log(`[星碑共鳴] ${resolvedEv.msg}`, "success");
        const litCount = ["s1_west", "s1_south", "s1_east"].filter(k => this.state.flags[k]).length;
        if (typeof window !== "undefined" && window.gameUI && window.gameUI.addMapFloatText) {
          window.gameUI.addMapFloatText(x, y, `${resolvedEv.name} 已點亮 (${litCount}/3)!`, "#facc15");
        }
        if (this.state.flags["s1_west"] && this.state.flags["s1_south"] && this.state.flags["s1_east"]) {
          this.state.flags["ch1_shrines_solved"] = true;
          this.state.stats.puzzlesSolved++;
          this.autoOpenUnlockedGates();
          this.log("[封印解除] 三座古老星碑全數共鳴！中央的荊棘封印門 (11,7) 已經自動敞開！", "achievement");
          if (typeof window !== "undefined" && window.gameUI) {
            window.gameUI.showToast("[解謎成功] 三座星碑已點亮！荊棘封印門已開啟", "gold");
          }
        } else {
          if (typeof window !== "undefined" && window.gameUI) {
            window.gameUI.showToast(`[星碑點亮] ${resolvedEv.name} 已啟動 (${litCount}/3)`, "teal");
          }
        }
      } else {
        if (resolvedEv.bridgeTiles) {
          resolvedEv.bridgeTiles.forEach(t => {
            if (this.activeMap[t.y]) this.activeMap[t.y][t.x] = "=";
          });
          this.state.stats.puzzlesSolved++;
        }
        this.autoOpenUnlockedGates();
        this.log(`[機關啟動] ${resolvedEv.msg}`, "success");
        if (typeof window !== "undefined" && window.gameUI) {
          window.gameUI.showToast(`[機關啟動] ${resolvedEv.name}已開啟！`, "gold");
          if (window.gameUI.addMapFloatText) window.gameUI.addMapFloatText(x, y, `${resolvedEv.name} 已啟動!`, "#facc15");
        }
      }
      this.checkMilestoneAchievements();
      return;
    }

    if (resolvedEv.type === "riddle") {
      if (this.state.flags[resolvedEv.flag]) {
        this.log("[機關已解] 此處的古老機關已經解開。", "info");
        return;
      }
      if (typeof window !== "undefined" && window.gameUI) {
        window.gameUI.showRiddleModal(resolvedEv);
      }
      return;
    }

    if (tile === "W" || resolvedEv.type === "secret_wall") {
      this.activeMap[y][x] = ".";
      delete this.activeLabels[coord];
      this.markEventCompleted(coord);
      this.state.stats.secretsFound = (this.state.stats.secretsFound || 0) + 1;
      this.state.exp += 25;
      if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("puzzle");
      this.log("[秘牆破除] 你擊碎了帶有裂痕的古代幻象牆，發現了通往隱藏秘寶室的暗道 (+25 EXP)！", "achievement");
      if (typeof window !== "undefined" && window.gameUI) {
        window.gameUI.showToast("[發現秘道] 隱藏裂隙牆已擊碎！(+25 EXP)", "gold");
        if (window.gameUI.addMapFloatText) window.gameUI.addMapFloatText(x, y, "秘道開啟! +25EXP", "#facc15");
      }
      return;
    }

    if (tile === "T" || resolvedEv.type === "trap") {
      this.activeMap[y][x] = ".";
      this.markEventCompleted(coord);
      const trapDmg = Math.max(8, Math.round(this.state.maxHp * 0.08));
      this.state.hp = Math.max(1, this.state.hp - trapDmg);
      if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("hit");
      this.log(
        `[觸發陷阱] 誤觸【星蝕地脈陷阱】受到 -${trapDmg} HP！（提示：靠近陷阱時按 [Q] 施放【星輝脈衝】可安全拆除並獲得星辰碎晶！）`,
        "warn"
      );
      if (typeof window !== "undefined" && window.gameUI) {
        window.gameUI.showToast(`誤觸陷阱 -${trapDmg} HP (按 Q 星輝脈衝可拆除獲獎)`, "warn");
        if (window.gameUI.addMapFloatText) window.gameUI.addMapFloatText(x, y, `陷阱 -${trapDmg}HP`, "#fb7185");
      }
      return;
    }

    if (tile === "D" || resolvedEv.type === "fountain") {
      this.activeMap[y][x] = ".";
      delete this.activeLabels[coord];
      this.markEventCompleted(coord);
      this.state.fieldBuff = {
        name: "星泉聖輝庇護",
        atkMult: 1.18,
        defMult: 1.18,
        critBonus: 12,
        battlesLeft: 3
      };
      this.recalcStats(false);
      const healHp = Math.round(this.state.maxHp * 0.4);
      const healMp = Math.round(this.state.maxMp * 0.4);
      this.state.hp = Math.min(this.state.maxHp, this.state.hp + healHp);
      this.state.mp = Math.min(this.state.maxMp, this.state.mp + healMp);
      if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("heal");
      this.log(
        `[星泉祝福] 飲下澄澈星泉，恢復 +${healHp} HP / +${healMp} MP，並獲得【星泉聖輝庇護】（接下來 3 場戰鬥攻擊+18%、防禦+18%、暴擊+12%、開局護甲+20）！`,
        "achievement"
      );
      if (typeof window !== "undefined" && window.gameUI) {
        window.gameUI.showToast("[星泉祝福] 攻防+18% & 暴擊+12% (持續 3 戰)", "teal");
        if (window.gameUI.addMapFloatText) window.gameUI.addMapFloatText(x, y, "星泉祝福! 攻防UP", "#2dd4bf");
      }
      return;
    }

    if (tile === "V" || resolvedEv.type === "trial_obelisk") {
      this.activeMap[y][x] = ".";
      delete this.activeLabels[coord];
      this.markEventCompleted(coord);
      const bonusGold = 65 + this.state.chapter * 20;
      const bonusExp = 50 + this.state.chapter * 15;
      this.state.gold += bonusGold;
      this.state.exp += bonusExp;
      this.state.burst = Math.min(100, this.state.burst + 35);
      this.addItem("star_shard", 2);
      this._levelUpFromExp();
      this.recalcStats(false);
      if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("levelup");
      this.log(
        `[星界試煉碑] 通過古碑星魂共鳴，獲得 +${bonusExp} EXP、+${bonusGold} 金幣、【星辰碎晶】x2 與 +35 極限星能！`,
        "achievement"
      );
      if (typeof window !== "undefined" && window.gameUI) {
        window.gameUI.showToast(`[試煉碑共鳴] +${bonusExp}EXP +${bonusGold}G +2星辰碎晶`, "gold");
        if (window.gameUI.addMapFloatText) window.gameUI.addMapFloatText(x, y, `+${bonusExp}EXP +2碎晶`, "#facc15");
      }
      return;
    }

    if (tile === "O" || resolvedEv.type === "warp_pad") {
      const tx = typeof resolvedEv.targetX === "number" ? resolvedEv.targetX : x < 26 ? 36 : 21;
      const ty = typeof resolvedEv.targetY === "number" ? resolvedEv.targetY : x < 26 ? 24 : 3;
      this.state.x = tx;
      this.state.y = ty;
      this.updateFogOfWar();
      if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("puzzle");
      this.log(`[星軌躍遷] 踏入【${resolvedEv.name || "星軌躍遷陣"}】，瞬間跨越巨型迷宮躍遷至 (${tx}, ${ty})！`, "achievement");
      if (typeof window !== "undefined" && window.gameUI) {
        window.gameUI.showToast(`[星軌躍遷] 瞬間傳送至 (${tx}, ${ty})！`, "teal");
        if (window.gameUI.addMapFloatText) window.gameUI.addMapFloatText(tx, ty, "星軌躍遷!", "#38bdf8");
      }
      return;
    }

    if (tile === "U" || resolvedEv.type === "ancient_reliquary") {
      this.activeMap[y][x] = ".";
      delete this.activeLabels[coord];
      this.markEventCompleted(coord);
      this.state.bonusMaxHp = (this.state.bonusMaxHp || 0) + 15;
      this.state.baseAtk += 2;
      this.state.baseDef += 1;
      this.state.gold += 80;
      this.state.exp += 65;
      this.state.stats.reliquariesOpened = (this.state.stats.reliquariesOpened || 0) + 1;
      this._levelUpFromExp();
      this.recalcStats(false);
      this.state.hp = Math.min(this.state.maxHp, this.state.hp + 15);
      if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("levelup");
      this.log(
        `[遠古聖棺] 啟封【${resolvedEv.name || "遠古星魂聖棺"}】！吸收先民星魂，永久提升：最大生命 +15、基礎攻擊 +2、基礎防禦 +1，並獲得 +65 EXP 與 +80 金幣！`,
        "achievement"
      );
      if (typeof window !== "undefined" && window.gameUI) {
        window.gameUI.showToast("[遠古聖棺] 永久提升 HP+15 攻+2 防+1 & +80G！", "gold");
        if (window.gameUI.addMapFloatText) window.gameUI.addMapFloatText(x, y, "永久屬性提升! HP+15 攻+2 防+1", "#facc15");
      }
      return;
    }

    if (resolvedEv.type === "enemy" || resolvedEv.type === "boss") {
      this.startCombat(resolvedEv, coord);
    }
  }

  resolveMysteryChoice(encounterId, choiceIndex) {
    const enc = this.data.mysteryEncounters.find(e => e.id === encounterId);
    if (!enc || !enc.choices[choiceIndex]) return { ok: false, msg: "無效的抉擇" };
    const ch = enc.choices[choiceIndex];

    if (ch.costGold && this.state.gold < ch.costGold) {
      return { ok: false, msg: `金幣不足（需要 ${ch.costGold} G）！` };
    }
    if (ch.costItem && (this.state.inventory[ch.costItem] || 0) < 1) {
      const itName = this.data.items[ch.costItem] ? this.data.items[ch.costItem].name : ch.costItem;
      return { ok: false, msg: `缺少所需物品【${itName}】！` };
    }
    if (ch.costHp && this.state.hp <= ch.costHp) {
      return { ok: false, msg: `當前生命值過低，無法承受代價！` };
    }

    if (ch.costGold) this.state.gold -= ch.costGold;
    if (ch.costItem) {
      this.state.inventory[ch.costItem]--;
      if (this.state.inventory[ch.costItem] <= 0) delete this.state.inventory[ch.costItem];
    }
    if (ch.costHp) this.state.hp = Math.max(1, this.state.hp - ch.costHp);

    const rw = ch.reward || {};
    if (rw.gold) this.state.gold += rw.gold;
    if (rw.sp) this.state.skillPoints += rw.sp;
    if (rw.baseAtk) this.state.baseAtk += rw.baseAtk;
    if (rw.baseMaxHpBonus) this.state.bonusMaxHp = (this.state.bonusMaxHp || 0) + rw.baseMaxHpBonus;
    if (rw.fullBurst) this.state.burst = 100;
    if (rw.exp) {
      this.state.exp += rw.exp;
      this._levelUpFromExp();
    }
    if (rw.items) {
      Object.entries(rw.items).forEach(([id, cnt]) => this.addItem(id, cnt));
    }
    this.recalcStats(false);
    if (rw.healHp) this.state.hp = Math.min(this.state.maxHp, this.state.hp + rw.healHp);
    if (rw.healMp) this.state.mp = Math.min(this.state.maxMp, this.state.mp + rw.healMp);

    this.state.stats.mysteriesResolved = (this.state.stats.mysteriesResolved || 0) + 1;
    this.checkMilestoneAchievements();
    if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("puzzle");
    this.log(`[奇遇結果] ${ch.resultMsg}`, "achievement");
    return { ok: true, msg: ch.resultMsg };
  }

  buyShopItem(itemId) {
    const entry = this.data.shopCatalog.find(s => s.itemId === itemId);
    if (!entry) return { ok: false, msg: "商品不存在" };
    if (entry.minChapter && this.state.chapter < entry.minChapter) return { ok: false, msg: "商人尚未進這批貨（需進行到第 " + entry.minChapter + " 章）" };
    if (this.state.gold < entry.price) {
      return { ok: false, msg: "金幣不足！" };
    }
    this.state.gold -= entry.price;
    this.addItem(itemId, 1);
    this.state.stats.shopPurchases = (this.state.stats.shopPurchases || 0) + 1;
    this.checkMilestoneAchievements();
    const item = this.data.items[itemId];
    if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("coin");
    this.log(`[星界行商] 購買了【${item.name}】（-${entry.price} G）。`, "success");
    return { ok: true, item };
  }

  buyMysteryBox() {
    const cost = 120;
    if (this.state.gold < cost) {
      return { ok: false, msg: `開啟神秘星界盲盒需要 ${cost} G！` };
    }
    this.state.gold -= cost;
    this.state.stats.shopPurchases = (this.state.stats.shopPurchases || 0) + 1;

    const pool = [
      { type: "item", id: "phoenix_salve", cnt: 1, label: "【鳳凰涅槃膏】x1" },
      { type: "item", id: "meteor_iron", cnt: 2, label: "【星隕玄鐵】x2" },
      { type: "item", id: "void_essence", cnt: 2, label: "【虛空星塵】x2" },
      { type: "item", id: "greater_potion", cnt: 2, label: "【高階聖輝靈藥】x2" },
      { type: "sp", cnt: 1, label: "【星辰技能點數 +1 SP】" }
    ];
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (pick.type === "item") {
      this.addItem(pick.id, pick.cnt);
    } else if (pick.type === "sp") {
      this.state.skillPoints += pick.cnt;
    }

    this.checkMilestoneAchievements();
    if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("chest");
    this.log(`[盲盒大獎] 開啟【神秘星界盲盒】獲得：${pick.label}！`, "achievement");
    return { ok: true, msg: `開啟盲盒獲得：${pick.label}！` };
  }

  sellItem(itemId) {
    if ((this.state.inventory[itemId] || 0) <= 0) return { ok: false, msg: "沒有可出售的物品" };
    const item = this.data.items[itemId];
    if (!item || item.category === "key") return { ok: false, msg: "關鍵物品無法出售" };
    const sellPrice = Math.max(5, Math.round((item.value || 20) * 0.6));
    this.state.inventory[itemId]--;
    if (this.state.inventory[itemId] <= 0) delete this.state.inventory[itemId];
    this.state.gold += sellPrice;
    this.checkMilestoneAchievements();
    if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("coin");
    this.log(`[出售物品] 出售【${item.name}】獲得 +${sellPrice} G。`, "info");
    return { ok: true, gold: sellPrice };
  }

  solveRiddle(ev, inputAnswer) {
    if (String(inputAnswer).trim() === String(ev.answer).trim()) {
      this.state.flags[ev.flag] = true;
      this.state.stats.puzzlesSolved++;
      if (ev.rewardKey) {
        this.state.keys[ev.rewardKey] = true;
      }
      this.autoOpenUnlockedGates();
      if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("puzzle");
      this.log(`[密碼解鎖] ${ev.successMsg}`, "achievement");
      this.checkMilestoneAchievements();
      return true;
    } else {
      if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("hit");
      this.log("[密碼錯誤] 密碼不正確，請先在迷宮中探索並閱讀對應的《星辰手札》獲取密碼線索！", "warn");
      return false;
    }
  }

  addItem(itemId, count = 1) {
    const item = this.data.items[itemId];
    if (!item) return;
    if (item.category === "key") {
      this.state.keys[itemId] = true;
      return;
    }
    this.state.inventory[itemId] = (this.state.inventory[itemId] || 0) + count;
  }

  useItem(itemId) {
    const count = this.state.inventory[itemId] || 0;
    if (count <= 0) return { ok: false, msg: "物品數量不足" };
    const item = this.data.items[itemId];
    if (!item) return { ok: false, msg: "未知的物品" };

    if (this.combat && !item.usableInCombat) {
      return { ok: false, msg: "此物品無法在戰鬥中使用" };
    }
    if (this.combat && this.combat.rt) {
      if (this.combat.rt.potionCd > 0) return { ok: false, msg: "道具冷卻中" };
      this.combat.rt.potionCd = 1.2;
    }
    if (!this.combat && !item.usableInMap) {
      return { ok: false, msg: "此物品僅能在戰鬥中使用" };
    }

    const comp = this.getComputedStats();
    const mult = comp.potionMult;
    this.state.inventory[itemId]--;
    if (this.state.inventory[itemId] <= 0) delete this.state.inventory[itemId];

    let msgParts = [];
    if (item.effect.hp) {
      const heal = Math.round(item.effect.hp * mult);
      this.state.hp = Math.min(this.state.maxHp, this.state.hp + heal);
      msgParts.push(`恢復 ${heal} HP`);
    }
    if (item.effect.mp) {
      const mana = Math.round(item.effect.mp * mult);
      this.state.mp = Math.min(this.state.maxMp, this.state.mp + mana);
      msgParts.push(`恢復 ${mana} MP`);
    }
    if (item.effect.burst) {
      this.state.burst = Math.min(100, this.state.burst + item.effect.burst);
      msgParts.push(`+${item.effect.burst} 極限星能`);
    }
    if (item.effect.cleanse && this.combat) {
      this.combat.playerStatuses = { regen: this.combat.playerStatuses.regen || 0 };
      msgParts.push("解除負面狀態");
    }

    if (this.combat) {
      if (item.effect.dmg) {
        const dmg = Math.round(item.effect.dmg * mult);
        this.combat.enemyHp = Math.max(0, this.combat.enemyHp - dmg);
        this.combat.shake = 12;
        this.combat.fx = { text: `-${dmg}`, color: "#facc15", ticks: 26 };
        msgParts.push(`對敵人造成 ${dmg} 點爆炸傷害`);
        if (item.effect.shieldBreak) {
          this.damageEnemyShield(item.effect.shieldBreak);
        }
      }
      if (typeof window !== "undefined" && window.soundSystem) {
        window.soundSystem.sfx(item.effect.dmg ? "burst" : "heal");
      }
      this.combat.log.push(`[使用道具] 你使用了【${item.name}】：${msgParts.join("、")}！`);
      if (this.combat.enemyHp <= 0) {
        this.winCombat();
        return { ok: true, msg: msgParts.join("、"), combatEnded: true };
      }
    } else {
      if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("heal");
      this.log(`[使用道具] 【${item.name}】：${msgParts.join("、")}`, "success");
    }

    return { ok: true, msg: msgParts.join("、") };
  }

  equipItem(itemId) {
    const item = this.data.items[itemId];
    if (!item || item.category !== "equipment") return false;
    if ((this.state.inventory[itemId] || 0) <= 0) return false;

    const slot = item.slot;
    const currentEquipped = this.state.equipment[slot];
    if (currentEquipped) {
      this.addItem(currentEquipped, 1);
    }
    this.state.inventory[itemId]--;
    if (this.state.inventory[itemId] <= 0) delete this.state.inventory[itemId];

    this.state.equipment[slot] = itemId;
    this.recalcStats(false);
    if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("click");
    this.log(`[穿戴裝備] 已裝備【${item.name}】！`, "success");
    return true;
  }

  // 裝備部位強化系統 (+1 ~ +5)
  getUpgradeCost(slot) {
    if (!this.state.equipUpgrades) this.state.equipUpgrades = { weapon: 0, armor: 0, relic: 0 };
    const curLv = this.state.equipUpgrades[slot] || 0;
    if (curLv >= 5) return null;
    const nextLv = curLv + 1;
    const ingredients = { star_shard: nextLv };
    if (nextLv >= 4) {
      ingredients.meteor_iron = nextLv - 3;
    }
    return {
      currentLevel: curLv,
      nextLevel: nextLv,
      costGold: 45 * nextLv,
      ingredients
    };
  }

  upgradeEquipmentSlot(slot) {
    const cost = this.getUpgradeCost(slot);
    if (!cost) return { ok: false, msg: "該部位已強化至最高等級 (+5)！" };
    if (this.state.gold < cost.costGold) {
      return { ok: false, msg: `金幣不足（需要 ${cost.costGold} G）！` };
    }
    for (const [ingId, reqCnt] of Object.entries(cost.ingredients)) {
      if ((this.state.inventory[ingId] || 0) < reqCnt) {
        const itName = this.data.items[ingId] ? this.data.items[ingId].name : ingId;
        return { ok: false, msg: `強化素材【${itName}】不足（需要 ${reqCnt} 個）！` };
      }
    }

    this.state.gold -= cost.costGold;
    for (const [ingId, reqCnt] of Object.entries(cost.ingredients)) {
      this.state.inventory[ingId] -= reqCnt;
      if (this.state.inventory[ingId] <= 0) delete this.state.inventory[ingId];
    }

    this.state.equipUpgrades[slot] = cost.nextLevel;
    this.state.stats.itemsCrafted++;
    this.recalcStats(false);
    this.checkMilestoneAchievements();
    if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("levelup");
    const slotNames = { weapon: "武器部位", armor: "防具部位", relic: "聖物部位" };
    this.log(`[裝備強化] 【${slotNames[slot] || slot}】成功淬煉升階至 +${cost.nextLevel}（全屬性加成 +${cost.nextLevel * 15}%）！`, "achievement");
    return { ok: true, level: cost.nextLevel };
  }

  craftRecipe(recipeId) {
    const recipe = this.data.recipes.find(r => r.id === recipeId);
    if (!recipe) return { ok: false, msg: "找不到配方" };
    if (this.state.gold < recipe.costGold) {
      return { ok: false, msg: "金幣不足！" };
    }
    for (const [ingId, reqCnt] of Object.entries(recipe.ingredients)) {
      if ((this.state.inventory[ingId] || 0) < reqCnt) {
        return { ok: false, msg: `素材【${this.data.items[ingId].name}】不足！` };
      }
    }

    this.state.gold -= recipe.costGold;
    for (const [ingId, reqCnt] of Object.entries(recipe.ingredients)) {
      this.state.inventory[ingId] -= reqCnt;
      if (this.state.inventory[ingId] <= 0) delete this.state.inventory[ingId];
    }

    this.addItem(recipe.result, recipe.count);
    this.state.stats.itemsCrafted++;
    const resItem = this.data.items[recipe.result];
    if (recipe.result === "astral_sovereign") {
      this.unlockAchievement("ach_legendary_weapon");
    }
    this.checkMilestoneAchievements();
    if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("puzzle");
    this.log(`[鍛造成功] 獲得【${resItem.name}】x${recipe.count}。`, "success");
    return { ok: true, item: resItem };
  }

  unlockSkill(skillId) {
    const sk = this.data.skills[skillId];
    if (!sk || this.state.unlockedSkills.includes(skillId)) return false;
    if (this.state.skillPoints < sk.costSP) return false;
    this.state.skillPoints -= sk.costSP;
    this.state.unlockedSkills.push(skillId);
    if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("levelup");
    this.log(`[領悟戰技] 習得新技能：【${sk.name}】！`, "success");
    return true;
  }

  upgradeTalent(talentId) {
    const tal = this.data.talents[talentId];
    if (!tal) return false;
    const curRank = this.state.talents[talentId] || 0;
    if (curRank >= tal.maxRank || this.state.skillPoints < 1) return false;
    this.state.skillPoints -= 1;
    this.state.talents[talentId] = curRank + 1;
    this.recalcStats(false);
    this.updateFogOfWar();
    if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("levelup");
    this.log(`[天賦強化] 【${tal.name}】提升至 Lv.${curRank + 1}！`, "success");
    return true;
  }

  // 主線世界觀手札數量（不含故事支線手札），用於成就與隱藏結局條件
  getWorldLoreCount() {
    return this.state.loreUnlocked.filter(id => /^lore_/.test(id)).length;
  }

  getAvailableEndings() {
    const list = ["liberation", "guardian"];
    if (this.state.loreUnlocked.length >= 6) {
      list.push("symbiosis");
    }
    const hasSovereign =
      this.state.equipment.weapon === "astral_sovereign" ||
      (this.state.inventory["astral_sovereign"] || 0) > 0;
    if (hasSovereign || this.getWorldLoreCount() >= 10) {
      list.push("voyager");
    }
    return list;
  }

  serialize() {
    const Save = (typeof window !== "undefined" && window.StarfallSave) || require("./save_migrations.js").StarfallSave;
    this.state.saveVer = Save.CURRENT;
    return JSON.stringify({
      version: "3.0.0",
      savedAt: new Date().toLocaleString(),
      state: this.state,
      abyssSnapshot: this.state.inAbyss
        ? { activeMap: this.activeMap, activeEvents: this.activeEvents, activeLabels: this.activeLabels }
        : null
    });
  }

  deserialize(jsonStr) {
    const parsed = typeof jsonStr === "string" ? JSON.parse(jsonStr) : jsonStr;
    if (!parsed || !parsed.state) throw new Error("無效的存檔格式");
    const Save0 = (typeof window !== "undefined" && window.StarfallSave) || require("./save_migrations.js").StarfallSave;
    if ((parsed.state.saveVer || 0) > Save0.CURRENT) throw new Error(`存檔版本 ${parsed.state.saveVer} 比遊戲支援的 ${Save0.CURRENT} 新，請更新遊戲後再讀取`);
    this.state = parsed.state;
    const Save = (typeof window !== "undefined" && window.StarfallSave) || require("./save_migrations.js").StarfallSave;
    Save.migrateState(this.state, this);

    if (this.state.inAbyss) {
      if (parsed.abyssSnapshot && parsed.abyssSnapshot.activeMap) {
        this.activeMap = parsed.abyssSnapshot.activeMap;
        this.activeEvents = parsed.abyssSnapshot.activeEvents;
        this.activeLabels = parsed.abyssSnapshot.activeLabels || {};
        this.updateFogOfWar();
      } else {
        this.enterAbyss(this.state.abyssFloor || 1);
      }
    } else {
      this.loadChapter(this.state.chapter || 1, false, this.state.subZone || 1);
    }
    this.recalcStats(false);
    this.log("[讀取存檔] 進度讀取完成！", "success");
    return true;
  }

  saveGame(slot = 1) {
    if (typeof localStorage === "undefined") return false;
    const key = `starfall_save_slot_${slot}`;
    localStorage.setItem(key, this.serialize());
    return true;
  }

  loadGame(slot = 1) {
    if (typeof localStorage === "undefined") return false;
    const key = `starfall_save_slot_${slot}`;
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    return this.deserialize(raw);
  }

  getSaveSlotsInfo() {
    const slots = [0, 1, 2, 3];
    return slots.map(slot => {
      if (typeof localStorage === "undefined") return { slot, empty: true };
      const raw = localStorage.getItem(`starfall_save_slot_${slot}`);
      if (!raw) return { slot, empty: true };
      try {
        const data = JSON.parse(raw);
        const st = data.state;
        const chObj = this.data.chapters[st.chapter];
        const zName = chObj && chObj.zones && chObj.zones[st.subZone || 1] ? ` (${st.chapter}-${st.subZone || 1} ${chObj.zones[st.subZone || 1].name})` : "";
        const chName = st.inAbyss
          ? `無盡星淵 第 ${st.abyssFloor} 層`
          : chObj
          ? `${chObj.name}${zName}`
          : `第 ${st.chapter} 章`;
        return {
          slot,
          empty: false,
          savedAt: data.savedAt,
          level: st.level,
          chapterName: chName,
          gold: st.gold,
          loreCount: (st.loreUnlocked || []).length,
          playTime: st.playTimeSeconds || 0
        };
      } catch (e) {
        return { slot, empty: true };
      }
    });
  }
}

if (typeof window !== "undefined") {
  window.StarfallEngine = StarfallEngine;
}

// 以 mixin 掛上拆分出去的功能檔（瀏覽器由 index.html 先載入並掛到 window；Node 環境在此 require）
const ENGINE_MIXINS = [
  ["StarfallRT", "./combat_rt.js"],
  ["StarfallGuild", "./engine_guild.js"],
  ["StarfallStory", "./engine_story.js"],
  ["StarfallObjective", "./engine_objective.js"],
  ["StarfallMap", "./engine_map.js"],
  ["StarfallBattle", "./engine_battle.js"]
];
ENGINE_MIXINS.forEach(([name, file]) => {
  if (typeof module !== "undefined" && module.exports && typeof require === "function") require(file);
  if (typeof window !== "undefined" && window[name]) Object.assign(StarfallEngine.prototype, window[name]);
});

if (typeof module !== "undefined" && module.exports) {
  module.exports = { StarfallEngine };
}
