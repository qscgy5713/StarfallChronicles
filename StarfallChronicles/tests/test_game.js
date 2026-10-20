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

function runTests() {
  console.log("=== 開始執行《星隕編年史：霧海遺城 v3.0 Director's Cut》自動化測試 ===");

  // Test 1: 驗證全專案所有程式碼與介面 100% 零 Emoji
  const filesToCheck = [
    "../index.html",
    "../css/style.css",
    "../js/pixel_art.js",
    "../js/data.js",
    "../js/engine.js",
    "../js/ui.js"
  ];
  const emojiRegex = /\p{Extended_Pictographic}/u;
  filesToCheck.forEach(rel => {
    const fullPath = path.join(__dirname, rel);
    const content = fs.readFileSync(fullPath, "utf8");
    const match = content.match(emojiRegex);
    assert.strictEqual(match, null, `檔案 ${rel} 不應包含任何 Emoji，但發現: ${match ? match[0] : ""}`);
  });
  console.log("[PASS] Test 1: 全專案 6 大核心檔案 100% 零 Emoji 檢查通過");

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
  // corrupted_treant shield = 3, weaknesses = ['fire', 'star']
  // 使用 star 屬性的 star_bolt (原本 shieldBreak: 2，命中弱點應變成 2+1=3 直接打空 3 點護盾)
  game.executeSkill("star_bolt");
  assert.strictEqual(game.combat.enemyShield, 0, "弱點屬性攻擊應額外削減 +1 韌性護盾並成功破盾");
  assert.strictEqual(game.combat.brokenThisTurn, true, "敵人護盾歸零應進入 BREAK 暈眩狀態");
  game.state.baseAtk = 500;
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
  game.executeSkill("slash"); // physical
  const combosBefore = game.state.stats.combosTriggered;
  if (game.combat) {
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
  game.combat.intentIndex = 2;
  const countersBefore = game.state.stats.perfectCounters || 0;
  game.executeSkill("guard"); // 施展星紋防禦架開敵方強擊，觸發完美防反
  assert.ok((game.state.stats.perfectCounters || 0) > countersBefore, "防禦狀態下承受敵方強擊應觸發【完美星紋防禦反擊】");
  console.log("[PASS] Test 8: 星軌躍遷陣 O、遠古星魂聖棺 U、[E] 武器五屬性附魔與【完美星紋防禦反擊】驗證通過");

  console.log("=== v3.0 Director's Cut 全部自動化測試 100% 通過！ ===");
}

runTests();

