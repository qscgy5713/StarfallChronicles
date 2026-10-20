/**
 * 《星隕編年史：霧海遺城》 - 核心遊戲引擎與目標導引狀態機 (Game Engine v2.2 Commercial Edition)
 * 100% 零 Emoji、雙階段智慧避障尋路、機關解鎖自動開門、智能戰鬥出招與章節跳轉支援
 */

const RT_HP_MULT = 14;

class StarfallEngine {
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
    const msg = `[砥石研磨] 使用高速砥石打磨武器！斬味恢復至【100 紫斬 (1.38x 傷害)】並獲得 2 回合【剛刃研磨 (不掉斬味 & 暴擊+15%)】！`;
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

  findTileByEventId(eventId, fallbackX, fallbackY) {
    for (const [coord, ev] of Object.entries(this.activeEvents)) {
      if (ev && ev.id === eventId) {
        const [cx, cy] = coord.split(",").map(Number);
        if (this.activeMap[cy] && this.activeMap[cy][cx] !== ".") {
          return { x: cx, y: cy };
        }
      }
    }
    return { x: fallbackX, y: fallbackY };
  }

  // ==================== 多子區域明確步驟目標導引系統 ====================
  getCurrentObjective() {
    const s = this.state;
    const ch = s.chapter;
    const z = s.subZone || 1;

    if (s.inAbyss) {
      const bossFlag = `abyss_boss_${s.abyssFloor}`;
      if (!s.flags[bossFlag]) {
        return {
          x: 16,
          y: 10,
          step: `星淵第 ${s.abyssFloor} 層`,
          text: `當前目標：前往右下角 (16,10) 擊敗本層【深淵首領】！`,
          sub: "沿途可開啟寶箱或於左上角營火 (2,2) 恢復體力。"
        };
      }
      return {
        x: 18,
        y: 10,
        step: `星淵第 ${s.abyssFloor} 層`,
        text: `當前目標：前往右下角 (18,10) 踏入【星淵傳送陣】進入下一層！`,
        sub: "踏入傳送陣即可挑戰更深層的星淵裂隙。"
      };
    }

    if (ch === 1) {
      if (z === 1) {
        if (!s.keys["key_rusty_gate"]) {
          return {
            x: 4,
            y: 1,
            step: "區域 1-1",
            text: "主線目標：前往漁村北方 (4,1) 與【老村長・奧爾森】對話，領取守林人銅鑰！",
            sub: "支線提示：漁村南方的【草藥師・艾琳 (2,11)】正在徵集 3 株月光螢草。"
          };
        }
        if (this.activeMap[3] && this.activeMap[3][7] === "G") {
          return {
            x: 7,
            y: 3,
            step: "區域 1-1",
            text: "主線目標：前往村莊東側 (7,3) 使用銅鑰打開【村口防禦門】！",
            sub: "打開鐵門後即可進入外圍林道。"
          };
        }
        if (!s.flags["s1_west"]) {
          return {
            x: 1,
            y: 6,
            step: "區域 1-1",
            text: "主線目標：前往林道西側 (1,6) 點亮第一座【日升古碑 (I)】(0/3)",
            sub: "點亮全部三座古碑可解除東側的幽林封印門。"
          };
        }
        if (!s.flags["s1_south"]) {
          const s2X = this.activeMap[11] && this.activeMap[11][4] === "S" ? 4 : 5;
          return {
            x: s2X,
            y: 11,
            step: "區域 1-1",
            text: `主線目標：前往林道南側 (${s2X},11) 點亮第二座【月隱古碑 (II)】(1/3)`,
            sub: "南側寶箱 (3,12) 藏有防具【迷霧巡林皮甲】，別忘了探索拾取。"
          };
        }
        if (!s.flags["s1_east"]) {
          return {
            x: 16,
            y: 3,
            step: "區域 1-1",
            text: "主線目標：前往林道東北方 (16,3) 點亮第三座【北極星碑 (III)】(2/3)",
            sub: "注意：森林狼與古樹精皆懼怕【烈焰】與【星輝】屬性攻擊！"
          };
        }
        if (this.activeMap[7] && this.activeMap[7][11] === "G") {
          return {
            x: 11,
            y: 7,
            step: "區域 1-1",
            text: "主線目標：前往中央 (11,7) 穿過已解封的【幽林封印門】！",
            sub: "三座星碑已完成共鳴。"
          };
        }
        return {
          x: 18,
          y: 7,
          step: "區域 1-1",
          text: "主線目標：前往東側出口 (18,7) 進入【1-2：迷霧幽林深處】！",
          sub: "踏上 > 階梯即可切換至下一子區域。"
        };
      }
      if (z === 2) {
        if (!s.flags["ch1_z2_bridge"]) {
          return {
            x: 9,
            y: 3,
            step: "區域 1-2",
            text: "主線目標：前往北側林地 (9,3) 啟動【溪流木橋閥】放下跨越深澗的木橋！",
            sub: "支線提示：左上方的【獵人・雷恩 (3,2)】懸賞討伐東北方的【蝕影狼王 (15,3)】。"
          };
        }
        if (this.activeMap[11] && this.activeMap[11][8] === "G") {
          return {
            x: 8,
            y: 11,
            step: "區域 1-2",
            text: "主線目標：前往南側林道 (8,11) 穿過已解鎖的荊棘柵欄！",
            sub: "別忘了先在西南方 (4,11) 閱讀《星辰植物學筆記》記下符文密碼線索。"
          };
        }
        if (!s.loreUnlocked.includes("lore_3") && !s.flags["ch1_sanctum_unlocked"]) {
          return {
            x: 4,
            y: 11,
            step: "區域 1-2",
            text: "探索線索：前往西南方 (4,11) 閱讀《星辰植物學筆記》，獲取古樹聖所的密碼線索！",
            sub: "筆記中記載著三座星碑筆劃順序的關鍵數字。"
          };
        }
        return {
          x: 18,
          y: 11,
          step: "區域 1-2",
          text: "主線目標：前往東南出口 (18,11) 進入【1-3：古樹祭壇與腐化聖所】！",
          sub: "若尚未討伐東北方的【菁英：蝕影狼王 (15,3)】，可先擊敗牠換取狼王銀牙護符。"
        };
      }
      if (!s.flags["ch1_sanctum_unlocked"]) {
        return {
          x: 8,
          y: 3,
          step: "區域 1-3",
          text: "主線目標：前往左上方 (8,3) 解開【古樹符文鎖】開啟聖所內殿門！",
          sub: "密碼線索記載於 1-2 西南方的《星辰植物學筆記》中。"
        };
      }
      if (this.activeMap[7] && this.activeMap[7][11] === "G") {
        return {
          x: 11,
          y: 7,
          step: "區域 1-3",
          text: "主線目標：穿過中央 (11,7) 的【聖所內殿門】直面森林首領！",
          sub: "建議先在左上方營火 (2,2) 休息並於鐵砧 (4,2) 強化裝備。"
        };
      }
      if (!s.flags["ch1_boss_defeated"]) {
        return {
          x: 15,
          y: 7,
          step: "區域 1-3",
          text: "首領決戰：前往祭壇中央 (15,7) 擊敗【首領：荊棘巨獸・巴爾薩】！",
          sub: "弱點提示：荊棘巨獸懼怕【烈焰】與【星輝】屬性，命中弱點可額外削盾並增傷 25%！"
        };
      }
      return {
        x: 18,
        y: 7,
        step: "區域 1-3",
        text: "章節完成：前往東側 (18,7) 踏入【第二章傳送陣】前往沉沒鐘樓！",
        sub: "恭喜奪回森之星片與星輝羅盤！"
      };
    }

    if (ch === 2) {
      if (z === 1) {
        if (!s.flags["npc_reward_2_4,1"]) {
          return {
            x: 4,
            y: 1,
            step: "區域 2-1",
            text: "主線目標：與左上方的【鐘樓學者・薇薇安 (4,1)】對話了解水閥機關！",
            sub: "支線提示：左下方的【老鐘錶匠・霍華德 (2,11)】正在收集 3 枚精密古銅齒輪。"
          };
        }
        if (!s.flags["valve_west"]) {
          return {
            x: 1,
            y: 7,
            step: "區域 2-1",
            text: "主線目標：前往西側迴廊 (1,7) 扳動【西側排水閥】！",
            sub: "扳動後可開啟上方中央的前廳水閘門 (10,3)。"
          };
        }
        if (this.activeMap[3] && this.activeMap[3][10] === "G") {
          return {
            x: 10,
            y: 3,
            step: "區域 2-1",
            text: "主線目標：前往上方 (10,3) 穿過【前廳水閘門】！",
            sub: "穿過閘門後前往右上角啟動虹吸閥。"
          };
        }
        if (!s.flags["valve_east"]) {
          return {
            x: 17,
            y: 3,
            step: "區域 2-1",
            text: "主線目標：前往右上角 (17,3) 扳動【前廳虹吸閥】架起中央虹吸橋！",
            sub: "啟動後中央水域將浮現橋樑並解鎖底層出口。"
          };
        }
        if (this.activeMap[11] && this.activeMap[11][10] === "G") {
          return {
            x: 10,
            y: 11,
            step: "區域 2-1",
            text: "主線目標：前往下方 (10,11) 穿過底層水閘門！",
            sub: "準備前往 2-2 齒輪水閘迷宮。"
          };
        }
        return {
          x: 18,
          y: 11,
          step: "區域 2-1",
          text: "主線目標：前往東南出口 (18,11) 進入【2-2：齒輪水閘迷宮】！",
          sub: "踏上 > 階梯進入鐘樓中層。"
        };
      }
      if (z === 2) {
        if (this.activeMap[3] && this.activeMap[3][10] === "G") {
          return {
            x: 10,
            y: 3,
            step: "區域 2-2",
            text: "主線目標：前往上方 (10,3) 推開青銅格柵門！",
            sub: "支線提示：左上方的【工程師・諾亞 (4,1)】懸賞討伐東側水池的【深淵重甲巨蟹】。"
          };
        }
        if (!s.flags["ch2_z2_sluice"]) {
          return {
            x: 16,
            y: 2,
            step: "區域 2-2",
            text: "主線目標：前往右上方 (16,2) 啟動【深水洩洪總閥】排乾東側水池！",
            sub: "排乾水池後可挑戰深淵重甲巨蟹並解鎖南側通道。"
          };
        }
        if (this.activeMap[11] && this.activeMap[11][8] === "G") {
          return {
            x: 8,
            y: 11,
            step: "區域 2-2",
            text: "主線目標：前往下方 (8,11) 穿過通往時之聖堂的閘門！",
            sub: "重要：請務必先到左下角 (2,11) 拾取【鐘樓學徒日記】獲取時鐘密碼線索！"
          };
        }
        if (!s.loreUnlocked.includes("lore_5") && !s.flags["ch2_cipher_solved"]) {
          return {
            x: 2,
            y: 11,
            step: "區域 2-2",
            text: "關鍵線索：前往左下角 (2,11) 閱讀《失蹤學徒亞倫的遺言》，取得時鐘密碼線索！",
            sub: "日記中記載著時針、分針與秒針停駐的三位數刻度。"
          };
        }
        return {
          x: 18,
          y: 11,
          step: "區域 2-2",
          text: "主線目標：前往東南出口 (18,11) 進入【2-3：時之核心大聖堂】！",
          sub: "若尚未擊敗【菁英：深淵重甲巨蟹 (15,7)】，可擊敗牠向諾亞換取【深淵潮汐鱗甲】。"
        };
      }
      if (!s.flags["ch2_cipher_solved"]) {
        return {
          x: 8,
          y: 3,
          step: "區域 2-3",
          text: "主線目標：前往左上方 (8,3) 操作【時鐘密碼終端】解鎖核心大門！",
          sub: "密碼線索記載於 2-2 左下角的《失蹤學徒亞倫的遺言》中。"
        };
      }
      if (this.activeMap[7] && this.activeMap[7][11] === "G") {
        return {
          x: 11,
          y: 7,
          step: "區域 2-3",
          text: "主線目標：穿過中央 (11,7) 的【時之核心大門】！",
          sub: "建議先在左上方營火與鐵砧整備狀態。"
        };
      }
      if (!s.flags["ch2_boss_defeated"]) {
        return {
          x: 15,
          y: 7,
          step: "區域 2-3",
          text: "首領決戰：前往聖堂中央 (15,7) 擊敗【首領：時之守衛・克羅諾斯】！",
          sub: "弱點提示：克羅諾斯懼怕【星輝】與【烈焰】屬性攻擊！"
        };
      }
      return {
        x: 18,
        y: 7,
        step: "區域 2-3",
        text: "章節完成：前往東側 (18,7) 踏入【第三章傳送陣】前往熔岩鍛造廠！",
        sub: "恭喜奪回潮之星片與時之懷錶！"
      };
    }

    if (ch === 3) {
      if (z === 1) {
        if (!s.keys["dwarven_sigil"]) {
          return {
            x: 7,
            y: 1,
            step: "區域 3-1",
            text: "主線目標：與北側的【鐵匠宗師・托爾金 (7,1)】對話領取鍛造王火紋章！",
            sub: "支線提示：左下方的【鍛造學徒・巴頓 (2,11)】需要 3 塊星隕玄鐵。"
          };
        }
        if (this.activeMap[3] && this.activeMap[3][10] === "G") {
          return {
            x: 10,
            y: 3,
            step: "區域 3-1",
            text: "主線目標：前往上方 (10,3) 打開【矮人礦道門】！",
            sub: "出示鍛造王火紋章即可通過。"
          };
        }
        if (!s.flags["lava_east"]) {
          return {
            x: 17,
            y: 3,
            step: "區域 3-1",
            text: "主線目標：前往右上角 (17,3) 扳動【礦道排熱主閥】凝結黑曜石橋！",
            sub: "凝結成橋後即可跨越熔岩河前往南側出口。"
          };
        }
        if (this.activeMap[11] && this.activeMap[11][10] === "G") {
          return {
            x: 10,
            y: 11,
            step: "區域 3-1",
            text: "主線目標：前往下方 (10,11) 穿過通往萬爐大廳的閘門！",
            sub: "準備進入 3-2 萬爐熔岩大廳。"
          };
        }
        return {
          x: 18,
          y: 11,
          step: "區域 3-1",
          text: "主線目標：前往東南出口 (18,11) 進入【3-2：萬爐熔岩大廳】！",
          sub: "踏上 > 階梯深入鍛造廠核心。"
        };
      }
      if (z === 2) {
        if (this.activeMap[3] && this.activeMap[3][10] === "G") {
          return {
            x: 10,
            y: 3,
            step: "區域 3-2",
            text: "主線目標：前往上方 (10,3) 推開黑曜石隔熱門！",
            sub: "支線提示：左上方的【老礦工・格imli (4,1)】請求你擊敗東側的【熔核督軍・瓦爾坎】。"
          };
        }
        if (!s.flags["ch3_z2_sluice"]) {
          return {
            x: 16,
            y: 2,
            step: "區域 3-2",
            text: "主線目標：前往右上方 (16,2) 啟動【高爐冷卻總閥】！",
            sub: "啟動後可冷卻東側岩漿池並開啟南側王座通道。"
          };
        }
        if (this.activeMap[11] && this.activeMap[11][8] === "G") {
          return {
            x: 8,
            y: 11,
            step: "區域 3-2",
            text: "主線目標：前往下方 (8,11) 穿過南側高爐閘門！",
            sub: "重要：請先到左下角 (2,11) 閱讀《熔岩流向控制手冊》取得三聖物密碼線索！"
          };
        }
        if (!s.loreUnlocked.includes("lore_8") && !s.flags["ch3_riddle_solved"]) {
          return {
            x: 2,
            y: 11,
            step: "區域 3-2",
            text: "關鍵線索：前往左下角 (2,11) 閱讀《熔岩流向控制手冊》，取得矮人王座符文鎖密碼！",
            sub: "手冊中記載著矮人三聖物的排列順序。"
          };
        }
        return {
          x: 18,
          y: 11,
          step: "區域 3-2",
          text: "主線目標：前往東南出口 (18,11) 進入【3-3：鍛造王座與炎龍巢穴】！",
          sub: "擊敗【菁英：熔核督軍瓦爾坎 (15,7)】可向老礦工領取 3 塊星隕玄鐵鍛造神兵。"
        };
      }
      if (!s.flags["ch3_riddle_solved"]) {
        return {
          x: 8,
          y: 3,
          step: "區域 3-3",
          text: "主線目標：前往左上方 (8,3) 解開【矮人王座符文鎖】！",
          sub: "密碼線索記載於 3-2 左下角的《熔岩流向控制手冊》中。"
        };
      }
      if (this.activeMap[7] && this.activeMap[7][11] === "G") {
        return {
          x: 11,
          y: 7,
          step: "區域 3-3",
          text: "主線目標：穿過中央 (11,7) 的【巨龍王座門】！",
          sub: "右下角寶箱 (17,11) 藏有強力的【赤焰星隕巨劍】。"
        };
      }
      if (!s.flags["ch3_boss_defeated"]) {
        return {
          x: 15,
          y: 7,
          step: "區域 3-3",
          text: "首領決戰：前往王座中央 (15,7) 擊敗【首領：赤焰巨龍・伊格尼斯】！",
          sub: "弱點提示：赤焰巨龍懼怕【寒霜】與【虛空】屬性戰技！"
        };
      }
      return {
        x: 18,
        y: 7,
        step: "區域 3-3",
        text: "章節完成：前往東側 (18,7) 踏入【第四章傳送陣】前往浮空星象院！",
        sub: "你已奪回焰之星片！"
      };
    }

    if (ch === 4) {
      if (z === 1) {
        if (!s.keys["astral_lens"]) {
          return {
            x: 3,
            y: 3,
            step: "區域 4-1",
            text: "主線目標：與左側的【觀星師梅林 (3,3)】對話領取觀星稜鏡！",
            sub: "支線提示：左下方的【星魂書記官・賽琳 (2,11)】委託你收集滿 9 篇星辰手札。"
          };
        }
        if (this.activeMap[3] && this.activeMap[3][10] === "G") {
          return {
            x: 10,
            y: 3,
            step: "區域 4-1",
            text: "主線目標：前往上方 (10,3) 打開【光學結界門】！",
            sub: "使用觀星稜鏡折射星光解除結界。"
          };
        }
        if (!s.flags["astrolabe_east"]) {
          return {
            x: 17,
            y: 3,
            step: "區域 4-1",
            text: "主線目標：前往右上角 (17,3) 啟動【北極天樞星盤】架起銀河星橋！",
            sub: "啟動後中央虛空將浮現星光橋樑。"
          };
        }
        if (this.activeMap[11] && this.activeMap[11][10] === "G") {
          return {
            x: 10,
            y: 11,
            step: "區域 4-1",
            text: "主線目標：前往下方 (10,11) 穿過內院星門！",
            sub: "重要：穿過前請先閱讀左下角 (4,11) 的《星象院最高機密檔案》取得認證編號。"
          };
        }
        if (!s.loreUnlocked.includes("lore_10") && !s.flags["ch4_cipher_solved"]) {
          return {
            x: 4,
            y: 11,
            step: "區域 4-1",
            text: "關鍵線索：前往左下方 (4,11) 閱讀《星象院最高機密檔案》，取得報告編號線索！",
            sub: "檔案中記載了『永晝計畫』的兩位數報告編號。"
          };
        }
        return {
          x: 18,
          y: 11,
          step: "區域 4-1",
          text: "主線目標：前往東南出口 (18,11) 進入【4-2：折光天球儀室】！",
          sub: "踏上 > 階梯前往星象院中樞。"
        };
      }
      if (z === 2) {
        if (this.activeMap[3] && this.activeMap[3][10] === "G") {
          return {
            x: 10,
            y: 3,
            step: "區域 4-2",
            text: "主線目標：前往上方 (10,3) 穿過星紋折光門！",
            sub: "支線提示：左上方的【觀星學徒・露娜 (4,1)】請求你擊敗東側的【虛空雙子審判官】。"
          };
        }
        if (!s.flags["ch4_z2_prism"]) {
          return {
            x: 16,
            y: 2,
            step: "區域 4-2",
            text: "主線目標：前往右上方 (16,2) 啟動【天球主折光鏡】！",
            sub: "啟動後可架起東側星橋並解鎖通往審判穹頂的大門。"
          };
        }
        if (this.activeMap[11] && this.activeMap[11][8] === "G") {
          return {
            x: 8,
            y: 11,
            step: "區域 4-2",
            text: "主線目標：前往下方 (8,11) 穿過星界結界門！",
            sub: "準備前往 4-3 觀星審判穹頂。"
          };
        }
        return {
          x: 18,
          y: 11,
          step: "區域 4-2",
          text: "主線目標：前往東南出口 (18,11) 進入【4-3：觀星審判穹頂】！",
          sub: "擊敗【菁英：虛空雙子審判官 (15,7)】可向露娜換取【星穹共鳴指環】。"
        };
      }
      if (!s.flags["ch4_cipher_solved"]) {
        return {
          x: 8,
          y: 3,
          step: "區域 4-3",
          text: "主線目標：前往左上方 (8,3) 完成【天球儀認證終端】！",
          sub: "報告編號線索記載於 4-1 左下方的《星象院最高機密檔案》中。"
        };
      }
      if (this.activeMap[7] && this.activeMap[7][11] === "G") {
        return {
          x: 11,
          y: 7,
          step: "區域 4-3",
          text: "主線目標：穿過中央 (11,7) 的【審判聖殿門】！",
          sub: "右下角寶箱 (17,11) 藏有傳說防具【星織天衣】。"
        };
      }
      if (!s.flags["ch4_boss_defeated"]) {
        return {
          x: 15,
          y: 7,
          step: "區域 4-3",
          text: "首領決戰：前往穹頂中央 (15,7) 擊敗【首領：虛空星使・阿斯特拉】！",
          sub: "弱點提示：阿斯特拉懼怕【虛空】與【物理】屬性戰技！"
        };
      }
      return {
        x: 18,
        y: 7,
        step: "區域 4-3",
        text: "章節完成：前往東側 (18,7) 踏入【第五章傳送陣】前往星核聖殿！",
        sub: "四枚星核碎片已全數集齊！"
      };
    }

    // 第五章
    if (z === 1) {
      if (!s.flags["npc_reward_5_3,3"] && !s.flags["npc_reward_5_1_3,3"]) {
        return {
          x: 3,
          y: 3,
          step: "區域 5-1",
          text: "主線目標：與左側的【星核意志・艾歐拉 (3,3)】對話解開王城內環封印！",
          sub: "支線提示：左下方的【近衛英靈・凱恩 (2,11)】請你點亮外環兩座淨化星碑。"
        };
      }
      if (!s.loreUnlocked.includes("lore_14") && !s.flags["ch5_throne_unlocked"]) {
        return {
          x: 3,
          y: 6,
          step: "區域 5-1",
          text: "關鍵線索：前往左側 (3,6) 閱讀《噬星者莫比烏斯的誕生》，記下王座終極封印碼！",
          sub: "手札中記載了開啟 5-3 最終王座大門的三位數封印碼。"
        };
      }
      if (this.activeMap[3] && this.activeMap[3][10] === "G") {
        return {
          x: 10,
          y: 3,
          step: "區域 5-1",
          text: "主線目標：前往上方 (10,3) 打開【王城內環門】！",
          sub: "艾歐拉的祝福已為你解除內環門鎖定。"
        };
      }
      if (!s.flags["sanctum_altar_2"]) {
        return {
          x: 17,
          y: 3,
          step: "區域 5-1",
          text: "主線目標：前往右上角 (17,3) 啟動【東側淨化星碑 (II)】架起創世星橋！",
          sub: "若同時點亮西側淨化星碑 (3,7)，還可向凱恩領取支線獎勵！"
        };
      }
      if (this.activeMap[11] && this.activeMap[11][10] === "G") {
        return {
          x: 10,
          y: 11,
          step: "區域 5-1",
          text: "主線目標：前往下方 (10,11) 穿過內環通道門！",
          sub: "準備進入 5-2 四象星核迴廊。"
        };
      }
      return {
        x: 18,
        y: 11,
        step: "區域 5-1",
        text: "主線目標：前往東南出口 (18,11) 進入【5-2：四象星核迴廊】！",
        sub: "踏上 > 階梯邁向王座迴廊。"
      };
    }
    if (z === 2) {
      if (this.activeMap[3] && this.activeMap[3][10] === "G") {
        return {
          x: 10,
          y: 3,
          step: "區域 5-2",
          text: "主線目標：前往上方 (10,3) 推開皇家禁衛迴廊大門！",
          sub: "支線提示：左上方的【近衛英靈・凱恩 (4,1)】請求你賜予【黑曜禁衛統領・雷吉斯】榮耀的安息。"
        };
      }
      if (!s.flags["ch5_z2_bridge"]) {
        return {
          x: 16,
          y: 2,
          step: "區域 5-2",
          text: "主線目標：前往右上方 (16,2) 啟動【皇家星樞開關】！",
          sub: "啟動後可架起東側星橋並解鎖通往永恆星核王座的大門。"
        };
      }
      if (this.activeMap[11] && this.activeMap[11][8] === "G") {
        return {
          x: 8,
          y: 11,
          step: "區域 5-2",
          text: "主線目標：前往下方 (8,11) 穿過通往王座廳的結界門！",
          sub: "擊敗【菁英：黑曜禁衛統領雷吉斯 (15,7)】可向凱恩領取傳說聖物【星核之眸】！"
        };
      }
      return {
        x: 18,
        y: 11,
        step: "區域 5-2",
        text: "主線目標：前往東南出口 (18,11) 進入【5-3：永恆星核王座】！",
        sub: "做好萬全準備，即將迎戰最終首領！"
      };
    }
    if (!s.flags["ch5_throne_unlocked"]) {
      return {
        x: 8,
        y: 3,
        step: "區域 5-3",
        text: "主線目標：前往左上方 (8,3) 解開【王座封印終端】！",
        sub: "封印碼線索記載於 5-1 左側的《噬星者莫比烏斯的誕生》手札中。"
      };
    }
    if (this.activeMap[7] && this.activeMap[7][11] === "G") {
      return {
        x: 11,
        y: 7,
        step: "區域 5-3",
        text: "主線目標：穿過中央 (11,7) 的【星核王座大門】！",
        sub: "最終首領就在門後，建議先在營火 (2,2) 與鐵砧 (4,2) 將裝備強化至最高等級！"
      };
    }
    return {
      x: 15,
      y: 7,
      step: "最終決戰",
      text: "最終決戰：前往王座中央 (15,7) 擊敗【最終首領：噬星者・莫比烏斯】，決定阿卡迪亞的命運！",
      sub: "擊敗莫比烏斯後即可選擇多重結局！"
    };
  }

