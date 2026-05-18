"use client";

let ctx = null;
let unlocked = false;
let reducedMotion = false;

function getContext() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    ctx = new Ctx();
  }
  return ctx;
}

function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function initTypingSound() {
  if (typeof window === "undefined") return;
  reducedMotion = prefersReducedMotion();
  if (reducedMotion) return;

  const unlock = () => {
    const audio = getContext();
    if (!audio) return;
    if (audio.state === "suspended") {
      audio.resume().catch(() => {});
    }
    unlocked = true;
  };

  window.addEventListener("pointerdown", unlock, { once: true, passive: true });
  window.addEventListener("keydown", unlock, { once: true });
}

/** Short mechanical UI click (typing, buttons, folders, globe). */
export function playClick() {
  if (reducedMotion || typeof window === "undefined") return;

  const audio = getContext();
  if (!audio) return;

  const run = () => {
    const t = audio.currentTime;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    const filter = audio.createBiquadFilter();

    osc.type = "square";
    osc.frequency.setValueAtTime(920 + Math.random() * 180, t);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1400, t);
    filter.Q.setValueAtTime(0.9, t);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.045, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.038);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audio.destination);

    osc.start(t);
    osc.stop(t + 0.05);
  };

  if (audio.state === "suspended") {
    audio.resume().then(run).catch(() => {});
    return;
  }
  run();
}

/** @deprecated Use playClick — kept for existing call sites. */
export function playTypingClick() {
  playClick();
}

function withAudio(run) {
  if (reducedMotion || typeof window === "undefined") return;
  const audio = getContext();
  if (!audio) return;
  if (audio.state === "suspended") {
    audio.resume().then(run).catch(() => {});
    return;
  }
  run();
}

function playTone(audio, start, freq, { duration = 0.4, peak = 0.12, type = "sine" } = {}) {
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  const filter = audio.createBiquadFilter();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(Math.min(4200, freq * 3.2), start);
  filter.Q.setValueAtTime(0.6, start);

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(audio.destination);

  osc.start(start);
  osc.stop(start + duration + 0.05);
}

/**
 * Nostalgic OS-style boot chime when "Dream. Think. Build." appears.
 */
export function playStartupChime() {
  withAudio(() => {
    const audio = getContext();
    if (!audio) return;
    const t0 = audio.currentTime + 0.03;

    playTone(audio, t0, 196, { duration: 0.55, peak: 0.06, type: "triangle" });

    const arp = [
      { f: 392, d: 0.1, dur: 0.42, p: 0.11 },
      { f: 523.25, d: 0.22, dur: 0.48, p: 0.13 },
      { f: 659.25, d: 0.36, dur: 0.52, p: 0.12 },
      { f: 783.99, d: 0.52, dur: 0.65, p: 0.1 },
      { f: 1046.5, d: 0.72, dur: 0.85, p: 0.08 },
    ];
    arp.forEach(({ f, d, dur, p }) => {
      playTone(audio, t0 + d, f, { duration: dur, peak: p, type: "sine" });
    });

    playTone(audio, t0 + 1.05, 1318.5, { duration: 1.1, peak: 0.045, type: "triangle" });
  });
}

/** Soft accent as each tagline word lands. */
export function playStartupWordAccent(wordIndex = 0) {
  const freqs = [523.25, 659.25, 783.99];
  withAudio(() => {
    const audio = getContext();
    if (!audio) return;
    const t = audio.currentTime;
    playTone(audio, t, freqs[wordIndex] ?? 660, {
      duration: 0.28,
      peak: 0.055,
      type: "sine",
    });
  });
}

/** Quick rising “whoop” when a desktop window pops in. */
export function playWindowWhoosh() {
  withAudio(() => {
    const audio = getContext();
    if (!audio) return;
    const t0 = audio.currentTime;

    const osc = audio.createOscillator();
    const gain = audio.createGain();
    const filter = audio.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(200, t0);
    osc.frequency.exponentialRampToValueAtTime(920, t0 + 0.16);
    osc.frequency.exponentialRampToValueAtTime(480, t0 + 0.28);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(500, t0);
    filter.frequency.exponentialRampToValueAtTime(2200, t0 + 0.1);
    filter.frequency.exponentialRampToValueAtTime(800, t0 + 0.3);

    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.085, t0 + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.32);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audio.destination);

    osc.start(t0);
    osc.stop(t0 + 0.36);
  });
}

/** Descending “whup” when a window closes. */
export function playWindowClose() {
  withAudio(() => {
    const audio = getContext();
    if (!audio) return;
    const t0 = audio.currentTime;

    const osc = audio.createOscillator();
    const gain = audio.createGain();
    const filter = audio.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(860, t0);
    osc.frequency.exponentialRampToValueAtTime(240, t0 + 0.2);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1800, t0);
    filter.frequency.exponentialRampToValueAtTime(500, t0 + 0.24);

    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.07, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.26);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audio.destination);

    osc.start(t0);
    osc.stop(t0 + 0.3);
  });
}
