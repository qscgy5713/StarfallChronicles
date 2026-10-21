/**
 * 存檔版本與遷移 (Save Migrations)
 * 每次存檔資料結構有變動，就在 MIGRATIONS 尾端新增一筆 { to, note, run(state, engine) }，並把 CURRENT 加一。
 * 讀檔時 migrateState() 會依序執行所有版本大於存檔版本的遷移；每筆遷移都必須可重複執行（只補缺的欄位）。
 * 存檔版本高於 CURRENT（來自較新的遊戲）會被拒絕，避免舊版遊戲把新資料讀壞。
 */
const StarfallSave = (function () {
  const MIGRATIONS = [
    {
      to: 1,
      note: "基礎欄位預設值（夥伴、圖鑑、支線、強化、視野、斬味、料理、統計）",
      run(s) {
        if (!s.unlockedCompanions) s.unlockedCompanions = ["lumi"];
        if (!s.companion) s.companion = "lumi";
        if (!s.bestiaryKills) s.bestiaryKills = {};
        if (!s.subZone) s.subZone = 1;
        if (!s.completedSideQuests) s.completedSideQuests = [];
        if (!s.equipUpgrades) s.equipUpgrades = { weapon: 0, armor: 0, relic: 0 };
        if (typeof s.compassEnabled !== "boolean") s.compassEnabled = false;
        if (typeof s.fullMapView !== "boolean") s.fullMapView = false;
        if (typeof s.pulseCooldown !== "number") s.pulseCooldown = 0;
        if (typeof s.pulseVisionSteps !== "number") s.pulseVisionSteps = 0;
        if (!s.weaponElement) s.weaponElement = "physical";
        if (!s.zoneMasteryClaimed) s.zoneMasteryClaimed = {};
        if (typeof s.sharpness !== "number") s.sharpness = 100;
        if (typeof s.polishTurns !== "number") s.polishTurns = 0;
        if (typeof s.spiritLevel !== "number") s.spiritLevel = 0;
        if (s.canteenMeal === undefined) s.canteenMeal = null;
        if (!s.stats) s.stats = {};
        ["partsBroken", "tailsSevered", "foresightCounters"].forEach(k => {
          if (typeof s.stats[k] !== "number") s.stats[k] = 0;
        });
      }
    },
    {
      to: 2,
      note: "預設視角改為 2D（只遷移一次，之後玩家自行切換的 [V] 選擇會保留）",
      run(s) {
        if (!s.viewMode) s.viewMode = "2d_pixel";
        if (s.viewDefaultVer !== 2) {
          s.viewMode = "2d_pixel";
          s.viewDefaultVer = 2;
        }
      }
    },
    {
      to: 3,
      note: "獵人公會：委託板、訓練場、故事支線欄位；一般魔物改為會重生，清除舊的完成標記",
      run(s, engine) {
        if (!s.board) s.board = { prog: {}, done: [] };
        if (!s.train) s.train = {};
        if (!s.story) s.story = {};
        const ce = s.completedEvents || {};
        Object.keys(ce).forEach(k => {
          const m = k.match(/^ch(\d+)_(?:z(\d+)_)?(\d+,\d+)$/);
          if (!m) return;
          const chap = engine.data.chapters[m[1]];
          const zone = chap && chap.zones && chap.zones[m[2] || 1];
          const ev = zone && zone.events && zone.events[m[3]];
          if (!ev || ev.type !== "enemy" || ev.winFlag) return;
          const tpl = engine.data.enemies[ev.enemyId];
          if (tpl && !tpl.isElite && !tpl.isBoss) delete ce[k];
        });
      }
    },
    {
      to: 4,
      note: "旅行者之門：到過的區域（已通過的章節視為全區到過，目前章節只算到目前子區域）",
      run(s) {
        if (s.visitedZones) return;
        s.visitedZones = {};
        const ch = s.chapter || 1;
        for (let c = 1; c < ch; c++) for (let z = 1; z <= 3; z++) s.visitedZones[`${c}-${z}`] = true;
        for (let z = 1; z <= (s.subZone || 1); z++) s.visitedZones[`${ch}-${z}`] = true;
      }
    },
    {
      to: 5,
      note: "公會常駐懸賞（可重複）",
      run(s) {
        if (!s.bounty) s.bounty = { slots: [], claimed: 0 };
      }
    }
  ];

  const CURRENT = MIGRATIONS[MIGRATIONS.length - 1].to;

  // 就地把 state 升級到最新版本，回傳實際執行的遷移版本清單
  function migrateState(state, engine) {
    const from = typeof state.saveVer === "number" ? state.saveVer : 0;
    if (from > CURRENT) throw new Error(`存檔版本 ${from} 比遊戲支援的 ${CURRENT} 新，請更新遊戲後再讀取`);
    const ran = [];
    MIGRATIONS.forEach(m => {
      if (m.to > from) {
        m.run(state, engine);
        ran.push(m.to);
      }
    });
    state.saveVer = CURRENT;
    return ran;
  }

  return { CURRENT, MIGRATIONS, migrateState };
})();

if (typeof window !== "undefined") window.StarfallSave = StarfallSave;
if (typeof module !== "undefined" && module.exports) module.exports = { StarfallSave };
