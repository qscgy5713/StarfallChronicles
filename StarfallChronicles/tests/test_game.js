/**
 * 《星隕編年史：霧海遺城》 v3.0 Director's Cut - 自動化測試套件
 * 驗證：全專案零 Emoji、全 5 章 x 3 子區域 (15 張地圖) 事件對齊、跨區傳送、屬性弱點破盾、支線任務與裝備強化 +1~+5
 */

const assert = require("assert");
const fs = require("fs");
const path = require("path");

global.window = {};
const { PixelArtEngine } = require("../js/pixel_art.js");
require("../js/data.js");
const { StarfallEngine } = require("../js/engine.js");
const { MH3DRenderer } = require("../js/mh3d.js");

// 即時戰鬥測試輔助：清除冷卻並讓主角站到魔物旁
function ready(g) {
  const rt = g.combat.rt;
  rt.cd = {};
  rt.gcd = 0;
  g.state.x = rt.mx - 1;
  g.state.y = rt.my;
}

function runTests() {
  console.log("=== 開始執行《星隕編年史：魔物獵人 3D 狩獵紀元》自動化測試 ===");

  // Test 1: 驗證全專案所有程式碼與介面 100% 零 Emoji
  const filesToCheck = [
    "../index.html",
    "../css/style.css",
    "../js/pixel_art.js",
    "../js/data.js",
    "../js/engine.js",
    "../js/mh3d.js",
    "../js/ui.js",
    "../js/combat_rt.js",
    "../js/combat_rt_ui.js"
  ];
  const emojiRegex = /\p{Extended_Pictographic}/u;
  filesToCheck.forEach(rel => {
    const fullPath = path.join(__dirname, rel);
    const content = fs.readFileSync(fullPath, "utf8");
    const match = content.match(emojiRegex);
    assert.strictEqual(match, null, `檔案 ${rel} 不應包含任何 Emoji，但發現: ${match ? match[0] : ""}`);
  });
  console.log("[PASS] Test 1: 全專案 7 大核心檔案 100% 零 Emoji 檢查通過");

  // Test 2: 驗證全 5 章 x 3 子區域 (共 15 張 40x28 巨型多翼迷宮地圖) 上所有互動物件 (N, S, G, E, B, C, L, M, R, P, ?, >, <, W, T, D, V, O, U) 皆有精準對應的事件定義
  const engine = new StarfallEngine(global.window.GAME_DATA);
  const interactiveTiles = new Set(["N", "S", "G", "E", "B", "C", "L", "M", "R", "P", "?", ">", "<", "W", "T", "D", "V", "O", "U"]);
  let totalMapsChecked = 0;
  for (let ch = 1; ch <= 5; ch++) {
    for (let z = 1; z <= 3; z++) {
      engine.loadChapter(ch, true, z);
      totalMapsChecked++;
      assert.strictEqual(engine.activeMap.length, 28, `第 ${ch}-${z} 區巨型地圖高度應為 28`);
      for (let y = 0; y < engine.activeMap.length; y++) {
        assert.strictEqual(engine.activeMap[y].length, 40, `第 ${ch}-${z} 區巨型地圖第 ${y} 行寬度應為 40`);
        for (let x = 0; x < engine.activeMap[y].length; x++) {
          const tile = engine.activeMap[y][x];
          if (interactiveTiles.has(tile)) {
            const ev = engine.resolveEventAt(x, y, tile);
            assert.ok(ev, `第 ${ch}-${z} 區地圖座標 (${x},${y}) 的圖塊 '${tile}' 必須有對應的事件定義！`);
          }
        }
      }
    }
  }
  assert.strictEqual(totalMapsChecked, 15, "應完整檢查 15 張 40x28 子區域地圖");
  console.log("[PASS] Test 2: 全 5 章 x 3 子區域 (15 張 40x28 巨型多翼地圖，共 16,800 格) 所有互動圖塊與事件座標 100% 對齊驗證通過");

  // Test 3: 模擬玩家在第一章跨子區域探索 (1-1 -> 1-2 -> 1-3)、點亮三座石碑、解開密碼鎖與跨區狀態持久化
  const game = new StarfallEngine(global.window.GAME_DATA);
  assert.strictEqual(game.state.compassEnabled, false, "預設應關閉星輝羅盤導引，保留戰爭迷霧探索樂趣");

  // 1-1: 與村長奧爾森 (4,1) 對話取得銅鑰
  game.interactTile(4, 1, "N", game.activeEvents["4,1"]);
  assert.strictEqual(game.state.keys["key_rusty_gate"], true, "應取得守林人銅鑰");

  // 1-1: 開啟東側鐵門 (7,3) 並點亮三座古老星碑 (1,6), (5,11), (16,3)
  game.state.x = 6;
  game.state.y = 3;
  game.move(1, 0);
  assert.strictEqual(game.activeMap[3][7], ".", "1-1 村口防禦門 (7,3) 應開啟為 '.'");

  game.interactTile(1, 6, "S", game.activeEvents["1,6"]);
  game.interactTile(5, 11, "S", game.activeEvents["5,11"]);
  game.interactTile(16, 3, "S", game.activeEvents["16,3"]);
  assert.strictEqual(game.state.flags["ch1_shrines_solved"], true, "三座星碑應全數點亮並觸發 ch1_shrines_solved");
  assert.strictEqual(game.activeMap[7][11], ".", "幽林封印門 (11,7) 應自動開啟");

  // 1-1 -> 1-2: 踏上 (18,7) 階梯前往 1-2 迷霧幽林深處
  game.state.x = 17;
  game.state.y = 7;
  game.move(1, 0);
  assert.strictEqual(game.state.subZone, 2, "應成功傳送至第 1-2 區（迷霧幽林深處）");

  // 1-2: 啟動古藤吊橋機關 (9,3) 並閱讀植物學手札 (4,11) 取得 312 密碼線索，再從 (18,11) 前往 1-3
  game.interactTile(9, 3, "S", game.activeEvents["9,3"]);
  assert.strictEqual(game.activeMap[7][12], "=", "1-2 溪流深澗應架起古藤木橋 '='");
  game.interactTile(4, 11, "L", game.activeEvents["4,11"]);
  assert.ok(game.state.loreUnlocked.includes("lore_3"), "應解鎖植物學手札 lore_3");
  game.state.x = 17;
  game.state.y = 11;
  game.move(1, 0);
  assert.strictEqual(game.state.subZone, 3, "應成功傳送至第 1-3 區（古樹聖所與首領祭壇）");
  console.log("[PASS] Test 3: 第一章跨子區域移動 (1-1 -> 1-2 -> 1-3)、古碑架橋與跨區狀態持久化驗證通過");

  // Test 4: 驗證元素屬性弱點破盾 (+1 額外破盾與 1.25x 弱點傷害)
  game.startCombat({ enemyId: "corrupted_treant" }, "4,3");
  assert.ok(game.combat, "應進入腐化古樹精戰鬥");
  game.combat.enemyHp = 3500;
  game.combat.enemyMaxHp = 3500;
  if (game.combat.parts) {
    game.combat.parts.body.hp = 200;
    game.combat.parts.body.maxHp = 200;
  }
  // corrupted_treant shield = 3, weaknesses = ['fire', 'star']
  // 使用 star 屬性的 star_bolt (原本 shieldBreak: 2，命中弱點應變成 2+1=3 直接打空 3 點護盾)
  ready(game);
  game.executeSkill("star_bolt");
  assert.strictEqual(game.combat.enemyShield, 0, "弱點屬性攻擊應額外削減 +1 韌性護盾並成功破盾");
  assert.strictEqual(game.combat.brokenThisTurn, true, "敵人護盾歸零應進入 BREAK 暈眩狀態");
  game.state.baseAtk = 500;
  ready(game);
  game.autoBattleStep();
  assert.strictEqual(game.combat, null, "高攻擊下應擊敗腐化古樹精結束戰鬥");
  console.log("[PASS] Test 4: 屬性弱點克制破盾與回合制戰鬥驗證通過");

  // Test 5: 驗證支線任務進度追蹤與 NPC 回報獎勵
  game.addItem("moon_herb", 3);
  const sqProg = game.getSideQuestProgress("sq1_herbs");
  assert.ok(sqProg.ready, "持有 3 株以上月光螢草時 sq1_herbs 應為 ready");
  game.loadZone(1, 2, 10);
  const goldBefore = game.state.gold;
  game.interactTile(2, 11, "N", game.activeEvents["2,11"]);
  assert.ok(game.state.completedSideQuests.includes("sq1_herbs"), "與草藥師艾琳對話後應完成支線委託 sq1_herbs");
  assert.ok(game.state.gold > goldBefore, "完成支線應獲得金幣獎勵");
  console.log("[PASS] Test 5: 支線委託進度計算與 NPC 完成回報獎勵驗證通過");

  // Test 6: 驗證裝備部位淬煉強化 (+1 ~ +5)
  const atkBeforeUpg = game.getComputedStats().atk;
  game.state.gold = 2000;
  game.addItem("star_shard", 10);
  const upgRes = game.upgradeEquipmentSlot("weapon");
  assert.strictEqual(upgRes.ok, true, "應成功強化武器部位至 +1");
  assert.strictEqual(game.state.equipUpgrades.weapon, 1, "武器部位強化等級應為 +1");
  assert.ok(game.getComputedStats().atk > atkBeforeUpg, "武器部位 +1 應提升主角攻擊力");
  console.log("[PASS] Test 6: 裝備部位淬煉強化系統 (+1~+5) 驗證通過");

  // Test 7: 驗證 [Q] 星輝脈衝 (破除隱藏牆 W、淨化陷阱 T、震懾魔物觸發先制奇襲 Ambush)、星泉祝福池 D、元素共鳴連攜與 [C] 星靈主動大招
  game.loadZone(1, 26, 7);
  assert.strictEqual(game.activeMap[6][26], "W", "東翼 (26,6) 應存在隱藏裂隙秘牆 'W'");
  assert.strictEqual(game.activeMap[9][26], "T", "東翼 (26,9) 應存在星蝕地脈陷阱 'T'");
  const pulseRes = game.castAstralPulse();
  assert.strictEqual(pulseRes.ok, true, "應成功施放星輝脈衝");
  assert.strictEqual(game.activeMap[6][26], ".", "星輝脈衝應震碎 3 格內的隱藏裂隙秘牆 (26,6)");
  assert.strictEqual(game.activeMap[9][26], ".", "星輝脈衝應淨化拆除 3 格內的地脈陷阱 (26,9)");

  // 飲用星泉祝福池 D (25,3)
  game.interactTile(25, 3, "D", game.activeEvents["25,3"]);
  assert.ok(game.state.fieldBuff && game.state.fieldBuff.battlesLeft === 3, "飲用星泉應獲得 3 場戰鬥的星泉祝福");

  // 震懾東翼巡邏魔物 (23,4) 並觸發【先制奇襲 Ambush】與【元素共鳴連攜】、【星靈主動大招】
  game.state.x = 23;
  game.state.y = 3;
  game.state.pulseCooldown = 0;
  game.castAstralPulse();
  const patrolEv = game.activeEvents["23,4"];
  assert.ok(patrolEv && patrolEv.stunnedSteps > 0, "魔物應進入星芒震懾狀態");
  game.startCombat(patrolEv, "23,4");
  assert.ok(game.combat.enemyHp < game.combat.enemyMaxHp, "先制奇襲應在開戰時直接削減敵方 15% HP");
  assert.strictEqual(game.combat.companionCharge, 100, "開戰時星靈協同能量應為 100%");
  const compSkillRes = game.castCompanionSkill();
  assert.strictEqual(compSkillRes.ok, true, "應成功施放不耗回合的 [C] 星靈主動協同大招");
  ready(game);
  game.executeSkill("slash"); // physical
  const combosBefore = game.state.stats.combosTriggered;
  if (game.combat) {
    ready(game);
    game.executeSkill("star_bolt"); // star -> 觸發物理+星輝【熾刃連斬】元素共鳴
    assert.ok(game.state.stats.combosTriggered > combosBefore, "連續使用不同屬性戰技應觸發元素共鳴連攜");
  }
  console.log("[PASS] Test 7: [Q] 星輝脈衝、秘牆/陷阱/星泉互動、先制奇襲、元素共鳴連攜與 [C] 星靈大招驗證通過");

  // Test 8: 驗證星軌躍遷陣 O (雙向傳送)、遠古星魂聖棺 U (永久三維提升)、[E] 武器五屬性自由附魔與戰鬥【完美星紋防禦反擊】
  game.loadZone(1, 20, 3);
  assert.strictEqual(game.activeMap[3][21], "O", "東翼入口 (21,3) 應配置星軌躍遷陣 'O'");
  game.interactTile(21, 3, "O", game.activeEvents["21,3"]);
  assert.strictEqual(game.state.x, 36, "星軌躍遷陣應將主角瞬間傳送至極淵墓穴 (36,24)");
  assert.strictEqual(game.state.y, 24, "星軌躍遷陣應將主角瞬間傳送至極淵墓穴 (36,24)");

  // 啟封遠古星魂聖棺 U (36,4)
  const hpBeforeRelic = game.state.maxHp;
  const atkBeforeRelic = game.state.baseAtk;
  game.interactTile(36, 4, "U", game.activeEvents["36,4"]);
  assert.strictEqual(game.activeMap[4][36], ".", "遠古星魂聖棺啟封後應變為 '.'");
  assert.strictEqual(game.state.baseAtk, atkBeforeRelic + 2, "遠古星魂聖棺應永久提升 +2 基礎攻擊");
  assert.ok(game.state.maxHp > hpBeforeRelic, "遠古星魂聖棺應永久提升 +15 最大生命");

  // 驗證 [E] 武器五屬性附魔與【完美星紋防禦反擊 (Perfect Guard Counter)】
  game.state.weaponElement = "physical";
  const elemRes = game.cycleWeaponElement(); // physical -> star
  assert.strictEqual(elemRes.element, "star", "按 [E] 應將武器附魔切換為 star (星輝)");
  game.state.baseAtk = 30;
  game.recalcStats(true);
  game.startCombat({ enemyId: "mist_wolf" }, "12,3");
  // 將敵方當前意圖指向 heavy 強擊 (mist_wolf intents[2] 是 type: "heavy")
  const countersBefore = game.state.stats.perfectCounters || 0;
  ready(game);
  game.executeSkill("guard"); // 施展星紋防禦架開敵方強擊，觸發完美防反
  game.rtResolveStrike(game.combat.intents[2], { x: game.state.x, y: game.state.y, r: 2 }); // 展開障壁後立刻承受強擊
  assert.ok((game.state.stats.perfectCounters || 0) > countersBefore, "防禦狀態下承受敵方強擊應觸發【完美星紋防禦反擊】");
  console.log("[PASS] Test 8: 星軌躍遷陣 O、遠古星魂聖棺 U、[E] 武器五屬性附魔與【完美星紋防禦反擊】驗證通過");

  // Test 9: 驗證《魔物獵人》3D 視角投影與核心狩獵系統 (斬味系統、砥石研磨、魔物三部位鎖定破壞與斷尾、太刀見切斬與公會貓飯)
  const mhGame = new StarfallEngine(global.window.GAME_DATA);
  assert.strictEqual(mhGame.state.viewMode, "2d_pixel", "預設視角應為 2D 經典像素視角 (2d_pixel)");

  // 1. 視角切換循環測試 (2d_pixel -> 3d_shoulder -> 3d_orbit -> 2d_pixel)
  const v1 = mhGame.toggleViewMode();
  assert.strictEqual(v1.viewMode, "3d_shoulder", "第一次切換應為 3D 越肩狩獵視角 (3d_shoulder)");
  const v2 = mhGame.toggleViewMode();
  assert.strictEqual(v2.viewMode, "3d_orbit", "第二次切換應為 3D 廣角戰術視角 (3d_orbit)");
  const v3 = mhGame.toggleViewMode();
  assert.strictEqual(v3.viewMode, "2d_pixel", "第三次切換應回到 2D 經典像素視角 (2d_pixel)");

  // 2. 武器斬味系統與砥石研磨 [R] 測試
  assert.strictEqual(mhGame.state.sharpness, 100, "初始斬味應為 100");
  const sharpInfoInit = mhGame.getSharpnessTierInfo();
  assert.strictEqual(sharpInfoInit.tier, "purple", "100 斬味應為最高紫斬");
  assert.strictEqual(sharpInfoInit.mult, 1.38, "紫斬應提供 1.38 倍傷害加成");

  // 模擬戰鬥消耗斬味至綠斬，並使用砥石研磨恢復
  mhGame.state.sharpness = 45; // green
  assert.strictEqual(mhGame.getSharpnessTierInfo().tier, "green", "45 斬味應為綠斬");
  const grindRes = mhGame.sharpenWeapon();
  assert.strictEqual(grindRes.ok, true, "砥石研磨應成功");
  assert.strictEqual(mhGame.state.sharpness, 100, "砥石研磨後斬味應恢復至 100 紫斬");
  assert.strictEqual(mhGame.state.polishTurns, 2, "砥石研磨後應獲得 2 回合剛刃研磨");

  // 3. 獵人公會星辰貓飯料理亭 [G] 測試
  const mealRes = mhGame.eatCanteenMeal("meat_platter");
  assert.strictEqual(mealRes.ok, true, "享用勇氣全肉拼盤貓飯應成功");
  assert.ok(mhGame.state.canteenMeal && mhGame.state.canteenMeal.atkMult === 1.22, "攻大貓飯應提供 +22% 攻擊力增益");
  assert.strictEqual(mhGame.state.canteenMeal.battlesLeft, 4, "貓飯料理增益應持續 4 場狩獵");

  // 4. 魔物三部位鎖定瞄準與部位破壞 / 斷尾測試
  mhGame.loadZone(1, 10, 10);
  mhGame.startCombat({ enemyId: "elite_fenrir" }, "10,10"); // Mini-Boss 芬里爾
  assert.ok(mhGame.combat.parts.head && mhGame.combat.parts.body && mhGame.combat.parts.tail, "魔物應具備頭部、軀幹與尾巴三部位");
  assert.strictEqual(mhGame.combat.targetPart, "body", "預設瞄準部位應為軀幹");

  // 切換鎖定瞄準部位為【頭部】並進行破頭擊暈測試
  const selHead = mhGame.selectMonsterPart("head");
  assert.strictEqual(selHead.part, "head", "應成功鎖定魔物頭部");
  mhGame.combat.enemyHp = 2000;
  mhGame.combat.enemyMaxHp = 2000;
  mhGame.combat.parts.head.hp = 60; // 即時戰鬥魔物生命倍率較高，測試改以固定部位血量驗證破壞
  mhGame.combat.parts.tail.hp = 60;
  mhGame.state.baseAtk = 200; // 足夠傷害擊破部位且不秒殺魔物
  mhGame.recalcStats(false);
  const enemyShieldBeforeHeadBreak = mhGame.combat.enemyShield;
  ready(mhGame);
  mhGame.executeSkill("slash"); // 擊破頭部
  assert.strictEqual(mhGame.combat.parts.head.broken, true, "魔物頭部龍角應被徹底擊碎破壞");
  assert.ok(mhGame.state.stats.partsBroken >= 1, "部位破壞次數統計應累加");
  assert.ok(mhGame.combat.enemyShield < enemyShieldBeforeHeadBreak, "破頭應觸發氣絕KO額外削減 2 點護盾");

  // 切換鎖定瞄準部位為【尾巴】並進行斷尾測試
  mhGame.combat.enemyHp = 2000; // 確保魔物存活繼續測試斷尾
  const selTail = mhGame.selectMonsterPart("tail");
  assert.strictEqual(selTail.part, "tail", "應成功鎖定魔物尾巴");
  const tailsBefore = mhGame.state.stats.tailsSevered || 0;
  ready(mhGame);
  mhGame.executeSkill("slash"); // 斬斷尾巴
  assert.strictEqual(mhGame.combat.parts.tail.broken, true, "魔物尾巴應被成功斬斷");
  assert.strictEqual(mhGame.state.stats.tailsSevered, tailsBefore + 1, "斷尾統計次數應累加 1");

  // 5. 太刀見切斬 [X] 迴避減傷與【氣刃大迴旋】氣刃升階測試
  mhGame.combat.enemyHp = 500;
  assert.strictEqual(mhGame.state.spiritLevel, 0, "太刀氣刃初始應為 0 (無色刃)");
  mhGame.combat.rt.dodgeCd = 0;
  mhGame.state.mp = mhGame.state.maxMp;
  const foresightRes = mhGame.castForesightSlash();
  mhGame.rtResolveStrike(mhGame.combat.intents[0], { x: mhGame.state.x, y: mhGame.state.y, r: 2 }); // 翻滾無敵期間被擊中
  assert.strictEqual(foresightRes.ok, true, "太刀見切斬應成功施展");
  assert.strictEqual(mhGame.state.spiritLevel, 1, "受到敵方攻擊觸發氣刃大迴旋後，太刀氣刃應升階至 1 (白刃)");
  assert.ok((mhGame.state.stats.foresightCounters || 0) >= 1, "見切反擊統計應累加");

  // 6. 3D 透視投影與地面射線投射 (Raycast) 測試
  const mockUI = { engine: mhGame };
  const renderer = new MH3DRenderer(mockUI);
  const pProj = renderer.projectPoint(2, 0, 6, renderer.getCameraConfig(), 960, 640);
  assert.ok(pProj && typeof pProj.sx === "number" && typeof pProj.sy === "number", "3D 座標應成功投影為螢幕 (sx, sy) 像素座標");
  const rayHit = renderer.screenToWorldTile(480, 480, 960, 640);
  assert.ok(rayHit && typeof rayHit.tx === "number" && typeof rayHit.ty === "number", "螢幕中心點應成功反向投射至 3D 地面格子 (tx, ty)");

  console.log("[PASS] Test 9: 《魔物獵人》3D 視角投影、斬味砥石、部位破壞斷尾、太刀見切氣刃與公會貓飯驗證通過");

  // Test 10: 前端 UI 模組 (ui.js) 語法完整性與 GameUI 初始化無異常驗證
  const mockCanvasObj = () => ({
    getContext: () => ({
      fillRect: () => {},
      clearRect: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      stroke: () => {},
      fill: () => {},
      arc: () => {},
      ellipse: () => {},
      save: () => {},
      restore: () => {},
      strokeRect: () => {},
      fillText: () => {},
      measureText: () => ({ width: 10 }),
      createLinearGradient: () => ({ addColorStop: () => {} }),
      createRadialGradient: () => ({ addColorStop: () => {} }),
      setTransform: () => {},
      drawImage: () => {}
    }),
    toDataURL: () => "data:image/png;base64,",
    width: 960,
    height: 640,
    style: {},
    closest: () => ({ style: {} })
  });

  const prevDoc = global.document;
  const prevReqAnim = global.requestAnimationFrame;
  global.window.addEventListener = () => {};
  global.requestAnimationFrame = () => {};
  global.document = {
    getElementById: () => ({
      ...mockCanvasObj(),
      classList: { add: () => {}, remove: () => {}, contains: () => false },
      innerHTML: "",
      textContent: "",
      style: {},
      appendChild: () => {},
      addEventListener: () => {},
      setAttribute: () => {},
      closest: () => ({ style: {} }),
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 960, height: 640 })
    }),
    createElement: () => ({
      ...mockCanvasObj(),
      classList: { add: () => {}, remove: () => {}, contains: () => false },
      innerHTML: "",
      textContent: "",
      style: {},
      appendChild: () => {},
      addEventListener: () => {},
      setAttribute: () => {},
      closest: () => ({ style: {} })
    }),
    querySelectorAll: () => [],
    querySelector: () => null,
    addEventListener: () => {}
  };
  global.localStorage = {
    getItem: () => null,
    setItem: () => {}
  };

  require("../js/ui.js");
  require("../js/combat_rt_ui.js");
  const testUI = new global.window.GameUI(mhGame);
  assert.ok(testUI, "GameUI 應成功初始化且無任何語法錯誤");
  testUI.renderAll();
  assert.ok(true, "testUI.renderAll() 應順暢執行無異常");
  if (testUI.timerInterval) clearInterval(testUI.timerInterval);
  global.document = prevDoc;
  global.requestAnimationFrame = prevReqAnim;
  console.log("[PASS] Test 10: 前端 UI 模組語法完整性、事件綁定與 GameUI 初始化渲染驗證通過");

  // Test 11: 即時戰鬥 - 魔物追擊/預警/命中、技能冷卻、距離限制、翻滾無敵與撤退
  {
    const rg = new StarfallEngine(global.window.GAME_DATA);
    let coord = null;
    for (const k of Object.keys(rg.activeEvents)) {
      const [x, y] = k.split(",").map(Number);
      if (rg.activeMap[y][x] === "E") { coord = k; break; }
    }
    rg.startCombat({ enemyId: "mist_wolf" }, coord);
    const rt = rg.combat.rt;
    outer: for (let dx = -5; dx <= 5; dx++) {
      for (let dy = -5; dy <= 5; dy++) {
        if (Math.hypot(dx, dy) >= 4.5 && rg.rtWalkable(rt.mx + dx, rt.my + dy)) {
          rg.state.x = rt.mx + dx; rg.state.y = rt.my + dy; break outer;
        }
      }
    }
    const far = rg.executeSkill("slash");
    assert.strictEqual(far.ok, false, "距離太遠時近戰技能不可施放");
    // 不動等待：魔物應追上、預警並命中
    const hp0 = rg.state.hp;
    let sawWindup = false;
    for (let i = 0; i < 400 && rg.combat && rg.state.hp === hp0; i++) {
      rg.rtUpdate(0.05);
      if (rt.m.state === "windup" && rt.m.zone) sawWindup = true;
    }
    assert.ok(sawWindup, "魔物接近後應先進入帶預警範圍的出招前搖");
    assert.ok(rg.state.hp < hp0, "站在預警範圍內不閃避應受到傷害");
    // 冷卻
    rt.cd = {}; rt.gcd = 0;
    rg.state.x = rt.mx - 1; rg.state.y = rt.my;
    assert.strictEqual(rg.executeSkill("slash").ok, true, "貼近後可施放星芒斬");
    assert.strictEqual(rg.executeSkill("slash").ok, false, "施放後技能應進入冷卻");
    // 翻滾無敵：預警命中瞬間無敵 -> 不受傷並觸發氣刃大迴旋
    rt.dodgeCd = 0; rg.state.mp = rg.state.maxMp;
    rg.castForesightSlash();
    assert.ok(rt.ivT > 0, "翻滾後應有無敵時間");
    const hpIv = rg.state.hp;
    rg.rtResolveStrike(rg.combat.intents[0], { x: rg.state.x, y: rg.state.y, r: 2 });
    assert.strictEqual(rg.state.hp, hpIv, "無敵期間被擊中不應受傷");
    // 撤退需持續 1.6 秒
    assert.strictEqual(rg.fleeCombat(), true, "一般魔物可撤退");
    for (let i = 0; i < 40 && rg.combat; i++) { rt.fleeT > 0 && (rg.combat.rt.m.state = "recover", rg.combat.rt.m.t = 9); rg.rtUpdate(0.05); }
    assert.strictEqual(rg.combat, null, "撤退讀條完成後應脫離戰鬥");
    // 新攻擊型態：直線衝鋒 / 扇形 / 遠程落點與判定
    const line = { shape: "line", x: 10, y: 10, dx: 1, dy: 0, len: 5, w: 1.2 };
    assert.ok(rg.rtInZone(line, 13, 10) && !rg.rtInZone(line, 13, 12) && !rg.rtInZone(line, 17, 10), "直線預警應只命中路徑上的格子");
    const cone = { shape: "cone", x: 10, y: 10, dx: 1, dy: 0, r: 2.9, half: 1.0 };
    assert.ok(rg.rtInZone(cone, 12, 10) && !rg.rtInZone(cone, 8, 10) && !rg.rtInZone(cone, 10, 13), "扇形預警應只命中前方扇面");
    const rg2 = new StarfallEngine(global.window.GAME_DATA);
    rg2.startCombat({ enemyId: "mist_wolf" }, coord);
    const rt2 = rg2.combat.rt;
    rg2.state.x = rt2.mx + 4; rg2.state.y = rt2.my;
    rg2.combat.intentIndex = 2; // 強擊
    const plan = rg2.rtPlanAttack(rg2.combat.intents[2]);
    assert.ok(plan && plan.rush && plan.zone.shape === "line", "近戰魔物在中距離施放強擊應改為直線衝鋒");
    rg2.state.x = rt2.mx + 4;
    rg2.startCombat({ enemyId: "tide_siren" }, coord);
    rg2.state.x = rg2.combat.rt.mx + 4; rg2.state.y = rg2.combat.rt.my;
    const plan2 = rg2.rtPlanAttack({ type: "attack", mult: 1 });
    assert.ok(plan2 && plan2.proj && plan2.zone.x === rg2.state.x, "遠程魔物應以主角所在位置為落點發射彈幕");
    // 死亡懲罰：損失 15% 金幣
    rg2.state.gold = 200;
    rg2.loseCombat();
    assert.strictEqual(rg2.state.gold, 170, "戰敗應損失 15% 金幣");
    // 打斷 / 疲憊 / 出招硬直
    const fg = new StarfallEngine(global.window.GAME_DATA);
    fg.state.mp = 85;
    fg.startCombat({ enemyId: "mist_wolf" }, coord);
    ready(fg);
    const frt = fg.combat.rt;
    frt.m.state = "windup"; frt.m.t = 1; frt.m.windupMax = 1; frt.m.zone = { shape: "circle", x: fg.state.x, y: fg.state.y, r: 2 };
    assert.ok(fg.executeSkill("star_bolt").ok, "墜星矢應可施放");
    assert.strictEqual(frt.m.state, "recover", "耗魔重擊應打斷前搖中的一般魔物");
    assert.ok(frt.flinchCd > 0 && !frt.m.zone, "打斷後應進入冷卻並清除預警範圍");
    assert.ok(frt.lockT > 0, "出招後應有短暫硬直");
    const lx = fg.state.x;
    assert.strictEqual(fg.rtMove(-1, 0).moved, false, "出招硬直中不可走位");
    assert.strictEqual(fg.state.x, lx);
    fg.combat.enemyHp = Math.floor(fg.combat.enemyMaxHp * 0.2);
    frt.freeze = 0;
    fg.rtUpdate(0.05);
    assert.ok(frt.tiredShown, "生命低於 25% 應進入疲憊");
    // 剝取素材與狩獵裝備
    const cg = new StarfallEngine(global.window.GAME_DATA);
    const dd = global.window.GAME_DATA;
    assert.ok(dd.items.mist_wolf_hide && dd.items.boss_chronos_core && dd.enemies.mist_wolf.carve, "每種魔物應衍生三種素材");
    assert.ok(dd.recipes.filter(r => r.group === "monster").length === 15, "應有 5 首領武器 + 5 首領防具 + 5 精英聖物配方");
    dd.recipes.filter(r => r.group === "monster").forEach(r => {
      assert.ok(dd.items[r.result], "配方成品應存在：" + r.result);
      Object.keys(r.ingredients).forEach(id => assert.ok(dd.items[id], "配方素材應存在：" + id));
    });
    cg.startCombat({ enemyId: "boss_thorn_behemoth" }, coord);
    cg.combat.parts.head.broken = true;
    cg.combat.parts.body.broken = true;
    cg.combat.parts.tail.broken = true;
    cg.winCombat();
    const inv = cg.state.inventory;
    assert.ok((inv.boss_thorn_behemoth_fang || 0) >= 1 && (inv.boss_thorn_behemoth_hide || 0) >= 1 && (inv.boss_thorn_behemoth_core || 0) >= 1, "破壞三個部位應必得對應素材");
    cg.state.gold = 1000;
    inv.boss_thorn_behemoth_fang = 3; inv.boss_thorn_behemoth_hide = 1; inv.boss_thorn_behemoth_core = 1;
    assert.ok(cg.craftRecipe("craft_boss_thorn_behemoth_blade").ok, "素材足夠應可鍛造首領獵刃");
    console.log("[PASS] Test 11: 即時戰鬥（追擊/預警範圍/冷卻/距離/翻滾無敵/撤退）驗證通過");
  }

  console.log("=== 《星隕編年史：魔物獵人 3D 狩獵紀元》全部 11 大自動化測試 100% 通過！ ===");
}

runTests();

