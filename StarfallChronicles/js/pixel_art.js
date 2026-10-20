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

  drawSprite(ctx, spriteKey, px, py, size = 34) {
    const key = this.sprites[spriteKey] ? spriteKey : "icon_burst";
    const matrix = this.sprites[key];
    if (!matrix) return;

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

  drawTerrainTile(ctx, tileType, chapter, x, y, px, py, ts, animFrame) {
    const p = ts / 16;
    const isAlt = (x + y) % 2 === 0;
    const hash = (x * 13 + y * 29) % 7;
    const shift = Math.floor(animFrame / 20) % 2;

    if (tileType === "#") {
      if (chapter === 1) {
        // 第一章：迷霧森林 — 多層次茂密古樹冠、翠綠亮面與深褐樹幹
        ctx.fillStyle = "#081812";
        ctx.fillRect(px, py, ts, ts);
        ctx.fillStyle = "#113826";
        ctx.fillRect(px + p, py + p, ts - p * 2, ts - p * 3);
        ctx.fillStyle = "#15803d";
        ctx.fillRect(px + p * 2, py + p * 2, ts - p * 4, ts - p * 6);
        ctx.fillStyle = "#22c55e";
        ctx.fillRect(px + p * 3, py + p * 2, p * 5, p * 3);
        ctx.fillRect(px + p * 8, py + p * 4, p * 5, p * 3);
        ctx.fillStyle = "#86efac";
        ctx.fillRect(px + p * 4, py + p * 3, p * 2, p);
        ctx.fillRect(px + p * 9, py + p * 5, p * 2, p);
        ctx.fillStyle = "#3f1d0b";
        ctx.fillRect(px + p * 6, py + p * 11, p * 4, p * 4);
        ctx.fillStyle = "#78350f";
        ctx.fillRect(px + p * 7, py + p * 11, p, p * 4);
      } else if (chapter === 2) {
        // 第二章：沉沒鐘樓 — 深海青銅砌石、黃銅鉚釘與潮汐水苔
        ctx.fillStyle = "#081424";
        ctx.fillRect(px, py, ts, ts);
        ctx.fillStyle = "#16304d";
        ctx.fillRect(px + p, py + p, p * 6, p * 6);
        ctx.fillRect(px + p * 8, py + p, p * 7, p * 6);
        ctx.fillRect(px + p, py + p * 8, p * 9, p * 6);
        ctx.fillRect(px + p * 11, py + p * 8, p * 4, p * 6);
        ctx.fillStyle = "#29527a";
        ctx.fillRect(px + p * 2, py + p * 2, p * 4, p);
        ctx.fillRect(px + p * 9, py + p * 2, p * 5, p);
        ctx.fillRect(px + p * 2, py + p * 9, p * 7, p);
        ctx.fillStyle = "#d97706";
        ctx.fillRect(px + p * 2, py + p * 5, p, p);
        ctx.fillRect(px + p * 13, py + p * 5, p, p);
        ctx.fillStyle = "#0d9488";
        if (hash < 3) ctx.fillRect(px + p * 5, py + p * 7, p * 3, p * 2);
      } else if (chapter === 3) {
        // 第三章：熔岩鍛造廠 — 黑曜玄武岩巨牆與動態赤金熔岩脈絡
        ctx.fillStyle = "#180b08";
        ctx.fillRect(px, py, ts, ts);
        ctx.fillStyle = "#2e1712";
        ctx.fillRect(px + p, py + p, p * 6, p * 6);
        ctx.fillRect(px + p * 8, py + p, p * 7, p * 6);
        ctx.fillRect(px + p, py + p * 8, p * 8, p * 6);
        ctx.fillRect(px + p * 10, py + p * 8, p * 5, p * 6);
        ctx.fillStyle = "#4c261d";
        ctx.fillRect(px + p * 2, py + p * 2, p * 4, p);
        ctx.fillRect(px + p * 9, py + p * 2, p * 4, p);
        ctx.fillStyle = shift ? "#ea580c" : "#b45309";
        ctx.fillRect(px + p * 7, py + p * 2, p, p * 5);
        ctx.fillRect(px + p * 3, py + p * 7, p * 6, p);
        ctx.fillRect(px + p * 9, py + p * 8, p, p * 5);
        if (shift && hash % 2 === 0) {
          ctx.fillStyle = "#facc15";
          ctx.fillRect(px + p * 7, py + p * 4, p, p);
        }
      } else if (chapter === 4) {
        // 第四章：浮空星象院 — 星界白金聖柱、黃金星軌鑲邊與青藍星晶核
        ctx.fillStyle = "#0f0d26";
        ctx.fillRect(px, py, ts, ts);
        ctx.fillStyle = "#272354";
        ctx.fillRect(px + p, py + p, ts - p * 2, ts - p * 3);
        ctx.fillStyle = "#4338ca";
        ctx.fillRect(px + p * 2, py + p * 2, ts - p * 4, ts - p * 5);
        ctx.fillStyle = "#facc15";
        ctx.fillRect(px + p * 2, py + p * 2, ts - p * 4, p);
        ctx.fillRect(px + p * 2, py + p * 12, ts - p * 4, p);
        ctx.fillStyle = shift ? "#38bdf8" : "#818cf8";
        ctx.fillRect(px + p * 7, py + p * 5, p * 2, p * 4);
        ctx.fillStyle = "#e0f2fe";
        ctx.fillRect(px + p * 7, py + p * 6, p, p * 2);
      } else {
        // 第五章：王城星核聖殿 — 黑曜紫紅帝國雕柱與虛空紫晶紋
        ctx.fillStyle = "#160814";
        ctx.fillRect(px, py, ts, ts);
        ctx.fillStyle = "#36132c";
        ctx.fillRect(px + p, py + p, p * 6, p * 6);
        ctx.fillRect(px + p * 8, py + p, p * 7, p * 6);
        ctx.fillRect(px + p, py + p * 8, p * 9, p * 6);
        ctx.fillRect(px + p * 11, py + p * 8, p * 4, p * 6);
        ctx.fillStyle = "#facc15";
        ctx.fillRect(px + p * 2, py + p, p * 12, p);
        ctx.fillStyle = shift ? "#c084fc" : "#9333ea";
        ctx.fillRect(px + p * 7, py + p * 3, p, p * 4);
        ctx.fillRect(px + p * 4, py + p * 7, p * 5, p);
      }
      // 底部立體接地暗邊
      ctx.fillStyle = "rgba(0, 0, 0, 0.48)";
      ctx.fillRect(px, py + ts - p * 1.5, ts, p * 1.5);
      return;
    }

    if (tileType === "~") {
      if (chapter === 3) {
        // 沸騰熔岩池
        ctx.fillStyle = "#450a0a";
        ctx.fillRect(px, py, ts, ts);
        ctx.fillStyle = "#9a3412";
        ctx.fillRect(px + p, py + p, ts - p * 2, ts - p * 2);
        ctx.fillStyle = "#ea580c";
        ctx.fillRect(px + p * (2 + shift * 2), py + p * 3, p * 6, p * 2);
        ctx.fillRect(px + p * (7 - shift * 2), py + p * 9, p * 6, p * 2);
        ctx.fillStyle = "#facc15";
        ctx.fillRect(px + p * (4 + shift), py + p * 4, p * 3, p);
        ctx.fillRect(px + p * (9 - shift), py + p * 10, p * 2, p);
      } else if (chapter >= 4) {
        // 星淵虛空裂隙流
        ctx.fillStyle = "#0b0720";
        ctx.fillRect(px, py, ts, ts);
        ctx.fillStyle = "#31105e";
        ctx.fillRect(px + p * 2, py + p * 2, ts - p * 4, ts - p * 4);
        ctx.fillStyle = "#7c3aed";
        ctx.fillRect(px + p * (3 + shift), py + p * 4, p * 5, p * 2);
        ctx.fillRect(px + p * (7 - shift), py + p * 10, p * 5, p * 2);
        ctx.fillStyle = "#38bdf8";
        ctx.fillRect(px + p * (10 - shift * 2), py + p * 11, p * 2, p);
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(px + p * (5 + shift * 3), py + p * 5, p, p);
      } else {
        // 碧藍深水波紋
        ctx.fillStyle = "#072a40";
        ctx.fillRect(px, py, ts, ts);
        ctx.fillStyle = "#0c4a6e";
        ctx.fillRect(px + p, py + p, ts - p * 2, ts - p * 2);
        ctx.fillStyle = "#0284c7";
        ctx.fillRect(px + p * (2 + shift * 2), py + p * 4, p * 6, p * 2);
        ctx.fillRect(px + p * (6 - shift * 2), py + p * 10, p * 6, p * 2);
        ctx.fillStyle = "#7dd3fc";
        ctx.fillRect(px + p * (4 + shift), py + p * 4, p * 3, p);
        ctx.fillRect(px + p * (8 - shift), py + p * 10, p * 2, p);
      }
      return;
    }

    if (tileType === "=") {
      // 立體雙護欄古橋
      ctx.fillStyle = "#1c0d06";
      ctx.fillRect(px, py, ts, ts);
      ctx.fillStyle = "#78350f";
      ctx.fillRect(px, py + p * 2, ts, ts - p * 4);
      ctx.fillStyle = "#b45309";
      for (let i = 1; i < 15; i += 3) {
        ctx.fillRect(px + p * i, py + p * 2.5, p * 2, ts - p * 5);
      }
      ctx.fillStyle = "#facc15";
      ctx.fillRect(px, py + p, ts, p * 1.3);
      ctx.fillRect(px, py + ts - p * 2.3, ts, p * 1.3);
      return;
    }

    const floorThemes = {
      1: { base: isAlt ? "#0e2019" : "#11261e", border: "#163026", speck: "#1f4737", accent: "#22c55e" },
      2: { base: isAlt ? "#0c192b" : "#0f1f36", border: "#172d4a", speck: "#214066", accent: "#38bdf8" },
      3: { base: isAlt ? "#1e110e" : "#241512", border: "#331e19", speck: "#4a2b24", accent: "#f97316" },
      4: { base: isAlt ? "#131026" : "#17142e", border: "#241f47", speck: "#352e66", accent: "#a78bfa" },
      5: { base: isAlt ? "#1c0e18" : "#22111d", border: "#361a2e", speck: "#4f2643", accent: "#f43f5e" }
    };
    const th = floorThemes[chapter] || floorThemes[1];
    ctx.fillStyle = th.base;
    ctx.fillRect(px, py, ts, ts);

    // 細緻石板內框線與角落紋理
    ctx.strokeStyle = th.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 0.5, py + 0.5, ts - 1, ts - 1);

    ctx.fillStyle = th.speck;
    ctx.fillRect(px + p * 2, py + p * 3, p * 2, p * 2);
    ctx.fillRect(px + p * 11, py + p * 10, p * 2, p * 2);
    if (hash === 0) {
      ctx.fillStyle = th.accent;
      ctx.globalAlpha = 0.35;
      ctx.fillRect(px + p * 7, py + p * 7, p * 2, p);
      ctx.globalAlpha = 1.0;
    } else if (hash === 3) {
      ctx.fillStyle = th.speck;
      ctx.fillRect(px + p * 6, py + p * 12, p * 3, p);
    }
  }
}

if (typeof window !== "undefined") {
  window.pixelArt = new PixelArtEngine();
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { PixelArtEngine };
}
