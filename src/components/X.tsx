import React, { useMemo, useState } from "react";
import Layout from "@/Layout";
import {
  BellRing,
  CalendarDays,
  CheckCircle2,
  Copy,
  Flame,
  Sparkles,
  Timer,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { toast } from "react-toastify";

type Challenge = {
  id: string;
  title: string;
  points: number;
  minutes: number;
  icon: React.ReactNode;
  desc: string;
};

const challenges: Challenge[] = [
  {
    id: "c1",
    title: "Past Exam Sprint",
    points: 50,
    minutes: 25,
    icon: <Timer className="size-4" />,
    desc: "Solve 1 past exam question + write the mistake rule.",
  },
  {
    id: "c2",
    title: "Notes Compression",
    points: 35,
    minutes: 15,
    icon: <Sparkles className="size-4" />,
    desc: "Turn one lecture into 5 bullets (no more).",
  },
  {
    id: "c3",
    title: "Active Recall",
    points: 40,
    minutes: 20,
    icon: <TrendingUp className="size-4" />,
    desc: "Close notes and explain the topic like you’re teaching.",
  },
  {
    id: "c4",
    title: "Quick Revision",
    points: 25,
    minutes: 10,
    icon: <Flame className="size-4" />,
    desc: "Review mistakes list + redo 1 problem you failed before.",
  },
];

function cls(...s: Array<string | false | undefined>) {
  return s.filter(Boolean).join(" ");
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function getCountdown(target: Date) {
  const now = new Date().getTime();
  const diff = target.getTime() - now;

  const isPast = diff <= 0;
  const total = Math.max(0, diff);

  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((total / (1000 * 60)) % 60);
  const secs = Math.floor((total / 1000) % 60);

  return { isPast, days, hours, mins, secs };
}

function useLocalStorageState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  const update = (next: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const v = typeof next === "function" ? (next as any)(prev) : next;
      try {
        localStorage.setItem(key, JSON.stringify(v));
      } catch {}
      return v;
    });
  };

  return [value, update] as const;
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export default function FinalsStreakPage() {
  // ✅ Finals in exactly 2 weeks (14 days) from now, at 9:00 AM local time.
  const targetDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    d.setHours(9, 0, 0, 0);
    return d;
  }, []);

  const [tick, setTick] = useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const countdown = useMemo(() => getCountdown(targetDate), [targetDate, tick]);

  const [streakState, setStreakState] = useLocalStorageState<{
    streak: number;
    lastCheck: string | null;
    points: number;
    doneToday: string[];
  }>("auknotes_streak", { streak: 0, lastCheck: null, points: 0, doneToday: [] });

  const today = todayKey();

  // reset doneToday automatically when day changes
  React.useEffect(() => {
    if (streakState.lastCheck && streakState.lastCheck !== today) {
      setStreakState((prev) => ({ ...prev, doneToday: [] }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today]);

  const doneSet = useMemo(() => new Set(streakState.doneToday), [streakState.doneToday]);

  const levelInfo = useMemo(() => {
    const points = streakState.points;
    const levels = [
      { name: "Newbie", min: 0, next: 150 },
      { name: "Focused", min: 150, next: 350 },
      { name: "Beast Mode", min: 350, next: 700 },
      { name: "Finals Killer", min: 700, next: 1200 },
    ];

    const current =
      levels
        .slice()
        .reverse()
        .find((l) => points >= l.min) || levels[0];

    const next = levels.find((l) => l.min === current.next) || null;

    const progressToNext = current.next
      ? Math.min(100, Math.round(((points - current.min) / (current.next - current.min)) * 100))
      : 100;

    return { current, next, progressToNext, points };
  }, [streakState.points]);

  const checkIn = () => {
    if (streakState.lastCheck === today) {
      toast.info("You already checked in today ✅");
      return;
    }

    const newStreak =
      streakState.lastCheck === null
        ? 1
        : (() => {
            const now = new Date();
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            const yKey = `${yesterday.getFullYear()}-${pad2(yesterday.getMonth() + 1)}-${pad2(
              yesterday.getDate()
            )}`;
            return streakState.lastCheck === yKey ? streakState.streak + 1 : 1;
          })();

    setStreakState((prev) => ({
      ...prev,
      streak: newStreak,
      lastCheck: today,
      points: prev.points + 20,
      doneToday: [],
    }));

    toast.success(`Checked in ✅ Streak: ${newStreak}🔥`);
  };

  const toggleChallenge = (id: string) => {
    const ch = challenges.find((c) => c.id === id);
    if (!ch) return;

    if (doneSet.has(id)) {
      setStreakState((prev) => ({
        ...prev,
        points: Math.max(0, prev.points - ch.points),
        doneToday: prev.doneToday.filter((x) => x !== id),
      }));
      toast.info("Removed (points updated)");
      return;
    }

    setStreakState((prev) => ({
      ...prev,
      points: prev.points + ch.points,
      doneToday: [...prev.doneToday, id],
    }));
    toast.success(`+${ch.points} points ✅`);
  };

  const share = () => {
    const text = `AUKNotes Finals Streak 🔥
Streak: ${streakState.streak} days
Points: ${streakState.points}
Level: ${levelInfo.current.name}

Join me on AUKNotes 💪`;

    const wa = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(wa, "_blank", "noopener,noreferrer");
  };

  const copy = async () => {
    const text = `AUKNotes Finals Streak 🔥
Streak: ${streakState.streak} days
Points: ${streakState.points}
Level: ${levelInfo.current.name}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied ✅");
    } catch {
      toast.error("Copy failed");
    }
  };

  const streakBadge = useMemo(() => {
    if (streakState.streak >= 14) return "Legend";
    if (streakState.streak >= 7) return "Hardworker";
    if (streakState.streak >= 3) return "Consistent";
    return "Starter";
  }, [streakState.streak]);

  return (
    <div className="min-h-screen bg-beige">
      {/* wider + better spacing for big screens */}
      <div className="max-w-7xl 2xl:max-w-[1400px] mx-auto px-4 md:px-8 py-10 md:py-12">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-700 text-sm shadow-sm">
            <Sparkles className="size-4 text-tomato" />
            Finals Mode • AUKNotes
          </div>

          <div className="mt-5 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              Finals in <span className="text-tomato">2 weeks</span>
            </h1>

            {/* quick actions on big screens */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={checkIn}
                className="rounded-2xl bg-black text-white px-5 py-3 text-sm font-extrabold hover:opacity-90 transition">
                Check-in (+20)
              </button>
              {/*  <button
                onClick={share}
                className="rounded-2xl bg-emerald-600 text-white px-5 py-3 text-sm font-extrabold hover:bg-emerald-700 transition">
                Share on WhatsApp
              </button> */}
              <button
                onClick={copy}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-900 hover:bg-slate-50 transition inline-flex items-center gap-2">
                <Copy className="size-4" />
                Copy
              </button>
            </div>
          </div>

          <p className="mt-3 text-slate-600 max-w-2xl">
            Check-in daily, earn points, and keep your streak alive until finals.
          </p>
        </div>

        {/* Hero grid (better big-screen layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Countdown */}
          <div className="lg:col-span-8 rounded-3xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm overflow-hidden relative">
            <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-orange-200/60 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 size-72 rounded-full bg-sky-200/50 blur-3xl" />

            <div className="relative flex items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-black text-slate-700">
                  <CalendarDays className="size-4 text-tomato" />
                  Countdown to finals
                </div>
                <div className="mt-3 text-2xl md:text-3xl font-extrabold text-slate-900">
                  {countdown.isPast ? "Finals started!" : "Time is ticking…"}
                </div>
                {/*    <p className="mt-2 text-sm text-slate-600">
                  (Currently set to 14 days from now at 9:00 AM.)
                </p> */}
              </div>

              <div className="hidden sm:inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-extrabold text-slate-900 shadow-sm">
                <BellRing className="size-4 text-emerald-600" />
                Stay ready
              </div>
            </div>

            <div className="relative mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <TimeBox label="Days" value={pad2(countdown.days)} />
              <TimeBox label="Hours" value={pad2(countdown.hours)} />
              <TimeBox label="Min" value={pad2(countdown.mins)} />
              <TimeBox label="Sec" value={pad2(countdown.secs)} />
            </div>

            {/* actions for small screens */}
            <div className="relative mt-4 flex flex-col sm:flex-row gap-2 lg:hidden">
              <button
                onClick={checkIn}
                className="flex-1 rounded-2xl bg-black text-white px-4 py-3 text-sm font-extrabold hover:opacity-90 transition">
                Check-in today (+20)
              </button>

              <button
                onClick={share}
                className="flex-1 rounded-2xl bg-emerald-600 text-white px-4 py-3 text-sm font-extrabold hover:bg-emerald-700 transition">
                Share on WhatsApp
              </button>

              <button
                onClick={copy}
                className="sm:w-[160px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-extrabold text-slate-900 hover:bg-slate-50 transition inline-flex items-center justify-center gap-2">
                <Copy className="size-4" />
                Copy
              </button>
            </div>
          </div>

          {/* Streak / Level */}
          <div className="lg:col-span-4 rounded-3xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-black text-slate-600">Your streak</div>
                <div className="mt-2 flex items-end gap-2">
                  <div className="text-4xl font-extrabold text-slate-900">{streakState.streak}</div>
                  <div className="text-sm font-bold text-slate-600 mb-1">days</div>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-extrabold text-slate-700">
                <Flame className="size-4 text-orange-500" />
                {streakBadge}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-extrabold text-slate-900">
                  {levelInfo.current.name}
                </div>
                <div className="text-xs font-black text-slate-700">{levelInfo.points} pts</div>
              </div>

              <div className="mt-3 h-2 rounded-full bg-white border border-slate-200 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-emerald-600"
                  style={{ width: `${levelInfo.progressToNext}%` }}
                />
              </div>

              <div className="mt-2 text-xs text-slate-600">
                {levelInfo.next ? (
                  <>
                    <span className="font-bold text-slate-900">
                      {levelInfo.current.next - levelInfo.points}
                    </span>{" "}
                    points to reach{" "}
                    <span className="font-bold text-slate-900">{levelInfo.next.name}</span>
                  </>
                ) : (
                  <span className="font-bold text-slate-900">Max level reached 🏆</span>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <MiniStat
                label="Checked today"
                value={streakState.lastCheck === today ? "Yes" : "No"}
              />
              <MiniStat
                label="Tasks done"
                value={`${streakState.doneToday.length}/${challenges.length}`}
              />
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                <Trophy className="size-4 text-amber-500" />
                Today’s reward
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Complete <span className="font-bold text-slate-900">2 challenges</span> today and
                share your streak.
              </p>
            </div>
          </div>
        </div>

        {/* Challenges */}
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Daily challenges</h2>
              <p className="text-sm text-slate-600 mt-1">
                Tap to complete. Points stack. Your friends will compete.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-extrabold text-slate-700">
              <CheckCircle2 className="size-4 text-emerald-600" />
              {streakState.doneToday.length} done
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {challenges.map((c) => {
              const done = doneSet.has(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggleChallenge(c.id)}
                  className={cls(
                    "text-left rounded-2xl border p-4 transition",
                    done
                      ? "border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                      : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                  )}>
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={cls(
                        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-extrabold",
                        done
                          ? "border-emerald-200 bg-white text-emerald-700"
                          : "border-slate-200 bg-white text-slate-700"
                      )}>
                      {c.icon}
                      {c.minutes}m
                    </span>

                    <span
                      className={cls(
                        "inline-flex items-center rounded-full border px-2 py-1 text-[11px] font-extrabold",
                        done
                          ? "border-emerald-200 bg-white text-emerald-700"
                          : "border-slate-200 bg-white text-slate-700"
                      )}>
                      +{c.points}
                    </span>
                  </div>

                  <div className="mt-3 text-slate-900 font-extrabold">{c.title}</div>
                  <p className="mt-1 text-sm text-slate-600">{c.desc}</p>

                  <div className="mt-3 text-xs font-black">
                    {done ? (
                      <span className="text-emerald-700">Completed ✅ (tap to undo)</span>
                    ) : (
                      <span className="text-slate-500">Tap to complete</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function TimeBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-black text-slate-600">{label}</div>
      <div className="mt-2 text-2xl md:text-3xl font-extrabold text-slate-900">{value}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <div className="text-xs font-black text-slate-600">{label}</div>
      <div className="mt-1 text-sm font-extrabold text-slate-900">{value}</div>
    </div>
  );
}
