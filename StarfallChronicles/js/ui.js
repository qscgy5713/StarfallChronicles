/**
 * 《星隕編年史：霧海遺城》 - 16-Bit 像素渲染器與視覺導引介面控制器 (UI Controller v2.2 Commercial Edition)
 * 100% 零 Emoji、全手繪像素圖、滑鼠懸停圖塊探測器、地圖浮動跳字、戰鬥粒子彈道、智能出招與章節跳轉
 */

class GameUI {
  constructor(engine) {
    this.engine = engine;
    this.px = window.pixelArt;
    this.canvas = document.getElementById("map-canvas");
    this.ctx = this.canvas ? this.canvas.getContext("2d") : null;
    this.tileSize = 44;
    this.logicalWidth = 960;
    this.logicalHeight = 640;
    this.camX = 0;
    this.camY = 0;
    this.animFrame = 0;
    this.particles = [];
    this.mapFloats = [];
    this.hoverTile = null;
    this.autoWalkTimer = null;
    this.mh3d = typeof window !== "undefined" && window.MH3DRenderer ? new window.MH3DRenderer(this) : null;

    this.setupRetinaCanvas();
    this.initStaticPixelIcons();
    this.initParticles();
    this.bindEvents();
    this.startTimer();
    this.renderAll();
    this.startAnimationLoop();
  }

  getEffectiveTileSize() {
    if (this.engine.state.fullMapView) {
      return 22;
    }
    return this.tileSize;
  }

  // ==================== 地圖浮動跳字與懸停探測系統 ====================
  addMapFloatText(tx, ty, text, color = "#facc15") {
    this.mapFloats.push({
      tx,
      ty,
      text,
      color,
      ticks: 42,
      maxTicks: 42
    });
  }

  getTileInspectionText(tx, ty) {
    const map = this.engine.activeMap;
    if (!map || !map[ty] || !map[ty][tx]) return "";
    const expMap = this.engine.getCurrentExploredMap();
    const coord = `${tx},${ty}`;
    if (!expMap[coord]) {
      return `[未知迷霧區域 (${tx},${ty})] 尚未探索 — 靠近此區域或按 [Q] 施放星輝脈衝即可驅散迷霧`;
    }
    const tile = map[ty][tx];
    const ev = this.engine.resolveEventAt ? this.engine.resolveEventAt(tx, ty, tile) : this.engine.activeEvents[coord];

    if (tx === this.engine.state.x && ty === this.engine.state.y) {
      return `[當前位置 (${tx},${ty})] 尋星者・艾爾文 — 按 [Q] 星輝脈衝、[E] 切換武器附魔、[M] 切換 40x28 全景視角`;
    }
    if (tile === "#") return `[座標 (${tx},${ty})] 障礙地形 — 無法通行`;
    if (tile === "~") return `[座標 (${tx},${ty})] 深水/熔岩/星淵 — 請先啟動水閥或星盤架橋`;
    if (tile === "=") return `[座標 (${tx},${ty})] 古代橋樑 — 點擊可通行`;
    if (tile === "F") return `[座標 (${tx},${ty})] 星輝治療營火 — 點擊前往：免費回滿 HP/MP 並自動存檔`;
    if (tile === "A") return `[座標 (${tx},${ty})] 星辰鍛造鐵砧 — 點擊前往：淬煉強化裝備(+1~+5)與合成藥水`;
    if (tile === "?") return `[座標 (${tx},${ty})] 星界奇遇祭壇 — 點擊前往：觸發三選一機遇與永久能力強化`;
    if (tile === "W") return `[座標 (${tx},${ty})] 古代裂隙秘牆 — 靠近按 [Q] 星輝脈衝或直接點擊調查可擊碎幻象牆開啟秘寶室！`;
    if (tile === "T") return `[座標 (${tx},${ty})] 星蝕地脈陷阱 — 靠近按 [Q] 星輝脈衝可安全拆除並獲得【星辰碎晶】！`;
    if (tile === "D") return `[座標 (${tx},${ty})] 星泉祝福池 — 點擊前往飲用星泉，獲得 3 場戰鬥【攻防+18% & 暴擊+12%】祝福！`;
    if (tile === "V") return `[座標 (${tx},${ty})] 星界試煉碑 — 點擊前往共鳴，領取高額經驗值、金幣與星辰碎晶！`;
    if (tile === "O") {
      return `[座標 (${tx},${ty})] 星軌躍遷陣 — 點擊踏入可瞬間雙向傳送跨越 40x28 巨型迷宮（連接東翼與極淵墓穴）！`;
    }
    if (tile === "U") {
      return `[座標 (${tx},${ty})] 遠古星魂聖棺 — 點擊啟封可永久提升【最大HP+15、攻擊+2、防禦+1】並獲得豐厚金幣與經驗！`;
    }

    if (tile === "N" && ev) {
      return `[座標 (${tx},${ty})] NPC【${ev.name}】— 點擊前往對話，承接或回報主支線委託`;
    }
    if (tile === "S" && ev) {
      const done = !!(this.engine.state.flags[ev.id] || (ev.flag && this.engine.state.flags[ev.flag]));
      return `[座標 (${tx},${ty})] 機關【${ev.name}】(${done ? "已點亮啟動" : "尚未啟動"}) — 點擊前往啟動！`;
    }
    if (tile === "G" && ev) {
      return `[座標 (${tx},${ty})] 封印門 — ${ev.lockedMsg || "達成條件後點擊即可開門通行"}`;
    }
    if (tile === "R" && ev) {
      return `[座標 (${tx},${ty})] 古代密碼終端 — 點擊輸入符文密碼（線索記載於本章《星辰手札》中）`;
    }
    if (tile === "C" && ev) {
      return `[座標 (${tx},${ty})] 秘寶木箱 — 點擊前往開啟，獲取金幣、藥水或稀有裝備！`;
    }
    if (tile === "L" && ev) {
      return `[座標 (${tx},${ty})] 星辰手札卷軸 — 點擊前往閱讀世界觀歷史與密碼線索`;
    }
    if (tile === "M" && ev) {
      const it = this.engine.data.items[ev.item];
      return `[座標 (${tx},${ty})] 素材採集點【${it ? it.name : "素材"} x${ev.count}】— 點擊前往採集`;
    }
    if ((tile === "E" || tile === "B") && ev) {
      const en = this.engine.data.enemies[ev.enemyId];
      if (en) {
        const elemNames = { physical: "物理", arcane: "星芒", star: "星輝", fire: "烈焰", frost: "寒霜", void: "虛空" };
        const wStr = (en.weaknesses || []).map(w => elemNames[w] || w).join("/");
        const stunTag = ev.stunnedSteps > 0 ? "【已被星芒震懾：現在接觸可觸發先制奇襲！】" : "（靠近按 [Q] 可震懾觸發先制奇襲）";
        return `[座標 (${tx},${ty})] ${en.isBoss ? "章節首領" : en.isElite ? "迷宮菁英" : "魔物"}【${en.name}】(HP:${en.hp} 護盾:${en.shield} 弱點:${wStr || "無"}) ${stunTag}`;
      }
    }
    if ((tile === ">" || tile === "<") && ev) {
      return `[座標 (${tx},${ty})] 區域階梯通道 — ${ev.desc || "點擊前往相鄰子區域"}`;
    }
    if (tile === "P") {
      return `[座標 (${tx},${ty})] 星界傳送陣 — 擊敗本章首領後點擊即可前往下一章！`;
    }
    return `[座標 (${tx},${ty})] 可通行地面 — 點擊即可尋路走至此處`;
  }

  // ==================== 裝備與道具數值格式化與對比系統 ====================
  getSlotLabel(slot) {
    const map = { weapon: "武器部位", armor: "防具部位", relic: "聖物飾品" };
    return map[slot] || "裝備";
  }

  getShortStatSummary(item) {
    if (!item) return "";
    if (item.category === "equipment" && item.stats) {
      const st = item.stats;
      const parts = [];
      if (st.atk) parts.push(`攻+${st.atk}`);
      if (st.def) parts.push(`防+${st.def}`);
      if (st.crit) parts.push(`暴+${st.crit}%`);
      if (st.maxHp) parts.push(`HP+${st.maxHp}`);
      if (st.maxMp) parts.push(`MP+${st.maxMp}`);
      if (st.goldBonus) parts.push(`金幣+${Math.round(st.goldBonus * 100)}%`);
      return parts.join(" ");
    }
    if (item.category === "consumable" && item.effect) {
      const ef = item.effect;
      const parts = [];
      if (ef.hp) parts.push(`HP+${ef.hp}`);
      if (ef.mp) parts.push(`MP+${ef.mp}`);
      if (ef.burst) parts.push(`極限+${ef.burst}%`);
      if (ef.dmg) parts.push(`傷害${ef.dmg}`);
      if (ef.shieldBreak) parts.push(`破盾${ef.shieldBreak}`);
      return parts.join(" ");
    }
    return "";
  }

  renderItemStatsBadges(item) {
    if (!item) return "";
    if (item.category === "equipment" && item.stats) {
      const st = item.stats;
      const badges = [
        `<span style="background:#1e293b;color:#38bdf8;border:1px solid #38bdf8;padding:1px 6px;font-size:11px;font-weight:800;">[${this.getSlotLabel(item.slot)}]</span>`
      ];
      if (st.atk) badges.push(`<span style="background:#3b1120;color:#fda4af;border:1px solid #f43f5e;padding:1px 6px;font-size:11.5px;font-weight:800;">攻擊 +${st.atk}</span>`);
      if (st.def) badges.push(`<span style="background:#0c4a6e;color:#7dd3fc;border:1px solid #38bdf8;padding:1px 6px;font-size:11.5px;font-weight:800;">防禦 +${st.def}</span>`);
      if (st.crit) badges.push(`<span style="background:#422006;color:#fde047;border:1px solid #facc15;padding:1px 6px;font-size:11.5px;font-weight:800;">暴擊率 +${st.crit}%</span>`);
      if (st.maxHp) badges.push(`<span style="background:#14532d;color:#86efac;border:1px solid #4ade80;padding:1px 6px;font-size:11.5px;font-weight:800;">最大HP +${st.maxHp}</span>`);
      if (st.maxMp) badges.push(`<span style="background:#1e1b4b;color:#c4b5fd;border:1px solid #a78bfa;padding:1px 6px;font-size:11.5px;font-weight:800;">最大MP +${st.maxMp}</span>`);
      if (st.goldBonus) badges.push(`<span style="background:#422006;color:#facc15;border:1px solid #facc15;padding:1px 6px;font-size:11.5px;font-weight:800;">金幣掉落 +${Math.round(st.goldBonus * 100)}%</span>`);
      return `<div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:4px;">${badges.join("")}</div>`;
    }
    if (item.category === "consumable" && item.effect) {
      const ef = item.effect;
      const badges = [
        `<span style="background:#112e2b;color:#2dd4bf;border:1px solid #2dd4bf;padding:1px 6px;font-size:11px;font-weight:800;">[消耗品效果]</span>`
      ];
      if (ef.hp) badges.push(`<span style="background:#14532d;color:#86efac;border:1px solid #4ade80;padding:1px 6px;font-size:11.5px;font-weight:800;">恢復生命 +${ef.hp} HP</span>`);
      if (ef.mp) badges.push(`<span style="background:#0c4a6e;color:#7dd3fc;border:1px solid #38bdf8;padding:1px 6px;font-size:11.5px;font-weight:800;">恢復星力 +${ef.mp} MP</span>`);
      if (ef.burst) badges.push(`<span style="background:#422006;color:#fde047;border:1px solid #facc15;padding:1px 6px;font-size:11.5px;font-weight:800;">極限星能 +${ef.burst}%</span>`);
      if (ef.dmg) badges.push(`<span style="background:#3b1120;color:#fda4af;border:1px solid #f43f5e;padding:1px 6px;font-size:11.5px;font-weight:800;">固定爆炸傷害 ${ef.dmg}</span>`);
      if (ef.shieldBreak) badges.push(`<span style="background:#422006;color:#facc15;border:1px solid #facc15;padding:1px 6px;font-size:11.5px;font-weight:800;">擊碎護盾 ${ef.shieldBreak} 點</span>`);
      if (ef.cleanse) badges.push(`<span style="background:#1e1b4b;color:#c4b5fd;border:1px solid #a78bfa;padding:1px 6px;font-size:11.5px;font-weight:800;">淨化負面狀態</span>`);
      return `<div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:4px;">${badges.join("")}</div>`;
    }
    return "";
  }

  getEquipPowerScore(item) {
    if (!item || !item.stats) return 0;
    const st = item.stats;
    return (
      (st.atk || 0) * 3.0 +
      (st.def || 0) * 2.5 +
      (st.crit || 0) * 2.2 +
      (st.maxHp || 0) * 0.45 +
      (st.maxMp || 0) * 0.5 +
      (st.goldBonus || 0) * 80
    );
  }

