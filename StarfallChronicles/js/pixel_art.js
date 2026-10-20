/**
 * 《星隕編年史：霧海遺城》 - 16-Bit 原生像素美術渲染引擎 (PixelArtEngine v2.3)
 * 100% 純手繪像素矩陣 (16x16) 轉 Canvas / DataURL，全遊戲零 Emoji，所有色盤代碼經過完整校驗
 */

class PixelArtEngine {
  constructor() {
    this.cache = {};
    this.imgCache = {};
    this.palette = {
      ".": null,
      "K": "#090d16", // 黑邊框
      "W": "#f8fafc", // 純白高光
      "G": "#94a3b8", // 淺灰金屬
      "D": "#475569", // 深灰暗部
      "S": "#334155", // 岩石深藍灰
      "R": "#ef4444", // 鮮紅
      "r": "#991b1b", // 暗紅
      "O": "#f97316", // 橘紅火焰
      "Y": "#facc15", // 金黃
      "y": "#ca8a04", // 暗金/銅
      "L": "#4ade80", // 亮綠草木
      "l": "#15803d", // 深綠森林
      "T": "#2dd4bf", // 星輝青綠
      "C": "#38bdf8", // 天藍/星光藍
      "B": "#1d4ed8", // 深海藍
      "b": "#1e3a8a", // 夜空暗藍
      "P": "#c084fc", // 星界亮紫
      "p": "#6b21a8", // 虛空深紫
      "M": "#f472b6", // 桃紅魔力
      "F": "#fde68a", // 膚色
      "N": "#92400e", // 皮革/木頭棕
      "n": "#451a03"  // 深木棕
    };

    this.sprites = this.defineSprites();
  }

