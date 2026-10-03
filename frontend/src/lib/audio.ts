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
