let sharedAudioCtx: AudioContext | null = null;
let lastPlayedTimestamp = 0;

function getOrCreateAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;

  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    sharedAudioCtx = new AudioCtx();
  }
  return sharedAudioCtx;
}

/**
 * Call during any user click/tap (e.g. starting or submitting an exam)
 * so the browser unlocks Web Audio for automatic applause playback later.
 */
export function unlockCelebrationAudio(): void {
  const ctx = getOrCreateAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    void ctx.resume().catch(() => {
      // ignore resume errors before gesture
    });
  }
}

export function stopCelebrationApplause(): void {
  if (sharedAudioCtx && sharedAudioCtx.state === 'running') {
    // Suspend rather than closing so the unlocked context stays reusable
    void sharedAudioCtx.suspend().catch(() => {
      // ignore suspend errors
    });
  }
}

/**
 * Plays a gentle, cheerful two-note marimba/bell "pop-ding" sound
 * when the student clicks/selects an answer option A, B, C, or D.
 */
export function playOptionSelectSound(optionIndex = 0): void {
  const ctx = getOrCreateAudioContext();
  if (!ctx) return;

  const triggerSound = () => {
    try {
      const now = ctx.currentTime + 0.005;
      // Subtle pentatonic pitch variation per option (C5, D5, E5, G5)
      const baseFreqs = [523.25, 587.33, 659.25, 783.99];
      const f1 = baseFreqs[Math.abs(optionIndex) % baseFreqs.length];
      const f2 = f1 * 1.5; // warm fifth harmonic interval

      // Note 1: soft marimba tap
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(f1, now);
      osc1.frequency.exponentialRampToValueAtTime(f1 * 1.03, now + 0.06);

      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.exponentialRampToValueAtTime(0.14, now + 0.01);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.12);

      // Note 2: gentle sparkle bell overtone
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(f2, now + 0.045);

      gain2.gain.setValueAtTime(0.001, now + 0.045);
      gain2.gain.exponentialRampToValueAtTime(0.09, now + 0.055);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.045);
      osc2.stop(now + 0.19);
    } catch {
      // ignore Web Audio playback errors
    }
  };

  if (ctx.state === 'suspended') {
    void ctx.resume().then(triggerSound).catch(() => {
      // ignore resume errors
    });
  } else {
    triggerSound();
  }
}

/**
 * Synthesizes a warm celebratory chime followed by multi-layered applause
 * using the Web Audio API (zero external audio URLs, works offline).
 */
export async function playCelebrationApplause(force = false): Promise<boolean> {
  const nowMs = Date.now();
  if (!force && nowMs - lastPlayedTimestamp < 1200) {
    return true;
  }

  const ctx = getOrCreateAudioContext();
  if (!ctx) return false;

  try {
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    lastPlayedTimestamp = Date.now();
    const now = ctx.currentTime + 0.03;

    // 1. Ascending celebratory chime arpeggio (C5 - E5 - G5 - C6)
    const chimeNotes = [523.25, 659.25, 783.99, 1046.5];
    chimeNotes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.085);

      gain.gain.setValueAtTime(0.001, now + idx * 0.085);
      gain.gain.exponentialRampToValueAtTime(0.16, now + idx * 0.085 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.085 + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.085);
      osc.stop(now + idx * 0.085 + 0.6);
    });

    // 2. Layered applause claps over ~3.2 seconds
    const clapBufferSize = Math.floor(ctx.sampleRate * 0.14);
    const noiseBuffer = ctx.createBuffer(1, clapBufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < clapBufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const totalClaps = 48;
    for (let i = 0; i < totalClaps; i++) {
      const startOffset = 0.16 + (i / totalClaps) * 2.8 + (Math.random() * 0.08 - 0.04);
      const clapTime = Math.max(now + 0.1, now + startOffset);

      const progress = i / totalClaps;
      const swell =
        progress < 0.2 ? progress / 0.2 : progress > 0.72 ? (1 - progress) / 0.28 : 1;
      const peakGain = (0.1 + Math.random() * 0.09) * Math.max(0.28, swell);

      const src = ctx.createBufferSource();
      src.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 950 + Math.random() * 1450;
      filter.Q.value = 1.4 + Math.random() * 1.2;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, clapTime);
      gain.gain.exponentialRampToValueAtTime(peakGain, clapTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, clapTime + 0.09 + Math.random() * 0.05);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      src.start(clapTime);
      src.stop(clapTime + 0.14);
    }

    return true;
  } catch {
    return false;
  }
}
