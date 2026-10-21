/**
 * UI 互動測試：以最小假 DOM 驅動 GameUI，驗證視窗開啟、HTML 輸出、按鈕 onclick 對應的處理函式與狀態變化。
 * 用法：node StarfallChronicles/tests/test_ui.js
 */
const assert = require("assert");
global.window = global.window || {};
const root = require("path").join(__dirname, "..", "js") + "/";
require(root + "pixel_art.js");
require(root + "data.js");
const { StarfallEngine } = require(root + "engine.js");

// ---------- 假 DOM ----------
const els = {};
const mkCanvasCtx = () => new Proxy({}, { get: (t, k) => (k === "measureText" ? () => ({ width: 10 }) : k === "createLinearGradient" || k === "createRadialGradient" ? () => ({ addColorStop() {} }) : k === "getImageData" ? () => ({ data: [] }) : () => {}), set: () => true });
function makeEl(id) {
  const cls = new Set();
  const el = {
    id, innerHTML: "", textContent: "", value: "", style: {}, dataset: {}, children: [], width: 960, height: 640,
    classList: { add: c => cls.add(c), remove: c => cls.delete(c), contains: c => cls.has(c), toggle: c => (cls.has(c) ? cls.delete(c) : cls.add(c)) },
    appendChild(c) { this.children.push(c); return c; }, prepend(c) { this.children.unshift(c); }, insertBefore(c) { this.children.push(c); }, scrollTo() {}, scrollIntoView() {}, removeChild() {}, remove() {}, addEventListener() {}, setAttribute() {}, removeAttribute() {},
    getContext: () => mkCanvasCtx(), toDataURL: () => "data:,", closest: () => ({ style: {} }), focus() {}, blur() {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 960, height: 640 }), querySelectorAll: () => [], querySelector: () => null
  };
  return el;
}
global.document = {
  getElementById: id => els[id] || (els[id] = makeEl(id)),
  createElement: () => makeEl("tmp"), querySelectorAll: () => [], querySelector: () => null, addEventListener() {}, body: makeEl("body")
};
global.window.addEventListener = () => {};
global.requestAnimationFrame = () => {};
global.localStorage = { getItem: () => null, setItem: () => {} };

require(root + "ui.js");
require(root + "combat_rt_ui.js");
require(root + "ui_guild.js");

const D = global.window.GAME_DATA;
const g = new StarfallEngine(D);
const ui = new global.window.GameUI(g);
global.window.gameUI = ui;
const toasts = [];
ui.showToast = m => toasts.push(m);
const active = id => els[id].classList.contains("active");
const html = id => els[id].innerHTML;
// 從 HTML 找出 onclick 內容 (按鈕 → 呼叫對應處理函式)
const click = (id, re) => {
  const m = html(id).match(new RegExp(`onclick="(${re})"`));
  assert.ok(m, `畫面上應有按鈕 ${re}`);
  new Function("window", `return ${m[1].replace(/^window\./, "window.")}`)(global.window);
  return m[1];
};

let n = 0;
const ok = msg => console.log(`[PASS] UI ${++n}: ${msg}`);

// 1 委託板
g.state.chapter = 1;
ui.openModal("board");
assert.ok(active("modal-board") && html("board-body").includes("第 1 章認證") && html("board-body").includes("獵殺迷霧蝕影狼"));
ok("委託板開啟並列出本章委託與認證進度");

// 2 領取委託
for (let i = 0; i < 6; i++) { g.startCombat({ enemyId: "mist_wolf" }, "5,5"); g.winCombat(); }
ui.openModal("board");
const gold0 = g.state.gold;
click("board-body", "window\\.gameUI\\.onClaimBoard\\('bq1_kA'\\)");
assert.ok(g.getBoardState().done.includes("bq1_kA") && g.state.gold > gold0);
assert.ok(html("board-body").includes("已完成"));
ok("點擊領取鈕：發獎勵、標記完成並重繪");

// 3 訓練場分頁與購買
ui.renderBoardModal("train");
assert.ok(html("board-body").includes("體魄鍛鍊"));
g.state.gold = 5000;
const hp0 = g.getComputedStats().maxHp;
click("board-body", "window\\.gameUI\\.onBuyTraining\\('vit'\\)");
assert.strictEqual(g.getComputedStats().maxHp, hp0 + 16);
assert.ok(html("board-body").includes("1/10 階"));
ok("訓練場分頁切換、購買提升屬性並更新階數");

// 4 金幣不足時按鈕 disabled
g.state.gold = 0;
ui.renderBoardModal("train");
assert.ok(/disabled[^>]*onclick="window\.gameUI\.onBuyTraining\('vit'\)"/.test(html("board-body")));
ok("金幣不足時訓練按鈕為停用");

// 5 商店依章節顯示高階補給
g.state.chapter = 1;
ui.openModal("shop");
assert.ok(!html("shop-catalog-list").includes("特級聖輝靈藥"));
g.state.chapter = 2;
ui.openModal("shop");
assert.ok(html("shop-catalog-list").includes("特級聖輝靈藥"));
g.state.gold = 1000;
click("shop-catalog-list", "window\\.gameUI\\.onBuyShopItem\\('grand_potion'\\)");
assert.strictEqual(g.state.inventory.grand_potion, 1);
ok("商店：第 2 章起才有高階補給，點購買會扣金幣並進背包");

// 6 星淵入口視窗與進出
ui.openModal("abyss");
assert.ok(html("abyss-body").includes("選擇起始樓層"));
click("abyss-body", "window\\.gameUI\\.onStartAbyss\\(1\\)");
assert.ok(g.state.inAbyss && g.state.abyssFloor === 1);
ui.openModal("abyss");
assert.ok(html("abyss-body").includes("離開星淵"));
click("abyss-body", "window\\.gameUI\\.onLeaveAbyss\\(\\)");
assert.ok(!g.state.inAbyss);
ok("星淵入口：進入第 1 層、星淵內視窗顯示離開鈕、離開後回到原位");

