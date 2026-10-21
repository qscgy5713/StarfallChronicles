/**
 * 劇情資料 (Story)：每章 2 條三段式故事支線 (共 10 條，完成後解鎖專屬手札、增加結局條件) 與每章 3 段劇情場景 (共 15 段)。
 * 掛到 GAME_DATA.storyChains / storyScenes / loreEntries；由 data.js 載入之後才執行。
 * 故事 NPC 只在「目前章節」且「該段尚未完成」時出現在地圖上；位置以 (ax, ay) 為錨點，附近找最近的空地。
 */
(function (GAME_DATA) {
  const D = GAME_DATA;

  D.storyChains = [
    // ======================= 第一章：微光漁村與迷霧森林 =======================
    {
      id: "c1_stardust", chapter: 1, title: "【故事】漁網裡的星砂", lore: "story_lore_1",
      steps: [
        { zone: 1, ax: 9, ay: 4, name: "漁婦・瑪莎", icon: "npc_scholar",
          offer: ["「艾爾文！我昨晚在海邊撈到一把會發光的細沙，像把星星磨碎了一樣。可是今天早上，裝著它的網袋被森林裡的狼叼走了。」", "「那些狼最近都紅著眼睛……你能替我教訓三隻迷霧蝕影狼，把網袋搶回來嗎？」"],
          wait: "「網袋還沒回來嗎？牠們多半在林道上遊蕩。」",
          req: { type: "kill", enemy: "mist_wolf", count: 3, text: "擊敗 3 隻迷霧蝕影狼" },
          done: ["「天啊，你真的把網袋帶回來了！裡面的星砂還在發光呢。」", "「我先生是守林人，他懂這類東西。他在迷霧幽林(1-2)的營地，你替我拿給他看看吧。」"],
          reward: { gold: 60, exp: 50, items: { healing_potion: 2 } } },
        { zone: 2, ax: 6, ay: 11, name: "守林人・老賽勒斯", icon: "npc_elder",
          offer: ["「這是星砂？三十年前星隕那夜，我也見過一模一樣的光……它會讓野獸發狂，卻也能讓草木重生。」", "「我想拿兩片【星辰碎晶】做對照，看看它們是不是同一種東西。你找得到嗎？」"],
          wait: "「兩片星辰碎晶，林子裡的魔物身上偶爾會掉。」",
          req: { type: "item", item: "star_shard", count: 2, consume: true, text: "交出 2 片星辰碎晶" },
          done: ["「果然……星砂和碎晶是同一種東西，只是前者純淨得多。這片森林的暴走，是星砂被污染的緣故。」", "「古樹祭壇(1-3)那邊有一道微弱的光在呼喚這把砂。去吧，也許那裡有答案。」"],
          reward: { gold: 80, exp: 70, items: { mana_elixir: 2 } } },
        { zone: 3, ax: 16, ay: 3, name: "微光的殘影", icon: "npc_goddess",
          offer: ["「……你帶來了……我的孩子……」一道由星砂凝成的柔光在祭壇旁顯形。", "「我曾是墜落之星的一小片。人們用鎖鏈拖拽我的母親時，我碎落在這片海岸。請把這把砂埋在古樹下，讓我安息。」", "光芒融入大地，周圍的紫霧淡了一些。"],
          wait: "",
          req: { type: "none" },
          done: ["星砂化作點點光塵，滲入古樹的根。你手心留下一片溫暖的印記。", "【獲得手札：《星砂的低語》】"],
          reward: { gold: 120, exp: 110, sp: 1, items: { greater_potion: 1 } } }
      ],
      finalLoreText: "《星砂的低語》：墜星並非只有一顆。當年王室拖拽主星時，無數碎片散落海岸，其中有的保有記憶。它們不求復仇，只想回到夜空。——微光漁村的孩子們說，每逢滿潮之夜，漁網裡偶爾還會撈到會唱歌的星砂。"
    },
    {
      id: "c1_hound", chapter: 1, title: "【故事】小灰與守林人的承諾", lore: "story_lore_2",
      steps: [
        { zone: 1, ax: 5, ay: 3, name: "少年・托比", icon: "npc_scholar",
          offer: ["「獵人哥哥！我的狗『小灰』昨晚跑進森林就沒回來，爸爸說森林太危險，不准我去找。」", "「聽說古樹精會把人迷路在林子裡。你能幫我清掉兩隻腐化古樹精，開出一條安全的路嗎？」"],
          wait: "「路還沒清乾淨……小灰一定很害怕。」",
          req: { type: "kill", enemy: "corrupted_treant", count: 2, text: "擊敗 2 隻腐化古樹精" },
          done: ["「哇，你真的打倒牠們了！」托比從懷裡掏出一條舊皮繩。", "「這是小灰的項圈，上面有爸爸刻的記號。如果你在森林深處看到牠，請把這個給牠聞一聞，牠就會跟你走了。」"],
          reward: { gold: 50, exp: 45, items: { healing_potion: 2 } } },
        { zone: 2, ax: 12, ay: 3, name: "受傷的灰影犬", icon: "npc_dwarf",
          offer: ["一隻灰毛的老狗縮在樹洞裡，後腿受了傷。牠聞到皮繩的味道，尾巴輕輕搖了一下。", "牠的傷口發黑，需要【月光螢草】敷藥。你身上有兩株嗎？"],
          wait: "牠虛弱地望著你，傷口還在滲出黑色的霧。",
          req: { type: "item", item: "moon_herb", count: 2, consume: true, text: "交出 2 株月光螢草" },
          done: ["你把搗碎的螢草敷在傷口上，黑霧漸漸退去。老狗站起身，咬住你的衣角，帶著你往林子東邊走。", "牠想帶你去見一個人。"],
          reward: { gold: 70, exp: 60, items: { star_bomb: 1 } } },
        { zone: 3, ax: 13, ay: 7, name: "亡故守林人的墓碑", icon: "npc_elder",
          offer: ["老狗在一塊覆滿青苔的木碑前停下，嗚咽了一聲。碑上刻著：「守林人托雷，願林木永遠記得你。」", "原來小灰的真正主人，是三十年前為了保護村子而死在聖所門口的守林人。牠一直在這裡等。", "你把皮繩綁在碑上。老狗安靜地趴下，像是終於等到了答案。"],
          wait: "",
          req: { type: "none" },
          done: ["「謝謝你……」風裡好像有人這麼說。木碑旁的荊棘悄悄退開，露出一條小路。", "【獲得手札：《守林人托雷之歌》】"],
          reward: { gold: 100, exp: 100, sp: 1, items: { phoenix_salve: 1 } } }
      ],
      finalLoreText: "《守林人托雷之歌》：「林子醒著，星子睡著，守林人替它們點燈。燈滅那天，狗仍在門口等。」——漁村老人們哼了三十年的搖籃曲，原來是在紀念一位沒有名字的守林人。"
    },
    // ======================= 第二章：沉沒鐘樓與水下迴廊 =======================
    {
      id: "c2_clockmaker", chapter: 2, title: "【故事】停擺的八音盒", lore: "story_lore_3",
      steps: [
        { zone: 1, ax: 12, ay: 2, name: "鐘樓管理員・歐文", icon: "npc_elder",
          offer: ["「這座鐘樓停擺三十年了，只有這個八音盒還偶爾自己響。」歐文捧著生鏽的盒子。", "「它缺了三枚【精密古銅齒輪】才能完整演奏。我年紀大了走不動，你能幫我找齊嗎？」"],
          wait: "「三枚齒輪，水下迴廊的發條衛兵身上也許有。」",
          req: { type: "item", item: "ancient_gear", count: 3, consume: true, text: "交出 3 枚精密古銅齒輪" },
          done: ["歐文顫抖著把齒輪裝進去，八音盒發出一段殘缺卻溫柔的旋律。", "「這是設計師為女兒寫的曲子……只差最後一段。他的工作室在齒輪水閘迷宮(2-2)，也許留有樂譜。」"],
          reward: { gold: 120, exp: 90, items: { mana_elixir: 2 } } },
        { zone: 2, ax: 12, ay: 3, name: "設計師的遺稿櫃", icon: "npc_scholar",
          offer: ["水下工作室的書櫃被潮水泡得發脹。其中一格夾著半張樂譜，旁邊寫著：「女兒生日快到了，這首曲子要在整點鐘響時演奏。」", "樂譜上有被水暈開的段落，需要乾淨的【月光螢草】粉才能顯影。你有兩株嗎？"],
          wait: "樂譜的後半段仍然模糊，也許用螢草粉能顯影。",
          req: { type: "item", item: "moon_herb", count: 2, consume: true, text: "交出 2 株月光螢草" },
          done: ["螢草粉灑在紙上，暈開的墨跡重新浮現。最後一段旋律完整了。", "你把樂譜帶回時之核心大聖堂(2-3)，那裡的大鐘需要這首曲子才會重新轉動。"],
          reward: { gold: 140, exp: 110, items: { star_bomb: 2 } } },
        { zone: 3, ax: 16, ay: 3, name: "停擺的大鐘", icon: "npc_mage",
          offer: ["大鐘的指針停在十二點整。你把樂譜放在鐘下的機關上，鐘錘輕輕震動，奏出完整的旋律。", "那是一首沒有歌詞的搖籃曲。整座大聖堂的水面泛起漣漪，彷彿有人在輕輕哼唱。", "指針顫了一下，向前挪了一格。三十年來，時間第一次動了。"],
          wait: "",
          req: { type: "none" },
          done: ["鐘聲餘韻中，一個孩子的笑聲從水底傳來，隨即消散。", "【獲得手札：《整點鐘響》】"],
          reward: { gold: 200, exp: 160, sp: 1, items: { greater_potion: 2 } } }
      ],
      finalLoreText: "《整點鐘響》：設計師並不是為了冷卻星核才建造鐘樓。他在日記裡寫：「我只是想讓女兒知道，時間會溫柔地走。」——被王室徵用後，鐘樓成了冷卻爐，而他的曲子再也沒有人聽過。"
    },
    {
      id: "c2_siren", chapter: 2, title: "【故事】女妖的搖籃曲", lore: "story_lore_4",
      steps: [
        { zone: 1, ax: 16, ay: 11, name: "水道清潔工・莉塔", icon: "npc_scholar",
          offer: ["「每到半夜，水道裡就傳來一首很悲傷的歌，聽久了人會往水裡走。大家都說是深淵潮汐女妖在作祟。」", "「你能去水道裡擊敗三隻女妖嗎？至少讓牠們別再唱了。」"],
          wait: "「歌聲還在……我昨晚又差點走進水裡。」",
          req: { type: "kill", enemy: "tide_siren", count: 3, text: "擊敗 3 隻深淵潮汐女妖" },
          done: ["「歌聲停了……可是奇怪，我總覺得有點難過。」莉塔望著水面發呆。", "「我撿到牠們掉落的東西裡，有個小小的搖鈴。也許你該拿去問問學者薇薇安？」"],
          reward: { gold: 100, exp: 80, items: { mana_elixir: 1, healing_potion: 2 } } },
        { zone: 2, ax: 6, ay: 2, name: "學者・薇薇安的筆記", icon: "npc_scholar",
          offer: ["薇薇安留下的筆記攤在水閘旁：「女妖並非天生的魔物。她們曾是鐘樓的歌者，為了安撫暴走的星核而日夜歌唱，最後被星力同化。」", "「她們唱的是搖籃曲，想哄睡被囚禁的星辰。若有人能用同樣的旋律回應，或許能讓她們安息。」", "筆記末尾需要兩枚【精密古銅齒輪】來校準你手上的搖鈴。"],
          wait: "搖鈴的音準還差一點，需要兩枚古銅齒輪。",
          req: { type: "item", item: "ancient_gear", count: 2, consume: true, text: "交出 2 枚精密古銅齒輪" },
          done: ["搖鈴被調到和那首歌同樣的音高。輕輕一搖，水面泛起了回音。", "去時之核心大聖堂(2-3)吧，歌聲最深的地方就在那裡。"],
          reward: { gold: 130, exp: 100, items: { star_bomb: 1, mana_elixir: 1 } } },
        { zone: 3, ax: 13, ay: 7, name: "最後的歌者", icon: "npc_goddess",
          offer: ["一位半透明的女子坐在水池邊，魚尾已變成星光。你搖響搖鈴，她抬起頭。", "「……這是我們的歌……你怎麼會……」她的眼眶落下水滴般的光。「謝謝你。我一直以為沒人記得我們為什麼唱。」", "她將一顆淚珠似的水晶放在你手裡，慢慢化作星光融入水中。"],
          wait: "",
          req: { type: "none" },
          done: ["大聖堂的水面第一次真正平靜下來。", "【獲得手札：《歌者的最後一曲》】"],
          reward: { gold: 190, exp: 150, sp: 1, items: { phoenix_salve: 1, mana_elixir: 2 } } }
      ],
      finalLoreText: "《歌者的最後一曲》：女妖們原本是鐘樓的合唱團。星核暴走時，她們用歌聲讓那顆憤怒的星辰安靜了整整十年。王室卻只記得「水道裡有魔物」，悄悄刪去了她們的名字。"
    },
    // ======================= 第三章：熔岩鍛造廠與矮人廢墟 =======================
    {
      id: "c3_apprentice", chapter: 3, title: "【故事】最後一爐火", lore: "story_lore_5",
      steps: [
        { zone: 1, ax: 8, ay: 3, name: "矮人學徒・巴頓", icon: "npc_dwarf",
          offer: ["「師父說，矮人的爐火不能熄。可是礦坑入口的副熔爐被熔核魔像撞壞了，我一個人修不好。」", "「幫我找三塊【星隕玄鐵】當爐芯好嗎？魔像身上和礦脈裡都有機會找到。」"],
          wait: "「魔像還在附近，爐芯也還缺。」",
          req: { type: "item", item: "meteor_iron", count: 3, consume: true, text: "交出 3 塊星隕玄鐵" },
          done: ["巴頓用玄鐵重新砌好爐芯，火苗又竄了起來。「謝啦！我把師父留的鎚子借你看看。」", "「他的工坊在萬爐熔岩大廳(3-2)。去吧，裡面應該還有他沒做完的東西。」"],
          reward: { gold: 160, exp: 120, items: { star_bomb: 2 } } },
        { zone: 2, ax: 12, ay: 3, name: "鍛造師的工作檯", icon: "npc_dwarf",
          offer: ["工作檯上擺著一把未完成的小鎚，旁邊的便條寫著：「給巴頓，等他出師那天。」", "鎚頭少了一塊鎚面，需要【虛空星塵】才能鍛合。放兩份進去，爐火會自己接手。"],
          wait: "小鎚還缺鎚面，需要 2 份虛空星塵。",
          req: { type: "item", item: "void_essence", count: 2, consume: true, text: "交出 2 份虛空星塵" },
          done: ["爐火吞下星塵，小鎚的鎚面閃出了淡藍的光。它在等一個人。", "把它帶去鍛造王座與炎龍巢穴(3-3)——師父最後出現的地方。"],
          reward: { gold: 200, exp: 150, items: { greater_potion: 2 } } },
        { zone: 3, ax: 16, ay: 3, name: "矮人老匠師的殘影", icon: "npc_dwarf",
          offer: ["王座旁的熔岩映出一個佝僂的身影。你把小鎚舉起，他看了許久。", "「哈……這小子還記得。老夫當年為王鍛鎖鏈，心裡一直過不去。所以偷偷做了這把小鎚，想告訴後輩：鐵是用來守護的。」", "「替我告訴巴頓——火，繼續燒下去。」"],
          wait: "",
          req: { type: "none" },
          done: ["殘影化作一團暖光，鑽進小鎚裡。熔岩的怒吼似乎柔和了一些。", "【獲得手札：《火要繼續燒》】"],
          reward: { gold: 280, exp: 210, sp: 1, items: { phoenix_salve: 2 } } }
      ],
      finalLoreText: "《火要繼續燒》：矮人不信神，只信爐火。鍛造王巴林留下遺言：「若鐵被用來囚禁，那是人的錯，不是鐵的錯。」他最後的徒弟把這句話刻在每一把新鎚的柄上。"
    },
    {
      id: "c3_drake", chapter: 3, title: "【故事】燼翼的巢", lore: "story_lore_6",
      steps: [
        { zone: 1, ax: 12, ay: 8, name: "礦工・格雷", icon: "npc_dwarf",
          offer: ["「燼翼火蜥龍最近越來越兇，連挖礦的隊伍都被牠們趕了出來。」", "「聽說牠們原本是溫順的巢居者。你去清掉三隻，順便看看牠們到底在護著什麼？」"],
          wait: "「巢穴那邊還是很危險，再去看看。」",
          req: { type: "kill", enemy: "ash_drake", count: 3, text: "擊敗 3 隻燼翼火蜥龍" },
          done: ["「你說牠們身上都有舊傷？是鎖鏈的痕跡……」格雷皺起眉。", "「我小時候聽過，古龍伊格尼斯的後代被矮人王養在礦坑深處。你去萬爐熔岩大廳(3-2)看看有沒有紀錄。」"],
          reward: { gold: 150, exp: 110, items: { healing_potion: 3 } } },
        { zone: 2, ax: 6, ay: 2, name: "蛋殼堆", icon: "npc_mage",
          offer: ["岩縫裡堆著破碎的蛋殼，邊緣有細小的爪痕——這些蛋是被人偷走的，而不是自然孵化。", "旁邊遺落一本帳冊：「第三批龍蛋，換三塊星隕玄鐵。」", "把玄鐵帶回來作為補償，母龍的怒氣也許會消。"],
          wait: "母龍需要補償，帶 3 塊星隕玄鐵來。",
          req: { type: "item", item: "meteor_iron", count: 3, consume: true, text: "交出 3 塊星隕玄鐵" },
          done: ["你把玄鐵放在巢邊。遠處傳來低沉的鳴聲，像是在說：知道了。", "走吧，牠在鍛造王座(3-3)等你。"],
          reward: { gold: 190, exp: 140, items: { star_bomb: 2, greater_potion: 1 } } },
        { zone: 3, ax: 13, ay: 7, name: "古龍的低語", icon: "npc_goddess",
          offer: ["熔岩中升起一團火焰般的虛影，聲音像遠方的雷。「人類，你還記得契約嗎？」", "「矮人王與我立約：我守礦脈，他們守我的孩子。契約被貪婪撕碎，我的孩子們變成了你們口中的『魔物』。」", "「你替孩子們留了一條退路。我不再追究。但請記住——別再打造鎖鏈。」"],
          wait: "",
          req: { type: "none" },
          done: ["火焰緩緩散開，岩壁上的鎖鏈痕跡似乎淡了一些。", "【獲得手札：《古龍的契約殘頁》】"],
          reward: { gold: 270, exp: 200, sp: 1, items: { phoenix_salve: 2 } } }
      ],
      finalLoreText: "《古龍的契約殘頁》：契約只有兩行：「我為你守住光，你為我守住巢。」第一行被實現了三百年，第二行被撕了一次，就足以讓一個種族墮落為魔物。"
    },
    // ======================= 第四章：浮空星象院 =======================
    {
      id: "c4_observer", chapter: 4, title: "【故事】觀測員的最後一份報告", lore: "story_lore_7",
      steps: [
        { zone: 1, ax: 15, ay: 2, name: "實習觀星生・諾拉", icon: "npc_scholar",
          offer: ["「我是星象院最後一批實習生。院裡的怨靈越來越多，我走不出星橋，也回不去宿舍。」", "「我的觀測筆記丟在走廊盡頭，裡面有『永晝計畫』的原始數據。幫我擊敗三隻星界徘徊怨靈，開一條路？」"],
          wait: "「怨靈還在走廊上遊蕩，我不敢過去。」",
          req: { type: "kill", enemy: "astral_wraith", count: 3, text: "擊敗 3 隻星界徘徊怨靈" },
          done: ["諾拉衝過走廊取回筆記，眼眶紅紅的。「是……是學長的字跡。」", "「這份報告要交到天球儀室(4-2)的主機才算『送出』。學長他……一直想完成它。」"],
          reward: { gold: 180, exp: 140, items: { mana_elixir: 2 } } },
        { zone: 2, ax: 6, ay: 2, name: "天球儀主機", icon: "npc_mage",
          offer: ["主機的螢幕亮著微光：「請輸入核對碼：星核能量穩定度記錄。」", "筆記裡夾著一份數據表，但關鍵欄位被星塵污染，需要兩份【虛空星塵】才能還原。"],
          wait: "數據還缺最後一塊，需要 2 份虛空星塵來還原。",
          req: { type: "item", item: "void_essence", count: 2, consume: true, text: "交出 2 份虛空星塵" },
          done: ["數據還原了。螢幕上跳出一行字：『星核並未失控，是被迫承受。』", "報告的收件人欄位是空白的——它需要被送往審判穹頂(4-3)。"],
          reward: { gold: 230, exp: 170, items: { greater_potion: 2 } } },
        { zone: 3, ax: 16, ay: 3, name: "觀測員的殘影", icon: "npc_mage",
          offer: ["穹頂中央，一個戴著眼鏡的青年虛影站在星圖前。", "「你……把報告帶來了？」他接過數據，笑得很輕。「我們都知道抽取星核是錯的，可沒人敢說。我只敢寫下來。」", "「謝謝你替我『送出』它。我想，這就夠了。」"],
          wait: "",
          req: { type: "none" },
          done: ["虛影化作星光，融入天球儀的軌跡。圓頂上的星圖微微亮了一圈。", "【獲得手札：《不敢說出口的報告》】"],
          reward: { gold: 320, exp: 240, sp: 1, items: { phoenix_salve: 2 } } }
      ],
      finalLoreText: "《不敢說出口的報告》：星象院有三百份「永晝計畫」報告，二百九十九份寫著「穩定」。唯一那份寫著「痛苦」的，被塞在最底層的抽屜裡，三十年沒有人讀。"
    },
    {
      id: "c4_mirror", chapter: 4, title: "【故事】折光鏡裡的另一個你", lore: "story_lore_8",
      steps: [
        { zone: 1, ax: 8, ay: 7, name: "守夜學者・瑟琳", icon: "npc_scholar",
          offer: ["「我在鏡廊裡看見過一個和你一模一樣的人，他說他是『沒有離開星象院的艾爾文』。」", "「如果他是真的，那是梅林老師當年的另一個選擇……先替我把審判官清掉兩隻，我才敢帶你過去看看。」"],
          wait: "「審判官還擋在鏡廊入口。」",
          req: { type: "kill", enemy: "star_inquisitor", count: 2, text: "擊敗 2 隻星象院自律審判官" },
          done: ["「走廊乾淨了。」瑟琳遞給你一枚小鏡片。「這是折光鏡的碎片，會映出你心裡最在意的人。」", "「帶去天球儀室(4-2)，對著鏡面看看吧。」"],
          reward: { gold: 170, exp: 130, items: { healing_potion: 3, mana_elixir: 1 } } },
        { zone: 2, ax: 12, ay: 3, name: "折光鏡", icon: "npc_mage",
          offer: ["鏡面映出的不是你，而是一個穿著星象院制服的年輕人。他低聲說：「如果當年梅林沒有把你送出去，我會活成這樣。」", "鏡面開始裂縫，需要兩份【虛空星塵】才能穩住這個影像。"],
          wait: "鏡面快撐不住了，需要 2 份虛空星塵。",
          req: { type: "item", item: "void_essence", count: 2, consume: true, text: "交出 2 份虛空星塵" },
          done: ["鏡面穩住了。年輕人看著你，眼神很平靜。「你選擇的路，比我的好。」", "「去審判穹頂(4-3)，把這句話告訴梅林的影子吧。」"],
          reward: { gold: 220, exp: 160, items: { star_bomb: 2, phoenix_salve: 1 } } },
        { zone: 3, ax: 13, ay: 7, name: "梅林的影子", icon: "npc_mage",
          offer: ["穹頂邊緣，一個老人的影子靠著欄杆。你轉述了鏡中人的話。", "「……他這麼說嗎？」影子沉默很久。「我把你送出去的那天，哭了一整夜。我一直怕自己是個怯懦的人。」", "「謝謝你告訴我，那個決定是對的。」"],
          wait: "",
          req: { type: "none" },
          done: ["影子微笑著消散，穹頂的星光在你肩上停了一會兒。", "【獲得手札：《兩條沒走過的路》】"],
          reward: { gold: 310, exp: 230, sp: 1, items: { greater_potion: 2 } } }
      ],
      finalLoreText: "《兩條沒走過的路》：梅林曾說：「人生像鏡廊，每一面鏡子都是一個沒有選擇的自己。」他沒有告訴艾爾文，那天他選擇了讓一個孩子活下去，而不是讓一個王國繼續沉睡。"
    },
    // ======================= 第五章：霧海遺城・星核聖殿 =======================
    {
      id: "c5_templar", chapter: 5, title: "【故事】沒有名字的禁衛", lore: "story_lore_9",
      steps: [
        { zone: 1, ax: 8, ay: 7, name: "迷途的星靈", icon: "npc_goddess",
          offer: ["「我是艾歐拉的一縷碎片。這座城裡的黑曜禁衛不是敵人，他們只是忘了自己為什麼站在這裡。」", "「請擊敗三名黑曜聖殿禁衛，讓他們暫時安息，我才能讀取他們殘留的記憶。」"],
          wait: "「禁衛們還在巡邏，他們的記憶還封在鎧甲裡。」",
          req: { type: "kill", enemy: "citadel_templar", count: 3, text: "擊敗 3 名黑曜聖殿禁衛" },
          done: ["星靈從倒下的鎧甲上收集到一小團光。「這是他們最後一個願望……『想再看一眼家鄉的海。』」", "「帶著它去四象星核迴廊(5-2)，那裡有一面能映出海的鏡子。」"],
          reward: { gold: 260, exp: 200, items: { greater_potion: 2, healing_potion: 2 } } },
        { zone: 2, ax: 6, ay: 2, name: "海之鏡", icon: "npc_mage",
          offer: ["迴廊盡頭立著一面橢圓的銅鏡，鏡面映著一片遙遠的、陽光下的海。", "鏡子需要兩份【虛空星塵】才能啟動，把那團光放進去，禁衛們就能最後一次看見海。"],
          wait: "鏡子需要 2 份虛空星塵才能啟動。",
          req: { type: "item", item: "void_essence", count: 2, consume: true, text: "交出 2 份虛空星塵" },
          done: ["鏡面泛起浪花，遠方傳來海鷗的叫聲。你彷彿聽見無數鎧甲在同時卸下重擔。", "最後一步：到永恆星核王座(5-3)，為他們留下紀念。"],
          reward: { gold: 320, exp: 240, items: { phoenix_salve: 2 } } },
        { zone: 3, ax: 13, ay: 7, name: "無名紀念碑", icon: "npc_elder",
          offer: ["王座大廳的角落有一塊光禿禿的石碑。你把那團光放在碑前，光緩緩沉入石面，浮現出一排名字——三百二十一個。", "那是三百二十一名禁衛的名字，王室從未記錄過。", "你默默站了一會兒。"],
          wait: "",
          req: { type: "none" },
          done: ["石碑下的陰影微微發亮，像是回應著什麼。", "【獲得手札：《三百二十一個名字》】"],
          reward: { gold: 420, exp: 320, sp: 2, items: { phoenix_salve: 3 } } }
      ],
      finalLoreText: "《三百二十一個名字》：黑曜禁衛在星隕之夜失去了指揮官，也失去了自己的名字。他們守著空蕩的王座三十年，並不是因為忠誠，而是因為沒有人告訴他們可以離開。"
    },
    {
      id: "c5_king", chapter: 5, title: "【故事】王座前的最後一封信", lore: "story_lore_10",
      steps: [
        { zone: 1, ax: 15, ay: 2, name: "王城書記官的殘影", icon: "npc_scholar",
          offer: ["「我是國王的書記官。三十年來我在這裡重複抄寫同一封信，卻始終無法送出。」", "「信的收件人是『將來打敗莫比烏斯的人』。你願意替我先清出一條路嗎？擊敗五名禁衛，我才能走到城牆邊。」"],
          wait: "「禁衛還在城牆邊巡邏。」",
          req: { type: "kill", enemy: "citadel_templar", count: 5, text: "擊敗 5 名黑曜聖殿禁衛" },
          done: ["書記官的殘影走到城牆邊，把信交到你手上。「請在最後一戰之前再讀它。」", "「還有一件事……信紙的邊角被星塵腐蝕了，需要兩份虛空星塵修補，才讀得出完整的內容。」"],
          reward: { gold: 280, exp: 220, items: { greater_potion: 2 } } },
        { zone: 2, ax: 12, ay: 3, name: "修補台", icon: "npc_mage",
          offer: ["修補台上的墨水還是溫的。把信放上去，需要兩份【虛空星塵】來還原被腐蝕的字跡。"],
          wait: "修補台需要 2 份虛空星塵。",
          req: { type: "item", item: "void_essence", count: 2, consume: true, text: "交出 2 份虛空星塵" },
          done: ["字跡一行行浮現：『孩子，如果你讀到這封信，請原諒我。我是那個把星星鎖起來的人。』", "信的最後寫著：『請在王座前，把它念給我聽。』"],
          reward: { gold: 330, exp: 250, items: { phoenix_salve: 2, mana_elixir: 2 } } },
        { zone: 3, ax: 16, ay: 3, name: "王座前的迴響", icon: "npc_goddess",
          offer: ["你站在王座前，把信大聲念了出來。每一個字都像落進深水，激起一圈圈光暈。", "「……我不求原諒。」國王的聲音從空蕩的王座傳來，沙啞而疲憊。「只求你，替我把她放回天上。」", "那是他三十年來，唯一一次沒有被莫比烏斯的怒吼蓋過的聲音。"],
          wait: "",
          req: { type: "none" },
          done: ["迴響慢慢散去，王座下的鎖鏈似乎鬆開了一點。", "【獲得手札：《國王的懺悔》】"],
          reward: { gold: 450, exp: 340, sp: 2, items: { phoenix_salve: 3, greater_potion: 3 } } }
      ],
      finalLoreText: "《國王的懺悔》：他並非天生的暴君。星核墜下時，他以為自己拯救了王國；三十年後他才明白，他只是把一個孩子鎖進了最黑的地窖。莫比烏斯的咆哮，是這份愧疚最後的形狀。"
    }
  ];

  // 對應手札（解鎖後進入圖鑑，並計入結局條件的手札數量）
  D.storyChains.forEach((c, i) => {
    D.loreEntries.push({ id: c.lore, chapter: c.chapter, title: c.finalLoreText.match(/^《.*?》/)[0], text: c.finalLoreText.replace(/^《.*?》：/, "") });
  });

  // 劇情場景：站在旁邊對話即可閱讀 (可重複閱讀)，首次附贈小獎勵
  D.storyScenes = [
    { id: "s1a", chapter: 1, zone: 1, ax: 3, ay: 6, name: "星靈・露米", icon: "npc_goddess",
      lines: ["「艾爾文，你看，海面上的紫霧又在動了。」露米飄在你肩邊，聲音很輕。", "「三十年前星星掉下來的那晚，我也在場。我只記得很大的光，還有……很多人在哭。」", "「這一次，我們一定要弄清楚為什麼。」"], reward: { gold: 30, items: { healing_potion: 1 } } },
    { id: "s1b", chapter: 1, zone: 2, ax: 8, ay: 8, name: "路過的商隊領隊", icon: "npc_elder",
      lines: ["「小哥，你要往古樹祭壇去？勸你別去。我的商隊上個月在那邊遇到怪事：樹會自己唱歌。」", "「唱的是一首很舊的曲子，有人說是在叫自己的名字。總之……別一個人走。」"], reward: { gold: 40, items: { moon_herb: 1 } } },
    { id: "s1c", chapter: 1, zone: 3, ax: 4, ay: 9, name: "星靈・露米", icon: "npc_goddess",
      lines: ["「前面就是荊棘巨獸的祭壇了。艾爾文，如果你覺得害怕，可以先回頭去村子看看。」", "「我不是在勸你放棄。只是想讓你知道：不管你選哪條路，我都會陪你。」"], reward: { gold: 40, items: { greater_potion: 1 } } },
    { id: "s2a", chapter: 2, zone: 1, ax: 6, ay: 5, name: "溺水旅人的亡靈", icon: "npc_elder",
      lines: ["「鐘樓被水淹的那天，我正在修最後一根指針。」亡靈的聲音像水泡破裂。", "「我沒能逃出去。但我記得整點鐘響的聲音……那是我這輩子聽過最溫柔的聲音。」"], reward: { gold: 60, items: { mana_elixir: 1 } } },
    { id: "s2b", chapter: 2, zone: 2, ax: 9, ay: 8, name: "星靈・露米", icon: "npc_goddess",
      lines: ["「這些齒輪……我好像在哪裡見過。艾爾文，你有沒有覺得這座鐘樓的聲音，和你胸口那塊古墜的脈動很像？」", "「也許，你並不是偶然來到這裡的。」"], reward: { gold: 60, items: { healing_potion: 2 } } },
    { id: "s2c", chapter: 2, zone: 3, ax: 4, ay: 9, name: "刻在牆上的留言", icon: "npc_scholar",
      lines: ["牆上刻著一行潦草的字：「下一個到達這裡的人，請別恨時之守衛。它只是被命令守住這裡。」", "字的下方還有一行更小的：「如果它問你問題，請誠實地回答。」"], reward: { gold: 70, items: { greater_potion: 1 } } },
    { id: "s3a", chapter: 3, zone: 1, ax: 4, ay: 8, name: "礦坑看門人", icon: "npc_dwarf",
      lines: ["「熔爐醒了，是不是？我在這裡守了三十年，終於有人活著走進來。」老矮人拍了拍身旁的鐵砧。", "「鐵砧借你用，記得把裝備練到最好。這裡面的東西，可不是靠運氣能打贏的。」"], reward: { gold: 80, items: { meteor_iron: 1 } } },
    { id: "s3b", chapter: 3, zone: 2, ax: 9, ay: 9, name: "星靈・露米", icon: "npc_goddess",
      lines: ["「好燙……這片大廳的熱度不只是熔岩，還有一種很沉的悲傷。」露米縮在你的披風後面。", "「矮人們不是壞人，對嗎？他們只是……被逼著做了不該做的事。」"], reward: { gold: 80, items: { star_bomb: 1 } } },
    { id: "s3c", chapter: 3, zone: 3, ax: 4, ay: 9, name: "龍巢外的低鳴", icon: "npc_goddess",
      lines: ["岩壁後傳來低沉的龍吟，像在警告，也像在哀求。", "地上放著一朵被烤焦的花，花莖上繫著一根細小的紅線——像是孩子留下的祭品。"], reward: { gold: 90, items: { phoenix_salve: 1 } } },
    { id: "s4a", chapter: 4, zone: 1, ax: 5, ay: 9, name: "雲海中的旅人", icon: "npc_scholar",
      lines: ["「星橋沒有扶手，往下看會頭暈，所以我通常看著天空走路。」旅人笑得有點尷尬。", "「聽說這座星象院曾能預知任何災難，只是最後一次預言，沒有人敢公布。」"], reward: { gold: 100, items: { mana_elixir: 2 } } },
    { id: "s4b", chapter: 4, zone: 2, ax: 9, ay: 9, name: "星靈・露米", icon: "npc_goddess",
      lines: ["「艾爾文，梅林老師的信……我想你已經讀過了吧。」露米沒有看你，只是看著天球儀慢慢轉動。", "「無論你是誰的孩子，你都是你自己。這一點，我很確定。」"], reward: { gold: 100, items: { healing_potion: 3 } } },
    { id: "s4c", chapter: 4, zone: 3, ax: 4, ay: 9, name: "審判席的陰影", icon: "npc_mage",
      lines: ["審判席上刻著一行小字：「在此宣判的每一個人，都曾以為自己是對的。」", "字下面堆著一小疊被碾碎的星塵，像是有人在這裡哭過。"], reward: { gold: 110, items: { greater_potion: 2 } } },
    { id: "s5a", chapter: 5, zone: 1, ax: 5, ay: 9, name: "星核意志的回聲", icon: "npc_goddess",
      lines: ["「我記得你，艾爾文。你是那個襁褓裡的嬰兒，被梅林抱走的那個。」艾歐拉的聲音在風裡很遠。", "「如果你要來見我，請走到最後。我等了三十年，不差這一點。」"], reward: { gold: 120, items: { phoenix_salve: 1 } } },
    { id: "s5b", chapter: 5, zone: 2, ax: 9, ay: 9, name: "星靈・露米", icon: "npc_goddess",
      lines: ["「就快到了。」露米的光有點發抖。「艾爾文，不管最後你做出什麼決定……謝謝你一路走到這裡。」", "「我會一直記得這段旅程。每一座鐘樓、每一爐火、每一條星橋。」"], reward: { gold: 120, items: { greater_potion: 2 } } },
    { id: "s5c", chapter: 5, zone: 3, ax: 4, ay: 9, name: "王座前的迴廊", icon: "npc_elder",
      lines: ["石柱上刻著歷代守護者的名字，最後一個空著。", "你伸手觸碰那片空白，指尖留下一道星光，像是在說：「我也在這裡。」"], reward: { gold: 150, items: { phoenix_salve: 2 } } }
  ];
})(
  (typeof window !== "undefined" && window.GAME_DATA) || require("./data.js").GAME_DATA
);
