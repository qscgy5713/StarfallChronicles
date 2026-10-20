/**
 * 《星隕編年史：霧海遺城》 - Procedural WebAudio Synthesizer (v1.1)
 * 零外部音訊檔案依賴，100% 離線與 file:// 相容
 */
class SoundSystem {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.bgmPlaying = false;
    this.bgmMode = 'none'; // 'explore', 'combat', 'boss', 'victory'
    this.bgmTimer = null;
    this.stepIndex = 0;
    this.chapterTheme = 1;
    this.musicVol = 0.8;
    this.sfxVol = 0.8;
    try {
      const saved = JSON.parse(localStorage.getItem('starfall_volume') || 'null');
      if (saved) {
        if (typeof saved.music === 'number') this.musicVol = saved.music;
        if (typeof saved.sfx === 'number') this.sfxVol = saved.sfx;
      }
    } catch (e) { /* 無 localStorage 時使用預設音量 */ }
  }

  // 設定音量 (kind: 'music' | 'sfx'，v: 0~1)，並記住設定
  setVolume(kind, v) {
    v = Math.max(0, Math.min(1, v));
    if (kind === 'music') {
      this.musicVol = v;
      if (this.bus && this.ctx) this.bus.master.gain.setTargetAtTime(0.9 * v + 0.0001, this.ctx.currentTime, 0.05);
    } else {
      this.sfxVol = v;
    }
    try {
      localStorage.setItem('starfall_volume', JSON.stringify({ music: this.musicVol, sfx: this.sfxVol }));
    } catch (e) { /* 忽略 */ }
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopBGM();
    } else {
      this.init();
      this.startBGM(this.bgmMode === 'none' ? 'explore' : this.bgmMode, this.chapterTheme);
    }
    return this.muted;
  }

  playTone(freq, type = 'sine', duration = 0.15, vol = 0.12, slideFreq = null, delay = 0) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideFreq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideFreq), now + duration);
    }

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(Math.max(0.0002, vol * this.sfxVol), now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  sfx(name) {
    if (this.muted) return;
    switch (name) {
      case 'step':
        this.playTone(130 + Math.random() * 25, 'triangle', 0.05, 0.04, 80);
        break;
      case 'click':
        this.playTone(520, 'sine', 0.06, 0.08, 660);
        break;
      case 'coin':
        this.playTone(987.77, 'sine', 0.08, 0.11);
        this.playTone(1318.51, 'sine', 0.18, 0.12, null, 0.07);
        break;
      case 'mystery':
        [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((f, i) => {
          this.playTone(f, 'sine', 0.2, 0.09, null, i * 0.05);
        });
        break;
      case 'slash':
        this.playTone(280, 'sawtooth', 0.12, 0.14, 90);
        this.playTone(180, 'square', 0.15, 0.10, 60, 0.04);
        break;
      case 'magic':
        [440, 554, 659, 880].forEach((f, i) => {
          this.playTone(f, 'sine', 0.22, 0.09, f * 1.15, i * 0.045);
        });
        break;
      case 'burst':
        [330, 440, 554, 659, 880, 1108].forEach((f, i) => {
          this.playTone(f, 'sawtooth', 0.28, 0.12, f * 1.25, i * 0.04);
        });
        break;
      case 'hit':
        this.playTone(110, 'sawtooth', 0.18, 0.16, 45);
        break;
      case 'heal':
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
          this.playTone(f, 'triangle', 0.25, 0.10, null, i * 0.06);
        });
        break;
      case 'break':
        this.playTone(620, 'square', 0.12, 0.15, 220);
        this.playTone(480, 'sawtooth', 0.25, 0.15, 110, 0.08);
        break;
      case 'chest':
        [392, 493.88, 587.33, 783.99].forEach((f, i) => {
          this.playTone(f, 'triangle', 0.22, 0.12, null, i * 0.07);
        });
        break;
      case 'puzzle':
        [440, 554.37, 659.25, 880, 1108.73].forEach((f, i) => {
          this.playTone(f, 'sine', 0.26, 0.12, null, i * 0.065);
        });
        break;
      case 'levelup':
        [261.63, 329.63, 392.00, 523.25, 659.25, 783.99].forEach((f, i) => {
          this.playTone(f, 'triangle', 0.30, 0.13, null, i * 0.07);
        });
        break;
      case 'victory':
        [392, 392, 392, 523.25, 659.25, 783.99].forEach((f, i) => {
          const delays = [0, 0.12, 0.24, 0.38, 0.56, 0.75];
          this.playTone(f, 'triangle', 0.32, 0.13, null, delays[i]);
        });
        break;
      case 'defeat':
        [349.23, 329.63, 293.66, 261.63].forEach((f, i) => {
          this.playTone(f, 'sawtooth', 0.38, 0.11, f * 0.92, i * 0.18);
        });
        break;
    }
  }

  // ==================== 程序化背景音樂 (和弦進行 + 旋律 + 低音 + 琶音 + 鼓組) ====================
  // 每個章節與戰鬥/首領皆有各自的調式、速度與配器；以 16 分音符步進排程，8 小節為一個循環。
  static midiToFreq(m) {
    return 440 * Math.pow(2, (m - 69) / 12);
  }

  static rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  buildTrack(mode, chapter) {
    const SCALES = {
      major: [0, 2, 4, 5, 7, 9, 11],
      lydian: [0, 2, 4, 6, 7, 9, 11],
      mixolydian: [0, 2, 4, 5, 7, 9, 10],
      dorian: [0, 2, 3, 5, 7, 9, 10],
      minor: [0, 2, 3, 5, 7, 8, 10],
      phrygDom: [0, 1, 4, 5, 7, 8, 10],
      harmMinor: [0, 2, 3, 5, 7, 8, 11]
    };
    const roots = { 1: 50, 2: 55, 3: 45, 4: 52, 5: 47 };
    const ch = roots[chapter] ? chapter : 1;
    const E = {
      1: { scale: 'major', bpm: 88, prog: [0, 4, 5, 3, 0, 4, 3, 4], lead: 'triangle', arp: true, perc: 'none', lp: 2600 },
      2: { scale: 'mixolydian', bpm: 98, prog: [0, 6, 3, 0, 0, 6, 4, 0], lead: 'sine', arp: true, perc: 'shaker', lp: 3200 },
      3: { scale: 'phrygDom', bpm: 80, prog: [0, 1, 0, 3, 0, 1, 6, 0], lead: 'sawtooth', arp: false, perc: 'taiko', lp: 1500 },
      4: { scale: 'lydian', bpm: 72, prog: [0, 1, 2, 1, 0, 1, 4, 1], lead: 'sine', arp: true, perc: 'none', lp: 4200 },
      5: { scale: 'dorian', bpm: 68, prog: [0, 5, 3, 6, 0, 5, 1, 4], lead: 'sawtooth', arp: false, perc: 'none', lp: 1300 }
    }[ch];

    let spec;
    if (mode === 'boss') {
      spec = {
        scale: 'harmMinor', root: roots[ch] - 5, bpm: 152, prog: [0, 0, 5, 4, 0, 0, 1, 4],
        lead: 'sawtooth', leadVol: 0.05, lp: 2400, arp: true, arpType: 'square', arpVol: 0.022,
        pad: 'sawtooth', padVol: 0.02, padLp: 700, bass: 'boss', drums: 'boss', rhythms: [[0, 3, 6, 8, 11, 14], [0, 2, 4, 6, 8, 10, 12, 14], [0, 3, 4, 8, 11, 12]], rest: 0.1
      };
    } else if (mode === 'combat') {
      spec = {
        scale: ch === 3 ? 'harmMinor' : 'minor', root: roots[ch], bpm: 140, prog: [0, 5, 2, 6, 0, 5, 3, 4],
        lead: 'square', leadVol: 0.04, lp: 3000, arp: true, arpType: 'sawtooth', arpVol: 0.018,
        pad: 'triangle', padVol: 0.025, padLp: 1200, bass: 'combat', drums: 'combat', rhythms: [[0, 2, 3, 4, 6, 8, 10, 11, 12, 14], [0, 3, 6, 8, 11, 14], [0, 2, 4, 6, 8, 10, 12, 14]], rest: 0.12
      };
    } else {
      spec = {
        scale: E.scale, root: roots[ch], bpm: E.bpm, prog: E.prog,
        lead: E.lead, leadVol: E.lead === 'sine' ? 0.06 : 0.04, lp: E.lp, arp: E.arp, arpType: 'triangle', arpVol: 0.03,
        pad: 'triangle', padVol: 0.035, padLp: 900, bass: 'explore', drums: E.perc, rhythms: [[0, 4, 6, 8, 12], [0, 3, 6, 8, 11, 14], [0, 2, 4, 8, 10, 12], [0, 6, 8, 14]], rest: 0.18
      };
    }
    const sc = SCALES[spec.scale];
    const noteAt = i => spec.root + sc[((i % 7) + 7) % 7] + 12 * Math.floor(i / 7);
    const rand = SoundSystem.rng(ch * 977 + (mode === 'boss' ? 31 : mode === 'combat' ? 17 : 5));

    const chords = spec.prog.map(d => [noteAt(d), noteAt(d + 2), noteAt(d + 4)]);
    // 旋律：偶數小節為主題，後半重複前半並在 4、8 小節換成結尾句
    const bars = [];
    let cur = 7;
    const makeBar = (b) => {
      const d = spec.prog[b % 8];
      const center = 7 + [0, 1, 2, 3, 4, 2, 1, 0][b % 8]; // 旋律重心：前半漸升、後半回落，形成樂句起伏
      const tones = [d, d + 2, d + 4].flatMap(x => [x + 7, x, x + 14]);
      const onsets = spec.rhythms[Math.floor(rand() * spec.rhythms.length)];
      const notes = new Array(16).fill(null);
      onsets.forEach((st, k) => {
        const len = (onsets[k + 1] !== undefined ? onsets[k + 1] : 16) - st;
        if (st !== 0 && rand() < spec.rest) return;
        if (st === 0 || st % 8 === 0) {
          cur = tones.reduce((best, t) => (t >= 3 && t <= 14 && Math.abs(t - center) < Math.abs(best - center) ? t : best), center);
        } else {
          const stepv = rand() < 0.65 ? (rand() < 0.5 ? 1 : -1) : (rand() < 0.5 ? 2 : -2);
          cur = Math.min(14, Math.max(3, cur + stepv + (rand() < 0.5 ? Math.sign(center - cur) : 0)));
        }
        notes[st] = { midi: noteAt(cur), len };
      });
      return notes;
    };
    for (let b = 0; b < 4; b++) bars.push(makeBar(b));
    for (let b = 4; b < 8; b++) bars.push(b === 7 || b === 3 ? makeBar(b) : bars[b - 4]);
    bars[3] = makeBar(3);

    return { ...spec, chords, melody: bars, noteAt, stepDur: 60 / spec.bpm / 4, totalSteps: 128 };
  }

  createBus() {
    const ctx = this.ctx;
    const master = ctx.createGain();
    master.gain.value = 0.0001;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 4;
    master.connect(comp);
    comp.connect(ctx.destination);
    const input = ctx.createGain();
    input.connect(master);
    // 簡易殘響：以指數衰減的雜訊作為脈衝響應
    const len = Math.floor(ctx.sampleRate * 1.8);
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    const conv = ctx.createConvolver();
    conv.buffer = ir;
    const wet = ctx.createGain();
    wet.gain.value = 0.28;
    input.connect(conv);
    conv.connect(wet);
    wet.connect(master);
    master.gain.setValueAtTime(0.0001, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.9 * this.musicVol + 0.0001, ctx.currentTime + 0.6);
    this.bus = { input, master };
  }

  getNoise() {
    if (!this.noiseBuf) {
      const ctx = this.ctx;
      this.noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    return this.noiseBuf;
  }

  voice(freq, start, dur, o = {}) {
    const ctx = this.ctx;
    const { type = 'sine', vol = 0.05, attack = 0.01, release = 0.12, detune = 0, lp = 0 } = o;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;
    let node = osc;
    if (lp) {
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = lp;
      osc.connect(f);
      node = f;
    }
    g.gain.setValueAtTime(0.0001, start);
    g.gain.linearRampToValueAtTime(vol, start + attack);
    g.gain.setValueAtTime(vol, Math.max(start + attack + 0.001, start + dur - release));
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur + 0.05);
    node.connect(g);
    g.connect(this.bus.input);
    osc.start(start);
    osc.stop(start + dur + 0.1);
  }

  drum(kind, time, vol = 1) {
    const ctx = this.ctx;
    const dest = this.bus.input;
    if (kind === 'kick') {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.frequency.setValueAtTime(150, time);
      osc.frequency.exponentialRampToValueAtTime(42, time + 0.12);
      g.gain.setValueAtTime(0.5 * vol, time);
      g.gain.exponentialRampToValueAtTime(0.0001, time + 0.25);
      osc.connect(g); g.connect(dest);
      osc.start(time); osc.stop(time + 0.3);
    } else {
      const src = ctx.createBufferSource();
      src.buffer = this.getNoise();
      const f = ctx.createBiquadFilter();
      const g = ctx.createGain();
      let dur;
      if (kind === 'snare') { f.type = 'bandpass'; f.frequency.value = 1900; dur = 0.15; g.gain.setValueAtTime(0.22 * vol, time); }
      else if (kind === 'open') { f.type = 'highpass'; f.frequency.value = 6500; dur = 0.14; g.gain.setValueAtTime(0.07 * vol, time); }
      else { f.type = 'highpass'; f.frequency.value = 7500; dur = 0.04; g.gain.setValueAtTime(0.06 * vol, time); }
      g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
      src.connect(f); f.connect(g); g.connect(dest);
      src.start(time, Math.random() * 0.5); src.stop(time + dur + 0.02);
      if (kind === 'snare') {
        this.voice(190, time, 0.1, { type: 'triangle', vol: 0.08 * vol, attack: 0.002, release: 0.08 });
      }
    }
  }

  playStep(step, time) {
    const t = this.track;
    const bar = Math.floor(step / 16) % 8;
    const s = step % 16;
    const chord = t.chords[bar];
    const f = SoundSystem.midiToFreq;
    const barDur = t.stepDur * 16;

    // 鋪底和弦
    if (s === 0) {
      chord.forEach((m, i) => {
        this.voice(f(m + 12), time, barDur, { type: t.pad, vol: t.padVol, attack: 0.5, release: 0.6, detune: (i - 1) * 7, lp: t.padLp });
      });
    }
    // 低音
    const root = chord[0] - 12;
    const fifth = chord[2] - 12;
    if (t.bass === 'explore') {
      if (s === 0) this.voice(f(root), time, t.stepDur * 7, { type: 'triangle', vol: 0.09, attack: 0.02, release: 0.2 });
      if (s === 8) this.voice(f(fifth), time, t.stepDur * 6, { type: 'triangle', vol: 0.07, attack: 0.02, release: 0.2 });
    } else if (t.bass === 'combat') {
      if (s % 2 === 0) this.voice(f(s % 8 === 6 ? fifth : root), time, t.stepDur * 1.7, { type: 'sawtooth', vol: 0.045, attack: 0.005, release: 0.05, lp: 700 });
    } else if (t.bass === 'boss') {
      const m = s % 4 === 3 ? root + 12 : s % 8 === 6 ? fifth : root;
      this.voice(f(m), time, t.stepDur * 0.9, { type: 'square', vol: 0.04, attack: 0.004, release: 0.04, lp: 600 });
    }
    // 琶音
    if (t.arp) {
      const dense = t.bass !== 'explore';
      if (dense || s % 2 === 0) {
        const m = chord[(dense ? s : s / 2) % 3] + 12 + (s % 8 === 7 ? 12 : 0);
        this.voice(f(m), time, t.stepDur * (dense ? 1.2 : 2.2), { type: t.arpType, vol: t.arpVol, attack: 0.004, release: 0.08, lp: 3500 });
      }
    }
    // 旋律
    const n = t.melody[bar][s];
    if (n) {
      const dur = n.len * t.stepDur;
      this.voice(f(n.midi + 12), time, dur * 0.95, { type: t.lead, vol: t.leadVol, attack: t.lead === 'sine' ? 0.008 : 0.02, release: 0.15, lp: t.lp });
      if (t.lead === 'sine') this.voice(f(n.midi + 24), time, dur * 0.5, { type: 'sine', vol: t.leadVol * 0.25, attack: 0.005, release: 0.1 });
    }
    // 鼓組
    const d = t.drums;
    if (d === 'combat') {
      if (s % 8 === 0 || s === 10) this.drum('kick', time);
      if (s === 4 || s === 12) this.drum('snare', time);
      if (s % 2 === 0) this.drum('hat', time, s % 4 === 2 ? 1 : 0.6);
    } else if (d === 'boss') {
      if (s % 4 === 0 || s === 7 || s === 14) this.drum('kick', time);
      if (s === 4 || s === 12) this.drum('snare', time);
      this.drum(s % 4 === 2 ? 'open' : 'hat', time, 0.7);
    } else if (d === 'taiko') {
      if (s === 0 || s === 10) this.drum('kick', time, 1.2);
      if (s === 8) this.drum('kick', time, 0.8);
    } else if (d === 'shaker') {
      if (s % 2 === 0) this.drum('hat', time, 0.5);
    }
  }

  schedule() {
    if (this.muted || !this.ctx || this.ctx.state !== 'running' || !this.track) {
      this.nextStepTime = null;
      return;
    }
    if (!this.bus) this.createBus();
    if (this.nextStepTime == null) this.nextStepTime = this.ctx.currentTime + 0.1;
    while (this.nextStepTime < this.ctx.currentTime + 0.4) {
      this.playStep(this.stepIndex, this.nextStepTime);
      this.nextStepTime += this.track.stepDur;
      this.stepIndex = (this.stepIndex + 1) % this.track.totalSteps;
    }
  }

  fadeOutBus() {
    const bus = this.bus;
    this.bus = null;
    if (!bus || !this.ctx) return;
    const now = this.ctx.currentTime;
    try {
      bus.master.gain.cancelScheduledValues(now);
      bus.master.gain.setValueAtTime(bus.master.gain.value, now);
      bus.master.gain.linearRampToValueAtTime(0.0001, now + 0.5);
    } catch (e) { /* 忽略 */ }
    setTimeout(() => { try { bus.master.disconnect(); } catch (e) { /* 忽略 */ } }, 1500);
  }

  startBGM(mode = 'explore', chapter = 1) {
    this.bgmMode = mode;
    this.chapterTheme = chapter;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
    this.fadeOutBus();
    if (this.muted) return;
    this.track = this.buildTrack(mode, chapter);
    this.stepIndex = 0;
    this.nextStepTime = null;
    this.bgmTimer = setInterval(() => this.schedule(), 90);
  }

  stopBGM() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
    this.fadeOutBus();
  }
}

if (typeof window !== 'undefined') {
  window.soundSystem = new SoundSystem();
}