  renderEquipComparison(candidateItem) {
    if (!candidateItem || candidateItem.category !== "equipment" || !candidateItem.stats) return "";
    const slot = candidateItem.slot;
    const currentId = this.engine.state.equipment[slot];
    const currentItem = currentId ? this.engine.data.items[currentId] : null;

    if (currentId === candidateItem.id) {
      return `<div style="margin-top:4px;font-size:11.5px;color:#2dd4bf;font-weight:800;">[目前正穿戴此裝備]</div>`;
    }

    const curStats = (currentItem && currentItem.stats) || {};
    const newStats = candidateItem.stats || {};
    const fields = [
      { key: "atk", label: "攻擊", suffix: "" },
      { key: "def", label: "防禦", suffix: "" },
      { key: "crit", label: "暴擊", suffix: "%" },
      { key: "maxHp", label: "最大HP", suffix: "" },
      { key: "maxMp", label: "最大MP", suffix: "" }
    ];

    const diffs = [];
    fields.forEach(f => {
      const a = curStats[f.key] || 0;
      const b = newStats[f.key] || 0;
      const d = b - a;
      if (d > 0) {
        diffs.push(`<span style="color:#4ade80;font-weight:800;">${f.label} +${d}${f.suffix} (上升)</span>`);
      } else if (d < 0) {
        diffs.push(`<span style="color:#fb7185;font-weight:800;">${f.label} ${d}${f.suffix} (下降)</span>`);
      }
    });

    const isUpgrade = this.getEquipPowerScore(candidateItem) > this.getEquipPowerScore(currentItem);
    const recBadge = isUpgrade
      ? `<span style="background:#14532d;color:#4ade80;border:1px solid #4ade80;padding:1px 6px;font-size:11px;font-weight:800;margin-right:6px;">[推薦更換：戰力提升!]</span>`
      : `<span style="background:#1e293b;color:#94a3b8;padding:1px 6px;font-size:11px;margin-right:6px;">[與當前 ${currentItem ? currentItem.name : "無"} 對比]</span>`;

    return `
      <div style="margin-top:5px;padding:5px 8px;background:#090d16;border:1px solid ${isUpgrade ? "#4ade80" : "#334155"};font-size:11.5px;">
        ${recBadge}
        ${diffs.length ? `更換後變化：${diffs.join(" ｜ ")}` : "數值相同"}
      </div>
    `;
  }

  hasBetterEquipInBag() {
    const s = this.engine.state;
    for (const [id, cnt] of Object.entries(s.inventory)) {
      if (cnt <= 0) continue;
      const it = this.engine.data.items[id];
      if (it && it.category === "equipment") {
        const curId = s.equipment[it.slot];
        const curItem = curId ? this.engine.data.items[curId] : null;
        if (this.getEquipPowerScore(it) > this.getEquipPowerScore(curItem)) {
          return true;
        }
      }
    }
    return false;
  }

  setupRetinaCanvas() {
    if (this.canvas && this.ctx) {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      this.canvas.width = this.logicalWidth * dpr;
      this.canvas.height = this.logicalHeight * dpr;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.ctx.imageSmoothingEnabled = false;
    }
  }

  initStaticPixelIcons() {
    if (!this.px) return;
    const setIcon = (id, key, size = 18) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = this.px.icon(key, size);
    };
    setIcon("brand-px-logo", "crystal", 26);
    setIcon("nav-ic-help", "scroll", 16);
    setIcon("nav-ic-inv", "icon_def", 16);
    setIcon("nav-ic-skill", "icon_burst", 16);
    setIcon("nav-ic-craft", "anvil", 16);
    setIcon("nav-ic-shop", "icon_gold", 16);
    setIcon("nav-ic-codex", "scroll", 16);
    setIcon("nav-ic-abyss", "portal_0", 16);
    setIcon("nav-ic-save", "chest_closed", 16);
    setIcon("guide-ic-marker", "quest_marker", 22);

