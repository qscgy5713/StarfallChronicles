# 《星隕編年史：霧海遺城》(Chronicles of Starfall: The Mistbound Citadel) — Director's Cut v3.0

## 專案簡介
《星隕編年史：霧海遺城》是一款專為 macOS 打造的 **16-Bit 像素風 2D 迷霧探索 × 多層地城機關解謎 × 支線委託 × 弱點破盾戰術回合制 RPG**。  
本版本（v3.0 完整導演版）針對原本單調、5 分鐘即結束的問題進行了全面重構與擴充，提供約 **60–90 分鐘**的完整五大章節（共 **15 張 `40x28` 史詩級巨型多翼迷宮區域，單張 1,120 格、總計 16,800 格探索空間，較初版擴大 4 倍**）、**平滑跟隨鏡頭與即時像素小地圖雷達（顯示區域探索度 `%` 並支援 `[M]` 全景切換）**、**主動探索技 `[Q] 星輝脈衝`（震碎隱藏裂隙牆 `W`、拆除地脈陷阱 `T`、震懾巡邏魔物觸發【先制奇襲】）**、**雙向星軌躍遷陣 (`O`)、遠古星魂聖棺 (`U` 永久屬性強化)、星泉祝福池 (`D`) 與星界試煉碑 (`V`)**、**10 項支線委託任務**、**`[E]` 武器五屬性自由附魔 × 屬性弱點破盾 × 四大元素共鳴連攜 × 完美星紋防禦反擊 × `[C]` 星靈主動協同大招**、**菁英守衛（Mini-Boss）**、**裝備星紋強化（+1 ～ +5）**、**4 種多重結局**以及通關後的「**無盡星淵試煉（Roguelite 爬塔）**」。

---

## 技術棧
- **前端核心**：原生 HTML5 Canvas 2D + Vanilla JavaScript (ES6+) + CSS3（零外部依賴，100% 支援 `file://` 離線直接執行）
- **美術渲染**：自研 16x16 原生像素矩陣渲染引擎 (`PixelArtEngine`)，全專案 100% 零 Emoji
- **音效系統**：WebAudio API 程序化合成背景音樂（探索、戰鬥、首領戰 BGM）與 12 種動態音效 (`SoundSystem`)
- **資料儲存**：`localStorage` 多槽位存檔（自動存檔 + 3 組手動存檔槽）與 `.json` 存檔匯出/匯入
- **自動化測試**：Node.js 原生 `assert` 測試套件 (`StarfallChronicles/tests/test_game.js`)

---

## 安裝與環境設定
本專案為 **100% 免安裝、零外部依賴** 架構，無須安裝任何第三方套件即可直接遊玩。  
若需執行自動化測試套件，僅需 macOS 內建或已安裝之 `node`（Node.js v16+）。

---

## 啟動與使用方式

### 1. 啟動遊戲（三種方式任選）
- **方式一（Mac 原生應用程式）**：在 Finder 雙擊根目錄的 [`星隕編年史.app`](./星隕編年史.app)。
- **方式二（啟動腳本）**：在 Finder 雙擊 [`啟動星隕編年史.command`](./啟動星隕編年史.command)。
- **方式三（瀏覽器直接開啟）**：直接以 Safari / Chrome / Edge 開啟 [`StarfallChronicles/index.html`](./StarfallChronicles/index.html)。

### 2. 執行自動化測試
```bash
node StarfallChronicles/tests/test_game.js
```

---

## 目錄結構
```text
.
├── README.md                           # 專案根目錄總覽與說明文件
├── doc/                                # 專案規劃與過程記錄文件夾
│   ├── plan.md                         # 1 小時深度 RPG 改造計畫與設計方向
│   ├── todo.md                         # 待辦清單與進度追蹤
│   └── worklog.md                      # 工作日誌
├── 星隕編年史.app/                      # macOS 原生啟動封裝應用程式
├── 啟動星隕編年史.command               # macOS 快速啟動腳本
└── StarfallChronicles/                 # 遊戲主程式目錄
    ├── index.html                      # 遊戲主介面與互動視窗結構
    ├── css/
    │   └── style.css                   # 16-Bit 像素風格介面樣式表
    ├── js/
    │   ├── pixel_art.js                # 16x16 手繪像素圖塊與精靈渲染引擎
    │   ├── data.js                     # 15 大迷宮區域、支線任務、敵人弱點、裝備與手札資料庫
    │   ├── engine.js                   # 遊戲狀態機、多區域切換、支線追蹤、弱點戰鬥與強化引擎
    │   ├── ui.js                       # Canvas 渲染、迷霧視野、戰鬥動畫與介面控制器
    │   └── audio.js                    # WebAudio 程序化音樂與音效合成器
    ├── PRD_AND_ARCHITECTURE.md         # 原始產品規格與架構文件
    └── tests/
        └── test_game.js                # 全章節 15 區域、支線、戰鬥與零 Emoji 自動化測試
```

---

## `doc/` 文件索引
- [改造計畫與系統設計 (`doc/plan.md`)](./doc/plan.md)
- [待辦事項清單 (`doc/todo.md`)](./doc/todo.md)
- [開發工作日誌 (`doc/worklog.md`)](./doc/worklog.md)
