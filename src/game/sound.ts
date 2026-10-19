let ctx: AudioContext | null = null;
export const sound = {
  muted: false,
  tone(freq: number, type: OscillatorType = "sine", dur = 0.15, delay = 0, vol = 0.12) {
    if (this.muted || typeof window === "undefined") return;
    try {
      if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (ctx.state === "suspended") ctx.resume();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      const t = ctx.currentTime + delay;
      o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + dur);
    } catch {}
  },
  correct() { [523.25, 659.25, 783.99].forEach((n, i) => this.tone(n, "triangle", 0.15, i * 0.08, 0.15)); },
  wrong() { this.tone(220, "sawtooth", 0.15, 0, 0.1); this.tone(175, "sawtooth", 0.22, 0.12, 0.1); },
  gameOver() { [392, 330, 262, 196].forEach((n, i) => this.tone(n, "square", 0.25, i * 0.18, 0.08)); },
  finish() { [523.25, 659.25, 783.99, 1046.5].forEach((n, i) => this.tone(n, "triangle", 0.2, i * 0.09, 0.18)); },
  click() { this.tone(600, "sine", 0.05, 0, 0.07); },
};
