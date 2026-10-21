/**
 * 衍生資料產生器 (Generators)：魔物素材與狩獵裝備、獵人公會委託板/章節認證/訓練場/高階補給。
 * 由 data.js 載入之後才執行，直接擴充 GAME_DATA。
 */
(function (GAME_DATA) {

// ==================== 魔物素材與獵人裝備 (剝取 → 鍛造) ====================
// 每種魔物自動衍生三種素材：皮革(軀幹破壞必得)、利牙(頭部破壞必得)、稀有核心(斷尾必得)。
// 首領素材鍛造專屬武器與防具，精英素材鍛造聖物；魔物圖鑑有討伐紀錄或持有素材後配方才會出現。
(function buildMonsterGear(D) {
  const shortName = n => n.replace(/【.*?】/g, "").split("・")[0];
  const bossGear = {
    boss_thorn_behemoth: { atk: 24, crit: 6, def: 10, hp: 40 },
    boss_chronos: { atk: 32, crit: 8, def: 14, hp: 60 },
    boss_ignis: { atk: 44, crit: 10, def: 19, hp: 85 },
    boss_astra: { atk: 56, crit: 12, def: 25, hp: 110 },
    boss_moebius: { atk: 66, crit: 14, def: 32, hp: 140 }
  };
  const eliteRelic = {
    elite_fenrir: { atk: 5, crit: 5, maxMp: 15 },
    elite_abyss_crab: { atk: 7, crit: 6, maxMp: 20 },
    elite_vulcan: { atk: 9, crit: 7, maxMp: 28 },
    elite_twin_inquisitor: { atk: 11, crit: 8, maxMp: 36 },
    elite_regis: { atk: 13, crit: 9, maxMp: 45 }
  };
  Object.values(D.enemies).forEach(en => {
    const ch = en.chapter || 1;
    const sn = shortName(en.name);
    en.carve = { hide: en.id + "_hide", fang: en.id + "_fang", core: en.id + "_core" };
    D.items[en.carve.hide] = { id: en.carve.hide, name: sn + "皮革", icon: "icon_gear", category: "material", value: 10 + ch * 6, desc: "破壞【" + sn + "】軀幹後剝取的堅韌皮革。" };
    D.items[en.carve.fang] = { id: en.carve.fang, name: sn + "利牙", icon: "icon_atk", category: "material", value: 14 + ch * 8, desc: "破壞【" + sn + "】頭部後剝取的鋒利牙爪。" };
    D.items[en.carve.core] = { id: en.carve.core, name: sn + "稀有核心", icon: "crystal", category: "material", value: 40 + ch * 20, desc: "斬斷【" + sn + "】尾巴或幸運剝取才有的稀有核心。" };
    const bg = bossGear[en.id];
    if (bg) {
      const wid = en.id + "_blade";
      const aid = en.id + "_mail";
      D.items[wid] = { id: wid, name: sn + "獵刃", icon: "icon_atk", category: "equipment", slot: "weapon", stats: { atk: bg.atk, crit: bg.crit }, value: 120 * ch, desc: "以【" + sn + "】的素材鍛造的獵刃，帶有牠的氣息。" };
      D.items[aid] = { id: aid, name: sn + "鎧", icon: "icon_def", category: "equipment", slot: "armor", stats: { def: bg.def, maxHp: bg.hp }, value: 110 * ch, desc: "以【" + sn + "】的皮革與利牙鍛造的重鎧。" };
      D.recipes.push({ id: "craft_" + wid, group: "monster", source: en.id, result: wid, count: 1, costGold: 80 * ch, ingredients: { [en.carve.fang]: 3, [en.carve.hide]: 1, [en.carve.core]: 1 }, desc: "狩獵【" + sn + "】的證明：獵刃，攻擊力 +" + bg.atk + "。" });
      D.recipes.push({ id: "craft_" + aid, group: "monster", source: en.id, result: aid, count: 1, costGold: 70 * ch, ingredients: { [en.carve.hide]: 3, [en.carve.fang]: 1, [en.carve.core]: 1 }, desc: "狩獵【" + sn + "】的證明：重鎧，防禦 +" + bg.def + "、生命 +" + bg.hp + "。" });
    }
    const er = eliteRelic[en.id];
    if (er) {
      const rid = en.id + "_charm";
      D.items[rid] = { id: rid, name: sn + "護符", icon: "crystal", category: "equipment", slot: "relic", stats: er, value: 90 * ch, desc: "以精英【" + sn + "】的素材製成的護符。" };
      D.recipes.push({ id: "craft_" + rid, group: "monster", source: en.id, result: rid, count: 1, costGold: 60 * ch, ingredients: { [en.carve.fang]: 2, [en.carve.hide]: 2, [en.carve.core]: 1 }, desc: "精英【" + sn + "】的戰利護符。" });
    }
  });
})(GAME_DATA);

// ==================== 獵人公會委託板 / 章節認證 / 公會訓練場 / 高階補給 ====================
(function buildBoardData(D) {
  const items = {
    grand_potion: { id: "grand_potion", name: "特級聖輝靈藥", icon: "icon_potion_red", category: "consumable", usableInCombat: true, usableInMap: true, effect: { hp: 320 }, value: 100, desc: "濃縮的聖輝靈藥，一口氣恢復 320 HP。" },
    grand_elixir: { id: "grand_elixir", name: "特級星髓魔力飲", icon: "icon_potion_blue", category: "consumable", usableInCombat: true, usableInMap: true, effect: { mp: 150 }, value: 90, desc: "高濃度星髓萃取，恢復 150 MP。" },
    hunter_ration: { id: "hunter_ration", name: "獵人遠征口糧", icon: "campfire_0", category: "consumable", usableInCombat: true, usableInMap: true, effect: { hp: 220, mp: 90, burst: 60 }, value: 150, desc: "公會特製的高熱量口糧：恢復 220 HP、90 MP 並注入 60 點極限星能。" }
  };
  Object.assign(D.items, items);
  D.shopCatalog.push(
    { itemId: "grand_potion", price: 160, minChapter: 2 },
    { itemId: "grand_elixir", price: 140, minChapter: 2 },
    { itemId: "hunter_ration", price: 260, minChapter: 3 }
  );

  D.trainingTracks = [
    { id: "vit", name: "體魄鍛鍊", desc: "每階 +16 最大生命", per: 16, max: 10, base: 200, step: 150 },
    { id: "atk", name: "武藝修行", desc: "每階 +2 攻擊力", per: 2, max: 10, base: 260, step: 190 },
    { id: "def", name: "守備訓練", desc: "每階 +1 防禦力", per: 1, max: 10, base: 240, step: 170 },
    { id: "mp", name: "星力冥想", desc: "每階 +9 最大星力", per: 9, max: 10, base: 180, step: 130 }
  ];

  // 每章 8 件委託 (第 5 章 9 件)；完成指定件數才能挑戰該章首領
  const T = [
    null,
    { a: "mist_wolf", b: "corrupted_treant", elite: "elite_fenrir_defeated", eliteName: "蝕影狼王", lv: 5, area: "迷霧幽林", need: 6 },
    { a: "drowned_sentinel", b: "tide_siren", elite: "elite_crab_defeated", eliteName: "深淵重甲巨蟹", lv: 7, area: "沉沒鐘樓", need: 6 },
    { a: "magma_golem", b: "ash_drake", elite: "elite_vulcan_defeated", eliteName: "熔核督軍", lv: 9, area: "熔核礦坑", need: 6 },
    { a: "astral_wraith", b: "star_inquisitor", elite: "elite_twins_defeated", eliteName: "虛空雙子審判官", lv: 11, area: "星象院", need: 6 },
    { a: "citadel_templar", b: "citadel_templar", elite: "elite_regis_defeated", eliteName: "黑曜禁衛統領", lv: 13, area: "黑曜遺城", need: 6 }
  ];
  const stuff = [null, ["moon_herb", "star_shard"], ["ancient_gear", "mana_elixir"], ["meteor_iron", "star_bomb"], ["void_essence", "greater_potion"], ["void_essence", "phoenix_salve"]];
  D.chapterGate = {};
  D.boardQuests = [];
  const nm = id => (D.enemies[id] ? D.enemies[id].name : id);
  for (let ch = 1; ch <= 5; ch++) {
    const t = T[ch];
    D.chapterGate[ch] = t.need;
    const g = 40 + ch * 45, e = 30 + ch * 40;
    const mk = (key, title, desc, req, mul, extra) => D.boardQuests.push({
      id: `bq${ch}_${key}`, chapter: ch, title, desc, req,
      reward: Object.assign({ gold: Math.round(g * mul), exp: Math.round(e * mul) }, extra || {})
    });
    mk("kA", `獵殺${nm(t.a)}`, `擊敗 ${ch === 5 ? 8 : 6} 隻【${nm(t.a)}】。魔物會在你於營火休息或重新進入區域後重生。`, { type: "kill", enemy: t.a, count: ch === 5 ? 8 : 6 }, 1, { items: { healing_potion: 2 } });
    if (t.b !== t.a) mk("kB", `獵殺${nm(t.b)}`, `擊敗 6 隻【${nm(t.b)}】。`, { type: "kill", enemy: t.b, count: 6 }, 1, { items: { [stuff[ch][1]]: 2 } });
    mk("kAny", `${t.area}掃蕩作戰`, `在任何地方累計擊敗 14 隻魔物。`, { type: "kill", enemy: "any", count: 14 }, 1.3, { sp: 1 });
    mk("cA", `剝取委託：${nm(t.a)}皮革`, `把 3 件【${nm(t.a)}皮革】交給公會（破壞魔物軀幹後剝取）。`, { type: "item", item: t.a + "_hide", count: 3, consume: true }, 1.1, { items: { [stuff[ch][0]]: 2 } });
    mk("cB", `剝取委託：${nm(t.b)}利牙`, `把 3 件【${nm(t.b)}利牙】交給公會（破壞魔物頭部後剝取）。`, { type: "item", item: t.b + "_fang", count: 3, consume: true }, 1.1, { items: { star_bomb: 2 } });
    mk("elite", `菁英討伐：${t.eliteName}`, `擊敗${t.area}的菁英魔物【${t.eliteName}】（必要委託：不討伐菁英就無法取得首領認證）。`, { type: "flag", flag: t.elite }, 1.6, { sp: 1 });
    mk("lv", `獵人修練 Lv${t.lv}`, `讓獵人等級達到 Lv${t.lv}。`, { type: "level", count: t.lv }, 1.2, { items: { phoenix_salve: 1 } });
    mk("craft", `工坊見習：鍛造 ${ch} 件`, `累計在鐵砧鍛造 ${ch} 件裝備或素材（可用狩獵素材）。`, { type: "stat", stat: "itemsCrafted", count: ch }, 1.2, { items: { void_essence: 1 } });
    if (ch === 5) mk("abyss", "深淵試煉：星淵第 5 層", "突破無盡星淵第 5 層（擊敗噬星者）。", { type: "abyss", count: 5 }, 2.2, { sp: 2 });
  }
})(GAME_DATA);
})((typeof window !== "undefined" && window.GAME_DATA) || require("./data.js").GAME_DATA);
