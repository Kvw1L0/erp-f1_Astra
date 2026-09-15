/**
 * Motor de Audio F1 Híbrido: Soporta síntesis Web Audio API completa y archivos de audio nativos.
 * No requiere archivos externos para funcionar: genera efectos fidedignos en tiempo real mediante síntesis.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.ambientNode = null;
    this.ambientGain = null;
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
    if (muted && this.ambientGain) {
      try {
        this.ambientGain.gain.setValueAtTime(0, this.ctx.currentTime);
      } catch (e) {}
    } else if (!muted && this.ambientGain) {
      try {
        this.ambientGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      } catch (e) {}
    }
  }

  // Reproductor de archivo MP3 opcional con fallback garantizado a síntesis
  playAudioFile(filename, fallbackFn) {
    if (this.muted || typeof window === 'undefined') return;

    try {
      const audio = new Audio(`/sounds/${filename}`);
      audio.volume = 0.85;
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise.catch(() => {
          if (fallbackFn) fallbackFn.call(this);
        });
      }
    } catch (e) {
      if (fallbackFn) fallbackFn.call(this);
    }
  }

  // 1. Sonido Ambiente de Parrilla / Motores en Ralentí (Bucle armónico)
  startAmbientEngine() {
    if (this.muted || typeof window === 'undefined') return;
    this.ensureContext();
    if (!this.ctx || this.ambientNode) return;

    try {
      const t = this.ctx.currentTime;
      // Oscilador grave base (rumble V6 Turbo-híbrido)
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(55, t); // A1 grave

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(110, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(160, t);

      gain.gain.setValueAtTime(this.muted ? 0 : 0.08, t);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();

      this.ambientNode = { osc1, osc2, filter };
      this.ambientGain = gain;
    } catch (e) {
      console.warn('Ambient engine audio error:', e);
    }
  }

  stopAmbientEngine() {
    if (this.ambientNode) {
      try {
        this.ambientNode.osc1.stop();
        this.ambientNode.osc2.stop();
      } catch (e) {}
      this.ambientNode = null;
      this.ambientGain = null;
    }
  }

  // 2. Aceleración / Rugido de Largada F1 con Neumáticos
  playRaceStart() {
    this.playAudioFile('engine-rev.mp3', () => {
      this.ensureContext();
      if (!this.ctx || this.muted) return;

      const t = this.ctx.currentTime;
      // Rugido aceleración
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, t);
      osc.frequency.exponentialRampToValueAtTime(700, t + 1.2);
      osc.frequency.exponentialRampToValueAtTime(450, t + 2.0);

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.linearRampToValueAtTime(0.35, t + 0.9);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 2.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(t + 2.2);

      // Chirrido de neumáticos al salir
      this.playTireScreech();
    });
  }

  // 3. Chirrido de Neumáticos (Burnout / Tracción)
  playTireScreech() {
    this.ensureContext();
    if (!this.ctx || this.muted) return;

    try {
      const bufferSize = this.ctx.sampleRate * 0.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2200, this.ctx.currentTime);
      filter.Q.setValueAtTime(3.5, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
      noise.stop(this.ctx.currentTime + 0.5);
    } catch (e) {}
  }

  // 4. Efecto Nitro Boost (+20% Fuego/Turbo)
  playNitroBoost() {
    this.playAudioFile('nitro-boost.mp3', () => {
      this.ensureContext();
      if (!this.ctx || this.muted) return;

      const t = this.ctx.currentTime;
      // Silbido de turbo compresor ascendente
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(250, t);
      osc.frequency.exponentialRampToValueAtTime(1800, t + 0.4);
      osc.frequency.exponentialRampToValueAtTime(400, t + 1.6);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(t + 1.6);
    });
  }

  // 5. Radio de Pits ("Team Radio" al transmitir tablet)
  playTeamRadio() {
    this.ensureContext();
    if (!this.ctx || this.muted) return;

    try {
      const t = this.ctx.currentTime;
      // Tono oficial de apertura de radio F1 (1750 Hz burst)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1750, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.setValueAtTime(0, t + 0.08);
      gain.gain.setValueAtTime(0.2, t + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.25);
    } catch (e) {}
  }

  // 6. Ticker de Tensión / Cuenta Regresiva Crítica (Últimos 10s)
  playUrgencyCountdown() {
    this.ensureContext();
    if (!this.ctx || this.muted) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(440, t + 0.08);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.09);
    } catch (e) {}
  }

  // 7. Sirena de Virtual Safety Car (VSC / Bandera Amarilla)
  playSafetyCarSiren() {
    this.ensureContext();
    if (!this.ctx || this.muted) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(700, t);
      osc.frequency.setValueAtTime(950, t + 0.2);
      osc.frequency.setValueAtTime(700, t + 0.4);
      osc.frequency.setValueAtTime(950, t + 0.6);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.85);
    } catch (e) {}
  }

  // 8. DRS Activado (Apertura de Alerón / Whoosh)
  playDRSActive() {
    this.ensureContext();
    if (!this.ctx || this.muted) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(1200, t + 0.15);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.25);
    } catch (e) {}
  }

  // 9. Adelantamiento / Overtake Whoosh (Efecto Doppler)
  playOvertakeWhoosh() {
    this.ensureContext();
    if (!this.ctx || this.muted) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(250, t + 0.45);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.45);
    } catch (e) {}
  }

  // 9b. Efecto Doppler de Sobrepaso en Video de Batalla
  playDopplerOvertake() {
    this.playOvertakeWhoosh();
  }

  // 10. Confirmación de Pits
  playPitStopConfirm() {
    this.playAudioFile('pitstop.mp3', () => {
      this.ensureContext();
      if (!this.ctx || this.muted) return;

      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.07);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.07 + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + idx * 0.07);
        osc.stop(this.ctx.currentTime + idx * 0.07 + 0.22);
      });
    });
  }

  // 11. Semáforo de Salida F1
  playSemaphore() {
    this.playAudioFile('semaphore.mp3', () => {
      this.ensureContext();
      if (!this.ctx || this.muted) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
    });
  }

  // 13. Sirena de Convocatoria a Escenario
  playStageSummon() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(880, this.ctx.currentTime + 0.25);
      osc.frequency.linearRampToValueAtTime(440, this.ctx.currentTime + 0.5);
      osc.frequency.linearRampToValueAtTime(880, this.ctx.currentTime + 0.75);
      osc.frequency.linearRampToValueAtTime(440, this.ctx.currentTime + 1.0);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 1.2);
    } catch (e) {}
  }

  // 14. Clic de Ruleta Giratoria
  playRouletteTick() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.03);
    } catch (e) {}
  }

  // 15. Fanfarria de Ganador de Ruleta
  playRouletteWinner() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.12);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.12 + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + idx * 0.12);
        osc.stop(this.ctx.currentTime + idx * 0.12 + 0.4);
      });
    } catch (e) {}
  }

  // 16. Clic sutil de Selección de Opción o Equipo
  playSelect() {
    if (this.muted || typeof window === 'undefined') return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, t);
      osc.frequency.exponentialRampToValueAtTime(350, t + 0.04);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.04);
    } catch (e) {}
  }

  // 17. Confirmación de Éxito / Envío de Telemetría
  playSuccess() {
    if (this.muted || typeof window === 'undefined') return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const notes = [587.33, 880]; // D5, A5
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.18, this.ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + idx * 0.08);
        osc.stop(this.ctx.currentTime + idx * 0.08 + 0.25);
      });
    } catch (e) {}
  }

  // 18. Ticker de Cuenta Regresiva de Minijuegos
  playCountdownTick() {
    if (this.muted || typeof window === 'undefined') return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, t);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.03);
    } catch (e) {}
  }

  // 19. Alerta de Precaución VSC
  playVSCAlert() {
    this.playSafetyCarSiren();
  }
}

export const triggerHaptic = (pattern = [40, 30, 40]) => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(pattern);
    } catch (e) {}
  }
};

const soundEngineInstance = new SoundEngine();

// Proxy de seguridad: garantiza que NUNCA una llamada a un sonido inexistente arroje TypeError
export const sounds = new Proxy(soundEngineInstance, {
  get(target, prop) {
    if (prop in target) {
      const val = target[prop];
      if (typeof val === 'function') {
        return val.bind(target);
      }
      return val;
    }
    // Fallback seguro silencioso para cualquier método ausente
    return () => {};
  }
});
