export type Visual =
  | { kind: "dienes"; n: number }
  | { kind: "digits"; digits: string[]; highlight: number | null }
  | { kind: "banner"; text: string; tone: "amber" | "emerald" | "violet" | "rose" | "sky" };

export interface Question {
  prompt: string; // **bold** supported
  visual: Visual;
  options: string[];
  correctAnswer: string;
  hint: string;
}

export const MAX_LIVES = 3;
export const TOTAL_LEVELS = 10;

export const LEVEL_TITLES: Record<number, string> = {
  1: "Balok Visual (11-20)",
  2: "Balok Dienes (21-50)",
  3: "Balok Dienes (51-99)",
  4: "Mengenal Nilai Tempat",
  5: "Menentukan Nilai Angka",
  6: "Menguraikan Bilangan",
  7: "Menyusun Bilangan",
  8: "Bentuk Panjang",
  9: "Teka-Teki Nilai Tempat",
  10: "Tantangan Puncak 100!",
};

export const PLAYER_THEMES = [
  { name: "Pemain 1", mascot: "🦊", mascotName: "Rubah Biru", tone: "p1", color: "#38bdf8" },
  { name: "Pemain 2", mascot: "🐯", mascotName: "Macan Oranye", tone: "p2", color: "#fb7185" },
  { name: "Pemain 3", mascot: "🐸", mascotName: "Katak Hijau", tone: "p3", color: "#34d399" },
  { name: "Pemain 4", mascot: "🦄", mascotName: "Poni Ungu", tone: "p4", color: "#c084fc" },
] as const;

export const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export function shuffle<T>(arr: T[]): T[] {
  const c = [...arr];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j] as T, c[i] as T];
  }
  return c;
}

function numericOptions(correct: number, min = 10, max = 99): string[] {
  const set = new Set([String(correct)]);
  const t = Math.floor(correct / 10);
  const o = correct % 10;
  const swapped = o * 10 + t;
  if (swapped >= min && swapped <= max && swapped !== correct && o !== 0) set.add(String(swapped));
  if (correct + 10 <= max) set.add(String(correct + 10));
  if (correct - 10 >= min) set.add(String(correct - 10));
  if (correct + 1 <= max) set.add(String(correct + 1));
  if (correct - 1 >= min) set.add(String(correct - 1));
  while (set.size < 4) set.add(String(randInt(min, max)));
  return shuffle(Array.from(set).slice(0, 4));
}

function dienesQ(min: number, max: number, prompt: string): Question {
  const num = randInt(min, max);
  const t = Math.floor(num / 10);
  const o = num % 10;
  return {
    prompt,
    visual: { kind: "dienes", n: num },
    options: numericOptions(num, min, max),
    correctAnswer: String(num),
    hint: `Ada ${t} batang puluhan (${t * 10}) dan ${o} kubus satuan. Jadi ${t * 10} + ${o} = ${num}.`,
  };
}

