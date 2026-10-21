/**
 * 獵人公會與無盡星淵 (Guild & Abyss)
 * 以 mixin 形式掛到 StarfallEngine.prototype：委託板、章節認證、公會訓練場、NPC 支線進度、無盡星淵進出。
 */
class GuildMixin {
  // 可從哪一層開始：第 1 層，以及每通關 5 層後的下一層 (6、11、16...)
  getAbyssStartFloors() {
    const best = this.state.maxAbyssFloor || 0;
    const list = [1];
    for (let f = 6; f <= best + 1; f += 5) list.push(f);
    return list;
  }

  getAbyssMod(floor) {
    return this.data.abyssMods[(Math.max(1, floor) - 1) % this.data.abyssMods.length];
  }

  // 離開星淵，回到進入前的章節區域與座標
  leaveAbyss() {
    if (!this.state.inAbyss) return false;
    const ret = this.state.abyssReturn || { chapter: this.state.chapter || 1, subZone: 1, x: null, y: null };
    this.state.abyssReturn = null;
    this.combat = null;
    this.state.subZone = ret.subZone;
    if (ret.x !== null && ret.y !== null) {
      this.state.x = ret.x;
      this.state.y = ret.y;
      this.loadChapter(ret.chapter, false, ret.subZone);
    } else {
      this.loadChapter(ret.chapter, true, ret.subZone);
    }
    this.log("[離開星淵] 你踏上星軌，回到了原本的地方。", "chapter");
    return true;
  }

