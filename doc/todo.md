# 《星隕編年史：霧海遺城》待辦清單 (`doc/todo.md`)

- [x] 建立專案規範文件骨架（`doc/plan.md`、`doc/todo.md`、`doc/worklog.md` 與根目錄 `README.md`）
- [x] 擴充 `StarfallChronicles/js/data.js`：
  - [x] 將五大章節全面改寫為「每章 3 大子區域（共 15 張獨立迷宮地圖）」，消除第 2～5 章複製貼上問題
  - [x] 新增 5 大章節共 10 項支線委託任務（Side Quests）NPC、支線任務道具與豐厚獎勵
  - [x] 新增各章節「菁英守衛 / 中首領（Elite Mini-Bosses）」與全敵人「屬性弱點（Weaknesses）」定義
  - [x] 擴充主動技能至 12 種（涵蓋物理、星輝、烈焰、寒霜、虛空、護盾防禦與回復）與新傳奇裝備配方
  - [x] 擴充星界奇遇祭壇事件至 6 種，並重構謎題提示（需配合手札線索解謎，不再直接把答案寫在題目上）
- [x] 升級 `StarfallChronicles/js/engine.js`：
  - [x] 支援多子區域（`subZone: 1 | 2 | 3`）地圖切換、跨區狀態保存與雙向通道 (`>` / `<`)
  - [x] 實作支線委託任務狀態追蹤、條件判定與交付獎勵邏輯
  - [x] 實作戰鬥「屬性弱點克制（Weakness Hit：1.25x 傷害 + 額外削盾 +1）」、破盾持續至玩家下回合易傷與菁英敵人特殊行為
  - [x] 實作鍛造工坊「裝備星紋強化（+1 ～ +5）」系統
  - [x] 調整導引與尋路邏輯：移除無腦自動通關外掛，改為可切換的「探索羅盤提示」，且戰爭迷霧未探索處隱藏標籤
- [x] 升級 `StarfallChronicles/js/ui.js` 與 `StarfallChronicles/index.html`：
  - [x] 更新頂部與地圖 HUD，顯示當前章節與子區域（如 `第一章：微光漁村與迷霧森林 — [1-1 微光漁村與外圍林道]`）及探索羅盤開關
  - [x] 右側任務面板同時呈現「主線目標」與「本章支線委託」
  - [x] 戰鬥介面顯示敵人「弱點屬性」標籤與技能屬性克制提示
  - [x] 鍛造工坊視窗新增「當前穿戴裝備部位強化（+1 ～ +5）」專區
  - [x] 密碼終端視窗改為顯示「已收集之手札線索摘錄」（未找到手札前提示去探索收集卷軸，不再直接無條件劇透答案）
- [x] 更新並擴充自動化測試 `StarfallChronicles/tests/test_game.js`，驗證全 5 章 × 3 子區域（共 15 張地圖）所有事件、支線、弱點戰鬥、裝備強化與無 Emoji 規範 100% 通過
- [x] 執行完整自我 Code Review，修正所有潛在問題並更新 `doc/worklog.md`、`doc/todo.md` 與 `README.md`

## 第二階段：超大型捲動地城 (`32x22`) 與高互動遊戲性升級
- [x] 於 `StarfallChronicles/js/pixel_art.js` 新增新地標像素圖塊（`trap_spike` 地脈陷阱、`secret_wall` 隱藏裂隙牆、`fountain` 星泉祝福池、`obelisk_trial` 星界試煉碑）
- [x] 於 `StarfallChronicles/js/engine.js` 實作：
  - [x] 全 15 個子區域與無盡星淵的 `32x22` 多翼迷宮擴建生成與事件配置（東翼秘境迴廊 + 南翼深淵遺跡 + 隱藏密室）
  - [x] 主動探索技能 `[Q] 星輝脈衝 (castAstralPulse)`（破除隱藏牆 `W`、淨化陷阱 `T`、震懾魔物觸發先制奇襲 `Ambush`、擴大視野）
  - [x] 新地圖互動事件（`W` 隱藏牆、`T` 陷阱、`D` 星泉祝福池 3 戰 Buff、`V` 星界試煉碑博弈）與動態巡邏魔物 (`stepRoamingEnemies`)
  - [x] 戰鬥「先制奇襲 (Ambush)」、「四大元素共鳴連攜 (Elemental Combo)」與「星靈夥伴主動協同大招 (`castCompanionSkill`)」
