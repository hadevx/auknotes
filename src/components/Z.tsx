import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlarmClock,
  Pause,
  Play,
  RotateCcw,
  Settings,
  Bell,
  Flame,
  TimerReset,
  CheckCircle2,
  XCircle,
  Volume2,
  VolumeX,
  ListTodo,
  Focus,
  BarChart3,
  Award,
  ShieldCheck,
  Sparkles,
  Trash2,
  Plus,
} from "lucide-react";

/**
 * AukNotes — Focus Timer + Pomodoro PRO (All-in-one page)
 * ✅ Sounds (WebAudio): presets, volume slider, end-phase melody, optional ticking (last 10s), vibration (mobile)
 * ✅ Tasks per focus: 1–3 tasks, end-of-session review (Done / Carry Over)
 * ✅ Deep Focus mode: locks UI to timer-only overlay
 * ✅ Stats dashboard: weekly minutes chart, best streak, sessions count, "heatmap-ish" sessions by hour
 * ✅ Badges: streak, sessions, minutes milestones
 * ✅ Anti-cheat: streak only counts when at least 1 focus completes; excessive skipping disables streak for the day
 * ✅ localStorage persistence
 *
 * Drop-in:
 * - Vite/CRA: src/pages/FocusPomodoroPro.tsx
 * - Next.js app router: add "use client"; at top
 */

// "use client";

type Phase = "Focus" | "Short Break" | "Long Break";

type SoundPack = "Soft" | "Classic" | "Arcade";

type SettingsState = {
  focusMin: number; // 10..90
  shortBreakMin: number; // 2..30
  longBreakMin: number; // 5..60
  longBreakEvery: number; // 2..8 (after N focus sessions)
  autoStartNext: boolean;

  // Sound
  soundEnabled: boolean;
  volume: number; // 0..1
  pack: SoundPack;
  tickLast10s: boolean;
  vibrate: boolean;

  // Ambient
  ambientEnabled: boolean;
  ambientType: "Rain" | "White Noise" | "Coffee Shop";
  ambientVolume: number; // 0..1
};

type Task = {
  id: string;
  text: string;
  status: "todo" | "done" | "carry";
};

type SessionLog = {
  id: string;
  dateKey: string; // YYYY-MM-DD
  startedAt: number;
  endedAt: number;
  phase: Phase;
  minutesPlanned: number;
  minutesCompleted: number;
  completed: boolean;
  skipped: boolean;
};

type StatsState = {
  streak: number;
  bestStreak: number;
  lastStreakDate: string; // YYYY-MM-DD

  dailyKey: string; // YYYY-MM-DD (for daily reset)
  focusMinutesToday: number;
  completedFocusToday: number;

  // anti-cheat
  skipsToday: number;
  streakLockedToday: boolean; // if too many skips -> no streak for today

  totalCompletedFocusSessions: number;
  totalFocusMinutes: number;

  // logs for charts (keep last 60 days)
  logs: SessionLog[];
};

type UIState = {
  deepFocus: boolean;
  showSettings: boolean;
  showStats: boolean;
  showTaskReview: boolean;
};

