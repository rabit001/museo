class RetroAudio {
  private ctx: AudioContext | null = null;
  public muted = false;
  public bgmPlaying = false;
  private bgmTimer: number | null = null;
  private masterGain: GainNode | null = null;

  init(): void {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.muted ? 0 : 0.16;
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : 0.16;
    }
    return this.muted;
  }

  playTone(
    freq: number,
    type: OscillatorType = 'square',
    duration = 0.08,
    gainVal = 0.22,
    timeOffset = 0
  ): void {
    if (this.muted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime + timeOffset;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(gainVal, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration);
  }

  playTextBlip(): void {
    if (this.muted) return;
    const pitches = [440, 523, 587, 659];
    const pitch = pitches[Math.floor(Math.random() * pitches.length)];
    this.playTone(pitch, 'square', 0.03, 0.08);
  }

  playStep(): void {
    if (this.muted) return;
    this.playTone(130 + Math.random() * 20, 'triangle', 0.04, 0.07);
  }

  playJump(): void {
    if (this.muted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.11);
    gain.gain.setValueAtTime(0.11, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  playInteract(): void {
    if (this.muted) return;
    this.playTone(587.33, 'square', 0.06, 0.18);
    this.playTone(880, 'square', 0.1, 0.2, 0.05);
  }

  playDoor(): void {
    if (this.muted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.18);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  playFountain(): void {
    if (this.muted) return;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98];
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'sine', 0.2, 0.16, idx * 0.06);
    });
  }

  playDiscovery(): void {
    if (this.muted) return;
    const melody = [
      { f: 783.99, d: 0.08 },
      { f: 739.99, d: 0.08 },
      { f: 622.25, d: 0.08 },
      { f: 440.0, d: 0.08 },
      { f: 415.3, d: 0.08 },
      { f: 659.25, d: 0.08 },
      { f: 830.61, d: 0.08 },
      { f: 1046.5, d: 0.32 },
    ];
    let t = 0;
    melody.forEach((n) => {
      this.playTone(n.f, 'square', n.d, 0.18, t);
      t += n.d * 0.88;
    });
  }

  toggleBgm(): boolean {
    this.init();
    this.bgmPlaying = !this.bgmPlaying;
    if (this.bgmPlaying) {
      if (this.muted) this.toggleMute();
      this.startBgmLoop();
    } else if (this.bgmTimer !== null) {
      window.clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
    return this.bgmPlaying;
  }

  private startBgmLoop(): void {
    if (!this.bgmPlaying) return;
    if (!this.muted) {
      const chords = [
        [261.63, 329.63, 392.0, 523.25],
        [220.0, 261.63, 329.63, 440.0],
        [174.61, 220.0, 261.63, 349.23],
        [196.0, 246.94, 293.66, 392.0],
      ];
      const currentChord = chords[Math.floor(Math.random() * chords.length)];
      currentChord.forEach((note, i) => {
        this.playTone(note, 'triangle', 0.4, 0.055, i * 0.22);
      });
    }
    this.bgmTimer = window.setTimeout(() => {
      if (this.bgmPlaying) this.startBgmLoop();
    }, 1800);
  }
}

export const retroAudio = new RetroAudio();