  enterAbyss(floor = 1) {
    if (!this.state.inAbyss) {
      this.state.abyssReturn = { chapter: this.state.chapter, subZone: this.state.subZone || 1, x: this.state.x, y: this.state.y };
    }
    const mod = this.getAbyssMod(floor);
    this.state.abyssMod = mod.id;
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
    const bossPool = ["boss_thorn_behemoth", "boss_chronos", "boss_ignis", "boss_astra", "boss_moebius"];

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
        abyssScale: 1 + floor * 0.14,
        abyssMod: mod.id
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
    const bossId = bossPool[(floor - 1) % bossPool.length]; // 每 5 層由噬星者守關
    const bossFlag = `abyss_boss_${floor}`;
    delete this.state.flags[bossFlag];
    events["16,10"] = {
      type: "boss",
      id: `abyss_b_${floor}`,
      enemyId: bossId,
      abyssScale: 1 + floor * 0.16,
      abyssMod: mod.id,
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
    this.log(`[無盡星淵] 踏入【無盡星淵試煉：第 ${floor} 層 (40x28 巨型裂隙)】！本層詞綴【${mod.name}】：${mod.desc}`, "chapter");
  }

  // ==================== 獵人公會委託板 ====================
  getBoardState() {
    if (!this.state.board) this.state.board = { prog: {}, done: [] };
    return this.state.board;
  }

  getBoardProgress(q) {
    const st = this.state, b = this.getBoardState();
    const r = q.req;
    let cur = 0;
    if (r.type === "kill") cur = b.prog[q.id] || 0;
    else if (r.type === "item") cur = st.inventory[r.item] || 0;
    else if (r.type === "flag") cur = st.flags[r.flag] ? 1 : 0;
    else if (r.type === "level") cur = st.level;
    else if (r.type === "stat") cur = (st.stats && st.stats[r.stat]) || 0;
    else if (r.type === "abyss") cur = st.maxAbyssFloor || 0;
    const target = r.type === "flag" ? 1 : r.count;
    cur = Math.min(cur, target);
    return { cur, target, ready: cur >= target };
  }

  // 目前已解鎖的委託（章節 <= 目前章節），含進度與完成狀態
  getBoardQuests() {
    const b = this.getBoardState();
    return (this.data.boardQuests || [])
      .filter(q => q.chapter <= this.state.chapter)
      .map(q => Object.assign({ quest: q, completed: b.done.includes(q.id) }, this.getBoardProgress(q), { id: q.id, chapter: q.chapter }));
  }

  claimBoardQuest(id) {
    const q = (this.data.boardQuests || []).find(x => x.id === id);
    const b = this.getBoardState();
    if (!q || q.chapter > this.state.chapter) return { ok: false, msg: "委託不存在" };
    if (b.done.includes(id)) return { ok: false, msg: "這件委託已經完成" };
    const p = this.getBoardProgress(q);
    if (!p.ready) return { ok: false, msg: `尚未達成（${p.cur}/${p.target}）` };
    if (q.req.type === "item" && q.req.consume) {
      this.state.inventory[q.req.item] -= q.req.count;
      if (this.state.inventory[q.req.item] <= 0) delete this.state.inventory[q.req.item];
    }
    b.done.push(id);
    const rw = q.reward, parts = [];
    let leveled = false;
    if (rw.gold) { this.state.gold += rw.gold; parts.push(`${rw.gold}G`); }
    if (rw.sp) { this.state.skillPoints += rw.sp; parts.push(`+${rw.sp}SP`); }
    if (rw.items) Object.entries(rw.items).forEach(([iid, n]) => { this.addItem(iid, n); parts.push(`${this.data.items[iid] ? this.data.items[iid].name : iid}x${n}`); });
    if (rw.exp) { this.state.exp += rw.exp; parts.push(`${rw.exp}EXP`); leveled = this._levelUpFromExp(); }
    this.recalcStats(leveled);
    if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("levelup");
    this.log(`[公會委託] 完成【${q.title}】！獲得 ${parts.join("、")}。`, "achievement");
    this.checkMilestoneAchievements();
    return { ok: true, quest: q, text: parts.join("、") };
  }

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

  // 擊敗魔物時累計「獵殺」類委託
  _boardOnKill(enemyId) {
    const b = this.getBoardState();
    (this.data.boardQuests || []).forEach(q => {
      if (q.req.type !== "kill" || q.chapter > this.state.chapter || b.done.includes(q.id)) return;
      if (q.req.enemy === "any" || q.req.enemy === enemyId) b.prog[q.id] = Math.min(q.req.count, (b.prog[q.id] || 0) + 1);
    });
  }

  getChapterGate(ch) {
    const need = (this.data.chapterGate && this.data.chapterGate[ch]) || 0;
    const b = this.getBoardState();
    const list = (this.data.boardQuests || []).filter(q => q.chapter === ch);
    const done = list.filter(q => b.done.includes(q.id)).length;
    const eq = list.find(q => q.req.type === "flag");
    const eliteOk = !eq || b.done.includes(eq.id);
    let elite = null;
    if (eq && !eliteOk) {
      const chap = this.data.chapters[ch];
      for (const [z, zo] of Object.entries((chap && chap.zones) || {})) {
        for (const [coord, ev] of Object.entries(zo.events || {})) {
          if (ev.winFlag === eq.req.flag) { const [x, y] = coord.split(",").map(Number); elite = { zone: Number(z), x, y, name: this.data.enemies[ev.enemyId] ? this.data.enemies[ev.enemyId].name : "菁英" }; }
        }
      }
    }
    return { need, done: Math.min(done, need), eliteOk, elite };
  }

  isChapterGateOpen(ch) {
    const g = this.getChapterGate(ch);
    return g.done >= g.need && g.eliteOk;
  }

  // ==================== 公會訓練場（金幣用途） ====================
  getTrainCost(track) {
    const rank = (this.state.train && this.state.train[track.id]) || 0;
    return track.base + track.step * rank;
  }

  buyTraining(id) {
    const track = (this.data.trainingTracks || []).find(t => t.id === id);
    if (!track) return { ok: false, msg: "沒有這項訓練" };
    if (!this.state.train) this.state.train = {};
    const rank = this.state.train[id] || 0;
    if (rank >= track.max) return { ok: false, msg: "已達訓練上限" };
    const cost = this.getTrainCost(track);
    if (this.state.gold < cost) return { ok: false, msg: `金幣不足（需要 ${cost} G）` };
    this.state.gold -= cost;
    this.state.train[id] = rank + 1;
    this.recalcStats(false);
    if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("coin");
    this.log(`[公會訓練] 【${track.name}】提升到第 ${rank + 1} 階（-${cost} G）。`, "success");
    return { ok: true, track, rank: rank + 1 };
  }

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
}

const StarfallGuild = {};
Object.getOwnPropertyNames(GuildMixin.prototype)
  .filter(n => n !== "constructor")
  .forEach(n => { StarfallGuild[n] = GuildMixin.prototype[n]; });

if (typeof window !== "undefined") window.StarfallGuild = StarfallGuild;
if (typeof module !== "undefined" && module.exports) module.exports = { StarfallGuild };