  defineSprites() {
    return {
      hero_0: [
        "....KKKKKK......",
        "...KYYYYYYK.....",
        "..KYYYYYYYYK....",
        "..KFFKFFKFFK..K.",
        "..KFFFFFFFFK.KCK",
        "...KRRRRRRK..KCK",
        "..KRRRRRRRRK.KCK",
        ".KBBBBBBBBBBKKCK",
        ".KBBYBBBBYBBKNYK",
        ".KBBBBBBBBBBK.K.",
        "..KBBBBBBBBK....",
        "..KNNNNNNNNK....",
        "...KNN..NNK.....",
        "...KNN..NNK.....",
        "..KKKK..KKKK....",
        "................"
      ],
      hero_1: [
        "................",
        "....KKKKKK......",
        "...KYYYYYYK.....",
        "..KYYYYYYYYK..K.",
        "..KFFKFFKFFK.KCK",
        "..KFFFFFFFFK.KCK",
        "...KRRRRRRK..KCK",
        "..KRRRRRRRRK.KCK",
        ".KBBBBBBBBBBKNYK",
        ".KBBYBBBBYBBK.K.",
        ".KBBBBBBBBBBK...",
        "..KBBBBBBBBK....",
        "..KNN....NNK....",
        "..KKKK..KKKK....",
        "................",
        "................"
      ],

      pet_lumi: [
        "..KK......KK....",
        ".KTTK....KTTK...",
        ".KWWTTTTTTWWK...",
        "..KTTTTTTTTK....",
        "..KTKWWWWKTK....",
        "..KTTTTTTTTK..KK",
        "...KWWWWWWK..KTC",
        "...KTTTTTTK.KTTC",
        "..KTTTTTTTTKKTTK",
        "..KTTWWWWTTKTTK.",
        "..KTTTTTTTTTTK..",
        "...KTTK..KTTK...",
        "...KWWK..KWWK...",
        "....KK....KK....",
        "................",
        "................"
      ],
      pet_oliver: [
        "....KKKKKK......",
        "...KyyyyyyK.....",
        "..KyYYYYYYyK....",
        "..KyYKKKKYyK....",
        ".KyYKYWWYKYyK...",
        ".KyYKYKKYKYyK...",
        "..KyYYYYYYyK....",
        "..KyyyyOyyyyK...",
        ".KyYGGGGGGYyK...",
        ".KyYGGGGGGYyK...",
        "..KyYYYYYYyK....",
        "...KyyyyyyK.....",
        "....KO..OK......",
        "...KKK..KKK.....",
        "................",
        "................"
      ],
      pet_iggy: [
        "..KK......KK....",
        ".KYYK....KYYK...",
        "..KRRRRRRRRK....",
        "..KRKYYYYKRK....",
        ".KRRRRRRRRRRK...",
        ".KRRRRWWWRRRK...",
        "..KRRRRRRRRK.KO.",
        ".KOOORRRRRROKOK.",
        "KOORRRRRRRRRROK.",
        "K.KRRYYYYYRRK...",
        "..KRRYYYYYRRK...",
        "..KRRRRRRRRRK...",
        "...KRRK..KRRK...",
        "..KKKK....KKKK..",
        "................",
        "................"
      ],
      pet_sera: [
        ".KKKK....KKKK...",
        "KPPPPK..KPPPPK..",
        "KPYYPKKKKPYYPK..",
        "KPPPPYWWYPPPPK..",
        ".KPPPYWWYPPPK...",
        "..KKKKWWKKKK....",
        ".KCCCCWWCCCCK...",
        "KCCYYCWWCYYCCK..",
        "KCCCCWWWWCCCCK..",
        ".KKK..WW..KKK...",
        "......WW........",
        ".....KWWK.......",
        "......KK........",
        "................",
        "................",
        "................"
      ],

      campfire_0: [
        ".......K........",
        "......KOK.......",
        ".....KOOOK......",
        "....KOOOOOK.....",
        "....KOYWYOOK....",
        "...KOOYWWYOK....",
        "...KROYYYYORK...",
        "..KRRYYYYYYRRK..",
        "..KRRRRRRRRRRK..",
        "...KKKKKKKKKK...",
        "..KNNNyyyyNNNK..",
        ".KNNnNyyyyNnNNK.",
        "..KKKKKKKKKKKK..",
        "................",
        "................",
        "................"
      ],
      campfire_1: [
        "......KOK.......",
        ".....KOOOK......",
        "....KOYWYOOK....",
        "....KOYYYYOK....",
        "...KOOYWWYOOK...",
        "...KROYYYYORK...",
        "..KRRRYYYYRRRK..",
        "..KRRRRWWWRRRK..",
        "..KRRRRRRRRRRK..",
        "...KKKKKKKKKK...",
        "..KNNNyyyyNNNK..",
        ".KNNnNyyyyNnNNK.",
        "..KKKKKKKKKKKK..",
        "................",
        "................",
        "................"
      ],
      anvil: [
        "......KKKK......",
        ".....KGGGGK.....",
        ".....KGGGGK.....",
        ".......NN.......",
        ".......NN.......",
        ".KKKKKKKKKKKKKK.",
        "KGGGGGGGGGGGGGGK",
        "KDDDDDDDDDDDDDDK",
        ".KKKKDDDDDDKKKK.",
        "....KDDDDDDK....",
        "....KDDDDDDK....",
        "...KDDDDDDDDK...",
        "..KKKKKKKKKKKK..",
        ".KNNNNNNNNNNNNK.",
        ".KKKKKKKKKKKKKK.",
        "................"
      ],
      chest_closed: [
        "................",
        "..KKKKKKKKKKKK..",
        ".KYYYYYYYYYYYYK.",
        ".KNNNNNNNNNNNNK.",
        ".KNNNyyyyyyNNNK.",
        ".KKKKKKKKKKKKKK.",
        ".KYYYYYYYYYYYYK.",
        ".KNNNNNYYNNNNNK.",
        ".KNNNNKYYKNNNNK.",
        ".KNNNNKKKKNNNNK.",
        ".KNNNNNNNNNNNNK.",
        ".KYYYYYYYYYYYYK.",
        "..KKKKKKKKKKKK..",
        "................",
        "................",
        "................"
      ],
      scroll: [
        "....KKKKKKKK....",
        "...KYYYYYYYYK...",
        "..KYWWWWWWWWYK..",
        "..KYWKKKKKKWYK..",
        "..KYWWWWWWWWYK..",
        "..KYWKKKKKKWYK..",
        "..KYWWWWWWWWYK..",
        "..KYWKKRRKKWYK..",
        "..KYWKRWWWRWYK..",
        "..KYWKKRRKKWYK..",
        "..KYWWWWWWWWYK..",
        "...KYYYYYYYYK...",
        "....KKKKKKKK....",
        "................",
        "................",
        "................"
      ],
      herb: [
        ".......KK.......",
        "......KTTK......",
        "...KK.KTTK.KK...",
        "..KLLKKTTKKLLK..",
        ".KLLLLKTTKLLLLK.",
        ".KLLLTTTTTTLLLK.",
        "..KKKTTTTTTKKK..",
        "...KllTTTTllK...",
        "..KllllTTllllK..",
        "..KllllllKlllK..",
        "...KKK..K..KK...",
        ".......KK.......",
        "......KNNK......",
        "......KKKK......",
        "................",
        "................"
      ],
      crystal: [
        ".......KK.......",
        "......KCCK......",
        ".....KCWWCK.....",
        "..KK.KCCCCK.KK..",
        ".KPPKKCWWCKKCCK.",
        "KPWPKKCCCCKKCWCK",
        "KPPPKCCCCCCKCCCK",
        "KPPKCCCCCCCCKCCK",
        ".KPKCCCWWCCCCKK.",
        "..KCCCCCCCCCCK..",
        "..KBBBBBBBBBBK..",
        "...KKKKKKKKKK...",
        "................",
        "................",
        "................",
        "................"
      ],
      shrine_off: [
        "......KKKK......",
        ".....KGGGGK.....",
        "....KGGGGGGK....",
        "....KGGDDGGK....",
        "....KGDKKDGK....",
        "....KGDKKDGK....",
        "....KGGDDGGK....",
        "....KGGGGGGK....",
        "....KDDDDDDK....",
        "...KDDDDDDDDK...",
        "...KSSSSSSSSK...",
        "..KSSSSSSSSSSK..",
        "..KKKKKKKKKKKK..",
        "................",
        "................",
        "................"
      ],
      shrine_on: [
        "......KKKK......",
        ".....KYYYYK.....",
        "....KYCCCCYK....",
        "....KCCWWCCK....",
        "....KCWWWWCK....",
        "....KCWWWWCK....",
        "....KCCWWCCK....",
        "....KYCCCCYK....",
        "....KYYYYYYK....",
        "...KDDDDDDDDK...",
        "...KSSSSSSSSK...",
        "..KSSSSSSSSSSK..",
        "..KKKKKKKKKKKK..",
        "................",
        "................",
        "................"
      ],
      cipher_off: [
        ".....KKKKKK.....",
        "....KPPPPPPK....",
        "...KPPWWWWPPK...",
        "...KPWPPPPWPK...",
        "...KPPWWWWPPK...",
        "....KPPPPPPK....",
        ".....KKKKKK.....",
        "......KGGK......",
        "....KKGGGGKK....",
        "...KGGGGGGGGK...",
        "...KDDDDDDDDK...",
        "..KSSSSSSSSSSK..",
        "..KKKKKKKKKKKK..",
        "................",
        "................",
        "................"
      ],
      cipher_on: [
        ".....KKKKKK.....",
        "....KTTTTTTK....",
        "...KTTWWWWTTK...",
        "...KTWTTTTWTK...",
        "...KTTWWWWTTK...",
        "....KTTTTTTK....",
        ".....KKKKKK.....",
        "......KYYK......",
        "....KKYYYYKK....",
        "...KYYYYYYYYK...",
        "...KDDDDDDDDK...",
        "..KSSSSSSSSSSK..",
        "..KKKKKKKKKKKK..",
        "................",
        "................",
        "................"
      ],
      gate_locked: [
        ".KKKKKKKKKKKKKK.",
        "KDDDDDDDDDDDDDDK",
        "KDKGKKGKKGKKGKDK",
        "KDKGKKGKKGKKGKDK",
        "KDKGKKGKKGKKGKDK",
        "KDDDDDDDDDDDDDDK",
        "KDKGKKYYYYKKGKDK",
        "KDKGKYKKKKYKGKDK",
        "KDKGKYYYYYYKGKDK",
        "KDKGKYKKKKYKGKDK",
        "KDKGKKYYYYKKGKDK",
        "KDKGKKGKKGKKGKDK",
        "KDDDDDDDDDDDDDDK",
        ".KKKKKKKKKKKKKK.",
        "................",
        "................"
      ],
      portal_0: [
        "....KKKKKKKK....",
        "..KKCCCCCCCCKK..",
        ".KCCPPPPPPPPCCK.",
        ".KCPPPWWWWPPPCK.",
        "KCPPWWCCCCWWPPCK",
        "KCPWCCWWWWCCWPCK",
        "KCPWCWPPPPWCWPCK",
        "KCPWCWPWWPWCWPCK",
        "KCPWCWPPPPWCWPCK",
        "KCPWCCWWWWCCWPCK",
        "KCPPWWCCCCWWPPCK",
        ".KCPPPWWWWPPPCK.",
        ".KCCPPPPPPPPCCK.",
        "..KKCCCCCCCCKK..",
        "....KKKKKKKK....",
        "................"
      ],
      portal_1: [
        "....KKKKKKKK....",
        "..KKPPPPPPPPKK..",
        ".KPPCCCCCCCCPPK.",
        ".KPCCCWWWWCCCPK.",
        "KPCCWWPPPPWWCCPK",
        "KPCWPPWWWWPPWCPK",
        "KPCWPWCCCCWPWCPK",
        "KPCWPWCWWCWPWCPK",
        "KPCWPWCCCCWPWCPK",
        "KPCWPPWWWWPPWCPK",
        "KPCCWWPPPPWWCCPK",
        ".KPCCCWWWWCCCPK.",
        ".KPPCCCCCCCCPPK.",
        "..KKPPPPPPPPKK..",
        "....KKKKKKKK....",
        "................"
      ],
      stairs_next: [
        ".KKKKKKKKKKKKKK.",
        "KDDDDDDDDDDDDDDK",
        "KDSSSSSSSSSSSSDK",
        "KDSYYYYYYYYYYSDK",
        "KDSYKKKKKKKKYSDK",
        "KDSYKTTTTTTKYSDK",
        "KDSYKTWWWWWTYSDK",
        "KDSYKTTWWTTKYSDK",
        "KDSYKKTTTTKKYSDK",
        "KDSYKKKKTKKKYSDK",
        "KDSYYYYYYYYYYSDK",
        "KDSSSSSSSSSSSSDK",
        "KDDDDDDDDDDDDDDK",
        ".KKKKKKKKKKKKKK.",
        "................",
        "................"
      ],
      stairs_prev: [
        ".KKKKKKKKKKKKKK.",
        "KDDDDDDDDDDDDDDK",
        "KDSSSSSSSSSSSSDK",
        "KDSCCCCCCCCCCSDK",
        "KDSCKKKKKKKKCSDK",
        "KDSCKKKKKCKKCSDK",
        "KDSCKKKKCCCKCSDK",
        "KDSCKKCCWWCCCSDK",
        "KDSCKCWWWWWWCSDK",
        "KDSCKCCCCCCCCSDK",
        "KDSCCCCCCCCCCSDK",
        "KDSSSSSSSSSSSSDK",
        "KDDDDDDDDDDDDDDK",
        ".KKKKKKKKKKKKKK.",
        "................",
        "................"
      ],
      mystery: [
        "....KKKKKKKK....",
        "...KPPPPPPPPK...",
        "..KPPYYYYYYPPK..",
        "..KPYWWWWWYYPK..",
        "..KPYWKKKKWYPK..",
        "..KPPPK..KWYPK..",
        "...KPP..KWYPK...",
        ".......KWYPK....",
        ".......KYYPK....",
        ".......KKKK.....",
        ".......KYYK.....",
        "......KWWWWK....",
        "......KYYYYK....",
        ".......KKKK.....",
        "................",
        "................"
      ],
      quest_marker: [
        ".....KKKKKK.....",
        "....KYYYYYYK....",
        "....KYWWWWYK....",
        "....KYWWWWYK....",
        "....KYWWWWYK....",
        "....KYYYYYYK....",
        ".....KYYYYK.....",
        ".....KYYYYK.....",
        "......KKKK......",
        "................",
        ".....KKKKKK.....",
        "....KYYYYYYK....",
        "....KYWWWWYK....",
        "....KYYYYYYK....",
        ".....KKKKKK.....",
        "................"
      ],

      npc_elder: [
        "....KKKKKK......",
        "...KWWWWWWK.....",
        "..KWWWWWWWWK..K.",
        "..KFFKFFKFFK.KYK",
        "..KFFFFFFFFK.KYK",
        "..KWWWWWWWWK.KNN",
        "...KWWWWWWK..KNN",
        "..KLLLLLLLLK.KNN",
        ".KLLYYYYYYLLKKNN",
        ".KLLLLLLLLLLK.K.",
        "..KLLLLLLLLK....",
        "..KllllllllK....",
        "...KNN..NNK.....",
        "..KKKK..KKKK....",
        "................",
        "................"
      ],
      npc_scholar: [
        "....KKKKKK......",
        "...KNNNNNNK.....",
        "..KNNNNNNNNK....",
        "..KCKKFFKCKK....",
        "..KFFFFFFFFK....",
        "...KCCCCCCK.....",
        "..KCCCCCCCCK.KK.",
        ".KCCBBBBBBCCKYYK",
        ".KCCBBBBBBCCKWWK",
        "..KBBBBBBBBK.KK.",
        "..KBBBBBBBBK....",
        "..KbbbbbbbbK....",
        "...KNN..NNK.....",
        "..KKKK..KKKK....",
        "................",
        "................"
      ],
      npc_dwarf: [
        "..KK..KKKK..KK..",
        ".KGGKKGGGGKKGGK.",
        "..KGGGGGGGGGGK..",
        "...KFFKFFKFFK...",
        "..KOOOOOOOOOOK..",
        ".KOOOOOOOOOOOOK.",
        ".KOOOOOOOOOOOOK.",
        "..KRRRRRRRRRRK..",
        ".KRRGGGGGGGGRRK.",
        ".KRRGGGGGGGGRRK.",
        "..KNNNNNNNNNNK..",
        "...KNNK..KNNK...",
        "..KKKK....KKKK..",
        "................",
        "................",
        "................"
      ],
      npc_mage: [
        "......KKKK......",
        ".....KPPPPK.....",
        "....KPPPPPPK....",
        "..KKPPPPPPPPKK..",
        ".KYYYYYYYYYYYYK.",
        "..KCCCCCCCCCCK..",
        "..KCCKWWKWWCCK..",
        "...KCCCCCCCCK...",
        "..KPPPPPPPPPPK..",
        ".KPPYPPPPPPYPPK.",
        ".KPPPPPPPPPPPPK.",
        "..KPPPPPPPPPPK..",
        "...KCCCCCCCCK...",
        "....KKKKKKKK....",
        "................",
        "................"
      ],
      npc_goddess: [
        ".....KKKKKK.....",
        "....KYYYYYYK....",
        "...KYWWWWWWYK...",
        ".KKKFFKFFKFFKKK.",
        "KWWKFFFFFFFFKWWK",
        "KWWYTTTTTTTTYWWK",
        ".KKYTTTTTTTTYKK.",
        "..KYTTTTTTTTYK..",
        "..KTTTTTTTTTTK..",
        "..KTTWWWWWWTTK..",
        "...KTTTTTTTTK...",
        "...KWWWWWWWWK...",
        "....KKKKKKKK....",
        "................",
        "................",
        "................"
      ],

      enemy_wolf: [
        "..KK.......KK...",
        ".KDDK.....KDDK..",
        ".KDDDKKKKKDDDK..",
        "KDDDDDDDDDDDDDK.",
        "KDDRRDDDDDRRDDK.",
        "KDDDDDDDDDDDDDK.",
        ".KDDDDDDDDDDDK..",
        "..KWWKWWWKWWK...",
        "...KKKKKKKKK....",
        "..KDDDDDDDDDK...",
        ".KDDDDDDDDDDDK..",
        ".KDDDDDDDDDDDK..",
        "..KDDK...KDDK...",
        "..KKKK...KKKK...",
        "................",
        "................"
      ],
      enemy_treant: [
        "..KKKK....KKKK..",
        ".KllllKKKKllllK.",
        "KllllllllllllllK",
        "KlllKKKKKKKKlllK",
        ".KKKNNNNNNNNKKK.",
        "..KNNRNNNNRNNK..",
        "..KNNNNNNNNNNK..",
        ".KNNNNKKKKNNNNK.",
        "KNNNNKPPPPKNNNNK",
        "KNNNNNKKKKNNNNNK",
        ".KNNNNNNNNNNNNK.",
        "..KNNNKKKKNNNK..",
        ".KNNNK....KNNNK.",
        ".KKKK......KKKK.",
        "................",
        "................"
      ],
      boss_behemoth: [
        "K..KK......KK..K",
        "KKKPPK....KPPKKK",
        ".KPPPPK..KPPPPK.",
        "..KPPPKKKKPPPK..",
        "..KNNNNNNNNNNK..",
        ".KNNRRNNNNRRNNK.",
        ".KNNNNNNNNNNNNK.",
        "..KNNNYYYYNNNK..",
        ".KllllNNNNllllK.",
        "KlllllPPPPlllllK",
        "KllllPWWWWPllllK",
        "KlllllPPPPlllllK",
        ".KllllllllllllK.",
        "..KNNK....KNNK..",
        ".KKKK......KKKK.",
        "................"
      ],
      enemy_sentinel: [
        ".....KKKKKK.....",
        "....KyyyyyyK....",
        "...KyYYYYYYyK...",
        "...KyKKKKKKyK...",
        "...KyKCCCCKyK...",
        "...KyYYYYYYyK...",
        "..KKyyyyyyyyKK..",
        ".KyyGGGGGGGGyyK.",
        ".KyyGYYYYYYGyyK.",
        ".KyyGGGGGGGGyyK.",
        "..KKGGGGGGGGKK..",
        "...KyyK..KyyK...",
        "..KKKK....KKKK..",
        "................",
        "................",
        "................"
      ],
      enemy_siren: [
        "....KKKKKKKK....",
        "...KCCCCCCCCK...",
        "..KCCBBBBBBCCK..",
        ".KTCBFRFFRFBCTK.",
        ".KTCBFFFFFFBCTK.",
        "..KKKTTTTTTKKK..",
        "..KTTTTTTTTTTK..",
        ".KTTCCCCCCCCTTK.",
        "..KCCCCCCCCCCK..",
        "...KBBBBBBBBK...",
        "....KBBBBBBK....",
        "...KCCCCCCCCK...",
        "..KCCK....KCCK..",
        "..KKK......KKK..",
        "................",
        "................"
      ],
      boss_chronos: [
        "..KK..KKKK..KK..",
        ".KYYKKYYYYKKYYK.",
        ".KYYYYWWWWYYYYK.",
        "..KYYKRRRRKYYK..",
        ".KyyyyyyyyyyyyK.",
        "KyyYYCCCCCCYYyyK",
        "KyyYCWKWWKWCYyyK",
        "KyyYCWKKKKWCYyyK",
        "KyyYYCCCCCCYYyyK",
        ".KyyyyyyyyyyyyK.",
        "..KYYYYYYYYYYK..",
        "..KyyK....KyyK..",
        ".KYYY......YYYK.",
        ".KKKK......KKKK.",
        "................",
        "................"
      ],
      enemy_golem: [
        "....KKKKKKKK....",
        "...KSSSSSSSSK...",
        "..KSSOOOOOOSSK..",
        ".KSSOKYYYYKOSSK.",
        ".KSSSSSSSSSSSSK.",
        "KSSSOOOOOOOOSSSK",
        "KSSSOYYYYYYOSSSK",
        "KSSSOOOOOOOOSSSK",
        ".KSSSSSSSSSSSSK.",
        "..KSSSSSSSSSSK..",
        "..KSSSK..KSSSK..",
        ".KSSSK....KSSSK.",
        ".KKKK......KKKK.",
        "................",
        "................",
        "................"
      ],
      enemy_drake: [
        ".KK..........KK.",
        "KOO..KKKKKK..OOK",
        "KOOKKRRRRRRKKOOK",
        "KOOORRYKKYRROOOK",
        ".KOORRRRRRRROOK.",
        "..KRRRRRRRRRRK..",
        "..KRRYYYYYYRRK..",
        "...KRRRRRRRRK...",
        "...KRRYYYYRRK...",
        "....KRRRRRRK....",
        "...KRRK..KRRK...",
        "..KKKK....KKKK..",
        "................",
        "................",
        "................",
        "................"
      ],
      boss_ignis: [
        "K..KK......KK..K",
        "KKKYYK....KYYKKK",
        "KOORRRRRRRRRROOK",
        "KOORRYYYYYYRROOK",
        "KORRRYKKKKYRRROK",
        "KORRRRRRRRRRRROK",
        ".KRRRRWWWWWRRRK.",
        "..KRRROOOORRRK..",
        ".KRRRRYYYYRRRRK.",
        "KRRRRYYYYYYRRRRK",
        "KRRRRROOOORRRRRK",
        ".KRRRRRRRRRRRRK.",
        "..KRRRK..KRRRK..",
        ".KKKKK....KKKKK.",
        "................",
        "................"
      ],
      enemy_wraith: [
        "....KKKKKKKK....",
        "...KppppppppK...",
        "..KppKKKKKKppK..",
        "..KpKKCCCCKKpK..",
        "..KpKCCCCCCKpK..",
        "..KppKKKKKKppK..",
        ".KppppppppppppK.",
        ".KppCCCCCCCCppK.",
        "..KppppppppppK..",
        "...KppppppppK...",
        "....KppK.KppK...",
        "...KppK...KppK..",
        "....KK.....KK...",
        "................",
        "................",
        "................"
      ],
      enemy_inquisitor: [
        ".....KKKKKK.....",
        "....KWWWWWWK....",
        "...KWWPPPPWWK...",
        "...KWWKKKKWWK...",
        "...KWWYYYYWWK...",
        "..KKWWWWWWWWKK..",
        ".KWWPPPPPPPPWWK.",
        ".KWWPYYYYYYPWWK.",
        ".KWWPPPPPPPPWWK.",
        "..KKWWWWWWWWKK..",
        "...KWWK..KWWK...",
        "..KKKK....KKKK..",
        "................",
        "................",
        "................",
        "................"
      ],
      boss_astra: [
        ".KKKK......KKKK.",
        "KCCCCK.KK.KCCCCK",
        "KCPPPCKYYKCPPPCA".replace("A", "K"),
        "KCPPWYYYYYYWPPCA".replace("A", "K"),
        ".KCPWFFFFFFWPCA.".replace("A", "K"),
        "..KCWFRFFRFWCK..",
        "..KCCPPPPPPCCK..",
        ".KCPPPWWWWPPPCK.",
        "KCPPPWCCCCWPPPCK",
        "KCPPPWWWWWWPPPCK",
        ".KKKPPPPPPPPKKK.",
        "....KPPPPPPK....",
        "...KCCK..KCCK...",
        "...KKK....KKK...",
        "................",
        "................"
      ],
      enemy_templar: [
        "....KKKKKKKK....",
        "...KSSSSSSSSK...",
        "..KSSRRRRRRSSK..",
        "..KSSKYYYYKSSK..",
        "..KSSSSSSSSSSK..",
        ".KSSRRRRRRRRSSK.",
        ".KSSRSSSSSSRSSK.",
        ".KSSRRRRRRRRSSK.",
        "..KSSSSSSSSSSK..",
        "...KSSK..KSSK...",
        "..KKKK....KKKK..",
        "................",
        "................",
        "................",
        "................",
        "................"
      ],
      boss_moebius: [
        "...KKKKKKKKKK...",
        ".KKYYYYYYYYYYKK.",
        "KYYPPPPPPPPPPYYK",
        "KYPCCCCCCCCCCPYK",
        "KYPCWWWWWWWWCPYK",
        "KYPCWWRRRRWWCPYK",
        "KYPCWRKKKKRWCPYK",
        "KYPCWRKYYKRWCPYK",
        "KYPCWRKKKKRWCPYK",
        "KYPCWWRRRRWWCPYK",
        "KYPCWWWWWWWWCPYK",
        "KYPCCCCCCCCCCPYK",
        "KYYPPPPPPPPPPYYK",
        ".KKYYYYYYYYYYKK.",
        "...KKKKKKKKKK...",
        "................"
      ],

      icon_hp: [
        "................",
        "..KKKK....KKKK..",
        ".KRRRRK..KRRRRK.",
        "KRRWWRRKKRRRRRRK",
        "KRRWWRRRRRRRRRRK",
        "KRRRRRRRRRRRRRRK",
        "KRRRRRRRRRRRRRRK",
        ".KRRRRRRRRRRRRK.",
        "..KRRRRRRRRRRK..",
        "...KRRRRRRRRK...",
        "....KRRRRRRK....",
        ".....KRRRRK.....",
        "......KRRK......",
        ".......KK.......",
        "................",
        "................"
      ],
      icon_mp: [
        ".......KK.......",
        "......KCCK......",
        ".....KCCCCK.....",
        "....KCCWWCCK....",
        "....KCCWWCCK....",
        "...KCCCCCCCCK...",
        "..KCCWWCCCCCCK..",
        "..KCCWWCCCCCCK..",
        "..KCCCCCCCCCCK..",
        "..KCCCCCCCCCCK..",
        "...KBBBBBBBBK...",
        "....KKKKKKKK....",
        "................",
        "................",
        "................",
        "................"
      ],
      icon_burst: [
        ".......KK.......",
        "......KYYK......",
        "......KYYK......",
        "..KKKKYWWYKKKK..",
        ".KYYYYWWWWYYYYK.",
        "..KYYWWWWWWYYK..",
        "...KYWWWWWWYK...",
        "...KYYWWWWYYK...",
        "..KYYYYYYYYYYK..",
        "..KYK..KK..KYK..",
        ".KK..........KK.",
        "................",
        "................",
        "................",
        "................",
        "................"
      ],
      icon_atk: [
        "............KKK.",
        "...........KWWWK",
        "..........KGGGGK",
        ".........KGGGGK.",
        "........KGGGGK..",
        ".......KGGGGK...",
        "...KK.KGGGGK....",
        "..KYYKGGGGK.....",
        "...KYYYYYK......",
        "....KYYYK.......",
        "...KNNKYYK......",
        "..KNNK..KK......",
        ".KYYK...........",
        ".KKK............",
        "................",
        "................"
      ],
      icon_def: [
        "..KKKKKKKKKKKK..",
        ".KYYYYYYYYYYYYK.",
        ".KYCCCCCCCCCCYK.",
        ".KYCCWWWWWWCCYK.",
        ".KYCCBBBBBBCCYK.",
        ".KYCCBBBBBBCCYK.",
        ".KYCCBBBBBBCCYK.",
        "..KYCBBBBBBCYK..",
        "..KYCCCCCCCCYK..",
        "...KYCCCCCCYK...",
        "....KYYYYYYK....",
        ".....KYYYYK.....",
        "......KKKK......",
        "................",
        "................",
        "................"
      ],
      icon_gold: [
        "....KKKKKKKK....",
        "..KKYYYYYYYYKK..",
        ".KYYWWWWWWWWYYK.",
        "KYYWYYYYYYYYWYYK",
        "KYWYKKKKKKKKYWYK",
        "KYWYKYYYYYYKYWYK",
        "KYWYKYYYYYYKYWYK",
        "KYWYKYYYYYYKYWYK",
        "KYWYKKKKKKKKYWYK",
        "KYYWYYYYYYYYWYYK",
        ".KYYyyyyyyyyYYK.",
        "..KKYYYYYYYYKK..",
        "....KKKKKKKK....",
        "................",
        "................",
        "................"
      ],
      icon_potion_red: [
        ".....KKKKKK.....",
        "....KNNNNNNK....",
        ".....KWWWWK.....",
        ".....KWWWWK.....",
        "...KKWWWWWWKK...",
        "..KWWKRRRRKWWK..",
        ".KWWRRRRRRRRWWK.",
        ".KWRRRWWRRRRRWK.",
        ".KWRRRWWRRRRRWK.",
        ".KWRRRRRRRRRRWK.",
        "..KWRRRRRRRRWK..",
        "...KKKKKKKKKK...",
        "................",
        "................",
        "................",
        "................"
      ],
      icon_potion_blue: [
        ".....KKKKKK.....",
        "....KNNNNNNK....",
        ".....KWWWWK.....",
        ".....KWWWWK.....",
        "...KKWWWWWWKK...",
        "..KWWKCCCCKWWK..",
        ".KWWCCCCCCCCWWK.",
        ".KWCCCWWCCCCCWK.",
        ".KWCCCWWCCCCCWK.",
        ".KWCCCCCCCCCCWK.",
        "..KWBBBBBBBBWK..",
        "...KKKKKKKKKK...",
        "................",
        "................",
        "................",
        "................"
      ],
      icon_bomb: [
        "..........KKK...",
        ".........KOOOK..",
        "........KNNK....",
        ".....KKKKKK.....",
        "...KKDDDDDDKK...",
        "..KDDSSSSSSDDK..",
        ".KDDSWWSSSSSSDK.",
        ".KDDSWWSSSSSSDK.",
        ".KDDSSSSSSSSSDK.",
        ".KDDSSSSSSSSSDK.",
        "..KDDDDDDDDDDK..",
        "...KKKKKKKKKK...",
        "................",
        "................",
        "................",
        "................"
      ],
      icon_gear: [
        ".....KK..KK.....",
        "..KK.KyyyyK.KK..",
        ".KyyKKyyyyKKyyK.",
        "..KyyyyyyyyyyK..",
        ".KyyyYYYYYYyyyK.",
        "KyyyYYKKKKYYyyyK",
        "KyyyYK....KYyyyK",
        "KyyyYK....KYyyyK",
        "KyyyYYKKKKYYyyyK",
        ".KyyyYYYYYYyyyK.",
        "..KyyyyyyyyyyK..",
        ".KyyKKyyyyKKyyK.",
        "..KK.KyyyyK.KK..",
        ".....KK..KK.....",
        "................",
        "................"
      ],
      icon_key: [
        "....KKKKKKKK....",
        "...KYYYYYYYYK...",
        "..KYYKKKKKKYYK..",
        "..KYYK....KYYK..",
        "..KYYKKKKKKYYK..",
        "...KYYYYYYYYK...",
        ".....KYYYYK.....",
        ".....KYYYYK.....",
        ".....KYYYYKKK...",
        ".....KYYYYYYK...",
        ".....KYYYYK.....",
        ".....KYYYYKKKK..",
        ".....KYYYYYYYK..",
        "......KKKKKKK...",
        "................",
        "................"
      ],
      trap_spike: [
        "................",
        "................",
        "...K...KK...K...",
        "..KRK.KRRK.KRK..",
        "..KRK.KRRK.KRK..",
        ".KRRRKRRRRKRRRK.",
        ".KRYYKRYRYKRYYK.",
        "KRRRRRRRRRRRRRRK",
        "KDDDDDDDDDDDDDDK",
        ".KKKKKKKKKKKKKK.",
        "..K..K....K..K..",
        ".KRK.KR..RK.KRK.",
        ".KRRKRRRRRRKRRK.",
        "KDDDDDDDDDDDDDDK",
        "KKKKKKKKKKKKKKKK",
        "................"
      ],
      secret_wall: [
        "KKKKKKKKKKKKKKKK",
        "KDDDDDKCCKDDDDDK",
        "KDDDDKCWWCKDDDDK",
        "KDDDKCWWWWCKDDDK",
        "KKKKKKKKCKKKKKKK",
        "KDDDDDDKCKDDDDDK",
        "KDDDDDKCWCKDDDDK",
        "KDDDDKCWWWCKDDDK",
        "KKKKKKCWWWCKKKKK",
        "KDDDDKCWWCKDDDDK",
        "KDDDDDKCCKDDDDDK",
        "KDDDDDDKKDDDDDDK",
        "KDDDDDDKCKDDDDDK",
        "KDDDDDKCWCKDDDDK",
        "KDDDDDDKCKDDDDDK",
        "KKKKKKKKKKKKKKKK"
      ],
      fountain: [
        "......KKKK......",
        "....KKCCCCKK....",
        "...KCWWWWWWCK...",
        "..KCWWTTTTWWCK..",
        "..KCTTYYYYTTCK..",
        "...KCCCCCCCCK...",
        ".....KCCCCK.....",
        "..KKKCCCCCCKKK..",
        ".KDDDDDDDDDDDDK.",
        "KDDCCCCCCCCCCDDK",
        "KDCCWWWWWWWWCCDK",
        "KDCCTTTTTTTTCCDK",
        "KDDDDDDDDDDDDDDK",
        ".KKKKKKKKKKKKKK.",
        "................",
        "................"
      ],
      obelisk_trial: [
        ".......KK.......",
        "......KPPK......",
        ".....KPWWPK.....",
        "....KPPYYPPK....",
        "....KPPPPPPK....",
        "...KPPCCCCPPK...",
        "...KPPCTTCppK...",
        "...KPPCCCCPPK...",
        "..KPPPPPPPPPPK..",
        "..KPPYYYYYYPPK..",
        "..KPPPPPPPPPPK..",
        ".KDDDDDDDDDDDDK.",
        "KDDDDDDDDDDDDDDK",
        "KKKKKKKKKKKKKKKK",
        "................",
        "................"
      ],
      warp_pad: [
        "....KKKKKKKK....",
        "..KKCCCCCCCCKK..",
        ".KCCWWWWWWWWCCK.",
        ".KCWPPPPPPPPWCK.",
        "KCWPPYYYYYYPPWCK",
        "KCWPYCCCCCCYPWCK",
        "KCWPYCWWWWCYPWCK",
        "KCWPYCWWWWCYPWCK",
        "KCWPYCCCCCCYPWCK",
        "KCWPPYYYYYYPPWCK",
        ".KCWPPPPPPPPWCK.",
        ".KCCWWWWWWWWCCK.",
        "..KKCCCCCCCCKK..",
        "....KKKKKKKK....",
        "................",
        "................"
      ],
      ancient_reliquary: [
        "....KKKKKKKK....",
        "...KYYYYYYYYK...",
        "..KYYCCCCCCYYK..",
        ".KYYCWWWWWWCYYK.",
        "KYYCWPPPPPPWCYYK",
        "KYGGGGGGGGGGGGYK",
        "KYGDDDDDDDDDDGYK",
        "KYGDYYYYYYYYDGYK",
        "KYGDYCCCCCCYDGYK",
        "KYGDYYYYYYYYDGYK",
        "KYGDDDDDDDDDDGYK",
        "KYGGGGGGGGGGGGYK",
        ".KKKKKKKKKKKKKK.",
        "................",
        "................",
        "................"
      ]
    };
  }

