/**
 * 《星隕編年史：霧海遺城》(Chronicles of Starfall: The Mistbound Citadel) - v2.2 Commercial Pixel Edition
 * 遊戲核心資料庫：100% 零 Emoji、全章節地圖與事件座標 100% 對齊驗證、完整裝備數值與中文名牌
 */

const GAME_DATA = {
  title: "星隕編年史：霧海遺城",
  subtitle: "Chronicles of Starfall: 16-Bit Pixel Edition",
  version: "2.2.0 (16-Bit Commercial Edition)",

  // 4 大星靈夥伴系統 (Astral Companions)
  companions: {
    lumi: {
      id: "lumi",
      name: "微光星狐・露米",
      icon: "pet_lumi",
      unlockChapter: 1,
      passiveBonus: { maxMp: 15, mpRegen: 2 },
      desc: "【被動】最大星力 +15、回魔 +2｜【協同】戰鬥中每 4 秒自動為主角恢復 8% 最大生命與 5 MP。"
    },
    oliver: {
      id: "oliver",
      name: "發條機械梟・奧利弗",
      icon: "pet_oliver",
      unlockChapter: 2,
      passiveBonus: { vision: 1, crit: 5 },
      desc: "【被動】迷霧視野 +1、暴擊率 +5%｜【協同】戰鬥中每 4 秒自動發射齒輪飛彈削減敵人 1 點護盾。"
    },
    iggy: {
      id: "iggy",
      name: "熔岩幼龍・伊格",
      icon: "pet_iggy",
      unlockChapter: 3,
      passiveBonus: { atk: 10, maxHp: 35 },
      desc: "【被動】攻擊力 +10、生命 +35｜【協同】每 4 秒噴吐幼龍烈焰造成 45% 攻擊力火屬性傷害，50% 機率附加灼燒。"
    },
    sera: {
      id: "sera",
      name: "星界蝶靈・瑟拉",
      icon: "pet_sera",
      unlockChapter: 4,
      passiveBonus: { def: 8, maxHp: 50, maxMp: 20 },
      desc: "【被動】防禦 +8、生命 +50、星力 +20｜【協同】每 4 秒張開星塵羽翼賦予 +16 護甲並增加 +12% 極限星能。"
    }
  },

  // 星界行商商品目錄
  // 無盡星淵層詞綴：每層固定一種，依樓層循環 (第 1 層為較溫和的「豐饒」)
  abyssMods: [
    { id: "bounty", name: "豐饒", desc: "額外剝取 2 次素材、金幣獎勵 +50%", carve: 2, gold: 1.5 },
    { id: "fierce", name: "猛攻", desc: "魔物傷害 +30%", dmg: 1.3 },
    { id: "sturdy", name: "堅殼", desc: "魔物血量 +30%、護盾 +1", hp: 1.3, shield: 1 },
    { id: "frenzy", name: "狂暴", desc: "魔物開戰即進入憤怒狀態", enraged: true }
  ],

  shopCatalog: [
    { itemId: "healing_potion", price: 25 },
    { itemId: "mana_elixir", price: 30 },
    { itemId: "star_bomb", price: 45 },
    { itemId: "greater_potion", price: 70 },
    { itemId: "phoenix_salve", price: 105 },
    { itemId: "moon_herb", price: 14 },
    { itemId: "star_shard", price: 25 },
    { itemId: "ancient_gear", price: 35 },
    { itemId: "meteor_iron", price: 50 },
    { itemId: "void_essence", price: 70 },
    { itemId: "greed_star_ring", price: 220 },
    { itemId: "wind_star_boots", price: 240 }
  ],

  // 隨機奇遇祭壇事件庫 (6 大分支事件)
  mysteryEncounters: [
    {
      id: "mys_wanderer",
      title: "迷途的觀星旅人",
      desc: "你在發光的古祭壇旁遇見一名半透明的星魂旅人。他正渴望一瓶能撫平靈魂焦渴的藥水，並願意以星界秘寶作為回報。",
      choices: [
        {
          label: "[贈予藥水] 獻出 1 瓶星露治療藥水（換取 +1 技能點數 & 星辰碎晶x3）",
          costItem: "healing_potion",
          reward: { sp: 1, items: { star_shard: 3 } },
          resultMsg: "旅人感激地飲下藥水，化作點點星光融入你的眉心！獲得 +1 SP 與【星辰碎晶】x3！"
        },
        {
          label: "[吸收星魂] 強行吸收殘留能量（消耗 25 HP，永久提升 +4 基礎攻擊力）",
          costHp: 25,
          reward: { baseAtk: 4 },
          resultMsg: "狂暴的星力灼傷了你的經脈，但也讓你的劍鋒更加凌厲！永久基礎攻擊力 +4！"
        },
        {
          label: "[禮貌致意] 靜靜向他致意後離開（恢復 40 HP & 30 MP）",
          reward: { healHp: 40, healMp: 30 },
          resultMsg: "旅人向你微笑頷首，祭壇散發出柔和的微光恢復了你的體力。"
        }
      ]
    },
    {
      id: "mys_dice",
      title: "古老的命運星盤",
      desc: "祭壇中央擺放著一枚懸浮的十二面星辰骰。碑文寫道：『獻上世俗之金，博取群星之眷顧。』",
      choices: [
        {
          label: "[星辰占卜] 投入 60 金幣進行占卜（獲得 130 金幣與稀有鍛造素材）",
          costGold: 60,
          reward: { gold: 130, items: { meteor_iron: 1, void_essence: 1 } },
          resultMsg: "星骰停在象徵豐饒的『北極星』面！金幣化作 130 G 湧出，並獲得【星隕玄鐵】與【虛空星塵】！"
        },
        {
          label: "[碎晶共鳴] 嵌入 1 顆星辰碎晶（永久提升 +25 最大生命 & 充滿 100% 極限星能）",
          costItem: "star_shard",
          reward: { baseMaxHpBonus: 25, fullBurst: true },
          resultMsg: "星盤綻放耀眼光芒！你的體魄獲得星光洗禮，且極限星能已充滿至 100%！"
        },
        {
          label: "[保守行事] 不參與賭局，取走祭壇邊緣的遺落錢袋（+45 金幣）",
          reward: { gold: 45 },
          resultMsg: "你謹慎地收起了祭壇邊緣的 45 枚古金幣。"
        }
      ]
    },
    {
      id: "mys_echo",
      title: "時空裂隙的回音",
      desc: "一道細微的時空裂隙在半空中緩緩旋轉，裡面映照出過去矮人鐵匠與觀星師共同作戰的幻影。",
      choices: [
        {
          label: "[觀摩劍術] 研習昔日英雄的劍路（獲得 90 EXP & +1 技能點數）",
          reward: { exp: 90, sp: 1 },
          resultMsg: "你從昔日英雄的劍路中領悟了全新的發力技巧！獲得 90 EXP 與 +1 技能點數！"
        },
        {
          label: "[拾取補給] 取走裂隙中墜落的鍛造匣（獲得【精密古銅齒輪】x2 &【星火震爆彈】x2）",
          reward: { items: { ancient_gear: 2, star_bomb: 2 } },
          resultMsg: "你打開了古老的矮人補給匣，獲得【精密古銅齒輪】x2 與【星火震爆彈】x2！"
        }
      ]
    },
    {
      id: "mys_alchemist",
      title: "流浪的星界鍊金師",
      desc: "一名背著發光蒸餾器的鍊金師正在祭壇旁研究星塵變異，他提出可以用特殊秘藥改造你的體質。",
      choices: [
        {
          label: "[提供月光草] 交付 1 株月光螢草（換取【高階聖輝靈藥】x2 & 80 EXP）",
          costItem: "moon_herb",
          reward: { exp: 80, items: { greater_potion: 2 } },
          resultMsg: "鍊金師迅速完成提純，將 2 瓶高純度的【高階聖輝靈藥】交給了你！"
        },
        {
          label: "[飲用試劑] 飲下紫色星芒試劑（消耗 30 HP，永久提升 +5 基礎攻擊力 & +20 最大生命）",
          costHp: 30,
          reward: { baseAtk: 5, baseMaxHpBonus: 20 },
          resultMsg: "劇烈的灼熱感過後，你的力量與生命上限獲得了顯著突破！"
        },
        {
          label: "[請教知識] 與他交流鍊金心得（恢復 50 MP & +60 金幣）",
          reward: { healMp: 50, gold: 60 },
          resultMsg: "鍊金師對你的見聞讚賞不已，贈予你 60 金幣與魔力祝福。"
        }
      ]
    },
    {
      id: "mys_fountain",
      title: "雙生月華星泉",
      desc: "兩股分別閃耀著赤金與幽藍光芒的泉水在古祭壇中交匯，可選擇將裝備或自身浸入泉水中受洗。",
      choices: [
        {
          label: "[赤金洗禮] 將武器浸入赤金泉水（永久提升 +6 基礎攻擊力）",
          reward: { baseAtk: 6 },
          resultMsg: "赤金泉水滲入劍鋒，你的基礎攻擊力永久提升了 6 點！"
        },
        {
          label: "[幽藍洗禮] 以幽藍星泉洗滌全身（永久提升 +35 最大生命 & 恢復全部體力）",
          reward: { baseMaxHpBonus: 35, healHp: 999, healMp: 999 },
          resultMsg: "溫潤的星泉洗去所有疲勞，永久最大生命 +35 且 HP/MP 完全恢復！"
        }
      ]
    },
    {
      id: "mys_mirror",
      title: "虛空倒影魔鏡",
      desc: "一面鑲嵌黑曜石的古鏡映照出你未來的戰姿，鏡中似乎封存著歷代尋星者的戰鬥記憶。",
      choices: [
        {
          label: "[與影對決] 與鏡中幻影切磋劍技（消耗 35 HP，獲得 140 EXP & +1 技能點數）",
          costHp: 35,
          reward: { exp: 140, sp: 1 },
          resultMsg: "在激烈的交鋒中你看破了自身破綻！獲得 140 EXP 與 +1 技能點數！"
        },
        {
          label: "[拆解鏡框] 取下鏡框上的星界寶石（獲得【虛空星塵】x2 &【星辰碎晶】x2）",
          reward: { items: { void_essence: 2, star_shard: 2 } },
          resultMsg: "你取下了鏡框鑲嵌的珍貴素材：【虛空星塵】x2 與【星辰碎晶】x2！"
        }
      ]
    }
  ],

  // 10 大章節支線委託任務 (Side Quests)
  sideQuests: {
    sq1_herbs: {
      id: "sq1_herbs",
      chapter: 1,
      title: "【支線】漁村草藥師的急需",
      npcName: "草藥師・艾琳",
      desc: "收集 3 株【月光螢草】交給微光漁村 (1-1) 的草藥師艾琳，熬製抵禦紫霧瘴氣的藥湯。",
      reqType: "item",
      reqItem: "moon_herb",
      reqCount: 3,
      consumeItem: true,
      reward: { gold: 90, exp: 70, sp: 1, items: { greater_potion: 2 } },
      rewardText: "90 金幣、70 EXP、+1 SP、【高階聖輝靈藥】x2"
    },
    sq1_wolf_king: {
      id: "sq1_wolf_king",
      chapter: 1,
      title: "【支線】幽林狼王討伐令",
      npcName: "守林獵人・雷恩",
      desc: "在迷霧幽林深處 (1-2) 擊敗菁英魔物【蝕影狼王・芬里爾】，向獵人雷恩回報。",
      reqType: "flag",
      reqFlag: "elite_fenrir_defeated",
      reward: { gold: 140, exp: 110, sp: 1, items: { wolf_fang_charm: 1 } },
      rewardText: "140 金幣、110 EXP、+1 SP、專屬聖物【狼王銀牙護符】"
    },
    sq2_gears: {
      id: "sq2_gears",
      chapter: 2,
      title: "【支線】老鐘錶匠的遺失齒輪",
      npcName: "老鐘錶匠・霍華德",
      desc: "收集 3 枚【精密古銅齒輪】交給鐘樓前廳 (2-1) 的霍華德修復懷念的星音鐘。",
      reqType: "item",
      reqItem: "ancient_gear",
      reqCount: 3,
      consumeItem: true,
      reward: { gold: 160, exp: 120, sp: 1, items: { mana_elixir: 2, star_bomb: 2 } },
      rewardText: "160 金幣、120 EXP、+1 SP、【星髓魔力飲】x2、【星火震爆彈】x2"
    },
    sq2_crab: {
      id: "sq2_crab",
      chapter: 2,
      title: "【支線】清除水閘重甲巨蟹",
      npcName: "水道工程師・諾亞",
      desc: "在齒輪水閘迷宮 (2-2) 擊敗堵塞水道的菁英魔物【深淵重甲巨蟹】。",
      reqType: "flag",
      reqFlag: "elite_crab_defeated",
      reward: { gold: 210, exp: 160, sp: 1, items: { tide_scale_mail: 1 } },
      rewardText: "210 金幣、160 EXP、+1 SP、專屬防具【深淵潮汐鱗甲】"
    },
    sq3_iron: {
      id: "sq3_iron",
      chapter: 3,
      title: "【支線】重燃矮人副熔爐",
      npcName: "鍛造學徒・巴頓",
      desc: "收集 3 塊【星隕玄鐵】交給礦坑入口 (3-1) 的學徒巴頓測試爐溫。",
      reqType: "item",
      reqItem: "meteor_iron",
      reqCount: 3,
      consumeItem: true,
      reward: { gold: 240, exp: 190, sp: 1, items: { phoenix_salve: 2 } },
      rewardText: "240 金幣、190 EXP、+1 SP、【鳳凰涅槃膏】x2"
    },
    sq3_vulcan: {
      id: "sq3_vulcan",
      chapter: 3,
      title: "【支線】奪回先祖鍛造錘",
      npcName: "老礦工・格imli",
      desc: "在萬爐熔岩大廳 (3-2) 擊敗菁英魔物【熔核督軍・瓦爾坎】奪回先祖遺物。",
      reqType: "flag",
      reqFlag: "elite_vulcan_defeated",
      reward: { gold: 280, exp: 220, sp: 1, items: { meteor_iron: 3, greater_potion: 2 } },
      rewardText: "280 金幣、220 EXP、+1 SP、【星隕玄鐵】x3、【高階聖輝靈藥】x2"
    },
    sq4_lore: {
      id: "sq4_lore",
      chapter: 4,
      title: "【支線】星象院文獻考據",
      npcName: "星魂書記官・賽琳",
      desc: "累計收集達 9 篇以上的《星辰手札》，與雲海星橋長廊 (4-1) 的書記官賽琳交流。",
      reqType: "loreCount",
      reqCount: 9,
      reward: { gold: 300, exp: 250, sp: 1, items: { void_essence: 3 } },
      rewardText: "300 金幣、250 EXP、+1 SP、【虛空星塵】x3"
    },
    sq4_twins: {
      id: "sq4_twins",
      chapter: 4,
      title: "【支線】解放失控的雙子星衛",
      npcName: "觀星學徒・露娜",
      desc: "在折光天球儀室 (4-2) 擊敗菁英【虛空雙子審判官】，解除學徒露娜的星魂枷鎖。",
      reqType: "flag",
      reqFlag: "elite_twins_defeated",
      reward: { gold: 340, exp: 280, sp: 1, items: { astral_ring: 1 } },
      rewardText: "340 金幣、280 EXP、+1 SP、專屬聖物【星穹共鳴指環】"
    },
    sq5_obelisk: {
      id: "sq5_obelisk",
      chapter: 5,
      title: "【支線】淨化王城腐化方尖碑",
      npcName: "王城近衛英靈・凱恩",
      desc: "在破碎王城外環 (5-1) 啟動全部 2 座【淨化星碑】驅散混沌死氣。",
      reqType: "flag",
      reqFlag: "ch5_z1_obelisks_purified",
      reward: { gold: 380, exp: 320, sp: 1, items: { phoenix_salve: 2, void_essence: 2 } },
      rewardText: "380 金幣、320 EXP、+1 SP、【鳳凰涅槃膏】x2、【虛空星塵】x2"
    },
    sq5_regis: {
      id: "sq5_regis",
      chapter: 5,
      title: "【支線】宿命的禁衛統領決戰",
      npcName: "王城近衛英靈・凱恩",
      desc: "在四象星核迴廊 (5-2) 擊敗墮落的菁英【黑曜禁衛統領・雷吉斯】，賜予昔日同袍安息。",
      reqType: "flag",
      reqFlag: "elite_regis_defeated",
      reward: { gold: 450, exp: 400, sp: 2, items: { heart_of_starfall: 1 } },
      rewardText: "450 金幣、400 EXP、+2 SP、傳說聖物【星核之眸】"
    }
  },

  // 12 種主動戰鬥技能 (含五大屬性弱點克制：physical, star, fire, frost, void)
  skills: {
    slash: {
      id: "slash",
      name: "星芒斬",
      icon: "icon_atk",
      mpCost: 0,
      burstGain: 18,
      shieldBreak: 1,
      mult: 1.05,
      type: "physical",
      elementLabel: "物理",
      unlockedByDefault: true,
      costSP: 0,
      desc: "[物理] 基礎劍技。造成 105% 攻擊力傷害，削減 1 點護盾，並回復 12 點星力(MP)。"
    },
    star_bolt: {
      id: "star_bolt",
      name: "墜星矢",
      icon: "crystal",
      mpCost: 14,
      burstGain: 22,
      shieldBreak: 2,
      mult: 3.3,
      type: "star",
      elementLabel: "星輝",
      unlockedByDefault: true,
      costSP: 0,
      desc: "[星輝] 凝聚星輝射出光矢。造成 330% 星輝傷害，擊碎 2 點敵方護盾。"
    },
    guard: {
      id: "guard",
      name: "星紋障壁",
      icon: "icon_def",
      mpCost: 0,
      burstGain: 16,
      shieldBreak: 0,
      mult: 0,
      type: "defense",
      elementLabel: "防禦",
      unlockedByDefault: true,
      costSP: 0,
      desc: "[防禦] 架起星力護盾，獲得最大生命 24% 護甲值，展開 1.1 秒減傷 45% 並回復 16 MP（剛展開 0.35 秒內擋下強擊可完美防反）。"
    },
    heavy_thrust: {
      id: "heavy_thrust",
      name: "破甲重擊",
      icon: "icon_atk",
      mpCost: 16,
      burstGain: 22,
      shieldBreak: 2,
      mult: 3.59,
      type: "physical",
      elementLabel: "物理",
      effect: { type: "vuln", turns: 2 },
      unlockedByDefault: false,
      costSP: 1,
      desc: "[物理] 勢大力沉的突刺。造成 359% 物理傷害，擊碎 2 點護盾並附加 4 秒【易傷】。"
    },
    flame_cleave: {
      id: "flame_cleave",
      name: "赤焰裂斬",
      icon: "campfire_0",
      mpCost: 18,
      burstGain: 24,
      shieldBreak: 2,
      mult: 3.88,
      type: "fire",
      elementLabel: "烈焰",
      effect: { type: "burn", turns: 3 },
      unlockedByDefault: false,
      costSP: 1,
      desc: "[烈焰] 纏繞矮人熔岩烈焰的重斬。造成 388% 火屬性傷害，擊碎 2 點護盾並附加 6 秒【灼燒】。"
    },
    frost_nova: {
      id: "frost_nova",
      name: "寒霜星環",
      icon: "icon_mp",
      mpCost: 20,
      burstGain: 22,
      shieldBreak: 2,
      mult: 4.18,
      type: "frost",
      elementLabel: "寒霜",
      effect: { type: "weaken", turns: 2 },
      unlockedByDefault: false,
      costSP: 1,
      desc: "[寒霜] 釋放極寒星霧。造成 418% 冰屬性傷害，擊碎 2 點護盾並令敵人【虛弱】4 秒。"
    },
    starlight_mend: {
      id: "starlight_mend",
      name: "星輝聖癒",
      icon: "herb",
      mpCost: 24,
      burstGain: 15,
      shieldBreak: 0,
      mult: 0,
      type: "heal",
      elementLabel: "治療",
      unlockedByDefault: false,
      costSP: 1,
      desc: "[治療] 引導溫和星光，立即恢復 40% 最大生命值，清除負面狀態並獲得 4 秒【再生】。"
    },
    lunar_crescent: {
      id: "lunar_crescent",
      name: "新月星弧斬",
      icon: "crystal",
      mpCost: 22,
      burstGain: 34,
      shieldBreak: 3,
      mult: 4.48,
      type: "star",
      elementLabel: "星輝",
      unlockedByDefault: false,
      costSP: 1,
      desc: "[星輝] 揮出滿月般璀璨的星弧。造成 448% 星輝傷害，強效擊碎 3 點護盾並累積 34% 極限星能。"
    },
    magma_eruption: {
      id: "magma_eruption",
      name: "熔核爆裂斬",
      icon: "campfire_1",
      mpCost: 25,
      burstGain: 26,
      shieldBreak: 3,
      mult: 4.95,
      type: "fire",
      elementLabel: "烈焰",
      effect: { type: "burn", turns: 3 },
      unlockedByDefault: false,
      costSP: 2,
      desc: "[烈焰] 引爆地心星火。造成 495% 烈焰傷害並擊碎 3 點護盾；若目標已處於灼燒則額外增傷 25%。"
    },
    glacier_lance: {
      id: "glacier_lance",
      name: "永凍星冰槍",
      icon: "icon_mp",
      mpCost: 25,
      burstGain: 25,
      shieldBreak: 3,
      mult: 4.95,
      type: "frost",
      elementLabel: "寒霜",
      effect: { type: "weaken", turns: 3 },
      unlockedByDefault: false,
      costSP: 2,
      desc: "[寒霜] 貫穿敵陣的極寒冰槍。造成 495% 寒霜傷害、擊碎 3 點護盾，並為自身附加 +25 寒冰護甲。"
    },
    void_pierce: {
      id: "void_pierce",
      name: "虛空穿刺",
      icon: "portal_0",
      mpCost: 26,
      burstGain: 28,
      shieldBreak: 3,
      mult: 5.11,
      type: "void",
      elementLabel: "虛空",
      effect: { type: "vuln", turns: 3 },
      unlockedByDefault: false,
      costSP: 2,
      desc: "[虛空] 撕裂空間的突刺。無視敵方 50% 防禦造成 511% 虛空傷害，擊碎 3 點護盾並附加 6 秒【易傷】。"
    },
    astral_judgment: {
      id: "astral_judgment",
      name: "【極限】星隕天罰",
      icon: "icon_burst",
      mpCost: 0,
      burstCost: 100,
      burstGain: 0,
      shieldBreak: 4,
      mult: 2.85,
      type: "ultimate",
      elementLabel: "全屬性極限",
      effect: { type: "vuln", turns: 3 },
      unlockedByDefault: true,
      costSP: 0,
      desc: "[極限必殺] 消耗 100% 極限星能！召喚天際隕星轟擊敵人，必觸發弱點共鳴造成 285% 毀滅傷害並擊碎 4 點護盾。"
    }
  },

  // 6 大被動天賦樹
  talents: {
    vitality: {
      id: "vitality",
      name: "星脈強韌",
      icon: "icon_hp",
      maxRank: 5,
      desc: "每級提升 +28 最大生命值與 +2 防禦力。",
      bonusPerRank: { maxHp: 28, def: 2 }
    },
    arcane: {
      id: "arcane",
      name: "星泉共鳴",
      icon: "icon_mp",
      maxRank: 5,
      desc: "每級提升 +15 最大星力(MP)，且每 2 秒自動回復 +3 MP。",
      bonusPerRank: { maxMp: 15, mpRegen: 3 }
    },
    precision: {
      id: "precision",
      name: "鷹眼星芒",
      icon: "icon_atk",
      maxRank: 5,
      desc: "每級提升 +4 攻擊力與 +4% 暴擊率。",
      bonusPerRank: { atk: 4, crit: 4 }
    },
    guardian: {
      id: "guardian",
      name: "不朽壁壘",
      icon: "icon_def",
      maxRank: 3,
      desc: "每級使戰鬥開始時自動獲得 +18 點開局護甲，並提高防禦減傷。",
      bonusPerRank: { startArmor: 18, def: 3 }
    },
    alchemist: {
      id: "alchemist",
      name: "鍊金學識",
      icon: "icon_potion_red",
      maxRank: 3,
      desc: "每級使戰鬥中使用藥水與卷軸的效果提升 +25%。",
      bonusPerRank: { potionBoost: 0.25 }
    },
    explorer: {
      id: "explorer",
      name: "尋星者直覺",
      icon: "icon_burst",
      maxRank: 3,
      desc: "每級擴大迷霧探索視野 +1 格，並使戰利品金幣與經驗值提升 +15%。",
      bonusPerRank: { vision: 1, rewardBoost: 0.15 }
    }
  },

  // 道具、素材、裝備與關鍵物品
  items: {
    healing_potion: {
      id: "healing_potion",
      name: "星露治療藥水",
      icon: "icon_potion_red",
      category: "consumable",
      usableInCombat: true,
      usableInMap: true,
      effect: { hp: 85 },
      value: 25,
      desc: "以月光草與微光泉水熬製，立即恢復 85 點生命值。"
    },
    greater_potion: {
      id: "greater_potion",
      name: "高階聖輝靈藥",
      icon: "icon_potion_red",
      category: "consumable",
      usableInCombat: true,
      usableInMap: true,
      effect: { hp: 200, cleanse: true },
      value: 65,
      desc: "濃縮星核精華的靈藥，恢復 200 點生命值並解除負面狀態。"
    },
    mana_elixir: {
      id: "mana_elixir",
      name: "星髓魔力飲",
      icon: "icon_potion_blue",
      category: "consumable",
      usableInCombat: true,
      usableInMap: true,
      effect: { mp: 55 },
      value: 30,
      desc: "清涼甘冽的星髓萃取液，恢復 55 點星力(MP)。"
    },
    star_bomb: {
      id: "star_bomb",
      name: "星火震爆彈",
      icon: "icon_bomb",
      category: "consumable",
      usableInCombat: true,
      usableInMap: false,
      effect: { dmg: 95, shieldBreak: 2 },
      value: 45,
      desc: "矮人配方的星火炸藥，對敵人造成 95 點固定傷害並擊碎 2 點護盾。"
    },
    phoenix_salve: {
      id: "phoenix_salve",
      name: "鳳凰涅槃膏",
      icon: "campfire_0",
      category: "consumable",
      usableInCombat: true,
      usableInMap: true,
      effect: { hp: 140, mp: 45, burst: 35 },
      value: 90,
      desc: "珍貴的秘傳秘藥，同時恢復 140 HP、45 MP 並注入 35 點極限星能。"
    },

    moon_herb: {
      id: "moon_herb",
      name: "月光螢草",
      icon: "herb",
      category: "material",
      value: 10,
      desc: "生長在迷霧森林潮濕處的發光藥草，是調配藥水的基礎素材。"
    },
    star_shard: {
      id: "star_shard",
      name: "星辰碎晶",
      icon: "crystal",
      category: "material",
      value: 20,
      desc: "隕星墜落後散落於大地的結晶，蘊含微弱的星界能量。"
    },
    ancient_gear: {
      id: "ancient_gear",
      name: "精密古銅齒輪",
      icon: "icon_gear",
      category: "material",
      value: 25,
      desc: "沉沒鐘樓中留存的千年發條零件，永不生鏽。"
    },
    meteor_iron: {
      id: "meteor_iron",
      name: "星隕玄鐵",
      icon: "anvil",
      category: "material",
      value: 40,
      desc: "唯有在熔岩鍛造廠的高溫下才能提煉的極品金屬。"
    },
    void_essence: {
      id: "void_essence",
      name: "虛空星塵",
      icon: "portal_0",
      category: "material",
      value: 60,
      desc: "來自浮空星象院的高純度星界靈質。"
    },

    rusty_sword: {
      id: "rusty_sword",
      name: "旅人舊鐵劍",
      icon: "icon_atk",
      category: "equipment",
      slot: "weapon",
      stats: { atk: 6, crit: 2 },
      value: 20,
      desc: "陪伴你踏入微光漁村的舊鐵劍，雖有磨損但依然稱手。"
    },
    starlight_blade: {
      id: "starlight_blade",
      name: "星紋銀長劍",
      icon: "icon_atk",
      category: "equipment",
      slot: "weapon",
      stats: { atk: 16, crit: 6, maxMp: 15 },
      value: 120,
      desc: "銘刻著古老星紋的銀劍，揮動時會曳出淡淡的藍光。"
    },
    clockwork_halberd: {
      id: "clockwork_halberd",
      name: "發條共鳴戰戟",
      icon: "icon_atk",
      category: "equipment",
      slot: "weapon",
      stats: { atk: 26, def: 4, crit: 8 },
      value: 220,
      desc: "結合鐘樓精密齒輪打造的戰戟，在劈砍瞬間能產生雙重震盪。"
    },
    ember_greatsword: {
      id: "ember_greatsword",
      name: "赤焰星隕巨劍",
      icon: "icon_atk",
      category: "equipment",
      slot: "weapon",
      stats: { atk: 40, crit: 12, maxHp: 35 },
      value: 380,
      desc: "以星隕玄鐵在矮人熔爐鍛造出的神兵，劍刃終年流淌著熾熱火光。"
    },
    astral_sovereign: {
      id: "astral_sovereign",
      name: "【傳說】星穹裁決者",
      icon: "icon_burst",
      category: "equipment",
      slot: "weapon",
      stats: { atk: 58, crit: 18, maxMp: 40, maxHp: 60 },
      value: 800,
      desc: "匯聚星辰碎晶、星隕玄鐵與虛空星塵鑄就的終極聖劍，能斬斷時間的枷鎖。"
    },

    traveler_cloak: {
      id: "traveler_cloak",
      name: "防風旅人斗篷",
      icon: "icon_def",
      category: "equipment",
      slot: "armor",
      stats: { def: 4, maxHp: 20 },
      value: 20,
      desc: "能抵禦霧海寒氣的厚實布斗篷。"
    },
    mist_ranger_armor: {
      id: "mist_ranger_armor",
      name: "迷霧巡林皮甲",
      icon: "icon_def",
      category: "equipment",
      slot: "armor",
      stats: { def: 11, maxHp: 55, crit: 4 },
      value: 110,
      desc: "輕便堅韌的強化皮甲，內襯縫有能吸納星力的月光草纖維。"
    },
    dwarf_forge_plate: {
      id: "dwarf_forge_plate",
      name: "矮人符文重鎧",
      icon: "icon_def",
      category: "equipment",
      slot: "armor",
      stats: { def: 22, maxHp: 120 },
      value: 320,
      desc: "熔岩廢墟出土的矮人胸甲，能承受巨龍吐息的高溫。"
    },
    celestial_vestment: {
      id: "celestial_vestment",
      name: "【傳說】星織天衣",
      icon: "icon_def",
      category: "equipment",
      slot: "armor",
      stats: { def: 34, maxHp: 190, maxMp: 50, crit: 8 },
      value: 750,
      desc: "星象院首席觀星師的禮袍，宛如將整片夜空披在肩上。"
    },

    cracked_pendant: {
      id: "cracked_pendant",
      name: "微光古墜",
      icon: "crystal",
      category: "equipment",
      slot: "relic",
      stats: { maxMp: 10, atk: 2 },
      value: 25,
      desc: "母親留下的古老墜飾，靠近星隕遺跡時會微微發熱。"
    },
    compass_of_dawn: {
      id: "compass_of_dawn",
      name: "星輝羅盤",
      icon: "icon_gear",
      category: "equipment",
      slot: "relic",
      stats: { atk: 8, def: 5, maxHp: 40, crit: 5 },
      value: 180,
      desc: "擊敗荊棘巨獸後獲得的古代羅盤，能指引穿越霧海的航向。"
    },
    chrono_pocketwatch: {
      id: "chrono_pocketwatch",
      name: "時之懷錶",
      icon: "icon_gear",
      category: "equipment",
      slot: "relic",
      stats: { atk: 15, def: 10, maxMp: 35, crit: 10 },
      value: 400,
      desc: "沉沒鐘樓的核心遺物，讓佩戴者在戰鬥中洞悉敵人的破綻。"
    },
    greed_star_ring: {
      id: "greed_star_ring",
      name: "【星商秘寶】貪婪星戒",
      icon: "icon_gold",
      category: "equipment",
      slot: "relic",
      stats: { atk: 14, crit: 10, maxMp: 25, goldBonus: 0.25 },
      value: 220,
      desc: "星界行商珍藏的秘寶戒指，提升 +14 攻擊、+10% 暴擊，並使戰利品金幣額外增加 25%。"
    },
    wind_star_boots: {
      id: "wind_star_boots",
      name: "【星商秘寶】疾風星靴",
      icon: "icon_def",
      category: "equipment",
      slot: "armor",
      stats: { def: 16, maxHp: 85, crit: 9 },
      value: 240,
      desc: "鑲有風行符文的輕靴，兼具高防禦與敏捷暴擊加成。"
    },
    heart_of_starfall: {
      id: "heart_of_starfall",
      name: "【傳說】星核之眸",
      icon: "icon_burst",
      category: "equipment",
      slot: "relic",
      stats: { atk: 25, def: 16, maxHp: 90, maxMp: 45, crit: 12 },
      value: 900,
      desc: "凝聚四界星芒的至高聖物，全面強化持有者的身心。"
    },
    wolf_fang_charm: {
      id: "wolf_fang_charm",
      name: "【支線秘寶】狼王銀牙護符",
      icon: "icon_atk",
      category: "equipment",
      slot: "relic",
      stats: { atk: 12, crit: 8, maxHp: 30 },
      value: 160,
      desc: "討伐迷霧幽林蝕影狼王獲得的銀牙護符，大幅提升佩戴者的攻擊與暴擊直覺。"
    },
    tide_scale_mail: {
      id: "tide_scale_mail",
      name: "【支線秘寶】深淵潮汐鱗甲",
      icon: "icon_def",
      category: "equipment",
      slot: "armor",
      stats: { def: 18, maxHp: 95, maxMp: 25 },
      value: 230,
      desc: "以深淵重甲巨蟹甲殼鍛造的戰甲，兼具堅不可摧的防禦與星力親和。"
    },
    astral_ring: {
      id: "astral_ring",
      name: "【支線秘寶】星穹共鳴指環",
      icon: "crystal",
      category: "equipment",
      slot: "relic",
      stats: { atk: 20, def: 12, maxMp: 45, crit: 12 },
      value: 520,
      desc: "觀星院秘傳的星魂共鳴指環，大幅增幅星輝與虛空戰技的破壞力。"
    },

    key_rusty_gate: {
      id: "key_rusty_gate",
      name: "守林人銅鑰",
      icon: "icon_key",
      category: "key",
      desc: "開啟迷霧森林東側村口防禦鐵門的銅鑰匙。"
    },
    forest_sanctum_key: {
      id: "forest_sanctum_key",
      name: "古樹聖所秘鑰",
      icon: "icon_key",
      category: "key",
      desc: "擊敗迷霧幽林深處的蝕影狼王或解開古碑後取得的聖所通行秘鑰。"
    },
    apprentice_journal: {
      id: "apprentice_journal",
      name: "鐘樓學徒日記",
      icon: "scroll",
      category: "key",
      desc: "記載著沉沒鐘樓水位閥門順序與學徒最後心願的防水筆記（時針4、分針8、秒針1）。"
    },
    tower_mainspring: {
      id: "tower_mainspring",
      name: "時光主發條",
      icon: "icon_gear",
      category: "key",
      desc: "啟動沉沒鐘樓中央升降梯的巨大核心發條。"
    },
    dwarven_sigil: {
      id: "dwarven_sigil",
      name: "鍛造王火紋章",
      icon: "icon_gold",
      category: "key",
      desc: "矮人鐵匠贈予的通行紋章，可開啟熔岩領主殿堂。"
    },
    astral_lens: {
      id: "astral_lens",
      name: "觀星稜鏡",
      icon: "crystal",
      category: "key",
      desc: "折射星界光芒的稜鏡，能照出浮空星象院的隱藏星橋。"
    },
    relic_wood: {
      id: "relic_wood",
      name: "森之星片",
      icon: "crystal",
      category: "key",
      desc: "四大星核碎片之一，蘊含生生不息的森林脈動。"
    },
    relic_water: {
      id: "relic_water",
      name: "潮之星片",
      icon: "crystal",
      category: "key",
      desc: "四大星核碎片之一，流轉著時間與潮汐的韻律。"
    },
    relic_fire: {
      id: "relic_fire",
      name: "焰之星片",
      icon: "crystal",
      category: "key",
      desc: "四大星核碎片之一，燃燒著不屈的鍛造之魂。"
    },
    relic_sky: {
      id: "relic_sky",
      name: "穹之星片",
      icon: "crystal",
      category: "key",
      desc: "四大星核碎片之一，映照出星海真實的歷史。"
    }
  },

  // 工坊鍛造與合成配方
  recipes: [
    {
      id: "craft_healing_potion",
      result: "healing_potion",
      count: 2,
      costGold: 15,
      ingredients: { moon_herb: 2 },
      desc: "使用 2 株月光螢草提煉 2 瓶星露治療藥水。"
    },
    {
      id: "craft_mana_elixir",
      result: "mana_elixir",
      count: 2,
      costGold: 20,
      ingredients: { moon_herb: 1, star_shard: 1 },
      desc: "融合月光螢草與星辰碎晶，調配 2 瓶星髓魔力飲。"
    },
    {
      id: "craft_star_bomb",
      result: "star_bomb",
      count: 2,
      costGold: 30,
      ingredients: { star_shard: 2 },
      desc: "封裝不穩定的星辰碎晶，製成 2 顆高破盾星火震爆彈。"
    },
    {
      id: "craft_greater_potion",
      result: "greater_potion",
      count: 1,
      costGold: 40,
      ingredients: { healing_potion: 2, star_shard: 1 },
      desc: "將治療藥水二次強化為高階聖輝靈藥。"
    },
    {
      id: "craft_phoenix_salve",
      result: "phoenix_salve",
      count: 1,
      costGold: 60,
      ingredients: { moon_herb: 2, star_shard: 2, void_essence: 1 },
      desc: "調配全能恢復的傳奇秘藥「鳳凰涅槃膏」。"
    },
    {
      id: "craft_starlight_blade",
      result: "starlight_blade",
      count: 1,
      costGold: 60,
      ingredients: { star_shard: 3 },
      desc: "將星辰碎晶嵌入劍身，鍛造【星紋銀長劍】。"
    },
    {
      id: "craft_mist_armor",
      result: "mist_ranger_armor",
      count: 1,
      costGold: 55,
      ingredients: { moon_herb: 2, star_shard: 2 },
      desc: "編織星力纖維，打造【迷霧巡林皮甲】。"
    },
    {
      id: "craft_clockwork_halberd",
      result: "clockwork_halberd",
      count: 1,
      costGold: 120,
      ingredients: { ancient_gear: 3, star_shard: 2 },
      desc: "組裝精密古銅齒輪，打造【發條共鳴戰戟】。"
    },
    {
      id: "craft_ember_greatsword",
      result: "ember_greatsword",
      count: 1,
      costGold: 200,
      ingredients: { meteor_iron: 3, star_shard: 2 },
      desc: "在矮人熔爐中鍛造威力驚人的【赤焰星隕巨劍】。"
    },
    {
      id: "craft_astral_sovereign",
      result: "astral_sovereign",
      count: 1,
      costGold: 350,
      ingredients: { meteor_iron: 2, void_essence: 3, star_shard: 3 },
      desc: "凝聚三界至寶，鍛造終極聖劍【星穹裁決者】！"
    },
    {
      id: "craft_celestial_vestment",
      result: "celestial_vestment",
      count: 1,
      costGold: 300,
      ingredients: { void_essence: 3, ancient_gear: 2 },
      desc: "以虛空星塵織就傳說防具【星織天衣】！"
    }
  ],

  // 敵人、章節菁英守衛與首領資料庫 (含屬性弱點 weaknesses：命中弱點額外削盾+1 並增傷 25%)
  enemies: {
    mist_wolf: {
      id: "mist_wolf",
      name: "迷霧蝕影狼",
      icon: "enemy_wolf",
      chapter: 1,
      weaknesses: ["fire", "physical"],
      hp: 82,
      atk: 15,
      def: 4,
      shield: 2,
      exp: 36,
      gold: 26,
      drops: [{ item: "moon_herb", chance: 0.8 }, { item: "star_shard", chance: 0.45 }],
      intents: [
        { type: "attack", mult: 1.0, label: "利爪撲擊" },
        { type: "charge", mult: 0, buff: "atk", label: "低吼蓄勢 (下一擊強化)" },
        { type: "heavy", mult: 1.5, label: "撕裂狂噬" }
      ]
    },
    corrupted_treant: {
      id: "corrupted_treant",
      name: "腐化古樹精",
      icon: "enemy_treant",
      chapter: 1,
      weaknesses: ["fire", "star"],
      hp: 115,
      atk: 18,
      def: 7,
      shield: 3,
      exp: 50,
      gold: 36,
      drops: [{ item: "moon_herb", chance: 0.9 }, { item: "star_shard", chance: 0.7 }],
      intents: [
        { type: "attack", mult: 1.0, label: "藤蔓鞭擊" },
        { type: "shield", heal: 20, shieldAdd: 1, label: "根脈吸取 (回血+護盾)" },
        { type: "heavy", mult: 1.45, debuff: "weaken", label: "瘴氣震地" }
      ]
    },
    elite_fenrir: {
      id: "elite_fenrir",
      name: "【菁英】蝕影狼王・芬里爾",
      icon: "elite_fenrir",
      chapter: 1,
      isElite: true,
      weaknesses: ["fire", "star"],
      hp: 195,
      atk: 21,
      def: 8,
      shield: 4,
      exp: 95,
      gold: 85,
      drops: [{ item: "star_shard", chance: 1.0 }, { item: "healing_potion", chance: 1.0 }],
      intents: [
        { type: "attack", mult: 1.1, label: "疾風連爪" },
        { type: "debuff", mult: 0.9, debuff: "vuln", label: "破甲狼嚎 (易傷)" },
        { type: "charge", mult: 0, buff: "atk", label: "銀月嗜血蓄力" },
        { type: "heavy", mult: 1.65, label: "【菁英技】幽林月影撲殺" }
      ]
    },
    boss_thorn_behemoth: {
      id: "boss_thorn_behemoth",
      name: "【首領】荊棘巨獸・巴爾薩",
      icon: "boss_behemoth",
      chapter: 1,
      isBoss: true,
      weaknesses: ["fire", "star"],
      hp: 290,
      atk: 24,
      def: 9,
      shield: 4,
      exp: 150,
      gold: 130,
      drops: [{ item: "compass_of_dawn", chance: 1.0 }, { item: "relic_wood", chance: 1.0 }, { item: "star_shard", chance: 1.0 }],
      phase2Text: "荊棘巨獸仰天咆哮，背上的星隕結晶迸發出狂暴的紫光！",
      intents: [
        { type: "attack", mult: 1.05, label: "巨角衝撞" },
        { type: "debuff", mult: 0.85, debuff: "vuln", label: "蝕星荊棘 (造成易傷)" },
        { type: "charge", mult: 0, buff: "atk", label: "星核共鳴蓄力！" },
        { type: "heavy", mult: 1.75, label: "【大招】森林崩滅踐踏" }
      ]
    },

    drowned_sentinel: {
      id: "drowned_sentinel",
      name: "沉沒發條衛兵",
      icon: "enemy_drowned",
      chapter: 2,
      weaknesses: ["star", "physical"],
      hp: 150,
      atk: 25,
      def: 11,
      shield: 3,
      exp: 68,
      gold: 50,
      drops: [{ item: "ancient_gear", chance: 0.85 }, { item: "mana_elixir", chance: 0.45 }],
      intents: [
        { type: "attack", mult: 1.0, label: "齒輪長槍突刺" },
        { type: "shield", heal: 0, shieldAdd: 2, label: "緊急上發條 (修復護盾)" },
        { type: "heavy", mult: 1.5, label: "高壓水柱斬" }
      ]
    },
    tide_siren: {
      id: "tide_siren",
      name: "深淵潮汐女妖",
      icon: "enemy_siren",
      chapter: 2,
      weaknesses: ["frost", "void"],
      hp: 135,
      atk: 28,
      def: 9,
      shield: 3,
      exp: 72,
      gold: 55,
      drops: [{ item: "star_shard", chance: 0.8 }, { item: "ancient_gear", chance: 0.65 }],
      intents: [
        { type: "debuff", mult: 0.9, debuff: "weaken", label: "迷魂潮歌 (削弱攻擊)" },
        { type: "attack", mult: 1.15, label: "寒潮衝擊" },
        { type: "heavy", mult: 1.55, label: "深海漩渦葬" }
      ]
    },
    elite_abyss_crab: {
      id: "elite_abyss_crab",
      name: "【菁英】深淵重甲巨蟹",
      icon: "elite_crab",
      chapter: 2,
      isElite: true,
      weaknesses: ["star", "fire"],
      hp: 290,
      atk: 30,
      def: 15,
      shield: 4,
      exp: 145,
      gold: 120,
      drops: [{ item: "ancient_gear", chance: 1.0 }, { item: "greater_potion", chance: 1.0 }],
      intents: [
        { type: "attack", mult: 1.1, label: "巨螯斷金鉗" },
        { type: "shield", heal: 30, shieldAdd: 2, label: "泡沫甲殼硬化" },
        { type: "heavy", mult: 1.65, debuff: "weaken", label: "【菁英技】深海激流轟擊" }
      ]
    },
    boss_chronos: {
      id: "boss_chronos",
      name: "【首領】時之守衛・克羅諾斯",
      icon: "boss_chronos",
      chapter: 2,
      isBoss: true,
      weaknesses: ["star", "fire"],
      hp: 450,
      atk: 33,
      def: 14,
      shield: 5,
      exp: 240,
      gold: 190,
      drops: [{ item: "chrono_pocketwatch", chance: 1.0 }, { item: "relic_water", chance: 1.0 }, { item: "ancient_gear", chance: 1.0 }],
      phase2Text: "克羅諾斯胸口的巨大鐘擺逆向狂轉：「警告——時間軸侵入者，執行抹殺程序！」",
      intents: [
        { type: "attack", mult: 1.1, label: "時針斬擊" },
        { type: "debuff", mult: 0.9, debuff: "vuln", label: "時間遲滯力場 (易傷)" },
        { type: "charge", mult: 0, buff: "atk", label: "發條極限超載！" },
        { type: "heavy", mult: 1.85, label: "【大招】千年鐘鳴審判" }
      ]
    },

    magma_golem: {
      id: "magma_golem",
      name: "熔核玄鐵魔像",
      icon: "enemy_golem",
      chapter: 3,
      weaknesses: ["frost", "void"],
      hp: 220,
      atk: 35,
      def: 18,
      shield: 4,
      exp: 100,
      gold: 75,
      drops: [{ item: "meteor_iron", chance: 0.85 }, { item: "star_bomb", chance: 0.45 }],
      intents: [
        { type: "attack", mult: 1.05, label: "熔岩重拳" },
        { type: "shield", heal: 25, shieldAdd: 2, label: "岩漿硬化" },
        { type: "heavy", mult: 1.6, label: "地心噴發震擊" }
      ]
    },
    ash_drake: {
      id: "ash_drake",
      name: "燼翼火蜥龍",
      icon: "enemy_drake",
      chapter: 3,
      weaknesses: ["frost", "star"],
      hp: 195,
      atk: 39,
      def: 13,
      shield: 3,
      exp: 105,
      gold: 80,
      drops: [{ item: "meteor_iron", chance: 0.8 }, { item: "greater_potion", chance: 0.45 }],
      intents: [
        { type: "debuff", mult: 1.0, debuff: "burn", label: "硫磺火息 (附加灼燒)" },
        { type: "attack", mult: 1.2, label: "烈焰擺尾" },
        { type: "heavy", mult: 1.65, label: "紅蓮俯衝" }
      ]
    },
    elite_vulcan: {
      id: "elite_vulcan",
      name: "【菁英】熔核督軍・瓦爾坎",
      icon: "elite_vulcan",
      chapter: 3,
      isElite: true,
      weaknesses: ["frost", "void"],
      hp: 420,
      atk: 42,
      def: 19,
      shield: 5,
      exp: 210,
      gold: 165,
      drops: [{ item: "meteor_iron", chance: 1.0 }, { item: "star_bomb", chance: 1.0 }],
      intents: [
        { type: "debuff", mult: 1.05, debuff: "burn", label: "熔爐重錘 (附加灼燒)" },
        { type: "charge", mult: 0, buff: "atk", label: "黑曜熔核增壓！" },
        { type: "heavy", mult: 1.75, label: "【菁英技】鍛造王座崩擊" }
      ]
    },
    boss_ignis: {
      id: "boss_ignis",
      name: "【首領】赤焰巨龍・伊格尼斯",
      icon: "boss_ignis",
      chapter: 3,
      isBoss: true,
      weaknesses: ["frost", "void"],
      hp: 650,
      atk: 46,
      def: 20,
      shield: 5,
      exp: 360,
      gold: 280,
      drops: [{ item: "dwarf_forge_plate", chance: 1.0 }, { item: "relic_fire", chance: 1.0 }, { item: "meteor_iron", chance: 1.0 }],
      phase2Text: "伊格尼斯展開雙翼，整座矮人鍛造廠的熔岩隨之沸騰：「凡人，見識星核之火的真正威能吧！」",
      intents: [
        { type: "debuff", mult: 1.05, debuff: "burn", label: "龍炎吐息 (灼燒)" },
        { type: "attack", mult: 1.2, label: "龍爪裂地" },
        { type: "charge", mult: 0, buff: "atk", label: "深吸熔爐星火 (蓄力)" },
        { type: "heavy", mult: 1.9, label: "【大招】紅蓮星隕滅世炎" }
      ]
    },

    astral_wraith: {
      id: "astral_wraith",
      name: "星界徘徊怨靈",
      icon: "enemy_wraith",
      chapter: 4,
      weaknesses: ["star", "fire"],
      hp: 260,
      atk: 47,
      def: 16,
      shield: 4,
      exp: 140,
      gold: 100,
      drops: [{ item: "void_essence", chance: 0.85 }, { item: "mana_elixir", chance: 0.5 }],
      intents: [
        { type: "debuff", mult: 1.0, debuff: "vuln", label: "虛空低語 (易傷)" },
        { type: "attack", mult: 1.2, label: "星魂貫穿" },
        { type: "heavy", mult: 1.65, label: "星蝕新星" }
      ]
    },
    star_inquisitor: {
      id: "star_inquisitor",
      name: "星象院自律審判官",
      icon: "enemy_inquisitor",
      chapter: 4,
      weaknesses: ["void", "physical"],
      hp: 300,
      atk: 49,
      def: 22,
      shield: 4,
      exp: 155,
      gold: 115,
      drops: [{ item: "void_essence", chance: 0.9 }, { item: "greater_potion", chance: 0.5 }],
      intents: [
        { type: "attack", mult: 1.15, label: "裁決光刃" },
        { type: "shield", heal: 35, shieldAdd: 2, label: "星光重組" },
        { type: "heavy", mult: 1.7, label: "天秤處刑斬" }
      ]
    },
    elite_twin_inquisitor: {
      id: "elite_twin_inquisitor",
      name: "【菁英】虛空雙子審判官",
      icon: "elite_twin",
      chapter: 4,
      isElite: true,
      weaknesses: ["void", "star"],
      hp: 540,
      atk: 53,
      def: 23,
      shield: 5,
      exp: 290,
      gold: 220,
      drops: [{ item: "void_essence", chance: 1.0 }, { item: "phoenix_salve", chance: 1.0 }],
      intents: [
        { type: "debuff", mult: 1.1, debuff: "vuln", label: "雙星交叉斬 (易傷)" },
        { type: "charge", mult: 0, buff: "atk", label: "雙子星象共鳴！" },
        { type: "heavy", mult: 1.8, label: "【菁英技】極光雙重裁決" }
      ]
    },
    boss_astra: {
      id: "boss_astra",
      name: "【首領】虛空星使・阿斯特拉",
      icon: "boss_astra",
      chapter: 4,
      isBoss: true,
      weaknesses: ["void", "fire"],
      hp: 860,
      atk: 57,
      def: 24,
      shield: 6,
      exp: 500,
      gold: 380,
      drops: [{ item: "relic_sky", chance: 1.0 }, { item: "void_essence", chance: 1.0 }, { item: "phoenix_salve", chance: 1.0 }],
      phase2Text: "阿斯特拉背後的星圖化作黑洞漩渦：「若真相會帶來毀滅，我寧可將你永遠封印在觀星穹頂！」",
      intents: [
        { type: "debuff", mult: 1.1, debuff: "weaken", label: "重力坍縮 (虛弱)" },
        { type: "attack", mult: 1.25, label: "群星墜落" },
        { type: "charge", mult: 0, buff: "atk", label: "星界奇點凝聚！" },
        { type: "heavy", mult: 1.95, label: "【大招】超新星坍滅光束" }
      ]
    },

    citadel_templar: {
      id: "citadel_templar",
      name: "聖殿黑曜禁衛",
      icon: "enemy_templar",
      chapter: 5,
      weaknesses: ["star", "void"],
      hp: 370,
      atk: 59,
      def: 28,
      shield: 5,
      exp: 210,
      gold: 155,
      drops: [{ item: "void_essence", chance: 0.8 }, { item: "meteor_iron", chance: 0.8 }],
      intents: [
        { type: "attack", mult: 1.15, label: "黑曜重斬" },
        { type: "debuff", mult: 1.0, debuff: "vuln", label: "破甲衝鋒" },
        { type: "heavy", mult: 1.75, label: "王權斷頭台" }
      ]
    },
    elite_regis: {
      id: "elite_regis",
      name: "【菁英】黑曜禁衛統領・雷吉斯",
      icon: "elite_regis",
      chapter: 5,
      isElite: true,
      weaknesses: ["star", "frost"],
      hp: 720,
      atk: 63,
      def: 29,
      shield: 6,
      exp: 420,
      gold: 320,
      drops: [{ item: "void_essence", chance: 1.0 }, { item: "meteor_iron", chance: 1.0 }, { item: "phoenix_salve", chance: 1.0 }],
      intents: [
        { type: "debuff", mult: 1.15, debuff: "weaken", label: "王城威壓斬 (虛弱)" },
        { type: "shield", heal: 55, shieldAdd: 2, label: "不滅禁衛誓言" },
        { type: "charge", mult: 0, buff: "atk", label: "黑曜劍氣極限凝聚！" },
        { type: "heavy", mult: 1.9, label: "【菁英技】阿卡迪亞隕落斬" }
      ]
    },
    boss_moebius: {
      id: "boss_moebius",
      name: "【最終首領】噬星者・莫比烏斯",
      icon: "boss_moebius",
      chapter: 5,
      isBoss: true,
      isFinalBoss: true,
      weaknesses: ["star", "void"],
      hp: 1350,
      atk: 70,
      def: 28,
      shield: 7,
      exp: 1000,
      gold: 1000,
      drops: [{ item: "heart_of_starfall", chance: 1.0 }],
      phase2Text: "莫比烏斯撕裂了霧海的蒼穹，暴露出璀璨而扭曲的永恆星核：「千年的輪迴即將閉合，化為星塵吧，尋星者！」",
      intents: [
        { type: "debuff", mult: 1.15, debuff: "vuln", label: "因果律撕裂 (易傷)" },
        { type: "attack", mult: 1.3, label: "維度斷空斬" },
        { type: "shield", heal: 75, shieldAdd: 2, label: "永劫回歸 (回血+護盾)" },
        { type: "charge", mult: 0, buff: "atk", label: "【終焉預兆】吞噬萬象星光！" },
        { type: "heavy", mult: 2.1, label: "【終極大招】星海紀元歸零" }
      ]
    }
  },

  // 15 篇世界觀收集文獻
  loreEntries: [
    { id: "lore_1", chapter: 1, title: "《微光漁村誌・卷一》", text: "三十年前的「星隕之夜」，一顆銀白巨星墜入北方的阿卡迪亞王城。自那夜起，濃密的紫霧籠罩了整片內海，唯有微光漁村依靠古老的燈塔勉強維持生計。" },
    { id: "lore_2", chapter: 1, title: "《守林人的警告信》", text: "「森林裡的三座古碑記載著最初的盟約：『日升於東(I)，月隱於西(II)，群星歸於北極(III)』。點亮全部三座古碑，才能解除通往森林首領祭壇的荊棘封印。」" },
    { id: "lore_3", chapter: 1, title: "《星辰植物學筆記》", text: "月光螢草吸收了空氣中的星塵後產生了突變。與星辰碎晶共鳴時，能提煉出修補靈魂創傷的聖露。古樹聖所的符文門密碼刻著三座星碑的筆劃：『312』。" },
    { id: "lore_4", chapter: 2, title: "《鐘樓設計師手札》", text: "「為了冷卻王城地底的星核反應爐，我們建造了這座巨型水力鐘樓。當東西兩座水閥全數開啟時，通往中央的虹吸橋才會浮現。」" },
    { id: "lore_5", chapter: 2, title: "《失蹤學徒亞倫的遺言》", text: "「師父說謊了。王國並非被隕星意外摧毀，而是王室主動用鎖鏈將那顆活生生的星辰拽下了地面……密碼就刻在鐘擺上：『時針指向四(4)，分針指向八(8)，秒針停於一(1)』（密碼：481）。」" },
    { id: "lore_6", chapter: 2, title: "《克羅諾斯製造藍圖》", text: "自律機關『克羅諾斯』以時光主發條為核心，其內部星力迴路對【星輝】與【烈焰】極度敏感。唯有在其蓄力前擊碎其護盾，方能令其核心當機。" },
    { id: "lore_7", chapter: 3, title: "《矮人鍛造王巴林的碑文》", text: "「王室要求我們用星隕玄鐵鍛造束縛星核的『永恆鎖鏈』。當我們發現那顆星辰擁有自己的意識與悲鳴時，一切都已經太遲了。」" },
    { id: "lore_8", chapter: 3, title: "《熔岩流向控制手冊》", text: "「若要通過中央熔岩河，必須扳動『東側主導流閥』，使岩漿冷卻凝固成黑曜石橋樑。矮人王座符文鎖記載著三聖物之序：一曰星辰(1)，二曰烈焰(2)，三曰不屈之鐵(3)（密碼：123）。」" },
    { id: "lore_9", chapter: 3, title: "《赤焰巨龍的契約》", text: "古龍伊格尼斯並非侵略者，牠曾與矮人王立約守護星隕玄鐵礦脈，以免貪婪的人類再次鑄造囚禁星辰的兵器。熔岩生物皆畏懼【寒霜】與【虛空】之力。" },
    { id: "lore_10", chapter: 4, title: "《星象院最高機密檔案》", text: "「『永晝計畫』第 99 號報告：強行抽取星核能量雖讓王城獲得了永恆的浮空動力，卻引發了時間膨脹與空間裂隙。天球儀認證代碼：99。」" },
    { id: "lore_11", chapter: 4, title: "《首席觀星師梅林的懺悔》", text: "「艾爾文，若你讀到這封信，說明你已長大成人。當年我將尚在襁褓中的你送出王城，並將星核鑰匙的碎片託付於你的古墜中。請原諒老師的懦弱。」" },
    { id: "lore_12", chapter: 4, title: "《北極星陣圖解》", text: "「星象院的傳送門遵循四象共鳴：唯有集齊觀星稜鏡並啟動星盤，通往審判台的星橋才會顯現。」" },
    { id: "lore_13", chapter: 5, title: "《霧海遺城・王座銘文》", text: "「我們曾妄想成為神明，最終卻成了囚籠裡的幽魂。集齊森、潮、焰、穹四枚星片者，將獲得重塑或終結這座永恆牢籠的裁決權。」" },
    { id: "lore_14", chapter: 5, title: "《噬星者莫比烏斯的誕生》", text: "前代國王與星核強行融合後，被無盡的怨念與失控的時間法則扭曲，化作了不斷吞噬時間線的怪物『莫比烏斯』。聖殿終極封印碼刻於王座背面：『777』。" },
    { id: "lore_15", chapter: 5, title: "《尋星者終章預言》", text: "「當迷霧散盡之時，尋星者將面臨三個抉擇：釋放星辰歸還天際、以自身取代國王維持結界，抑或融合古今智慧開創凡人與星辰共生的新紀元。」" }
  ],

  // 20 項成就系統
  achievements: [
    { id: "ach_first_blood", name: "初試鋒芒", icon: "icon_atk", desc: "贏得第一場戰鬥勝利。" },
    { id: "ach_shield_breaker", name: "破盾達人", icon: "icon_def", desc: "在戰鬥中累計擊碎敵人護盾(Break) 5 次。" },
    { id: "ach_forest_clear", name: "迷霧破曉", icon: "boss_behemoth", desc: "擊敗第一章首領「荊棘巨獸・巴爾薩」。" },
    { id: "ach_clock_clear", name: "逆轉時針", icon: "boss_chronos", desc: "擊敗第二章首領「時之守衛・克羅諾斯」。" },
    { id: "ach_forge_clear", name: "屠龍鍛造師", icon: "boss_ignis", desc: "擊敗第三章首領「赤焰巨龍・伊格尼斯」。" },
    { id: "ach_astral_clear", name: "越過星穹", icon: "boss_astra", desc: "擊敗第四章首領「虛空星使・阿斯特拉」。" },
    { id: "ach_game_clear", name: "霧海終焉", icon: "boss_moebius", desc: "擊敗最終首領「噬星者・莫比烏斯」並完成遊戲。" },
    { id: "ach_craftsman", name: "星辰工匠", icon: "anvil", desc: "在鍛造工坊成功合成、鍛造或強化裝備 3 次。" },
    { id: "ach_legendary_weapon", name: "神兵降世", icon: "icon_burst", desc: "鍛造出傳說武器【星穹裁決者】。" },
    { id: "ach_scholar", name: "星海博學者", icon: "scroll", desc: "收集超過 10 篇世界觀星辰手札。" },
    { id: "ach_loremaster", name: "真理見證人", icon: "scroll", desc: "集齊全部 15 篇世界觀星辰手札。" },
    { id: "ach_puzzle_master", name: "機關巧匠", icon: "cipher_on", desc: "解開所有章節的古碑、水閘與密碼謎題。" },
    { id: "ach_rich", name: "霧海富豪", icon: "icon_gold", desc: "持有金幣達到 500 G 以上。" },
    { id: "ach_max_level", name: "傳奇尋星者", icon: "hero_0", desc: "角色等級達到 Lv.8 以上。" },
    { id: "ach_abyss_5", name: "深淵踏破者", icon: "portal_0", desc: "在「無盡星淵試煉」模式中突破第 5 層。" },
    { id: "ach_true_ending", name: "星海重塑（真結局）", icon: "npc_goddess", desc: "集齊豐富文獻並達成真結局或隱藏結局。" },
    { id: "ach_mystery_seeker", name: "星界奇遇者", icon: "mystery", desc: "在探索途中觸發並完成 1 次【星界奇遇祭壇】事件。" },
    { id: "ach_patron", name: "星商貴賓", icon: "icon_gold", desc: "在【星界行商】進行購買或開啟神秘星界盲盒。" },
    { id: "ach_side_quest_master", name: "霧海委託人", icon: "scroll", desc: "累計完成 3 項以上的章節支線委託任務。" },
    { id: "ach_elite_hunter", name: "菁英狩獵者", icon: "icon_atk", desc: "擊敗任意章節深層迷宮的【菁英守衛】。" }
  ],


  endings: {
    liberation: {
      id: "liberation",
      title: "結局一：破霧新生（星辰歸天）",
      badge: "[解放結局]",
      summary: "你揮劍斬斷了束縛星核的永恆鎖鏈，將艾歐拉釋放回浩瀚夜空。籠罩內海三十年的紫霧在朝陽中散去，浮空遺城緩緩降落於海面。雖然世間不再有星核帶來的奇蹟動力，但微光漁村與倖存的人們終於迎來了真正自由的黎明。"
    },
    guardian: {
      id: "guardian",
      title: "結局二：永恆守望（孤高王座）",
      badge: "[守護結局]",
      summary: "為了不讓浮空遺跡崩塌波及無辜生靈，你選擇繼承星核王座，以自身純淨的意志取代失控的莫比烏斯。你化作霧海中央永不熄滅的北極星燈塔，在漫長的歲月裡靜靜守護著航行於海上的旅人。"
    },
    symbiosis: {
      id: "symbiosis",
      title: "真結局：星海重塑（萬象共生）",
      badge: "[真・完美結局]",
      summary: "憑藉你在旅途中收集的古老文獻與矮人、鐘樓、觀星院三族智慧，你重構了梅林導師未完成的『星辰諧律陣』。艾歐拉無須再受鎖鏈折磨，而是與大地締結了平等的共生盟約。紫霧化作滋養萬物的星露，阿卡迪亞迎來了凡人與星辰共榮的黃金時代！"
    },
    voyager: {
      id: "voyager",
      title: "隱藏結局：星界旅人（跨越星海）",
      badge: "[傳奇隱藏結局]",
      summary: "手持神兵【星穹裁決者】並集齊全部歷史真相的你，不僅平息了星核之亂，更受到艾歐拉的邀請。在將大地的未來託付給薇薇安與托爾金後，你踏上了通往無盡星海的光之航道，展開跨越群星的全新冒險！"
    }
  }
};

if (typeof window !== "undefined") {
  window.GAME_DATA = GAME_DATA;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { GAME_DATA };
}

// Node 環境：一併載入拆分出去的資料檔 (瀏覽器由 index.html 依序載入)
if (typeof module !== "undefined" && module.exports && typeof require === "function") {
  require("./data_chapters.js");
  require("./data_story.js");
  require("./data_gen.js");
}