  // 雙階段智慧避障尋路：優先繞過非目標的怪物/鐵砧/NPC，若窄道被怪物擋住則自動走向該怪物開戰
  findGuidePath(targetX, targetY) {
    const startX = this.state.x;
    const startY = this.state.y;
    if (startX === targetX && startY === targetY) return [];
    const rows = this.activeMap.length;
    const cols = this.activeMap[0].length;
    if (targetY < 0 || targetY >= rows || targetX < 0 || targetX >= cols) return [];

    const runBFS = allowObstacles => {
      const queue = [[startX, startY, []]];
      const visited = new Set([`${startX},${startY}`]);
      const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];

      while (queue.length > 0) {
        const [cx, cy, path] = queue.shift();
        for (const [dx, dy] of dirs) {
          const nx = cx + dx;
          const ny = cy + dy;
          const key = `${nx},${ny}`;
          if (nx < 0 || ny < 0 || ny >= rows || nx >= cols || visited.has(key)) continue;

          const tile = this.activeMap[ny][nx];
          if (nx === targetX && ny === targetY && tile !== "#" && tile !== "~") {
            return [...path, [dx, dy, nx, ny]];
          }
          if (
            tile === "#" ||
            tile === "~" ||
            tile === "G" ||
            tile === "W" ||
            tile === "N" ||
            tile === "R" ||
            tile === "P" ||
            tile === ">" ||
            tile === "<"
          ) {
            continue;
          }
          if (!allowObstacles && (tile === "E" || tile === "B" || tile === "A" || tile === "?" || tile === "L" || tile === "T" || tile === "D" || tile === "V" || tile === "O" || tile === "U")) {
            continue;
          }

          visited.add(key);
          queue.push([nx, ny, [...path, [dx, dy, nx, ny]]]);
        }
      }
      return [];
    };