  getDataUrl(spriteKey) {
    const key = this.sprites[spriteKey] ? spriteKey : "icon_burst";
    if (this.cache[key]) return this.cache[key];
    if (typeof document === "undefined") return "";

    const c = document.createElement("canvas");
    c.width = 16;
    c.height = 16;
    const ctx = c.getContext("2d");
    const matrix = this.sprites[key];

    for (let y = 0; y < 16; y++) {
      const row = matrix[y] || "................";
      for (let x = 0; x < 16; x++) {
        const ch = row[x];
        const color = this.palette[ch];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    const url = c.toDataURL("image/png");
    this.cache[key] = url;
    return url;
  }

  icon(spriteKey, size = 18) {
    const url = this.getDataUrl(spriteKey);
    if (!url) return "";
    return `<img class="px-icon" src="${url}" width="${size}" height="${size}" alt="" />`;
  }

  // 光影處理：自動邊緣高光、暗部、垂直漸層與外描邊，讓 16x16 精靈更立體
  shadeHex(hex, f) {
    const n = parseInt(hex.slice(1), 16);
    const c = v => Math.max(0, Math.min(255, Math.round(v * f)));
    return [c((n >> 16) & 255), c((n >> 8) & 255), c(n & 255)];
  }

  getProcessedSprite(key) {
    if (this.procCache && this.procCache[key]) return this.procCache[key];
    if (typeof document === "undefined") return null;
    const matrix = this.sprites[key];
    if (!matrix) return null;
    const S = 18; // 外圍留 1px 供描邊
    const c = document.createElement("canvas");
    if (!c || typeof c.getContext !== "function") return null;
    c.width = S;
    c.height = S;
    const ctx = c.getContext("2d");
    if (!ctx || typeof ctx.getImageData !== "function" || typeof ctx.putImageData !== "function") return null;
    const img = ctx.createImageData ? ctx.createImageData(S, S) : null;
    if (!img || !img.data) return null;
    const data = img.data;
    const solid = (x, y) => x >= 0 && y >= 0 && x < 16 && y < 16 && !!this.palette[(matrix[y] || "")[x]];
    const isK = (x, y) => (matrix[y] || "")[x] === "K";
    const put = (x, y, rgb, a = 255) => {
      const i = ((y + 1) * S + (x + 1)) * 4;
      data[i] = rgb[0]; data[i + 1] = rgb[1]; data[i + 2] = rgb[2]; data[i + 3] = a;
    };
    for (let y = -1; y <= 16; y++) {
      for (let x = -1; x <= 16; x++) {
        if (solid(x, y)) {
          const base = this.palette[matrix[y][x]];
          let f = 1.1 - (y / 15) * 0.2;
          if (!isK(x, y)) {
            if (!solid(x, y - 1)) f *= 1.22;
            if (!solid(x - 1, y)) f *= 1.08;
            if (!solid(x, y + 1)) f *= 0.8;
            if (!solid(x + 1, y)) f *= 0.84;
          }
          put(x, y, this.shadeHex(base, f));
        } else if (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1)) {
          const nk = (solid(x - 1, y) && !isK(x - 1, y)) || (solid(x + 1, y) && !isK(x + 1, y)) || (solid(x, y - 1) && !isK(x, y - 1)) || (solid(x, y + 1) && !isK(x, y + 1));
          if (nk) put(x, y, [8, 12, 22], 230);
        }
      }
    }
    ctx.putImageData(img, 0, 0);
    this.procCache = this.procCache || {};
    this.procCache[key] = c;
    return c;
  }

  drawSprite(ctx, spriteKey, px, py, size = 34) {
    const key = this.sprites[spriteKey] ? spriteKey : "icon_burst";
    const matrix = this.sprites[key];
    if (!matrix) return;

    try {
      const proc = typeof ctx.drawImage === "function" ? this.getProcessedSprite(key) : null;
      if (proc) {
        const prevSmooth = ctx.imageSmoothingEnabled;
        ctx.imageSmoothingEnabled = false;
        const sc = size / 16;
        ctx.drawImage(proc, Math.floor(px - sc), Math.floor(py - sc), Math.ceil(sc * 18), Math.ceil(sc * 18));
        ctx.imageSmoothingEnabled = prevSmooth;
        return;
      }
    } catch (e) {
      // 退回原始逐格繪製
    }

    const scale = size / 16;
    for (let y = 0; y < 16; y++) {
      const row = matrix[y] || "................";
      for (let x = 0; x < 16; x++) {
        const ch = row[x];
        const color = this.palette[ch];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(
            Math.floor(px + x * scale),
            Math.floor(py + y * scale),
            Math.ceil(scale),
            Math.ceil(scale)
          );
        }
      }
    }
  }

