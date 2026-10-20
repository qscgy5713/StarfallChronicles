/**
 * 即時戰鬥介面 (Real-time Combat UI)
 * 以 mixin 掛到 GameUI.prototype：戰鬥 HUD、鍵盤持續走位、魔物/預警範圍/技能特效繪製。
 */
const RT_ELEM_COLORS = {
  physical: "#e2e8f0", star: "#38bdf8", fire: "#fb923c", frost: "#7dd3fc", void: "#c084fc", ultimate: "#facc15"
};
const RT_ELEM_NAMES = { physical: "物理", star: "星輝", fire: "烈焰", frost: "寒霜", void: "虛空" };
const RT_MOVE_KEYS = {
  ArrowUp: [0, -1], w: [0, -1], W: [0, -1],
  ArrowDown: [0, 1], s: [0, 1], S: [0, 1],
  ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0],
  ArrowRight: [1, 0], d: [1, 0], D: [1, 0]
};

const GameUIRT = {
  // ---------- 狀態同步 ----------
  syncCombatMode() {
    const c = this.engine.combat;
    const hud = document.getElementById("rt-hud");
    if (document.body) document.body.classList.toggle("in-combat", !!c);
    if (!hud || !hud.querySelectorAll) return; // 無完整 DOM (如單元測試) 時略過
    hud.classList.add("active"); // 技能列平時也常駐於底部
    const s = this.engine.state;
    const sig = s.unlockedSkills.join(",") + "|" + Object.keys(s.inventory).filter(id => {
      const it = this.engine.data.items[id];
      return it && it.usableInCombat && s.inventory[id] > 0;
    }).join(",");
    if (this._hotbarSig !== sig) {
      this._hotbarSig = sig;
      this.buildHotbar();
    }
    if (!c) {
      this._rtRef = null;
      this._rtDirs = [];
      const strip = document.getElementById("rt-strip");
      if (strip) this._setHtml(strip, "");
      this.updateRtSlots();
      return;
    }
    if (this._rtRef !== c) {
      this._rtRef = c;
      this._mfx = c.rt.mx;
      this._mfy = c.rt.my;
      this._rtLogLen = -1;
      this.buildMonsterPanel();
    }
    this.updateRtHud();
  },

  buildMonsterPanel() {
    const c = this.engine.combat;
    const top = document.getElementById("rt-top");
    const tag = c.isBoss ? `<span class="rt-badge boss">首領</span>` : c.isElite ? `<span class="rt-badge elite">精英</span>` : "";
    const weak = (c.weaknesses || []).map(w => RT_ELEM_NAMES[w] || w).join(" / ") || "無";
    top.innerHTML = `
      <div class="rt-mon">
        <div class="rt-mon-head">
          <span class="rt-mon-name">${this.px.icon(c.icon, 24)} ${c.name} ${tag}</span>
          <span class="rt-weak">弱點：${weak}</span>
          <span id="rt-state" class="rt-state"></span>
        </div>
        <div class="rt-bar"><i id="rt-hp"></i><b id="rt-hp-text"></b></div>
        <div class="rt-mon-row">
          <span id="rt-shields" class="rt-shields"></span>
          <span class="rt-parts">
            ${["head", "body", "tail"].map(k => `<button class="rt-part" data-part="${k}" onclick="window.gameUI.onSelectMonsterPartClick('${k}')"></button>`).join("")}
          </span>
        </div>
        <div id="rt-pills" class="rt-pills"></div>
      </div>`;
  },

  // 底部常駐技能列：探索與戰鬥共用，戰鬥時才有冷卻與距離判定
  buildHotbar() {
    const s = this.engine.state;
    const bottom = document.getElementById("rt-bottom");
    const slotHtml = (key, icon, name, sub, attrs) =>
      `<button class="rt-slot" ${attrs}><span class="rt-key">${key}</span>${icon ? this.px.icon(icon, 22) : ""}<span class="rt-slot-name">${name}</span><span class="rt-slot-sub">${sub}</span><u></u></button>`;
    const skills = s.unlockedSkills
      .map((id, i) => {
        const sk = this.engine.data.skills[id];
        if (!sk) return "";
        const cost = sk.burstCost ? `${sk.burstCost}%極限` : sk.mpCost ? `${sk.mpCost}MP` : sk.id === "slash" ? "+MP" : "免費";
        return slotHtml(i + 1, sk.icon, sk.name, cost, `data-sk="${id}" onclick="window.gameUI.onCombatSkillClick('${id}')" title="${sk.desc}"`);
      })
      .join("");
    const items = Object.entries(s.inventory)
      .map(([id, cnt]) => ({ item: this.engine.data.items[id], cnt, id }))
      .filter(x => x.item && x.item.usableInCombat && x.cnt > 0)
      .map(x => slotHtml("", x.item.icon, x.item.name, `x${x.cnt}`, `data-item="${x.id}" onclick="window.gameUI.onUseItemClick('${x.id}')" title="${this.getShortStatSummary(x.item)}"`))
      .join("");
    bottom.innerHTML = `
      <div id="rt-strip" class="rt-strip"></div>
      <div class="rt-slots">
        ${skills}
        <span class="rt-sep"></span>
        ${slotHtml("X", "icon_def", "見切翻滾", "10MP", `data-act="dodge" onclick="window.gameUI.onForesightSlashClick()" title="朝移動方向翻滾 2 格並短暫無敵；無敵時被擊中會發動氣刃大迴旋"`)}
        ${slotHtml("C", "", "星靈協同", "", `data-act="comp" onclick="window.gameUI.onCompanionSkillClick()" title="協同能量滿 100% 後施放"`)}
        ${slotHtml("R", "icon_atk", "砥石磨刀", "", `data-act="sharpen" onclick="window.gameUI.onSharpenWeaponClick()" title="恢復紫斬並獲得剛刃研磨"`)}
        ${slotHtml("E", "crystal", "附魔", "", `data-act="elem" onclick="window.gameUI.onWeaponElementClick()" title="切換武器屬性"`)}
        ${items}
        <span class="rt-sep"></span>
        ${slotHtml("T", "", "自動戰鬥", "", `data-act="auto" onclick="window.gameUI.toggleRtAuto()" title="由系統自動走位與出招"`)}
        ${slotHtml("F", "", "撤退", "", `data-act="flee" onclick="window.gameUI.onFleeClick()" title="持續 1.6 秒不被擊中即可脫離（首領戰不可撤退）"`)}
      </div>`;
    this._rtSlots = {};
    bottom.querySelectorAll(".rt-slot").forEach(el => {
      const k = el.dataset.sk ? "sk:" + el.dataset.sk : el.dataset.item ? "item:" + el.dataset.item : "act:" + el.dataset.act;
      this._rtSlots[k] = el;
    });
  },

  updateRtHud() {
    const c = this.engine.combat;
    if (!c || !c.rt) return;
    const rt = c.rt;
    const s = this.engine.state;
    const $ = id => document.getElementById(id);

    const pct = Math.max(0, Math.min(100, (c.enemyHp / c.enemyMaxHp) * 100));
    $("rt-hp").style.width = pct + "%";
    $("rt-hp-text").textContent = `${c.enemyHp} / ${c.enemyMaxHp}`;
    let sh = "";
    for (let i = 0; i < c.enemyMaxShield; i++) {
      sh += `<span class="shield-pip ${i < c.enemyShield ? "filled" : "empty"}">${this.px.icon("icon_def", 14)}</span>`;
    }
    if ($("rt-shields").dataset.k !== `${c.enemyShield}/${c.enemyMaxShield}`) {
      $("rt-shields").innerHTML = sh;
      $("rt-shields").dataset.k = `${c.enemyShield}/${c.enemyMaxShield}`;
    }
    document.querySelectorAll("#rt-top .rt-part").forEach(el => {
      const p = c.parts[el.dataset.part];
      const active = (c.targetPart || "body") === el.dataset.part;
      el.className = `rt-part${active ? " on" : ""}${p.broken ? " broken" : ""}`;
      el.textContent = `${p.name} ${p.broken ? "破壞" : Math.round((p.hp / p.maxHp) * 100) + "%"}`;
      el.title = p.desc;
    });

    const m = rt.m;
    let st = "追擊中";
    if (m.state === "windup") st = m.zone ? `[預警] ${m.intent.label}` : `[準備] ${m.intent.label}`;
    else if (m.state === "stun") st = "[暈眩] 全力輸出!";
    else if (m.state === "recover") st = "收招中 (攻擊時機)";
    else if (m.state === "idle") st = "對峙";
    const stEl = $("rt-state");
    stEl.textContent = st;
    stEl.className = "rt-state" + (m.state === "windup" ? " warn" : m.state === "stun" ? " stun" : "");

    const pills = [];
    if (c.enraged) pills.push(`<span class="status-pill burn">紅蓮憤怒</span>`);
    if (c.brokenThisTurn) pills.push(`<span class="status-pill break">BREAK 易傷+40%</span>`);
    if (c.enemyStatuses.burn > 0) pills.push(`<span class="status-pill burn">灼燒</span>`);
    if (c.enemyStatuses.weaken > 0) pills.push(`<span class="status-pill weaken">虛弱</span>`);
    if (c.enemyStatuses.vuln > 0) pills.push(`<span class="status-pill vuln">易傷</span>`);
    if (c.enemyStatuses.atkBuff > 0) pills.push(`<span class="status-pill buff">蓄力強化</span>`);
    this._setHtml($("rt-pills"), pills.join(" "));

    const strip = [];
    if (this.engine.getSharpnessTierInfo) {
      const shp = this.engine.getSharpnessTierInfo();
      strip.push(`<span class="status-pill buff" style="border-color:${shp.color};color:${shp.color};">斬味:${shp.label} x${shp.mult}</span>`);
    }
    const spNames = ["", "白刃+8%", "黃刃+16%", "紅刃+25%"];
    if ((s.spiritLevel || 0) > 0) strip.push(`<span class="status-pill burn">氣刃:${spNames[s.spiritLevel]}</span>`);
    if (c.playerArmor > 0) strip.push(`<span class="status-pill armor">護甲 ${c.playerArmor}</span>`);
    if (c.lastElement) strip.push(`<span class="status-pill vuln">前招:${RT_ELEM_NAMES[c.lastElement] || "奧義"} (換屬性可連攜)</span>`);
    if (rt.guardT > 0) strip.push(`<span class="status-pill armor">障壁展開</span>`);
    if (rt.fleeT > 0) strip.push(`<span class="status-pill weaken">撤退中 ${rt.fleeT.toFixed(1)}s</span>`);
    if (rt.auto) strip.push(`<span class="status-pill regen">自動戰鬥</span>`);
    ["regen", "burn", "weaken", "vuln"].forEach(k => {
      if (c.playerStatuses[k] > 0) {
        const nm = { regen: "再生", burn: "灼燒", weaken: "虛弱", vuln: "易傷" }[k];
        strip.push(`<span class="status-pill ${k}">${nm}</span>`);
      }
    });
    this._setHtml($("rt-strip"), strip.join(" "));

    this.updateRtSlots();

    if (this._rtLogLen !== c.log.length) {
      this._rtLogLen = c.log.length;
      $("rt-log").innerHTML = c.log.slice(-3).map(l => `<div>${l}</div>`).join("");
    }
  },

  _setHtml(el, html) {
    if (el._h !== html) {
      el.innerHTML = html;
      el._h = html;
    }
  },

  updateRtSlots() {
    if (!this._rtSlots) return;
    const c = this.engine.combat;
    const rt = c && c.rt;
    const s = this.engine.state;
    const dist = rt ? this.engine.rtHeroDist() : 0;
    const cdOf = (el, rem, max, off) => {
      el.querySelector("u").style.height = rem > 0 ? Math.min(100, (rem / max) * 100) + "%" : "0%";
      el.classList.toggle("off", !!off);
    };
    for (const [k, el] of Object.entries(this._rtSlots)) {
      const [kind, id] = k.split(":");
      if (kind === "sk") {
        const sk = this.engine.data.skills[id];
        if (!sk) continue;
        const lack = (sk.mpCost && s.mp < sk.mpCost) || (sk.burstCost && s.burst < sk.burstCost);
        const range = this.engine.rtSkillRange(sk);
        const far = !!rt && sk.type !== "defense" && sk.type !== "heal" && dist > (range < 2 ? 4.2 : range);
        cdOf(el, rt ? rt.cd[id] || 0 : 0, this.engine.rtSkillCd(sk), lack || far);
        el.classList.toggle("far", far && !lack);
        const effType = (id === "slash" || id === "heavy_thrust") && s.weaponElement ? s.weaponElement : sk.type;
        el.classList.toggle("weak", !!(c && c.weaknesses && c.weaknesses.includes(effType)) && sk.type !== "defense" && sk.type !== "heal");
      } else if (kind === "item") {
        const cnt = s.inventory[id] || 0;
        cdOf(el, rt ? rt.potionCd : 0, 1.2, cnt <= 0);
        el.querySelector(".rt-slot-sub").textContent = `x${cnt}`;
      } else if (id === "dodge") {
        cdOf(el, rt ? rt.dodgeCd : 0, 1.0, !rt || s.mp < 10);
      } else if (id === "comp") {
        const ch = c ? c.companionCharge || 0 : 0;
        el.querySelector(".rt-slot-sub").textContent = c ? `${ch}%` : "";
        el.classList.toggle("ready", ch >= 100);
        cdOf(el, 100 - ch, 100, !c || ch < 100);
      } else if (id === "sharpen") {
        cdOf(el, rt ? rt.sharpenCd : 0, 6, false);
      } else if (id === "elem") {
        el.querySelector(".rt-slot-sub").textContent = RT_ELEM_NAMES[s.weaponElement || "physical"];
      } else if (id === "auto") {
        el.classList.toggle("ready", !!(rt && rt.auto));
        el.classList.toggle("off", !c);
      } else if (id === "flee") {
        el.classList.toggle("off", !c || !!c.isBoss);
      }
    }
  },

  // ---------- 操作 ----------
  onCompanionSkillClick() {
    const res = this.engine.castCompanionSkill();
    if (!res.ok && res.msg) this.showToast(res.msg, "warn");
    this.renderAll();
  },

  toggleRtAuto() {
    const c = this.engine.combat;
    if (!c || !c.rt) return;
    c.rt.auto = !c.rt.auto;
    this.showToast(c.rt.auto ? "自動戰鬥開啟" : "自動戰鬥關閉", "teal");
  },

  onCombatSkillClick(skillId) {
    if (!this.engine.combat) return this.onFieldSkill(skillId);
    const res = this.engine.executeSkill(skillId);
    if (!res.ok && res.msg) this.showToast(res.msg, "warn");
    if (!this.engine.combat) this.renderAll();
  },

  // 探索中使用技能列：治療技能可直接施放，其餘技能揮出劍氣示意 (不消耗資源)
  onFieldSkill(skillId) {
    const sk = this.engine.data.skills[skillId];
    if (!sk) return;
    if (sk.type === "heal") {
      const res = this.engine.castFieldHeal(skillId);
      if (!res.ok && res.msg) this.showToast(res.msg, "warn");
      this.renderAll();
      return;
    }
    // 攻擊技能：附近有魔物就直接出招開戰 (近戰最遠自動衝刺 4.2 格、魔法依射程)
    if (sk.type !== "defense") {
      const range = this.engine.rtSkillRange(sk);
      const reach = range < 2 ? 4.2 : range;
      const target = this.engine.findNearestEnemy(reach);
      if (target) {
        this.engine.startCombat(target.ev, target.coord);
        this.renderAll();
        const res = this.engine.executeSkill(skillId);
        if (!res.ok && res.msg) this.showToast(res.msg, "warn");
        if (!this.engine.combat) this.renderAll();
        return;
      }
    }
    this._swing = { ticks: 14, max: 14, color: RT_ELEM_COLORS[sk.type === "ultimate" ? "ultimate" : sk.type] || "#e2e8f0" };
    if (window.soundSystem) window.soundSystem.sfx("slash");
    if (!this._swingToastAt || performance.now() - this._swingToastAt > 6000) {
      this._swingToastAt = performance.now();
      this.showToast("附近沒有魔物；靠近魔物按攻擊鍵即可出招開戰", "teal");
    }
  },

  drawFieldSwing(ctx, hx, hy, ts) {
    const sw = this._swing;
    if (!sw || sw.ticks <= 0) return;
    const prog = 1 - sw.ticks / sw.max;
    ctx.save();
    ctx.strokeStyle = sw.color;
    ctx.globalAlpha = 1 - prog;
    ctx.lineWidth = 5 - prog * 3;
    ctx.beginPath();
    ctx.arc(hx + ts / 2, hy + ts / 2, ts * (0.5 + prog * 0.5), -2.2 + prog * 1.4, -0.4 + prog * 1.4);
    ctx.stroke();
    ctx.restore();
    sw.ticks--;
  },

  onUseItemClick(itemId) {
    const res = this.engine.useItem(itemId);
    if (!res.ok && res.msg) this.showToast(res.msg, "warn");
    else if (res.ok && res.msg) this.showToast(`[使用道具] ${res.msg}`, "teal");
    this.renderAll();
  },

  onFleeClick() {
    if (!this.engine.fleeCombat()) this.showToast("首領戰無法撤退！", "warn");
  },

  // 戰鬥中的鍵盤：回傳 true 表示已處理
  handleCombatKey(e) {
    const c = this.engine.combat;
    if (RT_MOVE_KEYS[e.key]) {
      e.preventDefault();
      const d = RT_MOVE_KEYS[e.key];
      this._rtDirs = (this._rtDirs || []).filter(x => x !== d);
      this._rtDirs.push(d);
      return true;
    }
    const k = e.key.toLowerCase();
    if (e.repeat && k !== "w" && k !== "a" && k !== "s" && k !== "d") return true;
    if (k === "c") this.onCompanionSkillClick();
    else if (k === "x") this.onForesightSlashClick();
    else if (k === "f") this.onFleeClick();
    else if (k === "t") this.toggleRtAuto();
    else if (k === "z") {
      const order = ["head", "body", "tail"];
      this.onSelectMonsterPartClick(order[(order.indexOf(c.targetPart || "body") + 1) % 3]);
    } else if (e.key === " ") this.onCombatSkillClick("slash");
    else {
      const idx = parseInt(e.key, 10) - 1;
      if (idx >= 0 && idx < this.engine.state.unlockedSkills.length) this.onCombatSkillClick(this.engine.state.unlockedSkills[idx]);
      else return false;
    }
    e.preventDefault();
    return true;
  },

  // 探索中的技能列快捷鍵 (1~9、Space)：回傳 true 表示已處理
  handleFieldSkillKey(e) {
    if (e.repeat) return false;
    if (e.key === " ") {
      this.onCombatSkillClick("slash");
      return true;
    }
    const idx = parseInt(e.key, 10) - 1;
    if (idx >= 0 && idx < this.engine.state.unlockedSkills.length) {
      this.onCombatSkillClick(this.engine.state.unlockedSkills[idx]);
      return true;
    }
    return false;
  },

  handleCombatKeyUp(e) {
    const d = RT_MOVE_KEYS[e.key];
    if (d && this._rtDirs) this._rtDirs = this._rtDirs.filter(x => x !== d);
  },

  // 每幀推進即時戰鬥 (dt 秒)
  rtTick(dt) {
    const eng = this.engine;
    if (!eng.combat) {
      if (this._rtRef) this.renderAll();
      return;
    }
    if (!this._rtRef) this.syncCombatMode();
    if (document.querySelector(".modal-overlay.active")) return;
    const dirs = this._rtDirs || [];
    if (dirs.length && !eng.combat.rt.auto) {
      const [dx, dy] = dirs[dirs.length - 1];
      eng.rtMove(dx, dy);
    }
    eng.rtUpdate(dt);
    if (!eng.combat) {
      this.renderAll();
      return;
    }
    this.updateRtHud();
    this._hudTick = (this._hudTick || 0) + 1;
    if (this._hudTick % 6 === 0) this.renderHUD();
  },

  // ---------- 繪製 ----------
  drawRtMonster(ctx, ts, ox, oy, frame2) {
    const c = this.engine.combat;
    const rt = c.rt;
    const m = rt.m;
    this._mfx += (rt.mx - this._mfx) * 0.22;
    this._mfy += (rt.my - this._mfy) * 0.22;
    const gx = this._mfx * ts + ox;
    const gy = this._mfy * ts + oy;
    const cx = gx + ts / 2;
    const cy = gy + ts / 2;
    const af = this.animFrame;

    // 預警範圍：由內向外填滿，填滿瞬間命中
    if (m.state === "windup" && m.zone) {
      const prog = 1 - m.t / m.windupMax;
      const zx = m.zone.x * ts + ts / 2 + ox;
      const zy = m.zone.y * ts + ts / 2 + oy;
      const r = m.zone.r * ts;
      ctx.save();
      ctx.fillStyle = `rgba(239, 68, 68, ${0.1 + 0.16 * prog})`;
      ctx.beginPath(); ctx.arc(zx, zy, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(248, 113, 113, ${0.18 + 0.3 * prog})`;
      ctx.beginPath(); ctx.arc(zx, zy, r * prog, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(254, 202, 202, 0.95)";
      ctx.lineWidth = 2;
      ctx.setLineDash([7, 5]);
      ctx.beginPath(); ctx.arc(zx, zy, r, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }

    let offX = 0, offY = 0;
    if (m.lunge > 0) {
      const dx = this.engine.state.x - rt.mx, dy = this.engine.state.y - rt.my;
      const len = Math.hypot(dx, dy) || 1;
      const k = Math.sin((m.lunge / 10) * Math.PI) * ts * 0.4;
      offX = (dx / len) * k;
      offY = (dy / len) * k;
      m.lunge -= 0.5;
    }
    if (m.state === "windup") {
      offX += (Math.random() - 0.5) * 3;
      offY += (Math.random() - 0.5) * 2;
    }
    if (c.shake > 0) offX += (Math.random() - 0.5) * c.shake * 0.7;

    // 首領/精英的放大已由地圖物件繪製處理，這裡僅用於光環與血條位置
    const scale = c.isBoss ? 1.45 : c.isElite ? 1.25 : 1;
    ctx.save();
    ctx.translate(offX, offY);
    if (c.enraged) {
      ctx.fillStyle = `rgba(239, 68, 68, ${0.14 + 0.08 * Math.sin(af * 0.2)})`;
      ctx.beginPath(); ctx.arc(cx, cy, ts * 0.8, 0, Math.PI * 2); ctx.fill();
    }
    if (c.shake > 7) ctx.filter = "brightness(2)";
    else if (m.state === "windup") ctx.filter = "brightness(1.25) saturate(1.5)";
    const tile = this.engine.activeMap[rt.oy][rt.ox];
    this.drawPixelTileObject(ctx, tile, rt.ox, rt.oy, gx, gy, ts, frame2);
    ctx.filter = "none";
    ctx.restore();

    // 暈眩星星
    if (m.state === "stun") {
      for (let i = 0; i < 3; i++) {
        const a = af * 0.12 + i * 2.1;
        ctx.fillStyle = "#facc15";
        ctx.fillRect(cx + Math.cos(a) * ts * 0.32 - 2, cy - ts * 0.62 * scale + Math.sin(a) * 4 - 2, 5, 5);
      }
    }
    // 準備(蓄力/防禦)光環
    if (m.state === "windup" && !m.zone) {
      ctx.strokeStyle = m.intent.type === "shield" ? "#38bdf8" : "#facc15";
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(cx, cy, ts * (0.6 + 0.2 * Math.sin(af * 0.3)), 0, Math.PI * 2); ctx.stroke();
    }

    // 頭頂血條
    const bw = ts * 1.3 * Math.max(1, scale * 0.9);
    const by = cy - ts * 0.62 * scale - 10;
    ctx.fillStyle = "rgba(5, 8, 16, 0.85)";
    ctx.fillRect(cx - bw / 2 - 1, by - 1, bw + 2, 7);
    ctx.fillStyle = c.enraged ? "#ef4444" : "#f87171";
    ctx.fillRect(cx - bw / 2, by, bw * Math.max(0, c.enemyHp / c.enemyMaxHp), 5);
    for (let i = 0; i < c.enemyMaxShield; i++) {
      ctx.fillStyle = i < c.enemyShield ? "#38bdf8" : "#334155";
      ctx.fillRect(cx - bw / 2 + i * 9, by - 8, 7, 5);
    }
  },

  drawRtEffects(ctx, ts, ox, oy) {
    const c = this.engine.combat;
    const rt = c.rt;
    const s = this.engine.state;
    const mx = this._mfx * ts + ox + ts / 2;
    const my = this._mfy * ts + oy + ts / 2;
    const hx = this._hx * ts + ox + ts / 2;
    const hy = this._hy * ts + oy + ts / 2;

    if (c.projAnim && c.projAnim.ticks > 0) {
      const col = RT_ELEM_COLORS[c.projAnim.type] || "#38bdf8";
      const prog = 1 - c.projAnim.ticks / 16;
      if (c.projAnim.type !== "physical" || this.engine.rtHeroDist() > 1.7) {
        const px = hx + (mx - hx) * Math.min(1, prog * 1.6);
        const py = hy + (my - hy) * Math.min(1, prog * 1.6);
        ctx.save();
        ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.globalAlpha = 0.8;
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(px, py); ctx.stroke();
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      c.projAnim.ticks--;
    }
    if (c.slashAnim > 0) {
      const col = RT_ELEM_COLORS[c.lastElement] || "#e2e8f0";
      const prog = 1 - c.slashAnim / 16;
      ctx.save();
      ctx.strokeStyle = col; ctx.lineWidth = 5 - prog * 3; ctx.globalAlpha = 1 - prog;
      ctx.beginPath(); ctx.arc(mx, my, ts * (0.4 + prog * 0.6), -2.4 + prog * 1.2, -0.6 + prog * 1.2); ctx.stroke();
      ctx.restore();
      c.slashAnim--;
    }
    if (c.fx && c.fx.ticks > 0) {
      const rise = (34 - c.fx.ticks) * 1.1;
      ctx.font = "bold 15px 'PingFang TC', monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = "#090d16";
      ctx.fillText(c.fx.text, mx + 1, my - ts * 0.9 - rise + 1);
      ctx.fillStyle = c.fx.color;
      ctx.globalAlpha = Math.min(1, c.fx.ticks / 10);
      ctx.fillText(c.fx.text, mx, my - ts * 0.9 - rise);
      ctx.globalAlpha = 1;
      c.fx.ticks--;
    }
    if (c.shake > 0) c.shake = c.shake > 0.6 ? c.shake * 0.86 : 0;

    // 主角狀態：障壁光環、撤退讀條
    if (rt.guardT > 0) {
      ctx.strokeStyle = "rgba(56, 189, 248, 0.9)";
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(hx, hy, ts * 0.62, 0, Math.PI * 2); ctx.stroke();
    }
    if (rt.fleeT > 0) {
      ctx.fillStyle = "rgba(5, 8, 16, 0.85)";
      ctx.fillRect(hx - ts * 0.5, hy + ts * 0.62, ts, 6);
      ctx.fillStyle = "#cbd5e1";
      ctx.fillRect(hx - ts * 0.5, hy + ts * 0.62, ts * (1 - rt.fleeT / 1.6), 6);
    }
  }
};

if (typeof window !== "undefined" && window.GameUI) Object.assign(window.GameUI.prototype, GameUIRT);
if (typeof module !== "undefined" && module.exports) module.exports = { GameUIRT };
