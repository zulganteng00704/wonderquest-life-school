import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { MAX_LIVES, PLAYER_THEMES, TOTAL_LEVELS, applyWrong, generateQuestion, newPlayer, type Player } from "@/game/logic";
import { sound } from "@/game/sound";
import { PlayerPanel } from "@/components/game/PlayerPanel";

const Background3D = lazy(() => import("@/components/game/Background3D"));
const Dienes3D = lazy(() => import("@/components/game/Dienes3D"));

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Petualangan Nilai Tempat: Juara Angka 100" },
      { name: "description", content: "Game edukasi 3D interaktif belajar nilai tempat puluhan dan satuan hingga 100, untuk 1–4 pemain." },
      { property: "og:title", content: "Petualangan Nilai Tempat: Juara Angka 100" },
      { property: "og:description", content: "Belajar puluhan & satuan dengan balok 3D, nyawa, dan podium juara." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Game,
});

type Screen = "home" | "game" | "podium";

function Game() {
  const [screen, setScreen] = useState<Screen>("home");
  const [numPlayers, setNumPlayers] = useState(1);
  const [qpl, setQpl] = useState(1);
  const [players, setPlayers] = useState<Player[]>([]);
  const [shake, setShake] = useState<number[]>([0, 0, 0, 0]);
  const [picked, setPicked] = useState<(string | null)[]>([null, null, null, null]);
  const [muted, setMuted] = useState(false);
  const [bursts, setBursts] = useState<{ id: number; x: number }[]>([]);
  const startRef = useRef(0);
  const rankRef = useRef(0);

  const start = (n: number) => {
    sound.click();
    setNumPlayers(n);
    setPlayers(Array.from({ length: n }, (_, i) => newPlayer(i)));
    setShake([0, 0, 0, 0]);
    setPicked([null, null, null, null]);
    startRef.current = Date.now();
    rankRef.current = 0;
    setScreen("game");
  };

  // End the whole match once nobody is still playing.
  useEffect(() => {
    if (screen !== "game" || players.length === 0) return;
    if (players.every((p) => p.status !== "playing")) {
      const t = setTimeout(() => setScreen("podium"), 1600);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [players, screen]);

  const update = (i: number, fn: (p: Player) => Player) => setPlayers((ps) => ps.map((p, j) => (j === i ? fn(p) : p)));
  const setPick = (i: number, v: string | null) => setPicked((a) => a.map((x, j) => (j === i ? v : x)));

  const answer = (i: number, ans: string, ev?: React.MouseEvent) => {
    const p = players[i];
    if (!p || p.locked || p.status !== "playing") return;
    setPick(i, ans);
    if (ans === p.q.correctAnswer) {
      sound.correct();
      const id = Date.now() + i;
      setBursts((b) => [...b, { id, x: ev ? ev.clientX : window.innerWidth / 2 }]);
      setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 1000);
      update(i, (p) => ({ ...p, locked: true, correct: p.correct + 1, streak: p.streak + 1, score: p.score + 100 + Math.min(p.streak, 5) * 10, feedback: { type: "correct", msg: "🌟 Hebat! Jawabanmu benar!" } }));
      setTimeout(() => {
        setPick(i, null);
        update(i, (p) => {
          const base = { ...p, feedback: null, locked: false };
          if (p.sub < qpl) return { ...base, sub: p.sub + 1, q: generateQuestion(p.level) };
          if (p.level < TOTAL_LEVELS) return { ...base, level: p.level + 1, sub: 1, q: generateQuestion(p.level + 1) };
          rankRef.current += 1;
          const rank = rankRef.current;
          sound.finish();
          return { ...base, locked: true, status: "finished", rank, score: p.score + (rank === 1 ? 200 : rank === 2 ? 100 : 50) + p.lives * 50, timeSec: Math.max(1, Math.round((Date.now() - startRef.current) / 1000)) };
        });
      }, 700);
    } else {
      const next = applyWrong(p);
      if (next.status === "out") sound.gameOver(); else sound.wrong();
      update(i, () => next);
      setShake((s) => s.map((x, j) => (j === i ? x + 1 : x)));
      setTimeout(() => setPick(i, null), 600);
    }
  };

  const toggleMute = () => { sound.muted = !sound.muted; setMuted(sound.muted); };

  return (
    <div className="fixed inset-0 flex flex-col">
      <div className="absolute inset-0 -z-0 pointer-events-none">
        <Suspense fallback={null}><Background3D count={screen === "game" ? 12 : 24} /></Suspense>
      </div>

      <header className="relative z-10 h-14 px-3 sm:px-5 flex items-center justify-between glass !rounded-none !border-x-0 !border-t-0">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground grid place-items-center font-heading font-bold btn-3d">100</div>
          <h1 className="font-heading font-bold text-base sm:text-xl">Petualangan Nilai Tempat</h1>
        </div>
        <div className="flex items-center gap-2">
          {screen !== "home" && (
            <>
              <button onClick={() => { sound.click(); setScreen("home"); }} className="btn-3d option-btn rounded-xl px-3 py-1.5 text-sm font-bold">🏠 <span className="hidden sm:inline">Menu</span></button>
              <button onClick={() => start(numPlayers)} className="btn-3d option-btn rounded-xl px-3 py-1.5 text-sm font-bold">🔄 <span className="hidden sm:inline">Ulangi</span></button>
            </>
          )}
          <button onClick={toggleMute} className="btn-3d option-btn rounded-xl w-10 h-9 text-base">{muted ? "🔇" : "🔊"}</button>
        </div>
      </header>

      <main className="relative z-10 flex-1 min-h-0 overflow-hidden">
        {screen === "home" && <Home qpl={qpl} setQpl={setQpl} onStart={start} />}
        {screen === "game" && (
          <div className={`h-full p-3 sm:p-4 grid gap-3 ${numPlayers === 1 ? "max-w-2xl mx-auto grid-cols-1" : numPlayers === 2 ? "grid-cols-1 md:grid-cols-2" : numPlayers === 3 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-2 lg:grid-cols-4"}`}>
            {players.map((p, i) => (
              <PlayerPanel key={i} p={p} qpl={qpl} compact={numPlayers >= 3} shakeKey={shake[i] ?? 0} picked={picked[i] ?? null} onAnswer={(a) => answer(i, a)} />
            ))}
          </div>
        )}
        {screen === "podium" && <Podium players={players} onAgain={() => start(numPlayers)} onHome={() => setScreen("home")} />}
      </main>

      {bursts.map((b) => (
        <div key={b.id} className="fixed z-50 pointer-events-none text-4xl anim-rise" style={{ left: b.x - 20, top: "55%" }}>✨⭐</div>
      ))}
    </div>
  );
}

function Home({ qpl, setQpl, onStart }: { qpl: number; setQpl: (n: number) => void; onStart: (n: number) => void }) {
  return (
    <div className="h-full overflow-y-auto grid place-items-center p-4">
      <div className="glass rounded-[2rem] max-w-4xl w-full p-5 sm:p-8 text-center anim-pop">
        <span className="inline-block px-4 py-1 rounded-full bg-accent text-accent-foreground font-bold text-xs sm:text-sm">✨ Game Edukasi 3D · 1–4 Pemain ✨</span>
        <h2 className="font-heading text-3xl sm:text-5xl font-bold mt-3">Juara Angka 100</h2>
        <p className="text-muted-foreground font-semibold max-w-xl mx-auto mt-2 text-sm sm:text-base">
          Kenali <b>Puluhan</b> dan <b>Satuan</b> dengan balok 3D! Selesaikan 10 level. Setiap pemain punya <b>{MAX_LIVES} nyawa ❤️</b> — salah jawab mengurangi nyawa, dan saat nyawa habis permainan langsung berhenti.
        </p>

        <div className="relative mx-auto mt-4 h-44 sm:h-52 max-w-lg rounded-3xl bg-secondary/60">
          <Suspense fallback={null}><Dienes3D n={34} /></Suspense>
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-4 text-xs font-bold">
            <span className="banner-sky rounded-full px-3 py-0.5">🟦 1 batang = 10</span>
            <span className="banner-amber rounded-full px-3 py-0.5">🟨 1 kubus = 1</span>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 text-sm font-bold">
          <span className="text-muted-foreground">Soal per level:</span>
          {[1, 2, 3].map((n) => (
            <button key={n} onClick={() => setQpl(n)} className={`btn-3d rounded-xl w-10 h-9 ${qpl === n ? "bg-primary text-primary-foreground" : "option-btn"}`}>{n}</button>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PLAYER_THEMES.map((t, i) => (
            <button key={i} onClick={() => onStart(i + 1)} className={`tone-${t.tone} btn-3d bg-tone rounded-2xl p-4 font-heading font-bold`}>
              <div className="text-3xl mb-1 tracking-tighter">{PLAYER_THEMES.slice(0, i + 1).map((x) => x.mascot).join("")}</div>
              <div className="text-lg">{i + 1} Pemain</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Podium({ players, onAgain, onHome }: { players: Player[]; onAgain: () => void; onHome: () => void }) {
  const sorted = [...players].sort((a, b) => {
    if (a.status === "finished" && b.status !== "finished") return -1;
    if (b.status === "finished" && a.status !== "finished") return 1;
    if (a.status === "finished") return (a.rank ?? 9) - (b.rank ?? 9);
    return b.level - a.level || b.score - a.score;
  });
  const anyWin = players.some((p) => p.status === "finished");
  return (
    <div className="h-full overflow-y-auto grid place-items-center p-4">
      <div className="glass rounded-[2rem] max-w-2xl w-full p-6 sm:p-8 text-center anim-pop">
        <div className="text-6xl">{anyWin ? "🏆" : "💔"}</div>
        <h2 className="font-heading text-3xl sm:text-4xl font-bold mt-2">{anyWin ? "Podium Juara!" : "Permainan Berakhir"}</h2>
        <p className="text-muted-foreground font-bold mt-1">{anyWin ? "Selamat untuk para juara angka!" : "Nyawa habis. Ayo coba lagi, kamu pasti bisa!"}</p>
        <div className="mt-5 flex flex-col gap-2.5">
          {sorted.map((p, i) => {
            const t = PLAYER_THEMES[p.id]!;
            return (
              <div key={p.id} className={`tone-${t.tone} flex items-center gap-3 rounded-2xl border-2 border-tone bg-card px-4 py-3`}>
                <span className="font-heading text-2xl font-bold w-8">{["🥇", "🥈", "🥉", "4"][i]}</span>
                <span className="text-3xl">{t.mascot}</span>
                <div className="flex-1 text-left">
                  <div className="font-heading font-bold">{t.name}</div>
                  <div className="text-xs text-muted-foreground font-bold">
                    {p.status === "finished" ? `Tamat · ${p.timeSec} detik` : `Nyawa habis di Level ${p.level}`} · {p.correct} benar
                  </div>
                </div>
                <div className="font-heading font-bold text-xl text-tone">⭐ {p.score}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={onAgain} className="btn-3d bg-primary text-primary-foreground rounded-2xl px-6 py-3 font-heading font-bold text-lg">🔄 Main Lagi</button>
          <button onClick={onHome} className="btn-3d option-btn rounded-2xl px-6 py-3 font-heading font-bold text-lg">🏠 Menu</button>
        </div>
      </div>
    </div>
  );
}