export function generateQuestion(level: number): Question {
  switch (level) {
    case 1:
      return dienesQ(11, 20, "Perhatikan balok puluhan & kubus satuan. **Bilangan berapakah ini?**");
    case 2:
      return dienesQ(21, 50, "Hitunglah jumlah **batang puluhan** dan **kubus satuan** ini!");
    case 3:
      return dienesQ(51, 99, "Berapakah bilangan yang ditunjukkan oleh **balok nilai tempat** ini?");
    case 4: {
      const t = randInt(1, 9);
      let o = randInt(0, 9);
      while (t === o) o = randInt(0, 9);
      const askTens = Math.random() < 0.5;
      const num = t * 10 + o;
      return {
        prompt: `Pada bilangan **${num}**, angka **${askTens ? t : o}** menempati nilai tempat...`,
        visual: { kind: "digits", digits: [String(t), String(o)], highlight: askTens ? 0 : 1 },
        options: ["Ratusan", "Puluhan", "Satuan"],
        correctAnswer: askTens ? "Puluhan" : "Satuan",
        hint: `Pada ${num}, angka kiri (${t}) adalah Puluhan dan angka kanan (${o}) adalah Satuan.`,
      };
    }
    case 5: {
      const t = randInt(2, 9);
      let o = randInt(1, 9);
      while (t === o) o = randInt(1, 9);
      const num = t * 10 + o;
      const askTens = Math.random() < 0.65;
      const opts = new Set([String(t * 10), String(o), String(num), askTens ? String(t) : String(o * 10)]);
      return {
        prompt: `Berapakah **nilai angka ${askTens ? t : o}** pada bilangan **${num}**?`,
        visual: { kind: "digits", digits: [String(t), String(o)], highlight: askTens ? 0 : 1 },
        options: shuffle(Array.from(opts)),
        correctAnswer: askTens ? String(t * 10) : String(o),
        hint: askTens
          ? `Angka ${t} di tempat puluhan, nilainya ${t} × 10 = ${t * 10}.`
          : `Angka ${o} di tempat satuan, nilainya tetap ${o}.`,
      };
    }
    case 6: {
      const t = randInt(1, 9);
      let o = randInt(1, 9);
      while (t === o) o = randInt(1, 9);
      const num = t * 10 + o;
      const correct = `${t} puluhan + ${o} satuan`;
      return {
        prompt: `Uraikan bilangan **${num}** sesuai nilai tempatnya!`,
        visual: { kind: "banner", text: `${num} = ... + ...`, tone: "amber" },
        options: shuffle([correct, `${o} puluhan + ${t} satuan`, `${t * 10} puluhan + ${o} satuan`, `${t} puluhan + ${o * 10} satuan`]),
        correctAnswer: correct,
        hint: `${num} terdiri dari ${t} di tempat puluhan dan ${o} di tempat satuan.`,
      };
    }
    case 7: {
      const t = randInt(2, 9);
      const o = randInt(0, 9);
      const num = t * 10 + o;
      return {
        prompt: "Susunlah nilai tempat berikut menjadi **bilangan yang tepat**!",
        visual: { kind: "banner", text: `${t} puluhan + ${o} satuan = ...`, tone: "emerald" },
        options: numericOptions(num, 10, 99),
        correctAnswer: String(num),
        hint: `${t} puluhan adalah ${t * 10}, ditambah ${o} satuan menjadi ${num}.`,
      };
    }
    case 8: {
      const t = randInt(2, 9);
      const o = randInt(1, 9);
      const num = t * 10 + o;
      if (Math.random() < 0.5) {
        return {
          prompt: "Lengkapilah penjumlahan **bentuk panjang** ini!",
          visual: { kind: "banner", text: `${num} = ${t * 10} + ?`, tone: "violet" },
          options: shuffle(Array.from(new Set([String(o), String(o * 10), String(t), String(t * 10)]))),
          correctAnswer: String(o),
          hint: `${num} terdiri dari ${t * 10} ditambah ${o}.`,
        };
      }
      return {
        prompt: "Lengkapilah bagian **puluhan** pada bentuk panjang ini!",
        visual: { kind: "banner", text: `${num} = ? + ${o}`, tone: "violet" },
        options: shuffle(Array.from(new Set([String(t * 10), String(t), String(o * 10), String(num)]))),
        correctAnswer: String(t * 10),
        hint: `Angka ${t} pada ${num} bernilai ${t * 10}. Jadi ${num} = ${t * 10} + ${o}.`,
      };
    }
    case 9: {
      const t = randInt(2, 9);
      let o = randInt(1, 9);
      while (t === o) o = randInt(1, 9);
      const num = t * 10 + o;
      const opts = new Set([String(num), String(o * 10 + t)]);
      while (opts.size < 4) opts.add(String(randInt(12, 98)));
      return {
        prompt: `🕵️ "Aku punya **${o} satuan** dan **${t} puluhan**. Bilangan berapakah aku?"`,
        visual: { kind: "banner", text: "Awas terbalik! 🔄", tone: "rose" },
        options: shuffle(Array.from(opts)),
        correctAnswer: String(num),
        hint: `Puluhan ditulis di depan: ${t} puluhan (${t * 10}) + ${o} satuan = ${num}.`,
      };
    }
    default: {
      const v = randInt(1, 3);
      if (v === 1)
        return {
          prompt: "🌟 **Tantangan Puncak!** 10 batang puluhan digabung bernilai...",
          visual: { kind: "dienes", n: 100 },
          options: shuffle(["100", "10", "90", "99"]),
          correctAnswer: "100",
          hint: "10 puluhan = 10 × 10 = 100 (1 Ratusan).",
        };
      if (v === 2)
        return {
          prompt: "🌟 Pada bilangan **100**, angka **1** menempati nilai tempat...",
          visual: { kind: "digits", digits: ["1", "0", "0"], highlight: 0 },
          options: ["Ratusan", "Puluhan", "Satuan"],
          correctAnswer: "Ratusan",
          hint: "100 = 1 Ratusan, 0 Puluhan, 0 Satuan.",
        };
      return {
        prompt: "🌟 **1 ratusan + 0 puluhan + 0 satuan** = ...",
        visual: { kind: "dienes", n: 100 },
        options: shuffle(["100", "10", "101", "110"]),
        correctAnswer: "100",
        hint: "1 ratusan + 0 puluhan + 0 satuan membentuk 100!",
      };
    }
  }
}

export interface Player {
  id: number;
  level: number;
  sub: number;
  score: number;
  lives: number;
  correct: number;
  streak: number;
  q: Question;
  status: "playing" | "finished" | "out";
  rank: number | null;
  timeSec: number | null;
  feedback: { type: "correct" | "wrong"; msg: string } | null;
  locked: boolean;
}

export function newPlayer(id: number): Player {
  return {
    id, level: 1, sub: 1, score: 0, lives: MAX_LIVES, correct: 0, streak: 0,
    q: generateQuestion(1), status: "playing", rank: null, timeSec: null, feedback: null, locked: false,
  };
}

/** Apply a wrong answer: lose one life; at zero lives the player's game stops immediately. */
export function applyWrong(p: Player): Player {
  const lives = Math.max(0, p.lives - 1);
  return {
    ...p,
    lives,
    streak: 0,
    score: Math.max(0, p.score - 15),
    status: lives === 0 ? "out" : p.status,
    locked: lives === 0,
    feedback: lives === 0
      ? { type: "wrong", msg: "💔 Nyawa habis! Permainan berhenti." }
      : { type: "wrong", msg: `💡 Kurang tepat! ${p.q.hint}` },
  };
}