  // ==================== 2D 日景地形 (v5.0 全新美術) ====================
  hash2(x, y, k = 0) {
    let h = (x * 374761393 + y * 668265263 + k * 2147483647) | 0;
    h = (h ^ (h >> 13)) * 1274126177;
    h = h ^ (h >> 16);
    return (h >>> 0) % 1000 / 1000;
  }

  tint(hex, f) {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.max(0, Math.min(255, Math.round(((n >> 16) & 255) * f)));
    const g = Math.max(0, Math.min(255, Math.round(((n >> 8) & 255) * f)));
    const b = Math.max(0, Math.min(255, Math.round((n & 255) * f)));
    return `rgb(${r},${g},${b})`;
  }

  getBiome2D(chapter) {
    const T = {
      1: { ground: "#5c9b3f", groundAlt: "#68aa46", dark: "#3f7a2e", fleck: ["#9be07a", "#fde047", "#f9a8d4", "#ffffff"], water: "#1f8fb8", waterHi: "#a5e8f5", wall: "#1f6b34", wallHi: "#6ee08a", trunk: "#6b4423", shadow: "rgba(10,40,10,0.35)" },
      2: { ground: "#e3d3a0", groundAlt: "#ecdcab", dark: "#bba777", fleck: ["#ffffff", "#f5c6a5", "#c9b27a"], water: "#14a5c9", waterHi: "#c9f5ff", wall: "#6d8aa3", wallHi: "#d8e6f0", trunk: "#8b5a2b", shadow: "rgba(30,50,60,0.3)" },
      3: { ground: "#b06c3f", groundAlt: "#bb7846", dark: "#7e4626", fleck: ["#e8a25f", "#5b2c14", "#fb923c"], water: "#e8590c", waterHi: "#ffe066", wall: "#5b3a2a", wallHi: "#b4805a", trunk: "#3a2216", shadow: "rgba(50,15,5,0.4)" },
      4: { ground: "#e8f1f8", groundAlt: "#d8e6f2", dark: "#aac2d8", fleck: ["#ffffff", "#9fd2f2", "#c7dff0"], water: "#4aa3e8", waterHi: "#e0f4ff", wall: "#2f6f55", wallHi: "#eaf6ff", trunk: "#6b4423", shadow: "rgba(30,60,100,0.3)" },
      5: { ground: "#64405a", groundAlt: "#70486a", dark: "#46293f", fleck: ["#f472b6", "#fcd34d", "#c084fc"], water: "#9f1239", waterHi: "#fda4af", wall: "#7c3aed", wallHi: "#e9d5ff", trunk: "#3b1d4a", shadow: "rgba(30,5,40,0.4)" }
    };
    return T[chapter] || T[1];
  }

