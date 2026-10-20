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
    gain.gain.linearRampToValueAtTime(vol, now + 0.015);
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

  startBGM(mode = 'explore', chapter = 1) {
    this.bgmMode = mode;
    this.chapterTheme = chapter;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
    if (this.muted) return;

    const scales = {
      1: [220.0, 261.63, 293.66, 329.63, 392.0, 440.0],
      2: [196.0, 233.08, 261.63, 293.66, 349.23, 392.0],
      3: [164.81, 196.0, 220.0, 246.94, 293.66, 329.63],
      4: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25],
      5: [220.0, 246.94, 261.63, 329.63, 349.23, 440.0]
    };

    const combatNotes = [146.83, 164.81, 174.61, 196.0, 220.0, 261.63, 293.66];
    const bossNotes = [110.0, 123.47, 130.81, 146.83, 164.81, 174.61, 220.0];

    const intervalMs = mode === 'boss' ? 280 : mode === 'combat' ? 340 : 650;

    this.bgmTimer = setInterval(() => {
      if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
      this.stepIndex = (this.stepIndex + 1) % 16;

      if (mode === 'explore') {
        const notes = scales[this.chapterTheme] || scales[1];
        const note = notes[(this.stepIndex * 3 + (this.stepIndex % 2)) % notes.length];
        this.playTone(note, 'sine', 0.55, 0.03);
        if (this.stepIndex % 4 === 0) {
          this.playTone(notes[0] * 0.5, 'triangle', 1.1, 0.035);
        }
      } else if (mode === 'combat') {
        const note = combatNotes[this.stepIndex % combatNotes.length];
        this.playTone(note, 'triangle', 0.22, 0.045);
        if (this.stepIndex % 2 === 0) {
          this.playTone(combatNotes[0] * 0.5, 'sawtooth', 0.15, 0.03);
        }
      } else if (mode === 'boss') {
        const note = bossNotes[(this.stepIndex * 2 + (this.stepIndex % 3)) % bossNotes.length];
        this.playTone(note * 1.5, 'sawtooth', 0.2, 0.045);
        if (this.stepIndex % 2 === 0) {
          this.playTone(bossNotes[0] * 0.5, 'square', 0.18, 0.04);
        }
      }
    }, intervalMs);
  }

  stopBGM() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

if (typeof window !== 'undefined') {
  window.soundSystem = new SoundSystem();
}