    const cleanPath = runBFS(false);
    if (cleanPath.length > 0) return cleanPath;
    return runBFS(true);
  }

  findPath(targetX, targetY) {
    return this.findGuidePath(targetX, targetY).map(([dx, dy]) => [dx, dy]);
  }

  resolveEventAt(x, y, tile) {
    const coord = `${x},${y}`;
    if (this.activeEvents[coord]) return this.activeEvents[coord];

    if (tile === "S") {
      for (const [k, ev] of Object.entries(this.activeEvents)) {
        const [ex, ey] = k.split(",").map(Number);
        if (ev.type === "switch" && Math.abs(ex - x) <= 2 && ey === y) {
          this.activeEvents[coord] = ev;
          return ev;
        }
      }
    }
    if (tile === "E") {
      for (const [k, ev] of Object.entries(this.activeEvents)) {
        const [ex, ey] = k.split(",").map(Number);
        if (ev.type === "enemy" && Math.abs(ex - x) <= 2 && ey === y) {
          this.activeEvents[coord] = ev;
          return ev;
        }
      }
      const defaultEnemies = { 1: "mist_wolf", 2: "drowned_sentinel", 3: "magma_golem", 4: "astral_wraith", 5: "citadel_templar" };
      const fallbackEv = {
        type: "enemy",
        id: `fallback_e_${x}_${y}`,
        enemyId: defaultEnemies[this.state.chapter] || "mist_wolf"
      };
      this.activeEvents[coord] = fallbackEv;
      return fallbackEv;
    }
    if (tile === "W") {
      const wEv = { type: "secret_wall", id: `sec_wall_${x}_${y}`, name: "古代裂隙秘牆" };
      this.activeEvents[coord] = wEv;
      return wEv;
    }
    if (tile === "T") {
      const tEv = { type: "trap", id: `trap_${x}_${y}`, name: "星蝕地脈陷阱" };
      this.activeEvents[coord] = tEv;
      return tEv;
    }
    if (tile === "D") {
      const dEv = { type: "fountain", id: `fountain_${x}_${y}`, name: "星泉祝福池" };
      this.activeEvents[coord] = dEv;
      return dEv;
    }
    if (tile === "V") {
      const vEv = { type: "trial_obelisk", id: `trial_${x}_${y}`, name: "星界試煉碑" };
      this.activeEvents[coord] = vEv;
      return vEv;
    }
    if (tile === "O") {
      const oEv = {
        type: "warp_pad",
        id: `warp_${x}_${y}`,
        name: "星軌躍遷陣",
        targetX: x < 26 ? 36 : 19,
        targetY: x < 26 ? 24 : 5
      };
      this.activeEvents[coord] = oEv;
      return oEv;
    }
    if (tile === "U") {
      const uEv = { type: "ancient_reliquary", id: `relic_${x}_${y}`, name: "遠古星魂聖棺" };
      this.activeEvents[coord] = uEv;
      return uEv;
    }
    return null;
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
    if (this.state.loreUnlocked.length >= 15) this.unlockAchievement("ach_loremaster");
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

  autoOpenUnlockedGates() {
    Object.entries(this.activeEvents).forEach(([coord, ev]) => {
      if (ev && ev.type === "gate" && ev.reqFlag && this.state.flags[ev.reqFlag]) {
        const [gx, gy] = coord.split(",").map(Number);
        if (this.activeMap[gy] && this.activeMap[gy][gx] === "G") {
          this.activeMap[gy][gx] = ".";
          this.markEventCompleted(coord);
        }
      }
    });
  }

  jumpToChapter(chapterNum, subZone = 1) {
    const targetLv = Math.max(this.state.level, (chapterNum - 1) * 2 + 1);
    while (this.state.level < targetLv) {
      this.state.level++;
      this.state.skillPoints++;
    }
    this.loadChapter(chapterNum, true, subZone);
    this.recalcStats(true);
    this.saveGame(0);
    if (typeof window !== "undefined" && window.gameUI) {
      window.gameUI.showToast(`已切換至第 ${chapterNum} 章！`, "gold");
      window.gameUI.renderAll();
    }
  }

  loadChapter(chapterNum, resetPos = true, subZone = 1) {
    this.state.inAbyss = false;
    this.state.chapter = chapterNum;
    const ch = this.data.chapters[chapterNum];
    if (!ch) return;

    if (this.data.companions) {
      Object.values(this.data.companions).forEach(comp => {
        if (chapterNum >= comp.unlockChapter && !this.state.unlockedCompanions.includes(comp.id)) {
          this.state.unlockedCompanions.push(comp.id);
          this.log(`[新夥伴加入] 星靈夥伴【${comp.name}】加入了你的隊伍！`, "achievement");
        }
      });
    }

    const targetZ = resetPos ? subZone : (this.state.subZone || 1);
    this.loadZone(targetZ, resetPos ? null : this.state.x, resetPos ? null : this.state.y, true);
    if (typeof window !== "undefined" && window.soundSystem) {
      window.soundSystem.startBGM("explore", chapterNum);
    }
  }

  // 將 20x14 基礎子區域擴建為 40x28 巨型多翼迷宮 (包含東翼秘境、極東星界聖殿、南翼深淵遺跡、極淵地下墓穴，以及 W/T/D/V/O/U 六大互動地標)
  expandZoneToLargeMap(chapterNum, subZone) {
    const targetCols = 40;
    const targetRows = 28;
    if (this.activeMap.length >= targetRows && this.activeMap[0].length >= targetCols) return;

    const chEnemies = {
      1: ["mist_wolf", "corrupted_treant"],
      2: ["drowned_sentinel", "tide_siren"],
      3: ["magma_golem", "ash_drake"],
      4: ["astral_wraith", "star_inquisitor"],
      5: ["citadel_templar", "astral_wraith"]
    };
    const chMats = {
      1: "moon_herb",
      2: "ancient_gear",
      3: "meteor_iron",
      4: "void_essence",
      5: "void_essence"
    };
    const enemyPair = chEnemies[chapterNum] || chEnemies[1];
    const matId = chMats[chapterNum] || "star_shard";

    // 1. 擴展原有的 0..13 列至寬度 40（x = 20..30 為東翼秘境迴廊，x = 31..39 為極東星界聖殿）
    for (let y = 0; y < 14; y++) {
      while (this.activeMap[y].length < targetCols) {
        const x = this.activeMap[y].length;
        if (y === 0 || x === targetCols - 1) {
          this.activeMap[y].push("#");
        } else if (x === 31) {
          this.activeMap[y].push(y === 3 || y === 11 ? "." : "#");
        } else if (y === 6) {
          this.activeMap[y].push(x === 22 || x === 35 ? "." : "#");
        } else if (y === 13) {
          this.activeMap[y].push(x === 22 || x === 35 ? "." : "#");
        } else if (y >= 7 && y <= 12 && x === 24) {
          this.activeMap[y].push("#");
        } else {
          this.activeMap[y].push(".");
        }
      }
    }

    // 2. 新增 y = 14..21 南翼深淵遺跡 (寬度 40)
    for (let y = 14; y < 22; y++) {
      const row = [];
      for (let x = 0; x < targetCols; x++) {
        if (x === 0 || x === targetCols - 1) {
          row.push("#");
        } else if (y === 21) {
          row.push(x === 6 || x === 16 || x === 25 || x === 35 ? "." : "#");
        } else if (x === 10 || x === 20 || x === 31) {
          row.push(y === 17 ? "." : "#");
        } else if (x === 26) {
          row.push("#");
        } else {
          row.push(".");
        }
      }
      this.activeMap.push(row);
    }

    // 3. 新增 y = 22..27 極淵地下墓穴 (寬度 40)
    for (let y = 22; y < targetRows; y++) {
      const row = [];
      for (let x = 0; x < targetCols; x++) {
        if (y === targetRows - 1 || x === 0 || x === targetCols - 1) {
          row.push("#");
        } else if (x === 12 || x === 22 || x === 31) {
          row.push(y === 24 ? "." : "#");
        } else {
          row.push(".");
        }
      }
      this.activeMap.push(row);
    }

    // 4. 打通主幹區 (0..19 x 0..13) 通往東翼與南翼的連接走廊（不覆蓋任何既有特殊圖塊）
    const carveFloor = (cx, cy) => {
      if (this.activeMap[cy] && (this.activeMap[cy][cx] === "#" || this.activeMap[cy][cx] === "~")) {
        this.activeMap[cy][cx] = ".";
      }
    };
    [2, 10].forEach(ry => {
      carveFloor(17, ry);
      carveFloor(18, ry);
      carveFloor(19, ry);
      carveFloor(20, ry);
    });
    [5, 15].forEach(rx => {
      carveFloor(rx, 11);
      carveFloor(rx, 12);
      carveFloor(rx, 13);
      carveFloor(rx, 14);
    });

    // 5. 在東翼、極東聖殿、南翼與極淵墓穴配置豐富的探索地標、躍遷陣 O、遠古聖棺 U、秘牆 W、陷阱 T、寶箱與巡邏魔物
    const addWingObj = (ox, oy, tileChar, evObj, labelText) => {
      const coord = `${ox},${oy}`;
      if (!this.activeMap[oy]) return;
      this.activeMap[oy][ox] = tileChar;
      this.activeEvents[coord] = evObj;
      if (labelText) {
        this.activeLabels[coord] = labelText;
      }
    };

    // 成對雙向【星軌躍遷陣 O】：東翼入口 (21,3) <-> 極淵墓穴深處 (36,24)
    addWingObj(
      21,
      3,
      "O",
      {
        type: "warp_pad",
        id: `warp_a_ch${chapterNum}_z${subZone}`,
        name: "星軌躍遷陣・北樞",
        targetX: 36,
        targetY: 24
      },
      "躍遷陣[至極淵]"
    );
    addWingObj(
      36,
      24,
      "O",
      {
        type: "warp_pad",
        id: `warp_b_ch${chapterNum}_z${subZone}`,
        name: "星軌躍遷陣・極淵",
        targetX: 21,
        targetY: 3
      },
      "躍遷陣[返北樞]"
    );

    // 東翼上層：星泉祝福池 D、採集點 M、巡邏魔物 E
    addWingObj(
      25,
      3,
      "D",
      {
        type: "fountain",
        id: `fnt_ch${chapterNum}_z${subZone}`,
        name: "星泉祝福池"
      },
      "星泉祝福池"
    );
    addWingObj(29, 2, "M", {
      type: "gather",
      id: `wing_m1_ch${chapterNum}_z${subZone}`,
      item: matId,
      count: 2
    });
    addWingObj(23, 4, "E", {
      type: "enemy",
      id: `wing_e1_ch${chapterNum}_z${subZone}`,
      enemyId: enemyPair[0],
      patrol: true
    });

    // 東翼隱藏秘寶室：裂隙秘牆 W (26,6)、地脈陷阱 T (26,9)、秘寶箱 C (29,9)
    addWingObj(
      26,
      6,
      "W",
      {
        type: "secret_wall",
        id: `sec_e_ch${chapterNum}_z${subZone}`,
        name: "東翼裂隙秘牆"
      },
      "裂隙秘牆[Q破除]"
    );
    addWingObj(26, 9, "T", {
      type: "trap",
      id: `trap_e_ch${chapterNum}_z${subZone}`,
      name: "星蝕地脈陷阱"
    });
    addWingObj(
      29,
      9,
      "C",
      {
        type: "chest",
        id: `wing_c_east_ch${chapterNum}_z${subZone}`,
        reward: {
          gold: 55 + chapterNum * 25,
          items: { star_shard: 2, [matId]: 2, greater_potion: 1 }
        }
      },
      "東翼秘寶箱"
    );

    // 極東星界聖殿 (x = 32..38)：遠古星魂聖棺 U (36,4)、裂隙秘牆 W (31,8)、極東秘寶箱 C (36,9)、巡邏魔物 E (34,18)、採集點 M (35,16)
    addWingObj(
      36,
      4,
      "U",
      {
        type: "ancient_reliquary",
        id: `relic_fe_ch${chapterNum}_z${subZone}`,
        name: "極東遠古星魂聖棺"
      },
      "遠古星魂聖棺"
    );
    addWingObj(
      31,
      8,
      "W",
      {
        type: "secret_wall",
        id: `sec_fe_ch${chapterNum}_z${subZone}`,
        name: "聖殿裂隙秘牆"
      },
      "聖殿秘牆[Q]"
    );
    addWingObj(
      36,
      9,
      "C",
      {
        type: "chest",
        id: `wing_c_fe_ch${chapterNum}_z${subZone}`,
        reward: {
          gold: 65 + chapterNum * 25,
          items: { star_shard: 2, mana_elixir: 2 }
        }
      },
      "聖殿秘寶箱"
    );
    addWingObj(35, 16, "M", {
      type: "gather",
      id: `wing_m3_ch${chapterNum}_z${subZone}`,
      item: matId,
      count: 2
    });
    addWingObj(34, 18, "E", {
      type: "enemy",
      id: `wing_e4_ch${chapterNum}_z${subZone}`,
      enemyId: enemyPair[1],
      patrol: true
    });

    // 南翼西南廳：地脈陷阱 T (5,16)、秘寶箱 C (2,19)、巡邏魔物 E (8,17)
    addWingObj(5, 16, "T", {
      type: "trap",
      id: `trap_sw_ch${chapterNum}_z${subZone}`,
      name: "星蝕地脈陷阱"
    });
    addWingObj(2, 19, "C", {
      type: "chest",
      id: `wing_c_sw_ch${chapterNum}_z${subZone}`,
      reward: {
        gold: 45 + chapterNum * 20,
        items: { healing_potion: 2, mana_elixir: 1, star_shard: 1 }
      }
    });
    addWingObj(8, 17, "E", {
      type: "enemy",
      id: `wing_e2_ch${chapterNum}_z${subZone}`,
      enemyId: enemyPair[1],
      patrol: true
    });

    // 南翼中央試煉堂：星界試煉碑 V (15,18)、採集點 M (12,19)
    addWingObj(
      15,
      18,
      "V",
      {
        type: "trial_obelisk",
        id: `trial_ch${chapterNum}_z${subZone}`,
        name: "星界試煉碑"
      },
      "星界試煉碑"
    );
    addWingObj(12, 19, "M", {
      type: "gather",
      id: `wing_m2_ch${chapterNum}_z${subZone}`,
      item: "star_shard",
      count: 2
    });

    // 南翼東南秘庫：治療營火 F (23,19)、巡邏魔物 E (24,16)、裂隙秘牆 W (26,17)、深淵秘寶箱 C (29,18)
    this.activeMap[19][23] = "F";
    this.activeLabels["23,19"] = "南翼營火";
    addWingObj(24, 16, "E", {
      type: "enemy",
      id: `wing_e3_ch${chapterNum}_z${subZone}`,
      enemyId: enemyPair[(chapterNum + subZone) % 2],
      patrol: true
    });
    addWingObj(
      26,
      17,
      "W",
      {
        type: "secret_wall",
        id: `sec_se_ch${chapterNum}_z${subZone}`,
        name: "深淵秘庫裂隙牆"
      },
      "秘庫裂隙牆[Q]"
    );
    addWingObj(
      29,
      18,
      "C",
      {
        type: "chest",
        id: `wing_c_se_ch${chapterNum}_z${subZone}`,
        reward: {
          gold: 75 + chapterNum * 30,
          items: { phoenix_salve: 1, star_bomb: 1, [matId]: 2 }
        }
      },
      "深淵秘庫寶箱"
    );

    // 極淵地下墓穴 (y = 22..26)：遠古星魂聖棺 U (16,25)、墓穴寶箱 C (6,25) 與 (28,25)、陷阱 T (15,23)、採集點 M (20,24)、巡邏魔物 E (11,24)
    addWingObj(
      16,
      25,
      "U",
      {
        type: "ancient_reliquary",
        id: `relic_cat_ch${chapterNum}_z${subZone}`,
        name: "極淵遠古星魂聖棺"
      },
      "極淵星魂聖棺"
    );
    addWingObj(6, 25, "C", {
      type: "chest",
      id: `wing_c_cat1_ch${chapterNum}_z${subZone}`,
      reward: {
        gold: 60 + chapterNum * 22,
        items: { greater_potion: 1, star_shard: 2 }
      }
    });
    addWingObj(28, 25, "C", {
      type: "chest",
      id: `wing_c_cat2_ch${chapterNum}_z${subZone}`,
      reward: {
        gold: 70 + chapterNum * 25,
        items: { [matId]: 2, star_bomb: 1 }
      }
    });
    addWingObj(15, 23, "T", {
      type: "trap",
      id: `trap_cat_ch${chapterNum}_z${subZone}`,
      name: "星蝕地脈陷阱"
    });
    addWingObj(20, 24, "M", {
      type: "gather",
      id: `wing_m4_ch${chapterNum}_z${subZone}`,
      item: "star_shard",
      count: 2
    });
    addWingObj(11, 24, "E", {
      type: "enemy",
      id: `wing_e5_ch${chapterNum}_z${subZone}`,
      enemyId: enemyPair[0],
      patrol: true
    });
  }

  loadZone(subZone = 1, targetX = null, targetY = null, isChapterInit = false) {
    const chapterNum = this.state.chapter;
    const ch = this.data.chapters[chapterNum];
    if (!ch) return;
    const zObj = ch.zones && ch.zones[subZone] ? ch.zones[subZone] : ch;
    this.state.subZone = subZone;

    this.activeMap = zObj.map.map(row => row.split(""));
    this.activeEvents = JSON.parse(JSON.stringify(zObj.events));
    this.activeLabels = JSON.parse(JSON.stringify(zObj.labels || {}));

    // 擴建為 40x28 巨型多翼迷宮
    this.expandZoneToLargeMap(chapterNum, subZone);

    Object.keys(this.activeEvents).forEach(coord => {
      const ev = this.activeEvents[coord];
      const [cx, cy] = coord.split(",").map(Number);
      const evKeyZone = `ch${chapterNum}_z${subZone}_${coord}`;
      const evKeyLegacy = `ch${chapterNum}_${coord}`;

      if (this.state.completedEvents[evKeyZone] || (subZone === 1 && this.state.completedEvents[evKeyLegacy])) {
        if (["chest", "gather", "enemy", "boss", "gate", "mystery", "secret_wall", "trap", "fountain", "trial_obelisk", "ancient_reliquary"].includes(ev.type)) {
          if (this.activeMap[cy]) this.activeMap[cy][cx] = ".";
        }
      }
      if (ev.type === "switch" && ev.bridgeTiles && this.state.flags[ev.flag]) {
        ev.bridgeTiles.forEach(t => {
          if (this.activeMap[t.y]) this.activeMap[t.y][t.x] = "=";
        });
      }
    });

    this.autoOpenUnlockedGates();

    if (targetX !== null && targetY !== null) {
      this.state.x = targetX;
      this.state.y = targetY;
    } else {
      this.state.x = zObj.startPos.x;
      this.state.y = zObj.startPos.y;
    }

    if (!this.state.exploredByChapter[chapterNum]) {
      this.state.exploredByChapter[chapterNum] = {};
    }
    const zKey = `ch${chapterNum}_z${subZone}`;
    if (!this.state.exploredByChapter[zKey]) {
      this.state.exploredByChapter[zKey] = {};
    }
    this.updateFogOfWar();
    if (isChapterInit) {
      this.log(`[章節開始] 進入【${ch.name} — ${zObj.name || ""}】— ${zObj.ambientDesc || ch.ambientDesc}`, "chapter");
    } else {
      this.log(`[區域移動] 踏入【${chapterNum}-${subZone}：${zObj.name || ch.name}】— ${zObj.ambientDesc || ""}`, "chapter");
    }
  }

  enterAbyss(floor = 1) {
    this.state.inAbyss = true;
    this.state.abyssFloor = floor;
    if (floor > this.state.maxAbyssFloor) {
      this.state.maxAbyssFloor = floor;
    }
    if (floor >= 5) {
      this.unlockAchievement("ach_abyss_5");
    }

    const rows = 28;
    const cols = 40;
    const grid = [];
    for (let y = 0; y < rows; y++) {
      const row = [];
      for (let x = 0; x < cols; x++) {
        if (y === 0 || y === rows - 1 || x === 0 || x === cols - 1) {
          row.push("#");
        } else {
          row.push(".");
        }
      }
      grid.push(row);
    }

    for (let i = 0; i < 65; i++) {
      const rx = 3 + ((floor * 7 + i * 5) % (cols - 6));
      const ry = 2 + ((floor * 3 + i * 3) % (rows - 4));
      grid[ry][rx] = "#";
    }

    for (let x = 2; x <= 37; x++) {
      grid[6][x] = ".";
      grid[10][x] = ".";
      grid[16][x] = ".";
      grid[22][x] = ".";
    }
    for (let y = 2; y <= 25; y++) {
      grid[y][2] = ".";
      grid[y][10] = ".";
      grid[y][16] = ".";
      grid[y][24] = ".";
      grid[y][34] = ".";
    }

    grid[2][2] = "F";
    grid[2][3] = "A";
    grid[2][8] = "?";
    grid[4][24] = "D";
    grid[16][12] = "V";
    grid[14][20] = "T";
    grid[6][4] = "O";
    grid[22][34] = "O";
    grid[4][35] = "U";

    const events = {
      "8,2": {
        type: "mystery",
        id: `abyss_mys_${floor}`,
        encounterIndex: floor % this.data.mysteryEncounters.length
      },
      "24,4": {
        type: "fountain",
        id: `abyss_fnt_${floor}`,
        name: "深淵星泉池"
      },
      "12,16": {
        type: "trial_obelisk",
        id: `abyss_trial_${floor}`,
        name: "深淵試煉碑"
      },
      "20,14": {
        type: "trap",
        id: `abyss_trap_${floor}`,
        name: "星蝕地脈陷阱"
      },
      "4,6": {
        type: "warp_pad",
        id: `abyss_warp_a_${floor}`,
        name: "深淵星軌躍遷陣",
        targetX: 34,
        targetY: 22
      },
      "34,22": {
        type: "warp_pad",
        id: `abyss_warp_b_${floor}`,
        name: "深淵星軌躍遷陣",
        targetX: 4,
        targetY: 6
      },
      "35,4": {
        type: "ancient_reliquary",
        id: `abyss_relic_${floor}`,
        name: "深淵遠古星魂聖棺"
      }
    };

    const enemyPool = [
      "mist_wolf", "corrupted_treant", "drowned_sentinel", "tide_siren",
      "magma_golem", "ash_drake", "astral_wraith", "star_inquisitor", "citadel_templar"
    ];
    const bossPool = ["boss_thorn_behemoth", "boss_chronos", "boss_ignis", "boss_astra"];

    const enemyCoords = [[6, 4], [10, 3], [9, 9], [14, 5], [22, 8], [18, 16], [30, 12], [26, 22]];
    enemyCoords.forEach((pt, idx) => {
      const [ex, ey] = pt;
      grid[ey][ex] = "E";
      const pick = enemyPool[(floor + idx * 2) % enemyPool.length];
      events[`${ex},${ey}`] = {
        type: "enemy",
        id: `abyss_e_${floor}_${idx}`,
        enemyId: pick,
        patrol: idx >= 3,
        abyssScale: 1 + floor * 0.14
      };
    });

    [[5, 11], [15, 2], [27, 17], [36, 24]].forEach((pt, idx) => {
      const [cx, cy] = pt;
      grid[cy][cx] = "C";
      events[`${cx},${cy}`] = {
        type: "chest",
        id: `abyss_c_${floor}_${idx}`,
        reward: {
          gold: 60 + floor * 25,
          items: { greater_potion: 1, star_shard: 2, void_essence: 1 }
        }
      };
    });

    [[11, 11], [4, 2], [26, 6], [20, 22]].forEach((pt, idx) => {
      const [mx, my] = pt;
      grid[my][mx] = "M";
      const mats = ["moon_herb", "star_shard", "ancient_gear", "meteor_iron", "void_essence"];
      events[`${mx},${my}`] = {
        type: "gather",
        id: `abyss_m_${floor}_${idx}`,
        item: mats[(floor + idx) % mats.length],
        count: 2
      };
    });

    grid[10][16] = "B";
    const bossId = bossPool[(floor - 1) % bossPool.length];
    const bossFlag = `abyss_boss_${floor}`;
    delete this.state.flags[bossFlag];
    events["16,10"] = {
      type: "boss",
      id: `abyss_b_${floor}`,
      enemyId: bossId,
      abyssScale: 1 + floor * 0.16,
      intro: `【無盡星淵 第 ${floor} 層】深淵裂隙中浮現出強化的幻影首領！`,
      winFlag: bossFlag
    };

    grid[10][18] = "P";
    events["18,10"] = {
      type: "abyss_portal",
      reqFlag: bossFlag,
      lockedMsg: "必須先擊敗本層的【深淵首領 (16,10)】才能開啟前往下一層的裂隙！"
    };

    this.activeMap = grid;
    this.activeEvents = events;
    this.activeLabels = {
      "2,2": "治療營火",
      "3,2": "鍛造鐵砧",
      "8,2": "奇遇祭壇",
      "4,6": "星軌躍遷陣",
      "34,22": "星軌躍遷陣",
      "35,4": "遠古星魂聖棺",
      "24,4": "深淵星泉池",
      "12,16": "深淵試煉碑",
      "16,10": "深淵首領",
      "18,10": "下一層傳送陣"
    };
    this.state.x = 2;
    this.state.y = 6;
    this.state.exploredByChapter[`abyss_${floor}`] = {};
    this.updateFogOfWar();
    this.log(`[無盡星淵] 踏入【無盡星淵試煉：第 ${floor} 層 (40x28 巨型裂隙)】！`, "chapter");
  }

  getCurrentExploredMap() {
    if (this.state.inAbyss) {
      const aKey = `abyss_${this.state.abyssFloor}`;
      if (!this.state.exploredByChapter[aKey]) this.state.exploredByChapter[aKey] = {};
      return this.state.exploredByChapter[aKey];
    }
    const z = this.state.subZone || 1;
    const zKey = `ch${this.state.chapter}_z${z}`;
    if (!this.state.exploredByChapter[zKey]) {
      this.state.exploredByChapter[zKey] = {};
    }
    return this.state.exploredByChapter[zKey];
  }

  // 計算當前子區域探索完成率 (%)
  getZoneExplorationPercent() {
    if (!this.activeMap || !this.activeMap.length || !this.activeMap[0]) return 0;
    const total = this.activeMap.length * this.activeMap[0].length;
    const expMap = this.getCurrentExploredMap();
    const count = Object.keys(expMap).length;
    return Math.min(100, Math.round((count / total) * 100));
  }

  updateFogOfWar() {
    const comp = this.getComputedStats();
    const radius = comp.vision;
    const expMap = this.getCurrentExploredMap();
    const chLegacyMap = !this.state.inAbyss && (this.state.subZone || 1) === 1
      ? (this.state.exploredByChapter[this.state.chapter] || (this.state.exploredByChapter[this.state.chapter] = {}))
      : null;

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy <= radius * radius + 1) {
          const nx = this.state.x + dx;
          const ny = this.state.y + dy;
          if (ny >= 0 && ny < this.activeMap.length && nx >= 0 && nx < this.activeMap[0].length) {
            expMap[`${nx},${ny}`] = true;
            if (chLegacyMap) chLegacyMap[`${nx},${ny}`] = true;
          }
        }
      }
    }

    if (!this.state.zoneMasteryClaimed) this.state.zoneMasteryClaimed = {};
    const zKey = this.state.inAbyss
      ? `abyss_${this.state.abyssFloor}`
      : `ch${this.state.chapter}_z${this.state.subZone || 1}`;
    const pct = this.getZoneExplorationPercent();
    if (pct >= 55 && !this.state.zoneMasteryClaimed[zKey]) {
      this.state.zoneMasteryClaimed[zKey] = true;
      this.state.gold += 90;
      this.state.exp += 60;
      this.addItem("star_shard", 2);
      while (this.state.exp >= this.state.maxExp) {
        this.state.exp -= this.state.maxExp;
        this.state.level++;
        this.state.maxExp = Math.round(this.state.maxExp * 1.35);
        this.state.skillPoints += 1;
      }
      this.recalcStats(false);
      this.log(
        `[區域探索大師] 本區地圖探索度突破 ${pct}%！獲得探索里程碑獎勵：+90 金幣、+60 EXP、【星辰碎晶】x2！`,
        "achievement"
      );
      if (typeof window !== "undefined" && window.gameUI) {
        window.gameUI.showToast(`[探索度突破 ${pct}%] 獎勵 +90G +60EXP +2星辰碎晶！`, "gold");
      }
    }
  }

  move(dx, dy) {
    if (this.combat) return { moved: false, reason: "in_combat" };
    const nx = this.state.x + dx;
    const ny = this.state.y + dy;

    if (ny < 0 || ny >= this.activeMap.length || nx < 0 || nx >= this.activeMap[0].length) {
      return { moved: false, reason: "bounds" };
    }

    const tile = this.activeMap[ny][nx];
    if (tile === "#") {
      return { moved: false, reason: "wall" };
    }
    if (tile === "~") {
      this.log("[地形阻擋] 前方是無法跨越的深水或熔岩，請先尋找區域內的機關閥門或星盤架橋！", "warn");
      return { moved: false, reason: "hazard" };
    }

    const coord = `${nx},${ny}`;
    const ev = this.resolveEventAt(nx, ny, tile);

    if (tile === "G" && ev && ev.type === "gate") {
      const canOpen =
        ev.autoOpen ||
        (ev.reqKey && this.state.keys[ev.reqKey]) ||
        (ev.reqFlag && this.state.flags[ev.reqFlag]);

      if (canOpen) {
        this.activeMap[ny][nx] = ".";
        this.markEventCompleted(coord);
        if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("puzzle");
        this.log(`[開啟大門] ${ev.openMsg || "封印大門已開啟！"}`, "success");
      } else {
        if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("click");
        this.log(`[大門鎖定] ${ev.lockedMsg || "大門緊閉，需要特定鑰匙或解開機關。"}`, "warn");
        if (typeof window !== "undefined" && window.gameUI) {
          window.gameUI.showToast(ev.lockedMsg || "大門緊閉，請先完成前置目標", "warn");
        }
        return { moved: false, reason: "gate_locked", msg: ev.lockedMsg };
      }
    }

    if (tile === "N" || tile === "R" || tile === "W") {
      this.interactTile(nx, ny, tile, ev);
      return { moved: false, reason: "interacted" };
    }

    if ((tile === "E" || tile === "B") && ev) {
      this.startCombat(ev, coord, { x: nx, y: ny });
      return { moved: false, reason: "combat_started" };
    }

    if (tile === ">" || tile === "<" || (ev && ev.type === "zone_portal")) {
      return this.handleZonePortal(ev);
    }

    if (tile === "P") {
      return this.handlePortal(ev);
    }

    this.state.x = nx;
    this.state.y = ny;
    this.state.stats.stepsTaken++;
    if (this.state.pulseCooldown > 0) this.state.pulseCooldown--;
    if (this.state.pulseVisionSteps > 0) this.state.pulseVisionSteps--;
    this.updateFogOfWar();
    if (typeof window !== "undefined" && window.soundSystem) {
      window.soundSystem.sfx("step");
    }

    if (tile !== "." && tile !== "=") {
      this.interactTile(nx, ny, tile, ev);
    }

    if (!this.combat) {
      this.stepRoamingEnemies();
    }

    return { moved: true, x: nx, y: ny, tile };
  }

  // 動態巡邏魔物系統：讓東翼與南翼具有 patrol 標記的魔物在迷宮走廊間巡邏，並遞減震懾回合
  stepRoamingEnemies() {
    const entries = Object.entries(this.activeEvents);
    for (const [coord, ev] of entries) {
      if (!ev || ev.type !== "enemy") continue;
      if (ev.stunnedSteps && ev.stunnedSteps > 0) {
        ev.stunnedSteps--;
        continue;
      }
      if (!ev.patrol || this.state.stats.stepsTaken % 2 !== 0) continue;
      const [ex, ey] = coord.split(",").map(Number);
      if (!this.activeMap[ey] || this.activeMap[ey][ex] !== "E") continue;
      // 距離玩家 1 格時不主動重疊覆蓋，保留由玩家觸發或奇襲
      if (Math.abs(ex - this.state.x) + Math.abs(ey - this.state.y) <= 1) continue;

      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      const pickDir = dirs[(this.state.stats.stepsTaken + ex + ey) % dirs.length];
      const tx = ex + pickDir[0];
      const ty = ey + pickDir[1];
      const tCoord = `${tx},${ty}`;
      if (
        ty > 1 &&
        ty < this.activeMap.length - 1 &&
        tx > 1 &&
        tx < this.activeMap[0].length - 1 &&
        this.activeMap[ty][tx] === "." &&
        !this.activeEvents[tCoord] &&
        (tx !== this.state.x || ty !== this.state.y)
      ) {
        this.activeMap[ey][ex] = ".";
        this.activeMap[ty][tx] = "E";
        delete this.activeEvents[coord];
        this.activeEvents[tCoord] = ev;
      }
    }
  }

  // 主動地圖探索技：[Q] 星輝脈衝 (震碎 3 格內裂隙秘牆 W、淨化陷阱 T、震懾魔物觸發先制奇襲 Ambush、賦予 +3 視野)
  castAstralPulse() {
    if (this.combat) return { ok: false, msg: "戰鬥中無法使用地圖星輝脈衝！" };
    if ((this.state.pulseCooldown || 0) > 0 && this.state.mp < 12) {
      return { ok: false, msg: `星輝脈衝冷卻中 (${this.state.pulseCooldown} 步)，或需要 12 MP 強行激發！` };
    }
    if ((this.state.pulseCooldown || 0) > 0) {
      this.state.mp -= 12;
    }
    this.state.pulseCooldown = 5;
    this.state.pulseVisionSteps = 8;
    this.lastPulseAnim = { x: this.state.x, y: this.state.y, ticks: 26, maxTicks: 26 };

    let wallsBroken = 0;
    let trapsDisarmed = 0;
    let enemiesStunned = 0;
    const radius = 3;

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy > radius * radius + 1) continue;
        const tx = this.state.x + dx;
        const ty = this.state.y + dy;
        if (ty < 0 || ty >= this.activeMap.length || tx < 0 || tx >= this.activeMap[0].length) continue;

        const tile = this.activeMap[ty][tx];
        const coord = `${tx},${ty}`;
        const ev = this.resolveEventAt(tx, ty, tile);

        if (tile === "W") {
          this.activeMap[ty][tx] = ".";
          delete this.activeLabels[coord];
          this.markEventCompleted(coord);
          this.state.stats.secretsFound = (this.state.stats.secretsFound || 0) + 1;
          this.state.exp += 25;
          wallsBroken++;
          if (typeof window !== "undefined" && window.gameUI && window.gameUI.addMapFloatText) {
            window.gameUI.addMapFloatText(tx, ty, "秘牆破除! +25EXP", "#38bdf8");
          }
        } else if (tile === "T") {
          this.activeMap[ty][tx] = ".";
          this.markEventCompleted(coord);
          this.addItem("star_shard", 1);
          this.state.exp += 18;
          trapsDisarmed++;
          if (typeof window !== "undefined" && window.gameUI && window.gameUI.addMapFloatText) {
            window.gameUI.addMapFloatText(tx, ty, "陷阱淨化! +1星辰碎晶", "#2dd4bf");
          }
        } else if ((tile === "E" || tile === "B") && ev) {
          ev.stunnedSteps = 4;
          enemiesStunned++;
          if (typeof window !== "undefined" && window.gameUI && window.gameUI.addMapFloatText) {
            window.gameUI.addMapFloatText(tx, ty, "星芒震懾! [可先制奇襲]", "#facc15");
          }
        }
      }
    }

    while (this.state.exp >= this.state.maxExp) {
      this.state.exp -= this.state.maxExp;
      this.state.level++;
      this.state.maxExp = Math.round(this.state.maxExp * 1.35);
      this.state.skillPoints += 1;
      this.recalcStats(true);
    }
    this.updateFogOfWar();
    if (typeof window !== "undefined" && window.soundSystem) {
      window.soundSystem.sfx("puzzle");
    }

    const effects = ["視野擴大 +3 (8步)"];
    if (wallsBroken > 0) effects.push(`震碎隱藏秘牆 x${wallsBroken}`);
    if (trapsDisarmed > 0) effects.push(`淨化陷阱 x${trapsDisarmed} (+${trapsDisarmed} 星辰碎晶)`);
    if (enemiesStunned > 0) effects.push(`震懾魔物 x${enemiesStunned} (接觸可觸發【先制奇襲】)`);

    const msg = `[星輝脈衝] 波紋擴散：${effects.join("、")}！`;
    this.log(msg, "achievement");
    if (typeof window !== "undefined" && window.gameUI) {
      window.gameUI.showToast(msg, "teal");
      if (window.gameUI.addMapFloatText) {
        window.gameUI.addMapFloatText(this.state.x, this.state.y, "星輝脈衝!", "#38bdf8");
      }
    }
    return { ok: true, wallsBroken, trapsDisarmed, enemiesStunned, msg };
  }

  markEventCompleted(coord) {
    if (!this.state.inAbyss) {
      const z = this.state.subZone || 1;
      this.state.completedEvents[`ch${this.state.chapter}_z${z}_${coord}`] = true;
      if (z === 1) {
        this.state.completedEvents[`ch${this.state.chapter}_${coord}`] = true;
      }
    }
  }

  // 檢查支線任務進度與是否達成條件
  getSideQuestProgress(questId) {
    if (!this.data.sideQuests || !this.data.sideQuests[questId]) return null;
    const sq = this.data.sideQuests[questId];
    const completed = (this.state.completedSideQuests || []).includes(questId);
    let current = 0;
    let target = sq.reqCount || 1;
    let ready = false;

    if (sq.reqType === "item") {
      current = this.state.inventory[sq.reqItem] || 0;
      ready = current >= target;
    } else if (sq.reqType === "flag") {
      current = this.state.flags[sq.reqFlag] ? 1 : 0;
      target = 1;
      ready = current >= 1;
    } else if (sq.reqType === "loreCount") {
      current = (this.state.loreUnlocked || []).length;
      ready = current >= target;
    }

    return { quest: sq, completed, ready, current, target };
  }

  interactTile(x, y, tile, ev) {
    const coord = `${x},${y}`;
    const resolvedEv = ev || this.resolveEventAt(x, y, tile);

    if (tile === "F") {
      this.recalcStats(true);
      this.state.sharpness = 100;
      this.saveGame(0);
      if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("heal");
      this.log("[營火休息] 生命值、星力與武器斬味已完全恢復，並完成了自動存檔（可按 [G] 享用貓飯）。", "success");
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
      if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("click");
      let rewardText = "";
      const z = this.state.subZone || 1;
      const rewardFlag = `npc_reward_${this.state.chapter}_${coord}`;
      const rewardFlagZone = `npc_reward_${this.state.chapter}_${z}_${coord}`;

      if (resolvedEv.firstReward && !this.state.flags[rewardFlag] && !this.state.flags[rewardFlagZone]) {
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
              while (this.state.exp >= this.state.maxExp) {
                this.state.exp -= this.state.maxExp;
                this.state.level++;
                this.state.maxExp = Math.round(this.state.maxExp * 1.35);
                this.state.skillPoints += 1;
              }
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
      while (this.state.exp >= this.state.maxExp) {
        this.state.exp -= this.state.maxExp;
        this.state.level++;
        this.state.maxExp = Math.round(this.state.maxExp * 1.35);
        this.state.skillPoints += 1;
      }
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
      while (this.state.exp >= this.state.maxExp) {
        this.state.exp -= this.state.maxExp;
        this.state.level++;
        this.state.maxExp = Math.round(this.state.maxExp * 1.35);
        this.state.skillPoints += 1;
      }
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
      while (this.state.exp >= this.state.maxExp) {
        this.state.exp -= this.state.maxExp;
        this.state.level++;
        this.state.maxExp = Math.round(this.state.maxExp * 1.35);
        this.state.skillPoints += 1;
      }
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

  handleZonePortal(ev) {
    if (!ev) return { moved: false };
    if ((ev.reqFlag && !this.state.flags[ev.reqFlag]) || (ev.reqKey && !this.state.keys[ev.reqKey])) {
      if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("click");
      const msg = ev.lockedMsg || "前方通道尚未解鎖，請先完成本區的機關！";
      this.log(`[通道封鎖] ${msg}`, "warn");
      if (typeof window !== "undefined" && window.gameUI) {
        window.gameUI.showToast(msg, "warn");
      }
      return { moved: false, reason: "portal_locked" };
    }

    if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("puzzle");
    const targetZ = ev.targetZone || 1;
    this.loadZone(targetZ, ev.targetX, ev.targetY, false);
    this.saveGame(0);
    const ch = this.data.chapters[this.state.chapter];
    const zObj = ch && ch.zones && ch.zones[targetZ] ? ch.zones[targetZ] : null;
    if (typeof window !== "undefined" && window.gameUI && zObj) {
      window.gameUI.showToast(`進入區域 ${this.state.chapter}-${targetZ}：${zObj.name}`, "teal");
    }
    return { moved: true, zoneChanged: true, subZone: targetZ };
  }

  handlePortal(ev) {
    if (!ev) return { moved: false };
    if (ev.reqFlag && !this.state.flags[ev.reqFlag]) {
      if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("click");
      this.log(`[傳送陣未啟動] ${ev.lockedMsg}`, "warn");
      if (typeof window !== "undefined" && window.gameUI) {
        window.gameUI.showToast(ev.lockedMsg, "warn");
      }
      return { moved: false, reason: "portal_locked" };
    }

    if (ev.type === "abyss_portal") {
      if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("puzzle");
      this.enterAbyss(this.state.abyssFloor + 1);
      return { moved: true, portal: true };
    }

    if (ev.nextChapter) {
      if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("levelup");
      this.loadChapter(ev.nextChapter, true, 1);
      this.saveGame(0);
      if (typeof window !== "undefined" && window.gameUI) {
        window.gameUI.showChapterBanner(this.data.chapters[ev.nextChapter]);
      }
      return { moved: true, portal: true };
    }
    return { moved: false };
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

  // ==================== 戰術回合制戰鬥系統 (含屬性弱點克制、先制奇襲、元素共鳴連攜與星靈協同大招) ====================
  startCombat(ev, coord) {
    const template = this.data.enemies[ev.enemyId];
    if (!template) return;

    const scale = ev.abyssScale || 1.0;
    const comp = this.getComputedStats();
    // 即時戰鬥中玩家出手頻率遠高於回合制 (約 4~5 倍)，魔物生命以 RT_HP_MULT 倍補償，使一般魔物約 8~12 秒可擊倒
    const maxHp = Math.round(template.hp * scale * RT_HP_MULT);
    const elemNames = { physical: "物理", star: "星輝", fire: "烈焰", frost: "寒霜", void: "虛空" };
    const weakText = (template.weaknesses || []).map(w => elemNames[w] || w).join(" / ");
    const isAmbush = !!(ev.stunnedSteps && ev.stunnedSteps > 0);
    const startHp = isAmbush ? Math.max(1, Math.round(maxHp * 0.85)) : maxHp;
    const startShield = isAmbush ? Math.max(1, template.shield - 1) : template.shield;

    const initLogs = [
      ev.intro || `[進入戰鬥] 遭遇敵人：【${template.name}】！`,
      `[弱點情報] 敵方屬性弱點：【${weakText || "無"}】（使用克制屬性戰技可額外削盾 +1 並提升 25% 傷害！）`
    ];

    if (isAmbush) {
      ev.stunnedSteps = 0;
      this.state.burst = Math.min(100, this.state.burst + 25);
      this.state.stats.ambushesTriggered = (this.state.stats.ambushesTriggered || 0) + 1;
      initLogs.push(
        `[先制奇襲 AMBUSH!] 趁敵人被星輝脈衝震懾時發動奇襲！開局削減敵方 15% 生命、擊碎 1 點護盾並獲得 +25 極限星能！`
      );
    }

    this.combat = {
      coord,
      eventObj: ev,
      enemyId: ev.enemyId,
      name: template.name,
      icon: template.icon,
      weaknesses: template.weaknesses || [],
      isElite: !!template.isElite,
      isBoss: !!template.isBoss,
      isFinalBoss: !!template.isFinalBoss,
      enemyHp: startHp,
      enemyMaxHp: maxHp,
      enemyAtk: Math.round(template.atk * scale),
      enemyDef: Math.round(template.def * scale),
      enemyShield: startShield,
      enemyMaxShield: template.shield,
      brokenThisTurn: false,
      phase2Triggered: false,
      enraged: false,
      phase2Text: template.phase2Text || null,
      turn: 1,
      intentIndex: 0,
      intents: template.intents,
      playerArmor: comp.startArmor,
      playerGuarding: false,
      foresightStance: false,
      targetPart: "body",
      parts: {
        head: {
          key: "head",
          name: "頭部",
          hp: Math.max(28, Math.round(maxHp * 0.34)),
          maxHp: Math.max(28, Math.round(maxHp * 0.34)),
          broken: false,
          desc: "破頭可觸發【氣絕KO!】直接粉碎 2 點護盾並降低魔物 15% 攻擊力"
        },
        body: {
          key: "body",
          name: "軀幹",
          hp: Math.max(35, Math.round(maxHp * 0.42)),
          maxHp: Math.max(35, Math.round(maxHp * 0.42)),
          broken: false,
          desc: "弱點肉質(+15%傷害)，破壞胸甲可使魔物陷入 3 回合【易傷+30%】"
        },
        tail: {
          key: "tail",
          name: "尾巴",
          hp: Math.max(26, Math.round(maxHp * 0.32)),
          maxHp: Math.max(26, Math.round(maxHp * 0.32)),
          broken: false,
          desc: "斬擊累積可觸發【斷尾成功!】立即剝取額外稀有魔物素材與金幣"
        }
      },
      playerStatuses: { burn: 0, weaken: 0, vuln: 0, regen: 0 },
      enemyStatuses: { burn: 0, weaken: 0, vuln: 0, atkBuff: 0 },
      lastElement: null,
      companionCharge: 100,
      shake: isAmbush ? 12 : 0,
      fx: isAmbush ? { text: "AMBUSH! -15% HP", color: "#facc15", ticks: 32 } : null,
      slashAnim: 0,
      projAnim: null,
      log: initLogs,
      rt: this.rtInit(coord)
    };
    if (isAmbush) {
      this.combat.rt.stunT = 2.2;
      this.combat.rt.m.state = "stun";
    }

    if (typeof window !== "undefined" && window.soundSystem) {
      window.soundSystem.startBGM(template.isBoss || template.isElite ? "boss" : "combat", this.state.chapter);
    }
  }

  // 《魔物獵人》切換魔物鎖定部位 (head: 頭部 / body: 軀幹 / tail: 尾巴)
  selectMonsterPart(partKey) {
    if (!this.combat || !this.combat.parts || !this.combat.parts[partKey]) return { ok: false };
    this.combat.targetPart = partKey;
    const p = this.combat.parts[partKey];
    if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("click");
    const msg = `[部位鎖定] 準星已鎖定魔物【${p.name}】（${p.desc}）！`;
    this.combat.log.push(msg);
    if (typeof window !== "undefined" && window.gameUI) {
      window.gameUI.showToast(`[部位鎖定] 已瞄準：【${p.name}】`, "teal");
    }
    return { ok: true, part: partKey, info: p };
  }

  // 星靈夥伴主動協同大招 ([C] 鍵施放，不消耗玩家出招回合)
  castCompanionSkill() {
    if (!this.combat) return { ok: false, msg: "僅能在戰鬥中施放星靈協同技！" };
    if ((this.combat.companionCharge || 0) < 100) {
      return { ok: false, msg: `星靈協同能量充能中 (${this.combat.companionCharge || 0}%)！` };
    }
    this.combat.companionCharge = 0;
    const petId = this.state.companion || "lumi";
    const comp = this.getComputedStats();
    let msg = "";

    if (petId === "lumi") {
      const healHp = Math.round(this.state.maxHp * 0.35);
      this.state.hp = Math.min(this.state.maxHp, this.state.hp + healHp);
      this.state.mp = Math.min(this.state.maxMp, this.state.mp + 25);
      this.combat.playerStatuses.burn = 0;
      this.combat.playerStatuses.weaken = 0;
      this.combat.playerStatuses.vuln = 0;
      this.combat.playerStatuses.regen = 2;
      this.combat.fx = { text: `星露聖域 +${healHp}HP`, color: "#4ade80", ticks: 28 };
      if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("heal");
      msg = `[星靈大招] 【露米・星露聖域】恢復 +${healHp} HP、+25 MP，淨化負面狀態並賦予 2 回合再生！`;
    } else if (petId === "oliver") {
      const dmg = Math.max(12, Math.round(comp.atk * 1.15));
      this.combat.enemyHp = Math.max(0, this.combat.enemyHp - dmg);
      this.damageEnemyShield(2);
      this.combat.enemyStatuses.vuln = (this.combat.enemyStatuses.vuln || 0) + 2;
      this.combat.shake = 14;
      this.combat.fx = { text: `解構光束 -${dmg} (破盾-2)`, color: "#38bdf8", ticks: 28 };
      if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("burst");
      msg = `[星靈大招] 【奧利弗・弱點解構光束】造成 ${dmg} 點傷害、擊碎 2 點韌性護盾並附加 2 回合【易傷】！`;
    } else if (petId === "iggy") {
      const dmg = Math.max(18, Math.round(comp.atk * 1.55));
      this.combat.enemyHp = Math.max(0, this.combat.enemyHp - dmg);
      this.damageEnemyShield(1);
      this.combat.enemyStatuses.burn = (this.combat.enemyStatuses.burn || 0) + 3;
      this.state.burst = Math.min(100, this.state.burst + 25);
      this.combat.shake = 16;
      this.combat.fx = { text: `紅蓮龍息 -${dmg}`, color: "#fb923c", ticks: 28 };
      if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("burst");
      msg = `[星靈大招] 【伊格・紅蓮龍息吐息】造成 ${dmg} 點烈焰傷害、擊碎 1 點護盾、附加 3 回合【灼燒】並 +25 極限星能！`;
    } else {
      const dmg = Math.max(16, Math.round(comp.atk * 1.35));
      this.combat.enemyHp = Math.max(0, this.combat.enemyHp - dmg);
      this.combat.playerArmor += 40;
      this.state.burst = Math.min(100, this.state.burst + 30);
      this.combat.fx = { text: `星穹壁壘 -${dmg} (+40甲)`, color: "#c084fc", ticks: 28 };
      if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("burst");
      msg = `[星靈大招] 【瑟拉・星穹神聖壁壘】造成 ${dmg} 點虛空傷害，並賦予 +40 護甲與 +30 極限星能！`;
    }

    this.combat.log.push(msg);
    if (this.combat.enemyHp <= 0) {
      this.winCombat();
      return { ok: true, msg, combatEnded: true };
    }
    return { ok: true, msg, combatEnded: false };
  }

  // 武器五屬性自由附魔切換 ([E] 鍵或按鈕觸發：物理 -> 星輝 -> 烈焰 -> 寒霜 -> 虛空)
  cycleWeaponElement() {
    const order = ["physical", "star", "fire", "frost", "void"];
    const names = {
      physical: "物理鋒刃",
      star: "星輝附魔",
      fire: "烈焰附魔",
      frost: "寒霜附魔",
      void: "虛空附魔"
    };
    const cur = this.state.weaponElement || "physical";
    const nextIdx = (order.indexOf(cur) + 1) % order.length;
    const nextElem = order[nextIdx];
    this.state.weaponElement = nextElem;
    const label = names[nextElem];
    if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("click");
    const msg = `[武器附魔] 武器屬性已切換為【${label}】！「星芒斬」與「破甲重刺」將轉化為該屬性，助你破盾與觸發元素共鳴連攜！`;
    if (this.combat) {
      this.combat.log.push(msg);
    } else {
      this.log(msg, "info");
    }
    if (typeof window !== "undefined" && window.gameUI) {
      window.gameUI.showToast(`武器附魔切換：${label}`, "teal");
    }
    return { ok: true, element: nextElem, label };
  }

  getCurrentIntent() {
    if (!this.combat) return null;
    if (this.combat.brokenThisTurn) {
      return { type: "stunned", label: "[BREAK 破盾暈眩] 本回合無法行動", dmgPreview: 0 };
    }
    const intent = this.combat.intents[this.combat.intentIndex % this.combat.intents.length];
    const comp = this.getComputedStats();
    let dmgPreview = 0;
    if (intent.mult && intent.mult > 0) {
      let raw = this.combat.enemyAtk * intent.mult;
      if (this.combat.enemyStatuses.atkBuff > 0) raw *= 1.35;
      if (this.combat.enemyStatuses.weaken > 0) raw *= 0.7;
      let mitigated = Math.max(4, raw - comp.def * 0.65);
      if (this.combat.playerStatuses.vuln > 0) mitigated *= 1.3;
      dmgPreview = Math.round(mitigated);
    }
    return { ...intent, dmgPreview };
  }

  damageEnemyShield(amount) {
    if (!this.combat || amount <= 0 || this.combat.enemyShield <= 0) return false;
    this.combat.enemyShield = Math.max(0, this.combat.enemyShield - amount);
    if (this.combat.enemyShield === 0 && !this.combat.brokenThisTurn) {
      this.combat.brokenThisTurn = true;
      if (this.combat.rt) this.combat.rt.stunT = 3.2;
      this.state.stats.shieldsBroken++;
      this.checkMilestoneAchievements();
      if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("break");
      this.combat.log.push(`[BREAK 破盾成功] ${this.combat.name} 的護盾徹底粉碎，陷入暈眩與 1.4 倍易傷狀態！`);
      return true;
    }
    return false;
  }

  executeSkill(skillId) {
    if (!this.combat) return { ok: false };
    const sk = this.data.skills[skillId];
    if (!sk) return { ok: false };

    if (sk.mpCost && this.state.mp < sk.mpCost) {
      return { ok: false, msg: "星力(MP)不足！" };
    }
    if (sk.burstCost && this.state.burst < sk.burstCost) {
      return { ok: false, msg: "極限星能(Burst)未滿 100！" };
    }

    const rt = this.combat.rt;
    if (rt) {
      if (rt.gcd > 0) return { ok: false };
      if ((rt.cd[skillId] || 0) > 0) return { ok: false, msg: `【${sk.name}】冷卻中` };
      if (sk.type !== "defense" && sk.type !== "heal" && this.rtHeroDist() > this.rtSkillRange(sk)) {
        const melee = this.rtSkillRange(sk) < 2;
        if (!melee || this.rtHeroDist() > 4.2 || !this.rtDashToMonster()) {
          return { ok: false, msg: "距離太遠，請靠近魔物" };
        }
      }
      rt.cd[skillId] = this.rtSkillCd(sk);
      rt.gcd = 0.45;
    }

    const comp = this.getComputedStats();
    if (sk.mpCost) this.state.mp -= sk.mpCost;
    if (sk.burstCost) this.state.burst = 0;
    if (sk.burstGain) this.state.burst = Math.min(100, this.state.burst + sk.burstGain);

    this.combat.playerGuarding = false;

    if (sk.id === "slash") {
      this.state.mp = Math.min(this.state.maxMp, this.state.mp + 10);
    }

    if (sk.type === "defense") {
      const armorGain = Math.round(this.state.maxHp * 0.22);
      this.combat.playerArmor += armorGain;
      this.combat.playerGuarding = true;
      if (rt) { rt.guardT = 1.1; rt.guardAge = 0; }
      this.state.mp = Math.min(this.state.maxMp, this.state.mp + 15);
      if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("heal");
      this.combat.log.push(`[防禦姿態] 施展【${sk.name}】，獲得 +${armorGain} 護甲並回復 15 MP（若敵方施展蓄力或強擊將觸發【完美星紋防反】）！`);
    } else if (sk.type === "heal") {
      const healAmt = Math.round(this.state.maxHp * 0.38);
      this.state.hp = Math.min(this.state.maxHp, this.state.hp + healAmt);
      this.combat.playerStatuses.burn = 0;
      this.combat.playerStatuses.weaken = 0;
      this.combat.playerStatuses.vuln = 0;
      this.combat.playerStatuses.regen = 2;
      if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("heal");
      this.combat.log.push(`[星輝治療] 施展【${sk.name}】，恢復 ${healAmt} HP，淨化負面狀態並獲得 2 回合再生！`);
    } else {
      const effectiveType =
        (sk.id === "slash" || sk.id === "heavy_thrust") && this.state.weaponElement
          ? this.state.weaponElement
          : sk.type;
      const isWeakness =
        (this.combat.weaknesses && this.combat.weaknesses.includes(effectiveType)) ||
        sk.type === "ultimate";

      // 元素共鳴連攜判定：與上一回合使用不同屬性的攻擊戰技時，觸發元素共鳴連攜
      let comboName = null;
      let comboMult = 1.0;
      let comboExtraShield = 0;
      const prevElem = this.combat.lastElement;
      if (prevElem && prevElem !== effectiveType) {
        const pair = new Set([prevElem, effectiveType]);
        this.state.stats.combosTriggered = (this.state.stats.combosTriggered || 0) + 1;
        if (pair.has("fire") && pair.has("star")) {
          comboName = "星火超載";
          comboMult = 1.3;
          this.state.mp = Math.min(this.state.maxMp, this.state.mp + 14);
        } else if (pair.has("frost") && (pair.has("physical") || pair.has("void"))) {
          comboName = "永凍碎裂";
          comboMult = 1.25;
          comboExtraShield = 1;
          this.combat.enemyStatuses.vuln = (this.combat.enemyStatuses.vuln || 0) + 1;
        } else if (pair.has("physical") && (pair.has("fire") || pair.has("star"))) {
          comboName = "熾刃連斬";
          comboMult = 1.28;
          this.state.burst = Math.min(100, this.state.burst + 15);
        } else {
          comboName = "星界共鳴";
          comboMult = 1.24;
          this.combat.playerArmor += 18;
        }
      }
      this.combat.lastElement = effectiveType;
      this.combat.companionCharge = Math.min(100, (this.combat.companionCharge || 0) + (isWeakness ? 50 : 35));

      const totalShieldBreak = (sk.shieldBreak || 0) + (isWeakness && this.combat.enemyShield > 0 ? 1 : 0) + comboExtraShield;
      const brokeNow = totalShieldBreak > 0 ? this.damageEnemyShield(totalShieldBreak) : false;

      let atkVal = comp.atk * sk.mult;
      if (this.combat.playerStatuses.weaken > 0) atkVal *= 0.72;
      const enemyDefFactor = effectiveType === "void" ? this.combat.enemyDef * 0.3 : this.combat.enemyDef * 0.6;
      let dmg = Math.max(6, atkVal - enemyDefFactor);

      // 《魔物獵人》斬味傷害倍率與鎖定部位肉質加成
      const sharpInfo = this.getSharpnessTierInfo();
      dmg *= sharpInfo.mult;

      const tPartKey = this.combat.targetPart || "body";
      if (tPartKey === "body") dmg *= 1.15;
      else if (tPartKey === "head") dmg *= 1.08;
      else if (tPartKey === "tail") dmg *= 1.05;

      if (isWeakness) dmg *= 1.25;
      if (comboName) dmg *= comboMult;
      if (sk.id === "magma_eruption" && this.combat.enemyStatuses.burn > 0) dmg *= 1.25;
      if (this.combat.brokenThisTurn) dmg *= 1.4;
      if (this.combat.enemyStatuses.vuln > 0) dmg *= 1.3;

      const isCrit = Math.random() * 100 < comp.crit;
      if (isCrit) dmg *= 1.5;

      dmg = Math.round(dmg);
      this.combat.enemyHp = Math.max(0, this.combat.enemyHp - dmg);

      // 消耗武器斬味（若處於剛刃研磨狀態則不消耗）
      if ((this.state.polishTurns || 0) > 0) {
        this.state.polishTurns--;
      } else {
        this.state.sharpness = Math.max(8, (typeof this.state.sharpness === "number" ? this.state.sharpness : 100) - 5);
      }

      // 部位傷害累積與《魔物獵人》部位破壞 / 斷尾判定
      let partBreakTag = "";
      if (this.combat.parts && this.combat.parts[tPartKey]) {
        const pObj = this.combat.parts[tPartKey];
        if (!pObj.broken) {
          const partDmg = Math.round(dmg * (sharpInfo.partMult || 1.15));
          pObj.hp = Math.max(0, pObj.hp - partDmg);
          if (pObj.hp === 0) {
            pObj.broken = true;
            this.state.stats.partsBroken = (this.state.stats.partsBroken || 0) + 1;
            if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("break");
            if (tPartKey === "head") {
              partBreakTag = " [破頭KO!]";
              this.damageEnemyShield(2);
              this.combat.enemyAtk = Math.max(8, Math.round(this.combat.enemyAtk * 0.85));
              this.state.gold += 45;
              this.combat.log.push(
                `[部位破壞：破頭氣絕 KO!] 成功擊碎 ${this.combat.name} 的【頭部龍角】！額外粉碎 2 點韌性護盾、敵方攻擊力永久降低 15%，並獲得破頭賞金 +45G！`
              );
            } else if (tPartKey === "body") {
              partBreakTag = " [胸甲破壞!]";
              this.combat.enemyStatuses.vuln = (this.combat.enemyStatuses.vuln || 0) + 3;
              const bonusBreakDmg = Math.max(15, Math.round(this.combat.enemyMaxHp * 0.1));
              this.combat.enemyHp = Math.max(0, this.combat.enemyHp - bonusBreakDmg);
              this.combat.log.push(
                `[部位破壞：胸甲碎裂!] 貫穿 ${this.combat.name} 的【核心胸甲】！追加 ${bonusBreakDmg} 點部位崩壞傷害，並使其陷入 3 回合【易傷】！`
              );
            } else if (tPartKey === "tail") {
              partBreakTag = " [斷尾成功!]";
              this.state.stats.tailsSevered = (this.state.stats.tailsSevered || 0) + 1;
              const tailLootId = this.state.chapter >= 3 ? "meteor_iron" : "star_shard";
              this.addItem(tailLootId, 1);
              this.state.gold += 60;
              const lootName = this.data.items[tailLootId] ? this.data.items[tailLootId].name : "星辰碎晶";
              this.combat.log.push(
                `[斷尾成功 TAIL SEVERED!] 你一劍斬斷了 ${this.combat.name} 的【尾巴】！立即剝取稀有素材【${lootName} x1】與斷尾賞金 +60G！`
              );
            }
          }
        }
      }

      // 魔物血量低於 65% 時進入《魔物獵人》紅蓮憤怒狀態 (Enrage)
      if (!this.combat.enraged && this.combat.enemyHp > 0 && this.combat.enemyHp <= this.combat.enemyMaxHp * 0.65) {
        this.combat.enraged = true;
        this.combat.log.push(`[魔物憤怒 ENRAGED!] ${this.combat.name} 發出震耳咆哮進入【紅蓮憤怒狀態】，全身散發赤紅鬥氣（部位破壞傷害提升）！`);
      }

      this.combat.shake = 14;
      this.combat.slashAnim = 16;
      this.combat.projAnim = { type: effectiveType, ticks: 16 };
      this.combat.fx = {
        text: `${comboName ? `[${comboName}] ` : ""}${isWeakness ? "WEAK! " : ""}${isCrit ? "CRIT " : ""}-${dmg}${brokeNow ? " BREAK!" : ""}${partBreakTag}`,
        color: partBreakTag ? "#facc15" : comboName ? "#c084fc" : isWeakness ? "#fb923c" : isCrit ? "#facc15" : "#38bdf8",
        ticks: 30
      };

      if (typeof window !== "undefined" && window.soundSystem) {
        window.soundSystem.sfx(sk.type === "ultimate" ? "burst" : effectiveType === "physical" ? "slash" : "magic");
      }

      const elemNames = { physical: "物理", star: "星輝", fire: "烈焰", frost: "寒霜", void: "虛空", ultimate: "奧義" };
      const infuseTag = effectiveType !== sk.type ? `[${elemNames[effectiveType]}附魔]` : "";
      this.combat.log.push(
        `[施展戰技] 你使出【${sk.name}${infuseTag}】${comboName ? `（觸發連攜【${comboName}】！）` : ""}${isWeakness ? "（弱點克制 +25%！）" : ""}${isCrit ? "（暴擊！）" : ""}，造成 ${dmg} 點傷害！`
      );

      if (sk.id === "glacier_lance") {
        this.combat.playerArmor += 25;
        this.combat.log.push(`[寒冰護甲] 極寒星力凝結於身，獲得 +25 點護甲！`);
      }

      if (sk.effect) {
        this.combat.enemyStatuses[sk.effect.type] = (this.combat.enemyStatuses[sk.effect.type] || 0) + sk.effect.turns;
        const effNames = { burn: "灼燒", weaken: "虛弱", vuln: "易傷" };
        this.combat.log.push(`[狀態附加] 敵人陷入【${effNames[sk.effect.type]}】(${sk.effect.turns}回合)`);
      }
    }

    if (
      this.combat.isBoss &&
      !this.combat.phase2Triggered &&
      this.combat.enemyHp > 0 &&
      this.combat.enemyHp <= this.combat.enemyMaxHp * 0.5
    ) {
      this.combat.phase2Triggered = true;
      this.combat.enemyAtk = Math.round(this.combat.enemyAtk * 1.18);
      this.combat.enemyShield = Math.min(this.combat.enemyMaxShield, this.combat.enemyShield + 2);
      if (this.combat.phase2Text) {
        this.combat.log.push(`[首領二階段覺醒] ${this.combat.phase2Text}`);
      }
    }

    if (this.combat.enemyHp <= 0) {
      this.winCombat();
      return { ok: true, combatEnded: true };
    }

    return { ok: true, combatEnded: !this.combat };
  }

  winCombat() {
    const c = this.combat;
    if (!c) return;
    const template = this.data.enemies[c.enemyId];
    const comp = this.getComputedStats();

    const expGain = Math.round(template.exp * comp.rewardMult);
    const goldGain = Math.round(template.gold * comp.rewardMult);
    this.state.exp += expGain;
    this.state.gold += goldGain;
    this.state.stats.battlesWon++;
    if (!this.state.bestiaryKills) this.state.bestiaryKills = {};
    this.state.bestiaryKills[c.enemyId] = (this.state.bestiaryKills[c.enemyId] || 0) + 1;

    const dropsWon = [];
    if (template.drops) {
      template.drops.forEach(d => {
        if (Math.random() <= d.chance) {
          this.addItem(d.item, 1);
          const itemObj = this.data.items[d.item];
          if (itemObj) dropsWon.push(itemObj.name);
        }
      });
    }

    const [cx, cy] = c.coord.split(",").map(Number);
    if (this.activeMap[cy] && this.activeMap[cy][cx]) {
      this.activeMap[cy][cx] = ".";
    }
    this.markEventCompleted(c.coord);

    if (c.eventObj.winFlag) {
      this.state.flags[c.eventObj.winFlag] = true;
    }
    if (c.eventObj.winAchievement) {
      this.unlockAchievement(c.eventObj.winAchievement);
    }
    this.unlockAchievement("ach_first_blood");

    let leveledUp = false;
    while (this.state.exp >= this.state.maxExp) {
      this.state.exp -= this.state.maxExp;
      this.state.level++;
      this.state.maxExp = Math.round(this.state.maxExp * 1.35);
      this.state.skillPoints += 1;
      leveledUp = true;
    }
    this.recalcStats(leveledUp);
    this.checkMilestoneAchievements();

    const isFinalBoss = c.isFinalBoss;
    const isBossOrElite = !!(c.isBoss || c.isElite);
    const enemyName = c.name;
    this.combat = null;

    if (this.state.fieldBuff && this.state.fieldBuff.battlesLeft > 0) {
      this.state.fieldBuff.battlesLeft--;
      if (this.state.fieldBuff.battlesLeft <= 0) {
        this.state.fieldBuff = null;
        this.recalcStats(false);
      }
    }

    if (this.state.canteenMeal && this.state.canteenMeal.battlesLeft > 0) {
      this.state.canteenMeal.battlesLeft--;
      if (this.state.canteenMeal.battlesLeft <= 0) {
        this.state.canteenMeal = null;
        this.recalcStats(false);
      }
    }

    if (typeof window !== "undefined" && window.gameUI && window.gameUI.mh3d) {
      window.gameUI.mh3d.triggerQuestClearStamp(enemyName, isBossOrElite);
    }

    if (typeof window !== "undefined" && window.soundSystem) {
      window.soundSystem.sfx(leveledUp ? "levelup" : "victory");
      window.soundSystem.startBGM("explore", this.state.chapter);
    }

    this.log(
      `[戰鬥勝利] 擊敗【${enemyName}】！獲得 ${expGain} EXP、${goldGain} 金幣${dropsWon.length ? `，戰利品：${dropsWon.join("、")}` : ""}。`,
      "success"
    );
    if (typeof window !== "undefined" && window.gameUI) {
      window.gameUI.showToast(`擊敗 ${enemyName}！+${expGain}EXP +${goldGain}G`, "gold");
      if (window.gameUI.addMapFloatText) {
        window.gameUI.addMapFloatText(this.state.x, this.state.y, `+${expGain}EXP +${goldGain}G`, "#facc15");
      }
    }
    if (leveledUp) {
      this.log(`[等級提升] 升至 Lv.${this.state.level}！生命與星力全滿，並獲得 +1 技能點數(SP)！`, "achievement");
    }

    if (isFinalBoss && typeof window !== "undefined" && window.gameUI) {
      window.gameUI.showEndingSelectionModal();
    }
  }

  loseCombat() {
    const enemyName = this.combat ? this.combat.name : "敵人";
    this.combat = null;
    if (typeof window !== "undefined" && window.soundSystem) {
      window.soundSystem.sfx("defeat");
      window.soundSystem.startBGM("explore", this.state.chapter);
    }

    const ch = this.data.chapters[this.state.chapter];
    const z = this.state.subZone || 1;
    const zObj = ch && ch.zones && ch.zones[z] ? ch.zones[z] : ch;
    if (zObj) {
      this.state.x = zObj.startPos.x;
      this.state.y = zObj.startPos.y;
    }
    this.recalcStats(true);
    this.log(`[返回營火] 你在與【${enemyName}】的戰鬥中力竭，微光古墜將你傳送回本區起點並恢復了全部體力。`, "warn");
    if (typeof window !== "undefined" && window.gameUI) {
      window.gameUI.showToast("[營火甦醒] 已恢復全部體力，可升級天賦或強化裝備後再戰！", "warn");
    }
  }

  // 即時戰鬥撤退：需持續 1.6 秒不被擊中才會脫離
  fleeCombat() {
    return this.rtStartFlee();
  }

  getAvailableEndings() {
    const list = ["liberation", "guardian"];
    if (this.state.loreUnlocked.length >= 6) {
      list.push("symbiosis");
    }
    const hasSovereign =
      this.state.equipment.weapon === "astral_sovereign" ||
      (this.state.inventory["astral_sovereign"] || 0) > 0;
    if (hasSovereign || this.state.loreUnlocked.length >= 10) {
      list.push("voyager");
    }
    return list;
  }

  serialize() {
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
    this.state = parsed.state;
    if (!this.state.unlockedCompanions) this.state.unlockedCompanions = ["lumi"];
    if (!this.state.companion) this.state.companion = "lumi";
    if (!this.state.bestiaryKills) this.state.bestiaryKills = {};
    if (!this.state.subZone) this.state.subZone = 1;
    if (!this.state.completedSideQuests) this.state.completedSideQuests = [];
    if (!this.state.equipUpgrades) this.state.equipUpgrades = { weapon: 0, armor: 0, relic: 0 };
    if (typeof this.state.compassEnabled !== "boolean") this.state.compassEnabled = false;
    if (typeof this.state.fullMapView !== "boolean") this.state.fullMapView = false;
    if (typeof this.state.pulseCooldown !== "number") this.state.pulseCooldown = 0;
    if (typeof this.state.pulseVisionSteps !== "number") this.state.pulseVisionSteps = 0;
    if (!this.state.weaponElement) this.state.weaponElement = "physical";
    if (!this.state.zoneMasteryClaimed) this.state.zoneMasteryClaimed = {};
    if (!this.state.viewMode) this.state.viewMode = "2d_pixel";
    // 預設視角改為 2D：舊存檔只遷移一次，之後玩家自行切換的 [V] 選擇會被保留
    if (this.state.viewDefaultVer !== 2) {
      this.state.viewMode = "2d_pixel";
      this.state.viewDefaultVer = 2;
    }
    if (typeof this.state.sharpness !== "number") this.state.sharpness = 100;
    if (typeof this.state.polishTurns !== "number") this.state.polishTurns = 0;
    if (typeof this.state.spiritLevel !== "number") this.state.spiritLevel = 0;
    if (this.state.canteenMeal === undefined) this.state.canteenMeal = null;
    if (!this.state.stats) this.state.stats = {};
    if (typeof this.state.stats.partsBroken !== "number") this.state.stats.partsBroken = 0;
    if (typeof this.state.stats.tailsSevered !== "number") this.state.stats.tailsSevered = 0;
    if (typeof this.state.stats.foresightCounters !== "number") this.state.stats.foresightCounters = 0;

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
if (typeof module !== "undefined" && module.exports && typeof require === "function") {
  require("./combat_rt.js");
}
if (typeof window !== "undefined" && window.StarfallRT) {
  Object.assign(StarfallEngine.prototype, window.StarfallRT);
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { StarfallEngine };
}