// 7 故事 NPC 對話視窗
g.state.chapter = 1;
g.loadZone(1, null, null, false, true);
const npc = Object.values(g.activeEvents).find(e => e.storyChain === "c1_stardust");
g.talkStoryNpc(npc);
assert.ok(active("modal-dialogue") && html("dialogue-body").includes("網袋"));
assert.ok(html("dialogue-body").includes("擊敗 3 隻迷霧蝕影狼"));
ok("故事 NPC：對話視窗顯示台詞與任務目標");

// 8 任務面板顯示故事與認證進度
ui.renderObjectiveTracker();
const qhtml = html("quest-tracker-list");
assert.ok(qhtml.includes("本章故事") && qhtml.includes("漁網裡的星砂"), "任務面板應顯示故事支線");
assert.ok(qhtml.includes("獵人公會委託"), "任務面板應列出公會認證進度");
ok("任務面板：列出本章故事支線與公會認證進度");

// 9 委託板徽章
g.state.chapter = 1;
g.state.level = 5;
ui.renderObjectiveTracker();
assert.ok(els["board-badge"].style.display === "inline-block" && Number(els["board-badge"].textContent) >= 1, "有可領取委託時徽章顯示數字");
ok("委託板徽章已更新");

// 10 首領認證門 toast
g.state.chapter = 1;
g.loadZone(3, 14, 7, false, true);
const be = Object.entries(g.activeEvents).find(([c, e]) => e.type === "boss");
g.state.board = { prog: {}, done: [] };
g.startCombat(be[1], be[0]);
assert.ok(!g.combat && toasts.some(m => m.includes("尚未認證")));
ok("未通過認證挑戰首領：不開戰並顯示提示");

// 11 故事最後一段：選擇視窗與按鈕
g.state.chapter = 1;
g.state.story = { c1_stardust: { step: 2, accepted: false, kills: 0, done: false } };
g.loadZone(3, null, null, false, true);
const fnpc = Object.values(g.activeEvents).find(e => e.storyChain === "c1_stardust");
assert.ok(fnpc, "最後一段 NPC 在 1-3");
g.talkStoryNpc(fnpc);
assert.ok(active("modal-dialogue") && html("dialogue-body").includes("你要怎麼做") && html("dialogue-body").includes("choice-btn"));
const goldC = g.state.gold;
click("dialogue-body", "window\\.gameUI\\.onStoryChoice\\('c1_stardust', 0\\)");
assert.ok(g.getStoryState("c1_stardust").done && g.getStoryState("c1_stardust").choice === "bury" && g.state.gold >= goldC);
assert.ok(html("dialogue-body").includes("星砂的低語") || html("dialogue-body").includes("手札"), "選擇後顯示結果與手札");
ok("故事選擇：視窗列出選項，點選後完成故事、記錄選擇並顯示結果");

// 12 旅行者之門分頁
g.state.visitedZones = { "1-1": true, "1-2": true, "1-3": true, "2-1": true };
g.loadChapter(2, true, 1);
ui.openModal("board");
ui.renderBoardModal("travel");
assert.ok(html("board-body").includes("旅行者之門") && html("board-body").includes("1-2"));
click("board-body", "window\\.gameUI\\.onTravel\\(1, 2\\)");
assert.ok(g.state.chapter === 1 && g.state.subZone === 2, "點擊傳送回 1-2");
ui.renderBoardModal("travel");
assert.ok(/disabled[^>]*onclick="window\.gameUI\.onTravel\(1, 2\)"/.test(html("board-body")), "目前所在區域按鈕停用");
ok("旅行者之門：分頁列出到過的區域，點擊傳送並停用當前區域");

// 13 結局畫面顯示旅途的回聲
ui.showEndingSelectionModal();
ui.selectEnding("liberation");
assert.ok(html("ending-choices-box").includes("旅途的回聲") && html("ending-choices-box").includes("星砂"), "結局畫面列出選擇後記");
ok("結局畫面：顯示故事選擇留下的「旅途的回聲」");

// 14 讀檔錯誤處理：來自較新版本的存檔顯示提示且不破壞目前進度
const futureRaw = JSON.parse(g.serialize());
futureRaw.state.saveVer = 999;
global.localStorage = { getItem: () => JSON.stringify(futureRaw), setItem: () => {} };
const lvKeep = g.state.level;
toasts.length = 0;
ui.onLoadSlot(1);
assert.ok(toasts.some(m => m.includes("比遊戲支援的")) && g.state.level === lvKeep);
ok("讀取較新版本存檔：顯示版本提示，目前進度不變");

// 15 常駐懸賞畫面與領取
g.state.chapter = 1;
ui.openModal("board");
ui.renderBoardModal("quests");
assert.ok(html("board-body").includes("常駐懸賞") && (html("board-body").match(/onClaimBounty/g) || []).length >= 3);
const bs0 = g.getBounties()[0];
if (bs0.kind === "item") g.state.inventory[bs0.item] = bs0.count; else g.state.bounty.slots[0].prog = bs0.count;
ui.renderBoardModal("quests");
const goldB = g.state.gold;
click("board-body", "window\\.gameUI\\.onClaimBounty\\(0\\)");
assert.ok(g.state.gold > goldB && g.state.bounty.claimed >= 1);
ok("常駐懸賞：列出 3 張，點領取發獎並換新的一張");

console.log(`=== UI 互動測試 ${n} 項全部通過 ===`);
process.exit(0);
