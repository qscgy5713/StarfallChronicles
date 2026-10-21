/**
 * 觸控操作 (Touch Controls)
 * 以 mixin 掛到 GameUI.prototype：觸控裝置上顯示虛擬搖桿（左）與動作按鈕（右）。
 * 搖桿在戰鬥中等同方向鍵（持續走位），探索中則每 130ms 走一格；按鈕對應原本的鍵盤快捷鍵。
 * 技能列與地圖點擊本來就可用觸控操作，這裡補上走位與常用動作。網址加 ?touch=1 可在桌機強制顯示、?touch=0 可強制關閉。
 */
const TouchControls = {
  // 搖桿位移 → 四方向 [dx,dy]；位移小於死區回傳 null
  joystickDir(dx, dy, dead = 14) {
    if (Math.hypot(dx, dy) < dead) return null;
    return Math.abs(dx) >= Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)];
  },

  isTouchDevice() {
    if (typeof window === "undefined" || typeof document === "undefined") return false;
    const q = (window.location && window.location.search) || "";
    if (/[?&]touch=1/.test(q)) return true;
    if (/[?&]touch=0/.test(q)) return false;
    // 只看主要輸入是否為觸控 (pointer: coarse)；觸控螢幕筆電的主要輸入是滑鼠，不會誤開
    return !!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
  },

  // 動作按鈕清單：[動作代號, 文字, 大按鈕?]
  touchButtonDefs() {
    return [
      ["slash", "斬擊", true],
      ["dodge", "翻滾", true],
      ["heal", "回復", false],
      ["mana", "魔力", false],
      ["part", "部位", false],
      ["auto", "自動", false],
      ["flee", "撤退", false],
      ["coop", "協同", false],
      ["pulse", "脈衝", false]
    ];
  },

  // 觸控按鈕的行為：與鍵盤快捷鍵共用同樣的處理函式；戰鬥專用按鈕在探索中給提示
  touchAction(name) {
    const inCombat = !!this.engine.combat;
    const combatOnly = { part: 1, auto: 1, flee: 1, coop: 1 };
    if (combatOnly[name] && !inCombat) {
      this.showToast("這個動作只能在戰鬥中使用", "warn");
      return true;
    }
    switch (name) {
      case "slash": this.onCombatSkillClick("slash"); break;
      case "dodge": this.onForesightSlashClick(); break;
      case "heal": this.useQuickItem("heal"); break;
      case "mana": this.useQuickItem("mana"); break;
      case "part": this.cycleTargetPart(); break;
      case "auto": this.toggleRtAuto(); break;
      case "flee": this.onFleeClick(); break;
      case "coop": this.onCompanionSkillClick(); break;
      case "pulse": if (!inCombat) this.onAstralPulseClick(); break;
      default: return false;
    }
    return true;
  },

  // 搖桿狀態改變：戰鬥中寫入 _rtDirs（每幀由 rtTick 消耗），探索中由計時器逐格移動。
  // 計時器只在搖桿推出時運作；戰鬥結束後仍按著搖桿不會自動走動（需放開重按）
  setTouchDir(dir) {
    if (this._touchIgnore) {
      if (dir) return;
      this._touchIgnore = false;
    }
    if (!dir || (this._touchBlocked && this._touchBlocked.join() !== dir.join())) this._touchBlocked = null;
    const prev = this._touchDir;
    if (dir && !prev) this._touchWasCombat = !!this.engine.combat; // 在戰鬥中按下，戰鬥結束後需放開重按
    this._touchDir = dir;
    // 只增減搖桿自己的方向，不動鍵盤同時按住的方向
    if (this.engine.combat) {
      this._rtDirs = (this._rtDirs || []).filter(d => !prev || d !== prev);
      if (dir) this._rtDirs.push(dir);
    }
    if (dir && !this._touchTimer) this._touchTimer = setInterval(() => this._touchStepTick(), 130);
    if (!dir && this._touchTimer) { clearInterval(this._touchTimer); this._touchTimer = null; }
  },

  _touchStepTick() {
    const dir = this._touchDir;
    if (!dir) return;
    if (this.engine.combat) { this._touchWasCombat = true; return; }
    if (this._touchWasCombat) {
      // 戰鬥剛結束：忽略仍按著的搖桿，直到放開再重按
      this._touchWasCombat = false;
      this._touchIgnore = true;
      this._touchDir = null;
      if (this._touchTimer) { clearInterval(this._touchTimer); this._touchTimer = null; }
      return;
    }
    if (document.querySelector(".modal-overlay.active")) return;
    if (this._touchBlocked) return; // 同方向剛被擋住：換方向或放開才會再試，避免重複洗訊息
    this.stopAutoWalk();
    const res = this.handleMove(dir[0], dir[1]);
    if (res && !res.moved) this._touchBlocked = dir;
  },

  initTouchControls() {
    if (!this.isTouchDevice()) return false;
    document.body.classList.add("touch-ui");
    const host = document.createElement("div");
    host.id = "touch-controls";
    host.innerHTML = `
      <div id="touch-pad" class="touch-pad"><div id="touch-knob" class="touch-knob"></div></div>
      <div class="touch-actions">${this.touchButtonDefs()
        .map(([k, label, big]) => `<button class="touch-btn${big ? " big" : ""}" data-act="${k}">${label}</button>`)
        .join("")}</div>`;
    document.body.appendChild(host);

    const pad = document.getElementById("touch-pad");
    const knob = document.getElementById("touch-knob");
    let pid = null, cx = 0, cy = 0;
    const move = e => {
      if (e.pointerId !== pid) return;
      const dx = e.clientX - cx, dy = e.clientY - cy;
      const r = 44, len = Math.hypot(dx, dy) || 1, k = Math.min(1, r / len);
      knob.style.transform = `translate(${dx * k}px, ${dy * k}px)`;
      this.setTouchDir(this.joystickDir(dx, dy));
    };
    const end = e => {
      if (e.pointerId !== pid) return;
      pid = null;
      knob.style.transform = "translate(0,0)";
      this.setTouchDir(null);
    };
    pad.addEventListener("pointerdown", e => {
      e.preventDefault();
      pid = e.pointerId;
      const rect = pad.getBoundingClientRect();
      cx = rect.left + rect.width / 2;
      cy = rect.top + rect.height / 2;
      if (pad.setPointerCapture) pad.setPointerCapture(pid);
      if (window.soundSystem) window.soundSystem.init();
      move(e);
    });
    pad.addEventListener("pointermove", move);
    pad.addEventListener("pointerup", end);
    pad.addEventListener("pointercancel", end);
    host.querySelectorAll(".touch-btn").forEach(btn => {
      btn.addEventListener("pointerdown", e => {
        e.preventDefault();
        if (window.soundSystem) window.soundSystem.init();
        this.touchAction(btn.dataset.act);
      });
    });
    return true;
  }
};

if (typeof window !== "undefined" && window.GameUI) Object.assign(window.GameUI.prototype, TouchControls);
if (typeof module !== "undefined" && module.exports) module.exports = { TouchControls };
