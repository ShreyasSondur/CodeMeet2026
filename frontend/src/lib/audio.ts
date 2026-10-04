// Studio-grade Cyberpunk Audio Engine & Sound Effects System

type AudioStateListener = (isPlaying: boolean) => void;

declare global {
  interface Window {
    __CODEMEET_BGM__?: HTMLAudioElement;
    __CODEMEET_AUDIO_CTX__?: AudioContext;
  }
}

class SoundFX {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  // Background Music HTML5 Audio instance (OFF by default)
  private isBgmPlaying: boolean = false;
  private targetVolume: number = 0.5;
  private listeners: Set<AudioStateListener> = new Set();

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      if (window.__CODEMEET_AUDIO_CTX__) {
        this.ctx = window.__CODEMEET_AUDIO_CTX__;
      } else {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
          window.__CODEMEET_AUDIO_CTX__ = this.ctx;
        }
      }
    }
    if (this.ctx && this.ctx.state === "suspended" && this.isBgmPlaying) {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private getBgmAudio(): HTMLAudioElement | null {
    if (typeof window === "undefined") return null;
    if (!window.__CODEMEET_BGM__) {
      const audio = new Audio("/audio/cyberpunk_theme.wav");
      audio.loop = true;
      audio.preload = "auto";
      audio.volume = this.targetVolume;
      window.__CODEMEET_BGM__ = audio;
    }
    return window.__CODEMEET_BGM__;
  }

  public subscribe(listener: AudioStateListener): () => void {
    this.listeners.add(listener);
    listener(this.isBgmPlaying);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.isBgmPlaying));
  }

  public isPlaying(): boolean {
    return this.isBgmPlaying;
  }

  // --- Cyber UI Sound Effects (Only active when Audio is ON) ---

  playHover() {
    if (!this.enabled || !this.isBgmPlaying) return;
    try {
      const ctx = this.getContext();
      if (!ctx || ctx.state === "suspended") return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(960, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.018, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // ignore
    }
  }

  playClick() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1300, ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.035, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {
      // ignore
    }
  }

  playSuccess() {
    if (!this.enabled || !this.isBgmPlaying) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + i * 0.07);
        gain.gain.setValueAtTime(0.03, now + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.07 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.2);
      });
    } catch {
      // ignore
    }
  }

  // --- Cinematic Launch Sequence Synthesizer Audio ---

  playLaunchRiser() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(60, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 2.5);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 2.0);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.6);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(200, now);
      filter.frequency.exponentialRampToValueAtTime(4000, now + 2.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 2.6);
    } catch {
      // ignore
    }
  }

  playLaunchCountdown(count: number) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume();

      const now = ctx.currentTime;

      // Punchy transient oscillator (beep)
      const freq = 440 + (6 - count) * 110; // Pitch increases as it gets closer to 1
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.15);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);

      // Sub thud
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = "triangle";
      sub.frequency.setValueAtTime(150, now);
      sub.frequency.exponentialRampToValueAtTime(40, now + 0.25);

      subGain.gain.setValueAtTime(0.09, now);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      sub.connect(subGain);
      subGain.connect(ctx.destination);
      sub.start(now);
      sub.stop(now + 0.25);
    } catch {
      // ignore
    }
  }

  playBassDrop() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume();

      const now = ctx.currentTime;

      // Heavy sub-bass boom
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = "sine";
      sub.frequency.setValueAtTime(160, now);
      sub.frequency.exponentialRampToValueAtTime(28, now + 1.2);

      subGain.gain.setValueAtTime(0.2, now);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

      sub.connect(subGain);
      subGain.connect(ctx.destination);
      sub.start(now);
      sub.stop(now + 1.4);

      // Noise impact / explosion transient
      const bufferSize = ctx.sampleRate * 0.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "lowpass";
      noiseFilter.frequency.setValueAtTime(800, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(80, now + 0.5);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.08, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.5);
    } catch {
      // ignore
    }
  }

  playLaunchFanfare() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume();

      const now = ctx.currentTime;
      // Futuristic arpeggiated fanfare chord (C, E, G, B, D, high C)
      const chord = [523.25, 659.25, 783.99, 987.77, 1174.66, 1318.51, 1567.98];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.04, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.8);

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(3000, now);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.85);
      });
    } catch {
      // ignore
    }
  }

  // --- Background Music System (Strict Manual Control) ---

  public startBGM() {
    const audio = this.getBgmAudio();
    if (!audio) return;

    // Stop any other lingering audios
    if (typeof document !== "undefined") {
      document.querySelectorAll("audio").forEach((el) => {
        if (el !== audio) {
          el.pause();
          el.currentTime = 0;
        }
      });
    }

    audio.volume = this.targetVolume;
    audio
      .play()
      .then(() => {
        this.isBgmPlaying = true;
        this.notify();
      })
      .catch((err) => {
        console.warn("Audio play prevented:", err);
      });
  }

  public stopBGM() {
    const audio = this.getBgmAudio();
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    // Stop any and all other audio elements on the page
    if (typeof document !== "undefined") {
      document.querySelectorAll("audio").forEach((el) => {
        el.pause();
        el.currentTime = 0;
      });
    }

    // Suspend audio context so no oscillator can linger
    if (this.ctx && this.ctx.state === "running") {
      this.ctx.suspend().catch(() => {});
    }

    this.isBgmPlaying = false;
    this.notify();
  }

  public toggleBGM() {
    if (this.isBgmPlaying) {
      this.stopBGM();
    } else {
      this.startBGM();
    }
  }
}

export const soundFX = new SoundFX();
