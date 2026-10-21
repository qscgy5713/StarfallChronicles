/**
 * 五章 x 三子區域的地圖、事件與章節設定 (Chapters)
 * 掛到 GAME_DATA.chapters；由 data.js 載入之後才執行。
 */
(function (GAME_DATA) {

// 5 大章節 × 每章 3 大子區域 (共 15 張獨立手繪迷宮地圖，所有互動圖塊與 events 100% 精準對齊)
GAME_DATA.chapters = {
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
})((typeof window !== "undefined" && window.GAME_DATA) || require("./data.js").GAME_DATA);
