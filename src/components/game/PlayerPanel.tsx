import { lazy, Suspense } from "react";
import { AVATARS } from "./avatars";
import { DIFFICULTIES, MAX_LIVES, PLAYER_THEMES, TOTAL_QUESTIONS, type Player, type Visual } from "@/game/logic";

const Dienes3D = lazy(() => import("./Dienes3D"));

function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split("**").map((part, i) => (i % 2 ? <strong key={i} className="text-tone">{part}</strong> : <span key={i}>{part}</span>))}
    </>
  );
}

function VisualView({ v, compact }: { v: Visual; compact: boolean }) {
  if (v.kind === "dienes")
    return (
      <div className={`relative w-full rounded-2xl bg-secondary/60 ${compact ? "h-36" : "h-48 sm:h-56"}`}>
        <Suspense fallback={<div className="h-full grid place-items-center text-muted-foreground text-sm">Memuat balok…</div>}>
          <Dienes3D n={v.n} />
        </Suspense>
        <span className="absolute bottom-1.5 right-2 text-[10px] font-bold text-muted-foreground">🖐️ geser untuk memutar</span>
      </div>
    );
  if (v.kind === "digits")
    return (
      <div className="flex justify-center gap-3 py-2">
        {v.digits.map((d, i) => (
          <div key={i} className={`digit-tile rounded-2xl font-heading font-bold grid place-items-center transition-all ${compact ? "w-14 h-16 text-4xl" : "w-20 h-24 text-6xl"} ${v.highlight === i ? "digit-hl" : ""}`}>
            {d}
          </div>
        ))}
      </div>
    );
  return (
    <div className={`banner-${v.tone} inline-block rounded-2xl px-5 py-2 font-heading font-bold ${compact ? "text-lg" : "text-2xl sm:text-3xl"}`}>
      {v.text}
    </div>
  );
}

export function Hearts({ lives, size = "text-2xl" }: { lives: number; size?: string }) {
  return (
    <div className={`flex gap-0.5 ${size}`} aria-label={`Nyawa ${lives} dari ${MAX_LIVES}`}>
      {Array.from({ length: MAX_LIVES }).map((_, i) => (
        <span key={i} className={i < lives ? (lives === 1 ? "anim-heartbeat" : "") : "anim-heartbreak"}>❤️</span>
      ))}
    </div>
  );
}

interface Props {
  p: Player;
  compact: boolean;
  shakeKey: number;
  onAnswer: (ans: string) => void;
  picked: string | null;
}

export function PlayerPanel({ p, compact, shakeKey, onAnswer, picked }: Props) {
  const th = PLAYER_THEMES[p.id]!;
  const progress = (p.qNum - 1 + (p.status === "finished" ? 1 : 0)) / TOTAL_QUESTIONS;
  const diff = DIFFICULTIES.find((d) => d.id === p.difficulty)!;

  return (
    <section className={`tone-${th.tone} glass rounded-3xl flex flex-col overflow-hidden min-h-0 relative`}>
      <header className="bg-tone px-3 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <img src={AVATARS[p.id]} alt={th.name} width={44} height={44} className="w-11 h-11 rounded-full bg-card object-cover anim-bob" />
          <div className="min-w-0">
            <div className="font-heading font-bold leading-tight truncate">{th.name}</div>
            <div className="text-[11px] opacity-90 font-bold">⭐ {p.score} poin {p.streak >= 2 && `· 🔥${p.streak}`}</div>
          </div>
        </div>
        <Hearts lives={p.lives} size={compact ? "text-lg" : "text-2xl"} />
      </header>

      <div className="h-2.5 bg-muted">
        <div className="h-full bg-tone transition-all duration-500" style={{ width: `${progress * 100}%` }} />
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">{diff.emoji} {diff.label}</span>
          <span className="text-muted-foreground">Soal {p.qNum}/{TOTAL_QUESTIONS}</span>
        </div>

        <div key={`${p.qNum}-${shakeKey}`} className={`flex flex-col items-center gap-3 text-center ${shakeKey ? "anim-shake" : "anim-pop"}`}>
          <p className={`font-bold leading-snug ${compact ? "text-sm" : "text-base sm:text-lg"}`}><Rich text={p.q.prompt} /></p>
          <VisualView v={p.q.visual} compact={compact} />
        </div>

        <div className={`grid gap-2.5 ${p.q.options.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
          {p.q.options.map((o) => {
            const isPicked = picked === o;
            const state = isPicked ? (o === p.q.correctAnswer ? "option-correct" : "option-wrong") : "";
            return (
              <button
                key={o}
                disabled={p.locked || p.status !== "playing"}
                onClick={() => onAnswer(o)}
                className={`btn-3d option-btn ${state} rounded-2xl font-heading font-bold ${compact ? "py-2 text-base" : "py-3 text-xl"} ${o.length > 8 ? "!text-sm" : ""}`}
              >
                {o}
              </button>
            );
          })}
        </div>

        {p.feedback && p.status === "playing" && (
          <div className={`anim-pop rounded-2xl px-3 py-2 text-sm font-bold ${p.feedback.type === "correct" ? "banner-emerald" : "banner-rose"}`}>
            {p.feedback.msg}
          </div>
        )}
      </div>

      {p.status !== "playing" && (
        <div className="absolute inset-0 grid place-items-center bg-background/80 backdrop-blur-sm anim-pop p-4">
          <div className="text-center">
            <div className="text-6xl mb-2">{p.status === "out" ? "💔" : "🏆"}</div>
            <h3 className="font-heading text-2xl font-bold">{p.status === "out" ? "Nyawa Habis!" : `Selesai! Juara #${p.rank}`}</h3>
            <p className="text-muted-foreground font-bold mt-1">
              {p.status === "out" ? `Berhenti di soal ${p.qNum}` : `${p.timeSec} detik`} · ⭐ {p.score}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