    const heroAvatar = document.getElementById("hero-avatar-canvas");
    if (heroAvatar) {
      const hCtx = heroAvatar.getContext("2d");
      hCtx.imageSmoothingEnabled = false;
      hCtx.clearRect(0, 0, 48, 48);
      this.px.drawSprite(hCtx, "hero_0", 4, 4, 40);
    }
    const introCanvas = document.getElementById("intro-hero-canvas");
    if (introCanvas) {
      const iCtx = introCanvas.getContext("2d");
      iCtx.imageSmoothingEnabled = false;
      iCtx.clearRect(0, 0, 96, 96);
      this.px.drawSprite(iCtx, "hero_0", 6, 12, 64);
      this.px.drawSprite(iCtx, "pet_lumi", 56, 36, 36);
    }
  }

  initParticles() {
    for (let i = 0; i < 36; i++) {
      this.particles.push({
        x: Math.random() * this.logicalWidth,
        y: Math.random() * this.logicalHeight,
        s: 2 + Math.floor(Math.random() * 2),
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.2 - Math.random() * 0.35,
        alpha: 0.2 + Math.random() * 0.5
      });
    }
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      this.engine.state.playTimeSeconds = (this.engine.state.playTimeSeconds || 0) + 1;
      const el = typeof document !== "undefined" && document.getElementById ? document.getElementById("hud-playtime") : null;
      if (el) el.textContent = this.formatTime(this.engine.state.playTimeSeconds);
    }, 1000);
  }

  formatTime(sec) {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    return `${String(mins).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  stopAutoWalk() {
    if (this.autoWalkTimer) {
      clearInterval(this.autoWalkTimer);
      this.autoWalkTimer = null;
    }
  }

  toggleCompass() {
    this.engine.state.compassEnabled = !this.engine.state.compassEnabled;
    if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("click");
    this.showToast(
      this.engine.state.compassEnabled
        ? "[星輝羅盤已開啟] 地圖上已顯示目標導引光點路線"
        : "[星輝羅盤已關閉] 純粹探索模式",
      "teal"
    );
    this.renderAll();
  }

  toggleFullMap() {
    this.engine.state.fullMapView = !this.engine.state.fullMapView;
    if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("click");
    this.showToast(
      this.engine.state.fullMapView
        ? "[全景俯瞰視角] 一覽 40x28 巨型地城全貌（可點擊任意區域尋路）"
        : "[近景跟隨視角] 鏡頭平滑追蹤主角，右上角顯示即時雷達小地圖",
      "teal"
    );
    this.renderAll();
  }

  onAstralPulseClick() {
    const res = this.engine.castAstralPulse();
    if (!res.ok && res.msg) {
      this.showToast(res.msg, "warn");
    }
    this.renderAll();
  }

  onWeaponElementClick() {
    this.engine.cycleWeaponElement();
    this.renderAll();
  }

  onToggle3DViewClick() {
    if (this.engine.toggleViewMode) {
      this.engine.toggleViewMode();
    }
    this.renderAll();
  }

  onSharpenWeaponClick() {
    if (this.engine.sharpenWeapon) {
      const res = this.engine.sharpenWeapon();
      if (res && !res.ok && res.msg) this.showToast(res.msg, "warn");
    }
    this.renderAll();
  }

  onCanteenMealClick(mealId) {
    if (this.engine.eatCanteenMeal) {
      this.engine.eatCanteenMeal(mealId);
    }
    this.closeModals();
    this.renderAll();
  }

  onSelectMonsterPartClick(partKey) {
    if (this.engine.selectMonsterPart) {
      this.engine.selectMonsterPart(partKey);
    }
    this.renderAll();
  }

  onForesightSlashClick() {
    if (this.engine.castForesightSlash) {
      const res = this.engine.castForesightSlash();
      if (res && !res.ok && res.msg) this.showToast(res.msg, "warn");
    }
    if (!this.engine.combat) this.renderAll();
  }

  screenToTile(clientX, clientY) {
    if (!this.canvas || !this.engine.activeMap || !this.engine.activeMap.length) return { tx: -1, ty: -1 };
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.logicalWidth / rect.width;
    const scaleY = this.logicalHeight / rect.height;
    const lx = (clientX - rect.left) * scaleX;
    const ly = (clientY - rect.top) * scaleY;

    const rows = this.engine.activeMap.length;
    const cols = this.engine.activeMap[0].length;

    // 若處於近景跟隨視角，且點擊在右上角小地圖雷達框內，直接換算為小地圖對應座標
    if (!this.engine.state.fullMapView) {
      const mmScale = 3;
      const mmW = cols * mmScale;
      const mmH = rows * mmScale;
      const mmX = this.logicalWidth - mmW - 12;
      const mmY = 22;
      if (lx >= mmX && lx <= mmX + mmW && ly >= mmY && ly <= mmY + mmH) {
        return {
          tx: Math.floor((lx - mmX) / mmScale),
          ty: Math.floor((ly - mmY) / mmScale),
          fromMinimap: true
        };
      }
    }

    const is3D = !this.engine.state.fullMapView && (this.engine.state.viewMode || "3d_shoulder") !== "2d_pixel";
    if (is3D && this.mh3d) {
      const hit = this.mh3d.screenToWorldTile(lx, ly, this.logicalWidth, this.logicalHeight);
      if (hit) {
        return { tx: hit.tx, ty: hit.ty, fromMinimap: false };
      }
    }

    const ts = this.getEffectiveTileSize();
    return {
      tx: Math.floor((lx + this.camX) / ts),
      ty: Math.floor((ly + this.camY) / ts),
      fromMinimap: false
    };
  }

  bindEvents() {
    window.addEventListener("keydown", e => {
      if (window.soundSystem) {
        window.soundSystem.init();
        if (!window.soundSystem.bgmTimer && !window.soundSystem.muted) {
          window.soundSystem.startBGM("explore", this.engine.state.chapter);
        }
      }

      if (e.key === "Escape") {
        this.closeModals();
        return;
      }

      if (e.key === " ") {
        const introModal = document.getElementById("modal-intro");
        if (introModal && introModal.classList.contains("active")) {
          e.preventDefault();
          this.closeModals();
          return;
        }
        const dlgModal = document.getElementById("modal-dialogue");
        if (dlgModal && dlgModal.classList.contains("active")) {
          e.preventDefault();
          this.closeModals();
          return;
        }
      }

      if (document.querySelector(".modal-overlay.active")) return;
      this.stopAutoWalk();

      if (e.key === "e" || e.key === "E") {
        e.preventDefault();
        this.onWeaponElementClick();
        return;
      }

      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        this.onSharpenWeaponClick();
        return;
      }

      if (e.key === "v" || e.key === "V") {
        e.preventDefault();
        this.onToggle3DViewClick();
        return;
      }

      if (e.key === "g" || e.key === "G") {
        e.preventDefault();
        this.openModal("canteen");
        return;
      }

      if (this.mh3d && (e.key === "j" || e.key === "J")) {
        e.preventDefault();
        this.mh3d.rotateCamera(-Math.PI / 6);
        return;
      }
      if (this.mh3d && (e.key === "l" || e.key === "L")) {
        e.preventDefault();
        this.mh3d.rotateCamera(Math.PI / 6);
        return;
      }

      if (this.engine.combat) {
        this.handleCombatKey(e);
        return;
      }

      if (this.handleFieldSkillKey(e)) {
        e.preventDefault();
        return;
      }

      if (e.key === "q" || e.key === "Q") {
        e.preventDefault();
        this.onAstralPulseClick();
        return;
      }

      if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        this.toggleFullMap();
        return;
      }

      const keyMap = {
        ArrowUp: [0, -1], w: [0, -1], W: [0, -1],
        ArrowDown: [0, 1], s: [0, 1], S: [0, 1],
        ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0],
        ArrowRight: [1, 0], d: [1, 0], D: [1, 0]
      };

      if (keyMap[e.key]) {
        e.preventDefault();
        const [dx, dy] = keyMap[e.key];
        this.handleMove(dx, dy);
      }
    });

    window.addEventListener("keyup", e => this.handleCombatKeyUp(e));
    window.addEventListener("blur", () => { this._rtDirs = []; });

    if (this.canvas) {
      this.canvas.addEventListener("mousemove", e => {
        if (this.engine.combat || !this.engine.activeMap.length) return;
        const { tx, ty } = this.screenToTile(e.clientX, e.clientY);
        const rows = this.engine.activeMap.length;
        const cols = this.engine.activeMap[0].length;
        if (tx >= 0 && tx < cols && ty >= 0 && ty < rows) {
          this.hoverTile = { x: tx, y: ty };
          const subEl = document.getElementById("guide-sub-text");
          if (subEl) subEl.textContent = this.getTileInspectionText(tx, ty);
        }
      });

      this.canvas.addEventListener("mouseleave", () => {
        this.hoverTile = null;
        this.renderGuideBanner();
      });

      this.canvas.addEventListener("click", e => {
        if (this.engine.combat || !this.engine.activeMap.length) return;
        const { tx, ty } = this.screenToTile(e.clientX, e.clientY);
        const rows = this.engine.activeMap.length;
        const cols = this.engine.activeMap[0].length;
        if (tx >= 0 && tx < cols && ty >= 0 && ty < rows) {
          this.walkToTile(tx, ty);
        }
      });
    }
  }

  walkToTile(tx, ty) {
    this.stopAutoWalk();
    if (tx === this.engine.state.x && ty === this.engine.state.y) {
      const tile = this.engine.activeMap[ty][tx];
      const ev = this.engine.resolveEventAt(tx, ty, tile);
      this.engine.interactTile(tx, ty, tile, ev);
      this.renderAll();
      return;
    }

    const dx = tx - this.engine.state.x;
    const dy = ty - this.engine.state.y;
    if (Math.abs(dx) + Math.abs(dy) === 1) {
      this.handleMove(dx, dy);
      return;
    }

    const path = this.engine.findGuidePath(tx, ty);
    if (path && path.length > 0) {
      let idx = 0;
      this.autoWalkTimer = setInterval(() => {
        if (
          idx >= path.length ||
          this.engine.combat ||
          document.querySelector(".modal-overlay.active")
        ) {
          this.stopAutoWalk();
          return;
        }
        const [stepX, stepY] = path[idx++];
        const res = this.engine.move(stepX, stepY);
        this.renderAll();
        if (!res.moved || res.zoneChanged || res.portal) {
          this.stopAutoWalk();
        }
      }, 95);
    } else if (dx !== 0 || dy !== 0) {
      const stepX = Math.abs(dx) >= Math.abs(dy) ? Math.sign(dx) : 0;
      const stepY = stepX === 0 ? Math.sign(dy) : 0;
      this.handleMove(stepX, stepY);
    }
  }

  autoNavigateToObjective() {
    this.toggleCompass();
  }

  handleMove(dx, dy) {
    const res = this.engine.move(dx, dy);
    if (res && (res.zoneChanged || res.portal) && this.mh3d) {
      this.mh3d.snapCamera();
    }
    this.renderAll();
  }

  startAnimationLoop() {
    let last = performance.now();
    const loop = now => {
      const dt = Math.min(0.1, Math.max(0, (now - last) / 1000));
      last = now;
      this.animFrame++;
      this.rtTick(dt);
      this.drawCanvas();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  drawCanvas() {
    if (!this.ctx || !this.canvas || !this.px) return;
    const ctx = this.ctx;
    const map = this.engine.activeMap;
    if (!map || !map.length) return;

    const rows = map.length;
    const cols = map[0].length;
    const ts = this.getEffectiveTileSize();
    const ch = this.engine.data.chapters[this.engine.state.chapter] || this.engine.data.chapters[1];
    const themeColor = this.engine.state.inAbyss ? "#c084fc" : ch.themeColor;
    const expMap = this.engine.getCurrentExploredMap();
    const comp = this.engine.getComputedStats();
    const frame2 = Math.floor(this.animFrame / 22) % 2;
    const obj = this.engine.getCurrentObjective();

    // 若處於《魔物獵人》3D 狩獵視角 (3d_shoulder 或 3d_orbit) 且非全景地圖，使用 MH3DRenderer 繪製 3D 透視世界
    const viewMode = this.engine.state.viewMode || "3d_shoulder";
    // 即時戰鬥固定使用 2D 畫面 (預警範圍與走位以格子呈現)
    if (!this.engine.state.fullMapView && viewMode !== "2d_pixel" && this.mh3d && !this.engine.combat) {
      this.mh3d.draw3DWorld(ctx, this.logicalWidth, this.logicalHeight, this.animFrame);
      this.drawMinimap(ctx, map, expMap, obj, ts);
      return;
    }

    // 計算鏡頭平移 (Camera Offset)
    if (this.engine.state.fullMapView) {
      const mapPixelW = cols * ts;
      const mapPixelH = rows * ts;
      this.camX = -Math.floor((this.logicalWidth - mapPixelW) / 2);
      this.camY = -Math.floor((this.logicalHeight - mapPixelH) / 2);
    } else {
      // 鏡頭永遠以主角為中心（不再限制於地圖邊界內），地圖邊緣以外顯示為背景
      // 主角顯示位置平滑追隨邏輯格 (即時戰鬥與探索皆適用)
      if (typeof this._hx !== "number" || Math.hypot(this._hx - this.engine.state.x, this._hy - this.engine.state.y) > 4) {
        this._hx = this.engine.state.x;
        this._hy = this.engine.state.y;
      }
      this._hx += (this.engine.state.x - this._hx) * 0.4;
      this._hy += (this.engine.state.y - this._hy) * 0.4;
      if (Math.abs(this.engine.state.x - this._hx) < 0.01) this._hx = this.engine.state.x;
      if (Math.abs(this.engine.state.y - this._hy) < 0.01) this._hy = this.engine.state.y;
      const targetX = this._hx * ts + ts / 2 - this.logicalWidth / 2;
      const targetY = this._hy * ts + ts / 2 - this.logicalHeight / 2;
      if (!this._camInit) {
        this.camX = targetX;
        this.camY = targetY;
        this._camInit = true;
      }
      this.camX += (targetX - this.camX) * 0.28;
      this.camY += (targetY - this.camY) * 0.28;
      if (Math.abs(targetX - this.camX) < 0.5) this.camX = targetX;
      if (Math.abs(targetY - this.camY) < 0.5) this.camY = targetY;
    }

    let ox = -Math.round(this.camX);
    let oy = -Math.round(this.camY);
    const combatNow = this.engine.combat;
    if (combatNow && combatNow.shake > 1) {
      ox += Math.round((Math.random() - 0.5) * combatNow.shake * 0.5);
      oy += Math.round((Math.random() - 0.5) * combatNow.shake * 0.5);
    }

    ctx.fillStyle = "#0a1410";
    ctx.fillRect(0, 0, this.logicalWidth, this.logicalHeight);

    // 地圖邊界外：以牆體地形鋪滿並壓暗，營造世界邊緣的森林/岩壁感
    if (!this.engine.state.fullMapView) {
      const gx0 = Math.floor(-ox / ts) - 1, gx1 = Math.ceil((this.logicalWidth - ox) / ts) + 1;
      const gy0 = Math.floor(-oy / ts) - 1, gy1 = Math.ceil((this.logicalHeight - oy) / ts) + 1;
      for (let gy = gy0; gy <= gy1; gy++) {
        for (let gx = gx0; gx <= gx1; gx++) {
          if (gx >= 0 && gx < cols && gy >= 0 && gy < rows) continue;
          this.px.drawTerrainTile(ctx, "#", this.engine.state.chapter, gx, gy, gx * ts + ox, gy * ts + oy, ts, this.animFrame, {});
        }
      }
    }

    const fogAlpha = new Float32Array(rows * cols);
    for (let y = 0; y < rows; y++) {
      const py = y * ts + oy;
      if (py + ts < 0 || py > this.logicalHeight) continue;
      for (let x = 0; x < cols; x++) {
        const px = x * ts + ox;
        if (px + ts < 0 || px > this.logicalWidth) continue;

        const coord = `${x},${y}`;
        const explored = !!expMap[coord];
        const dist = Math.hypot(x - this.engine.state.x, y - this.engine.state.y);
        const visible = dist <= comp.vision + 0.5;

        const tile = map[y][x];
        const nb = {
          n: y > 0 ? map[y - 1][x] : "#",
          s: y < rows - 1 ? map[y + 1][x] : "#",
          w: x > 0 ? map[y][x - 1] : "#",
          e: x < cols - 1 ? map[y][x + 1] : "#"
        };
        this.px.drawTerrainTile(ctx, tile === "W" ? "#" : tile, this.engine.state.chapter, x, y, px, py, ts, this.animFrame, nb);

        // 若上方相鄰格為牆體，於地面頂緣繪製立體牆簷落影，強化 16-Bit 地城空間縱深
        if (tile !== "#" && tile !== "W" && y > 0 && (map[y - 1][x] === "#" || map[y - 1][x] === "W")) {
          ctx.fillStyle = "rgba(10, 25, 12, 0.22)";
          ctx.fillRect(px, py, ts, Math.max(4, Math.round(ts * 0.2)));
        }

        // 即時戰鬥中魔物以獨立實體繪製，原始格不重複畫
        const isCombatOrigin = combatNow && combatNow.rt && x === combatNow.rt.ox && y === combatNow.rt.oy;
        if (explored && !isCombatOrigin) {
          this.drawPixelTileObject(ctx, tile, x, y, px, py, ts, frame2);
        }

        fogAlpha[y * cols + x] = !explored ? 0.93 : !visible ? 0.3 : 0;
      }
    }

    // 統一陰影層：所有地形與物件畫完後，以低解析遮罩雙線性放大鋪上，
    // 讓迷霧/世界邊緣的暗部柔和漸變，且能完整覆蓋向上延伸的樹冠
    {
      const fgx0 = Math.floor(-ox / ts) - 1, fgx1 = Math.ceil((this.logicalWidth - ox) / ts) + 1;
      const fgy0 = Math.floor(-oy / ts) - 1, fgy1 = Math.ceil((this.logicalHeight - oy) / ts) + 3;
      const mw = fgx1 - fgx0 + 1, mh = fgy1 - fgy0 + 1;
      if (!this._fogMask || this._fogMask.width !== mw || this._fogMask.height !== mh) {
        this._fogMask = document.createElement("canvas");
        this._fogMask.width = mw;
        this._fogMask.height = mh;
      }
      const mctx = this._fogMask.getContext("2d");
      mctx.clearRect(0, 0, mw, mh);
      for (let j = 0; j < mh; j++) {
        for (let i = 0; i < mw; i++) {
          const gx = fgx0 + i, gy = fgy0 + j;
          const inMap = gx >= 0 && gx < cols && gy >= 0 && gy < rows;
          const a = inMap ? fogAlpha[gy * cols + gx] : (this.engine.state.fullMapView ? 0 : 0.7);
          if (a > 0) {
            mctx.fillStyle = `rgba(12, 20, 30, ${a})`;
            mctx.fillRect(i, j, 1, 1);
          }
        }
      }
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(this._fogMask, 0, 0, mw, mh, fgx0 * ts + ox, fgy0 * ts + oy, mw * ts, mh * ts);
      ctx.restore();
    }

    // 環境動態：陽光光束與章節粒子（花瓣/浪花/餘燼/雪/紫光微粒）
    {
      const W = this.logicalWidth, H = this.logicalHeight;
      const chA = this.engine.state.chapter || 1;
      const af = this.animFrame;
      if (chA !== 3 && chA !== 5) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        for (let i = 0; i < 4; i++) {
          const x0 = W * (0.25 + i * 0.2) + Math.sin(af * 0.008 + i * 2) * 26;
          const g = ctx.createLinearGradient(x0, 0, x0 - W * 0.22, H);
          g.addColorStop(0, "rgba(255,246,205,0.13)");
          g.addColorStop(1, "rgba(255,246,205,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.moveTo(x0, 0); ctx.lineTo(x0 + 70, 0); ctx.lineTo(x0 - W * 0.22 + 40, H); ctx.lineTo(x0 - W * 0.22 - 60, H);
          ctx.closePath(); ctx.fill();
        }
        ctx.restore();
      }
      const cols2 = { 1: "255,190,215", 2: "255,255,255", 3: "255,150,60", 4: "255,255,255", 5: "220,160,255" };
      const pc = cols2[chA] || cols2[1];
      for (let i = 0; i < 34; i++) {
        const seed = i * 53.7;
        let fx, fy;
        if (chA === 3) { fx = (seed * 7 + Math.sin(af * 0.03 + i) * 20) % W; fy = H - ((af * (0.6 + (i % 4) * 0.25) + seed * 11) % H); }
        else if (chA === 4) { fx = (seed * 9 + Math.sin(af * 0.02 + i) * 24 + af * 0.2) % W; fy = ((af * (0.5 + (i % 3) * 0.3) + seed * 13) % H); }
        else { fx = (seed * 11 + af * (0.3 + (i % 4) * 0.12)) % W; fy = ((seed * 17 + Math.sin(af * 0.025 + i) * 26) % H + H) % H * 0.95; }
        const sz = chA === 4 ? 2 + (i % 3) : 2 + (i % 2);
        ctx.fillStyle = `rgba(${pc},${0.35 + 0.4 * Math.abs(Math.sin(af * 0.04 + i))})`;
        ctx.fillRect(Math.round(fx), Math.round(fy), sz, sz);
      }
    }

    // 全域光影：章節色調、主角光暈、暗角（讓 2D 地圖有陽光氛圍）
    {
      const moods = {
        1: ["255,248,220", "120,160,90"],
        2: ["255,250,235", "90,150,170"],
        3: ["255,200,140", "150,70,40"],
        4: ["235,245,255", "120,160,210"],
        5: ["255,190,170", "90,40,110"]
      };
      const [lightC, shadeC] = moods[this.engine.state.chapter] || moods[1];
      const W = this.logicalWidth, H = this.logicalHeight;
      ctx.save();
      ctx.globalCompositeOperation = "multiply";
      const gg = ctx.createLinearGradient(0, 0, W, H);
      gg.addColorStop(0, `rgba(${lightC},1)`);
      gg.addColorStop(1, `rgba(${shadeC},1)`);
      ctx.fillStyle = gg;
      ctx.globalAlpha = 0.22;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "lighter";
      const hxp = (this._hx ?? this.engine.state.x) * ts + ts / 2 + ox;
      const hyp = (this._hy ?? this.engine.state.y) * ts + ts / 2 + oy;
      const hg = ctx.createRadialGradient(hxp, hyp, ts * 0.3, hxp, hyp, ts * 6);
      hg.addColorStop(0, `rgba(${lightC},0.22)`);
      hg.addColorStop(1, `rgba(${lightC},0)`);
      ctx.fillStyle = hg;
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";
      const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.42, W / 2, H / 2, H * 0.95);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(5,15,10,0.45)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    // 繪製 [Q] 星輝脈衝波紋擴散動畫
    if (this.engine.lastPulseAnim && this.engine.lastPulseAnim.ticks > 0) {
      const pa = this.engine.lastPulseAnim;
      const prog = (pa.maxTicks - pa.ticks) / pa.maxTicks;
      const pulseR = prog * 3.6 * ts;
      const pCx = pa.x * ts + ts / 2 + ox;
      const pCy = pa.y * ts + ts / 2 + oy;
      ctx.save();
      ctx.strokeStyle = `rgba(56, 189, 248, ${(1 - prog) * 0.9})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(pCx, pCy, pulseR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = `rgba(250, 204, 21, ${(1 - prog) * 0.7})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(pCx, pCy, pulseR * 0.75, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      pa.ticks--;
    }

    // 若玩家主動開啟「星輝羅盤輔助」，才繪製金色像素導引路線
    if (obj && this.engine.state.compassEnabled) {
      const guidePath = this.engine.findGuidePath(obj.x, obj.y);
      guidePath.forEach((stepInfo, i) => {
        if (i < guidePath.length - 1) {
          const gx = stepInfo[2] * ts + ts / 2 - 4 + ox;
          const gy = stepInfo[3] * ts + ts / 2 - 4 + oy;
          ctx.fillStyle = (i + frame2) % 2 === 0 ? "#facc15" : "#38bdf8";
          ctx.fillRect(gx, gy, 8, 8);
          ctx.strokeStyle = "#090d16";
          ctx.lineWidth = 1;
          ctx.strokeRect(gx, gy, 8, 8);
        }
      });
    }

    // 繪製滑鼠懸停像素選取框
    if (this.hoverTile) {
      const htx = this.hoverTile.x * ts + ox;
      const hty = this.hoverTile.y * ts + oy;
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.strokeRect(htx + 1, hty + 1, ts - 2, ts - 2);
    }

    // 繪製主角與隨行星靈夥伴（含 HD-2D 點光源光暈、腳底落影與武器五屬性附魔星環）
    if (combatNow && combatNow.rt) this.drawRtMonster(ctx, ts, ox, oy, frame2);
    const hx = (this._hx ?? this.engine.state.x) * ts + ox;
    const hy = (this._hy ?? this.engine.state.y) * ts + oy;
    const hCenterX = hx + ts / 2;
    const hCenterY = hy + ts / 2;

    const elemGlowColors = {
      physical: "#facc15",
      star: "#38bdf8",
      fire: "#fb923c",
      frost: "#7dd3fc",
      void: "#c084fc"
    };
    const curElemColor = elemGlowColors[this.engine.state.weaponElement || "physical"] || "#facc15";

    const heroGlow = ctx.createRadialGradient(hCenterX, hCenterY, ts * 0.15, hCenterX, hCenterY, ts * 1.65);
    heroGlow.addColorStop(0, "rgba(250, 204, 21, 0.22)");
    heroGlow.addColorStop(0.55, "rgba(56, 189, 248, 0.08)");
    heroGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = heroGlow;
    ctx.fillRect(hx - ts, hy - ts, ts * 3, ts * 3);

    // 主角腳底像素陰影與附魔屬性光環
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.beginPath();
    ctx.ellipse(hx + ts / 2, hy + ts - 4, ts * 0.32, ts * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = curElemColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(hx + ts / 2, hy + ts - 4, ts * 0.4, ts * 0.14, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 即時戰鬥：翻滾無敵時半透明閃爍，受擊時紅閃
    const rtc = combatNow && combatNow.rt;
    const hpNow = this.engine.state.hp;
    if (rtc && typeof this._lastHeroHp === "number" && hpNow < this._lastHeroHp) this._heroHitTicks = 16;
    this._lastHeroHp = hpNow;
    ctx.save();
    if (rtc && rtc.ivT > 0) ctx.globalAlpha = this.animFrame % 4 < 2 ? 0.35 : 0.7;
    if (this._heroHitTicks > 0) {
      ctx.filter = this._heroHitTicks % 4 < 2 ? "brightness(2.2) sepia(1) saturate(6) hue-rotate(-30deg)" : "none";
      this._heroHitTicks--;
    }
    this.px.drawSprite(ctx, frame2 ? "hero_1" : "hero_0", hx + 3, hy + 3, ts - 6);
    ctx.restore();

    const petObj = this.engine.data.companions[this.engine.state.companion || "lumi"];
    if (petObj) {
      const petBob = Math.sin(this.animFrame * 0.12) * 3;
      const petSz = Math.max(16, Math.round(ts * 0.52));
      this.px.drawSprite(ctx, petObj.icon, hx + ts - petSz + 2, hy - 4 + petBob, petSz);
    }

    if (combatNow && combatNow.rt) this.drawRtEffects(ctx, ts, ox, oy);
    else this.drawFieldSwing(ctx, hx, hy, ts);

    // 近景跟隨視角下的 HD-2D 柔和暗角 (Atmospheric Vignette)
    if (!this.engine.state.fullMapView) {
      const vig = ctx.createRadialGradient(
        this.logicalWidth / 2,
        this.logicalHeight / 2,
        this.logicalHeight * 0.34,
        this.logicalWidth / 2,
        this.logicalHeight / 2,
        this.logicalWidth * 0.62
      );
      vig.addColorStop(0, "rgba(0, 0, 0, 0)");
      vig.addColorStop(1, "rgba(3, 5, 12, 0.44)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, this.logicalWidth, this.logicalHeight);
    }

    // 繪製已探索區域的地圖物件中文像素名牌
    ctx.font = "bold 11px 'PingFang TC', 'Microsoft JhengHei', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const labels = this.engine.activeLabels || {};
    Object.entries(labels).forEach(([coord, labelText]) => {
      if (!expMap[coord] && !this.engine.state.compassEnabled) return;
      const [lx, ly] = coord.split(",").map(Number);
      if (!map[ly] || map[ly][lx] === ".") return;
      const cx = lx * ts + ts / 2 + ox;
      const cy = Math.max(10, ly * ts - 5 + oy);
      if (cx < -40 || cx > this.logicalWidth + 40 || cy < -20 || cy > this.logicalHeight + 20) return;
      const textW = ctx.measureText(labelText).width + 10;
      const isTarget = obj && obj.x === lx && obj.y === ly;

      ctx.fillStyle = isTarget ? "#854d0e" : "rgba(9, 13, 22, 0.88)";
      ctx.fillRect(cx - textW / 2, cy - 8, textW, 16);
      ctx.strokeStyle = isTarget ? "#facc15" : "#475569";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cx - textW / 2, cy - 8, textW, 16);
      ctx.fillStyle = isTarget ? "#fef08a" : "#f8fafc";
      ctx.fillText(labelText, cx, cy);
    });

    // 在當前任務目標正上方繪製跳動的金色像素 [!] 標記（僅在已探索或開啟羅盤時顯示）
    if (obj && (expMap[`${obj.x},${obj.y}`] || this.engine.state.compassEnabled)) {
      const bounce = Math.sin(this.animFrame * 0.16) * 4;
      const mx = obj.x * ts + ts / 2 - 12 + ox;
      const my = Math.max(2, obj.y * ts - 32 + bounce + oy);
      this.px.drawSprite(ctx, "quest_marker", mx, my, 24);
    }

    // 繪製地圖浮動跳字特效
    for (let i = this.mapFloats.length - 1; i >= 0; i--) {
      const ft = this.mapFloats[i];
      const fpx = (typeof ft.tx === "number" ? ft.tx * ts + ts / 2 + ox : ft.px);
      const fpy = (typeof ft.ty === "number" ? ft.ty * ts + oy : ft.py);
      const rise = (ft.maxTicks - ft.ticks) * 0.7;
      ctx.font = "bold 13px 'PingFang TC', monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = "#090d16";
      ctx.fillText(ft.text, fpx + 1, fpy - rise + 1);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, fpx, fpy - rise);
      ft.ticks--;
      if (ft.ticks <= 0) this.mapFloats.splice(i, 1);
    }

    // 環境像素星塵粒子
    ctx.fillStyle = themeColor;
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < 0) p.y = this.logicalHeight;
      if (p.x < 0) p.x = this.logicalWidth;
      if (p.x > this.logicalWidth) p.x = 0;
      ctx.globalAlpha = p.alpha;
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.s, p.s);
    });
    ctx.globalAlpha = 1.0;

    // 繪製左上角狀態標籤 (視野強化 / 星泉祝福)
    let badgeY = 12;
    if ((this.engine.state.pulseVisionSteps || 0) > 0) {
      ctx.fillStyle = "rgba(12, 74, 110, 0.9)";
      ctx.fillRect(12, badgeY, 178, 22);
      ctx.strokeStyle = "#38bdf8";
      ctx.strokeRect(12, badgeY, 178, 22);
      ctx.fillStyle = "#7dd3fc";
      ctx.font = "bold 11.5px 'PingFang TC', monospace";
      ctx.textAlign = "left";
      ctx.fillText(`[星眸照明] 視野+3 (${this.engine.state.pulseVisionSteps}步)`, 18, badgeY + 11);
      badgeY += 26;
    }
    if (this.engine.state.fieldBuff && this.engine.state.fieldBuff.battlesLeft > 0) {
      ctx.fillStyle = "rgba(20, 83, 45, 0.9)";
      ctx.fillRect(12, badgeY, 210, 22);
      ctx.strokeStyle = "#4ade80";
      ctx.strokeRect(12, badgeY, 210, 22);
      ctx.fillStyle = "#86efac";
      ctx.font = "bold 11.5px 'PingFang TC', monospace";
      ctx.textAlign = "left";
      ctx.fillText(`[星泉祝福] 攻防+18% (剩${this.engine.state.fieldBuff.battlesLeft}戰)`, 18, badgeY + 11);
    }

    // 近景模式下於右上角繪製「40x28 即時像素小地圖雷達」
    if (!this.engine.state.fullMapView) {
      this.drawMinimap(ctx, map, expMap, obj, ts);
    }
  }

  drawMinimap(ctx, map, expMap, obj, ts) {
    const rows = map.length;
    const cols = map[0].length;
    const mmScale = 3;
    const mmW = cols * mmScale;
    const mmH = rows * mmScale;
    const mmX = this.logicalWidth - mmW - 12;
    const mmY = 22;
    const expPct = this.engine.getZoneExplorationPercent ? this.engine.getZoneExplorationPercent() : 0;

    ctx.fillStyle = "rgba(6, 9, 17, 0.92)";
    ctx.fillRect(mmX - 4, mmY - 18, mmW + 8, mmH + 22);
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(mmX - 4, mmY - 18, mmW + 8, mmH + 22);

    ctx.font = "bold 10px 'PingFang TC', monospace";
    ctx.textAlign = "left";
    ctx.fillStyle = "#bae6fd";
    ctx.fillText(`雷達 探索${expPct}% (M全景)`, mmX, mmY - 7);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const coord = `${x},${y}`;
        if (!expMap[coord]) continue;
        const tile = map[y][x];
        let col = "#1e293b";
        if (tile === "#") col = "#334155";
        else if (tile === "~") col = "#0284c7";
        else if (tile === "W" || tile === "O") col = "#38bdf8";
        else if (tile === "C" || tile === "V" || tile === "U") col = "#facc15";
        else if (tile === "E" || tile === "B" || tile === "T") col = "#f43f5e";
        else if (tile === "F" || tile === "D" || tile === "N") col = "#4ade80";
        else if (tile === ">" || tile === "<" || tile === "P") col = "#c084fc";
        ctx.fillStyle = col;
        ctx.fillRect(mmX + x * mmScale, mmY + y * mmScale, mmScale, mmScale);
      }
    }

    if (obj && (expMap[`${obj.x},${obj.y}`] || this.engine.state.compassEnabled)) {
      ctx.fillStyle = "#facc15";
      ctx.fillRect(mmX + obj.x * mmScale - 1, mmY + obj.y * mmScale - 1, mmScale + 2, mmScale + 2);
    }

    // 繪製主角位置亮點
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(mmX + this.engine.state.x * mmScale - 1, mmY + this.engine.state.y * mmScale - 1, mmScale + 2, mmScale + 2);

    // 繪製當前鏡頭視窗框
    const vx = mmX + (this.camX / ts) * mmScale;
    const vy = mmY + (this.camY / ts) * mmScale;
    const vw = (this.logicalWidth / ts) * mmScale;
    const vh = (this.logicalHeight / ts) * mmScale;
    ctx.strokeStyle = "rgba(250, 204, 21, 0.7)";
    ctx.lineWidth = 1;
    ctx.strokeRect(vx, vy, Math.min(mmW, vw), Math.min(mmH, vh));
  }

  drawPixelTileObject(ctx, tile, x, y, px, py, ts, frame2) {
    const alive = tile === "E" || tile === "B" || tile === "N";
    const bob = alive ? Math.sin(this.animFrame * 0.09 + x * 1.7 + y) * Math.max(1.5, ts * 0.04) : 0;
    if (!bob) return this.drawPixelTileObjectCore(ctx, tile, x, y, px, py, ts, frame2);
    ctx.save();
    ctx.translate(0, bob);
    this.drawPixelTileObjectCore(ctx, tile, x, y, px, py, ts, frame2);
    ctx.restore();
  }

  drawPixelTileObjectCore(ctx, tile, x, y, px, py, ts, frame2) {
    if (tile === "." || tile === "#" || tile === "~" || tile === "=") return;
    const ev = this.engine.resolveEventAt ? this.engine.resolveEventAt(x, y, tile) : this.engine.activeEvents[`${x},${y}`];
    const pad = Math.max(2, Math.round(ts * 0.09));
    const sz = ts - pad * 2;
    const cx = px + ts / 2;
    const cy = py + ts / 2;

    // 物件落影
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.beginPath();
    ctx.ellipse(cx, py + ts * 0.9, ts * 0.32, ts * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();

    // 繪製重要發光地標之 HD-2D 點光源光暈
    const lightColors = {
      F: "rgba(251, 146, 60, 0.28)",
      D: "rgba(45, 212, 191, 0.25)",
      O: "rgba(56, 189, 248, 0.26)",
      U: "rgba(250, 204, 21, 0.26)",
      V: "rgba(192, 132, 252, 0.24)",
      P: "rgba(167, 139, 250, 0.3)",
      "?": "rgba(232, 121, 249, 0.24)"
    };
    if (lightColors[tile]) {
      const pulse = 0.88 + Math.sin(this.animFrame * 0.1 + x + y) * 0.12;
      const rad = ts * 1.15 * pulse;
      const grad = ctx.createRadialGradient(cx, cy, ts * 0.1, cx, cy, rad);
      grad.addColorStop(0, lightColors[tile]);
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(px - ts * 0.5, py - ts * 0.5, ts * 2, ts * 2);
    }

    // 為立體物件與角色繪製底部像素落影
    if (["N", "C", "E", "B", "A", "V", "U", "S", "R", "?"].includes(tile)) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.42)";
      ctx.fillRect(px + Math.round(ts * 0.18), py + ts - 5, Math.round(ts * 0.64), 4);
    }

    switch (tile) {
      case "F":
        this.px.drawSprite(ctx, frame2 ? "campfire_1" : "campfire_0", px + pad, py + pad, sz);
        break;
      case "A":
        this.px.drawSprite(ctx, "anvil", px + pad, py + pad, sz);
        break;
      case "?":
        this.px.drawSprite(ctx, "mystery", px + pad, py + pad - frame2, sz);
        break;
      case "W":
        this.px.drawSprite(ctx, "secret_wall", px, py, ts);
        break;
      case "T":
        this.px.drawSprite(ctx, "trap_spike", px + pad, py + pad, sz);
        break;
      case "D":
        this.px.drawSprite(ctx, "fountain", px + pad, py + pad, sz);
        break;
      case "V":
        this.px.drawSprite(ctx, "obelisk_trial", px + pad, py + pad, sz);
        break;
      case "O":
        this.px.drawSprite(ctx, "warp_pad", px + pad, py + pad, sz);
        break;
      case "U":
        this.px.drawSprite(ctx, "ancient_reliquary", px + pad, py + pad, sz);
        break;
      case "N":
        this.px.drawSprite(ctx, ev && ev.icon ? ev.icon : "npc_elder", px + pad, py + pad - frame2, sz);
        break;
      case "C":
        this.px.drawSprite(ctx, "chest_closed", px + pad, py + pad, sz);
        break;
      case "L":
        this.px.drawSprite(ctx, "scroll", px + pad, py + pad - frame2, sz);
        break;
      case "M":
        this.px.drawSprite(ctx, ev && ev.item === "moon_herb" ? "herb" : "crystal", px + pad, py + pad - frame2, sz);
        break;
      case "S": {
        const activated = ev && (this.engine.state.flags[ev.id] || (ev.flag && this.engine.state.flags[ev.flag]));
        if (activated) {
          const sGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, ts);
          sGrad.addColorStop(0, "rgba(250, 204, 21, 0.25)");
          sGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = sGrad;
          ctx.fillRect(px - ts * 0.3, py - ts * 0.3, ts * 1.6, ts * 1.6);
        }
        this.px.drawSprite(ctx, activated ? "shrine_on" : "shrine_off", px + pad, py + pad, sz);
        break;
      }
      case "R": {
        const solved = ev && this.engine.state.flags[ev.flag];
        this.px.drawSprite(ctx, solved ? "cipher_on" : "cipher_off", px + pad, py + pad, sz);
        break;
      }
      case "G":
        this.px.drawSprite(ctx, "gate_locked", px + pad, py + pad, sz);
        break;
      case "E": {
        const en = ev && this.engine.data.enemies[ev.enemyId];
        if (en && en.isElite) {
          // 精英：放大 1.25 倍並加橘色光環，與普通魔物一眼區分
          const es = (ts - 6) * 1.25;
          ctx.strokeStyle = "rgba(251, 146, 60, 0.9)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(cx, py + ts * 0.9, ts * 0.42, ts * 0.12, 0, 0, Math.PI * 2);
          ctx.stroke();
          this.px.drawSprite(ctx, en.icon, cx - es / 2, py + ts * 0.94 - es - frame2, es);
        } else {
          this.px.drawSprite(ctx, en ? en.icon : "enemy_wolf", px + 3, py + 3 - frame2, ts - 6);
        }
        if (ev && ev.stunnedSteps > 0) {
          ctx.strokeStyle = "#facc15";
          ctx.lineWidth = 2;
          ctx.strokeRect(px + 2, py + 2, ts - 4, ts - 4);
        }
        break;
      }
      case "B": {
        const bo = ev && this.engine.data.enemies[ev.enemyId];
        const bGlow = ctx.createRadialGradient(cx, cy, 4, cx, cy, ts * 1.2);
        bGlow.addColorStop(0, "rgba(244, 63, 94, 0.32)");
        bGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = bGlow;
        ctx.fillRect(px - ts * 0.4, py - ts * 0.4, ts * 1.8, ts * 1.8);
        const bs = ts * 1.45;
        this.px.drawSprite(ctx, bo ? bo.icon : "boss_behemoth", cx - bs / 2, py + ts * 0.96 - bs - frame2, bs);
        if (ev && ev.stunnedSteps > 0) {
          ctx.strokeStyle = "#facc15";
          ctx.lineWidth = 2;
          ctx.strokeRect(px + 1, py + 1, ts - 2, ts - 2);
        }
        break;
      }
      case ">":
        this.px.drawSprite(ctx, "stairs_next", px + pad, py + pad, sz);
        break;
      case "<":
        this.px.drawSprite(ctx, "stairs_prev", px + pad, py + pad, sz);
        break;
      case "P":
        this.px.drawSprite(ctx, frame2 ? "portal_1" : "portal_0", px + pad, py + pad, sz);
        break;
    }
  }

  renderAll() {
    this.renderHUD();
    this.renderGuideBanner();
    this.renderCompanionWidget();
    this.renderObjectiveTracker();
    this.syncCombatMode();
    this.renderQuickInventory();
  }

  renderGuideBanner() {
    const obj = this.engine.getCurrentObjective();
    if (!obj) return;
    const mainEl = document.getElementById("guide-main-text");
    const subEl = document.getElementById("guide-sub-text");
    if (mainEl) mainEl.textContent = `[${obj.step || "當前目標"}] ${obj.text}`;
    if (subEl && !this.hoverTile) {
      subEl.textContent = obj.sub || "使用 WASD / 方向鍵或點擊已探索的地圖格進行探索。";
    }
    const compassBtn = document.getElementById("btn-toggle-compass");
    if (compassBtn) {
      compassBtn.textContent = `星輝羅盤：${this.engine.state.compassEnabled ? "開" : "關"}`;
    }
    const viewBtn = document.getElementById("btn-toggle-view");
    if (viewBtn) {
      viewBtn.textContent = `[M] 全景地圖：${this.engine.state.fullMapView ? "開" : "關"}`;
    }
    const pulseBtn = document.getElementById("btn-astral-pulse");
    if (pulseBtn) {
      const cd = this.engine.state.pulseCooldown || 0;
      pulseBtn.textContent = cd > 0 ? `[Q] 星輝脈衝 (冷卻 ${cd} 步)` : `[Q] 星輝脈衝`;
    }
    const elemBtn = document.getElementById("btn-weapon-elem");
    if (elemBtn) {
      const elemMap = { physical: "物理", star: "星輝", fire: "烈焰", frost: "寒霜", void: "虛空" };
      const curE = this.engine.state.weaponElement || "physical";
      elemBtn.textContent = `[E] 武器附魔：${elemMap[curE] || curE}`;
    }
    const mode3dBtn = document.getElementById("btn-toggle-3d");
    if (mode3dBtn) {
      const vm = this.engine.state.viewMode || "3d_shoulder";
      const vmNames = {
        "3d_shoulder": "3D越肩狩獵",
        "3d_orbit": "3D廣角戰術",
        "2d_pixel": "2D經典像素"
      };
      mode3dBtn.textContent = `[V] 視角：${vmNames[vm] || "3D越肩狩獵"}`;
    }
    const sharpenBtn = document.getElementById("btn-sharpen");
    if (sharpenBtn && this.engine.getSharpnessTierInfo) {
      const sh = this.engine.getSharpnessTierInfo();
      sharpenBtn.textContent = `[R] 砥石磨刀 (${sh.label} ${this.engine.state.sharpness ?? 100})`;
    }
  }

  renderHUD() {
    const s = this.engine.state;
    const comp = this.engine.getComputedStats();
    const ch = this.engine.data.chapters[s.chapter] || this.engine.data.chapters[1];
    const z = s.subZone || 1;
    const zObj = ch.zones && ch.zones[z] ? ch.zones[z] : null;

    const titleEl = document.getElementById("chapter-title");
    if (titleEl) {
      titleEl.textContent = s.inAbyss
        ? `無盡星淵試煉 — 第 ${s.abyssFloor} 層`
        : zObj
        ? `${ch.name} — [${s.chapter}-${z} ${zObj.name}]`
        : ch.name;
    }

    document.getElementById("hud-level").textContent = `Lv.${s.level}`;
    document.getElementById("hud-exp").textContent = `${s.exp}/${s.maxExp}`;
    document.getElementById("hud-gold").textContent = `${s.gold} G`;
    document.getElementById("hud-sp").textContent = `${s.skillPoints} 點`;
    document.getElementById("hud-lore-count").textContent = `${s.loreUnlocked.length}/15`;
    document.getElementById("hud-ach-count").textContent = `${s.achievements.length}/${this.engine.data.achievements.length}`;

    const hpPct = Math.max(0, Math.min(100, Math.round((s.hp / s.maxHp) * 100)));
    const mpPct = Math.max(0, Math.min(100, Math.round((s.mp / s.maxMp) * 100)));
    const burstPct = Math.max(0, Math.min(100, s.burst));

    document.getElementById("bar-hp").style.width = `${hpPct}%`;
    document.getElementById("text-hp").textContent = `${s.hp} / ${s.maxHp}`;
    document.getElementById("bar-mp").style.width = `${mpPct}%`;
    document.getElementById("text-mp").textContent = `${s.mp} / ${s.maxMp}`;
    document.getElementById("bar-burst").style.width = `${burstPct}%`;
    document.getElementById("text-burst").textContent = `${s.burst}%`;

    document.getElementById("stat-atk").textContent = comp.atk;
    document.getElementById("stat-def").textContent = comp.def;
    document.getElementById("stat-crit").textContent = `${comp.crit}%`;

    const wObj = this.engine.data.items[s.equipment.weapon];
    const aObj = this.engine.data.items[s.equipment.armor];
    const rObj = this.engine.data.items[s.equipment.relic];
    const upgs = s.equipUpgrades || { weapon: 0, armor: 0, relic: 0 };

    const formatEqSlot = (obj, slotKey) => {
      if (!obj) return "無";
      const statStr = this.getShortStatSummary(obj);
      const upLv = upgs[slotKey] || 0;
      const upTag = upLv > 0 ? ` <span style="color:#facc15;font-weight:800;">+${upLv}</span>` : "";
      return `<div style="text-align:right;">
        <div>${this.px.icon(obj.icon, 15)} ${obj.name}${upTag}</div>
        <div style="font-size:11px;color:#4ade80;font-weight:700;">[${statStr}]</div>
      </div>`;
    };

    document.getElementById("eq-weapon").innerHTML = formatEqSlot(wObj, "weapon");
    document.getElementById("eq-armor").innerHTML = formatEqSlot(aObj, "armor");
    document.getElementById("eq-relic").innerHTML = formatEqSlot(rObj, "relic");

    const eqSection = document.getElementById("eq-weapon").closest("div.equip-summary");
    let alertBanner = document.getElementById("better-equip-alert");
    if (this.hasBetterEquipInBag()) {
      if (!alertBanner && eqSection) {
        alertBanner = document.createElement("button");
        alertBanner.id = "better-equip-alert";
        alertBanner.className = "btn-sm btn-teal";
        alertBanner.style.width = "100%";
        alertBanner.style.marginTop = "4px";
        alertBanner.onclick = () => this.openModal("inventory");
        eqSection.appendChild(alertBanner);
      }
      if (alertBanner) {
        alertBanner.textContent = "[!] 背包有更強裝備可替換 (點此查看數值對比)";
        alertBanner.style.display = "block";
      }
    } else if (alertBanner) {
      alertBanner.style.display = "none";
    }
  }

  renderCompanionWidget() {
    const box = document.getElementById("companion-quick-box");
    if (!box) return;
    const s = this.engine.state;
    const unlocked = s.unlockedCompanions || ["lumi"];
    const activeId = s.companion || "lumi";
    const activeObj = this.engine.data.companions[activeId];

    const buttonsHtml = Object.values(this.engine.data.companions)
      .map(c => {
        const isUnlocked = unlocked.includes(c.id);
        const isActive = c.id === activeId;
        return `<button class="btn-sm ${isActive ? "btn-teal" : "btn-secondary"}"
                  style="padding: 4px 8px; font-size: 12px; display: inline-flex; align-items: center; gap: 4px;"
                  ${isUnlocked ? "" : "disabled"}
                  title="${isUnlocked ? c.desc : `第 ${c.unlockChapter} 章自動解鎖`}"
                  onclick="window.gameUI.onSelectCompanion('${c.id}')">
                  ${this.px.icon(c.icon, 15)} ${c.name.split("・")[1] || c.name}
                </button>`;
      })
      .join("");

    box.innerHTML = `
      <div style="font-size: 12px; color: #cbd5e1; margin-bottom: 5px; display: flex; align-items: center; gap: 6px;">
        ${this.px.icon(activeObj.icon, 20)}
        <span>當前同行：<strong style="color: #2dd4bf;">${activeObj.name}</strong></span>
      </div>
      <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px; line-height: 1.35;">
        ${activeObj.desc}
      </div>
      <div style="display: flex; gap: 4px; flex-wrap: wrap;">${buttonsHtml}</div>
    `;
  }

  onSelectCompanion(compId) {
    if (this.engine.selectCompanion(compId)) {
      this.renderAll();
    }
  }

  renderObjectiveTracker() {
    const s = this.engine.state;
    const box = document.getElementById("quest-tracker-list");
    if (!box) return;

    const tasks = [];
    if (s.inAbyss) {
      tasks.push({ done: false, text: `探索無盡星淵第 ${s.abyssFloor} 層並擊敗深淵首領` });
      tasks.push({ done: false, text: `歷史最高紀錄：第 ${s.maxAbyssFloor} 層` });
    } else if (s.chapter === 1) {
      tasks.push({ done: !!s.keys["key_rusty_gate"], text: "[1-1] 與【村長奧爾森(4,1)】交談領取守林人銅鑰" });
      const lit = ["s1_west", "s1_south", "s1_east"].filter(k => s.flags[k]).length;
      tasks.push({ done: !!s.flags["ch1_shrines_solved"], text: `[1-1] 點亮外圍林道三座【古老星碑】(${lit}/3)` });
      tasks.push({ done: !!s.flags["ch1_z2_bridge"], text: "[1-2] 啟動迷霧幽林【溪流木橋閥(9,3)】並尋找手札線索" });
      tasks.push({ done: !!s.flags["ch1_riddle_solved"], text: "[1-3] 解開古樹聖所【符文密碼鎖(8,3)】" });
      tasks.push({ done: !!s.flags["ch1_boss_defeated"], text: "[1-3] 擊敗首領【荊棘巨獸・巴爾薩(15,7)】並踏入星門" });
    } else if (s.chapter === 2) {
      tasks.push({ done: !!(s.flags["valve_west"] && s.flags["valve_east"]), text: "[2-1] 尋訪【薇薇安】並開啟東西兩座排水閥架起虹吸橋" });
      tasks.push({ done: !!s.flags["ch2_z2_sluice"], text: "[2-2] 啟動水閘迷宮【深淵水閘總閥(16,2)】並閱讀學徒手札" });
      tasks.push({ done: !!s.flags["ch2_cipher_solved"], text: "[2-3] 根據手札線索解開【時鐘密碼終端(8,3)】" });
      tasks.push({ done: !!s.flags["ch2_boss_defeated"], text: "[2-3] 擊敗首領【時之守衛・克羅諾斯(15,7)】" });
    } else if (s.chapter === 3) {
      tasks.push({ done: !!(s.keys["dwarven_sigil"] && s.flags["lava_east"]), text: "[3-1] 取得【火紋章】並啟動東側導流閥凝結黑曜石橋" });
      tasks.push({ done: !!s.flags["ch3_z2_sluice"], text: "[3-2] 啟動熔岩大廳【高爐冷卻總閥(16,2)】並閱讀控制手冊" });
      tasks.push({ done: !!s.flags["ch3_riddle_solved"], text: "[3-3] 根據手札線索解開【矮人王座符文鎖(8,3)】" });
      tasks.push({ done: !!s.flags["ch3_boss_defeated"], text: "[3-3] 擊敗首領【赤焰巨龍・伊格尼斯(15,7)】" });
    } else if (s.chapter === 4) {
      tasks.push({ done: !!(s.keys["astral_lens"] && s.flags["astrolabe_east"]), text: "[4-1] 取得【觀星稜鏡】、啟動北極星盤並閱讀機密檔案" });
      tasks.push({ done: !!s.flags["ch4_z2_prism"], text: "[4-2] 啟動天球儀室【天球主折光鏡(16,2)】架起星橋" });
      tasks.push({ done: !!s.flags["ch4_cipher_solved"], text: "[4-3] 根據手札線索完成【天球儀認證終端(8,3)】" });
      tasks.push({ done: !!s.flags["ch4_boss_defeated"], text: "[4-3] 擊敗首領【虛空星使・阿斯特拉(15,7)】" });
    } else if (s.chapter === 5) {
      tasks.push({ done: !!(s.flags["npc_reward_5_3,3"] && s.flags["sanctum_altar_2"]), text: "[5-1] 與【星核意志・艾歐拉】交談並啟動東側淨化星碑" });
      tasks.push({ done: !!s.flags["ch5_z2_bridge"], text: "[5-2] 啟動四象迴廊【皇家星樞開關(16,2)】" });
      tasks.push({ done: !!s.flags["ch5_throne_unlocked"], text: "[5-3] 根據手札線索解開【王座封印終端(8,3)】" });
      tasks.push({ done: !!s.flags["ch5_boss_defeated"], text: "[5-3] 擊敗最終首領【噬星者・莫比烏斯(15,7)】" });
    }

    let html = tasks
      .map(
        t => `<div class="quest-item ${t.done ? "done" : ""}">
          <span style="color: ${t.done ? "#4ade80" : "#facc15"}; font-weight: 800;">[${t.done ? "完成" : "主線"}]</span>
          <span>${t.text}</span>
        </div>`
      )
      .join("");

    if (!s.inAbyss && this.engine.data.sideQuests) {
      const chapQuests = Object.values(this.engine.data.sideQuests).filter(q => q.chapter === s.chapter);
      if (chapQuests.length > 0) {
        html += `<div style="margin-top: 6px; padding-top: 5px; border-top: 1px dashed rgba(148,163,184,0.2); font-size: 11px; color: #38bdf8; font-weight: 700;">本章支線委託：</div>`;
        html += chapQuests
          .map(sq => {
            const prog = this.engine.getSideQuestProgress(sq.id);
            const done = prog && prog.completed;
            const cur = prog ? prog.current : 0;
            const tgt = prog ? prog.target : 1;
            return `<div class="quest-item ${done ? "done" : ""}" title="${sq.desc}｜獎勵：${sq.rewardText}">
              <span style="color: ${done ? "#4ade80" : "#38bdf8"}; font-weight: 800;">[${done ? "已達成" : `支線 ${cur}/${tgt}`}]</span>
              <span>${sq.title}（${sq.desc}）</span>
            </div>`;
          })
          .join("");
      }
    }

    box.innerHTML = html;
  }

  renderQuickInventory() {
    const box = document.getElementById("quick-consumables");
    if (!box) return;
    const s = this.engine.state;
    const consumables = Object.entries(s.inventory)
      .map(([id, cnt]) => ({ item: this.engine.data.items[id], cnt }))
      .filter(x => x.item && x.item.category === "consumable" && x.cnt > 0);

    if (consumables.length === 0) {
      box.innerHTML = `<div class="empty-hint">尚無消耗品，可於鐵砧或星界行商補充</div>`;
      return;
    }

    box.innerHTML = consumables
      .map(
        ({ item, cnt }) => `
        <button class="quick-item-btn" onclick="window.gameUI.onUseItemClick('${item.id}')" title="${item.desc}">
          <span style="display:inline-flex;align-items:center;gap:6px;">
            ${this.px.icon(item.icon, 16)} ${item.name}
            <small style="color:#4ade80;">(${this.getShortStatSummary(item)})</small>
          </span>
          <span class="badge-cnt">x${cnt}</span>
        </button>`
      )
      .join("");
  }

  onLogAdded(entry) {
    const container = document.getElementById("adventure-log");
    if (!container) return;
    const div = document.createElement("div");
    div.className = `log-entry log-${entry.type}`;
    div.innerHTML = `<span class="log-time">[${entry.time}]</span> ${entry.msg}`;
    container.prepend(div);
  }

  showToast(text, style = "teal") {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const t = document.createElement("div");
    t.className = `toast toast-${style}`;
    t.textContent = text;
    container.appendChild(t);
    setTimeout(() => {
      t.classList.add("fade-out");
      setTimeout(() => t.remove(), 350);
    }, 2800);
  }

  showChapterBanner(ch) {
    this.showToast(`[進入新章節] ${ch.name}`, "gold");
    this.renderAll();
  }

  // ==================== 互動視窗 (Modals) ====================
  closeModals() {
    document.querySelectorAll(".modal-overlay").forEach(el => el.classList.remove("active"));
    this.renderAll();
  }

  openModal(type) {
    this.stopAutoWalk();
    this.closeModals();
    if (type === "intro") {
      document.getElementById("modal-intro").classList.add("active");
    } else if (type === "inventory") {
      this.renderInventoryModal();
      document.getElementById("modal-inventory").classList.add("active");
    } else if (type === "skills") {
      this.renderSkillsModal();
      document.getElementById("modal-skills").classList.add("active");
    } else if (type === "craft") {
      this.renderCraftModal();
      document.getElementById("modal-craft").classList.add("active");
    } else if (type === "shop") {
      this.renderShopModal();
      document.getElementById("modal-shop").classList.add("active");
    } else if (type === "codex") {
      this.renderCodexModal();
      document.getElementById("modal-codex").classList.add("active");
    } else if (type === "save") {
      this.renderSaveModal();
      document.getElementById("modal-save").classList.add("active");
    } else if (type === "audio") {
      const ss = window.soundSystem;
      if (ss) {
        document.getElementById("vol-music").value = Math.round(ss.musicVol * 100);
        document.getElementById("vol-sfx").value = Math.round(ss.sfxVol * 100);
        document.getElementById("btn-mute-modal").textContent = ss.muted ? "全部靜音：開" : "全部靜音：關";
      }
      document.getElementById("modal-audio").classList.add("active");
    } else if (type === "canteen") {
      const el = document.getElementById("modal-canteen");
      if (el) el.classList.add("active");
    }
  }

  showDialogueModal(name, spriteKey, lines, rewardText) {
    this.closeModals();
    document.getElementById("dialogue-npc-title").innerHTML = `${this.px.icon(spriteKey || "npc_elder", 22)} ${name}`;
    document.getElementById("dialogue-body").innerHTML =
      lines.map(l => `<p class="dlg-p">${l}</p>`).join("") +
      (rewardText ? `<div class="dlg-reward">[獲得支援補給] ${rewardText}</div>` : "");
    document.getElementById("modal-dialogue").classList.add("active");
  }

  showLorePopup(lore, extraMsg) {
    this.closeModals();
    document.getElementById("dialogue-npc-title").innerHTML = `${this.px.icon("scroll", 20)} 星辰手札 — ${lore.title}`;
    document.getElementById("dialogue-body").innerHTML =
      `<blockquote class="lore-quote">${lore.text}</blockquote>` +
      (extraMsg ? `<div class="dlg-reward">[關鍵情報] ${extraMsg}</div>` : "");
    document.getElementById("modal-dialogue").classList.add("active");
  }

  showMysteryModal(encounter) {
    this.closeModals();
    this.activeMystery = encounter;
    document.getElementById("mystery-title").innerHTML = `${this.px.icon("mystery", 20)} ${encounter.title}`;
    document.getElementById("mystery-desc").textContent = encounter.desc;
    const choicesBox = document.getElementById("mystery-choices-list");
    choicesBox.innerHTML = encounter.choices
      .map(
        (ch, idx) => `
        <button class="choice-btn" onclick="window.gameUI.onMysteryChoice(${idx})">${ch.label}</button>
      `
      )
      .join("");
    document.getElementById("modal-mystery").classList.add("active");
  }

  onMysteryChoice(idx) {
    if (!this.activeMystery) return;
    const res = this.engine.resolveMysteryChoice(this.activeMystery.id, idx);
    if (!res.ok) {
      this.showToast(res.msg, "warn");
    } else {
      this.showToast(`[奇遇結果] ${res.msg}`, "gold");
      this.closeModals();
    }
  }

  showRiddleModal(ev) {
    this.closeModals();
    this.activeRiddle = ev;
    const s = this.engine.state;
    const hasClue = !ev.clueLoreId || s.loreUnlocked.includes(ev.clueLoreId);
    const loreObj = ev.clueLoreId
      ? this.engine.data.loreEntries.find(l => l.id === ev.clueLoreId)
      : null;

    const promptEl = document.getElementById("riddle-prompt");
    if (promptEl) {
      let extraHtml = "";
      if (ev.clueLoreId) {
        if (hasClue && loreObj) {
          extraHtml = `<div style="margin-top:8px;padding:8px;background:rgba(45,212,191,0.12);border-left:3px solid #2dd4bf;font-size:12px;color:#cbd5e1;">
            <strong>[已解鎖手札線索：${loreObj.title}]</strong><br>${loreObj.text}
          </div>`;
        } else {
          extraHtml = `<div style="margin-top:8px;padding:8px;background:rgba(245,158,11,0.14);border-left:3px solid #f59e0b;font-size:12px;color:#fcd34d;">
            <strong>[尚未取得密碼手札]</strong> 建議先在迷宮各區域尋找並閱讀《星辰手札》卷軸，即可獲得密碼線索！
          </div>`;
        }
      }
      promptEl.innerHTML = `<div>${ev.prompt}</div>${extraHtml}`;
    }
    const input = document.getElementById("riddle-input");
    input.value = "";
    document.getElementById("modal-riddle").classList.add("active");
    setTimeout(() => input.focus(), 80);
  }

  fillRiddleHint() {
    if (!this.activeRiddle) return;
    const s = this.engine.state;
    const hasClue = !this.activeRiddle.clueLoreId || s.loreUnlocked.includes(this.activeRiddle.clueLoreId);
    if (!hasClue) {
      this.showToast("你尚未在迷宮中找到記載此密碼的《星辰手札》！請先探索地圖收集卷軸。", "warn");
      return;
    }
    document.getElementById("riddle-input").value = this.activeRiddle.answer;
    this.showToast("已根據《星辰手札》紀錄填入密碼！", "teal");
  }

  submitRiddle() {
    if (!this.activeRiddle) return;
    const val = document.getElementById("riddle-input").value;
    const ok = this.engine.solveRiddle(this.activeRiddle, val);
    if (ok) {
      this.showToast("[機關解鎖成功] 大門封印已解除！", "gold");
      this.closeModals();
    } else {
      this.showToast("密碼錯誤！請檢視迷宮中的《星辰手札》線索。", "warn");
    }
  }

  renderInventoryModal() {
    const s = this.engine.state;
    const eqBox = document.getElementById("inv-equipped-list");
    const slots = [
      { key: "weapon", label: "武器" },
      { key: "armor", label: "防具" },
      { key: "relic", label: "聖物" }
    ];
    eqBox.innerHTML = slots
      .map(sl => {
        const id = s.equipment[sl.key];
        const it = id ? this.engine.data.items[id] : null;
        const upgLv = (s.equipUpgrades && s.equipUpgrades[sl.key]) || 0;
        const upgStr = upgLv > 0 ? ` <span style="color:#facc15;">+${upgLv}</span>` : "";
        return `<div class="inv-card equipped">
          <div class="inv-card-head">
            <strong>[${sl.label}] ${it ? `${this.px.icon(it.icon, 16)} ${it.name}${upgStr}` : `無${upgStr}`}</strong>
            <span class="badge-key">當前穿戴</span>
          </div>
          ${it ? this.renderItemStatsBadges(it) : ""}
          <div class="inv-card-desc">${it ? it.desc : ""}</div>
        </div>`;
      })
      .join("");

    const bagBox = document.getElementById("inv-bag-list");
    const entries = Object.entries(s.inventory).filter(([, cnt]) => cnt > 0);
    const keyEntries = Object.keys(s.keys).filter(k => s.keys[k]);

    let html = "";
    entries.forEach(([id, cnt]) => {
      const it = this.engine.data.items[id];
      if (!it) return;
      let actionBtn = "";
      if (it.category === "equipment") {
        const curId = s.equipment[it.slot];
        const curItem = curId ? this.engine.data.items[curId] : null;
        const isUp = this.getEquipPowerScore(it) > this.getEquipPowerScore(curItem);
        actionBtn = `<button class="btn-sm ${isUp ? "btn-teal" : "btn-accent"}" onclick="window.gameUI.onEquipClick('${id}')">${isUp ? "換裝升級!" : "裝備"}</button>`;
      } else if (it.category === "consumable" && it.usableInMap) {
        actionBtn = `<button class="btn-sm btn-teal" onclick="window.gameUI.onUseItemInModal('${id}')">使用</button>`;
      }
      const sellVal = Math.max(5, Math.round((it.value || 20) * 0.6));
      const sellBtn = `<button class="btn-sm btn-secondary" style="padding: 4px 9px;" onclick="window.gameUI.onSellItem('${id}')">出售 (+${sellVal}G)</button>`;

      html += `
        <div class="inv-card">
          <div class="inv-card-head">
            <span>${this.px.icon(it.icon, 16)} <strong>${it.name}</strong> <span class="badge-cnt">x${cnt}</span></span>
            <div style="display: flex; gap: 6px;">${actionBtn} ${sellBtn}</div>
          </div>
          ${this.renderItemStatsBadges(it)}
          ${this.renderEquipComparison(it)}
          <div class="inv-card-desc">${it.desc}</div>
        </div>
      `;
    });

    keyEntries.forEach(kId => {
      const it = this.engine.data.items[kId];
      if (!it) return;
      html += `
        <div class="inv-card key-item">
          <div class="inv-card-head">
            <span>${this.px.icon(it.icon, 16)} <strong>${it.name}</strong> <span class="badge-key">關鍵物品</span></span>
          </div>
          <div class="inv-card-desc">${it.desc}</div>
        </div>
      `;
    });

    bagBox.innerHTML = html || `<div class="empty-hint">背包空空如也</div>`;
  }

  onEquipClick(itemId) {
    this.engine.equipItem(itemId);
    this.renderInventoryModal();
    this.renderHUD();
  }

  onUseItemInModal(itemId) {
    this.engine.useItem(itemId);
    this.renderInventoryModal();
    this.renderHUD();
  }

  onSellItem(itemId) {
    const res = this.engine.sellItem(itemId);
    if (res.ok) {
      this.showToast(`已出售，獲得 +${res.gold} G`, "gold");
      this.renderInventoryModal();
      this.renderHUD();
    }
  }

  renderShopModal() {
    const s = this.engine.state;
    const goldEl = document.getElementById("shop-gold-display");
    if (goldEl) goldEl.textContent = `${s.gold} G`;

    const listEl = document.getElementById("shop-catalog-list");
    if (!listEl) return;

    listEl.innerHTML = this.engine.data.shopCatalog
      .map(entry => {
        const it = this.engine.data.items[entry.itemId];
        if (!it) return "";
        const owned = s.inventory[entry.itemId] || 0;
        const canBuy = s.gold >= entry.price;
        return `
          <div class="inv-card">
            <div class="inv-card-head">
              <span>${this.px.icon(it.icon, 16)} <strong>${it.name}</strong> <span class="badge-cnt">背包持有: ${owned}</span></span>
              <button class="btn-sm btn-accent" ${canBuy ? "" : "disabled"} onclick="window.gameUI.onBuyShopItem('${entry.itemId}')">
                購買 (${entry.price} G)
              </button>
            </div>
            ${this.renderItemStatsBadges(it)}
            ${this.renderEquipComparison(it)}
            <div class="inv-card-desc">${it.desc}</div>
          </div>
        `;
      })
      .join("");
  }

  onBuyShopItem(itemId) {
    const res = this.engine.buyShopItem(itemId);
    if (!res.ok) {
      this.showToast(res.msg, "warn");
    } else {
      this.showToast(`購買成功：【${res.item.name}】`, "teal");
    }
    this.renderShopModal();
    this.renderHUD();
  }

  onBuyMysteryBox() {
    const res = this.engine.buyMysteryBox();
    if (!res.ok) {
      this.showToast(res.msg, "warn");
    } else {
      this.showToast(res.msg, "gold");
    }
    this.renderShopModal();
    this.renderHUD();
  }

  renderSkillsModal() {
    const s = this.engine.state;
    document.getElementById("modal-sp-count").textContent = s.skillPoints;

    const skList = document.getElementById("skills-unlock-list");
    skList.innerHTML = Object.values(this.engine.data.skills)
      .map(sk => {
        const unlocked = s.unlockedSkills.includes(sk.id);
        const canUnlock = !unlocked && s.skillPoints >= sk.costSP;
        const elemBadge = sk.elementLabel ? `<span class="badge-cnt">${sk.elementLabel}</span>` : "";
        return `
          <div class="inv-card">
            <div class="inv-card-head">
              <span>${this.px.icon(sk.icon, 16)} <strong>${sk.name}</strong> ${elemBadge}</span>
              ${
                unlocked
                  ? `<span class="badge-key">已習得</span>`
                  : `<button class="btn-sm btn-accent" ${canUnlock ? "" : "disabled"} onclick="window.gameUI.onUnlockSkill('${sk.id}')">學習 (${sk.costSP} SP)</button>`
              }
            </div>
            <div class="inv-card-desc">${sk.desc}</div>
          </div>
        `;
      })
      .join("");

    const talList = document.getElementById("talents-upgrade-list");
    talList.innerHTML = Object.values(this.engine.data.talents)
      .map(tal => {
        const rank = s.talents[tal.id] || 0;
        const canUp = rank < tal.maxRank && s.skillPoints >= 1;
        return `
          <div class="inv-card">
            <div class="inv-card-head">
              <span>${this.px.icon(tal.icon, 16)} <strong>${tal.name}</strong> <span class="badge-cnt">Lv.${rank}/${tal.maxRank}</span></span>
              <button class="btn-sm btn-teal" ${canUp ? "" : "disabled"} onclick="window.gameUI.onUpgradeTalent('${tal.id}')">
                ${rank >= tal.maxRank ? "已滿級" : "升級 (1 SP)"}
              </button>
            </div>
            <div class="inv-card-desc">${tal.desc}</div>
          </div>
        `;
      })
      .join("");
  }

  onUnlockSkill(skillId) {
    if (this.engine.unlockSkill(skillId)) {
      this.renderSkillsModal();
      this.renderHUD();
    }
  }

  onUpgradeTalent(talentId) {
    if (this.engine.upgradeTalent(talentId)) {
      this.renderSkillsModal();
      this.renderHUD();
    }
  }

  renderCraftModal() {
    const s = this.engine.state;
    const box = document.getElementById("craft-recipes-list");
    const slotDefs = [
      { slot: "weapon", name: "武器部位淬煉", bonusDesc: "每級使穿戴武器的全屬性提升 +15%（額外保底攻擊加成）", icon: "icon_atk" },
      { slot: "armor", name: "防具部位淬煉", bonusDesc: "每級使穿戴防具的全屬性提升 +15%（額外保底防禦與生命加成）", icon: "icon_def" },
      { slot: "relic", name: "聖物部位淬煉", bonusDesc: "每級使穿戴聖物的全屬性提升 +15%（額外保底星力與暴擊加成）", icon: "crystal" }
    ];

    const pips = lv => Array.from({ length: 5 }, (_, i) => `<i class="${i < lv ? "on" : ""}"></i>`).join("");
    const chipsOf = ing =>
      Object.entries(ing || {})
        .map(([ingId, req]) => {
          const it = this.engine.data.items[ingId];
          const have = s.inventory[ingId] || 0;
          return `<span class="ing-chip ${have >= req ? "ok" : "lack"}">${this.px.icon(it ? it.icon : "crystal", 14)} ${it ? it.name : ingId} ${have}/${req}</span>`;
        })
        .join("");
    const lacks = (ing, gold) =>
      s.gold < gold || Object.entries(ing || {}).some(([id, req]) => (s.inventory[id] || 0) < req);

    const upgradeHtml = `
      <div class="craft-title">星隕淬煉台 <small>裝備部位強化 +1 ~ +5，更換裝備仍保留等級</small></div>
      <div class="upg-grid">
        ${slotDefs
          .map(sd => {
            const curLv = (s.equipUpgrades && s.equipUpgrades[sd.slot]) || 0;
            const cost = this.engine.getUpgradeCost(sd.slot);
            const head = `<div class="upg-name">${this.px.icon(sd.icon, 18)} ${sd.name}</div>
              <div class="upg-pips">${pips(curLv)}<b>+${curLv}</b></div>
              <div class="upg-desc">${sd.bonusDesc}</div>`;
            if (!cost) return `<div class="upg-card maxed">${head}<div class="upg-max">已達最高 +5</div></div>`;
            const ok = !lacks(cost.ingredients, cost.costGold);
            return `<div class="upg-card ${ok ? "ready" : ""}">${head}
              <div class="ing-row">${chipsOf(cost.ingredients)}</div>
              <button class="btn-sm btn-teal upg-btn" ${ok ? "" : "disabled"} onclick="window.gameUI.onUpgradeEquipSlot('${sd.slot}')">
                +${curLv} → +${cost.nextLevel}｜${cost.costGold} G
              </button>
            </div>`;
          })
          .join("")}
      </div>
    `;

    const recipesHtml = `<div class="craft-title">合成與鍛造 <small>持有金幣 ${s.gold} G</small></div><div class="recipe-grid">${this.engine.data.recipes
      .map(rc => {
        const resItem = this.engine.data.items[rc.result];
        const ok = !lacks(rc.ingredients, rc.costGold);
        return `
          <div class="inv-card recipe-card ${ok ? "ready" : ""}">
            <div class="inv-card-head">
              <span>${this.px.icon(resItem.icon, 18)} <strong>${resItem.name}</strong> ${rc.count > 1 ? `x${rc.count}` : ""}</span>
            </div>
            ${this.renderItemStatsBadges(resItem)}
            ${this.renderEquipComparison(resItem)}
            <div class="inv-card-desc">${rc.desc}</div>
            <div class="ing-row">${chipsOf(rc.ingredients)}</div>
            <button class="btn-sm btn-accent recipe-btn" ${ok ? "" : "disabled"} onclick="window.gameUI.onCraftClick('${rc.id}')">鍛造｜${rc.costGold} G</button>
          </div>
        `;
      })
      .join("")}</div>`;

    box.innerHTML = upgradeHtml + recipesHtml;
  }

  onUpgradeEquipSlot(slot) {
    const res = this.engine.upgradeEquipmentSlot(slot);
    if (!res.ok) {
      this.showToast(res.msg, "warn");
    } else {
      this.showToast(`部位淬煉成功！已提升至 +${res.level}`, "gold");
    }
    this.renderCraftModal();
    this.renderHUD();
  }

  onCraftClick(recipeId) {
    const res = this.engine.craftRecipe(recipeId);
    if (!res.ok) {
      this.showToast(res.msg, "warn");
    } else {
      this.showToast(`成功鍛造【${res.item.name}】！可至背包穿戴`, "gold");
    }
    this.renderCraftModal();
    this.renderHUD();
  }

  renderCodexModal() {
    const s = this.engine.state;
    const loreBox = document.getElementById("codex-lore-list");
    const loreAll = this.engine.data.loreEntries;
    const loreOpen = loreAll.filter(l => s.loreUnlocked.includes(l.id));
    const lockedByCh = {};
    loreAll.filter(l => !s.loreUnlocked.includes(l.id)).forEach(l => (lockedByCh[l.chapter] = (lockedByCh[l.chapter] || 0) + 1));
    const lockedChips = Object.entries(lockedByCh)
      .map(([ch, n]) => `<span class="badge-cnt">第 ${ch} 章 ×${n}</span>`)
      .join(" ");
    loreBox.innerHTML =
      loreOpen
        .map(
          l => `
          <div class="inv-card">
            <div class="inv-card-head"><strong>${this.px.icon("scroll", 16)} ${l.title}</strong></div>
            <div class="inv-card-desc">${l.text}</div>
          </div>`
        )
        .join("") +
      (loreOpen.length < loreAll.length
        ? `<div class="inv-card locked-card" style="grid-column: 1 / -1;">
            <div class="inv-card-head"><strong>尚有 ${loreAll.length - loreOpen.length} 篇手札未解鎖（已收集 ${loreOpen.length}/${loreAll.length}）</strong></div>
            <div class="inv-card-desc">探索各章節地圖中的卷軸或寶箱即可解鎖。${lockedChips}</div>
          </div>`
        : "");

    const elemNames = { physical: "物理", arcane: "星芒", star: "星輝", fire: "烈焰", frost: "寒霜", void: "虛空" };
    const bestiaryBox = document.getElementById("codex-bestiary-list");
    if (bestiaryBox) {
      bestiaryBox.innerHTML = Object.values(this.engine.data.enemies)
        .map(en => {
          const kills = (s.bestiaryKills && s.bestiaryKills[en.id]) || 0;
          const wLabels = (en.weaknesses || []).map(w => elemNames[w] || w).join("/") || "無";
          const roleBadge = en.isBoss ? "章節首領" : en.isElite ? "區域精英" : "一般魔物";
          return `
            <div class="inv-card ${kills > 0 ? "equipped" : ""}">
              <div class="inv-card-head">
                <span>${this.px.icon(en.icon, 20)} <strong>${en.name}</strong> <span class="badge-cnt">第 ${en.chapter || 1} 章・${roleBadge}</span></span>
                <span class="badge-key">討伐次數：${kills}</span>
              </div>
              <div class="inv-card-desc">
                HP: ${en.hp} ｜ 攻擊: ${en.atk} ｜ 防禦: ${en.def} ｜ 韌性護盾: ${en.shield} 點 ｜ 弱點屬性: <strong style="color:#facc15;">${wLabels}</strong> ｜ 獎勵: ${en.exp} EXP / ${en.gold} G
              </div>
            </div>
          `;
        })
        .join("");
    }

    const achBox = document.getElementById("codex-ach-list");
    achBox.innerHTML = this.engine.data.achievements
      .map(a => {
        const unlocked = s.achievements.includes(a.id);
        return `
          <div class="inv-card ${unlocked ? "equipped" : "locked-card"}">
            <div class="inv-card-head">
              <span>${this.px.icon(unlocked ? a.icon : "gate_locked", 16)} <strong>${a.name}</strong></span>
              <span class="badge-cnt">${unlocked ? "已達成" : "未達成"}</span>
            </div>
            <div class="inv-card-desc">${a.desc}</div>
          </div>
        `;
      })
      .join("");
  }

  renderSaveModal() {
    const slots = this.engine.getSaveSlotsInfo();
    const box = document.getElementById("save-slots-list");
    box.innerHTML = slots
      .map(info => {
        const title = info.slot === 0 ? "[自動存檔槽] (營火/過章)" : `[手動存檔槽 #${info.slot}]`;
        return `
          <div class="inv-card">
            <div class="inv-card-head">
              <strong>${title}</strong>
              <div>
                ${
                  info.slot !== 0
                    ? `<button class="btn-sm btn-teal" onclick="window.gameUI.onSaveSlot(${info.slot})">寫入存檔</button>`
                    : ""
                }
                <button class="btn-sm btn-accent" ${info.empty ? "disabled" : ""} onclick="window.gameUI.onLoadSlot(${info.slot})">讀取進度</button>
              </div>
            </div>
            <div class="inv-card-desc">
              ${
                info.empty
                  ? "（尚無存檔紀錄）"
                  : `${info.chapterName} ｜ Lv.${info.level} ｜ 金幣 ${info.gold}G ｜ 手札 ${info.loreCount}/15 ｜ 時長 ${this.formatTime(info.playTime)} ｜ 儲存於 ${info.savedAt}`
              }
            </div>
          </div>
        `;
      })
      .join("");
  }

  onSaveSlot(slot) {
    this.engine.saveGame(slot);
    this.showToast(`已儲存至存檔槽 #${slot}`, "teal");
    this.renderSaveModal();
  }

  onLoadSlot(slot) {
    if (this.engine.loadGame(slot)) {
      this.showToast(`已讀取存檔槽 #${slot}`, "gold");
      this.closeModals();
    }
  }

  exportSaveFile() {
    const dataStr = this.engine.serialize();
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `StarfallChronicles_Save_Lv${this.engine.state.level}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast("已匯出 JSON 存檔檔案！", "teal");
  }

  importSaveFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        this.engine.deserialize(e.target.result);
        this.showToast("存檔匯入成功！", "gold");
        this.closeModals();
      } catch (err) {
        this.showToast("存檔檔案格式不正確", "warn");
      }
    };
    reader.readAsText(file);
  }

  showEndingSelectionModal() {
    this.closeModals();
    const available = this.engine.getAvailableEndings();
    const box = document.getElementById("ending-choices-box");
    box.innerHTML = available
      .map(endKey => {
        const end = this.engine.data.endings[endKey];
        return `
          <div class="inv-card equipped">
            <div class="inv-card-head">
              <span><strong>${end.title}</strong> <span class="badge-key">${end.badge}</span></span>
              <button class="btn-sm btn-accent" onclick="window.gameUI.selectEnding('${endKey}')">選擇此命運</button>
            </div>
            <div class="inv-card-desc">${end.summary}</div>
          </div>
        `;
      })
      .join("");
    document.getElementById("modal-ending").classList.add("active");
  }

  selectEnding(endKey) {
    const end = this.engine.data.endings[endKey];
    if (!end) return;
    if (endKey === "symbiosis" || endKey === "voyager") {
      this.engine.unlockAchievement("ach_true_ending");
    }
    this.engine.saveGame(0);
    const s = this.engine.state;
    const box = document.getElementById("ending-choices-box");
    box.innerHTML = `
      <div class="ending-final-view">
        <div class="ending-badge-lg">${end.badge}</div>
        <h3>${end.title}</h3>
        <p class="ending-story-p">${end.summary}</p>
        <div class="ending-stats-summary">
          <div>通關總時長：<strong>${this.formatTime(s.playTimeSeconds)}</strong></div>
          <div>最終等級：<strong>Lv.${s.level}</strong></div>
          <div>勝場統計：<strong>${s.stats.battlesWon} 場</strong></div>
          <div>累計破盾：<strong>${s.stats.shieldsBroken} 次</strong></div>
          <div>完成支線：<strong>${(s.completedSideQuests && s.completedSideQuests.length) || 0} / 10 項</strong></div>
          <div>收集手札：<strong>${s.loreUnlocked.length} / 15 篇</strong></div>
          <div>解鎖成就：<strong>${s.achievements.length} / ${this.engine.data.achievements.length} 項</strong></div>
        </div>
        <div class="ending-actions">
          <button class="btn-primary" onclick="window.gameUI.startAbyssFromEnding()">挑戰【無盡星淵試煉 (Roguelite 爬塔)】</button>
          <button class="btn-secondary" onclick="window.gameUI.closeModals()">返回聖殿自由探索</button>
        </div>
      </div>
    `;
  }

  startAbyssFromEnding() {
    this.closeModals();
    this.engine.enterAbyss(1);
    this.renderAll();
  }
}

window.GameUI = GameUI;
