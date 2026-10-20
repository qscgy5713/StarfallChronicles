/**
 * 即時戰鬥核心 (Real-time Combat)
 * 以 mixin 形式掛到 StarfallEngine.prototype：魔物在地圖上追擊、攻擊前有預警範圍，
 * 玩家以方向鍵走位、[X] 翻滾閃避，技能以冷卻時間運作，不再有回合與等待。
 * 傷害、部位破壞、護盾、斬味等結算仍沿用 engine.js 的 executeSkill。
 */
const RT_ENEMY_DMG = 2.2; // 魔物傷害倍率：原數值為回合制設計，即時戰鬥需放大才有壓力
const RT_BEAT = 2.0; // 狀態/星靈/回魔的結算節拍 (秒)；原「回合」類持續時間以節拍計
const RT_WALKABLE = ".=";
// 以遠程彈幕攻擊的魔物 (預警圈落在主角所在位置，需要移動躲避)
const RT_RANGED = new Set([
  "tide_siren", "astral_wraith", "star_inquisitor", "ash_drake",
  "elite_twin_inquisitor", "boss_chronos", "boss_astra", "boss_moebius"
]);

const StarfallRT = {
  rtInit(coord) {
    const [mx, my] = coord.split(",").map(Number);
    return {
      mx, my, ox: mx, oy: my,
      cd: {}, gcd: 0, moveCd: 0, dodgeCd: 0, potionCd: 0, sharpenCd: 0,
      ivT: 0, guardT: 0, guardAge: 9, fleeT: 0, stunT: 0,
      dirX: 0, dirY: 1,
      beatT: 0, beatN: 0,
      auto: false,
      m: { state: "idle", t: 0.9, stepT: 0, intent: null, zone: null, windupMax: 1 }
    };
  },

  rtDist(ax, ay, bx, by) {
    return Math.hypot(ax - bx, ay - by);
  },

  // 預警範圍判定：circle 圓形 / line 直線衝鋒 / cone 扇形
  rtInZone(z, hx, hy) {
    const px = hx - z.x, py = hy - z.y;
    if (z.shape === "line") {
      const t = Math.max(0, Math.min(z.len, px * z.dx + py * z.dy));
      return Math.hypot(px - z.dx * t, py - z.dy * t) <= z.w / 2 + 0.25;
    }
    const d = Math.hypot(px, py);
    if (z.shape === "cone") {
      if (d > z.r) return false;
      if (d < 0.01) return true;
      return (px * z.dx + py * z.dy) / d >= Math.cos(z.half);
    }
    return d <= z.r;
  },

  // 依魔物類型與距離挑選攻擊型態；距離不合適時回傳 null (繼續追擊)
  rtPlanAttack(intent) {
    const c = this.combat;
    const rt = c.rt;
    const hx = this.state.x, hy = this.state.y;
    const d = this.rtHeroDist();
    const dx = (hx - rt.mx) / (d || 1), dy = (hy - rt.my) / (d || 1);
    const ranged = RT_RANGED.has(c.enemyId);
    const heavy = intent.type === "heavy";
    if (ranged && heavy && d <= 6.5) return { windup: 1.3, proj: true, zone: { shape: "circle", x: hx, y: hy, r: 1.9 } };
    if (ranged && !heavy && d >= 2.2 && d <= 6.5) return { windup: 0.95, proj: true, zone: { shape: "circle", x: hx, y: hy, r: 1.35 } };
    if (heavy && !ranged && d >= 2.4 && d <= 6.5) {
      return { windup: 1.0, rush: true, zone: { shape: "line", x: rt.mx, y: rt.my, dx, dy, len: Math.min(7, d + 1.5), w: 1.2 } };
    }
    if (heavy && d <= 2.1) return { windup: 1.15, zone: { shape: "circle", x: rt.mx, y: rt.my, r: 2.6 } };
    if (!heavy && (c.isBoss || c.isElite) && c.intentIndex % 2 === 1 && d <= 2.6) {
      return { windup: 0.85, zone: { shape: "cone", x: rt.mx, y: rt.my, dx, dy, r: 2.9, half: 1.0 } };
    }
    if (!heavy && d <= 1.5) return { windup: 0.7, zone: { shape: "circle", x: rt.mx, y: rt.my, r: 1.55 } };
    return null;
  },

  // 衝鋒：魔物沿直線衝到終點 (遇牆或主角前停下)
  rtRushMonster(zone) {
    const rt = this.combat.rt;
    let lx = rt.mx, ly = rt.my;
    for (let k = 1; k <= Math.round(zone.len); k++) {
      const x = Math.round(zone.x + zone.dx * k), y = Math.round(zone.y + zone.dy * k);
      if (!this.rtWalkable(x, y) || (x === this.state.x && y === this.state.y)) break;
      lx = x; ly = y;
    }
    rt.mx = lx;
    rt.my = ly;
  },

  // 浮動傷害數字 (target: enemy 於魔物頭上、hero 於主角頭上)
  rtPop(text, color, target = "enemy", big = false) {
    const c = this.combat;
    if (!c) return;
    c.pops = c.pops || [];
    c.pops.push({ text: String(text), color, target, big, age: 0, dx: (Math.random() - 0.5) * 26 });
    if (c.pops.length > 24) c.pops.shift();
  },

  // 打斷 (Flinch)：重擊命中出招前搖中的魔物 → 取消該次攻擊、後退一格並硬直，首領只會被破部位/奧義打斷
  rtTryFlinch(sk, heavyHit) {
    const c = this.combat;
    const rt = c && c.rt;
    if (!rt || rt.flinchCd > 0) return false;
    const m = rt.m;
    if (m.state !== "windup" || m.t < 0.2) return false;
    const strong = heavyHit || sk.type === "ultimate";
    const breaks = c.isBoss ? strong : strong || (sk.mpCost || 0) > 0;
    if (!breaks) return false;
    m.state = "recover";
    m.t = c.isBoss ? 0.9 : 1.3;
    m.zone = null;
    m.proj = false;
    m.rush = false;
    rt.flinchCd = 2.5;
    const dx = Math.sign(rt.mx - this.state.x);
    const dy = Math.sign(rt.my - this.state.y);
    const nx = rt.mx + dx, ny = rt.my + dy;
    if ((dx || dy) && this.rtWalkable(nx, ny) && !(nx === this.state.x && ny === this.state.y)) {
      rt.mx = nx;
      rt.my = ny;
    }
    this.rtPop("打斷！", "#38bdf8", "enemy", true);
    c.log.push(`[打斷] 你的重擊打斷了 ${c.name} 的攻擊，牠踉蹌後退！`);
    return true;
  },

  rtHeroDist() {
    const rt = this.combat.rt;
    return this.rtDist(this.state.x, this.state.y, rt.mx, rt.my);
  },

  rtWalkable(x, y) {
    const map = this.activeMap;
    if (y < 0 || y >= map.length || x < 0 || x >= map[0].length) return false;
    const rt = this.combat && this.combat.rt;
    if (rt && x === rt.ox && y === rt.oy) return true;
    return RT_WALKABLE.includes(map[y][x]);
  },

  rtSkillRange(sk) {
    if (sk.type === "ultimate") return 3.6;
    if (sk.type === "defense" || sk.type === "heal") return 99;
    if (sk.type === "physical" || sk.id === "flame_cleave") return 1.6;
    return 5.2;
  },

  rtSkillCd(sk) {
    if (sk.id === "slash") return 0.8;
    if (sk.type === "defense") return 1.6;
    if (sk.type === "heal") return 6;
    if (sk.type === "ultimate") return 3.2;
    return Math.round((1.0 + (sk.mpCost || 0) * 0.07) * 100) / 100;
  },

  // 玩家在戰鬥中走位 (每步冷卻 0.13 秒，距離怪物不可重疊)
  rtMove(dx, dy) {
    const c = this.combat;
    if (!c || !c.rt) return { moved: false };
    const rt = c.rt;
    if (dx || dy) { rt.dirX = dx; rt.dirY = dy; }
    if (rt.moveCd > 0 || rt.lockT > 0) return { moved: false };
    const nx = this.state.x + dx;
    const ny = this.state.y + dy;
    if (!this.rtWalkable(nx, ny) || (nx === rt.mx && ny === rt.my)) return { moved: false };
    this.state.x = nx;
    this.state.y = ny;
    rt.moveCd = 0.13;
    this.state.stats.stepsTaken++;
    this.updateFogOfWar();
    if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("step");
    return { moved: true };
  },

  // 近戰技能的衝刺：落在魔物旁最靠近自己的可站立格
  rtDashToMonster() {
    const rt = this.combat.rt;
    let best = null;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const x = rt.mx + dx, y = rt.my + dy;
        if (!this.rtWalkable(x, y)) continue;
        const d = this.rtDist(x, y, this.state.x, this.state.y);
        if (!best || d < best.d) best = { x, y, d };
      }
    }
    if (!best) return false;
    this.state.x = best.x;
    this.state.y = best.y;
    this.updateFogOfWar();
    return true;
  },

  // [X] 見切翻滾：朝移動方向(或遠離魔物)位移 2 格，0.45 秒無敵；無敵期間被擊中即觸發氣刃大迴旋
  castForesightSlash() {
    const c = this.combat;
    if (!c || !c.rt) return { ok: false, msg: "僅能在狩獵戰鬥中施展見切迴避！" };
    const rt = c.rt;
    if (rt.dodgeCd > 0) return { ok: false, msg: "翻滾冷卻中" };
    if (this.state.mp < 10) return { ok: false, msg: "星力(MP)不足！" };
    this.state.mp -= 10;
    let dx = rt.dirX, dy = rt.dirY;
    if (!dx && !dy) { dx = Math.sign(this.state.x - rt.mx) || 1; dy = 0; }
    for (let i = 0; i < 2; i++) {
      const nx = this.state.x + dx, ny = this.state.y + dy;
      if (!this.rtWalkable(nx, ny) || (nx === rt.mx && ny === rt.my)) break;
      this.state.x = nx;
      this.state.y = ny;
    }
    this.updateFogOfWar();
    rt.ivT = 0.45;
    rt.dodgeCd = 1.0;
    rt.moveCd = 0.1;
    if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("slash");
    c.fx = { text: "見切翻滾!", color: "#38bdf8", ticks: 22 };
    return { ok: true };
  },

  rtStartFlee() {
    const c = this.combat;
    if (!c || !c.rt) return false;
    if (c.isBoss) {
      c.log.push("[無法撤退] 首領戰無法撤退！");
      return false;
    }
    c.rt.fleeT = 1.6;
    c.fx = { text: "撤退中… 避開攻擊!", color: "#cbd5e1", ticks: 40 };
    return true;
  },

  // 魔物攻擊判定結算 (預警結束瞬間)
  rtResolveStrike(intent, zone) {
    const c = this.combat;
    const rt = c.rt;
    const comp = this.getComputedStats();
    const inZone = this.rtInZone(zone, this.state.x, this.state.y);
    if (!inZone) {
      c.fx = { text: "MISS", color: "#94a3b8", ticks: 18 };
      this.rtPop("閃避", "#94a3b8", "hero");
      if (c.enemyStatuses.atkBuff > 0) c.enemyStatuses.atkBuff--;
      return;
    }
    const isHeavyOrBuffed =
      intent.type === "heavy" || (intent.mult && intent.mult >= 1.25) || c.enemyStatuses.atkBuff > 0;

    // 見切翻滾無敵 → 氣刃大迴旋
    if (rt.ivT > 0) {
      rt.ivT = 0;
      if (c.enemyStatuses.atkBuff > 0) c.enemyStatuses.atkBuff--;
      const prevSp = this.state.spiritLevel || 0;
      this.state.spiritLevel = Math.min(3, prevSp + 1);
      this.recalcStats(false);
      const spNames = ["無色刃", "白刃(+8%攻)", "黃刃(+16%攻)", "紅刃極意(+25%攻)"];
      const counterDmg = Math.max(14, Math.round(this.getComputedStats().atk * 1.22));
      c.enemyHp = Math.max(0, c.enemyHp - counterDmg);
      this.damageEnemyShield(1);
      this.state.burst = Math.min(100, this.state.burst + 22);
      this.state.stats.foresightCounters = (this.state.stats.foresightCounters || 0) + 1;
      c.fx = { text: `氣刃大迴旋! -${counterDmg} [${spNames[this.state.spiritLevel]}]`, color: "#f43f5e", ticks: 32 };
      this.rtPop(counterDmg, "#f43f5e", "enemy", true);
      rt.freeze = 0.14;
      c.shake = 16;
      c.slashAnim = 16;
      if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("burst");
      c.log.push(
        `[太刀見切成功!] 翻滾閃過【${intent.label}】，順勢氣刃大迴旋造成 ${counterDmg} 點傷害、擊碎 1 點護盾，氣刃升階至【${spNames[this.state.spiritLevel]}】！`
      );
      if (c.enemyHp <= 0) this.winCombat();
      return;
    }

    let raw = c.enemyAtk * (intent.mult || 1.0);
    if (c.enemyStatuses.atkBuff > 0) {
      raw *= 1.35;
      c.enemyStatuses.atkBuff--;
    }
    if (c.enemyStatuses.weaken > 0) raw *= 0.7;
    let dmg = Math.max(4, raw - comp.def * 0.65) * RT_ENEMY_DMG;
    if (c.playerStatuses.vuln > 0) dmg *= 1.3;

    // 星紋障壁：展開 0.35 秒內承受攻擊 = 完美防反
    const guarding = rt.guardT > 0;
    const perfect = guarding && rt.guardAge <= 0.35;
    if (guarding) dmg *= 0.55;
    dmg = Math.round(dmg);

    let blocked = 0;
    if (c.playerArmor > 0) {
      blocked = Math.min(c.playerArmor, dmg);
      c.playerArmor -= blocked;
      dmg -= blocked;
    }
    this.state.hp = Math.max(0, this.state.hp - dmg);
    rt.taken = (rt.taken || 0) + dmg;
    this.state.burst = Math.min(100, this.state.burst + 12);
    rt.fleeT = 0;
    rt.combo = 0;
    rt.freeze = Math.max(rt.freeze || 0, 0.08);
    this.rtPop(`-${dmg}`, "#ef4444", "hero", true);
    if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("hit");
    c.log.push(
      `[敵方攻擊] ${c.name} 施展【${intent.label}】，造成 ${dmg} 點傷害${blocked > 0 ? `（護甲抵擋 ${blocked} 點）` : ""}！`
    );
    if (intent.debuff) {
      c.playerStatuses[intent.debuff] = (c.playerStatuses[intent.debuff] || 0) + 2;
    }

    if (this.state.hp > 0 && perfect && isHeavyOrBuffed) {
      const counterDmg = Math.max(10, Math.round(comp.atk * 1.05));
      c.enemyHp = Math.max(0, c.enemyHp - counterDmg);
      this.damageEnemyShield(1);
      this.state.burst = Math.min(100, this.state.burst + 20);
      this.state.stats.perfectCounters = (this.state.stats.perfectCounters || 0) + 1;
      c.fx = { text: `PERFECT COUNTER! -${counterDmg}`, color: "#facc15", ticks: 30 };
      this.rtPop(counterDmg, "#facc15", "enemy", true);
      c.shake = 14;
      if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("burst");
      c.log.push(`[完美防反 COUNTER!] 精準架開強擊，回敬 ${counterDmg} 點傷害、擊碎 1 點護盾並獲得 +20 極限星能！`);
      if (c.enemyHp <= 0) {
        this.winCombat();
        return;
      }
    }
    if (this.state.hp <= 0) this.loseCombat();
  },

  // 每 RT_BEAT 秒的持續效果結算：星靈協同、灼燒、狀態遞減、再生、回魔
  rtBeat() {
    const c = this.combat;
    const rt = c.rt;
    const comp = this.getComputedStats();
    rt.beatN++;
    c.turn = rt.beatN;
    c.companionCharge = Math.min(100, (c.companionCharge || 0) + 6);

    if (rt.beatN % 2 === 0) {
      const petId = this.state.companion || "lumi";
      if (petId === "lumi") {
        const heal = Math.max(6, Math.round(this.state.maxHp * 0.08));
        this.state.hp = Math.min(this.state.maxHp, this.state.hp + heal);
        this.state.mp = Math.min(this.state.maxMp, this.state.mp + 5);
        this.rtPop(`+${heal}`, "#4ade80", "hero");
      } else if (petId === "oliver") {
        if (c.enemyShield > 0) this.damageEnemyShield(1);
      } else if (petId === "iggy") {
        const fireDmg = Math.max(8, Math.round(comp.atk * 0.45));
        c.enemyHp = Math.max(0, c.enemyHp - fireDmg);
        if (Math.random() < 0.5) c.enemyStatuses.burn = (c.enemyStatuses.burn || 0) + 2;
      } else if (petId === "sera") {
        c.playerArmor += 16;
        this.state.burst = Math.min(100, this.state.burst + 12);
      }
      if (c.enemyHp <= 0) {
        this.winCombat();
        return;
      }
    }

    if (c.enemyStatuses.burn > 0) {
      const burnDmg = Math.max(8, Math.round(c.enemyMaxHp * 0.05));
      c.enemyHp = Math.max(0, c.enemyHp - burnDmg);
      c.enemyStatuses.burn--;
      if (c.enemyHp <= 0) {
        this.winCombat();
        return;
      }
    }
    if (c.enemyStatuses.weaken > 0) c.enemyStatuses.weaken--;
    if (c.enemyStatuses.vuln > 0) c.enemyStatuses.vuln--;

    if (c.playerStatuses.regen > 0) {
      this.state.hp = Math.min(this.state.maxHp, this.state.hp + Math.round(this.state.maxHp * 0.1));
      c.playerStatuses.regen--;
    }
    if (c.playerStatuses.burn > 0) {
      this.state.hp = Math.max(1, this.state.hp - Math.max(5, Math.round(this.state.maxHp * 0.05)));
      c.playerStatuses.burn--;
    }
    if (c.playerStatuses.weaken > 0) c.playerStatuses.weaken--;
    if (c.playerStatuses.vuln > 0) c.playerStatuses.vuln--;
    this.state.mp = Math.min(this.state.maxMp, this.state.mp + comp.mpRegen);
  },

  // 魔物追擊：以 BFS 尋路 (8 方向、不穿牆角)，繞過牆體與障礙，找不到路時原地等待
  rtMonsterStep() {
    const rt = this.combat.rt;
    const hx = this.state.x, hy = this.state.y;
    const key = (x, y) => y * 4096 + x;
    const prev = new Map([[key(rt.mx, rt.my), null]]);
    const queue = [[rt.mx, rt.my]];
    let goal = null;
    for (let qi = 0; qi < queue.length && qi < 900 && !goal; qi++) {
      const [cx, cy] = queue[qi];
      for (let dy = -1; dy <= 1 && !goal; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          const x = cx + dx, y = cy + dy;
          if (prev.has(key(x, y))) continue;
          if (dx && dy && (!this.rtWalkable(cx + dx, cy) || !this.rtWalkable(cx, cy + dy))) continue;
          if (x === hx && y === hy) { prev.set(key(x, y), [cx, cy]); goal = [x, y]; break; }
          if (!this.rtWalkable(x, y)) continue;
          prev.set(key(x, y), [cx, cy]);
          queue.push([x, y]);
        }
      }
    }
    if (!goal) return;
    // 回溯到第一步 (不踩到主角所在格)
    let cur = goal;
    let p = prev.get(key(cur[0], cur[1]));
    while (p && !(p[0] === rt.mx && p[1] === rt.my)) {
      cur = p;
      p = prev.get(key(cur[0], cur[1]));
    }
    if (cur[0] === hx && cur[1] === hy) return;
    rt.mx = cur[0];
    rt.my = cur[1];
  },

  rtMonsterAI(dt) {
    const c = this.combat;
    const rt = c.rt;
    const m = rt.m;
    // 瀕死疲憊：生命低於 25% 動作遲緩 (行動間隔 +25%)，給玩家收尾的空檔
    const tired = c.enemyHp < c.enemyMaxHp * 0.25;
    if (tired && !rt.tiredShown) {
      rt.tiredShown = true;
      this.rtPop("疲憊", "#fbbf24", "enemy", true);
      c.log.push(`[疲憊] ${c.name} 氣喘吁吁、動作變得遲緩，正是收尾的好時機！`);
    }
    const speed = (c.enraged ? 0.8 : 1) * (tired ? 1.25 : 1);

    if (c.brokenThisTurn || rt.stunT > 0) {
      m.state = "stun";
      rt.stunT -= dt;
      if (rt.stunT <= 0) {
        if (c.brokenThisTurn) {
          c.brokenThisTurn = false;
          c.enemyShield = c.enemyMaxShield;
          rt.shieldImmuneT = c.isBoss ? 12 : c.isElite ? 9 : 6;
          c.log.push(`[護盾重組] ${c.name} 從破盾狀態中恢復，護盾硬化，${rt.shieldImmuneT} 秒內無法再被打破！`);
        }
        m.state = "recover";
        m.t = 0.5;
      }
      return;
    }

    m.stepT -= dt;
    if (m.state === "idle" || m.state === "recover") {
      m.t -= dt;
      if (m.t <= 0) m.state = "chase";
      return;
    }

    if (m.state === "chase") {
      const intent = c.intents[c.intentIndex % c.intents.length];
      const buffOnly = intent.type === "charge" || intent.type === "shield";
      const plan = buffOnly ? { windup: 0.8, zone: null } : this.rtPlanAttack(intent);
      if (plan) {
        m.state = "windup";
        m.intent = intent;
        m.windupMax = plan.windup * speed;
        m.t = m.windupMax;
        m.zone = plan.zone;
        m.proj = !!plan.proj;
        m.rush = !!plan.rush;
      } else if (m.stepT <= 0) {
        this.rtMonsterStep();
        m.stepT = (c.isBoss ? 0.62 : 0.5) * speed;
      }
      return;
    }

    if (m.state === "windup") {
      m.t -= dt;
      if (m.t > 0) return;
      const intent = m.intent;
      if (intent.type === "charge") {
        c.enemyStatuses.atkBuff = 2;
        c.log.push(`[敵方蓄力] ${c.name} 發動【${intent.label}】，下一擊威力大幅提升！`);
      } else if (intent.type === "shield") {
        if (intent.heal) c.enemyHp = Math.min(c.enemyMaxHp, c.enemyHp + intent.heal);
        c.enemyShield = Math.min(c.enemyMaxShield, c.enemyShield + (intent.shieldAdd || 1));
        c.log.push(`[敵方防禦] ${c.name} 施展【${intent.label}】，修復了護盾！`);
      } else {
        c.slashAnim = 0;
        m.lunge = 10;
        if (m.rush) this.rtRushMonster(m.zone);
        this.rtResolveStrike(intent, m.zone);
        if (!this.combat) return;
      }
      c.intentIndex = (c.intentIndex + 1) % c.intents.length;
      m.state = "recover";
      m.t = (intent.type === "heavy" ? 1.1 : 0.8) * speed;
      m.zone = null;
      m.proj = false;
      m.rush = false;
    }
  },

  // 每幀推進 (dt 單位：秒)
  rtUpdate(dt) {
    const c = this.combat;
    if (!c || !c.rt) return;
    dt = Math.min(dt, 0.1);
    const rt = c.rt;
    // 打擊停頓 (Hit-stop)：命中瞬間短暫凍結戰鬥推進，強化打擊感
    if (rt.freeze > 0) {
      rt.freeze -= dt;
      return;
    }
    rt.elapsed = (rt.elapsed || 0) + dt;
    // 連擊計數：3 秒內未再命中則歸零（純顯示，不影響傷害）
    if (rt.comboT > 0) {
      rt.comboT -= dt;
      if (rt.comboT <= 0) rt.combo = 0;
    }
    for (const k of ["gcd", "moveCd", "dodgeCd", "potionCd", "sharpenCd", "ivT", "guardT", "flinchCd", "lockT", "shieldImmuneT"]) {
      if (rt[k] > 0) rt[k] = Math.max(0, rt[k] - dt);
    }
    for (const k of Object.keys(rt.cd)) {
      if (rt.cd[k] > 0) rt.cd[k] = Math.max(0, rt.cd[k] - dt);
    }
    rt.guardAge += dt;
    c.playerGuarding = rt.guardT > 0;

    if (rt.auto) this.autoBattleStep();
    if (!this.combat) return;

    rt.beatT += dt;
    while (rt.beatT >= RT_BEAT && this.combat) {
      rt.beatT -= RT_BEAT;
      this.rtBeat();
    }
    if (!this.combat) return;

    this.rtMonsterAI(dt);
    if (!this.combat) return;

    if (rt.fleeT > 0) {
      rt.fleeT -= dt;
      if (rt.fleeT <= 0) this.rtFinishFlee();
    }
  },

  rtFinishFlee() {
    this.combat = null;
    if (typeof window !== "undefined" && window.soundSystem) {
      window.soundSystem.startBGM("explore", this.state.chapter);
    }
    this.log("[戰術撤退] 你拉開距離，成功擺脫魔物。", "info");
  },

  // 智能自動戰鬥：預警時翻滾、血低時補血、其餘依弱點選招，距離不足則靠近
  autoBattleStep() {
    const c = this.combat;
    if (!c || !c.rt) return { ok: false };
    const s = this.state;
    const rt = c.rt;
    const tryRes = r => r && r.ok;

    const m = rt.m;
    if (m.state === "windup" && m.zone && rt.dodgeCd <= 0 && s.mp >= 10) {
      if (this.rtDist(s.x, s.y, m.zone.x, m.zone.y) <= m.zone.r && m.t < 0.45) {
        return this.castForesightSlash();
      }
    }
    if ((s.polishTurns || 0) <= 0 && (typeof s.sharpness === "number" ? s.sharpness : 100) < 32 && rt.sharpenCd <= 0) {
      return this.sharpenWeapon();
    }
    if (s.hp < s.maxHp * 0.4) {
      if (s.unlockedSkills.includes("starlight_mend") && s.mp >= 24 && tryRes(this.executeSkill("starlight_mend"))) return { ok: true };
      if ((s.inventory.healing_potion || 0) > 0 && tryRes(this.useItem("healing_potion"))) return { ok: true };
    }
    if ((c.companionCharge || 0) >= 100) {
      const r = this.castCompanionSkill();
      if (r.combatEnded) return r;
    }
    if (s.burst >= 100 && s.unlockedSkills.includes("astral_judgment") && tryRes(this.executeSkill("astral_judgment"))) return { ok: true };

    const weaks = c.weaknesses || [];
    if (weaks.length > 0 && s.weaponElement !== weaks[0]) s.weaponElement = weaks[0];
    const offensive = ["void_pierce", "magma_eruption", "glacier_lance", "lunar_crescent", "flame_cleave", "heavy_thrust", "frost_nova", "star_bolt"];
    const usable = offensive.filter(id => {
      const sk = this.data.skills[id];
      return sk && s.unlockedSkills.includes(id) && s.mp >= (sk.mpCost || 0) && !(rt.cd[id] > 0);
    });
    const typeOf = id => {
      const sk = this.data.skills[id];
      return id === "heavy_thrust" ? (s.weaponElement || sk.type) : sk.type;
    };
    const ordered = usable.filter(id => weaks.includes(typeOf(id))).concat(usable);
    for (const id of ordered) {
      if (tryRes(this.executeSkill(id))) return { ok: true };
    }
    if (!(rt.cd.slash > 0) && rt.gcd <= 0) {
      const r = this.executeSkill("slash");
      if (r.ok) return r;
    }
    // 無法出招：向魔物靠近
    if (this.rtHeroDist() > 1.5) this.rtMoveToward();
    return { ok: false };
  },

  rtMoveToward() {
    const rt = this.combat.rt;
    const s = this.state;
    const dx = Math.sign(rt.mx - s.x), dy = Math.sign(rt.my - s.y);
    const opts = Math.abs(rt.mx - s.x) >= Math.abs(rt.my - s.y) ? [[dx, 0], [0, dy]] : [[0, dy], [dx, 0]];
    for (const [ox, oy] of opts) {
      if ((ox || oy) && this.rtMove(ox, oy).moved) return true;
    }
    return false;
  }
};

if (typeof window !== "undefined") window.StarfallRT = StarfallRT;
if (typeof module !== "undefined" && module.exports) module.exports = { StarfallRT };
