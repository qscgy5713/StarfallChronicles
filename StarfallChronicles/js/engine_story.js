/**
 * 劇情系統 (Story)
 * 以 mixin 形式掛到 StarfallEngine.prototype：三段式故事支線（接取/回報/下一段）、劇情場景 NPC 的放置與互動。
 * 資料在 data_story.js (GAME_DATA.storyChains / storyScenes)。
 */
class StoryMixin {
  getStoryState(id) {
    if (!this.state.story) this.state.story = {};
    if (!this.state.story[id]) this.state.story[id] = { step: 0, accepted: false, kills: 0, done: false };
    return this.state.story[id];
  }

  getStoryChains(chapter) {
    return (this.data.storyChains || []).filter(c => chapter === undefined || c.chapter === chapter);
  }

  // 目前這一段的需求進度
  getStoryProgress(chain, st) {
    const step = chain.steps[st.step];
    const r = step.req;
    if (r.type === "kill") return { cur: Math.min(st.kills, r.count), target: r.count, ready: st.kills >= r.count };
    if (r.type === "item") {
      const cur = this.state.inventory[r.item] || 0;
      return { cur: Math.min(cur, r.count), target: r.count, ready: cur >= r.count };
    }
    return { cur: 1, target: 1, ready: true };
  }

  // 站在 (ax,ay) 附近找最近的空地（不得有事件、不得是玩家所在格）
  _findStoryTile(ax, ay) {
    const m = this.activeMap;
    const H = m.length, W = m[0].length;
    for (let r = 0; r <= 12; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          const x = ax + dx, y = ay + dy;
          if (x < 2 || y < 2 || x >= W - 2 || y >= H - 2) continue;
          if (m[y][x] !== "." || this.activeEvents[`${x},${y}`]) continue;
          if (x === this.state.x && y === this.state.y) continue;
          // 必須位於開闊處（八個鄰格都是空地），避免 NPC 擋住走廊使地圖不連通
          let open = true;
          for (let ny = -1; ny <= 1 && open; ny++) {
            for (let nx = -1; nx <= 1; nx++) {
              if ((nx || ny) && (m[y + ny][x + nx] !== "." || this.activeEvents[`${x + nx},${y + ny}`])) { open = false; break; }
            }
          }
          if (!open) continue;
          return { x, y };
        }
      }
    }
    return null;
  }

  _removeStoryEvents() {
    Object.entries(this.activeEvents).forEach(([coord, ev]) => {
      if (!ev || !(ev.storyChain || ev.sceneId)) return;
      const [x, y] = coord.split(",").map(Number);
      if (this.activeMap[y]) this.activeMap[y][x] = ".";
      delete this.activeEvents[coord];
      delete this.activeLabels[coord];
    });
  }

  // 依目前章節/子區域放置故事 NPC 與劇情場景
  placeStoryEvents() {
    if (this.state.inAbyss) return;
    const ch = this.state.chapter, z = this.state.subZone || 1;
    const put = (a, ev) => {
      const pos = this._findStoryTile(a.ax, a.ay);
      if (!pos) return;
      this.activeMap[pos.y][pos.x] = "N";
      this.activeEvents[`${pos.x},${pos.y}`] = ev;
      this.activeLabels[`${pos.x},${pos.y}`] = ev.storyChain ? `${ev.name}（故事）` : ev.name;
    };
    this.getStoryChains(ch).forEach(chain => {
      const st = this.getStoryState(chain.id);
      const step = !st.done && chain.steps[st.step];
      if (step && step.zone === z) {
        put(step, { type: "npc", id: `story_${chain.id}_${st.step}`, name: step.name, icon: step.icon, storyChain: chain.id, dialogue: [] });
      }
    });
    (this.data.storyScenes || []).filter(s => s.chapter === ch && s.zone === z).forEach(s => {
      put(s, { type: "npc", id: `scene_${s.id}`, name: s.name, icon: s.icon, sceneId: s.id, dialogue: s.lines, firstReward: this.state.flags[`scene_${s.id}`] ? undefined : s.reward });
    });
  }

  refreshStoryEvents() {
    this._removeStoryEvents();
    this.placeStoryEvents();
  }

  getStoryNpcPos(chainId) {
    for (const [coord, ev] of Object.entries(this.activeEvents)) {
      if (ev && ev.storyChain === chainId) {
        const [x, y] = coord.split(",").map(Number);
        return { x, y };
      }
    }
    return null;
  }

  _storyOnKill(enemyId) {
    this.getStoryChains(this.state.chapter).forEach(chain => {
      const st = this.getStoryState(chain.id);
      if (st.done || !st.accepted) return;
      const r = chain.steps[st.step].req;
      if (r.type === "kill" && (r.enemy === "any" || r.enemy === enemyId)) st.kills++;
    });
  }

  _grantReward(rw) {
    const parts = [];
    let leveled = false;
    if (rw.gold) { this.state.gold += rw.gold; parts.push(`+${rw.gold}G`); }
    if (rw.sp) { this.state.skillPoints += rw.sp; parts.push(`+${rw.sp}SP`); }
    if (rw.items) {
      Object.entries(rw.items).forEach(([id, n]) => {
        this.addItem(id, n);
        parts.push(`【${this.data.items[id] ? this.data.items[id].name : id}】x${n}`);
      });
    }
    if (rw.exp) { this.state.exp += rw.exp; parts.push(`+${rw.exp}EXP`); leveled = this._levelUpFromExp(); }
    this.recalcStats(leveled);
    return parts.join(" ");
  }

  // 與故事 NPC 對話：未接取→接取；已接取→未達成顯示提示、達成則交付並進入下一段
  talkStoryNpc(ev) {
    const chain = (this.data.storyChains || []).find(c => c.id === ev.storyChain);
    if (!chain) return { ok: false };
    const st = this.getStoryState(chain.id);
    if (st.done) return { ok: false };
    const step = chain.steps[st.step];
    let lines = [], rewardText = "";
    if (!st.accepted) {
      st.accepted = true;
      st.kills = 0;
      lines = [...step.offer];
      this.log(`[${chain.title.replace(/^【故事】/, "故事")}] 接取：${step.req.text || "與對方交談"}`, "success");
    }
    const prog = this.getStoryProgress(chain, st);
    let completed = false;
    if (step.req.type === "none") completed = true;
    else if (lines.length === 0) {
      if (prog.ready) completed = true;
      else lines = [step.wait, `【進度 ${prog.cur}/${prog.target}】${step.req.text}`];
    } else {
      lines.push(`【任務】${step.req.text}（${prog.cur}/${prog.target}）`);
    }
    if (completed) {
      if (step.req.type === "item") {
        this.state.inventory[step.req.item] -= step.req.count;
        if (this.state.inventory[step.req.item] <= 0) delete this.state.inventory[step.req.item];
      }
      lines.push(...step.done);
      rewardText = this._grantReward(step.reward || {});
      st.step++;
      st.accepted = false;
      st.kills = 0;
      if (st.step >= chain.steps.length) {
        st.done = true;
        this.state.flags[`story_${chain.id}_done`] = true;
        if (chain.lore && !this.state.loreUnlocked.includes(chain.lore)) this.state.loreUnlocked.push(chain.lore);
        this.log(`[故事完成] 【${chain.title.replace(/^【故事】/, "")}】的故事走到了結尾，新的手札已收入圖鑑。`, "achievement");
      } else {
        this.log(`[故事進展] 【${chain.title.replace(/^【故事】/, "")}】：${chain.steps[st.step].name}（${this.state.chapter}-${chain.steps[st.step].zone} 區）在等你。`, "success");
      }
      if (typeof window !== "undefined" && window.soundSystem) window.soundSystem.sfx("levelup");
      this.refreshStoryEvents();
      this.checkMilestoneAchievements();
    }
    if (typeof window !== "undefined" && window.gameUI) window.gameUI.showDialogueModal(ev.name, ev.icon, lines, rewardText);
    return { ok: true, completed, lines, rewardText };
  }

  // 任務面板用：本章各條故事的狀態
  getStoryLog() {
    return this.getStoryChains(this.state.chapter).map(chain => {
      const st = this.getStoryState(chain.id);
      if (st.done) return { chain, done: true, text: "已完成" };
      const step = chain.steps[st.step];
      const z = this.state.subZone || 1;
      const pos = step.zone === z ? this.getStoryNpcPos(chain.id) : null;
      const where = pos ? `本區 (${pos.x},${pos.y})` : `${this.state.chapter}-${step.zone} 區`;
      if (!st.accepted) return { chain, done: false, text: `第 ${st.step + 1}/${chain.steps.length} 段：到${where}找【${step.name}】` };
      const p = this.getStoryProgress(chain, st);
      return { chain, done: false, text: `第 ${st.step + 1}/${chain.steps.length} 段：${step.req.text}（${p.cur}/${p.target}），完成後回${where}找【${step.name}】` };
    });
  }
}

const StarfallStory = {};
Object.getOwnPropertyNames(StoryMixin.prototype)
  .filter(n => n !== "constructor")
  .forEach(n => { StarfallStory[n] = StoryMixin.prototype[n]; });

if (typeof window !== "undefined") window.StarfallStory = StarfallStory;
if (typeof module !== "undefined" && module.exports) module.exports = { StarfallStory };