  hexRGB(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  vnoise(u, v, k) {
    const x0 = Math.floor(u), y0 = Math.floor(v);
    const fx = u - x0, fy = v - y0;
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const a = this.hash2(x0, y0, k), b = this.hash2(x0 + 1, y0, k);
    const c = this.hash2(x0, y0 + 1, k), d = this.hash2(x0 + 1, y0 + 1, k);
    return (a + (b - a) * sx) + ((c + (d - c) * sx) - (a + (b - a) * sx)) * sy;
  }

  // 平滑自然地表（雜訊跨格連續）+ 草葉，結果快取為離屏畫布
  groundTile(ctx, th, x, y, px, py, ts, chapter) {
    const T = Math.max(8, Math.round(ts));
    const key = `${chapter}:${x},${y}:${T}`;
    this.groundCache = this.groundCache || new Map();
    if (this.groundCache.size > 2500) this.groundCache.clear(); // 避免視窗縮放或跨章節累積過多快取
    let cv = this.groundCache.get(key);
    if (!cv && typeof document !== "undefined") {
      try {
        const c = document.createElement("canvas");
        c.width = T; c.height = T;
        const g = c.getContext("2d");
        const img = g.createImageData(T, T);
        const A = this.hexRGB(th.ground), B = this.hexRGB(th.groundAlt), D = this.hexRGB(th.dark);
        for (let j = 0; j < T; j++) {
          for (let i = 0; i < T; i++) {
            const u = x + i / T, v = y + j / T;
            const n1 = this.vnoise(u * 2.2, v * 2.2, 11);
            const n2 = this.vnoise(u * 7, v * 7, 23);
            const n3 = this.vnoise(u * 18, v * 18, 37);
            const m = Math.min(1, Math.max(0, n1 * 0.7 + n2 * 0.3));
            const dark = Math.max(0, n3 - 0.62) * 0.9;
            const o = (j * T + i) * 4;
            for (let k = 0; k < 3; k++) {
              let val = A[k] + (B[k] - A[k]) * m;
              val = val * (0.93 + n2 * 0.12) + (D[k] - val) * dark;
              img.data[o + k] = val;
            }
            img.data[o + 3] = 255;
          }
        }
        g.putImageData(img, 0, 0);
        // 草葉 / 地表細節線條
        const blades = chapter === 1 ? 16 : chapter === 2 ? 5 : chapter === 3 ? 6 : chapter === 4 ? 6 : 8;
        for (let q = 0; q < blades; q++) {
          const bx = this.hash2(x, y, 50 + q) * T, by = this.hash2(x, y, 80 + q) * T;
          const hh = T * (0.08 + this.hash2(x, y, 110 + q) * 0.1);
          const lean = (this.hash2(x, y, 140 + q) - 0.5) * T * 0.08;
          const light = this.hash2(x, y, 170 + q) > 0.5;
          if (chapter === 1) g.strokeStyle = light ? "rgba(190,245,150,0.75)" : "rgba(30,90,30,0.55)";
          else if (chapter === 2) g.strokeStyle = light ? "rgba(255,255,255,0.6)" : "rgba(150,125,80,0.5)";
          else if (chapter === 3) g.strokeStyle = light ? "rgba(240,170,100,0.55)" : "rgba(70,30,12,0.5)";
          else if (chapter === 4) g.strokeStyle = light ? "rgba(255,255,255,0.8)" : "rgba(120,160,200,0.5)";
          else g.strokeStyle = light ? "rgba(244,114,182,0.55)" : "rgba(30,10,30,0.5)";
          g.lineWidth = Math.max(1, T * 0.03);
          g.beginPath(); g.moveTo(bx, by); g.lineTo(bx + lean, by - hh); g.stroke();
        }
        this.groundCache.set(key, c);
        cv = c;
      } catch (e) {
        cv = null;
      }
    }
    if (cv) {
      ctx.drawImage(cv, Math.floor(px), Math.floor(py), Math.ceil(ts), Math.ceil(ts));
      return;
    }
    const sub = ts / 4;
    for (let sy = 0; sy < 4; sy++) {
      for (let sx = 0; sx < 4; sx++) {
        const n = this.hash2(x * 4 + sx, y * 4 + sy);
        ctx.fillStyle = this.tint(n > 0.5 ? th.groundAlt : th.ground, 0.93 + n * 0.14);
        ctx.fillRect(Math.floor(px + sx * sub), Math.floor(py + sy * sub), Math.ceil(sub), Math.ceil(sub));
      }
    }
  }

  drawTerrainTile(ctx, tileType, chapter, x, y, px, py, ts, animFrame, nb) {
    const p = ts / 16;
    const th = this.getBiome2D(chapter);
    const h1 = this.hash2(x, y, 1);
    const h2 = this.hash2(x, y, 2);
    const h3 = this.hash2(x, y, 3);
    const sway = Math.sin(animFrame * 0.05 + x * 0.9 + y * 0.6);
    nb = nb || {};

    // ---------------- 水 / 熔岩 / 虛空流 ----------------
    if (tileType === "~") {
      const t = animFrame * 0.06;
      const g = ctx.createLinearGradient(px, py, px, py + ts);
      g.addColorStop(0, this.tint(th.water, 1.12));
      g.addColorStop(1, this.tint(th.water, 0.8));
      ctx.fillStyle = g;
      ctx.fillRect(px, py, ts, ts);
      ctx.fillStyle = th.waterHi;
      ctx.globalAlpha = 0.55;
      for (let i = 0; i < 3; i++) {
        const wy = py + ((i * 5.3 + t * 3 + h1 * 9) % 14) * p + p;
        const wx = px + ((i * 7 + h2 * 8 + Math.sin(t + i) * 2) % 10) * p;
        ctx.fillRect(wx, wy, p * (3 + i), p * 0.9);
      }
      ctx.globalAlpha = 1;
      // 岸邊泡沫
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      if (nb.n && nb.n !== "~") ctx.fillRect(px, py, ts, p * 1.3);
      if (nb.w && nb.w !== "~") ctx.fillRect(px, py, p * 1.3, ts);
      if (nb.e && nb.e !== "~") ctx.fillRect(px + ts - p * 1.3, py, p * 1.3, ts);
      if (nb.s && nb.s !== "~") ctx.fillRect(px, py + ts - p * 1.3, ts, p * 1.3);
      if (chapter === 3 && h3 > 0.8 && Math.sin(t * 2 + x) > 0.4) {
        ctx.fillStyle = "#fff3b0";
        ctx.fillRect(px + p * 6, py + p * 6, p * 2, p * 2);
      }
      return;
    }

    // ---------------- 橋 ----------------
    if (tileType === "=") {
      const g = ctx.createLinearGradient(px, py, px, py + ts);
      g.addColorStop(0, "#c68a4c"); g.addColorStop(1, "#8a5a2b");
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(px, py + p * 14, ts, p * 2);
      ctx.fillStyle = g;
      ctx.fillRect(px, py + p * 2, ts, p * 12);
      ctx.fillStyle = "rgba(60,30,10,0.55)";
      for (let i = 0; i < 4; i++) ctx.fillRect(px + p * (i * 4 + 3.5), py + p * 2, p * 0.8, p * 12);
      ctx.fillStyle = "#e8b878";
      ctx.fillRect(px, py + p * 2, ts, p);
      ctx.fillStyle = "#5a3a1a";
      ctx.fillRect(px, py + p * 13, ts, p);
      ctx.fillRect(px + p, py, p * 1.5, p * 3);
      ctx.fillRect(px + ts - p * 2.5, py, p * 1.5, p * 3);
      return;
    }

    // ---------------- 地面 ----------------
    this.groundTile(ctx, th, x, y, px, py, ts, chapter);

    if (tileType !== "#") {
      // 地表細節：草簇、花、小石、龜裂
      if (false) {
        const bx = px + p * (2 + h2 * 11), by = py + p * (4 + h3 * 9);
        if (chapter === 1) {
          ctx.fillStyle = th.dark;
          ctx.fillRect(bx, by, p, p * 2.2); ctx.fillRect(bx + p * 1.5, by + p * 0.5, p, p * 1.7); ctx.fillRect(bx - p * 1.4, by + p * 0.6, p, p * 1.6);
          ctx.fillStyle = "#a6ec86";
          ctx.fillRect(bx, by, p, p * 0.8);
        } else if (chapter === 2) {
          ctx.fillStyle = th.dark; ctx.fillRect(bx, by, p * 2, p * 0.8);
          ctx.fillStyle = th.fleck[0]; ctx.fillRect(bx + p, by - p, p * 1.2, p);
        } else if (chapter === 3) {
          ctx.strokeStyle = th.dark; ctx.lineWidth = Math.max(1, p * 0.7);
          ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + p * 2.5, by + p * 1.5); ctx.lineTo(bx + p * 3.5, by + p * 0.2); ctx.stroke();
        } else if (chapter === 4) {
          ctx.fillStyle = th.dark; ctx.fillRect(bx, by + p, p * 3, p * 0.9);
          ctx.fillStyle = th.fleck[1]; ctx.fillRect(bx + p, by, p, p);
        } else {
          ctx.fillStyle = th.dark; ctx.fillRect(bx, by, p * 2, p * 1.2);
        }
      }
      if (h2 > 0.82) {
        const fx = px + p * (3 + h3 * 10), fy = py + p * (3 + h1 * 10);
        ctx.fillStyle = th.fleck[Math.floor(h1 * 100) % th.fleck.length];
        ctx.fillRect(fx, fy, p * 1.4, p * 1.4);
        if (chapter === 1) { ctx.fillStyle = "#fff7c2"; ctx.fillRect(fx + p * 0.4, fy + p * 0.4, p * 0.6, p * 0.6); }
      }
      if (h3 > 0.93) {
        ctx.fillStyle = this.tint(th.dark, 1.05);
        ctx.fillRect(px + p * 9, py + p * 10, p * 3, p * 2);
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.fillRect(px + p * 9, py + p * 10, p * 3, p * 0.8);
      }
      return;
    }

    // ---------------- 牆體：章節專屬地形 ----------------
    // 落影
    ctx.fillStyle = th.shadow;
    ctx.beginPath(); ctx.ellipse(px + ts * 0.52, py + ts * 0.9, ts * 0.46, ts * 0.16, 0, 0, Math.PI * 2); ctx.fill();

    if (chapter === 1) {
      // 圓潤樹冠 (三層明暗) + 樹幹
      ctx.fillStyle = th.trunk;
      ctx.fillRect(px + p * 6.5, py + p * 10, p * 3, p * 5.5);
      ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.fillRect(px + p * 8.5, py + p * 10, p, p * 5.5);
      const cx = px + ts * 0.5, cy = py + ts * 0.42 + sway * p * 0.2;
      const blobs = [[-4, 0.6, 6.6], [4, 1.2, 6.2], [0, -3.4, 7.6], [0, 2.4, 6]];
      blobs.forEach(([ox, oy, r], i) => {
        const g = ctx.createRadialGradient(cx + (ox - 1.5) * p, cy + (oy - 2) * p, p, cx + ox * p, cy + oy * p, r * p);
        g.addColorStop(0, "#7be38a"); g.addColorStop(0.5, "#2f9e44"); g.addColorStop(1, "#13532a");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(cx + ox * p, cy + oy * p, r * p, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = "rgba(255,255,255,0.28)";
      ctx.fillRect(cx - p * 2, cy - p * 5, p * 3, p); ctx.fillRect(cx + p * 2, cy - p * 3, p * 2, p);
    } else if (chapter === 2) {
      if (h1 > 0.5) {
        // 棕櫚樹
        ctx.strokeStyle = th.trunk; ctx.lineWidth = p * 2; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(px + p * 8, py + p * 15); ctx.quadraticCurveTo(px + p * 9 + sway * p, py + p * 9, px + p * 8 + sway * p * 1.5, py + p * 4); ctx.stroke();
        const tx0 = px + p * 8 + sway * p * 1.5, ty0 = py + p * 4;
        for (let i = 0; i < 6; i++) {
          const a = -Math.PI + (i / 5) * Math.PI;
          ctx.strokeStyle = i % 2 ? "#2f9e44" : "#51cf66"; ctx.lineWidth = p * 1.6;
          ctx.beginPath(); ctx.moveTo(tx0, ty0);
          ctx.quadraticCurveTo(tx0 + Math.cos(a) * p * 4, ty0 + Math.sin(a) * p * 4 - p * 2, tx0 + Math.cos(a) * p * 7, ty0 + Math.sin(a) * p * 2 + p * 3); ctx.stroke();
        }
      } else {
        // 海岸礁石
        [[4, 13, 4.4, 8], [9.5, 13, 4, 6]].forEach(([ox, bY, w, hh]) => {
          const g = ctx.createLinearGradient(0, py + p * (bY - hh), 0, py + p * bY);
          g.addColorStop(0, "#eef3f7"); g.addColorStop(1, "#6d8aa3");
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.moveTo(px + p * (ox - w), py + p * bY); ctx.quadraticCurveTo(px + p * (ox - w * 0.6), py + p * (bY - hh), px + p * ox, py + p * (bY - hh)); ctx.quadraticCurveTo(px + p * (ox + w * 0.8), py + p * (bY - hh * 0.6), px + p * (ox + w), py + p * bY); ctx.fill();
        });
      }
    } else if (chapter === 3) {
      // 熔岩尖岩
      const g = ctx.createLinearGradient(px, 0, px + ts, 0);
      g.addColorStop(0, "#a8714a"); g.addColorStop(0.55, "#6b3f2a"); g.addColorStop(1, "#2f1a10");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(px + p, py + p * 15); ctx.lineTo(px + p * 3.5, py + p * 7); ctx.lineTo(px + p * 6.5, py + p * 3.5); ctx.lineTo(px + p * 8, py - p * 1);
      ctx.lineTo(px + p * 10.5, py + p * 5); ctx.lineTo(px + p * 13, py + p * 9); ctx.lineTo(px + p * 15, py + p * 15); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = `rgba(251,146,60,${0.6 + Math.sin(animFrame * 0.1 + x) * 0.25})`; ctx.lineWidth = Math.max(1.2, p * 0.9);
      ctx.beginPath(); ctx.moveTo(px + p * 7.5, py + p * 13); ctx.lineTo(px + p * 8.5, py + p * 9); ctx.lineTo(px + p * 7.5, py + p * 6); ctx.stroke();
    } else if (chapter === 4) {
      if (h1 > 0.45) {
        // 雪松
        ctx.fillStyle = th.trunk; ctx.fillRect(px + p * 7, py + p * 12, p * 2, p * 3.5);
        for (let i = 0; i < 3; i++) {
          const y1 = py + p * (13 - i * 3.6), wd = p * (6.5 - i * 1.5), y0 = y1 - p * 5;
          const g = ctx.createLinearGradient(0, y0, 0, y1);
          g.addColorStop(0, "#3d8a68"); g.addColorStop(1, "#1d5a42");
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.moveTo(px + p * 8 - wd, y1); ctx.lineTo(px + p * 8, y0); ctx.lineTo(px + p * 8 + wd, y1); ctx.closePath(); ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.beginPath(); ctx.moveTo(px + p * 8 - wd * 0.7, y1 - p * 1.8); ctx.lineTo(px + p * 8, y0); ctx.lineTo(px + p * 8 + wd * 0.7, y1 - p * 1.8); ctx.quadraticCurveTo(px + p * 8, y1 - p * 0.6, px + p * 8 - wd * 0.7, y1 - p * 1.8); ctx.fill();
        }
      } else {
        // 冰晶
        [[5, 14, 2.2, 9], [10, 14, 2.6, 11], [7.5, 14, 1.8, 6]].forEach(([ox, bY, w, hh]) => {
          const g = ctx.createLinearGradient(0, py + p * (bY - hh), 0, py + p * bY);
          g.addColorStop(0, "#f2fbff"); g.addColorStop(1, "#4aa3e8");
          ctx.fillStyle = g; ctx.globalAlpha = 0.92;
          ctx.beginPath(); ctx.moveTo(px + p * (ox - w), py + p * bY); ctx.lineTo(px + p * (ox - w * 0.6), py + p * (bY - hh * 0.78)); ctx.lineTo(px + p * ox, py + p * (bY - hh)); ctx.lineTo(px + p * (ox + w * 0.6), py + p * (bY - hh * 0.78)); ctx.lineTo(px + p * (ox + w), py + p * bY); ctx.closePath(); ctx.fill();
          ctx.globalAlpha = 1;
        });
      }
    } else {
      // 紫晶結晶柱
      [[4.5, 14, 2, 8, -0.12], [11, 14, 2.2, 9.5, 0.1], [8, 14, 2.8, 13, 0]].forEach(([ox, bY, w, hh, rot]) => {
        ctx.save(); ctx.translate(px + p * ox, py + p * bY); ctx.rotate(rot);
        const g = ctx.createLinearGradient(-p * w, 0, p * w, 0);
        g.addColorStop(0, "#f0e1ff"); g.addColorStop(0.5, "#a855f7"); g.addColorStop(1, "#4c1d95");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(-p * w, 0); ctx.lineTo(-p * w, -p * hh * 0.78); ctx.lineTo(0, -p * hh); ctx.lineTo(p * w, -p * hh * 0.78); ctx.lineTo(p * w, 0); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = Math.max(1, p * 0.5);
        ctx.beginPath(); ctx.moveTo(0, -p * hh); ctx.lineTo(0, 0); ctx.stroke();
        ctx.restore();
      });
    }
  }
}

if (typeof window !== "undefined") {
  window.pixelArt = new PixelArtEngine();
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { PixelArtEngine };
}
