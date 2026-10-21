/**
 * 戰鬥平衡檢查：讓各章「合理等級與裝備」的主角用自動戰鬥打每種魔物，量測擊倒時間與受傷，
 * 並與 BASELINE 的合理範圍比對。調整數值（血量、傷害、冷卻、技能倍率）導致平衡大幅偏移時會失敗。
 * 用法：node StarfallChronicles/tests/test_balance.js            （檢查）
 *       node StarfallChronicles/tests/test_balance.js --report   （只列出實測數值，方便更新 BASELINE）
 */
const assert = require("assert");
global.window = {};
const root = require("path").join(__dirname, "..", "js") + "/";
require(root + "pixel_art.js");
require(root + "data.js");
const { StarfallEngine } = require(root + "engine.js");
const D = global.window.GAME_DATA;

// 各章的典型進度（等級與裝備）——與通關機器人實測的進度一致
const PROFILE = {
  1: { level: 5, weapon: "rusty_sword", armor: "mist_ranger_armor" },
  2: { level: 8, weapon: "clockwork_halberd", armor: "mist_ranger_armor", relic: "compass_of_dawn" },
  3: { level: 10, weapon: "ember_greatsword", armor: "dwarf_forge_plate", relic: "chrono_pocketwatch" },
  4: { level: 12, weapon: "ember_greatsword", armor: "dwarf_forge_plate", relic: "astral_ring" },
  5: { level: 14, weapon: "ember_greatsword", armor: "dwarf_forge_plate", relic: "astral_ring" }
};
const RUNS = 5;

function measure(enemyId, ch) {
  const p = PROFILE[ch];
  let T = 0, wins = 0, taken = 0;
  for (let k = 0; k < RUNS; k++) {
    const g = new StarfallEngine(D);
    g.state.chapter = ch;
    for (let i = 1; i < p.level; i++) { g.state.level++; g.state.maxExp = Math.round(g.state.maxExp * 1.35); }
    g.state.equipment = { weapon: p.weapon, armor: p.armor, relic: p.relic || null };
    g.recalcStats(true);
    // 認證門只在真實遊玩時限制首領；平衡量測直接開戰
    D.boardQuests.forEach(q => g.getBoardState().done.push(q.id));
    g.startCombat({ enemyId }, "4,3");
    if (!g.combat) throw new Error("無法開戰：" + enemyId);
    const rt = g.combat.rt;
    let t = 0;
    while (g.combat && t < 400 && g.state.hp > 0) { g.autoBattleStep(); g.rtUpdate(0.05); t += 0.05; }
    if (!g.combat && g.state.hp > 0) wins++;
    T += t;
    taken += rt.taken || 0;
  }
  return { ttk: T / RUNS, wins, taken: taken / RUNS };
}

// 合理範圍 [最短秒, 最長秒]：由實測值上下約 ×0.5 ~ ×2 估出，任何一項超出就代表平衡明顯偏移
const BASELINE = {
  mist_wolf: [2, 8],
  corrupted_treant: [3, 11],
  elite_fenrir: [5, 19],
  boss_thorn_behemoth: [9, 36],
  drowned_sentinel: [2, 10],
  tide_siren: [3, 10],
  elite_abyss_crab: [5, 21],
  boss_chronos: [10, 40],
  magma_golem: [4, 17],
  ash_drake: [3, 13],
  elite_vulcan: [6, 26],
  boss_ignis: [13, 52],
  astral_wraith: [5, 21],
  star_inquisitor: [6, 23],
  elite_twin_inquisitor: [8, 32],
  boss_astra: [18, 72],
  citadel_templar: [7, 29],
  elite_regis: [11, 46],
  boss_moebius: [31, 123]
};

const rows = [];
for (const [id, en] of Object.entries(D.enemies)) rows.push({ id, name: en.name, ch: en.chapter || 1, isBoss: !!en.isBoss, isElite: !!en.isElite });

if (process.argv.includes("--report")) {
  rows.forEach(r => {
    const m = measure(r.id, r.ch);
    console.log(`${r.id.padEnd(24)} ch${r.ch} ${r.isBoss ? "首領" : r.isElite ? "精英" : "一般"} ttk=${m.ttk.toFixed(1)}s wins=${m.wins}/${RUNS} taken=${m.taken.toFixed(0)}`);
  });
  process.exit(0);
}

let n = 0;
const measured = {};
rows.forEach(r => {
  const m = measure(r.id, r.ch);
  measured[r.id] = m.ttk;
  const b = BASELINE[r.id];
  assert.ok(b, `BASELINE 缺少 ${r.id}，請執行 --report 後補上`);
  assert.strictEqual(m.wins, RUNS, `${r.name} 應穩定獲勝（${m.wins}/${RUNS}）`);
  assert.ok(m.ttk >= b[0] && m.ttk <= b[1], `${r.name} 擊倒時間 ${m.ttk.toFixed(1)}s 應落在 ${b[0]}~${b[1]}s`);
  n++;
});
// 層級關係：同章內 首領 > 精英 > 一般（擊倒時間）
for (let ch = 1; ch <= 5; ch++) {
  const t = rows.filter(r => r.ch === ch).map(r => ({ r, ttk: measured[r.id] }));
  const avg = f => { const l = t.filter(x => f(x.r)); return l.length ? l.reduce((s, x) => s + x.ttk, 0) / l.length : 0; };
  const normal = avg(r => !r.isBoss && !r.isElite), elite = avg(r => r.isElite), boss = avg(r => r.isBoss);
  if (elite) assert.ok(elite > normal, `第 ${ch} 章精英應比一般魔物耐打`);
  if (boss) assert.ok(boss > (elite || normal), `第 ${ch} 章首領應最耐打`);
}
console.log(`=== 戰鬥平衡檢查：${n} 種魔物擊倒時間皆在合理範圍、同章首領 > 精英 > 一般 ===`);
