# 第三方素材：Kenney 像素圖集

本資料夾存放遊戲使用的免費素材，授權皆為 **CC0（公有領域，可自由使用、修改與散布，無須標註）**。

| 資料夾 | 名稱 | 來源 |
|---|---|---|
| `tiny-dungeon/` | Tiny Dungeon v1.0（16x16 角色、怪物、地下城物件） | https://kenney.nl/assets/tiny-dungeon |
| `tiny-town/` | Tiny Town（16x16 樹木、地形、房屋） | https://kenney.nl/assets/tiny-town |

- 僅保留 `Tilemap/tilemap_packed.png`（12 欄 x 11 列，每格 16px，無間距）與授權檔。
- 遊戲實際載入的是內嵌版本 `js/kenney_assets.js`（由上述兩張圖集轉成 base64 data URI，確保離線 `file://` 可用）。
- 精靈代號與圖集格序號的對應表見 `js/pixel_art.js` 的 `initExternalSprites()`。
