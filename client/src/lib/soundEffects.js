/**
 * Motor de Audio Híbrido: Soporta archivos MP3 nativos con fallback a Web Audio API sintetizado.
 * Archivos MP3 esperados en /sounds/:
 * - engine-rev.mp3
 * - nitro-boost.mp3
 * - pitstop.mp3
 * - semaphore.mp3
 * - victory.mp3
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.audioCache = {};
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
  }

  ensureContext() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.muted = muted;
  }

  // Reproductor de archivo MP3 con fallback automático
  playAudioFile(filename, fallbackFn) {
    if (this.muted || typeof window === 'undefined') return;

    try {
      const audio = new Audio(`/sounds/${filename}`);
      audio.volume = 0.85;
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          // Si el archivo MP3 no existe aún en /sounds/, ejecutar síntesis Web Audio
          if (fallbackFn) fallbackFn.call(this);
        });
      }
    } catch (e) {
      if (fallbackFn) fallbackFn.call(this);
    }
  }

  // 1. Aceleración / Rugido de Motor F1
  playRaceStart() {
    this.playAudioFile('engine-rev.mp3', () => {
      this.ensureContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(130, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(520, this.ctx.currentTime + 1.4);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 1.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 1.8);
    });
  }

  // 2. Efecto Nitro Boost (+20% Fuego/Turbo)
  playNitroBoost() {
    this.playAudioFile('nitro-boost.mp3', () => {
      this.ensureContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, this.ctx.currentTime + 0.5);
      osc.frequency.exponentialRampToValueAtTime(500, this.ctx.currentTime + 1.5);

      gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 1.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 1.5);
    });
  }

  // 3. Confirmación de Pits / Pistola Neumática
  playPitStopConfirm() {
    this.playAudioFile('pitstop.mp3', () => {
      this.ensureContext();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.07);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.07 + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + idx * 0.07);
        osc.stop(this.ctx.currentTime + idx * 0.07 + 0.22);
      });
    });
  }

  // 4. Semáforo de Salida F1
  playSemaphore() {
    this.playAudioFile('semaphore.mp3', () => {
      this.ensureContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
    });
  }

  // 5. Clic Táctil de Selección
  playSelect() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(540, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }
}

export const sounds = new SoundEngine();
