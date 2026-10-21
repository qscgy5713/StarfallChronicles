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
    "../js/combat_rt_ui.js",
    "../js/data_chapters.js",
    "../js/data_gen.js",
    "../js/mixin.js",
    "../js/engine_guild.js",
    "../js/engine_story.js",
    "../js/data_story.js",
    "../js/ui_guild.js"
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
  require("../js/ui_guild.js");
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
    // 首領認證門：未完成委託時無法開戰；補滿委託後才可開戰
    cg.startCombat({ enemyId: "boss_thorn_behemoth" }, coord);
    assert.ok(!cg.combat, "未完成公會認證不能挑戰首領");
    dd.boardQuests.filter(q => q.chapter === 1).forEach(q => cg.getBoardState().done.push(q.id));
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

  // Test 12: 無盡星淵 - 進出、詞綴、里程碑起點、層主通關獎勵
  {
    const ag = new StarfallEngine(global.window.GAME_DATA);
    const ox = ag.state.x, oy = ag.state.y, och = ag.state.chapter;
    ag.enterAbyss(1);
    assert.ok(ag.state.inAbyss && ag.state.abyssMod === "bounty", "第 1 層應為豐饒詞綴");
    assert.deepStrictEqual(ag.getAbyssStartFloors(), [1], "未通關前只能從第 1 層開始");
    assert.ok(ag.leaveAbyss() && !ag.state.inAbyss, "應可離開星淵");
    assert.strictEqual(ag.state.chapter, och, "離開後應回到原章節");
    assert.ok(ag.state.x === ox && ag.state.y === oy, "離開後應回到進入前的座標");
    ag.state.maxAbyssFloor = 5;
    assert.deepStrictEqual(ag.getAbyssStartFloors(), [1, 6], "通關第 5 層後可從第 6 層開始");
    ag.enterAbyss(2);
    assert.strictEqual(ag.state.abyssMod, "fierce", "第 2 層應為猛攻詞綴");
    const e2 = Object.values(ag.activeEvents).find(ev => ev.type === "enemy");
    assert.strictEqual(e2.abyssMod, "fierce", "層內魔物應帶有詞綴");
    ag.enterAbyss(3);
    const sev = Object.values(ag.activeEvents).find(ev => ev.type === "enemy");
    ag.startCombat(sev, "6,4");
    const base = ag.data.enemies[sev.enemyId];
    assert.strictEqual(ag.combat.enemyMaxShield, base.shield + 1, "堅殼詞綴護盾 +1");
    ag.combat = null;
    ag.enterAbyss(4);
    const fev = Object.values(ag.activeEvents).find(ev => ev.type === "enemy");
    ag.startCombat(fev, "6,4");
    assert.ok(ag.combat.enraged, "狂暴詞綴開戰即憤怒");
    ag.combat = null;
    ag.enterAbyss(5);
    const bev = Object.values(ag.activeEvents).find(ev => ev.type === "boss");
    assert.strictEqual(bev.enemyId, "boss_moebius", "每 5 層由噬星者守關");
    ag.startCombat(bev, "16,10");
    const gold0 = ag.state.gold, sp0 = ag.state.skillPoints;
    ag.winCombat();
    assert.ok(ag.state.gold >= gold0 + 300, "層主通關應有金幣獎勵");
    assert.ok((ag.state.inventory.boss_moebius_core || 0) >= 1, "層主通關必得稀有核心");
    assert.ok((ag.state.inventory.void_essence || 0) >= 2, "里程碑層應得虛空星塵");
    assert.ok(ag.state.skillPoints >= sp0 + 1, "首次突破里程碑層 +1 技能點");
    console.log("[PASS] Test 12: 無盡星淵（進出/詞綴/里程碑起點/層主獎勵）驗證通過");
  }

  // Test 13: 公會委託板、章節認證、魔物重生、訓練場、高階補給
  {
    const bg = new StarfallEngine(global.window.GAME_DATA);
    const dd = global.window.GAME_DATA;
    assert.ok(dd.boardQuests.length >= 40, "委託板應有 40 件以上委託");
    assert.strictEqual(bg.getChapterGate(1).need, 6);
    assert.ok(bg.getChapterGate(1).elite && bg.getChapterGate(1).elite.zone === 2, "認證需討伐 1-2 的菁英");
    assert.ok(!bg.isChapterGateOpen(1), "初始未通過認證");
    const objGate = (() => { bg.state.flags.ch1_boss_defeated = false; return bg.getCurrentObjective(); })();
    assert.ok(objGate, "應有目標");
    // 獵殺委託：擊敗魔物累計進度，達標後可領獎
    const kq = dd.boardQuests.find(q => q.id === "bq1_kA");
    for (let i = 0; i < kq.req.count; i++) {
      bg.startCombat({ enemyId: "mist_wolf" }, "5,5");
      bg.winCombat();
    }
    const gold0 = bg.state.gold;
    const res = bg.claimBoardQuest("bq1_kA");
    assert.ok(res.ok && bg.state.gold > gold0, "獵殺達標應可領取獎勵");
    assert.ok(!bg.claimBoardQuest("bq1_kA").ok, "不可重複領取");
    assert.ok(!bg.claimBoardQuest("bq1_lv").ok, "等級未達不可領取");
    assert.strictEqual(bg.getChapterGate(1).done, 1);
    // 未解鎖章節的委託不能領
    assert.ok(!bg.claimBoardQuest("bq2_kA").ok, "未到章節的委託不可領");
    // 認證門：委託數達標但未討伐菁英仍不通過
    dd.boardQuests.filter(q => q.chapter === 1 && q.req.type !== "flag").slice(0, 6).forEach(q => { const b = bg.getBoardState(); if (!b.done.includes(q.id)) b.done.push(q.id); });
    assert.ok(!bg.isChapterGateOpen(1), "未討伐菁英不可通過認證");
    bg.state.flags.elite_fenrir_defeated = true;
    assert.ok(bg.claimBoardQuest("bq1_elite").ok);
    assert.ok(bg.isChapterGateOpen(1), "委託與菁英都完成後通過認證");
    // 一般魔物不永久消失（重進區域後重生）
    const e0 = Object.entries(bg.activeEvents).find(([c, ev]) => ev.type === "enemy" && !ev.winFlag && dd.enemies[ev.enemyId] && !dd.enemies[ev.enemyId].isElite);
    assert.ok(e0, "區域內應有一般魔物");
    bg.startCombat(e0[1], e0[0]);
    bg.winCombat();
    const [rx, ry] = e0[0].split(",").map(Number);
    assert.strictEqual(bg.activeMap[ry][rx], ".", "擊敗後該格清空");
    bg.loadZone(1, bg.state.x, bg.state.y, false, true);
    assert.strictEqual(bg.activeMap[ry][rx], "E", "重新載入區域後一般魔物重生");
    // 訓練場
    bg.state.gold = 100000;
    const hp0 = bg.getComputedStats().maxHp, atk0 = bg.getComputedStats().atk;
    assert.ok(bg.buyTraining("vit").ok && bg.buyTraining("atk").ok);
    assert.strictEqual(bg.getComputedStats().maxHp, hp0 + 16, "體魄 +16 生命");
    assert.strictEqual(bg.getComputedStats().atk, atk0 + 2, "武藝 +2 攻擊");
    for (let i = 0; i < 20; i++) bg.buyTraining("vit");
    assert.ok(!bg.buyTraining("vit").ok, "訓練有階數上限");
    assert.strictEqual(bg.state.train.vit, 10);
    // 高階補給存在於商店
    assert.ok(dd.shopCatalog.some(e => e.itemId === "grand_potion" && e.minChapter === 2));
    // 存檔往返保留委託與訓練
    const raw = bg.serialize();
    const bg2 = new StarfallEngine(dd);
    bg2.deserialize(raw);
    assert.ok(bg2.getBoardState().done.includes("bq1_kA") && bg2.state.train.vit === 10);
    console.log("[PASS] Test 13: 公會委託板、章節認證、魔物重生、訓練場與高階補給驗證通過");
  }

  // Test 14: 劇情系統 - 故事支線三段式、劇情場景、手札與結局條件
  {
    const dd = global.window.GAME_DATA;
    assert.strictEqual(dd.storyChains.length, 10, "應有 10 條故事支線");
    assert.strictEqual(dd.storyScenes.length, 15, "應有 15 段劇情場景");
    assert.ok(dd.storyChains.every(c => c.steps.length === 3 && c.steps.every(s => s.name && s.offer.length && s.done.length)), "每條故事 3 段且文字完整");
    assert.ok(dd.storyChains.every(c => dd.loreEntries.some(l => l.id === c.lore)), "每條故事都有對應手札");
    // 每個章節/子區域：故事 NPC 與場景都能放到地圖上
    for (let ch = 1; ch <= 5; ch++) {
      const eg = new StarfallEngine(dd);
      eg.state.chapter = ch;
      for (let z = 1; z <= 3; z++) {
        eg.loadZone(z, null, null, false, true);
        const npcs = Object.values(eg.activeEvents).filter(e => e.sceneId);
        assert.ok(npcs.length >= 1, `${ch}-${z} 應有劇情場景`);
        eg.getStoryChains(ch).forEach(c => {
          const st = eg.getStoryState(c.id);
          if (c.steps[st.step].zone === z) assert.ok(eg.getStoryNpcPos(c.id), `${ch}-${z} 應有故事 NPC ${c.id}`);
        });
      }
    }
    // 走完一條故事：接取 → 擊殺 → 交付 → 下一段 → 結尾解鎖手札
    const sg = new StarfallEngine(dd);
    const chain = dd.storyChains.find(c => c.id === "c1_stardust");
    sg.state.chapter = 1;
    const talk = z => {
      sg.loadZone(z, null, null, false, true);
      const ev = Object.values(sg.activeEvents).find(e => e.storyChain === chain.id);
      assert.ok(ev, "應找到故事 NPC");
      return sg.talkStoryNpc(ev);
    };
    let r = talk(1);
    assert.ok(!r.completed && sg.getStoryState(chain.id).accepted, "第一次對話為接取");
    r = talk(1);
    assert.ok(!r.completed, "未擊殺前回報應提示進度");
    for (let i = 0; i < 3; i++) { sg.startCombat({ enemyId: "mist_wolf" }, "5,5"); sg.winCombat(); }
    const gold0 = sg.state.gold;
    r = talk(1);
    assert.ok(r.completed && sg.state.gold > gold0 && sg.getStoryState(chain.id).step === 1, "擊殺完成後交付並進入第二段");
    // 第二段需交付星辰碎晶
    r = talk(2);
    assert.ok(!r.completed);
    sg.state.inventory.star_shard = 2;
    r = talk(2);
    assert.ok(r.completed && !sg.state.inventory.star_shard, "第二段消耗物品並完成");
    r = talk(3);
    assert.ok(!r.completed && r.choices && r.choices.length === 2 && !sg.getStoryState(chain.id).done, "最後一段先呈現選擇，尚未選擇前故事不結束");
    assert.ok(dd.storyChains.every(c => { const ch = c.steps[2].choices; return ch && ch.length === 2 && ch.every(x => x.label && x.done.length && x.epilogue); }), "每條故事最後一段有 2 個完整選擇");
    assert.ok(!sg.resolveStoryChoice(chain.id, 5).ok, "無效選項被拒絕");
    const gold1 = sg.state.gold;
    const cr = sg.resolveStoryChoice(chain.id, 1);
    assert.ok(cr.ok && sg.getStoryState(chain.id).done && sg.state.gold > gold1, "選擇後完成故事並發獎勵（含選擇額外獎勵）");
    assert.strictEqual(sg.getStoryState(chain.id).choice, "keep");
    assert.ok(sg.state.flags.story_c1_stardust_keep, "記錄選擇旗標");
    assert.ok(sg.getStoryEpilogue().length === 1 && sg.getStoryEpilogue()[0].includes("一撮星砂"), "結局後記收錄選擇");
    assert.ok(!sg.resolveStoryChoice(chain.id, 0).ok, "完成後不可再選");
    assert.ok(sg.state.loreUnlocked.includes("story_lore_1") && sg.state.flags.story_c1_stardust_done, "解鎖專屬手札與旗標");
    // 旅行者之門：只能回到到過的區域；戰鬥/星淵中不能用
    const tg = new StarfallEngine(dd);
    tg.loadChapter(1, true, 1);
    assert.ok(!tg.travelTo(2, 1).ok, "沒到過的章節不能傳送");
    tg.loadChapter(2, true, 1);
    assert.ok(tg.travelTo(1, 1).ok && tg.state.chapter === 1, "可傳送回到過的區域");
    assert.ok(tg.getTravelOptions().length === 2 && tg.getTravelOptions()[0].zones.some(z => z.visited));
    tg.startCombat({ enemyId: "mist_wolf" }, "5,5");
    assert.ok(!tg.travelTo(2, 1).ok, "戰鬥中不能傳送");
    tg.combat = null;
    tg.enterAbyss(1);
    assert.ok(!tg.travelTo(1, 1).ok, "星淵中不能傳送");
    const old2 = JSON.parse(tg.serialize());
    delete old2.state.visitedZones;
    old2.state.chapter = 3; old2.state.subZone = 2; old2.state.inAbyss = false;
    const tg2 = new StarfallEngine(dd);
    tg2.deserialize(old2);
    assert.ok(tg2.state.visitedZones["1-3"] && tg2.state.visitedZones["2-1"] && tg2.state.visitedZones["3-2"] && !tg2.state.visitedZones["3-3"], "舊存檔補齊到過的區域");
    assert.ok(!Object.values((sg.loadZone(3, null, null, false, true), sg.activeEvents)).some(e => e.storyChain === chain.id), "完成後 NPC 不再出現");
    // 劇情場景可閱讀並給予首次獎勵；任務面板資料
    sg.loadZone(1, null, null, false, true);
    const sc = Object.values(sg.activeEvents).find(e => e.sceneId === "s1a");
    assert.ok(sc && sc.dialogue.length >= 2 && sc.firstReward);
    const g1 = sg.state.gold;
    sg.interactTile(5, 5, "N", sc);
    assert.ok(sg.state.gold > g1 && sg.state.flags.scene_s1a, "首次閱讀場景給獎勵並記旗標");
    sg.refreshStoryEvents();
    assert.ok(!Object.values(sg.activeEvents).find(e => e.sceneId === "s1a").firstReward, "領過後重新放置不再有獎勵");
    assert.ok(sg.getStoryLog().some(l => l.done) && sg.getStoryLog().length === 2, "故事紀錄應列出本章 2 條");
    // 手札數量讓結局解鎖條件更容易達成
    // 營火重生：打倒的魔物回來，存活的（含巡邏位置）保留；不重複生出
    const rg = new StarfallEngine(dd);
    rg.loadZone(1, null, null, false, true);
    const enemies0 = Object.entries(rg.activeEvents).filter(([c, e]) => e.type === "enemy");
    const [kc, ke] = enemies0[0];
    const [mc, me] = enemies0[1];
    rg.startCombat(ke, kc); rg.winCombat();
    // 模擬另一隻巡邏移動
    const [mx, my] = mc.split(",").map(Number);
    rg.activeMap[my][mx] = "."; delete rg.activeEvents[mc];
    rg.activeMap[my][mx + 1] = "E"; rg.activeEvents[`${mx + 1},${my}`] = me;
    rg.respawnEnemies();
    assert.strictEqual(Object.values(rg.activeEvents).filter(e => e.type === "enemy").length, enemies0.length, "重生後魔物總數不變（無重複）");
    assert.ok(rg.activeEvents[kc] && rg.activeEvents[kc].type === "enemy", "被打倒的魔物重生");
    assert.ok(rg.activeEvents[`${mx + 1},${my}`] === me && !rg.activeEvents[mc], "存活的巡邏魔物保持原位置且不複製");
    sg.state.loreUnlocked = dd.storyChains.map(c => c.lore).slice(0, 6);
    assert.ok(sg.getAvailableEndings().includes("symbiosis"), "6 篇手札可解鎖共生結局");
    sg.state.loreUnlocked = dd.storyChains.map(c => c.lore);
    assert.ok(!sg.getAvailableEndings().includes("voyager"), "只靠故事手札不能解鎖隱藏結局");
    assert.strictEqual(sg.getWorldLoreCount(), 0);
    sg.state.loreUnlocked = dd.loreEntries.filter(l => /^lore_/.test(l.id)).slice(0, 10).map(l => l.id);
    assert.ok(sg.getAvailableEndings().includes("voyager"), "10 篇主線手札可解鎖隱藏結局");
    // 舊存檔遷移：一般魔物的已完成標記被清除，精英/首領保留
    const mg = new StarfallEngine(dd);
    const wolfCoord = Object.entries(dd.chapters[1].zones[1].events).find(([c, e]) => e.type === "enemy" && !e.winFlag)[0];
    const eliteCoord = Object.entries(dd.chapters[1].zones[2].events).find(([c, e]) => e.winFlag === "elite_fenrir_defeated")[0];
    const old = JSON.parse(mg.serialize());
    delete old.state.respawnMigrated;
    old.state.completedEvents[`ch1_z1_${wolfCoord}`] = true;
    old.state.completedEvents[`ch1_z2_${eliteCoord}`] = true;
    mg.deserialize(old);
    assert.ok(!mg.state.completedEvents[`ch1_z1_${wolfCoord}`] && mg.state.completedEvents[`ch1_z2_${eliteCoord}`], "舊存檔遷移只清一般魔物");
    assert.ok(mg.state.board && mg.state.train && mg.state.story, "反序列化補齊預設欄位");
    // 存檔往返
    const sg2 = new StarfallEngine(dd);
    sg2.deserialize(sg.serialize());
    assert.ok(sg2.getStoryState(chain.id).done);
    console.log("[PASS] Test 14: 劇情系統（10 條三段式故事/15 段場景/手札與結局條件）驗證通過");
  }

  console.log("=== 《星隕編年史：魔物獵人 3D 狩獵紀元》全部 14 大自動化測試 100% 通過！ ===");
}

runTests();

