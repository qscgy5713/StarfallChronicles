/**
 * 戰鬥結算 (Battle)
 * 以 mixin 形式掛到 StarfallEngine.prototype：開戰（魔物數值組裝）、技能傷害與部位破壞、首領階段、勝敗/撤退結算與素材剝取。即時移動與預警在 combat_rt.js。
 */
const RT_HP_MULT = 14;

class BattleMixin {
  // ==================== 戰術回合制戰鬥系統 (含屬性弱點克制、先制奇襲、元素共鳴連攜與星靈協同大招) ====================
  startCombat(ev, coord) {
    const template = this.data.enemies[ev.enemyId];
    if (!template) return;
    if (template.isBoss && !this.state.inAbyss && !this.isChapterGateOpen(this.state.chapter)) {
      const g = this.getChapterGate(this.state.chapter);
      const msg = `獵人公會尚未認證你：還需完成委託 ${g.done}/${g.need}${g.eliteOk ? "" : "，並討伐菁英"}（點右側【委託板】）`;
      if (typeof window !== "undefined" && window.gameUI) window.gameUI.showToast(msg, "warn");
      return;
    }

    // 星淵樓層放大：基礎倍率再以 3 倍斜率加成血量與攻擊，終局角色才會感到壓力
    const scale = ev.abyssScale ? 1 + (ev.abyssScale - 1) * 3 : 1.0;
    const comp = this.getComputedStats();
    // 即時戰鬥中玩家出手頻率遠高於原回合制 (約 4~5 倍)，魔物生命以 RT_HP_MULT 倍補償，使一般魔物約 8~12 秒可擊倒
    const typeMult = template.isBoss ? 2.2 : template.isElite ? 1.5 : 1.8; // 首領/精英耐打，避免被技能連段秒殺
    const amod = this.abyssModOf(ev.abyssMod);
    const chMult = 1 + ((template.chapter || 1) - 1) * 0.35; // 後期章節血量加成：玩家攻擊成長遠快於魔物血量
    const maxHp = Math.round(template.hp * scale * RT_HP_MULT * typeMult * chMult * (amod && amod.hp ? amod.hp : 1));
    const elemNames = { physical: "物理", star: "星輝", fire: "烈焰", frost: "寒霜", void: "虛空" };
    const weakText = (template.weaknesses || []).map(w => elemNames[w] || w).join(" / ");
    const isAmbush = !!(ev.stunnedSteps && ev.stunnedSteps > 0);
    const startHp = isAmbush ? Math.max(1, Math.round(maxHp * 0.85)) : maxHp;
    const startShield = (isAmbush ? Math.max(1, template.shield - 1) : template.shield) + (amod && amod.shield ? amod.shield : 0);

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
      enemyMaxShield: template.shield + (amod && amod.shield ? amod.shield : 0),
      brokenThisTurn: false,
      phase2Triggered: false,
      enraged: !!(amod && amod.enraged),
      abyssMod: amod ? amod.id : null,
      abyssDmg: amod && amod.dmg ? amod.dmg : 1,
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
          desc: "弱點肉質(+15%傷害)，破壞胸甲可使魔物陷入 6 秒【易傷+30%】"
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
      msg = `[星靈大招] 【露米・星露聖域】恢復 +${healHp} HP、+25 MP，淨化負面狀態並賦予 4 秒再生！`;
    } else if (petId === "oliver") {
      const dmg = Math.max(12, Math.round(comp.atk * 1.15));
      this.combat.enemyHp = Math.max(0, this.combat.enemyHp - dmg);
      this.damageEnemyShield(2);
      this.combat.enemyStatuses.vuln = (this.combat.enemyStatuses.vuln || 0) + 2;
      this.combat.shake = 14;
      this.combat.fx = { text: `解構光束 -${dmg} (破盾-2)`, color: "#38bdf8", ticks: 28 };
      if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("burst");
      msg = `[星靈大招] 【奧利弗・弱點解構光束】造成 ${dmg} 點傷害、擊碎 2 點韌性護盾並附加 4 秒【易傷】！`;
    } else if (petId === "iggy") {
      const dmg = Math.max(18, Math.round(comp.atk * 1.55));
      this.combat.enemyHp = Math.max(0, this.combat.enemyHp - dmg);
      this.damageEnemyShield(1);
      this.combat.enemyStatuses.burn = (this.combat.enemyStatuses.burn || 0) + 3;
      this.state.burst = Math.min(100, this.state.burst + 25);
      this.combat.shake = 16;
      this.combat.fx = { text: `紅蓮龍息 -${dmg}`, color: "#fb923c", ticks: 28 };
      if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("burst");
      msg = `[星靈大招] 【伊格・紅蓮龍息吐息】造成 ${dmg} 點烈焰傷害、擊碎 1 點護盾、附加 6 秒【灼燒】並 +25 極限星能！`;
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

  // 找出主角附近最近的魔物 (地圖上的 E/B 格)，供探索中直接出招開戰
  findNearestEnemy(maxDist) {
    let best = null;
    const explored = this.getCurrentExploredMap();
    for (const [coord, ev] of Object.entries(this.activeEvents)) {
      if (!ev || ev.type !== "enemy" || !explored[coord]) continue; // 只能攻擊已探索 (看得到) 的魔物
      const [x, y] = coord.split(",").map(Number);
      const t = this.activeMap[y] && this.activeMap[y][x];
      if (t !== "E" && t !== "B") continue;
      const d = Math.hypot(x - this.state.x, y - this.state.y);
      if (d <= maxDist && (!best || d < best.dist)) best = { coord, ev, dist: d };
    }
    return best;
  }

  // 探索中施放治療技能 (技能列常駐，平時可補血)
  castFieldHeal(skillId) {
    const sk = this.data.skills[skillId];
    if (!sk || sk.type !== "heal") return { ok: false };
    if (this.state.hp >= this.state.maxHp) return { ok: false, msg: "生命值已滿" };
    if (sk.mpCost && this.state.mp < sk.mpCost) return { ok: false, msg: "星力(MP)不足！" };
    this.state.mp -= sk.mpCost || 0;
    const healAmt = Math.round(this.state.maxHp * 0.38);
    this.state.hp = Math.min(this.state.maxHp, this.state.hp + healAmt);
    if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("heal");
    this.log(`[星輝治療] 施展【${sk.name}】，恢復 ${healAmt} HP。`, "success");
    return { ok: true };
  }

  getCurrentIntent() {
    if (!this.combat) return null;
    if (this.combat.brokenThisTurn) {
      return { type: "stunned", label: "[BREAK 破盾暈眩] 暈眩中無法行動", dmgPreview: 0 };
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
    // 護盾硬化期：剛從暈眩恢復的魔物短時間內護盾打不破，避免無限連暈
    if (this.combat.rt && this.combat.rt.shieldImmuneT > 0) return false;
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
      if (sk.type !== "defense" && sk.type !== "heal") rt.lockT = sk.type === "ultimate" ? 0.5 : sk.id === "slash" ? 0.15 : 0.3;
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
      this.combat.log.push(`[星輝治療] 施展【${sk.name}】，恢復 ${healAmt} HP，淨化負面狀態並獲得 4 秒再生！`);
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
                `[部位破壞：胸甲碎裂!] 貫穿 ${this.combat.name} 的【核心胸甲】！追加 ${bonusBreakDmg} 點部位崩壞傷害，並使其陷入 6 秒【易傷】！`
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
      if (rt) {
        this.rtPop(dmg, isCrit ? "#facc15" : isWeakness ? "#fb923c" : "#e2e8f0", "enemy", isCrit || isWeakness);
        rt.combo = (rt.combo || 0) + 1;
        rt.comboT = 3;
        rt.comboBest = Math.max(rt.comboBest || 0, rt.combo);
        rt.freeze = Math.max(rt.freeze || 0, isCrit || brokeNow || partBreakTag ? 0.12 : 0.05);
        this.rtTryFlinch(sk, !!partBreakTag);
      }
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
        this.combat.log.push(`[狀態附加] 敵人陷入【${effNames[sk.effect.type]}】(${sk.effect.turns * 2} 秒)`);
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

    // 等級遠高於該章建議等級時經驗遞減，避免無腦刷怪
    const recLv = 3 + (template.chapter || 1) * 2.5;
    const expDecay = c.abyssScale ? 1 : Math.max(0.15, Math.min(1, 1 - 0.12 * (this.state.level - recLv - 2)));
    const expGain = Math.max(1, Math.round(template.exp * comp.rewardMult * expDecay));
    const wmod = this.abyssModOf(c.abyssMod);
    const goldGain = Math.round(template.gold * comp.rewardMult * (wmod && wmod.gold ? wmod.gold : 1));
    this.state.exp += expGain;
    this.state.gold += goldGain;
    this.state.stats.battlesWon++;
    if (!this.state.bestiaryKills) this.state.bestiaryKills = {};
    this.state.bestiaryKills[c.enemyId] = (this.state.bestiaryKills[c.enemyId] || 0) + 1;
    this._boardOnKill(c.enemyId);
    this._storyOnKill(c.enemyId);
    this._bountyOnKill(c.enemyId);

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

    // 剝取魔物素材：破壞部位必得對應素材，另依魔物等級額外剝取 2~4 次 (皮革 55% / 利牙 35% / 稀有核心 10%，首領精英 18%)
    const carved = [];
    if (template.carve) {
      const giveCarve = (id, n = 1) => {
        this.addItem(id, n);
        const it = this.data.items[id];
        carved.push(it ? it.name : id);
      };
      const pt = c.parts || {};
      if (pt.head && pt.head.broken) giveCarve(template.carve.fang);
      if (pt.body && pt.body.broken) giveCarve(template.carve.hide);
      if (pt.tail && pt.tail.broken) giveCarve(template.carve.core);
      const coreRate = c.isBoss || c.isElite ? 0.18 : 0.1;
      const rolls = (c.isBoss ? 4 : c.isElite ? 3 : 2) + (wmod && wmod.carve ? wmod.carve : 0);
      for (let i = 0; i < rolls; i++) {
        const r = Math.random();
        giveCarve(r < coreRate ? template.carve.core : r < coreRate + 0.35 ? template.carve.fang : template.carve.hide);
      }
      if (carved.length) {
        const sum = {};
        carved.forEach(n => (sum[n] = (sum[n] || 0) + 1));
        const parts = Object.entries(sum).map(([n, k]) => `${n} x${k}`);
        this.log(`[剝取素材] 從【${c.name}】身上剝取：${parts.join("、")}。`, "success");
        parts.forEach(x => dropsWon.push(x));
      }
    }

    // 星淵首領通關獎勵：金幣、必得稀有核心；每 5 層為里程碑 (虛空星塵 x2，首次再 +1 技能點)
    if (this.state.inAbyss && c.eventObj && c.eventObj.id && String(c.eventObj.id).startsWith("abyss_b_")) {
      const fl = this.state.abyssFloor;
      const bonusGold = 100 + fl * 40;
      this.state.gold += bonusGold;
      const coreName = template.carve ? (this.data.items[template.carve.core] || {}).name : null;
      if (template.carve) {
        this.addItem(template.carve.core, 1);
        dropsWon.push(`${coreName} x1`);
      }
      this.log(`[星淵第 ${fl} 層通關] 獲得通關獎勵 +${bonusGold} 金幣${coreName ? `與【${coreName}】` : ""}！`, "success");
      if (fl % 5 === 0) {
        this.addItem("void_essence", 2);
        dropsWon.push("虛空星塵 x2");
        this.state.flags[`abyss_milestone_${fl}`] = this.state.flags[`abyss_milestone_${fl}`] || (this.state.skillPoints++, true);
        this.log(`[深淵里程碑] 突破第 ${fl} 層！獲得【虛空星塵】x2，首次突破另有 +1 技能點！下次可從第 ${fl + 1} 層開始挑戰。`, "achievement");
      }
    }

    const [cx, cy] = c.coord.split(",").map(Number);
    if (this.activeMap[cy] && this.activeMap[cy][cx]) {
      this.activeMap[cy][cx] = ".";
    }
    // 一般魔物不永久消失：重新進入區域或在營火休息後會重生（精英、首領、帶旗標者除外）
    if (c.isBoss || c.isElite || c.eventObj.winFlag) this.markEventCompleted(c.coord);

    if (c.eventObj.winFlag) {
      this.state.flags[c.eventObj.winFlag] = true;
    }
    if (c.eventObj.winAchievement) {
      this.unlockAchievement(c.eventObj.winAchievement);
    }
    this.unlockAchievement("ach_first_blood");

    const leveledUp = this._levelUpFromExp();
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
      if (c.rt && window.gameUI.showBattleSummary) {
        window.gameUI.showBattleSummary({
          name: enemyName,
          time: c.rt.elapsed || 0,
          combo: c.rt.comboBest || 0,
          taken: c.rt.taken || 0,
          exp: expGain,
          gold: goldGain,
          drops: dropsWon
        });
      }
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
    const goldLoss = Math.floor(this.state.gold * 0.15);
    this.state.gold -= goldLoss;
    this.recalcStats(true);
    this.log(`[返回營火] 你在與【${enemyName}】的戰鬥中力竭，微光古墜將你傳送回本區起點並恢復了全部體力${goldLoss > 0 ? `，但遺失了 ${goldLoss} 金幣` : ""}。`, "warn");
    if (typeof window !== "undefined" && window.gameUI) {
      window.gameUI.showToast(`[營火甦醒] 已恢復全部體力${goldLoss > 0 ? `，遺失 ${goldLoss} 金幣` : ""}，可升級天賦或強化裝備後再戰！`, "warn");
    }
  }

  // 即時戰鬥撤退：需持續 1.6 秒不被擊中才會脫離
  fleeCombat() {
    return this.rtStartFlee();
  }
}

const StarfallBattle = (typeof mixinFrom === "function" ? mixinFrom : require("./mixin.js").mixinFrom)(BattleMixin);

if (typeof window !== "undefined") window.StarfallBattle = StarfallBattle;
if (typeof module !== "undefined" && module.exports) module.exports = { StarfallBattle };
