/**
 * 目標導引與尋路 (Objective & Pathing)
 * 以 mixin 形式掛到 StarfallEngine.prototype：主線目標導引（getCurrentObjective / 各章步驟）、導引路徑與尋路。
 */
class ObjectiveMixin {
  findTileByEventId(eventId, fallbackX, fallbackY) {
    for (const [coord, ev] of Object.entries(this.activeEvents)) {
      if (ev && ev.id === eventId) {
        const [cx, cy] = coord.split(",").map(Number);
        if (this.activeMap[cy] && this.activeMap[cy][cx] !== ".") {
          return { x: cx, y: cy };
        }
      }
    }
    return { x: fallbackX, y: fallbackY };
  }

  // ==================== 多子區域明確步驟目標導引系統 ====================
  getCurrentObjective() {
    const obj = this._baseObjective();
    const s = this.state;
    if (s.inAbyss || !obj) return obj;
    if (obj.boss && !this.isChapterGateOpen(s.chapter)) {
      const g = this.getChapterGate(s.chapter);
      const here = g.elite && g.elite.zone === (s.subZone || 1);
      return {
        x: here ? g.elite.x : 2, y: here ? g.elite.y : 2, gate: true,
        step: `章節認證 ${g.done}/${g.need}`,
        text: `公會認證：先完成 ${g.need} 件獵人公會委託（目前 ${g.done}/${g.need}）${g.eliteOk ? "" : `並討伐${g.elite ? `${g.elite.name}（${s.chapter}-${g.elite.zone} 區 (${g.elite.x},${g.elite.y})）` : "本章菁英"}`}，才能挑戰本章首領！`,
        sub: "點右側【委託板】接取委託：狩獵魔物、剝取素材都算；菁英討伐是必要委託。魔物在營火休息後會重生。"
      };
    }
    const ready = this.getBoardQuests().filter(q => q.ready && !q.completed).length;
    if (ready > 0) obj.sub = `委託板有 ${ready} 件委託可以領取獎勵！ ` + (obj.sub || "");
    return obj;
  }