const LS_KEYS = {
  settings: "auknotes_pomodoro_pro_settings_v1",
  stats: "auknotes_pomodoro_pro_stats_v1",
  tasks: "auknotes_pomodoro_pro_tasks_v1",
};

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(dateKey: string, n: number) {
  const d = new Date(dateKey + "T00:00:00");
  d.setDate(d.getDate() + n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveJSON(key: string, value: any) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function minutesToSeconds(m: number) {
  return Math.max(1, Math.floor(m * 60));
}

function formatTime(totalSec: number) {
  const s = Math.max(0, Math.floor(totalSec));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function formatDateNice(dateKey: string) {
  const d = new Date(dateKey + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "2-digit" });
}

function Ring({ progress, label }: { progress: number; label: string }) {
  const size = 172;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * (1 - clamp(progress, 0, 1));
  return (
    <div className="relative grid place-items-center">
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          className="fill-none stroke-slate-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={dash}
          className="fill-none stroke-slate-900 transition-[stroke-dashoffset] duration-300"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-xs font-bold text-slate-600">{label}</p>
      </div>
    </div>
  );
}

function Pill({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: "slate" | "emerald" | "amber" | "rose" | "indigo" | "zinc";
}) {
  const tones: Record<string, string> = {
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
    emerald: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    amber: "bg-amber-100 text-amber-800 ring-amber-200",
    rose: "bg-rose-100 text-rose-700 ring-rose-200",
    indigo: "bg-indigo-100 text-indigo-700 ring-indigo-200",
    zinc: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${tones[tone]}`}>
      {children}
    </span>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">{children}</div>
  );
}

/** ---------- Audio helpers (WebAudio) ---------- */
type Tone = { f: number; t: number }; // frequency Hz, time seconds

function getPackTones(pack: SoundPack) {
  if (pack === "Soft") {
    return {
      start: [
        { f: 440, t: 0.08 },
        { f: 554, t: 0.1 },
      ],
      end: [
        { f: 659, t: 0.1 },
        { f: 554, t: 0.1 },
        { f: 659, t: 0.1 },
      ],
      longBreak: [
        { f: 392, t: 0.1 },
        { f: 523, t: 0.1 },
        { f: 659, t: 0.12 },
      ],
      tick: 1300,
      wave: "sine" as OscillatorType,
    };
  }
  if (pack === "Arcade") {
    return {
      start: [
        { f: 784, t: 0.06 },
        { f: 988, t: 0.06 },
        { f: 1175, t: 0.07 },
      ],
      end: [
        { f: 1175, t: 0.07 },
        { f: 988, t: 0.07 },
        { f: 784, t: 0.09 },
      ],
      longBreak: [
        { f: 523, t: 0.06 },
        { f: 659, t: 0.06 },
        { f: 784, t: 0.1 },
      ],
      tick: 1800,
      wave: "square" as OscillatorType,
    };
  }
  // Classic
  return {
    start: [
      { f: 523, t: 0.08 },
      { f: 659, t: 0.1 },
    ],
    end: [
      { f: 659, t: 0.1 },
      { f: 523, t: 0.1 },
      { f: 659, t: 0.1 },
      { f: 784, t: 0.12 },
    ],
    longBreak: [
      { f: 392, t: 0.1 },
      { f: 494, t: 0.1 },
      { f: 587, t: 0.12 },
    ],
    tick: 1500,
    wave: "triangle" as OscillatorType,
  };
}

function safeVibrate(enabled: boolean, pattern: number | number[]) {
  if (!enabled) return;
  try {
    // @ts-ignore
    if (navigator?.vibrate) navigator.vibrate(pattern);
  } catch {
    // ignore
  }
}

/** Ambient noise nodes (simple + light) */
type AmbientNodes = {
  gain: GainNode;
  stop: () => void;
};

function createWhiteNoise(ctx: AudioContext, volume: number): AmbientNodes {
  const bufferSize = 2 * ctx.sampleRate;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;

  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer;
  source.loop = true;

  const gain = ctx.createGain();
  gain.gain.value = volume;

  source.connect(gain);
  gain.connect(ctx.destination);
  source.start();

  return {
    gain,
    stop: () => {
      try {
        source.stop();
      } catch {}
      source.disconnect();
      gain.disconnect();
    },
  };
}

function createCoffeeShop(ctx: AudioContext, volume: number): AmbientNodes {
  // “Coffee shop-ish”: bandpassed noise + gentle low hum
  const noise = createWhiteNoise(ctx, 1);
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 900;
  bp.Q.value = 0.7;

  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 1800;

  const hum = ctx.createOscillator();
  hum.type = "sine";
  hum.frequency.value = 60;

  const humGain = ctx.createGain();
  humGain.gain.value = 0.02;

  const gain = ctx.createGain();
  gain.gain.value = volume;

  // rewire white noise chain: noise.gain -> bp -> lp -> gain -> dest
  noise.gain.disconnect();
  noise.gain.connect(bp);
  bp.connect(lp);
  lp.connect(gain);

  hum.connect(humGain);
  humGain.connect(gain);

  gain.connect(ctx.destination);
  hum.start();

  return {
    gain,
    stop: () => {
      noise.stop();
      try {
        hum.stop();
      } catch {}
      hum.disconnect();
      humGain.disconnect();
      bp.disconnect();
      lp.disconnect();
      gain.disconnect();
    },
  };
}

function createRain(ctx: AudioContext, volume: number): AmbientNodes {
  // “Rain-ish”: white noise with lowpass + subtle modulation
  const noise = createWhiteNoise(ctx, 1);
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 1200;

  const gain = ctx.createGain();
  gain.gain.value = volume;

  // gentle volume modulation
  const lfo = ctx.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 0.25;

  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.03;

  lfo.connect(lfoGain);
  lfoGain.connect(gain.gain);

  noise.gain.disconnect();
  noise.gain.connect(lp);
  lp.connect(gain);
  gain.connect(ctx.destination);

  lfo.start();

  return {
    gain,
    stop: () => {
      noise.stop();
      try {
        lfo.stop();
      } catch {}
      lfo.disconnect();
      lfoGain.disconnect();
      lp.disconnect();
      gain.disconnect();
    },
  };
}

/** ---------- Main Component ---------- */
export default function FocusPomodoroProPage() {
  const [settings, setSettings] = useState<SettingsState>({
    focusMin: 25,
    shortBreakMin: 5,
    longBreakMin: 15,
    longBreakEvery: 4,
    autoStartNext: false,

    soundEnabled: true,
    volume: 0.35,
    pack: "Classic",
    tickLast10s: true,
    vibrate: true,

    ambientEnabled: false,
    ambientType: "Rain",
    ambientVolume: 0.12,
  });

  const [stats, setStats] = useState<StatsState>({
    streak: 0,
    bestStreak: 0,
    lastStreakDate: "",

    dailyKey: todayKey(),
    focusMinutesToday: 0,
    completedFocusToday: 0,

    skipsToday: 0,
    streakLockedToday: false,

    totalCompletedFocusSessions: 0,
    totalFocusMinutes: 0,
    logs: [],
  });

  const [tasks, setTasks] = useState<Task[]>([
    { id: uid("task"), text: "Write what you will do in this focus block…", status: "todo" },
  ]);

  const [ui, setUI] = useState<UIState>({
    deepFocus: false,
    showSettings: false,
    showStats: false,
    showTaskReview: false,
  });

  const [phase, setPhase] = useState<Phase>("Focus");
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(minutesToSeconds(settings.focusMin));

  const [focusSessionsInCycle, setFocusSessionsInCycle] = useState(0);

  // For anti-cheat & tracking
  const sessionRef = useRef<SessionLog | null>(null);
  const tickRef = useRef<number | null>(null);

  // Audio
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambientRef = useRef<AmbientNodes | null>(null);

  /** Mount load */
  useEffect(() => {
    const s = loadJSON<SettingsState>(LS_KEYS.settings, settings);
    const st = loadJSON<StatsState>(LS_KEYS.stats, stats);
    const tk = loadJSON<Task[]>(LS_KEYS.tasks, tasks);

    setSettings(s);
    setStats(st);
    setTasks(tk?.length ? tk : tasks);

    setPhase("Focus");
    setRunning(false);
    setSecondsLeft(minutesToSeconds(s.focusMin));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Persist */
  useEffect(() => saveJSON(LS_KEYS.settings, settings), [settings]);
  useEffect(() => saveJSON(LS_KEYS.stats, stats), [stats]);
  useEffect(() => saveJSON(LS_KEYS.tasks, tasks), [tasks]);

  /** Daily reset */
  useEffect(() => {
    const t = todayKey();
    if (stats.dailyKey !== t) {
      setStats((prev) => ({
        ...prev,
        dailyKey: t,
        focusMinutesToday: 0,
        completedFocusToday: 0,
        skipsToday: 0,
        streakLockedToday: false,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats.dailyKey]);

  /** Ambient audio controller */
  useEffect(() => {
    if (!settings.ambientEnabled) {
      ambientRef.current?.stop();
      ambientRef.current = null;
      return;
    }

    // ensure ctx
    const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
    if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
    const ctx = audioCtxRef.current;

    // stop old
    ambientRef.current?.stop();
    ambientRef.current = null;

    // create new
    const v = clamp(settings.ambientVolume, 0, 1);
    let nodes: AmbientNodes;
    if (settings.ambientType === "White Noise") nodes = createWhiteNoise(ctx, v);
    else if (settings.ambientType === "Coffee Shop") nodes = createCoffeeShop(ctx, v);
    else nodes = createRain(ctx, v);

    ambientRef.current = nodes;

    return () => {
      nodes.stop();
      ambientRef.current = null;
    };
  }, [settings.ambientEnabled, settings.ambientType]);

  /** Keep ambient volume in sync */
  useEffect(() => {
    if (!ambientRef.current) return;
    ambientRef.current.gain.gain.value = clamp(settings.ambientVolume, 0, 1);
  }, [settings.ambientVolume]);

  /** Timer tick */
  useEffect(() => {
    if (!running) {
      if (tickRef.current) {
        window.clearInterval(tickRef.current);
        tickRef.current = null;
      }
      return;
    }

    tickRef.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        // tick sound last 10 seconds
        if (settings.soundEnabled && settings.tickLast10s && s <= 10 && s > 1) {
          playTick();
        }
        if (s <= 1) {
          completePhase(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000) as unknown as number;

    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
      tickRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phase, settings.soundEnabled, settings.tickLast10s]);

  /** Document title */
  useEffect(() => {
    document.title = running ? `${formatTime(secondsLeft)} • ${phase}` : `Pomodoro • ${phase}`;
  }, [running, secondsLeft, phase]);

  /** Total seconds for current phase */
  const totalForPhase = useMemo(() => {
    if (phase === "Focus") return minutesToSeconds(settings.focusMin);
    if (phase === "Short Break") return minutesToSeconds(settings.shortBreakMin);
    return minutesToSeconds(settings.longBreakMin);
  }, [phase, settings.focusMin, settings.shortBreakMin, settings.longBreakMin]);

  const progress = useMemo(
    () => 1 - secondsLeft / Math.max(1, totalForPhase),
    [secondsLeft, totalForPhase]
  );

  const phaseTone: "indigo" | "emerald" | "amber" =
    phase === "Focus" ? "indigo" : phase === "Short Break" ? "emerald" : "amber";

  /** ----- Sound engine ----- */
  function ensureCtx(): AudioContext | null {
    try {
      const Ctx = (window.AudioContext ||
        (window as any).webkitAudioContext) as typeof AudioContext;
      if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
      // resume if suspended (Safari / autoplay policies)
      if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume().catch(() => {});
      return audioCtxRef.current;
    } catch {
      return null;
    }
  }

  function playTones(tones: Tone[], type: OscillatorType) {
    if (!settings.soundEnabled) return;
    const ctx = ensureCtx();
    if (!ctx) return;

    const master = ctx.createGain();
    master.gain.value = clamp(settings.volume, 0, 1);
    master.connect(ctx.destination);

    let t = ctx.currentTime + 0.01;
    tones.forEach((tone) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = tone.f;

      // envelope
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.9, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + tone.t);

      osc.connect(gain);
      gain.connect(master);
      osc.start(t);
      osc.stop(t + tone.t + 0.02);
      t += tone.t;
    });

    // cleanup
    setTimeout(() => {
      try {
        master.disconnect();
      } catch {}
    }, 500);
  }

  function playTick() {
    if (!settings.soundEnabled) return;
    const ctx = ensureCtx();
    if (!ctx) return;
    const pack = getPackTones(settings.pack);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = pack.wave;
    osc.frequency.value = pack.tick;

    const vol = clamp(settings.volume, 0, 1) * 0.18; // quiet tick
    gain.gain.value = vol;

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

    osc.start(now);
    osc.stop(now + 0.09);

    setTimeout(() => {
      try {
        gain.disconnect();
      } catch {}
    }, 150);
  }

  function soundStartPhase(p: Phase) {
    const pack = getPackTones(settings.pack);
    if (p === "Focus") playTones(pack.start, pack.wave);
    if (p === "Long Break") playTones(pack.longBreak, pack.wave);
    if (p === "Short Break") playTones(pack.start.slice(0, 2), pack.wave);
  }

  function soundEndPhase(p: Phase) {
    const pack = getPackTones(settings.pack);
    playTones(pack.end, pack.wave);
    safeVibrate(settings.vibrate, p === "Focus" ? [120, 60, 120] : 80);
  }

  async function maybeNotify(title: string, body: string) {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch {}
    }
    if (Notification.permission === "granted") {
      try {
        new Notification(title, { body });
      } catch {}
    }
  }

  /** ----- Task system ----- */
  const focusTasks = useMemo(() => tasks.filter((t) => t.status !== "done"), [tasks]);
  const doneTasks = useMemo(() => tasks.filter((t) => t.status === "done"), [tasks]);

  function addTask() {
    setTasks((prev) => {
      const active = prev.filter((t) => t.status !== "done");
      if (active.length >= 3) return prev; // max 3 active tasks
      return [...prev, { id: uid("task"), text: "", status: "todo" }];
    });
  }

  function updateTask(id: string, text: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, text } : t)));
  }

  function removeTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function markTaskDone(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: "done" } : t)));
  }

  function carryTask(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: "carry" } : t)));
  }

  function resetTasksForNextFocus() {
    // keep carried tasks as todo, drop empty ones, allow user to edit before starting
    setTasks((prev) => {
      const kept = prev
        .filter((t) => t.status !== "done")
        .map((t) => ({ ...t, status: "todo" as const }))
        .filter((t) => t.text.trim().length > 0)
        .slice(0, 3);
      return kept.length ? kept : [{ id: uid("task"), text: "", status: "todo" }];
    });
  }

  /** ----- Timer controls ----- */
  function secondsForPhase(p: Phase) {
    if (p === "Focus") return minutesToSeconds(settings.focusMin);
    if (p === "Short Break") return minutesToSeconds(settings.shortBreakMin);
    return minutesToSeconds(settings.longBreakMin);
  }

  function resetToPhase(p: Phase, playSound = false) {
    setPhase(p);
    setRunning(false);
    setSecondsLeft(secondsForPhase(p));
    if (playSound) soundStartPhase(p);
  }

  function start() {
    if (running) return;

    // Start session record
    const now = Date.now();
    sessionRef.current = {
      id: uid("log"),
      dateKey: todayKey(),
      startedAt: now,
      endedAt: now,
      phase,
      minutesPlanned:
        phase === "Focus"
          ? settings.focusMin
          : phase === "Short Break"
          ? settings.shortBreakMin
          : settings.longBreakMin,
      minutesCompleted: 0,
      completed: false,
      skipped: false,
    };

    // If starting focus, play gentle start sound
    soundStartPhase(phase);

    // Deep focus auto enable option? (we’ll keep it manual)
    setRunning(true);
  }

  function pause() {
    setRunning(false);
  }

  function resetCurrent() {
    resetToPhase(phase, false);
  }

  function skipPhase() {
    // Anti-cheat: count skip, can lock streak for the day if too many skips
    setStats((prev) => {
      const nextSkips = prev.dailyKey === todayKey() ? prev.skipsToday + 1 : 1;
      const lock = nextSkips >= 5; // tweak: after 5 skips, streak doesn't count today
      return {
        ...prev,
        skipsToday: nextSkips,
        streakLockedToday: lock,
        dailyKey: todayKey(),
      };
    });

    // finalize session as skipped
    const now = Date.now();
    if (sessionRef.current) {
      sessionRef.current.endedAt = now;
      sessionRef.current.skipped = true;
      sessionRef.current.completed = false;
      sessionRef.current.minutesCompleted = 0;

      pushLog(sessionRef.current);
      sessionRef.current = null;
    }

    completePhase(true);
  }

  function pushLog(log: SessionLog) {
    setStats((prev) => {
      const trimmed = [...prev.logs, log].sort((a, b) => a.startedAt - b.startedAt).slice(-1200); // keep a lot, but we’ll chart last 7 days anyway
      return { ...prev, logs: trimmed };
    });
  }

  function completePhase(skipped: boolean) {
    // stop tick
    setRunning(false);

    // end sound
    soundEndPhase(phase);

    // session bookkeeping
    const now = Date.now();
    if (sessionRef.current) {
      const plannedSec = secondsForPhase(phase);
      const completedSec = skipped ? 0 : plannedSec; // since it hit 0 naturally
      const completedMin = Math.round(completedSec / 60);

      sessionRef.current.endedAt = now;
      sessionRef.current.completed = !skipped;
      sessionRef.current.skipped = skipped;
      sessionRef.current.minutesCompleted = completedMin;

      pushLog(sessionRef.current);
      sessionRef.current = null;
    }

    maybeNotify("AukNotes Focus Timer", `${phase} complete. Next phase is ready.`);

    if (phase === "Focus" && !skipped) {
      // Update stats (focus completion)
      const t = todayKey();
      setStats((prev) => {
        const dayChanged = prev.dailyKey !== t;

        const focusMinutesToday = dayChanged
          ? settings.focusMin
          : prev.focusMinutesToday + settings.focusMin;
        const completedFocusToday = dayChanged ? 1 : prev.completedFocusToday + 1;

        // streak: only counts if NOT locked by anti-cheat
        let nextStreak = prev.streak;
        let nextLast = prev.lastStreakDate;
        let nextBest = prev.bestStreak;

        if (!prev.streakLockedToday) {
          if (prev.lastStreakDate !== t) {
            const y = addDays(t, -1);
            nextStreak = prev.lastStreakDate === y ? prev.streak + 1 : 1;
            nextLast = t;
          }
          nextBest = Math.max(nextBest, nextStreak);
        }

        return {
          ...prev,
          dailyKey: t,
          focusMinutesToday,
          completedFocusToday,
          totalCompletedFocusSessions: prev.totalCompletedFocusSessions + 1,
          totalFocusMinutes: prev.totalFocusMinutes + settings.focusMin,
          streak: nextStreak,
          lastStreakDate: nextLast,
          bestStreak: nextBest,
        };
      });

      // Tasks review popup after focus completes
      setUI((u) => ({ ...u, showTaskReview: true }));

      // determine next break
      setFocusSessionsInCycle((count) => {
        const next = count + 1;
        const every = clamp(settings.longBreakEvery, 2, 8);
        const nextPhase: Phase = next % every === 0 ? "Long Break" : "Short Break";
        resetToPhase(nextPhase, true);
        if (settings.autoStartNext) setRunning(true);
        return next;
      });
      return;
    }

    // break complete (or focus skipped): go to next phase
    if (phase !== "Focus") {
      resetToPhase("Focus", true);
      if (settings.autoStartNext) setRunning(true);
      return;
    }

    // focus skipped: still move to break (but don't award streak/minutes)
    // choose short break when skipping focus
    resetToPhase("Short Break", true);
    if (settings.autoStartNext) setRunning(true);
  }

  /** ----- Badges ----- */
  const badges = useMemo(() => {
    const b: { id: string; title: string; desc: string; earned: boolean }[] = [
      {
        id: "streak7",
        title: "7-Day Streak",
        desc: "Complete 1+ focus session each day for 7 days.",
        earned: stats.bestStreak >= 7,
      },
      {
        id: "streak14",
        title: "14-Day Streak",
        desc: "Two weeks of consistency.",
        earned: stats.bestStreak >= 14,
      },
      {
        id: "sessions50",
        title: "50 Sessions",
        desc: "Complete 50 focus sessions total.",
        earned: stats.totalCompletedFocusSessions >= 50,
      },
      {
        id: "sessions200",
        title: "200 Sessions",
        desc: "You’re built different.",
        earned: stats.totalCompletedFocusSessions >= 200,
      },
      {
        id: "minutes1000",
        title: "1000 Minutes",
        desc: "1000 minutes focused total.",
        earned: stats.totalFocusMinutes >= 1000,
      },
      {
        id: "minutes5000",
        title: "5000 Minutes",
        desc: "Serious grind.",
        earned: stats.totalFocusMinutes >= 5000,
      },
    ];
    return b;
  }, [stats.bestStreak, stats.totalCompletedFocusSessions, stats.totalFocusMinutes]);

  /** ----- Charts & stats views ----- */
  const last7 = useMemo(() => {
    const t = todayKey();
    const days = Array.from({ length: 7 }, (_, i) => addDays(t, -6 + i));
    // sum focus minutes per day from logs
    const map = new Map<string, { min: number; sessions: number }>();
    days.forEach((d) => map.set(d, { min: 0, sessions: 0 }));

    for (const log of stats.logs) {
      if (!map.has(log.dateKey)) continue;
      if (log.phase !== "Focus") continue;
      if (!log.completed) continue;
      const cur = map.get(log.dateKey)!;
      map.set(log.dateKey, { min: cur.min + log.minutesCompleted, sessions: cur.sessions + 1 });
    }
    return days.map((d) => ({ date: d, ...map.get(d)! }));
  }, [stats.logs]);

  const max7 = useMemo(() => Math.max(1, ...last7.map((x) => x.min)), [last7]);

  const byHour = useMemo(() => {
    // simple distribution: count completed focus sessions per hour (0..23) using log.startedAt local time
    const hours = Array.from({ length: 24 }, (_, h) => ({ h, c: 0 }));
    for (const log of stats.logs) {
      if (log.phase !== "Focus" || !log.completed) continue;
      const d = new Date(log.startedAt);
      const h = d.getHours();
      hours[h].c += 1;
    }
    const mx = Math.max(1, ...hours.map((x) => x.c));
    return { hours, mx };
  }, [stats.logs]);

  /** ----- Task review actions ----- */
  function applyTaskReview(action: "done_all" | "carry_all" | "mixed") {
    if (action === "done_all") {
      setTasks((prev) => prev.map((t) => (t.status === "done" ? t : { ...t, status: "done" })));
    }
    if (action === "carry_all") {
      setTasks((prev: any) =>
        prev
          .map((t) => (t.status === "done" ? t : { ...t, status: "carry" }))
          .filter((t) => t.text.trim().length > 0)
      );
    }
    // mixed: user already toggled tasks individually
    setUI((u) => ({ ...u, showTaskReview: false }));
    resetTasksForNextFocus();
  }

  /** ----- Render ----- */
  const currentLabel = useMemo(() => `${formatTime(secondsLeft)}`, [secondsLeft]);

  return (
    <div className="min-h-screen ">
      {/* Top bar */}
      <div className="sticky top-0 z-30 border-b border-slate-200 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-900 px-3 py-2 text-white">
              <div className="flex items-center gap-2">
                <AlarmClock className="h-4 w-4" />
                <span className="text-sm font-extrabold">Pomodoro PRO</span>
              </div>
            </div>

            <Pill tone={phaseTone}>
              <Bell className="h-3.5 w-3.5" /> {phase}
            </Pill>

            <Pill tone="amber">
              <Flame className="h-3.5 w-3.5" /> Streak: {stats.streak}
            </Pill>

            <Pill tone={stats.streakLockedToday ? "rose" : "zinc"}>
              <ShieldCheck className="h-3.5 w-3.5" />{" "}
              {stats.streakLockedToday
                ? "Streak locked (too many skips)"
                : `Skips: ${stats.skipsToday}/5`}
            </Pill>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setUI((u) => ({ ...u, showStats: !u.showStats }))}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50">
              <BarChart3 className="h-4 w-4" />
              Stats
            </button>

            <button
              onClick={() => setUI((u) => ({ ...u, deepFocus: !u.deepFocus }))}
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-extrabold ${
                ui.deepFocus
                  ? "bg-slate-900 text-white hover:bg-slate-800"
                  : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
              }`}
              title="Deep Focus mode">
              <Focus className="h-4 w-4" />
              Deep Focus
            </button>

            <button
              onClick={() => setUI((u) => ({ ...u, showSettings: true }))}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-extrabold text-white hover:bg-slate-800">
              <Settings className="h-4 w-4" />
              Settings
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Left: timer + tasks */}
        <div className="space-y-6">
          {/* Timer card */}
          <Card>
            <div className="flex flex-col items-center gap-4">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => resetToPhase("Focus")}
                  className={`rounded-2xl px-4 py-2 text-sm font-extrabold ${
                    phase === "Focus"
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                  }`}>
                  Focus
                </button>
                <button
                  onClick={() => resetToPhase("Short Break")}
                  className={`rounded-2xl px-4 py-2 text-sm font-extrabold ${
                    phase === "Short Break"
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                  }`}>
                  Short Break
                </button>
                <button
                  onClick={() => resetToPhase("Long Break")}
                  className={`rounded-2xl px-4 py-2 text-sm font-extrabold ${
                    phase === "Long Break"
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                  }`}>
                  Long Break
                </button>
              </div>

              <div className="relative mt-1">
                <Ring progress={progress} label="Progress" />
                <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                  <p className="text-5xl font-extrabold text-slate-900">{currentLabel}</p>
                  <p className="mt-1 text-xs font-bold text-slate-600">{phase}</p>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => (running ? pause() : start())}
                  className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold shadow-sm ${
                    running
                      ? "bg-rose-600 text-white hover:bg-rose-700"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}>
                  {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {running ? "Pause" : "Start"}
                </button>

                <button
                  onClick={resetCurrent}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50">
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>

                <button
                  onClick={skipPhase}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50"
                  title="Skip to next phase (counts towards anti-cheat)">
                  <TimerReset className="h-4 w-4" />
                  Skip
                </button>
              </div>

              <div className="mt-4 grid w-full grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-600">Today focus</p>
                  <p className="mt-2 text-2xl font-extrabold text-slate-900">
                    {stats.focusMinutesToday}m
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Sessions today: {stats.completedFocusToday}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-600">Cycle</p>
                  <p className="mt-2 text-2xl font-extrabold text-slate-900">
                    {focusSessionsInCycle}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Long break every {settings.longBreakEvery}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-600">Sound</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Pill tone={settings.soundEnabled ? "emerald" : "zinc"}>
                      {settings.soundEnabled ? (
                        <Volume2 className="h-3.5 w-3.5" />
                      ) : (
                        <VolumeX className="h-3.5 w-3.5" />
                      )}
                      {settings.soundEnabled ? `${Math.round(settings.volume * 100)}%` : "Muted"}
                    </Pill>
                    <Pill tone="slate">
                      <Sparkles className="h-3.5 w-3.5" /> {settings.pack}
                    </Pill>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    {settings.tickLast10s ? "Tick last 10s: ON" : "Tick last 10s: OFF"}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Tasks card */}
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-extrabold text-slate-900">Session Tasks</p>
                <p className="mt-1 text-sm text-slate-600">
                  Add up to 3 tasks for your next Focus. At the end, mark Done or Carry Over.
                </p>
              </div>
              <Pill tone="indigo">
                <ListTodo className="h-3.5 w-3.5" /> {focusTasks.length} active
              </Pill>
            </div>

            <div className="mt-4 space-y-2">
              {focusTasks.slice(0, 3).map((t) => (
                <div
                  key={t.id}
                  className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex min-w-0 items-start gap-2">
                    <button
                      onClick={() => markTaskDone(t.id)}
                      className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      title="Mark done">
                      <CheckCircle2 className="h-4 w-4" />
                    </button>

                    <input
                      value={t.text}
                      onChange={(e) => updateTask(t.id, e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2"
                      placeholder="e.g., CPEG220 pipeline hazards: 10 problems"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => carryTask(t.id)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-800 hover:bg-slate-50"
                      title="Carry over">
                      Carry
                    </button>
                    <button
                      onClick={() => removeTask(t.id)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-800 hover:bg-slate-50"
                      title="Remove">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={addTask}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-extrabold text-white hover:bg-slate-800">
                  <Plus className="h-4 w-4" />
                  Add task
                </button>
                <button
                  onClick={() => setTasks([{ id: uid("task"), text: "", status: "todo" }])}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50">
                  Clear
                </button>
              </div>

              {doneTasks.length ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-bold text-slate-600">Done</p>
                  <ul className="mt-2 space-y-1 text-sm text-slate-700">
                    {doneTasks.slice(-5).map((t) => (
                      <li key={t.id} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                        <span className="line-through">{t.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </Card>
        </div>

        {/* Right: technique + stats panel */}
        <div className="space-y-6">
          <Card>
            <p className="text-sm font-extrabold text-slate-900">
              Pomodoro technique (quick rules)
            </p>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <div className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-700" />
                <p>
                  Focus for <span className="font-extrabold">{settings.focusMin} min</span> with a
                  clear task.
                </p>
              </div>
              <div className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-700" />
                <p>
                  Short break <span className="font-extrabold">{settings.shortBreakMin} min</span>{" "}
                  after each focus.
                </p>
              </div>
              <div className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-700" />
                <p>
                  Long break <span className="font-extrabold">{settings.longBreakMin} min</span>{" "}
                  every <span className="font-extrabold">{settings.longBreakEvery}</span> focus
                  sessions.
                </p>
              </div>
              <div className="flex gap-2">
                <XCircle className="mt-0.5 h-4 w-4 text-rose-700" />
                <p>Avoid skipping too much — after 5 skips/day your streak is locked.</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-extrabold text-slate-900">Badges</p>
                <p className="mt-1 text-sm text-slate-600">Little dopamine, big consistency.</p>
              </div>
              <Pill tone="amber">
                <Award className="h-3.5 w-3.5" /> {badges.filter((b) => b.earned).length}/
                {badges.length}
              </Pill>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              {badges.map((b) => (
                <div
                  key={b.id}
                  className={`rounded-3xl border p-4 ${
                    b.earned ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"
                  }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p
                        className={`text-sm font-extrabold ${
                          b.earned ? "text-emerald-900" : "text-slate-900"
                        }`}>
                        {b.title}
                      </p>
                      <p
                        className={`mt-1 text-xs ${
                          b.earned ? "text-emerald-800" : "text-slate-600"
                        }`}>
                        {b.desc}
                      </p>
                    </div>
                    <Pill tone={b.earned ? "emerald" : "zinc"}>
                      {b.earned ? "Earned" : "Locked"}
                    </Pill>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Stats panel toggle */}
          {ui.showStats ? (
            <Card>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-extrabold text-slate-900">Stats</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Last 7 days focus minutes + your best patterns.
                  </p>
                </div>
                <button
                  onClick={() => setUI((u) => ({ ...u, showStats: false }))}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50">
                  Close
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-600">Best streak</p>
                  <p className="mt-2 text-2xl font-extrabold text-slate-900">{stats.bestStreak}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-600">Total sessions</p>
                  <p className="mt-2 text-2xl font-extrabold text-slate-900">
                    {stats.totalCompletedFocusSessions}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-600">Total minutes</p>
                  <p className="mt-2 text-2xl font-extrabold text-slate-900">
                    {stats.totalFocusMinutes}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold text-slate-600">Last 7 days</p>
                <div className="mt-3 grid grid-cols-7 gap-2">
                  {last7.map((d) => (
                    <div key={d.date} className="flex flex-col items-center gap-2">
                      <div className="flex h-28 w-8 items-end rounded-2xl bg-white ring-1 ring-slate-200">
                        <div
                          className="w-full rounded-2xl bg-slate-900"
                          style={{ height: `${Math.round((d.min / max7) * 100)}%` }}
                          title={`${d.min} min • ${d.sessions} sessions`}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-600">
                        {formatDateNice(d.date).split(" ")[0]}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-slate-600">
                  Tip: aim for a steady baseline (even 2 sessions/day beats 0).
                </p>
              </div>

              <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold text-slate-600">Sessions by hour</p>
                <div className="mt-3 grid grid-cols-12 gap-2">
                  {byHour.hours.map((x) => {
                    const intensity = Math.round((x.c / byHour.mx) * 100);
                    return (
                      <div key={x.h} className="col-span-3 md:col-span-1">
                        <div className="flex flex-col items-center gap-1">
                          <div
                            className="h-7 w-full rounded-xl ring-1 ring-slate-200"
                            style={{
                              background: `rgba(15, 23, 42, ${Math.max(0.08, intensity / 100)})`,
                            }}
                            title={`${x.h}:00 • ${x.c} sessions`}
                          />
                          <span className="text-[10px] font-bold text-slate-600">{x.h}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    if (!confirm("Reset ALL stats + logs?")) return;
                    setStats({
                      streak: 0,
                      bestStreak: 0,
                      lastStreakDate: "",
                      dailyKey: todayKey(),
                      focusMinutesToday: 0,
                      completedFocusToday: 0,
                      skipsToday: 0,
                      streakLockedToday: false,
                      totalCompletedFocusSessions: 0,
                      totalFocusMinutes: 0,
                      logs: [],
                    });
                  }}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-800 hover:bg-slate-50">
                  Reset stats
                </button>
              </div>
            </Card>
          ) : null}
        </div>
      </div>

      {/* Deep Focus overlay */}
      {ui.deepFocus ? (
        <div className="fixed inset-0 z-[80] bg-black/70 p-4 backdrop-blur">
          <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center gap-4">
            <div className="w-full rounded-3xl bg-white p-6 shadow-xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-slate-600">DEEP FOCUS</p>
                  <p className="mt-1 text-lg font-extrabold text-slate-900">{phase}</p>
                </div>
                <button
                  onClick={() => setUI((u) => ({ ...u, deepFocus: false }))}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50">
                  Exit
                </button>
              </div>

              <div className="mt-5 text-center">
                <p className="text-6xl font-extrabold text-slate-900">{formatTime(secondsLeft)}</p>
                <p className="mt-2 text-sm font-semibold text-slate-600">
                  {phase === "Focus"
                    ? "Stay on task. One block at a time."
                    : "Break properly. No doomscrolling."}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => (running ? pause() : start())}
                  className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold ${
                    running
                      ? "bg-rose-600 text-white hover:bg-rose-700"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}>
                  {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {running ? "Pause" : "Start"}
                </button>
                <button
                  onClick={skipPhase}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50">
                  <TimerReset className="h-4 w-4" />
                  Skip
                </button>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold text-slate-600">Your tasks</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-700">
                  {focusTasks.slice(0, 3).map((t) => (
                    <li key={t.id} className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-slate-900" />
                      <span className="break-words">{t.text || "—"}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="mt-3 text-center text-xs text-slate-500">
                Tip: keep this overlay on during Focus blocks for maximum effect.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Task review modal (after focus completes) */}
      {ui.showTaskReview ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setUI((u) => ({ ...u, showTaskReview: false }))}
          />
          <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-extrabold text-slate-900">Focus completed ✅</p>
                <p className="mt-1 text-sm text-slate-600">
                  Mark what you finished. Anything “Carry” stays for the next Focus.
                </p>
              </div>
              <button
                onClick={() => setUI((u) => ({ ...u, showTaskReview: false }))}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50">
                Close
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {tasks
                .filter((t) => t.status !== "done")
                .slice(0, 3)
                .map((t) => (
                  <div key={t.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-sm font-extrabold text-slate-900">
                      {t.text || "Untitled task"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => markTaskDone(t.id)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-extrabold text-white hover:bg-emerald-700">
                        <CheckCircle2 className="h-4 w-4" />
                        Done
                      </button>
                      <button
                        onClick={() => carryTask(t.id)}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50">
                        Carry
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => applyTaskReview("done_all")}
                className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-extrabold text-white hover:bg-slate-800">
                Mark all done
              </button>
              <button
                onClick={() => applyTaskReview("carry_all")}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50">
                Carry all
              </button>
              <button
                onClick={() => applyTaskReview("mixed")}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50">
                Continue
              </button>
            </div>

            {stats.streakLockedToday ? (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
                <p className="font-extrabold">Heads up:</p>
                <p className="mt-1">
                  Your streak is locked today because of too many skips. Complete sessions without
                  skipping tomorrow to keep streak growth.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Settings modal */}
      {ui.showSettings ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setUI((u) => ({ ...u, showSettings: false }))}
          />
          <div className="relative w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-extrabold text-slate-900">Settings</p>
                <p className="mt-1 text-sm text-slate-600">
                  Tip: after changing durations, press Reset on the timer for a clean start.
                </p>
              </div>
              <button
                onClick={() => setUI((u) => ({ ...u, showSettings: false }))}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50">
                Close
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* durations */}
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-extrabold text-slate-900">Timer</p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600">Focus (min)</label>
                    <input
                      type="number"
                      min={10}
                      max={90}
                      value={settings.focusMin}
                      onChange={(e) =>
                        setSettings((p) => ({
                          ...p,
                          focusMin: clamp(Number(e.target.value || 25), 10, 90),
                        }))
                      }
                      className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600">Short break (min)</label>
                    <input
                      type="number"
                      min={2}
                      max={30}
                      value={settings.shortBreakMin}
                      onChange={(e) =>
                        setSettings((p) => ({
                          ...p,
                          shortBreakMin: clamp(Number(e.target.value || 5), 2, 30),
                        }))
                      }
                      className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600">Long break (min)</label>
                    <input
                      type="number"
                      min={5}
                      max={60}
                      value={settings.longBreakMin}
                      onChange={(e) =>
                        setSettings((p) => ({
                          ...p,
                          longBreakMin: clamp(Number(e.target.value || 15), 5, 60),
                        }))
                      }
                      className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600">Long break every</label>
                    <input
                      type="number"
                      min={2}
                      max={8}
                      value={settings.longBreakEvery}
                      onChange={(e) =>
                        setSettings((p) => ({
                          ...p,
                          longBreakEvery: clamp(Number(e.target.value || 4), 2, 8),
                        }))
                      }
                      className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2"
                    />
                  </div>
                </div>

                <label className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={settings.autoStartNext}
                    onChange={(e) =>
                      setSettings((p) => ({ ...p, autoStartNext: e.target.checked }))
                    }
                  />
                  Auto-start next phase
                </label>
              </div>

              {/* sound */}
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-extrabold text-slate-900">Sound & Haptics</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => setSettings((p) => ({ ...p, soundEnabled: !p.soundEnabled }))}
                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-extrabold ${
                      settings.soundEnabled
                        ? "bg-slate-900 text-white hover:bg-slate-800"
                        : "bg-white text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50"
                    }`}>
                    {settings.soundEnabled ? (
                      <Volume2 className="h-4 w-4" />
                    ) : (
                      <VolumeX className="h-4 w-4" />
                    )}
                    {settings.soundEnabled ? "Sound ON" : "Sound OFF"}
                  </button>

                  <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={settings.tickLast10s}
                      onChange={(e) =>
                        setSettings((p) => ({ ...p, tickLast10s: e.target.checked }))
                      }
                    />
                    Tick last 10s
                  </label>

                  <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={settings.vibrate}
                      onChange={(e) => setSettings((p) => ({ ...p, vibrate: e.target.checked }))}
                    />
                    Vibration
                  </label>
                </div>

                <div className="mt-4">
                  <label className="text-xs font-bold text-slate-600">Volume</label>
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round(settings.volume * 100)}
                      onChange={(e) =>
                        setSettings((p) => ({
                          ...p,
                          volume: clamp(Number(e.target.value) / 100, 0, 1),
                        }))
                      }
                      className="w-full"
                    />
                    <Pill tone="slate">{Math.round(settings.volume * 100)}%</Pill>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-xs font-bold text-slate-600">Sound pack</label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {(["Soft", "Classic", "Arcade"] as SoundPack[]).map((p) => (
                      <button
                        key={p}
                        onClick={() => setSettings((s) => ({ ...s, pack: p }))}
                        className={`rounded-2xl px-3 py-2 text-sm font-extrabold ${
                          settings.pack === p
                            ? "bg-slate-900 text-white"
                            : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                        }`}>
                        {p}
                      </button>
                    ))}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      onClick={() => soundStartPhase("Focus")}
                      className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50">
                      Test start
                    </button>
                    <button
                      onClick={() => soundEndPhase("Focus")}
                      className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50">
                      Test end
                    </button>
                  </div>
                </div>
              </div>

              {/* ambient */}
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 md:col-span-2">
                <p className="text-sm font-extrabold text-slate-900">Ambient background</p>
                <p className="mt-1 text-sm text-slate-600">Helps some people. Keep it subtle.</p>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={settings.ambientEnabled}
                      onChange={(e) =>
                        setSettings((p) => ({ ...p, ambientEnabled: e.target.checked }))
                      }
                    />
                    Ambient ON
                  </label>

                  <select
                    value={settings.ambientType}
                    onChange={(e) =>
                      setSettings((p) => ({ ...p, ambientType: e.target.value as any }))
                    }
                    className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none ring-slate-300 focus:ring-2"
                    disabled={!settings.ambientEnabled}>
                    <option>Rain</option>
                    <option>White Noise</option>
                    <option>Coffee Shop</option>
                  </select>

                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round(settings.ambientVolume * 100)}
                      onChange={(e) =>
                        setSettings((p) => ({
                          ...p,
                          ambientVolume: clamp(Number(e.target.value) / 100, 0, 1),
                        }))
                      }
                      className="w-48"
                      disabled={!settings.ambientEnabled}
                    />
                    <Pill tone="slate">{Math.round(settings.ambientVolume * 100)}%</Pill>
                  </div>
                </div>

                <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-600">
                  Note: browsers may block audio until you press{" "}
                  <span className="font-extrabold text-slate-900">Start</span> at least once.
                </div>
              </div>

              {/* anti-cheat */}
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 md:col-span-2">
                <p className="text-sm font-extrabold text-slate-900">Anti-cheat</p>
                <p className="mt-1 text-sm text-slate-600">
                  Skipping too much kills the whole point. After{" "}
                  <span className="font-extrabold">5 skips</span> in one day, your streak doesn’t
                  count today.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Pill tone={stats.streakLockedToday ? "rose" : "emerald"}>
                    <ShieldCheck className="h-3.5 w-3.5" />{" "}
                    {stats.streakLockedToday ? "Streak locked today" : "Streak eligible"}
                  </Pill>
                  <Pill tone="slate">Skips today: {stats.skipsToday}/5</Pill>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
