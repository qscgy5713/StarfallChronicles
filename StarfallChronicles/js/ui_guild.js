/**
 * 獵人公會與無盡星淵介面 (Guild UI)
 * 以 mixin 掛到 GameUI.prototype：委託板/訓練場視窗、星淵入口視窗。
 */
const GameUIGuild = {
  // 故事最後一段的選擇視窗：沿用對話視窗，台詞下方列出選項按鈕
  showStoryChoiceModal(name, icon, lines, choices, chainId) {
    this.closeModals();
    this._storyNpc = { name, icon: icon || "npc_elder" };
    document.getElementById("dialogue-npc-title").innerHTML = `${this.px.icon(icon || "npc_elder", 22)} ${name}`;
    document.getElementById("dialogue-body").innerHTML =
      lines.map(l => `<p class="dlg-p">${l}</p>`).join("") +
      `<div class="craft-title" style="margin-top:10px;">你要怎麼做？</div>` +
      choices.map((c, i) => `<button class="choice-btn" onclick="window.gameUI.onStoryChoice('${chainId}', ${i})">${c.label}</button>`).join("");
    document.getElementById("modal-dialogue").classList.add("active");
  },

  onStoryChoice(chainId, idx) {
    const npc = this._storyNpc || { name: "旅人", icon: "npc_elder" };
    const r = this.engine.resolveStoryChoice(chainId, idx);
    if (!r.ok) { this.showToast(r.msg, "warn"); return; }
    this.showDialogueModal(npc.name, npc.icon, r.lines, r.rewardText);
    this.renderAll();
  },

  renderBoardModal(tab) {
    const eng = this.engine, s = eng.state;
    const box = document.getElementById("board-body");
    if (!box) return;
    this._boardTab = tab || this._boardTab || "quests";
    const gate = eng.getChapterGate(s.chapter);
    const tabs = `<div style="display:flex;gap:8px;margin-bottom:10px;">
      <button class="${this._boardTab === "quests" ? "btn-sm btn-accent" : "btn-secondary"}" onclick="window.gameUI.renderBoardModal('quests')">委託板</button>
      <button class="${this._boardTab === "train" ? "btn-sm btn-accent" : "btn-secondary"}" onclick="window.gameUI.renderBoardModal('train')">訓練場</button>
      <button class="${this._boardTab === "travel" ? "btn-sm btn-accent" : "btn-secondary"}" onclick="window.gameUI.renderBoardModal('travel')">旅行者之門</button>
      <span style="margin-left:auto;align-self:center;color:#facc15;font-weight:700;">${s.gold} G</span></div>`;
    if (this._boardTab === "train") {
      const rows = eng.data.trainingTracks.map(t => {
        const rank = (s.train && s.train[t.id]) || 0;
        const maxed = rank >= t.max;
        const cost = eng.getTrainCost(t);
        return `<div class="inv-card"><div class="inv-card-head">
          <span><strong>${t.name}</strong> <span class="badge-cnt">${rank}/${t.max} 階</span></span>
          <button class="btn-sm btn-accent" ${maxed || s.gold < cost ? "disabled" : ""} onclick="window.gameUI.onBuyTraining('${t.id}')">${maxed ? "已滿階" : `訓練 (${cost} G)`}</button>
        </div><div class="inv-card-desc">${t.desc}（永久生效）</div></div>`;
      }).join("");
      box.innerHTML = `${tabs}<div class="inv-card-desc" style="margin-bottom:8px;">在公會訓練場花金幣做永久強化，越往上階越貴。</div>
        <div class="wide-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:8px;">${rows}</div>`;
      return;
    }
    if (this._boardTab === "travel") {
      const opts = eng.getTravelOptions();
      const rows = opts.map(o => `<div class="inv-card ${o.current ? "equipped" : ""}"><div class="inv-card-head"><span><strong>${o.chapterName}</strong></span></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px;">${o.zones.map(z => `<button class="${z.current ? "btn-accent btn-sm" : "btn-secondary"}" ${z.current || !z.visited ? "disabled" : ""} onclick="window.gameUI.onTravel(${o.chapter}, ${z.zone})">${o.chapter}-${z.zone} ${z.name}${z.visited ? "" : "（未到過）"}</button>`).join("")}</div></div>`).join("");
      box.innerHTML = `${tabs}<div class="inv-card-desc" style="margin-bottom:8px;">可以回到到過的區域：補完沒做完的故事支線、刷怪或補委託。傳送後會回到該區的入口；星淵或戰鬥中不能使用。</div>${rows}`;
      return;
    }
    const qs = eng.getBoardQuests();
    const card = q => {
      const rw = q.quest.reward;
      const rwText = [rw.gold ? `${rw.gold}G` : "", rw.exp ? `${rw.exp}EXP` : "", rw.sp ? `+${rw.sp}SP` : "",
        ...Object.entries(rw.items || {}).map(([i, n]) => `${eng.data.items[i] ? eng.data.items[i].name : i}x${n}`)].filter(Boolean).join("、");
      const btn = q.completed ? `<span class="q-tag done">已完成</span>`
        : `<button class="btn-sm ${q.ready ? "btn-teal" : "btn-secondary"}" ${q.ready ? "" : "disabled"} onclick="window.gameUI.onClaimBoard('${q.id}')">${q.ready ? "領取" : `${q.cur}/${q.target}`}</button>`;
      return `<div class="inv-card ${q.completed ? "equipped" : ""}"><div class="inv-card-head"><span><strong>${q.quest.title}</strong></span>${btn}</div>
        <div class="inv-card-desc">${q.quest.desc}<br><span style="color:#facc15;">獎勵：${rwText}</span></div></div>`;
    };
    let html = tabs;
    html += `<div class="craft-title">常駐懸賞（可重複，領取後換新的）</div>
      <div class="wide-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px;">${eng.getBounties().map(b => {
        const rw = `${b.reward.gold}G、${Object.entries(b.reward.items).map(([i, n]) => `${eng.data.items[i].name}x${n}`).join("、")}`;
        return `<div class="inv-card"><div class="inv-card-head"><span><strong>${b.title}</strong></span>
          <button class="btn-sm ${b.ready ? "btn-teal" : "btn-secondary"}" ${b.ready ? "" : "disabled"} onclick="window.gameUI.onClaimBounty(${b.index})">${b.ready ? "領取" : `${b.cur}/${b.count}`}</button></div>
          <div class="inv-card-desc"><span style="color:#facc15;">獎勵：${rw}</span></div></div>`;
      }).join("")}</div>`;
    html += `<div class="inv-card equipped" style="margin-top:10px;"><div class="inv-card-head"><strong>第 ${s.chapter} 章認證：${gate.done}/${gate.need}</strong>
      <span class="badge-key">${gate.done >= gate.need ? "已通過，可挑戰首領" : "完成足夠委託才能挑戰本章首領"}</span></div>
      <div class="inv-card-desc">魔物會在營火休息或重新進入區域後重生，可放心刷怪。前面章節的委託也能回頭補完。</div></div>`;
    for (let ch = s.chapter; ch >= 1; ch--) {
      const list = qs.filter(q => q.chapter === ch);
      html += `<div class="craft-title" style="margin-top:12px;">第 ${ch} 章委託（${list.filter(q => q.completed).length}/${list.length}）</div>
        <div class="wide-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:8px;">${list.map(card).join("")}</div>`;
    }
    box.innerHTML = html;
  },

  onTravel(ch, z) {
    const r = this.engine.travelTo(ch, z);
    if (!r.ok) { this.showToast(r.msg, "warn"); return; }
    this.closeModals();
    this.showToast(`傳送到 ${ch}-${z}：${r.zoneName}`, "teal");
    this.renderAll();
  },

  onClaimBounty(i) {
    const r = this.engine.claimBounty(i);
    this.showToast(r.ok ? `完成懸賞：${r.title}（${r.text}）` : r.msg, r.ok ? "gold" : "warn");
    this.renderBoardModal();
    this.renderHUD();
  },

  onClaimBoard(id) {
    const r = this.engine.claimBoardQuest(id);
    this.showToast(r.ok ? `完成委託：${r.quest.title}（${r.text}）` : r.msg, r.ok ? "gold" : "warn");
    this.renderBoardModal();
    this.renderAll();
  },

  onBuyTraining(id) {
    const r = this.engine.buyTraining(id);
    this.showToast(r.ok ? `【${r.track.name}】提升到第 ${r.rank} 階` : r.msg, r.ok ? "teal" : "warn");
    this.renderBoardModal();
    this.renderHUD();
  },

  renderAbyssModal() {
    const eng = this.engine;
    const s = eng.state;
    const box = document.getElementById("abyss-body");
    if (!box) return;
    const modLine = f => {
      const m = eng.getAbyssMod(f);
      return `<span class="badge-key">${m.name}</span> ${m.desc}`;
    };
    const head = `
      <div class="inv-card equipped">
        <div class="inv-card-head"><strong>歷史最高紀錄：第 ${s.maxAbyssFloor || 0} 層</strong></div>
        <div class="inv-card-desc">
          每層是一張 40×28 的裂隙，魔物隨樓層變強，擊敗層主後開啟傳送陣前往下一層。每層有固定詞綴；
          層主通關必得稀有核心與金幣，每 5 層是噬星者守關，通關有里程碑獎勵，並解鎖從下一層重新開始。
          魔物素材可用來鍛造狩獵裝備。
        </div>
      </div>`;
    if (s.inAbyss) {
      box.innerHTML = `${head}
        <div class="inv-card" style="margin-top:8px;">
          <div class="inv-card-head"><strong>目前位置：第 ${s.abyssFloor} 層</strong></div>
          <div class="inv-card-desc">本層詞綴：${modLine(s.abyssFloor)}</div>
        </div>
        <div style="display:flex;gap:10px;margin-top:10px;">
          <button class="btn-secondary" onclick="window.gameUI.closeModals()">繼續挑戰</button>
          <button class="btn-sm btn-accent" onclick="window.gameUI.onLeaveAbyss()">離開星淵（回到原本的地方）</button>
        </div>`;
      return;
    }
    const starts = eng.getAbyssStartFloors();
    box.innerHTML = `${head}
      <div class="craft-title" style="margin-top:12px;">選擇起始樓層</div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${starts
          .map(
            f => `<div class="inv-card"><div class="inv-card-head">
              <span><strong>第 ${f} 層</strong>${f > 1 ? ` <span class="badge-cnt">里程碑起點</span>` : ""}</span>
              <button class="btn-sm btn-teal" onclick="window.gameUI.onStartAbyss(${f})">進入</button>
            </div><div class="inv-card-desc">詞綴：${modLine(f)}</div></div>`
          )
          .join("")}
      </div>
      <div class="inv-card-desc" style="margin-top:10px;">進入後可隨時從這裡離開，回到進入前的位置。</div>`;
  },

  onStartAbyss(floor) {
    this.closeModals();
    this.engine.enterAbyss(floor);
    this.showToast(`踏入無盡星淵第 ${floor} 層！`, "gold");
    this.renderAll();
  },

  onLeaveAbyss() {
    this.closeModals();
    this.engine.leaveAbyss();
    this.renderAll();
  }
};

if (typeof window !== "undefined" && window.GameUI) Object.assign(window.GameUI.prototype, GameUIGuild);
if (typeof module !== "undefined" && module.exports) module.exports = { GameUIGuild };