  _baseObjective() {
    const s = this.state;
    const ch = s.chapter;
    const z = s.subZone || 1;

    if (s.inAbyss) {
      const bossFlag = `abyss_boss_${s.abyssFloor}`;
      if (!s.flags[bossFlag]) {
        return {
          x: 16,
          y: 10,
          step: `星淵第 ${s.abyssFloor} 層`,
          text: `當前目標：前往右下角 (16,10) 擊敗本層【深淵首領】！`,
          sub: "沿途可開啟寶箱或於左上角營火 (2,2) 恢復體力。"
        };
      }
      return {
        x: 18,
        y: 10,
        step: `星淵第 ${s.abyssFloor} 層`,
        text: `當前目標：前往右下角 (18,10) 踏入【星淵傳送陣】進入下一層！`,
        sub: "踏入傳送陣即可挑戰更深層的星淵裂隙。"
      };
    }

    if (ch === 1) {
      if (z === 1) {
        if (!s.keys["key_rusty_gate"]) {
          return {
            x: 4,
            y: 1,
            step: "區域 1-1",
            text: "主線目標：前往漁村北方 (4,1) 與【老村長・奧爾森】對話，領取守林人銅鑰！",
            sub: "支線提示：漁村南方的【草藥師・艾琳 (2,11)】正在徵集 3 株月光螢草。"
          };
        }
        if (this.activeMap[3] && this.activeMap[3][7] === "G") {
          return {
            x: 7,
            y: 3,
            step: "區域 1-1",
            text: "主線目標：前往村莊東側 (7,3) 使用銅鑰打開【村口防禦門】！",
            sub: "打開鐵門後即可進入外圍林道。"
          };
        }
        if (!s.flags["s1_west"]) {
          return {
            x: 1,
            y: 6,
            step: "區域 1-1",
            text: "主線目標：前往林道西側 (1,6) 點亮第一座【日升古碑 (I)】(0/3)",
            sub: "點亮全部三座古碑可解除東側的幽林封印門。"
          };
        }
        if (!s.flags["s1_south"]) {
          const s2X = this.activeMap[11] && this.activeMap[11][4] === "S" ? 4 : 5;
          return {
            x: s2X,
            y: 11,
            step: "區域 1-1",
            text: `主線目標：前往林道南側 (${s2X},11) 點亮第二座【月隱古碑 (II)】(1/3)`,
            sub: "南側寶箱 (3,12) 藏有防具【迷霧巡林皮甲】，別忘了探索拾取。"
          };
        }
        if (!s.flags["s1_east"]) {
          return {
            x: 16,
            y: 3,
            step: "區域 1-1",
            text: "主線目標：前往林道東北方 (16,3) 點亮第三座【北極星碑 (III)】(2/3)",
            sub: "注意：森林狼與古樹精皆懼怕【烈焰】與【星輝】屬性攻擊！"
          };
        }
        if (this.activeMap[7] && this.activeMap[7][11] === "G") {
          return {
            x: 11,
            y: 7,
            step: "區域 1-1",
            text: "主線目標：前往中央 (11,7) 穿過已解封的【幽林封印門】！",
            sub: "三座星碑已完成共鳴。"
          };
        }
        return {
          x: 18,
          y: 7,
          step: "區域 1-1",
          text: "主線目標：前往東側出口 (18,7) 進入【1-2：迷霧幽林深處】！",
          sub: "踏上 > 階梯即可切換至下一子區域。"
        };
      }
      if (z === 2) {
        if (!s.flags["ch1_z2_bridge"]) {
          return {
            x: 9,
            y: 3,
            step: "區域 1-2",
            text: "主線目標：前往北側林地 (9,3) 啟動【溪流木橋閥】放下跨越深澗的木橋！",
            sub: "支線提示：左上方的【獵人・雷恩 (3,2)】懸賞討伐東北方的【蝕影狼王 (15,3)】。"
          };
        }
        if (this.activeMap[11] && this.activeMap[11][8] === "G") {
          return {
            x: 8,
            y: 11,
            step: "區域 1-2",
            text: "主線目標：前往南側林道 (8,11) 穿過已解鎖的荊棘柵欄！",
            sub: "別忘了先在西南方 (4,11) 閱讀《星辰植物學筆記》記下符文密碼線索。"
          };
        }
        if (!s.loreUnlocked.includes("lore_3") && !s.flags["ch1_sanctum_unlocked"]) {
          return {
            x: 4,
            y: 11,
            step: "區域 1-2",
            text: "探索線索：前往西南方 (4,11) 閱讀《星辰植物學筆記》，獲取古樹聖所的密碼線索！",
            sub: "筆記中記載著三座星碑筆劃順序的關鍵數字。"
          };
        }
        return {
          x: 18,
          y: 11,
          step: "區域 1-2",
          text: "主線目標：前往東南出口 (18,11) 進入【1-3：古樹祭壇與腐化聖所】！",
          sub: "若尚未討伐東北方的【菁英：蝕影狼王 (15,3)】，可先擊敗牠換取狼王銀牙護符。"
        };
      }
      if (!s.flags["ch1_sanctum_unlocked"]) {
        return {
          x: 8,
          y: 3,
          step: "區域 1-3",
          text: "主線目標：前往左上方 (8,3) 解開【古樹符文鎖】開啟聖所內殿門！",
          sub: "密碼線索記載於 1-2 西南方的《星辰植物學筆記》中。"
        };
      }
      if (this.activeMap[7] && this.activeMap[7][11] === "G") {
        return {
          x: 11,
          y: 7,
          step: "區域 1-3",
          text: "主線目標：穿過中央 (11,7) 的【聖所內殿門】直面森林首領！",
          sub: "建議先在左上方營火 (2,2) 休息並於鐵砧 (4,2) 強化裝備。"
        };
      }
      if (!s.flags["ch1_boss_defeated"]) {
        return {
          x: 15,
          y: 7,
          step: "區域 1-3",
          boss: true,
          text: "首領決戰：前往祭壇中央 (15,7) 擊敗【首領：荊棘巨獸・巴爾薩】！",
          sub: "弱點提示：荊棘巨獸懼怕【烈焰】與【星輝】屬性，命中弱點可額外削盾並增傷 25%！"
        };
      }
      return {
        x: 18,
        y: 7,
        step: "區域 1-3",
        text: "章節完成：前往東側 (18,7) 踏入【第二章傳送陣】前往沉沒鐘樓！",
        sub: "恭喜奪回森之星片與星輝羅盤！"
      };
    }

    if (ch === 2) {
      if (z === 1) {
        if (!s.flags["npc_reward_2_4,1"]) {
          return {
            x: 4,
            y: 1,
            step: "區域 2-1",
            text: "主線目標：與左上方的【鐘樓學者・薇薇安 (4,1)】對話了解水閥機關！",
            sub: "支線提示：左下方的【老鐘錶匠・霍華德 (2,11)】正在收集 3 枚精密古銅齒輪。"
          };
        }
        if (!s.flags["valve_west"]) {
          return {
            x: 1,
            y: 7,
            step: "區域 2-1",
            text: "主線目標：前往西側迴廊 (1,7) 扳動【西側排水閥】！",
            sub: "扳動後可開啟上方中央的前廳水閘門 (10,3)。"
          };
        }
        if (this.activeMap[3] && this.activeMap[3][10] === "G") {
          return {
            x: 10,
            y: 3,
            step: "區域 2-1",
            text: "主線目標：前往上方 (10,3) 穿過【前廳水閘門】！",
            sub: "穿過閘門後前往右上角啟動虹吸閥。"
          };
        }
        if (!s.flags["valve_east"]) {
          return {
            x: 17,
            y: 3,
            step: "區域 2-1",
            text: "主線目標：前往右上角 (17,3) 扳動【前廳虹吸閥】架起中央虹吸橋！",
            sub: "啟動後中央水域將浮現橋樑並解鎖底層出口。"
          };
        }
        if (this.activeMap[11] && this.activeMap[11][10] === "G") {
          return {
            x: 10,
            y: 11,
            step: "區域 2-1",
            text: "主線目標：前往下方 (10,11) 穿過底層水閘門！",
            sub: "準備前往 2-2 齒輪水閘迷宮。"
          };
        }
        return {
          x: 18,
          y: 11,
          step: "區域 2-1",
          text: "主線目標：前往東南出口 (18,11) 進入【2-2：齒輪水閘迷宮】！",
          sub: "踏上 > 階梯進入鐘樓中層。"
        };
      }
      if (z === 2) {
        if (this.activeMap[3] && this.activeMap[3][10] === "G") {
          return {
            x: 10,
            y: 3,
            step: "區域 2-2",
            text: "主線目標：前往上方 (10,3) 推開青銅格柵門！",
            sub: "支線提示：左上方的【工程師・諾亞 (4,1)】懸賞討伐東側水池的【深淵重甲巨蟹】。"
          };
        }
        if (!s.flags["ch2_z2_sluice"]) {
          return {
            x: 16,
            y: 2,
            step: "區域 2-2",
            text: "主線目標：前往右上方 (16,2) 啟動【深水洩洪總閥】排乾東側水池！",
            sub: "排乾水池後可挑戰深淵重甲巨蟹並解鎖南側通道。"
          };
        }
        if (this.activeMap[11] && this.activeMap[11][8] === "G") {
          return {
            x: 8,
            y: 11,
            step: "區域 2-2",
            text: "主線目標：前往下方 (8,11) 穿過通往時之聖堂的閘門！",
            sub: "重要：請務必先到左下角 (2,11) 拾取【鐘樓學徒日記】獲取時鐘密碼線索！"
          };
        }
        if (!s.loreUnlocked.includes("lore_5") && !s.flags["ch2_cipher_solved"]) {
          return {
            x: 2,
            y: 11,
            step: "區域 2-2",
            text: "關鍵線索：前往左下角 (2,11) 閱讀《失蹤學徒亞倫的遺言》，取得時鐘密碼線索！",
            sub: "日記中記載著時針、分針與秒針停駐的三位數刻度。"
          };
        }
        return {
          x: 18,
          y: 11,
          step: "區域 2-2",
          text: "主線目標：前往東南出口 (18,11) 進入【2-3：時之核心大聖堂】！",
          sub: "若尚未擊敗【菁英：深淵重甲巨蟹 (15,7)】，可擊敗牠向諾亞換取【深淵潮汐鱗甲】。"
        };
      }
      if (!s.flags["ch2_cipher_solved"]) {
        return {
          x: 8,
          y: 3,
          step: "區域 2-3",
          text: "主線目標：前往左上方 (8,3) 操作【時鐘密碼終端】解鎖核心大門！",
          sub: "密碼線索記載於 2-2 左下角的《失蹤學徒亞倫的遺言》中。"
        };
      }
      if (this.activeMap[7] && this.activeMap[7][11] === "G") {
        return {
          x: 11,
          y: 7,
          step: "區域 2-3",
          text: "主線目標：穿過中央 (11,7) 的【時之核心大門】！",
          sub: "建議先在左上方營火與鐵砧整備狀態。"
        };
      }
      if (!s.flags["ch2_boss_defeated"]) {
        return {
          x: 15,
          y: 7,
          step: "區域 2-3",
          boss: true,
          text: "首領決戰：前往聖堂中央 (15,7) 擊敗【首領：時之守衛・克羅諾斯】！",
          sub: "弱點提示：克羅諾斯懼怕【星輝】與【烈焰】屬性攻擊！"
        };
      }
      return {
        x: 18,
        y: 7,
        step: "區域 2-3",
        text: "章節完成：前往東側 (18,7) 踏入【第三章傳送陣】前往熔岩鍛造廠！",
        sub: "恭喜奪回潮之星片與時之懷錶！"
      };
    }

    if (ch === 3) {
      if (z === 1) {
        if (!s.keys["dwarven_sigil"]) {
          return {
            x: 7,
            y: 1,
            step: "區域 3-1",
            text: "主線目標：與北側的【鐵匠宗師・托爾金 (7,1)】對話領取鍛造王火紋章！",
            sub: "支線提示：左下方的【鍛造學徒・巴頓 (2,11)】需要 3 塊星隕玄鐵。"
          };
        }
        if (this.activeMap[3] && this.activeMap[3][10] === "G") {
          return {
            x: 10,
            y: 3,
            step: "區域 3-1",
            text: "主線目標：前往上方 (10,3) 打開【矮人礦道門】！",
            sub: "出示鍛造王火紋章即可通過。"
          };
        }
        if (!s.flags["lava_east"]) {
          return {
            x: 17,
            y: 3,
            step: "區域 3-1",
            text: "主線目標：前往右上角 (17,3) 扳動【礦道排熱主閥】凝結黑曜石橋！",
            sub: "凝結成橋後即可跨越熔岩河前往南側出口。"
          };
        }
        if (this.activeMap[11] && this.activeMap[11][10] === "G") {
          return {
            x: 10,
            y: 11,
            step: "區域 3-1",
            text: "主線目標：前往下方 (10,11) 穿過通往萬爐大廳的閘門！",
            sub: "準備進入 3-2 萬爐熔岩大廳。"
          };
        }
        return {
          x: 18,
          y: 11,
          step: "區域 3-1",
          text: "主線目標：前往東南出口 (18,11) 進入【3-2：萬爐熔岩大廳】！",
          sub: "踏上 > 階梯深入鍛造廠核心。"
        };
      }
      if (z === 2) {
        if (this.activeMap[3] && this.activeMap[3][10] === "G") {
          return {
            x: 10,
            y: 3,
            step: "區域 3-2",
            text: "主線目標：前往上方 (10,3) 推開黑曜石隔熱門！",
            sub: "支線提示：左上方的【老礦工・格imli (4,1)】請求你擊敗東側的【熔核督軍・瓦爾坎】。"
          };
        }
        if (!s.flags["ch3_z2_sluice"]) {
          return {
            x: 16,
            y: 2,
            step: "區域 3-2",
            text: "主線目標：前往右上方 (16,2) 啟動【高爐冷卻總閥】！",
            sub: "啟動後可冷卻東側岩漿池並開啟南側王座通道。"
          };
        }
        if (this.activeMap[11] && this.activeMap[11][8] === "G") {
          return {
            x: 8,
            y: 11,
            step: "區域 3-2",
            text: "主線目標：前往下方 (8,11) 穿過南側高爐閘門！",
            sub: "重要：請先到左下角 (2,11) 閱讀《熔岩流向控制手冊》取得三聖物密碼線索！"
          };
        }
        if (!s.loreUnlocked.includes("lore_8") && !s.flags["ch3_riddle_solved"]) {
          return {
            x: 2,
            y: 11,
            step: "區域 3-2",
            text: "關鍵線索：前往左下角 (2,11) 閱讀《熔岩流向控制手冊》，取得矮人王座符文鎖密碼！",
            sub: "手冊中記載著矮人三聖物的排列順序。"
          };
        }
        return {
          x: 18,
          y: 11,
          step: "區域 3-2",
          text: "主線目標：前往東南出口 (18,11) 進入【3-3：鍛造王座與炎龍巢穴】！",
          sub: "擊敗【菁英：熔核督軍瓦爾坎 (15,7)】可向老礦工領取 3 塊星隕玄鐵鍛造神兵。"
        };
      }
      if (!s.flags["ch3_riddle_solved"]) {
        return {
          x: 8,
          y: 3,
          step: "區域 3-3",
          text: "主線目標：前往左上方 (8,3) 解開【矮人王座符文鎖】！",
          sub: "密碼線索記載於 3-2 左下角的《熔岩流向控制手冊》中。"
        };
      }
      if (this.activeMap[7] && this.activeMap[7][11] === "G") {
        return {
          x: 11,
          y: 7,
          step: "區域 3-3",
          text: "主線目標：穿過中央 (11,7) 的【巨龍王座門】！",
          sub: "右下角寶箱 (17,11) 藏有強力的【赤焰星隕巨劍】。"
        };
      }
      if (!s.flags["ch3_boss_defeated"]) {
        return {
          x: 15,
          y: 7,
          step: "區域 3-3",
          boss: true,
          text: "首領決戰：前往王座中央 (15,7) 擊敗【首領：赤焰巨龍・伊格尼斯】！",
          sub: "弱點提示：赤焰巨龍懼怕【寒霜】與【虛空】屬性戰技！"
        };
      }
      return {
        x: 18,
        y: 7,
        step: "區域 3-3",
        text: "章節完成：前往東側 (18,7) 踏入【第四章傳送陣】前往浮空星象院！",
        sub: "你已奪回焰之星片！"
      };
    }

    if (ch === 4) {
      if (z === 1) {
        if (!s.keys["astral_lens"]) {
          return {
            x: 3,
            y: 3,
            step: "區域 4-1",
            text: "主線目標：與左側的【觀星師梅林 (3,3)】對話領取觀星稜鏡！",
            sub: "支線提示：左下方的【星魂書記官・賽琳 (2,11)】委託你收集滿 9 篇星辰手札。"
          };
        }
        if (this.activeMap[3] && this.activeMap[3][10] === "G") {
          return {
            x: 10,
            y: 3,
            step: "區域 4-1",
            text: "主線目標：前往上方 (10,3) 打開【光學結界門】！",
            sub: "使用觀星稜鏡折射星光解除結界。"
          };
        }
        if (!s.flags["astrolabe_east"]) {
          return {
            x: 17,
            y: 3,
            step: "區域 4-1",
            text: "主線目標：前往右上角 (17,3) 啟動【北極天樞星盤】架起銀河星橋！",
            sub: "啟動後中央虛空將浮現星光橋樑。"
          };
        }
        if (this.activeMap[11] && this.activeMap[11][10] === "G") {
          return {
            x: 10,
            y: 11,
            step: "區域 4-1",
            text: "主線目標：前往下方 (10,11) 穿過內院星門！",
            sub: "重要：穿過前請先閱讀左下角 (4,11) 的《星象院最高機密檔案》取得認證編號。"
          };
        }
        if (!s.loreUnlocked.includes("lore_10") && !s.flags["ch4_cipher_solved"]) {
          return {
            x: 4,
            y: 11,
            step: "區域 4-1",
            text: "關鍵線索：前往左下方 (4,11) 閱讀《星象院最高機密檔案》，取得報告編號線索！",
            sub: "檔案中記載了『永晝計畫』的兩位數報告編號。"
          };
        }
        return {
          x: 18,
          y: 11,
          step: "區域 4-1",
          text: "主線目標：前往東南出口 (18,11) 進入【4-2：折光天球儀室】！",
          sub: "踏上 > 階梯前往星象院中樞。"
        };
      }
      if (z === 2) {
        if (this.activeMap[3] && this.activeMap[3][10] === "G") {
          return {
            x: 10,
            y: 3,
            step: "區域 4-2",
            text: "主線目標：前往上方 (10,3) 穿過星紋折光門！",
            sub: "支線提示：左上方的【觀星學徒・露娜 (4,1)】請求你擊敗東側的【虛空雙子審判官】。"
          };
        }
        if (!s.flags["ch4_z2_prism"]) {
          return {
            x: 16,
            y: 2,
            step: "區域 4-2",
            text: "主線目標：前往右上方 (16,2) 啟動【天球主折光鏡】！",
            sub: "啟動後可架起東側星橋並解鎖通往審判穹頂的大門。"
          };
        }
        if (this.activeMap[11] && this.activeMap[11][8] === "G") {
          return {
            x: 8,
            y: 11,
            step: "區域 4-2",
            text: "主線目標：前往下方 (8,11) 穿過星界結界門！",
            sub: "準備前往 4-3 觀星審判穹頂。"
          };
        }
        return {
          x: 18,
          y: 11,
          step: "區域 4-2",
          text: "主線目標：前往東南出口 (18,11) 進入【4-3：觀星審判穹頂】！",
          sub: "擊敗【菁英：虛空雙子審判官 (15,7)】可向露娜換取【星穹共鳴指環】。"
        };
      }
      if (!s.flags["ch4_cipher_solved"]) {
        return {
          x: 8,
          y: 3,
          step: "區域 4-3",
          text: "主線目標：前往左上方 (8,3) 完成【天球儀認證終端】！",
          sub: "報告編號線索記載於 4-1 左下方的《星象院最高機密檔案》中。"
        };
      }
      if (this.activeMap[7] && this.activeMap[7][11] === "G") {
        return {
          x: 11,
          y: 7,
          step: "區域 4-3",
          text: "主線目標：穿過中央 (11,7) 的【審判聖殿門】！",
          sub: "右下角寶箱 (17,11) 藏有傳說防具【星織天衣】。"
        };
      }
      if (!s.flags["ch4_boss_defeated"]) {
        return {
          x: 15,
          y: 7,
          step: "區域 4-3",
          boss: true,
          text: "首領決戰：前往穹頂中央 (15,7) 擊敗【首領：虛空星使・阿斯特拉】！",
          sub: "弱點提示：阿斯特拉懼怕【虛空】與【物理】屬性戰技！"
        };
      }
      return {
        x: 18,
        y: 7,
        step: "區域 4-3",
        text: "章節完成：前往東側 (18,7) 踏入【第五章傳送陣】前往星核聖殿！",
        sub: "四枚星核碎片已全數集齊！"
      };
    }

    // 第五章
    if (z === 1) {
      if (!s.flags["npc_reward_5_3,3"] && !s.flags["npc_reward_5_1_3,3"]) {
        return {
          x: 3,
          y: 3,
          step: "區域 5-1",
          text: "主線目標：與左側的【星核意志・艾歐拉 (3,3)】對話解開王城內環封印！",
          sub: "支線提示：左下方的【近衛英靈・凱恩 (2,11)】請你點亮外環兩座淨化星碑。"
        };
      }
      if (!s.loreUnlocked.includes("lore_14") && !s.flags["ch5_throne_unlocked"]) {
        return {
          x: 3,
          y: 6,
          step: "區域 5-1",
          text: "關鍵線索：前往左側 (3,6) 閱讀《噬星者莫比烏斯的誕生》，記下王座終極封印碼！",
          sub: "手札中記載了開啟 5-3 最終王座大門的三位數封印碼。"
        };
      }
      if (this.activeMap[3] && this.activeMap[3][10] === "G") {
        return {
          x: 10,
          y: 3,
          step: "區域 5-1",
          text: "主線目標：前往上方 (10,3) 打開【王城內環門】！",
          sub: "艾歐拉的祝福已為你解除內環門鎖定。"
        };
      }
      if (!s.flags["sanctum_altar_2"]) {
        return {
          x: 17,
          y: 3,
          step: "區域 5-1",
          text: "主線目標：前往右上角 (17,3) 啟動【東側淨化星碑 (II)】架起創世星橋！",
          sub: "若同時點亮西側淨化星碑 (3,7)，還可向凱恩領取支線獎勵！"
        };
      }
      if (this.activeMap[11] && this.activeMap[11][10] === "G") {
        return {
          x: 10,
          y: 11,
          step: "區域 5-1",
          text: "主線目標：前往下方 (10,11) 穿過內環通道門！",
          sub: "準備進入 5-2 四象星核迴廊。"
        };
      }
      return {
        x: 18,
        y: 11,
        step: "區域 5-1",
        text: "主線目標：前往東南出口 (18,11) 進入【5-2：四象星核迴廊】！",
        sub: "踏上 > 階梯邁向王座迴廊。"
      };
    }
    if (z === 2) {
      if (this.activeMap[3] && this.activeMap[3][10] === "G") {
        return {
          x: 10,
          y: 3,
          step: "區域 5-2",
          text: "主線目標：前往上方 (10,3) 推開皇家禁衛迴廊大門！",
          sub: "支線提示：左上方的【近衛英靈・凱恩 (4,1)】請求你賜予【黑曜禁衛統領・雷吉斯】榮耀的安息。"
        };
      }
      if (!s.flags["ch5_z2_bridge"]) {
        return {
          x: 16,
          y: 2,
          step: "區域 5-2",
          text: "主線目標：前往右上方 (16,2) 啟動【皇家星樞開關】！",
          sub: "啟動後可架起東側星橋並解鎖通往永恆星核王座的大門。"
        };
      }
      if (this.activeMap[11] && this.activeMap[11][8] === "G") {
        return {
          x: 8,
          y: 11,
          step: "區域 5-2",
          text: "主線目標：前往下方 (8,11) 穿過通往王座廳的結界門！",
          sub: "擊敗【菁英：黑曜禁衛統領雷吉斯 (15,7)】可向凱恩領取傳說聖物【星核之眸】！"
        };
      }
      return {
        x: 18,
        y: 11,
        step: "區域 5-2",
        text: "主線目標：前往東南出口 (18,11) 進入【5-3：永恆星核王座】！",
        sub: "做好萬全準備，即將迎戰最終首領！"
      };
    }
    if (!s.flags["ch5_throne_unlocked"]) {
      return {
        x: 8,
        y: 3,
        step: "區域 5-3",
        text: "主線目標：前往左上方 (8,3) 解開【王座封印終端】！",
        sub: "封印碼線索記載於 5-1 左側的《噬星者莫比烏斯的誕生》手札中。"
      };
    }
    if (this.activeMap[7] && this.activeMap[7][11] === "G") {
      return {
        x: 11,
        y: 7,
        step: "區域 5-3",
        text: "主線目標：穿過中央 (11,7) 的【星核王座大門】！",
        sub: "最終首領就在門後，建議先在營火 (2,2) 與鐵砧 (4,2) 將裝備強化至最高等級！"
      };
    }
    return {
      x: 15,
      y: 7,
      step: "最終決戰",
      boss: true,
      text: "最終決戰：前往王座中央 (15,7) 擊敗【最終首領：噬星者・莫比烏斯】，決定阿卡迪亞的命運！",
      sub: "擊敗莫比烏斯後即可選擇多重結局！"
    };
  }