- [x] 於 `StarfallChronicles/js/ui.js`、`StarfallChronicles/index.html` 與 `StarfallChronicles/css/style.css` 實作：
  - [x] 擴大中央地圖畫布至 `960x640`，支援「平滑跟隨鏡頭 (Camera Follow)」與「`[M]` 全景俯瞰視角」一鍵切換
  - [x] 畫布右上角繪製「即時像素小地圖雷達 (Live Minimap)」與脈衝波紋動畫特效
  - [x] 新增 `[Q] 星輝脈衝`、`[M] 視角切換`、左側面板「星靈夥伴快速切換」與戰鬥中「`[C]` 星靈主動協同大招」按鈕
- [x] 擴充並執行 `StarfallChronicles/tests/test_game.js` 自動化測試與自我 Code Review，同步更新文件

## 第三階段：`40x28` 史詩級巨型迷宮 × 探索度獎勵 × 武器元素附魔 `[E]` × 完美防禦反擊
- [x] 於 `StarfallChronicles/js/pixel_art.js` 新增 `warp_pad` (`O` 星軌躍遷陣) 與 `ancient_reliquary` (`U` 遠古星魂聖棺) 16x16 像素圖塊
- [x] 於 `StarfallChronicles/js/engine.js` 實作：
  - [x] 將全 15 個子區域與無盡星淵進一步擴展至 `40x28`（每區 1,120 格，較初版擴大 4 倍），加入「極東星界聖殿 (`x: 32..39`)」與「極淵地下墓穴 (`y: 22..27`)」
  - [x] 新增雙向星軌躍遷陣 (`O`) 瞬移邏輯與遠古星魂聖棺 (`U`) 永久屬性強化事件
  - [x] 新增子區域探索度百分比計算 (`getZoneExplorationPercent`) 與 55% 探索里程碑自動獎勵
  - [x] 新增武器五屬性自由附魔切換 (`cycleWeaponElement` / `[E]` 鍵) 與戰鬥「完美星紋防禦反擊 (Perfect Guard Counter)」
- [x] 於 `StarfallChronicles/js/ui.js` 與 `StarfallChronicles/index.html` 實作：
  - [x] 更新 `40x28` 全景縮放比例與右上角雷達小地圖（即時顯示探索度百分比 `%` 與新地標 `O`、`U`）
  - [x] 新增 `[E] 武器附魔切換` 按鈕（頂部導引列與戰鬥面板同步顯示當前附魔屬性）
- [x] 擴充並執行 `StarfallChronicles/tests/test_game.js` 自動化測試與自我 Code Review，同步更新文件

## 第四階段：HD-2D 像素美術、動態點光源與戰鬥舞台視覺升級
- [x] 於 `StarfallChronicles/js/pixel_art.js` 升級五大章節專屬牆體材質 (`#`)、地磚紋理細節 (`.`)、動態流體波光 (`~`) 與古橋立體像素結構 (`=`)
- [x] 於 `StarfallChronicles/js/ui.js` 實作：
  - [x] 地圖 HD-2D 動態點光源光暈（營火、星泉、躍遷陣、聖棺、星碑、傳送陣與主角照明）
  - [x] 角色與物件腳底立體橢圓落影、主角 `[E]` 武器五屬性附魔星紋光環與柔和迷霧暗角
  - [x] 戰鬥舞台 (`drawBattleScene`) 多層次章節遠景剪影、透視地坪、敵方韌性護盾光罩與五屬性專屬彈道/交叉斬擊特效
- [x] 於 `StarfallChronicles/css/style.css` 升級 16-Bit 皇家星盤金屬浮雕邊框、分段高光計量條與介面視覺質感
- [x] 執行 `StarfallChronicles/tests/test_game.js` 自動化測試與自我 Code Review，同步更新文件
