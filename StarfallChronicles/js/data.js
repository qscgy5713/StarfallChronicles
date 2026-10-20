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

  // 5 大章節 × 每章 3 大子區域 (共 15 張獨立手繪迷宮地圖，所有互動圖塊與 events 100% 精準對齊)
  chapters: {
    1: {
      id: 1,
      name: "第一章：微光漁村與迷霧森林",
      subtitle: "Glimmerbrook & The Whispering Woods",
      themeColor: "#2dd4bf",
      ambientDesc: "潮濕的海風夾雜著發光孢子，古老的森林深處傳來低沉的咆哮。",
      zones: {
        1: {
          id: 1,
          name: "微光漁村與外圍林道",
          ambientDesc: "海霧籠罩的小漁村，東側防禦鐵門外便是危機四伏的外圍林道。",
          startPos: { x: 2, y: 6 },
          labels: {
            "1,1": "治療營火",
            "4,1": "村長奧爾森",
            "3,3": "鍛造鐵砧",
            "2,11": "草藥師艾琳[支線]",
            "7,3": "村口防禦門",
            "9,2": "奇遇祭壇",
            "1,6": "日升古碑(I)",
            "5,11": "月隱古碑(II)",
            "16,3": "北極星碑(III)",
            "11,7": "幽林封印門",
            "18,7": "前往1-2:迷霧幽林"
          },
          map: [
            "####################",
            "#F..N..#...M..C...L#",
            "#......#.?.........#",
            "#..A...G...E....S..#",
            "#......#...........#",
            "####.###...#########",
            "#S.........#...#...#",
            "#...E..M...G...E..>#",
            "#..........#...#...#",
            "######.#####...#.###",
            "#L.........#.......#",
            "#.N..S..E..G...E..C#",
            "#..C.......#..M....#",
            "####################"
          ],
          events: {
            "4,1": {
              type: "npc",
              name: "老村長・奧爾森",
              icon: "npc_elder",
              questId: "q1_forest_seal",
              dialogue: [
                "「艾爾文，你終於醒了！昨晚又有一顆流星墜入東邊的迷霧森林，森林裡的古樹與野獸都陷入了狂暴。」",
                "「我把【守林人銅鑰】交給你：先去打開東側的【村口防禦門 (7,3)】，再點亮林道中的三座【古老星碑 (I、II、III)】解除幽林封印門。」",
                "「穿過東側通道前往【1-2 迷霧幽林深處】與【1-3 古樹祭壇】，找出森林暴走的源頭吧！另外村裡南邊的草藥師艾琳似乎也正需要幫忙。」"
              ],
              firstReward: { gold: 50, items: { healing_potion: 2, moon_herb: 1 }, key: "key_rusty_gate" }
            },
            "2,11": {
              type: "npc",
              name: "草藥師・艾琳",
              icon: "npc_scholar",
              sideQuestId: "sq1_herbs",
              dialogue: [
                "「咳咳……紫霧的瘴氣越來越濃了，村民們都出現了頭暈發熱的症狀。」",
                "「艾爾文，如果你在森林裡探索時採集到 3 株【月光螢草】，能帶回來給我熬製解毒藥湯嗎？我會用家傳的聖輝靈藥與技能心得報答你！」"
              ]
            },
            "9,2": { type: "mystery", id: "mys_ch1_z1", encounterIndex: 0 },
            "18,1": { type: "lore", loreId: "lore_1" },
            "1,10": { type: "lore", loreId: "lore_2" },
            "14,1": { type: "chest", id: "c1_z1_north", reward: { gold: 45, items: { star_shard: 2, healing_potion: 1 } } },
            "3,12": { type: "chest", id: "c1_z1_south", reward: { gold: 55, items: { mist_ranger_armor: 1 } } },
            "18,11": { type: "chest", id: "c1_z1_east", reward: { gold: 50, items: { mana_elixir: 1, star_shard: 1 } } },
            "11,1": { type: "gather", id: "m1_z1_1", item: "moon_herb", count: 2 },
            "7,7": { type: "gather", id: "m1_z1_2", item: "moon_herb", count: 2 },
            "14,12": { type: "gather", id: "m1_z1_3", item: "star_shard", count: 2 },
            "7,3": {
              type: "gate",
              id: "g1_village",
              reqKey: "key_rusty_gate",
              openMsg: "你使用【守林人銅鑰】打開了微光漁村東側的防禦鐵門！",
              lockedMsg: "防禦鐵門緊閉！請先與漁村左上方的【老村長・奧爾森 (4,1)】交談取得銅鑰。"
            },
            "1,6": {
              type: "switch",
              id: "s1_west",
              group: "ch1_shrines",
              order: 1,
              name: "日升古碑 (I)",
              msg: "你觸碰了【日升古碑 (I)】，碑上的太陽符文亮起了溫暖的金光！"
            },
            "5,11": {
              type: "switch",
              id: "s1_south",
              group: "ch1_shrines",
              order: 2,
              name: "月隱古碑 (II)",
              msg: "你觸碰了【月隱古碑 (II)】，銀白色的月華與太陽符文產生共鳴！"
            },
            "16,3": {
              type: "switch",
              id: "s1_east",
              group: "ch1_shrines",
              order: 3,
              name: "北極星碑 (III)",
              msg: "你點亮了【北極星碑 (III)】！三座古碑連成一線，通往森林深處的荊棘封印門轟然開啟！"
            },
            "11,7": {
              type: "gate",
              id: "g1_boss_1",
              reqFlag: "ch1_shrines_solved",
              lockedMsg: "濃密的魔化荊棘封鎖了去路。請先點亮外圍林道全部 3 座【古老星碑】才能解除封印。"
            },
            "11,11": {
              type: "gate",
              id: "g1_boss_2",
              reqFlag: "ch1_shrines_solved",
              lockedMsg: "濃密的魔化荊棘封鎖了去路。請先點亮外圍林道全部 3 座【古老星碑】才能解除封印。"
            },
            "11,3": { type: "enemy", id: "e1_z1_1", enemyId: "mist_wolf" },
            "4,7": { type: "enemy", id: "e1_z1_2", enemyId: "mist_wolf" },
            "8,11": { type: "enemy", id: "e1_z1_3", enemyId: "corrupted_treant" },
            "15,7": { type: "enemy", id: "e1_z1_4", enemyId: "mist_wolf" },
            "15,11": { type: "enemy", id: "e1_z1_5", enemyId: "corrupted_treant" },
            "18,7": {
              type: "zone_portal",
              targetZone: 2,
              targetX: 2,
              targetY: 7,
              reqFlag: "ch1_shrines_solved",
              lockedMsg: "請先點亮三座古老星碑解除荊棘封印！",
              desc: "踏入幽林小徑，前往【1-2：迷霧幽林深處】"
            }
          }
        },
        2: {
          id: 2,
          name: "迷霧幽林深處",
          ambientDesc: "參天古木遮蔽了星光，腐化的藤蔓與蝕影狼群在迷霧間潛伏。",
          startPos: { x: 2, y: 7 },
          labels: {
            "1,7": "返回1-1:微光漁村",
            "3,2": "獵人雷恩[支線]",
            "9,3": "溪流木橋閥",
            "15,3": "菁英:蝕影狼王",
            "4,11": "植物學手札(密碼線索)",
            "18,11": "前往1-3:古樹祭壇"
          },
          map: [
            "####################",
            "#F..C...#..M....C..#",
            "#..N....#.....?....#",
            "#.....E.#S..E..B...#",
            "#.......#..........#",
            "####.#######~~~~####",
            "#...........~~~~...#",
            "#<..E...M...~~~~..E#",
            "#...........~~~~...#",
            "####.#######~~~~####",
            "#.......#..........#",
            "#...L...G...E.....>#",
            "#..M....#.....C....#",
            "####################"
          ],
          events: {
            "1,7": {
              type: "zone_portal",
              targetZone: 1,
              targetX: 17,
              targetY: 7,
              desc: "返回【1-1：微光漁村與外圍林道】"
            },
            "3,2": {
              type: "npc",
              name: "守林獵人・雷恩",
              icon: "npc_dwarf",
              sideQuestId: "sq1_wolf_king",
              dialogue: [
                "「小心！前面東北方林地盤踞著體型巨大的【蝕影狼王・芬里爾】，我的小隊剛才差點全軍覆沒。」",
                "「牠不僅守著通往南岸的古樹秘鑰，更是森林狼群暴走的頭目。若你能擊敗牠，我願將祖傳的【狼王銀牙護符】贈予你！」"
              ]
            },
            "14,2": { type: "mystery", id: "mys_ch1_z2", encounterIndex: 3 },
            "4,11": {
              type: "lore",
              loreId: "lore_3",
              extraMsg: "筆記末尾記載著古樹聖所的符文密碼：『三座星碑之序為 312』！"
            },
            "4,1": { type: "chest", id: "c1_z2_1", reward: { gold: 65, items: { healing_potion: 2, star_shard: 2 } } },
            "16,1": { type: "chest", id: "c1_z2_2", reward: { gold: 75, items: { star_bomb: 2, moon_herb: 2 } } },
            "14,12": { type: "chest", id: "c1_z2_3", reward: { gold: 80, items: { mana_elixir: 2, star_shard: 2 } } },
            "11,1": { type: "gather", id: "m1_z2_1", item: "moon_herb", count: 2 },
            "8,7": { type: "gather", id: "m1_z2_2", item: "star_shard", count: 2 },
            "3,12": { type: "gather", id: "m1_z2_3", item: "moon_herb", count: 2 },
            "9,3": {
              type: "switch",
              id: "s1_z2_bridge",
              flag: "ch1_z2_bridge",
              bridgeTiles: [
                { x: 12, y: 5 }, { x: 13, y: 5 }, { x: 14, y: 5 }, { x: 15, y: 5 },
                { x: 12, y: 6 }, { x: 13, y: 6 }, { x: 14, y: 6 }, { x: 15, y: 6 },
                { x: 12, y: 7 }, { x: 13, y: 7 }, { x: 14, y: 7 }, { x: 15, y: 7 },
                { x: 12, y: 8 }, { x: 13, y: 8 }, { x: 14, y: 8 }, { x: 15, y: 8 },
                { x: 12, y: 9 }, { x: 13, y: 9 }, { x: 14, y: 9 }, { x: 15, y: 9 }
              ],
              name: "古藤吊橋機關",
              msg: "你砍斷了纏繞絞盤的魔藤，跨越林間深澗的【古藤木橋】轟然放下！"
            },
            "8,11": {
              type: "gate",
              id: "g1_z2_south",
              reqFlag: "ch1_z2_bridge",
              openMsg: "古藤木橋放下後，南側林道的荊棘柵欄也隨之解開！",
              lockedMsg: "荊棘柵欄被藤蔓絞盤鎖死，請先前往北側林地 (9,3) 啟動【溪流木橋閥】。"
            },
            "6,3": { type: "enemy", id: "e1_z2_1", enemyId: "mist_wolf" },
            "12,3": { type: "enemy", id: "e1_z2_2", enemyId: "corrupted_treant" },
            "4,7": { type: "enemy", id: "e1_z2_3", enemyId: "mist_wolf" },
            "18,7": { type: "enemy", id: "e1_z2_4", enemyId: "corrupted_treant" },
            "12,11": { type: "enemy", id: "e1_z2_5", enemyId: "corrupted_treant" },
            "15,3": {
              type: "boss",
              id: "b1_elite_fenrir",
              enemyId: "elite_fenrir",
              intro: "銀白色的月光穿透林間，體型碩大的【蝕影狼王・芬里爾】發出震耳欲聾的咆哮！",
              winFlag: "elite_fenrir_defeated",
              winAchievement: "ach_elite_hunter"
            },
            "18,11": {
              type: "zone_portal",
              targetZone: 3,
              targetX: 2,
              targetY: 7,
              reqFlag: "ch1_z2_bridge",
              lockedMsg: "請先在上方啟動【古藤吊橋機關 (9,3)】開通道路！",
              desc: "深入森林核心，前往【1-3：古樹祭壇與腐化聖所】"
            }
          }
        },
        3: {
          id: 3,
          name: "古樹祭壇與腐化聖所",
          ambientDesc: "巨大的千年古樹根部被紫黑色星隕結晶貫穿，狂暴的魔力在此匯聚。",
          startPos: { x: 2, y: 7 },
          labels: {
            "1,7": "返回1-2:迷霧幽林",
            "2,2": "治療營火",
            "4,2": "鍛造鐵砧",
            "8,3": "古樹符文鎖",
            "11,7": "聖所內殿門",
            "15,7": "首領:荊棘巨獸",
            "18,7": "第二章傳送陣"
          },
          map: [
            "####################",
            "#..........#..C..M.#",
            "#.F.A...?..#.......#",
            "#.....E.R..#..E....#",
            "#..........#.......#",
            "#####.######.#######",
            "#..........#.......#",
            "#<..E...M..G...B..P#",
            "#..........#.......#",
            "#####.######.#######",
            "#..........#.......#",
            "#...C...E..#..E..C.#",
            "#.....M....#.......#",
            "####################"
          ],
          events: {
            "1,7": {
              type: "zone_portal",
              targetZone: 2,
              targetX: 17,
              targetY: 11,
              desc: "返回【1-2：迷霧幽林深處】"
            },
            "8,2": { type: "mystery", id: "mys_ch1_z3", encounterIndex: 4 },
            "14,1": { type: "chest", id: "c1_z3_1", reward: { gold: 80, items: { greater_potion: 1, star_shard: 2 } } },
            "4,11": { type: "chest", id: "c1_z3_2", reward: { gold: 70, items: { star_bomb: 2, healing_potion: 2 } } },
            "17,11": { type: "chest", id: "c1_z3_3", reward: { gold: 95, items: { starlight_blade: 1 } } },
            "17,1": { type: "gather", id: "m1_z3_1", item: "star_shard", count: 2 },
            "8,7": { type: "gather", id: "m1_z3_2", item: "moon_herb", count: 2 },
            "6,12": { type: "gather", id: "m1_z3_3", item: "star_shard", count: 2 },
            "8,3": {
              type: "riddle",
              id: "r1_sanctum_cipher",
              clueLoreId: "lore_3",
              prompt: "【古樹聖所符文鎖】石門上刻著：『唯有知曉植物學筆記中三座星碑筆劃之序者，方能踏入古樹祭壇。』請輸入三位數符文密碼：",
              answer: "312",
              flag: "ch1_sanctum_unlocked",
              successMsg: "古樹符文綻放翠綠光芒！通往祭壇核心的【聖所內殿門】已經開啟！"
            },
            "11,7": {
              type: "gate",
              id: "g1_z3_boss",
              reqFlag: "ch1_sanctum_unlocked",
              lockedMsg: "聖所內殿門緊閉。請先在左上方解開【古樹符文鎖 (8,3)】（線索記載於 1-2 西南方的《星辰植物學筆記》）。"
            },
            "6,3": { type: "enemy", id: "e1_z3_1", enemyId: "corrupted_treant" },
            "14,3": { type: "enemy", id: "e1_z3_2", enemyId: "mist_wolf" },
            "4,7": { type: "enemy", id: "e1_z3_3", enemyId: "corrupted_treant" },
            "8,11": { type: "enemy", id: "e1_z3_4", enemyId: "mist_wolf" },
            "14,11": { type: "enemy", id: "e1_z3_5", enemyId: "corrupted_treant" },
            "15,7": {
              type: "boss",
              id: "b1_boss",
              enemyId: "boss_thorn_behemoth",
              intro: "森林深處的祭壇上，一頭雙角鑲嵌著巨大星隕碎片的【荊棘巨獸・巴爾薩】緩緩轉過身來，雙眼燃燒著紫色的怒火！",
              winFlag: "ch1_boss_defeated",
              winAchievement: "ach_forest_clear"
            },
            "18,7": {
              type: "portal",
              reqFlag: "ch1_boss_defeated",
              lockedMsg: "傳送陣尚未啟動。必須先擊敗祭壇中央的【首領：荊棘巨獸】！",
              nextChapter: 2
            }
          }
        }
      }
    },

    2: {
      id: 2,
      name: "第二章：沉沒鐘樓與水下迴廊",
      subtitle: "The Sunken Clocktower",
      themeColor: "#38bdf8",
      ambientDesc: "巨大的青銅齒輪在幽藍的水面下緩緩轉動，滴水聲如同倒數計時的鐘擺。",
      zones: {
        1: {
          id: 1,
          name: "鐘樓浸水前廳",
          ambientDesc: "半淹沒於海平面下的鐘樓入口大廳，巨大的發條管道延伸向水底深處。",
          startPos: { x: 2, y: 2 },
          labels: {
            "1,1": "治療營火",
            "4,1": "學者薇薇安",
            "2,11": "老鐘錶匠[支線]",
            "1,7": "西側排水閥",
            "10,3": "前廳水閘門",
            "17,3": "前廳虹吸閥",
            "18,11": "前往2-2:水閘迷宮"
          },
          map: [
            "####################",
            "#F..N....L#...C...M#",
            "#....?....#........#",
            "#..A...E..G...E..S.#",
            "#.........#........#",
            "#####.#####~~~~#####",
            "#...#.....~~~~.....#",
            "#S..#.E...~~~~..E..#",
            "#...#.....~~~~.....#",
            "#...#####.~~~~.#####",
            "#..M......#........#",
            "#.N.C..E..G...E...>#",
            "#.........#..M.....#",
            "####################"
          ],
          events: {
            "4,1": {
              type: "npc",
              name: "鐘樓學者・薇薇安",
              icon: "npc_scholar",
              questId: "q2_clocktower",
              dialogue: [
                "「歡迎來到沉沒鐘樓！我是星象院學者薇薇安，我的發條機械梟『奧利弗』從現在起會與你同行！」",
                "「鐘樓分為【浸水前廳】、【齒輪水閘迷宮】與【時之核心大聖堂】三層。請先扳動左下方的【西側排水閥 (1,7)】與右上方的【前廳虹吸閥 (17,3)】架起虹吸橋！」",
                "「穿過東南方的階梯進入【2-2 齒輪水閘迷宮】，找回失蹤學徒亞倫的日記，才能解開通往時之守衛的終極密碼！」"
              ],
              firstReward: { gold: 70, items: { mana_elixir: 2, ancient_gear: 1 } }
            },
            "2,11": {
              type: "npc",
              name: "老鐘錶匠・霍華德",
              icon: "npc_elder",
              sideQuestId: "sq2_gears",
              dialogue: [
                "「這座鐘樓曾經每逢整點就會奏響撫慰人心的星之樂章……直到三十年前星隕之夜震碎了發條。」",
                "「年輕人，若你在探索鐘樓時收集到 3 枚【精密古銅齒輪】，請帶來給我修復這座星音鐘，我必有重謝！」"
              ]
            },
            "5,2": { type: "mystery", id: "mys_ch2_z1", encounterIndex: 1 },
            "9,1": { type: "lore", loreId: "lore_4" },
            "14,1": { type: "chest", id: "c2_z1_1", reward: { gold: 80, items: { ancient_gear: 2, star_shard: 1 }, loreId: "lore_6" } },
            "4,11": { type: "chest", id: "c2_z1_2", reward: { gold: 85, items: { healing_potion: 2, ancient_gear: 1 } } },
            "18,1": { type: "gather", id: "m2_z1_1", item: "ancient_gear", count: 2 },
            "3,10": { type: "gather", id: "m2_z1_2", item: "star_shard", count: 2 },
            "13,12": { type: "gather", id: "m2_z1_3", item: "ancient_gear", count: 2 },
            "1,7": {
              type: "switch",
              id: "s2_west",
              flag: "valve_west",
              name: "西側排水閥",
              msg: "你轉動了沉重的【西側排水閥】！前廳上方的水壓閘門已經開啟！"
            },
            "10,3": {
              type: "gate",
              id: "g2_upper",
              reqFlag: "valve_west",
              lockedMsg: "水壓閘門緊閉。請先前往左側迴廊 (1,7) 扳動【西側排水閥】。"
            },
            "17,3": {
              type: "switch",
              id: "s2_east",
              flag: "valve_east",
              bridgeTiles: [
                { x: 10, y: 5 }, { x: 11, y: 5 }, { x: 12, y: 5 }, { x: 13, y: 5 },
                { x: 10, y: 6 }, { x: 11, y: 6 }, { x: 12, y: 6 }, { x: 13, y: 6 },
                { x: 10, y: 7 }, { x: 11, y: 7 }, { x: 12, y: 7 }, { x: 13, y: 7 },
                { x: 10, y: 8 }, { x: 11, y: 8 }, { x: 12, y: 8 }, { x: 13, y: 8 },
                { x: 10, y: 9 }, { x: 11, y: 9 }, { x: 12, y: 9 }, { x: 13, y: 9 }
              ],
              name: "前廳虹吸閥",
              msg: "轟隆隆！水位大幅下降，中央水道的【古代虹吸橋】與底層通道同時開啟！"
            },
            "10,11": {
              type: "gate",
              id: "g2_z1_exit",
              reqFlag: "valve_east",
              lockedMsg: "底層水閘尚未洩壓。請先啟動右上方的【前廳虹吸閥 (17,3)】。"
            },
            "7,3": { type: "enemy", id: "e2_z1_1", enemyId: "drowned_sentinel" },
            "14,3": { type: "enemy", id: "e2_z1_2", enemyId: "tide_siren" },
            "6,7": { type: "enemy", id: "e2_z1_3", enemyId: "drowned_sentinel" },
            "16,7": { type: "enemy", id: "e2_z1_4", enemyId: "tide_siren" },
            "7,11": { type: "enemy", id: "e2_z1_5", enemyId: "drowned_sentinel" },
            "14,11": { type: "enemy", id: "e2_z1_6", enemyId: "tide_siren" },
            "18,11": {
              type: "zone_portal",
              targetZone: 2,
              targetX: 2,
              targetY: 3,
              reqFlag: "valve_east",
              lockedMsg: "請先扳動【前廳虹吸閥 (17,3)】排空前廳積水！",
              desc: "順著螺旋石階下行，進入【2-2：齒輪水閘迷宮】"
            }
          }
        },
        2: {
          id: 2,
          name: "齒輪水閘迷宮",
          ambientDesc: "錯綜複雜的水下輸水迴廊，失蹤學徒的遺物與深淵巨蟹潛藏於此。",
          startPos: { x: 2, y: 3 },
          labels: {
            "1,3": "返回2-1:鐘樓前廳",
            "4,1": "工程師諾亞[支線]",
            "16,2": "深水閘門開關",
            "15,7": "菁英:深淵重甲巨蟹",
            "2,11": "學徒日記(密碼線索)",
            "18,11": "前往2-3:時之聖堂"
          },
          map: [
            "####################",
            "#F..N...M.#...C....#",
            "#.........#.....S..#",
            "#<..E...E.G...E....#",
            "#.........#........#",
            "#####.#########~~~~#",
            "#.....#........~~~~#",
            "#..C..#.E..M...B...#",
            "#.....#............#",
            "###.###.#######.####",
            "#.......#..........#",
            "#.L..E..G....E....>#",
            "#...M...#..?....C..#",
            "####################"
          ],
          events: {
            "1,3": {
              type: "zone_portal",
              targetZone: 1,
              targetX: 17,
              targetY: 11,
              desc: "返回【2-1：鐘樓浸水前廳】"
            },
            "4,1": {
              type: "npc",
              name: "水道工程師・諾亞",
              icon: "npc_dwarf",
              sideQuestId: "sq2_crab",
              dialogue: [
                "「這層水閘迷宮的東側水池被一頭【深淵重甲巨蟹】佔據了，牠堅硬的甲殼連發條衛兵都穿不透！」",
                "「提示你：那頭巨蟹特別懼怕【星輝】與【烈焰】屬性的攻擊。若你能除掉牠，我就把用巨蟹甲殼打造的【深淵潮汐鱗甲】送給你！」"
              ]
            },
            "11,12": { type: "mystery", id: "mys_ch2_z2", encounterIndex: 4 },
            "2,11": {
              type: "lore",
              loreId: "lore_5",
              giveKey: "apprentice_journal",
              extraMsg: "獲得關鍵物品【鐘樓學徒日記】！日記記載著聖堂時鐘密碼：『時針指向 4，分針指向 8，秒針停於 1（密碼：481）』。"
            },
            "14,1": { type: "chest", id: "c2_z2_1", reward: { gold: 95, items: { starlight_blade: 1, healing_potion: 2 } } },
            "3,7": { type: "chest", id: "c2_z2_2", reward: { gold: 80, items: { ancient_gear: 2, mana_elixir: 1 } } },
            "16,12": { type: "chest", id: "c2_z2_3", reward: { gold: 90, items: { star_bomb: 2, star_shard: 2 } } },
            "8,1": { type: "gather", id: "m2_z2_1", item: "ancient_gear", count: 2 },
            "11,7": { type: "gather", id: "m2_z2_2", item: "star_shard", count: 2 },
            "4,12": { type: "gather", id: "m2_z2_3", item: "ancient_gear", count: 2 },
            "10,3": {
              type: "gate",
              id: "g2_z2_mid",
              autoOpen: true,
              openMsg: "你推開了半掩的青銅格柵門。"
            },
            "16,2": {
              type: "switch",
              id: "s2_z2_sluice",
              flag: "ch2_z2_sluice",
              bridgeTiles: [
                { x: 15, y: 5 }, { x: 16, y: 5 }, { x: 17, y: 5 }, { x: 18, y: 5 },
                { x: 15, y: 6 }, { x: 16, y: 6 }, { x: 17, y: 6 }, { x: 18, y: 6 }
              ],
              name: "深水洩洪總閥",
              msg: "你啟動了【深水洩洪總閥】！東側水池的水位退去，通往底層聖堂的閘門也隨之解鎖！"
            },
            "8,11": {
              type: "gate",
              id: "g2_z2_south",
              reqFlag: "ch2_z2_sluice",
              lockedMsg: "通往時之聖堂的閘門被水壓鎖死。請先前往右上方 (16,2) 啟動【深水洩洪總閥】。"
            },
            "4,3": { type: "enemy", id: "e2_z2_1", enemyId: "drowned_sentinel" },
            "8,3": { type: "enemy", id: "e2_z2_2", enemyId: "tide_siren" },
            "14,3": { type: "enemy", id: "e2_z2_3", enemyId: "drowned_sentinel" },
            "8,7": { type: "enemy", id: "e2_z2_4", enemyId: "tide_siren" },
            "5,11": { type: "enemy", id: "e2_z2_5", enemyId: "drowned_sentinel" },
            "13,11": { type: "enemy", id: "e2_z2_6", enemyId: "tide_siren" },
            "15,7": {
              type: "boss",
              id: "b2_elite_crab",
              enemyId: "elite_abyss_crab",
              intro: "水花四濺！身披厚重青銅裝甲的【深淵重甲巨蟹】揮舞巨螯攔住了去路！",
              winFlag: "elite_crab_defeated",
              winAchievement: "ach_elite_hunter"
            },
            "18,11": {
              type: "zone_portal",
              targetZone: 3,
              targetX: 2,
              targetY: 7,
              reqFlag: "ch2_z2_sluice",
              lockedMsg: "請先啟動右上方的【深水洩洪總閥 (16,2)】！",
              desc: "踏上乾涸的古水道，前往【2-3：時之核心大聖堂】"
            }
          }
        },
        3: {
          id: 3,
          name: "時之核心大聖堂",
          ambientDesc: "巨大的黃金鐘擺懸掛於穹頂，時間的流速在此處變得緩慢而凝重。",
          startPos: { x: 2, y: 7 },
          labels: {
            "1,7": "返回2-2:水閘迷宮",
            "2,2": "治療營火",
            "4,2": "鍛造鐵砧",
            "8,3": "時鐘密碼終端",
            "11,7": "時之核心大門",
            "15,7": "首領:克羅諾斯",
            "18,7": "第三章傳送陣"
          },
          map: [
            "####################",
            "#..........#..C..M.#",
            "#.F.A...?..#.......#",
            "#.....E.R..#..E....#",
            "#..........#.......#",
            "#####.######.#######",
            "#..........#.......#",
            "#<..E...M..G...B..P#",
            "#..........#.......#",
            "#####.######.#######",
            "#..........#.......#",
            "#...C...E..#..E..C.#",
            "#.....M....#.......#",
            "####################"
          ],
          events: {
            "1,7": {
              type: "zone_portal",
              targetZone: 2,
              targetX: 17,
              targetY: 11,
              desc: "返回【2-2：齒輪水閘迷宮】"
            },
            "8,2": { type: "mystery", id: "mys_ch2_z3", encounterIndex: 5 },
            "14,1": { type: "chest", id: "c2_z3_1", reward: { gold: 100, items: { greater_potion: 2, ancient_gear: 2 } } },
            "4,11": { type: "chest", id: "c2_z3_2", reward: { gold: 95, items: { star_bomb: 2, mana_elixir: 2 } } },
            "17,11": { type: "chest", id: "c2_z3_3", reward: { gold: 120, items: { phoenix_salve: 1, star_shard: 2 } } },
            "17,1": { type: "gather", id: "m2_z3_1", item: "ancient_gear", count: 2 },
            "8,7": { type: "gather", id: "m2_z3_2", item: "star_shard", count: 2 },
            "6,12": { type: "gather", id: "m2_z3_3", item: "ancient_gear", count: 2 },
            "8,3": {
              type: "riddle",
              id: "r2_clock_cipher",
              clueLoreId: "lore_5",
              prompt: "【發條密碼終端】「唯有撥動學徒亞倫日記中記載的時針、分針與秒針刻度，方能啟動時光主發條。」請輸入三位數時鐘密碼：",
              answer: "481",
              flag: "ch2_cipher_solved",
              rewardKey: "tower_mainspring",
              successMsg: "齒輪完美咬合！你獲得了【時光主發條】，並開啟了通往時之守衛殿堂的核心大門！"
            },
            "11,7": {
              type: "gate",
              id: "g2_boss",
              reqFlag: "ch2_cipher_solved",
              lockedMsg: "時之核心大門鎖死中。請先在左上方解開【時鐘密碼終端 (8,3)】（線索位於 2-2 左下角的《失蹤學徒亞倫的遺言》）。"
            },
            "6,3": { type: "enemy", id: "e2_z3_1", enemyId: "drowned_sentinel" },
            "14,3": { type: "enemy", id: "e2_z3_2", enemyId: "tide_siren" },
            "4,7": { type: "enemy", id: "e2_z3_3", enemyId: "drowned_sentinel" },
            "8,11": { type: "enemy", id: "e2_z3_4", enemyId: "tide_siren" },
            "14,11": { type: "enemy", id: "e2_z3_5", enemyId: "drowned_sentinel" },
            "15,7": {
              type: "boss",
              id: "b2_boss",
              enemyId: "boss_chronos",
              intro: "巨大的黃金鐘擺下，高達三米的機械巨像【時之守衛・克羅諾斯】緩緩舉起時針巨戟！",
              winFlag: "ch2_boss_defeated",
              winAchievement: "ach_clock_clear"
            },
            "18,7": {
              type: "portal",
              reqFlag: "ch2_boss_defeated",
              lockedMsg: "必須先擊敗【首領：時之守衛・克羅諾斯】以解除時間封鎖！",
              nextChapter: 3
            }
          }
        }
      }
    },

    3: {
      id: 3,
      name: "第三章：熔岩鍛造廠與矮人廢墟",
      subtitle: "Emberforge Ruins",
      themeColor: "#fb923c",
      ambientDesc: "熾熱的岩漿河照亮了宏偉的地下黑曜石殿堂，空氣中瀰漫著硫磺與星隕鐵的氣息。",
      zones: {
        1: {
          id: 1,
          name: "黑曜石礦坑入口",
          ambientDesc: "矮人地下王國的外圍礦道，熔爐餘溫與星隕鐵礦脈在岩壁上閃爍。",
          startPos: { x: 2, y: 2 },
          labels: {
            "1,1": "治療營火",
            "4,1": "鍛造鐵砧",
            "7,1": "鐵匠宗師托爾金",
            "2,11": "學徒巴頓[支線]",
            "10,3": "矮人礦道門",
            "17,3": "礦道排熱閥",
            "18,11": "前往3-2:萬爐大廳"
          },
          map: [
            "####################",
            "#F..A..N..#..L..C..#",
            "#....?....#........#",
            "#..E..M...G..E...S.#",
            "#.........#........#",
            "####.######~~~~#####",
            "#S........~~~~.....#",
            "#...E..M..~~~~..E..#",
            "#.........~~~~.....#",
            "#####.####~~~~.#####",
            "#..C......#........#",
            "#.N.L..E..G...E...>#",
            "#.....M...#..M.....#",
            "####################"
          ],
          events: {
            "7,1": {
              type: "npc",
              name: "矮人鐵匠宗師・托爾金",
              icon: "npc_dwarf",
              questId: "q3_forge",
              dialogue: [
                "「哼，人類小子？竟然能穿過沉沒鐘樓來到我們矮人一族的熔岩鍛造廠！」",
                "「赤焰巨龍伊格尼斯因為星核暴走而失去了理智，盤踞在第三層的【3-3 鍛造王座】。我收養的熔岩幼龍『伊格』很中意你，讓牠助你一臂之力吧！」",
                "「拿著這枚【鍛造王火紋章】打開【矮人礦道門 (10,3)】，再去啟動右上方的【礦道排熱閥 (17,3)】凝結黑曜石橋前往深層大廳！」"
              ],
              firstReward: { gold: 100, items: { meteor_iron: 2, star_bomb: 2 }, key: "dwarven_sigil" }
            },
            "2,11": {
              type: "npc",
              name: "鍛造學徒・巴頓",
              icon: "npc_dwarf",
              sideQuestId: "sq3_iron",
              dialogue: [
                "「師父吩咐我重燃這座副熔爐，但礦道裡的魔像太兇猛了，我還差 3 塊【星隕玄鐵】才能完成淬火測試。」",
                "「如果你能採集或從魔像身上取得 3 塊【星隕玄鐵】交給我，我願把珍藏的【鳳凰涅槃膏】與鍛造心得分享給你！」"
              ]
            },
            "5,2": { type: "mystery", id: "mys_ch3_z1", encounterIndex: 2 },
            "13,1": { type: "lore", loreId: "lore_7" },
            "4,11": { type: "lore", loreId: "lore_9" },
            "16,1": { type: "chest", id: "c3_z1_1", reward: { gold: 110, items: { meteor_iron: 2, greater_potion: 1 } } },
            "3,10": { type: "chest", id: "c3_z1_2", reward: { gold: 125, items: { clockwork_halberd: 1, healing_potion: 2 } } },
            "6,3": { type: "gather", id: "m3_z1_1", item: "meteor_iron", count: 2 },
            "7,7": { type: "gather", id: "m3_z1_2", item: "meteor_iron", count: 2 },
            "6,12": { type: "gather", id: "m3_z1_3", item: "star_shard", count: 3 },
            "13,12": { type: "gather", id: "m3_z1_4", item: "meteor_iron", count: 2 },
            "10,3": {
              type: "gate",
              id: "g3_mine",
              reqKey: "dwarven_sigil",
              openMsg: "你出示了【鍛造王火紋章】，矮人符文大門緩緩升起！",
              lockedMsg: "矮人符文大門緊閉。請先與北側的【鐵匠宗師托爾金 (7,1)】交談。"
            },
            "1,6": {
              type: "switch",
              id: "s3_west_valve",
              flag: "lava_west",
              name: "西側岩漿冷卻閥",
              msg: "你啟動了【西側岩漿冷卻閥】，寒氣注入熔岩河西岸！"
            },
            "17,3": {
              type: "switch",
              id: "s3_east_valve",
              flag: "lava_east",
              bridgeTiles: [
                { x: 10, y: 5 }, { x: 11, y: 5 }, { x: 12, y: 5 }, { x: 13, y: 5 },
                { x: 10, y: 6 }, { x: 11, y: 6 }, { x: 12, y: 6 }, { x: 13, y: 6 },
                { x: 10, y: 7 }, { x: 11, y: 7 }, { x: 12, y: 7 }, { x: 13, y: 7 },
                { x: 10, y: 8 }, { x: 11, y: 8 }, { x: 12, y: 8 }, { x: 13, y: 8 },
                { x: 10, y: 9 }, { x: 11, y: 9 }, { x: 12, y: 9 }, { x: 13, y: 9 }
              ],
              name: "礦道排熱主閥",
              msg: "熾熱的岩漿迅速冷卻凝固，化作堅固的【黑曜石橋樑】並解開了底層大門！"
            },
            "10,11": {
              type: "gate",
              id: "g3_z1_exit",
              reqFlag: "lava_east",
              lockedMsg: "通往萬爐大廳的閘門被高溫封鎖。請先啟動右上方的【礦道排熱主閥 (17,3)】。"
            },
            "3,3": { type: "enemy", id: "e3_z1_1", enemyId: "magma_golem" },
            "13,3": { type: "enemy", id: "e3_z1_2", enemyId: "ash_drake" },
            "4,7": { type: "enemy", id: "e3_z1_3", enemyId: "magma_golem" },
            "16,7": { type: "enemy", id: "e3_z1_4", enemyId: "ash_drake" },
            "7,11": { type: "enemy", id: "e3_z1_5", enemyId: "magma_golem" },
            "14,11": { type: "enemy", id: "e3_z1_6", enemyId: "ash_drake" },
            "18,11": {
              type: "zone_portal",
              targetZone: 2,
              targetX: 2,
              targetY: 3,
              reqFlag: "lava_east",
              lockedMsg: "請先啟動右上方的【礦道排熱主閥 (17,3)】凝結黑曜石橋！",
              desc: "穿過黑曜石拱門，進入【3-2：萬爐熔岩大廳】"
            }
          }
        },
        2: {
          id: 2,
          name: "萬爐熔岩大廳",
          ambientDesc: "數十座矮人巨型高爐環列四周，暴走的熔核督軍正把守著通往王座的要道。",
          startPos: { x: 2, y: 3 },
          labels: {
            "1,3": "返回3-1:礦坑入口",
            "4,1": "老礦工格imli[支線]",
            "16,2": "高爐冷卻總閥",
            "15,7": "菁英:熔核督軍瓦爾坎",
            "2,11": "熔岩控制手冊(密碼線索)",
            "18,11": "前往3-3:炎龍王座"
          },
          map: [
            "####################",
            "#F..N...M.#...C....#",
            "#.........#.....S..#",
            "#<..E...E.G...E....#",
            "#.........#........#",
            "#####.#########~~~~#",
            "#.....#........~~~~#",
            "#..C..#.E..M...B...#",
            "#.....#............#",
            "###.###.#######.####",
            "#.......#..........#",
            "#.L..E..G....E....>#",
            "#...M...#..?....C..#",
            "####################"
          ],
          events: {
            "1,3": {
              type: "zone_portal",
              targetZone: 1,
              targetX: 17,
              targetY: 11,
              desc: "返回【3-1：黑曜石礦坑入口】"
            },
            "4,1": {
              type: "npc",
              name: "老礦工・格imli",
              icon: "npc_dwarf",
              sideQuestId: "sq3_vulcan",
              dialogue: [
                "「小心！萬爐大廳中央被【熔核督軍・瓦爾坎】佔據了，牠還奪走了我們矮人先祖的星鍛錘！」",
                "「熔岩魔像最害怕【寒霜】與【虛空】的力量。若你能擊敗瓦爾坎奪回先祖遺物，我把私藏的 3 塊極品【星隕玄鐵】全數奉上！」"
              ]
            },
            "11,12": { type: "mystery", id: "mys_ch3_z2", encounterIndex: 3 },
            "2,11": {
              type: "lore",
              loreId: "lore_8",
              extraMsg: "獲得《熔岩流向控制手冊》！記載著矮人王座符文鎖的三聖物密碼：『一曰星辰(1)，二曰烈焰(2)，三曰不屈之鐵(3)（密碼：123）』。"
            },
            "14,1": { type: "chest", id: "c3_z2_1", reward: { gold: 135, items: { meteor_iron: 2, phoenix_salve: 1 } } },
            "3,7": { type: "chest", id: "c3_z2_2", reward: { gold: 120, items: { greater_potion: 2, star_bomb: 2 } } },
            "16,12": { type: "chest", id: "c3_z2_3", reward: { gold: 140, items: { star_shard: 3, mana_elixir: 2 } } },
            "8,1": { type: "gather", id: "m3_z2_1", item: "meteor_iron", count: 2 },
            "11,7": { type: "gather", id: "m3_z2_2", item: "meteor_iron", count: 2 },
            "4,12": { type: "gather", id: "m3_z2_3", item: "star_shard", count: 2 },
            "10,3": {
              type: "gate",
              id: "g3_z2_mid",
              autoOpen: true,
              openMsg: "你推開了沉重的黑曜石隔熱門。"
            },
            "16,2": {
              type: "switch",
              id: "s3_z2_sluice",
              flag: "ch3_z2_sluice",
              bridgeTiles: [
                { x: 15, y: 5 }, { x: 16, y: 5 }, { x: 17, y: 5 }, { x: 18, y: 5 },
                { x: 15, y: 6 }, { x: 16, y: 6 }, { x: 17, y: 6 }, { x: 18, y: 6 }
              ],
              name: "高爐冷卻總閥",
              msg: "你扳動了【高爐冷卻總閥】！東側岩漿池凝結成黑曜石地面，南側通往王座的閘門也隨之開啟！"
            },
            "8,11": {
              type: "gate",
              id: "g3_z2_south",
              reqFlag: "ch3_z2_sluice",
              lockedMsg: "高溫蒸氣封鎖了閘門。請先前往右上方 (16,2) 啟動【高爐冷卻總閥】。"
            },
            "4,3": { type: "enemy", id: "e3_z2_1", enemyId: "magma_golem" },
            "8,3": { type: "enemy", id: "e3_z2_2", enemyId: "ash_drake" },
            "14,3": { type: "enemy", id: "e3_z2_3", enemyId: "magma_golem" },
            "8,7": { type: "enemy", id: "e3_z2_4", enemyId: "ash_drake" },
            "5,11": { type: "enemy", id: "e3_z2_5", enemyId: "magma_golem" },
            "13,11": { type: "enemy", id: "e3_z2_6", enemyId: "ash_drake" },
            "15,7": {
              type: "boss",
              id: "b3_elite_vulcan",
              enemyId: "elite_vulcan",
              intro: "全身流淌著赤紅鐵水的【熔核督軍・瓦爾坎】高舉巨型鍛造錘，地面隨之劇烈震動！",
              winFlag: "elite_vulcan_defeated",
              winAchievement: "ach_elite_hunter"
            },
            "18,11": {
              type: "zone_portal",
              targetZone: 3,
              targetX: 2,
              targetY: 7,
              reqFlag: "ch3_z2_sluice",
              lockedMsg: "請先啟動右上方的【高爐冷卻總閥 (16,2)】！",
              desc: "踏入熾熱的核心聖殿，前往【3-3：鍛造王座與炎龍巢穴】"
            }
          }
        },
        3: {
          id: 3,
          name: "鍛造王座與炎龍巢穴",
          ambientDesc: "矮人王國最神聖的星隕主熔爐，赤焰巨龍伊格尼斯正盤踞於王座之上。",
          startPos: { x: 2, y: 7 },
          labels: {
            "1,7": "返回3-2:萬爐大廳",
            "2,2": "治療營火",
            "4,2": "鍛造鐵砧",
            "8,3": "矮人王座符文鎖",
            "11,7": "巨龍王座門",
            "15,7": "首領:赤焰巨龍",
            "18,7": "第四章傳送陣"
          },
          map: [
            "####################",
            "#..........#..C..M.#",
            "#.F.A...?..#.......#",
            "#.....E.R..#..E....#",
            "#..........#.......#",
            "#####.######.#######",
            "#..........#.......#",
            "#<..E...M..G...B..P#",
            "#..........#.......#",
            "#####.######.#######",
            "#..........#.......#",
            "#...C...E..#..E..C.#",
            "#.....M....#.......#",
            "####################"
          ],
          events: {
            "1,7": {
              type: "zone_portal",
              targetZone: 2,
              targetX: 17,
              targetY: 11,
              desc: "返回【3-2：萬爐熔岩大廳】"
            },
            "8,2": { type: "mystery", id: "mys_ch3_z3", encounterIndex: 4 },
            "14,1": { type: "chest", id: "c3_z3_1", reward: { gold: 150, items: { meteor_iron: 2, greater_potion: 2 } } },
            "4,11": { type: "chest", id: "c3_z3_2", reward: { gold: 140, items: { phoenix_salve: 1, star_bomb: 2 } } },
            "17,11": { type: "chest", id: "c3_z3_3", reward: { gold: 165, items: { ember_greatsword: 1 } } },
            "17,1": { type: "gather", id: "m3_z3_1", item: "meteor_iron", count: 2 },
            "8,7": { type: "gather", id: "m3_z3_2", item: "star_shard", count: 3 },
            "6,12": { type: "gather", id: "m3_z3_3", item: "meteor_iron", count: 2 },
            "8,3": {
              type: "riddle",
              id: "r3_forge_riddle",
              clueLoreId: "lore_8",
              prompt: "【矮人王座符文鎖】「吾輩以何物鑄就自由？請依《熔岩流向控制手冊》記載輸入矮人三聖物之序：」",
              answer: "123",
              flag: "ch3_riddle_solved",
              successMsg: "矮人符文鎖應聲解開！通往赤焰巨龍殿堂的黑曜石王座大門敞開了！"
            },
            "11,7": {
              type: "gate",
              id: "g3_boss",
              reqFlag: "ch3_riddle_solved",
              lockedMsg: "黑曜石王座大門緊閉。請先在左上方解開【矮人王座符文鎖 (8,3)】（線索位於 3-2 左下角的《熔岩流向控制手冊》）。"
            },
            "6,3": { type: "enemy", id: "e3_z3_1", enemyId: "magma_golem" },
            "14,3": { type: "enemy", id: "e3_z3_2", enemyId: "ash_drake" },
            "4,7": { type: "enemy", id: "e3_z3_3", enemyId: "magma_golem" },
            "8,11": { type: "enemy", id: "e3_z3_4", enemyId: "ash_drake" },
            "14,11": { type: "enemy", id: "e3_z3_5", enemyId: "magma_golem" },
            "15,7": {
              type: "boss",
              id: "b3_boss",
              enemyId: "boss_ignis",
              intro: "盤踞在巨大熔爐上的【赤焰巨龍・伊格尼斯】張開雙眼，金色豎瞳中映出你的身影！",
              winFlag: "ch3_boss_defeated",
              winAchievement: "ach_forge_clear"
            },
            "18,7": {
              type: "portal",
              reqFlag: "ch3_boss_defeated",
              lockedMsg: "必須先擊敗【首領：赤焰巨龍・伊格尼斯】並取得焰之星片！",
              nextChapter: 4
            }
          }
        }
      }
    },

    4: {
      id: 4,
      name: "第四章：浮空星象院",
      subtitle: "The Astral Observatory",
      themeColor: "#a78bfa",
      ambientDesc: "懸浮於萬丈雲海之上的大理石迴廊，四周是璀璨的星雲與破碎的星盤。",
      zones: {
        1: {
          id: 1,
          name: "雲海星橋長廊",
          ambientDesc: "漂浮在雲端之上的純白觀星長廊，昔日學者的星魂在此徘徊。",
          startPos: { x: 2, y: 6 },
          labels: {
            "1,1": "治療營火",
            "4,1": "鍛造鐵砧",
            "3,3": "觀星師梅林",
            "2,11": "書記官賽琳[支線]",
            "10,3": "光學結界門",
            "17,3": "北極天樞星盤",
            "18,11": "前往4-2:天球儀室"
          },
          map: [
            "####################",
            "#F..A..L..#..C...M.#",
            "#....?....#........#",
            "#..N..E...G..E...S.#",
            "#.........#........#",
            "####.######~~~~#####",
            "#.........~~~~....L#",
            "#..S..E...~~~~..E..#",
            "#.........~~~~.....#",
            "#####.####~~~~.#####",
            "#..C......#........#",
            "#.N.L..E..G...E...>#",
            "#.....M...#..M.....#",
            "####################"
          ],
          events: {
            "3,3": {
              type: "npc",
              name: "首席觀星師梅林的星魂",
              icon: "npc_mage",
              questId: "q4_astral_truth",
              dialogue: [
                "「艾爾文……我的孩子，你終於帶著微光古墜回到了阿卡迪亞的星象院。」",
                "「三十年前，國王為了追求永恆的國度，強行用鎖鏈捕獲了天際的活體星辰。我是這場災難的幫兇，也是將你送出王城的人。」",
                "「讓星界蝶靈『瑟拉』伴你同行吧。拿著這枚【觀星稜鏡】打開【光學結界門 (10,3)】，啟動右上方的【北極天樞星盤 (17,3)】架起星橋前往內院！」"
              ],
              firstReward: { gold: 150, items: { void_essence: 2, greater_potion: 2 }, key: "astral_lens" }
            },
            "2,11": {
              type: "npc",
              name: "星魂書記官・賽琳",
              icon: "npc_scholar",
              sideQuestId: "sq4_lore",
              dialogue: [
                "「我是星象院大書庫的守護者賽琳。王國覆滅的真相散落在各地的《星辰手札》之中。」",
                "「若你能收集到至少 9 篇《星辰手札》並帶給我印證歷史，我將以高純度的【虛空星塵】與星象奧義回報你！」"
              ]
            },
            "5,2": { type: "mystery", id: "mys_ch4_z1", encounterIndex: 0 },
            "7,1": { type: "lore", loreId: "lore_11" },
            "18,6": { type: "lore", loreId: "lore_12" },
            "4,11": { type: "lore", loreId: "lore_10" },
            "13,1": { type: "chest", id: "c4_z1_1", reward: { gold: 160, items: { void_essence: 2, phoenix_salve: 1 } } },
            "3,10": { type: "chest", id: "c4_z1_2", reward: { gold: 175, items: { mana_elixir: 2, greater_potion: 2 } } },
            "17,1": { type: "gather", id: "m4_z1_1", item: "void_essence", count: 2 },
            "6,12": { type: "gather", id: "m4_z1_2", item: "void_essence", count: 2 },
            "13,12": { type: "gather", id: "m4_z1_3", item: "star_shard", count: 3 },
            "10,3": {
              type: "gate",
              id: "g4_north",
              reqKey: "astral_lens",
              openMsg: "【觀星稜鏡】折射出耀眼星芒，解除了星象院內殿的光學結界！",
              lockedMsg: "光學結界封鎖了內殿。請先與【觀星師梅林 (3,3)】交談取得觀星稜鏡。"
            },
            "3,7": {
              type: "switch",
              id: "s4_west",
              flag: "astrolabe_west",
              name: "南十字星盤",
              msg: "你校準了【南十字星盤】，一道璀璨的星光投射向中央虛空！"
            },
            "17,3": {
              type: "switch",
              id: "s4_east",
              flag: "astrolabe_east",
              bridgeTiles: [
                { x: 10, y: 5 }, { x: 11, y: 5 }, { x: 12, y: 5 }, { x: 13, y: 5 },
                { x: 10, y: 6 }, { x: 11, y: 6 }, { x: 12, y: 6 }, { x: 13, y: 6 },
                { x: 10, y: 7 }, { x: 11, y: 7 }, { x: 12, y: 7 }, { x: 13, y: 7 },
                { x: 10, y: 8 }, { x: 11, y: 8 }, { x: 12, y: 8 }, { x: 13, y: 8 },
                { x: 10, y: 9 }, { x: 11, y: 9 }, { x: 12, y: 9 }, { x: 13, y: 9 }
              ],
              name: "北極天樞星盤",
              msg: "雙星共鳴！虛空中凝聚出由星光構成的【銀河星橋】！"
            },
            "10,11": {
              type: "gate",
              id: "g4_z1_exit",
              reqFlag: "astrolabe_east",
              lockedMsg: "內院星門尚未充能。請先啟動右上方的【北極天樞星盤 (17,3)】。"
            },
            "6,3": { type: "enemy", id: "e4_z1_1", enemyId: "astral_wraith" },
            "13,3": { type: "enemy", id: "e4_z1_2", enemyId: "star_inquisitor" },
            "6,7": { type: "enemy", id: "e4_z1_3", enemyId: "astral_wraith" },
            "16,7": { type: "enemy", id: "e4_z1_4", enemyId: "star_inquisitor" },
            "7,11": { type: "enemy", id: "e4_z1_5", enemyId: "astral_wraith" },
            "14,11": { type: "enemy", id: "e4_z1_6", enemyId: "star_inquisitor" },
            "18,11": {
              type: "zone_portal",
              targetZone: 2,
              targetX: 2,
              targetY: 3,
              reqFlag: "astrolabe_east",
              lockedMsg: "請先啟動右上方的【北極天樞星盤 (17,3)】架起銀河星橋！",
              desc: "踏過星光回廊，進入【4-2：折光天球儀室】"
            }
          }
        },
        2: {
          id: 2,
          name: "折光天球儀室",
          ambientDesc: "巨大的黃銅天球儀在半空中交錯旋轉，折射出無數道璀璨的星界光束。",
          startPos: { x: 2, y: 3 },
          labels: {
            "1,3": "返回4-1:星橋長廊",
            "4,1": "學徒露娜[支線]",
            "16,2": "天球折光鏡開關",
            "15,7": "菁英:虛空雙子審判官",
            "18,11": "前往4-3:審判穹頂"
          },
          map: [
            "####################",
            "#F..N...M.#...C....#",
            "#.........#.....S..#",
            "#<..E...E.G...E....#",
            "#.........#........#",
            "#####.#########~~~~#",
            "#.....#........~~~~#",
            "#..C..#.E..M...B...#",
            "#.....#............#",
            "###.###.#######.####",
            "#.......#..........#",
            "#....E..G....E....>#",
            "#...M...#..?....C..#",
            "####################"
          ],
          events: {
            "1,3": {
              type: "zone_portal",
              targetZone: 1,
              targetX: 17,
              targetY: 11,
              desc: "返回【4-1：雲海星橋長廊】"
            },
            "4,1": {
              type: "npc",
              name: "觀星學徒・露娜",
              icon: "npc_scholar",
              sideQuestId: "sq4_twins",
              dialogue: [
                "「救命……我的星魂被天球儀室東側的【虛空雙子審判官】鎖在了這座星陣裡！」",
                "「祂們對【虛空】與【星輝】屬性極為敏感。求求你擊敗祂們解開束縛，我願將秘寶【星穹共鳴指環】交給你！」"
              ]
            },
            "11,12": { type: "mystery", id: "mys_ch4_z2", encounterIndex: 5 },
            "14,1": { type: "chest", id: "c4_z2_1", reward: { gold: 180, items: { void_essence: 2, phoenix_salve: 1 } } },
            "3,7": { type: "chest", id: "c4_z2_2", reward: { gold: 165, items: { greater_potion: 2, mana_elixir: 2 } } },
            "16,12": { type: "chest", id: "c4_z2_3", reward: { gold: 190, items: { star_bomb: 2, void_essence: 2 } } },
            "8,1": { type: "gather", id: "m4_z2_1", item: "void_essence", count: 2 },
            "11,7": { type: "gather", id: "m4_z2_2", item: "star_shard", count: 3 },
            "4,12": { type: "gather", id: "m4_z2_3", item: "void_essence", count: 2 },
            "10,3": {
              type: "gate",
              id: "g4_z2_mid",
              autoOpen: true,
              openMsg: "你穿過了星紋折光門。"
            },
            "16,2": {
              type: "switch",
              id: "s4_z2_prism",
              flag: "ch4_z2_prism",
              bridgeTiles: [
                { x: 15, y: 5 }, { x: 16, y: 5 }, { x: 17, y: 5 }, { x: 18, y: 5 },
                { x: 15, y: 6 }, { x: 16, y: 6 }, { x: 17, y: 6 }, { x: 18, y: 6 }
              ],
              name: "天球主折光鏡",
              msg: "你轉動了【天球主折光鏡】！星光在虛空中鋪就道路，並開啟了通往審判穹頂的大門！"
            },
            "8,11": {
              type: "gate",
              id: "g4_z2_south",
              reqFlag: "ch4_z2_prism",
              lockedMsg: "星界結界尚未解除。請先前往右上方 (16,2) 啟動【天球主折光鏡】。"
            },
            "4,3": { type: "enemy", id: "e4_z2_1", enemyId: "astral_wraith" },
            "8,3": { type: "enemy", id: "e4_z2_2", enemyId: "star_inquisitor" },
            "14,3": { type: "enemy", id: "e4_z2_3", enemyId: "astral_wraith" },
            "8,7": { type: "enemy", id: "e4_z2_4", enemyId: "star_inquisitor" },
            "5,11": { type: "enemy", id: "e4_z2_5", enemyId: "astral_wraith" },
            "13,11": { type: "enemy", id: "e4_z2_6", enemyId: "star_inquisitor" },
            "15,7": {
              type: "boss",
              id: "b4_elite_twins",
              enemyId: "elite_twin_inquisitor",
              intro: "兩具手持雙子光刃的【虛空雙子審判官】同時轉身：「未經認證者，禁止踏入觀星穹頂！」",
              winFlag: "elite_twins_defeated",
              winAchievement: "ach_elite_hunter"
            },
            "18,11": {
              type: "zone_portal",
              targetZone: 3,
              targetX: 2,
              targetY: 7,
              reqFlag: "ch4_z2_prism",
              lockedMsg: "請先啟動右上方的【天球主折光鏡 (16,2)】！",
              desc: "踏上星光階梯，前往【4-3：觀星審判穹頂】"
            }
          }
        },
        3: {
          id: 3,
          name: "觀星審判穹頂",
          ambientDesc: "星象院的最高穹頂，無垠的銀河在頭頂旋轉，虛空星使在此守護著最後的秘密。",
          startPos: { x: 2, y: 7 },
          labels: {
            "1,7": "返回4-2:天球儀室",
            "2,2": "治療營火",
            "4,2": "鍛造鐵砧",
            "8,3": "天球儀認證終端",
            "11,7": "審判聖殿門",
            "15,7": "首領:虛空星使",
            "18,7": "第五章傳送陣"
          },
          map: [
            "####################",
            "#..........#..C..M.#",
            "#.F.A...?..#.......#",
            "#.....E.R..#..E....#",
            "#..........#.......#",
            "#####.######.#######",
            "#..........#.......#",
            "#<..E...M..G...B..P#",
            "#..........#.......#",
            "#####.######.#######",
            "#..........#.......#",
            "#...C...E..#..E..C.#",
            "#.....M....#.......#",
            "####################"
          ],
          events: {
            "1,7": {
              type: "zone_portal",
              targetZone: 2,
              targetX: 17,
              targetY: 11,
              desc: "返回【4-2：折光天球儀室】"
            },
            "8,2": { type: "mystery", id: "mys_ch4_z3", encounterIndex: 3 },
            "14,1": { type: "chest", id: "c4_z3_1", reward: { gold: 200, items: { void_essence: 3, greater_potion: 2 } } },
            "4,11": { type: "chest", id: "c4_z3_2", reward: { gold: 185, items: { phoenix_salve: 2, star_bomb: 2 } } },
            "17,11": { type: "chest", id: "c4_z3_3", reward: { gold: 220, items: { celestial_vestment: 1 } } },
            "17,1": { type: "gather", id: "m4_z3_1", item: "void_essence", count: 2 },
            "8,7": { type: "gather", id: "m4_z3_2", item: "void_essence", count: 2 },
            "6,12": { type: "gather", id: "m4_z3_3", item: "star_shard", count: 3 },
            "8,3": {
              type: "riddle",
              id: "r4_astral_cipher",
              clueLoreId: "lore_10",
              prompt: "【天球儀最高認證】「請輸入《星象院最高機密檔案》中記載的『永晝計畫』關鍵報告編號：」",
              answer: "99",
              flag: "ch4_cipher_solved",
              successMsg: "天球儀認證通過！審判聖殿的大門已為你敞開！"
            },
            "11,7": {
              type: "gate",
              id: "g4_boss",
              reqFlag: "ch4_cipher_solved",
              lockedMsg: "審判聖殿被星界結界封鎖。請先在左上方完成【天球儀認證終端 (8,3)】（線索位於 4-1 左下方的《星象院最高機密檔案》）。"
            },
            "6,3": { type: "enemy", id: "e4_z3_1", enemyId: "astral_wraith" },
            "14,3": { type: "enemy", id: "e4_z3_2", enemyId: "star_inquisitor" },
            "4,7": { type: "enemy", id: "e4_z3_3", enemyId: "astral_wraith" },
            "8,11": { type: "enemy", id: "e4_z3_4", enemyId: "star_inquisitor" },
            "14,11": { type: "enemy", id: "e4_z3_5", enemyId: "star_inquisitor" },
            "15,7": {
              type: "boss",
              id: "b4_boss",
              enemyId: "boss_astra",
              intro: "星穹之下，展開光之蝶翼的【虛空星使・阿斯特拉】緩緩降臨：「尋星者，證明你擁有承受真相的覺悟吧！」",
              winFlag: "ch4_boss_defeated",
              winAchievement: "ach_astral_clear"
            },
            "18,7": {
              type: "portal",
              reqFlag: "ch4_boss_defeated",
              lockedMsg: "必須先通過【首領：虛空星使・阿斯特拉】的試煉！",
              nextChapter: 5
            }
          }
        }
      }
    },

    5: {
      id: 5,
      name: "第五章：霧海遺城・星核聖殿",
      subtitle: "The Mistbound Citadel & Starcore Sanctum",
      themeColor: "#f43f5e",
      ambientDesc: "時間在此處靜止，破碎的王城建築漂浮在深紅與湛藍交織的星核漩渦旁。",
      zones: {
        1: {
          id: 1,
          name: "破碎王城外環",
          ambientDesc: "昔日輝煌的阿卡迪亞王城廣場，如今被時空裂隙分割成漂浮的碎島。",
          startPos: { x: 2, y: 6 },
          labels: {
            "1,1": "治療營火",
            "4,1": "鍛造鐵砧",
            "3,3": "星核意志艾歐拉",
            "2,11": "近衛英靈凱恩[支線]",
            "3,7": "淨化星碑(I)",
            "17,3": "淨化星碑(II)",
            "10,3": "王城內環門",
            "18,11": "前往5-2:星核迴廊"
          },
          map: [
            "####################",
            "#F..A..L..#..C...M.#",
            "#....?....#........#",
            "#..N..E...G..E...S.#",
            "#.........#........#",
            "####.######~~~~#####",
            "#..L......~~~~....L#",
            "#..S..E...~~~~..E..#",
            "#.........~~~~.....#",
            "#####.####~~~~.#####",
            "#..C......#........#",
            "#.N....E..G...E...>#",
            "#.....M...#..M.....#",
            "####################"
          ],
          events: {
            "3,3": {
              type: "npc",
              name: "星核意志・艾歐拉",
              icon: "npc_goddess",
              questId: "q5_final_sanctum",
              dialogue: [
                "「謝謝你走到了這裡，艾爾文。我是墜落於此的星辰意識——艾歐拉。」",
                "「前代國王與我的半身融合後化作了『噬星者・莫比烏斯』，將整座王國困在永恆的迷霧輪迴裡。」",
                "「我已為你解開【王城內環門 (10,3)】！請啟動【淨化星碑 (17,3)】架起星橋，穿過【5-2 四象星核迴廊】前往最終王座廳吧！」"
              ],
              firstReward: { gold: 250, items: { phoenix_salve: 2, void_essence: 2, meteor_iron: 2 } }
            },
            "2,11": {
              type: "npc",
              name: "王城近衛英靈・凱恩",
              icon: "npc_elder",
              sideQuestId: "sq5_obelisk",
              dialogue: [
                "「年輕的尋星者，我是昔日王城近衛隊的凱恩。請點亮外環的兩座【淨化星碑 (3,7 與 17,3)】，替死去的王城子民驅散混沌瘴氣吧！」",
                "「此外，我的昔日長官【黑曜禁衛統領・雷吉斯】仍在 5-2 迴廊中受莫比烏斯操控，若你能賜予他榮耀的安息，我必將王室至寶託付於你！」"
              ]
            },
            "5,2": { type: "mystery", id: "mys_ch5_z1", encounterIndex: 1 },
            "7,1": { type: "lore", loreId: "lore_13" },
            "3,6": { type: "lore", loreId: "lore_14" },
            "18,6": { type: "lore", loreId: "lore_15" },
            "13,1": { type: "chest", id: "c5_z1_1", reward: { gold: 250, items: { void_essence: 3, meteor_iron: 2 } } },
            "3,10": { type: "chest", id: "c5_z1_2", reward: { gold: 280, items: { phoenix_salve: 2, greater_potion: 2 } } },
            "17,1": { type: "gather", id: "m5_z1_1", item: "void_essence", count: 3 },
            "6,12": { type: "gather", id: "m5_z1_2", item: "star_shard", count: 3 },
            "13,12": { type: "gather", id: "m5_z1_3", item: "meteor_iron", count: 3 },
            "10,3": {
              type: "gate",
              id: "g5_sanctum",
              reqFlag: "npc_reward_5_1_3,3",
              openMsg: "你身上的四枚星核碎片與艾歐拉的祝福產生共鳴，王城內環門隨之敞開！",
              lockedMsg: "王城內環門被星光封印。請先與左側的【星核意志艾歐拉 (3,3)】交談。"
            },
            "3,7": {
              type: "switch",
              id: "s5_south",
              flag: "sanctum_altar_1",
              name: "西側淨化星碑 (I)",
              msg: "【森之星片】與【潮之星片】懸浮而起，化作璀璨的雙色光虹！"
            },
            "17,3": {
              type: "switch",
              id: "s5_north",
              flag: "sanctum_altar_2",
              bridgeTiles: [
                { x: 10, y: 5 }, { x: 11, y: 5 }, { x: 12, y: 5 }, { x: 13, y: 5 },
                { x: 10, y: 6 }, { x: 11, y: 6 }, { x: 12, y: 6 }, { x: 13, y: 6 },
                { x: 10, y: 7 }, { x: 11, y: 7 }, { x: 12, y: 7 }, { x: 13, y: 7 },
                { x: 10, y: 8 }, { x: 11, y: 8 }, { x: 12, y: 8 }, { x: 13, y: 8 },
                { x: 10, y: 9 }, { x: 11, y: 9 }, { x: 12, y: 9 }, { x: 13, y: 9 }
              ],
              name: "東側淨化星碑 (II)",
              msg: "四枚星片完成共鳴！跨越星淵的【創世星橋】與通往星核迴廊的大門同時開啟！"
            },
            "10,11": {
              type: "gate",
              id: "g5_z1_exit",
              reqFlag: "sanctum_altar_2",
              lockedMsg: "內環通道被扭曲的時空封鎖。請先啟動右上方的【東側淨化星碑 (17,3)】。"
            },
            "6,3": { type: "enemy", id: "e5_z1_1", enemyId: "citadel_templar" },
            "13,3": { type: "enemy", id: "e5_z1_2", enemyId: "citadel_templar" },
            "6,7": { type: "enemy", id: "e5_z1_3", enemyId: "astral_wraith" },
            "16,7": { type: "enemy", id: "e5_z1_4", enemyId: "star_inquisitor" },
            "7,11": { type: "enemy", id: "e5_z1_5", enemyId: "citadel_templar" },
            "14,11": { type: "enemy", id: "e5_z1_6", enemyId: "citadel_templar" },
            "18,11": {
              type: "zone_portal",
              targetZone: 2,
              targetX: 2,
              targetY: 3,
              reqFlag: "sanctum_altar_2",
              lockedMsg: "請先啟動右上方的【東側淨化星碑 (17,3)】！",
              desc: "踏入深紅與星藍交織的長廊，前往【5-2：四象星核迴廊】"
            }
          }
        },
        2: {
          id: 2,
          name: "四象星核迴廊",
          ambientDesc: "通往王座廳的皇家禁衛長廊，黑曜禁衛統領雷吉斯正橫劍立於星橋盡頭。",
          startPos: { x: 2, y: 3 },
          labels: {
            "1,3": "返回5-1:王城外環",
            "4,1": "近衛英靈凱恩[支線]",
            "16,2": "皇家星樞開關",
            "15,7": "菁英:禁衛統領雷吉斯",
            "18,11": "前往5-3:永恆王座"
          },
          map: [
            "####################",
            "#F..N...M.#...C....#",
            "#.........#.....S..#",
            "#<..E...E.G...E....#",
            "#.........#........#",
            "#####.#########~~~~#",
            "#.....#........~~~~#",
            "#..C..#.E..M...B...#",
            "#.....#............#",
            "###.###.#######.####",
            "#.......#..........#",
            "#....E..G....E....>#",
            "#...M...#..?....C..#",
            "####################"
          ],
          events: {
            "1,3": {
              type: "zone_portal",
              targetZone: 1,
              targetX: 17,
              targetY: 11,
              desc: "返回【5-1：破碎王城外環】"
            },
            "4,1": {
              type: "npc",
              name: "王城近衛英靈・凱恩",
              icon: "npc_elder",
              sideQuestId: "sq5_regis",
              dialogue: [
                "「前面 (15,7) 就是我們近衛隊最強的劍士——【黑曜禁衛統領・雷吉斯】。他的靈魂已被莫比烏斯的混沌力量侵蝕。」",
                "「雷吉斯的黑曜重甲畏懼【星輝】與【寒霜】之力。請擊敗他解除他的痛苦，我會將傳說聖物【星核之眸】交給你助你迎戰莫比烏斯！」"
              ]
            },
            "11,12": { type: "mystery", id: "mys_ch5_z2", encounterIndex: 5 },
            "14,1": { type: "chest", id: "c5_z2_1", reward: { gold: 260, items: { void_essence: 3, phoenix_salve: 2 } } },
            "3,7": { type: "chest", id: "c5_z2_2", reward: { gold: 240, items: { meteor_iron: 3, greater_potion: 2 } } },
            "16,12": { type: "chest", id: "c5_z2_3", reward: { gold: 280, items: { star_shard: 4, mana_elixir: 2 } } },
            "8,1": { type: "gather", id: "m5_z2_1", item: "void_essence", count: 3 },
            "11,7": { type: "gather", id: "m5_z2_2", item: "meteor_iron", count: 3 },
            "4,12": { type: "gather", id: "m5_z2_3", item: "star_shard", count: 3 },
            "10,3": {
              type: "gate",
              id: "g5_z2_mid",
              autoOpen: true,
              openMsg: "你推開了皇家禁衛迴廊大門。"
            },
            "16,2": {
              type: "switch",
              id: "s5_z2_bridge",
              flag: "ch5_z2_bridge",
              bridgeTiles: [
                { x: 15, y: 5 }, { x: 16, y: 5 }, { x: 17, y: 5 }, { x: 18, y: 5 },
                { x: 15, y: 6 }, { x: 16, y: 6 }, { x: 17, y: 6 }, { x: 18, y: 6 }
              ],
              name: "皇家星樞開關",
              msg: "你啟動了【皇家星樞開關】！通往永恆星核王座的最終通路已經解鎖！"
            },
            "8,11": {
              type: "gate",
              id: "g5_z2_south",
              reqFlag: "ch5_z2_bridge",
              lockedMsg: "通往王座廳的結界門鎖死。請先前往右上方 (16,2) 啟動【皇家星樞開關】。"
            },
            "4,3": { type: "enemy", id: "e5_z2_1", enemyId: "citadel_templar" },
            "8,3": { type: "enemy", id: "e5_z2_2", enemyId: "star_inquisitor" },
            "14,3": { type: "enemy", id: "e5_z2_3", enemyId: "citadel_templar" },
            "8,7": { type: "enemy", id: "e5_z2_4", enemyId: "astral_wraith" },
            "5,11": { type: "enemy", id: "e5_z2_5", enemyId: "citadel_templar" },
            "13,11": { type: "enemy", id: "e5_z2_6", enemyId: "citadel_templar" },
            "15,7": {
              type: "boss",
              id: "b5_elite_regis",
              enemyId: "elite_regis",
              intro: "身披黑曜重鎧的【黑曜禁衛統領・雷吉斯】拔出巨劍：「來吧，尋星者！唯有跨越我的劍鋒，方有資格直面王座！」",
              winFlag: "elite_regis_defeated",
              winAchievement: "ach_elite_hunter"
            },
            "18,11": {
              type: "zone_portal",
              targetZone: 3,
              targetX: 2,
              targetY: 7,
              reqFlag: "ch5_z2_bridge",
              lockedMsg: "請先啟動右上方的【皇家星樞開關 (16,2)】！",
              desc: "邁向命運的終點，進入【5-3：永恆星核王座】"
            }
          }
        },
        3: {
          id: 3,
          name: "永恆星核王座",
          ambientDesc: "破碎王城的最高聖堂，璀璨而扭曲的永恆星核在噬星者莫比烏斯背後脈動。",
          startPos: { x: 2, y: 7 },
          labels: {
            "1,7": "返回5-2:星核迴廊",
            "2,2": "治療營火",
            "4,2": "鍛造鐵砧",
            "8,3": "王座封印終端",
            "11,7": "星核王座大門",
            "15,7": "最終首領:莫比烏斯"
          },
          map: [
            "####################",
            "#..........#..C..M.#",
            "#.F.A...?..#.......#",
            "#.....E.R..#..E....#",
            "#..........#.......#",
            "#####.######.#######",
            "#..........#.......#",
            "#<..E...M..G...B...#",
            "#..........#.......#",
            "#####.######.#######",
            "#..........#.......#",
            "#...C...E..#..E..C.#",
            "#.....M....#.......#",
            "####################"
          ],
          events: {
            "1,7": {
              type: "zone_portal",
              targetZone: 2,
              targetX: 17,
              targetY: 11,
              desc: "返回【5-2：四象星核迴廊】"
            },
            "8,2": { type: "mystery", id: "mys_ch5_z3", encounterIndex: 4 },
            "14,1": { type: "chest", id: "c5_z3_1", reward: { gold: 300, items: { phoenix_salve: 2, void_essence: 3 } } },
            "4,11": { type: "chest", id: "c5_z3_2", reward: { gold: 280, items: { greater_potion: 3, star_bomb: 3 } } },
            "17,11": { type: "chest", id: "c5_z3_3", reward: { gold: 350, items: { meteor_iron: 3, void_essence: 3 } } },
            "17,1": { type: "gather", id: "m5_z3_1", item: "void_essence", count: 3 },
            "8,7": { type: "gather", id: "m5_z3_2", item: "meteor_iron", count: 3 },
            "6,12": { type: "gather", id: "m5_z3_3", item: "star_shard", count: 3 },
            "8,3": {
              type: "riddle",
              id: "r5_throne_cipher",
              clueLoreId: "lore_14",
              prompt: "【王座終極封印終端】「請輸入《噬星者莫比烏斯的誕生》手札中記載的王座背面三位數終極封印碼：」",
              answer: "777",
              flag: "ch5_throne_unlocked",
              successMsg: "終極封印解除！星核王座廳的大門轟然開啟，最終決戰即將展開！"
            },
            "11,7": {
              type: "gate",
              id: "g5_boss",
              reqFlag: "ch5_throne_unlocked",
              lockedMsg: "星核王座大門緊閉。請先在左上方解開【王座封印終端 (8,3)】（線索位於 5-1 左側的《噬星者莫比烏斯的誕生》）。"
            },
            "6,3": { type: "enemy", id: "e5_z3_1", enemyId: "citadel_templar" },
            "14,3": { type: "enemy", id: "e5_z3_2", enemyId: "citadel_templar" },
            "4,7": { type: "enemy", id: "e5_z3_3", enemyId: "citadel_templar" },
            "8,11": { type: "enemy", id: "e5_z3_4", enemyId: "star_inquisitor" },
            "14,11": { type: "enemy", id: "e5_z3_5", enemyId: "citadel_templar" },
            "15,7": {
              type: "boss",
              id: "b5_boss",
              enemyId: "boss_moebius",
              intro: "王座之上，吞噬了無數時間線的【噬星者・莫比烏斯】緩緩睜開巨眼：「尋星者，你是要成為新的囚徒，還是與這座世界一同毀滅？」",
              winFlag: "ch5_boss_defeated",
              winAchievement: "ach_game_clear"
            }
          }
        }
      }
    }
  },

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

// 為向後相容自動將各章節的第 1 子區域映射至章節頂層屬性
Object.values(GAME_DATA.chapters).forEach(ch => {
  if (ch.zones && ch.zones[1]) {
    ch.startPos = ch.zones[1].startPos;
    ch.labels = ch.zones[1].labels;
    ch.map = ch.zones[1].map;
    ch.events = ch.zones[1].events;
  }
});

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

if (typeof window !== "undefined") {
  window.GAME_DATA = GAME_DATA;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { GAME_DATA };
}