  // 雙階段智慧避障尋路：優先繞過非目標的怪物/鐵砧/NPC，若窄道被怪物擋住則自動走向該怪物開戰
  findGuidePath(targetX, targetY) {
    const startX = this.state.x;
    const startY = this.state.y;
    if (startX === targetX && startY === targetY) return [];
    const rows = this.activeMap.length;
    const cols = this.activeMap[0].length;
    if (targetY < 0 || targetY >= rows || targetX < 0 || targetX >= cols) return [];

    const runBFS = allowObstacles => {
      const queue = [[startX, startY, []]];
      const visited = new Set([`${startX},${startY}`]);
      const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];

      while (queue.length > 0) {
        const [cx, cy, path] = queue.shift();
        for (const [dx, dy] of dirs) {
          const nx = cx + dx;
          const ny = cy + dy;
          const key = `${nx},${ny}`;
          if (nx < 0 || ny < 0 || ny >= rows || nx >= cols || visited.has(key)) continue;

          const tile = this.activeMap[ny][nx];
          if (nx === targetX && ny === targetY && tile !== "#" && tile !== "~") {
            return [...path, [dx, dy, nx, ny]];
          }
          if (
            tile === "#" ||
            tile === "~" ||
            tile === "G" ||
            tile === "W" ||
            tile === "N" ||
            tile === "R" ||
            tile === "P" ||
            tile === ">" ||
            tile === "<"
          ) {
            continue;
          }
          if (!allowObstacles && (tile === "E" || tile === "B" || tile === "A" || tile === "?" || tile === "L" || tile === "T" || tile === "D" || tile === "V" || tile === "O" || tile === "U")) {
            continue;
          }

          visited.add(key);
          queue.push([nx, ny, [...path, [dx, dy, nx, ny]]]);
        }
      }
      return [];
    };

    const cleanPath = runBFS(false);
    if (cleanPath.length > 0) return cleanPath;
    return runBFS(true);
  }

  findPath(targetX, targetY) {
    return this.findGuidePath(targetX, targetY).map(([dx, dy]) => [dx, dy]);
  }
}

const StarfallObjective = (typeof mixinFrom === "function" ? mixinFrom : require("./mixin.js").mixinFrom)(ObjectiveMixin);

if (typeof window !== "undefined") window.StarfallObjective = StarfallObjective;
if (typeof module !== "undefined" && module.exports) module.exports = { StarfallObjective };
