/**
 * 通關機器人 (Playthrough Bot)：用遊戲本身的 getCurrentObjective() 導引 + engine.move 一路從 1-1 玩到終章結局，
 * 戰鬥使用自動戰鬥；謎題以線索答案解開、奇遇取最後一個選項。若卡關或無法到達結局選擇則以非零碼結束。
 * 用法：node StarfallChronicles/tests/playthrough.js
 */
global.window = {};
const root = require("path").join(__dirname, "..", "js") + "/";
require(root+"pixel_art.js"); require(root+"data.js");
const { StarfallEngine } = require(root+"engine.js");
const D = window.GAME_DATA;
const g = new StarfallEngine(D);
const calls = [];
const deep = () => new Proxy(function(){}, { get: (t, k) => { if (k === Symbol.toPrimitive) return () => ""; calls.push(String(k)); return deep(); }, apply: () => undefined });
const ui = deep();
let pendingRiddle = null, pendingMystery = null, pendingEnding = false;
window.gameUI = new Proxy(ui, { get: (t, k) => {
  if (k === "showRiddleModal") return ev => { pendingRiddle = ev; calls.push("showRiddleModal"); };
  if (k === "showMysteryModal") return ev => { pendingMystery = ev; calls.push("showMysteryModal"); };
  if (k === "showEndingSelectionModal") return () => { pendingEnding = true; calls.push("ending"); };
  return t[k];
} });
const WALK = new Set([".", "C", "M", "F", "A", "?", "D", "V", "T", "O", "U", "S", "K", "L", "H", "X", "Y", "Z"]);
function bfs(goal) {
  const m = g.activeMap, H = m.length, W = m[0].length;
  const key = (x, y) => y * W + x;
  const start = [g.state.x, g.state.y];
  const prev = new Map([[key(...start), null]]);
  const q = [start];
  while (q.length) {
    const [x, y] = q.shift();
    if (x === goal.x && y === goal.y) {
      const path = []; let k = key(x, y);
      while (prev.get(k)) { path.push(prev.get(k).step); k = prev.get(k).from; }
      return path.reverse();
    }
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      if (prev.has(key(nx, ny))) continue;
      const t = m[ny][nx];
      const isGoal = nx === goal.x && ny === goal.y;
      if (!isGoal && !WALK.has(t)) continue;
      if (t === "#" || t === "~") continue;
      prev.set(key(nx, ny), { from: key(x, y), step: [dx, dy] });
      q.push([nx, ny]);
    }
  }
  return null;
}
function fight() {
  let t = 0; const nm=g.combat.name, rtr=g.combat.rt, lv0=g.state.level, maxhp=g.combat.enemyMaxHp;
  while (g.combat && t < 400) {
    g.autoBattleStep(); g.rtUpdate(0.05); t += 0.05;
    if (g.state.hp < g.state.maxHp * 0.35) { for (const id of ["healing_potion","greater_potion","phoenix_salve"]) if ((g.state.inventory[id]||0)>0) { g.useItem(id); break; } }
  }
  console.log(`  [戰鬥] ${nm} Lv${lv0} 敵HP${maxhp} 用時${t.toFixed(0)}s 受傷${rtr.taken||0}/${g.state.maxHp} 最高連擊${rtr.comboBest||0}`);
  return t;
}
function heal() { if (g.state.hp < g.state.maxHp * 0.6) { for (const id of ["healing_potion","greater_potion"]) while ((g.state.inventory[id]||0)>0 && g.state.hp < g.state.maxHp*0.9) g.useItem(id); } if (g.state.hp < g.state.maxHp*0.5) { g.state.hp = g.state.maxHp; g.state.mp = g.state.maxMp; stats.rests++; } }
const stats = { quests: 0, rests: 0, fights: 0, deaths: 0, steps: 0 };
let lastObj = "", same = 0;
for (let iter = 0; iter < 20000; iter++) {
  if (g.combat) { stats.fights++; const hp0=g.state.hp; fight(); continue; }
  heal();
  if (pendingRiddle) { const ev = pendingRiddle; pendingRiddle = null; const has = !ev.clueLoreId || g.state.loreUnlocked.includes(ev.clueLoreId); if (!has) console.log("  [謎題] 缺少線索手札", ev.clueLoreId, "仍以答案嘗試"); const ok = g.solveRiddle(ev, ev.answer); console.log("  [謎題]", ev.id, ok ? "解開" : "失敗"); }
  if (pendingMystery) { const ev = pendingMystery; pendingMystery = null; for (let i = ev.choices.length - 1; i >= 0; i--) { const r = g.resolveMysteryChoice(ev.id, i); if (r.ok) { console.log("  [奇遇]", ev.title, "選項", i); break; } } }
  if (pendingEnding) { pendingEnding = false; const av = g.getAvailableEndings(); console.log("  [結局] 可選：", av.join(",")); g.state.flags.__ending = av[0]; console.log("到達結局選擇，選", av[0]); break; }
  for (const q of g.getBoardQuests()) if (q.ready && !q.completed) { const r = g.claimBoardQuest(q.id); if (r.ok) stats.quests++; }
  let obj = g.getCurrentObjective();
  if (obj && obj.gate) {
    // 章節認證：刷怪（擊敗最近的魔物）完成委託；沒有魔物了就回營火休息使其重生
    const gi = g.getChapterGate(g.state.chapter);
    if (!gi.eliteOk && gi.elite) {
      // 菁英在別的子區域：直接傳過去開戰（機器人不必走完迷宮）
      const cur = g.state.subZone;
      g.loadZone(gi.elite.zone, gi.elite.x - 2, gi.elite.y, false, true);
      const ev = g.activeEvents[`${gi.elite.x},${gi.elite.y}`];
      if (ev) { g.startCombat(ev, `${gi.elite.x},${gi.elite.y}`); stats.fights++; fight(); heal(); }
      g.loadZone(cur, 2, 2, false, true);
      continue;
    }
    let best = null;
    for (const [coord, ev] of Object.entries(g.activeEvents)) {
      if (!ev || ev.type !== "enemy") continue;
      const [ex, ey] = coord.split(",").map(Number);
      if (!g.activeMap[ey] || g.activeMap[ey][ex] !== "E") continue;
      const p = bfs({ x: ex, y: ey });
      if (p && (!best || p.length < best.len)) best = { x: ex, y: ey, len: p.length };
    }
    if (best) obj = Object.assign({}, obj, { x: best.x, y: best.y, text: obj.text + "[刷怪]" });
    else {
      const [ox, oy] = [obj.x, obj.y];
      if (g.state.x === ox && g.state.y === oy) { for (const [dx, dy] of [[1,0],[0,1],[-1,0],[0,-1]]) { if (g.move(dx, dy).moved) { g.move(-dx, -dy); break; } } stats.rests++; continue; }
      obj = Object.assign({}, obj, { text: obj.text + "[回營火]" });
    }
  }
  if (!obj) { console.log("無目標，結束"); break; }
  const sig = `${g.state.chapter}-${g.state.subZone}|${obj.x},${obj.y}|${obj.text}`;
  if (sig === lastObj) same++; else { same = 0; lastObj = sig; console.log(`[ch${g.state.chapter}-${g.state.subZone}] Lv${g.state.level} hp${Math.round(g.state.hp)}/${g.state.maxHp} 目標 ${obj.text.slice(0,60)}`); }
  if (same > 60) { console.log("卡關！目標：", obj.text, "位置", g.state.x, g.state.y, "tile@goal", g.activeMap[obj.y]&&g.activeMap[obj.y][obj.x], "calls", [...new Set(calls)].join(",")); break; }
  const path = bfs(obj);
  if (!path) { console.log("找不到路徑到", obj.x, obj.y, "from", g.state.x, g.state.y); same += 10; 
    // 嘗試直接往目標走一步 (讓事件觸發)
    const dx = Math.sign(obj.x - g.state.x), dy = Math.sign(obj.y - g.state.y); g.move(dx, 0) ; g.move(0, dy); continue; }
  if (path.length === 0) { same++; // 已在目標：嘗試與周圍互動
    for (const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) g.move(dx,dy); continue; }
  for (const [dx, dy] of path) {
    const r = g.move(dx, dy); stats.steps++;
    if (g.combat) break;
    if (!r.moved) { if (r.reason === "interacted" || r.reason === "combat_started") break; if (r.reason==="gate_locked"||r.reason==="hazard"||r.reason==="wall") { break; } }
    if (r.zoneChanged || r.portal) break;
  }
  if (g.state.ending || g.state.gameOver || g.state.endingChosen) { console.log("到達結局"); break; }
}
const reached = !!g.state.flags.__ending;
console.log(reached ? "通關：已到達結局選擇" : "未通關");
console.log("結束狀態", JSON.stringify({ch:g.state.chapter,z:g.state.subZone,lv:g.state.level,hp:g.state.hp,steps:stats.steps,quests:stats.quests,fights:stats.fights,rests:stats.rests,flagsEnding:Object.keys(g.state.flags).filter(k=>/end/i.test(k))}));

process.exit(reached ? 0 : 1);
