/**
 * 地圖與移動 (Map & Movement)
 * 以 mixin 形式掛到 StarfallEngine.prototype：章節/子區域載入與擴建、移動與互動分派、迷霧、巡邏魔物、星輝脈衝、傳送門與魔物重生。
 */
class MapMixin {
  // 營火休息：讓被擊敗的一般魔物重生，仍存活的魔物（含巡邏位置、暈眩狀態）原樣保留
  respawnEnemies() {
    const sub = this.state.subZone || 1;
    const alive = Object.entries(this.activeEvents).filter(([c, e]) => {
      const [x, y] = c.split(",").map(Number);
      return e && e.type === "enemy" && this.activeMap[y] && this.activeMap[y][x] === "E";
    });
    this.loadZone(sub, this.state.x, this.state.y, false, true);
    alive.forEach(([coord, ev]) => {
      const home = ev.home || coord;
      const fresh = this.activeEvents[home];
      if (fresh && fresh.type === "enemy") {
        const [hx, hy] = home.split(",").map(Number);
        this.activeMap[hy][hx] = ".";
        delete this.activeEvents[home];
        delete this.activeLabels[home];
      }
      const [x, y] = coord.split(",").map(Number);
      this.activeMap[y][x] = "E";
      this.activeEvents[coord] = ev;
    });
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

  loadZone(subZone = 1, targetX = null, targetY = null, isChapterInit = false, silent = false) {
    const chapterNum = this.state.chapter;
    const ch = this.data.chapters[chapterNum];
    if (!ch) return;
    const zObj = ch.zones && ch.zones[subZone] ? ch.zones[subZone] : ch;
    this.state.subZone = subZone;
    if (!this.state.visitedZones) this.state.visitedZones = {};
    this.state.visitedZones[`${chapterNum}-${subZone}`] = true;

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
    Object.entries(this.activeEvents).forEach(([c, e]) => { if (e && e.type === "enemy") e.home = c; });
    this.placeStoryEvents();
    this.updateFogOfWar();
    if (silent) {
      // 營火休息重生魔物：不輸出區域移動訊息
    } else if (isChapterInit) {
      this.log(`[章節開始] 進入【${ch.name} — ${zObj.name || ""}】— ${zObj.ambientDesc || ch.ambientDesc}`, "chapter");
    } else {
      this.log(`[區域移動] 踏入【${chapterNum}-${subZone}：${zObj.name || ch.name}】— ${zObj.ambientDesc || ""}`, "chapter");
    }
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
      this._levelUpFromExp();
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

    if (tile === "B" && ev && !this.state.inAbyss && !this.isChapterGateOpen(this.state.chapter)) {
      const g = this.getChapterGate(this.state.chapter);
      const msg = `獵人公會尚未認證你：還需完成委託 ${g.done}/${g.need}${g.eliteOk ? "" : "，並討伐菁英"}（點右側【委託板】）`;
      this.log(`[首領封印] ${msg}`, "warn");
      if (typeof window !== "undefined" && window.gameUI) window.gameUI.showToast(msg, "warn");
      return { moved: false, reason: "gate_locked" };
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

    if (this._levelUpFromExp()) this.recalcStats(true);
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
}

const StarfallMap = (typeof mixinFrom === "function" ? mixinFrom : require("./mixin.js").mixinFrom)(MapMixin);

if (typeof window !== "undefined") window.StarfallMap = StarfallMap;
if (typeof module !== "undefined" && module.exports) module.exports = { StarfallMap };
