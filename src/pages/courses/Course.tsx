import Layout from "@/Layout";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  useGetCourseByIdQuery,
  useGetProductsByCourseQuery,
  useLazyDownloadResourceQuery,
  useLikeCourseMutation,
} from "../../redux/queries/productApi";
import Loader from "@/components/Loader";
import { useEffect, useMemo, useRef, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import Spinner from "@/components/Spinner";
import {
  Download,
  Lock,
  Heart,
  MoveLeft,
  Search,
  GraduationCap,
  Clock,
  ChevronRight,
  CheckCircle2,
  XCircle,
  RefreshCw,
  FileText,
  ListChecks,
  Timer,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetUserProfileQuery } from "../../redux/queries/userApi";
import { QUESTION_BANK, type MCQ } from "./questions";

/* -------------------------------- helpers -------------------------------- */
const fileIcon = (url?: string) => {
  const u = (url || "").toLowerCase();
  if (u.endsWith(".pdf")) return "/pdf.png";
  if (u.endsWith(".ppt") || u.endsWith(".pptx")) return "/powerpoint.png";
  return "/word.png";
};

const fileExt = (url?: string) => {
  const u = (url || "").toLowerCase();
  if (u.endsWith(".pdf")) return "PDF";
  if (u.endsWith(".pptx")) return "PPTX";
  if (u.endsWith(".ppt")) return "PPT";
  if (u.endsWith(".docx")) return "DOCX";
  if (u.endsWith(".doc")) return "DOC";
  return "FILE";
};

const typePill: Record<string, string> = {
  Note: "bg-blue-50 text-blue-700 ring-blue-100",
  Exam: "bg-rose-50 text-rose-700 ring-rose-100",
  Assignment: "bg-amber-50 text-amber-800 ring-amber-100",
};

const formatSize = (size?: number) => {
  if (!size) return "—";
  return size < 1024 * 1024
    ? `${(size / 1024).toFixed(2)} KB`
    : `${(size / 1024 / 1024).toFixed(2)} MB`;
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

const shuffle = <T,>(arr: T[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/* ----------------------- exam (local demo question bank) ----------------------- */
type GeneratedExam = {
  courseCode: string;
  durationMin: number | null;
  questions: MCQ[];
};

/* ------------------------------ Resource types ------------------------------ */
type Resource = {
  _id: string;
  name: string;
  type: "Note" | "Exam" | "Assignment" | string;
  size?: number;
  file?: { url?: string };
  createdAt?: string;
  updatedAt?: string;
};

/* --------------------- local completion state (per course) --------------------- */
type CompletionState = {
  completed: Record<string, boolean>;
};

const storageKey = (courseId?: string) => `auknotes:course:${courseId || "unknown"}:completion`;

const safeParse = <T,>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

/* ------------------------- Simple Timer (localStorage) ------------------------- */
type SimpleTimerState = {
  running: boolean;
  secondsLeft: number;
  minutesSet: number; // user setter
};

const timerKey = (courseId?: string) => `auknotes:course:${courseId || "unknown"}:simpleTimer`;

const defaultTimer = (): SimpleTimerState => ({
  running: false,
  minutesSet: 25,
  secondsLeft: 25 * 60,
});

/* ============================ Fake Download Progress ============================ */
type FakeDownloadState = {
  active: boolean;
  percent: number; // 0..100
  label: "Starting" | "Downloading" | "Finalizing" | "Done";
};

const defaultFakeDl: FakeDownloadState = { active: false, percent: 0, label: "Starting" };

// progress will climb to this cap while the request is in-flight, then jump to 100% after blob arrives
const FAKE_CAP = 92;

const pickStep = (p: number) => {
  if (p < 25) return 6;
  if (p < 55) return 4;
  if (p < 75) return 2;
  return 1;
};

/* -------------------------------- component -------------------------------- */
const Course = () => {
  const { data: userInfo } = useGetUserProfileQuery();
  const navigate = useNavigate();

  const [likesCount, setLikesCount] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);

  const [triggerDownload] = useLazyDownloadResourceQuery();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [likeCourse] = useLikeCourseMutation();

  // ✅ NEW: fake progress per resource
  const [fakeDl, setFakeDl] = useState<Record<string, FakeDownloadState>>({});
  const fakeTimersRef = useRef<Record<string, number>>({});

  const { courseId } = useParams();
  const { data: products, isLoading: loadingProducts } = useGetProductsByCourseQuery({ courseId });
  const { data: category } = useGetCourseByIdQuery(courseId);

  useEffect(() => {
    setLikesCount(category?.likes?.length || 0);
    setIsLiked(Boolean(category?.likes?.includes(userInfo?._id)));
  }, [category, userInfo]);

  const [activeTab, setActiveTab] = useState<string>("All");
  const [query, setQuery] = useState("");

  const types = ["All", "Note", "Exam", "Assignment"];

  const hasAccess = category?.isPaid
    ? userInfo?.purchasedCourses?.some((c: any) => c.toString() === category?._id?.toString())
    : true;

  const locked = category?.isClosed || !hasAccess;
  const canGenerateExam = Boolean(hasAccess && !category?.isClosed);

  const allResources = useMemo(() => ((products as any) || []) as Resource[], [products]);

  /* ------------------ completion tracking (localStorage) ------------------ */
  const [completion, setCompletion] = useState<CompletionState>(() => ({ completed: {} }));

  useEffect(() => {
    const loaded = safeParse<CompletionState>(localStorage.getItem(storageKey(courseId)), {
      completed: {},
    });
    setCompletion(loaded);
  }, [courseId]);

  useEffect(() => {
    localStorage.setItem(storageKey(courseId), JSON.stringify(completion));
  }, [completion, courseId]);

  const toggleCompleted = (id: string) => {
    setCompletion((prev) => ({
      ...prev,
      completed: { ...prev.completed, [id]: !prev.completed[id] },
    }));
  };

  const progress = useMemo(() => {
    const total = allResources.length || 0;
    const completedCount = allResources.reduce(
      (acc, r) => acc + (completion.completed[r._id] ? 1 : 0),
      0
    );
    const percent = total ? Math.round((completedCount / total) * 100) : 0;
    return { total, completedCount, percent };
  }, [allResources, completion.completed]);

  /* ------------------------------- filtering ------------------------------- */
  const filteredProducts = useMemo(() => {
    const list: Resource[] = allResources || [];
    const byType = activeTab === "All" ? list : list.filter((p: any) => p.type === activeTab);
    const q = query.trim().toLowerCase();
    if (!q) return byType;
    return byType.filter((p: any) => (p?.name || "").toLowerCase().includes(q));
  }, [allResources, activeTab, query]);

  /* -------------------- fake progress helpers (per id) -------------------- */
  const startFakeProgress = (id: string) => {
    // clear if exists
    if (fakeTimersRef.current[id]) window.clearInterval(fakeTimersRef.current[id]);

    setFakeDl((prev) => ({
      ...prev,
      [id]: { active: true, percent: 0, label: "Starting" },
    }));

    const t = window.setInterval(() => {
      setFakeDl((prev) => {
        const cur = prev[id] || defaultFakeDl;
        if (!cur.active) return prev;

        const next = Math.min(FAKE_CAP, cur.percent + pickStep(cur.percent));
        const label: FakeDownloadState["label"] =
          next < 10 ? "Starting" : next < 88 ? "Downloading" : "Finalizing";

        // stop climbing at cap; keep it there until request resolves
        return {
          ...prev,
          [id]: { ...cur, percent: next, label },
        };
      });
    }, 320);

    fakeTimersRef.current[id] = t;
  };

  const finishFakeProgress = (id: string) => {
    if (fakeTimersRef.current[id]) {
      window.clearInterval(fakeTimersRef.current[id]);
      delete fakeTimersRef.current[id];
    }

    // jump to 100% nicely
    setFakeDl((prev) => ({
      ...prev,
      [id]: { active: true, percent: 100, label: "Done" },
    }));

    // remove after a short delay so user sees "Done"
    window.setTimeout(() => {
      setFakeDl((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }, 900);
  };

  const failFakeProgress = (id: string) => {
    if (fakeTimersRef.current[id]) {
      window.clearInterval(fakeTimersRef.current[id]);
      delete fakeTimersRef.current[id];
    }
    // remove progress UI quickly on failure
    setFakeDl((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  useEffect(() => {
    return () => {
      // cleanup any timers on unmount
      Object.values(fakeTimersRef.current).forEach((t) => window.clearInterval(t));
      fakeTimersRef.current = {};
    };
  }, []);

  /* ------------------------------- download ------------------------------- */
  const handleDownload = async (id: string, fileName: string) => {
    try {
      setDownloadingId(id);
      startFakeProgress(id);

      const { blob, filename } = await triggerDownload(id).unwrap();

      finishFakeProgress(id);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Downloaded ✅");
    } catch (err) {
      console.log("error:", err);
      failFakeProgress(id);
      toast.error("Download failed. This file might be restricted or unavailable.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleLikeCourse = async () => {
    if (!userInfo) return;

    const prevLiked = isLiked;
    const prevCount = likesCount;

    const newLiked = !prevLiked;
    setIsLiked(newLiked);
    setLikesCount(prevCount + (newLiked ? 1 : -1));

    try {
      await likeCourse({ courseId }).unwrap();
    } catch (err: any) {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      toast.error(err?.data?.message || "Failed to like course");
    }
  };

  /* ------------------------------- exam state ------------------------------- */
  const [examOpen, setExamOpen] = useState(false);
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [durationMin, setDurationMin] = useState<number>(25);
  const [examStage, setExamStage] = useState<"idle" | "exam" | "result">("idle");

  const [exam, setExam] = useState<GeneratedExam | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  const courseCodeForExam = (category?.code || "").toString().replace(/\s/g, "").toUpperCase();

  const examPool = useMemo(() => {
    return QUESTION_BANK.filter((q) => q.courseCode.toUpperCase() === courseCodeForExam);
  }, [courseCodeForExam]);

  const DEFAULT_COUNT = 10;

  const openExamModal = () => {
    if (!canGenerateExam) {
      toast.error("Only students who purchased this course can generate an exam.");
      return;
    }
    setExamOpen(true);
  };

  const startExam = () => {
    if (!canGenerateExam) return;

    if (!examPool.length) {
      toast.error("No questions available for this course yet.");
      return;
    }

    const picked = shuffle(examPool).slice(0, Math.min(DEFAULT_COUNT, examPool.length));
    const duration = timerEnabled ? clamp(durationMin, 1, 240) : null;

    const newExam: GeneratedExam = {
      courseCode: courseCodeForExam,
      durationMin: duration,
      questions: picked,
    };

    setExam(newExam);
    setAnswers({});
    setCurrentQ(0);

    const totalSeconds = duration ? duration * 60 : 0;
    setTimeLeft(totalSeconds);

    setExamStage("exam");
    setExamOpen(false);
    toast.success("Exam generated!");
  };

  useEffect(() => {
    if (examStage !== "exam") return;
    if (!exam?.durationMin) return;

    if (timeLeft <= 0) {
      setExamStage("result");
      return;
    }

    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [examStage, exam?.durationMin, timeLeft]);

  const selectAnswer = (qid: string, idx: number) => {
    setAnswers((prev) => ({ ...prev, [qid]: idx }));
  };

  const finishExam = () => setExamStage("result");

  const score = useMemo(() => {
    if (!exam) return { correct: 0, total: 0, percent: 0 };
    const total = exam.questions.length;
    let correct = 0;
    for (const q of exam.questions) {
      if (answers[q.id] === q.correctIndex) correct++;
    }
    const percent = total ? Math.round((correct / total) * 100) : 0;
    return { correct, total, percent };
  }, [exam, answers]);

  const resetExam = () => {
    setExam(null);
    setAnswers({});
    setCurrentQ(0);
    setTimeLeft(0);
    setExamStage("idle");
  };

  const currentQuestion = exam?.questions[currentQ];

  /* ------------------------ resource info modal state ------------------------ */
  const [resourceOpen, setResourceOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const openResourceModal = (p: Resource) => {
    setSelectedResource(p);
    setResourceOpen(true);
  };

  const closeResourceModal = () => {
    setResourceOpen(false);
    setSelectedResource(null);
  };

  /* ============================ SIMPLE TIMER (setter) ============================ */
  const [timerOpen, setTimerOpen] = useState(false);

  const [simpleTimer, setSimpleTimer] = useState<SimpleTimerState>(() => {
    const loaded = safeParse<SimpleTimerState>(
      localStorage.getItem(timerKey(courseId)),
      defaultTimer()
    );
    if (!loaded.secondsLeft || loaded.secondsLeft < 0) {
      loaded.secondsLeft = loaded.minutesSet * 60;
    }
    return loaded;
  });

  useEffect(() => {
    localStorage.setItem(timerKey(courseId), JSON.stringify(simpleTimer));
  }, [simpleTimer, courseId]);

  useEffect(() => {
    if (!simpleTimer.running) return;

    const t = setInterval(() => {
      setSimpleTimer((prev) => ({ ...prev, secondsLeft: Math.max(0, prev.secondsLeft - 1) }));
    }, 1000);

    return () => clearInterval(t);
  }, [simpleTimer.running]);

  useEffect(() => {
    if (!simpleTimer.running) return;
    if (simpleTimer.secondsLeft > 0) return;

    setSimpleTimer((prev) => ({ ...prev, running: false }));
    toast.info("Timer finished ✅");
  }, [simpleTimer.secondsLeft, simpleTimer.running]);

  const setMinutes = (m: number) => {
    const minutes = clamp(m, 1, 240);
    setSimpleTimer((prev) => ({
      ...prev,
      minutesSet: minutes,
      secondsLeft: minutes * 60,
      running: false,
    }));
  };

  const startStopTimer = () => {
    setSimpleTimer((prev) => {
      const secondsLeft = prev.secondsLeft <= 0 ? prev.minutesSet * 60 : prev.secondsLeft;
      return { ...prev, secondsLeft, running: !prev.running };
    });
  };

  const resetTimer = () => {
    setSimpleTimer((prev) => ({
      ...prev,
      running: false,
      secondsLeft: prev.minutesSet * 60,
    }));
  };

  const shouldShowMiniTimer = useMemo(() => {
    const def = defaultTimer();
    const differs =
      simpleTimer.secondsLeft !== def.secondsLeft || simpleTimer.minutesSet !== def.minutesSet;
    return Boolean(
      simpleTimer.running || differs || simpleTimer.secondsLeft !== simpleTimer.minutesSet * 60
    );
  }, [simpleTimer]);

  /* ======================================================================= */

  if (loadingProducts)
    return (
      <Layout>
        <Loader />
      </Layout>
    );

  return (
    <Layout>
      <div className="min-h-screen bg-biege">
        <div className="max-w-7xl mx-auto px-3 lg:px-6 py-10">
          {/* Top Bar */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <Button onClick={() => navigate(-1)} variant="outline" className="rounded-full">
              <MoveLeft className="mr-2 size-4" />
              Back
            </Button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setTimerOpen(true)}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border bg-white hover:bg-zinc-50">
                <Timer className="size-4" />
                Timer
              </button>

              {!hasAccess && (
                <Link
                  to="/checkout"
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold bg-zinc-900 text-white hover:opacity-95 active:scale-[0.99]">
                  <img src="/3d-fire.png" className="size-4" alt="Get Access" />
                  Unlock All Courses
                </Link>
              )}
            </div>
          </div>

          {/* Mini timer display on page */}
          {shouldShowMiniTimer && (
            <div className="mt-4">
              <div className="rounded-2xl border bg-white p-3 sm:p-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border bg-zinc-900 text-white border-zinc-900">
                      <Clock className="size-4" />
                      Timer
                    </span>

                    <div className="font-extrabold text-zinc-900 text-xl tabular-nums">
                      {formatTime(simpleTimer.secondsLeft)}
                    </div>

                    <div className="text-sm text-zinc-600">
                      <span className="text-zinc-400">•</span>{" "}
                      <span className="font-semibold">{simpleTimer.minutesSet} min</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTimerOpen(true)}
                      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border bg-white hover:bg-zinc-50">
                      Set
                    </button>

                    <button
                      onClick={startStopTimer}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border transition ${
                        simpleTimer.running
                          ? "bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-900"
                          : "bg-zinc-900 text-white border-zinc-900 hover:opacity-95"
                      }`}>
                      {simpleTimer.running ? (
                        <Pause className="size-4" />
                      ) : (
                        <Play className="size-4" />
                      )}
                      {simpleTimer.running ? "Pause" : "Start"}
                    </button>

                    <button
                      onClick={resetTimer}
                      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border bg-white hover:bg-zinc-50">
                      <RotateCcw className="size-4" />
                      Reset
                    </button>
                  </div>
                </div>

                <div className="mt-2 text-xs text-zinc-500">
                  Simple countdown — set minutes, start/pause, reset.
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="mt-4 rounded-2xl border bg-white">
            <div className="p-5 lg:p-6">
              <div className="flex items-start justify-between gap-6 flex-wrap">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-4xl lg:text-3xl font-extrabold tracking-tight text-zinc-900">
                      {category?.code}
                    </h1>

                    {category?.isClosed && (
                      <span className="text-[11px] font-semibold rounded-full px-3 py-1 bg-zinc-100 text-zinc-700 border">
                        Closed
                      </span>
                    )}
                  </div>

                  {category?.name && (
                    <p className="mt-1 text-sm text-zinc-600 max-w-2xl">{category.name}</p>
                  )}

                  <div className="mt-4 flex items-center gap-2 text-sm text-zinc-600 flex-wrap">
                    <span>
                      <span className="font-semibold text-zinc-900">{progress.total}</span>{" "}
                      resource/s available
                    </span>
                    <span className="text-zinc-300">•</span>
                    <span>
                      Completed{" "}
                      <span className="font-semibold text-zinc-900">
                        {progress.completedCount}/{progress.total}
                      </span>{" "}
                      ({progress.percent}%)
                    </span>
                  </div>

                  <div className="mt-3 w-full max-w-md h-2 rounded-full bg-zinc-100 overflow-hidden">
                    <div className="h-full bg-zinc-900" style={{ width: `${progress.percent}%` }} />
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={openExamModal}
                    disabled={!canGenerateExam}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 border text-sm font-semibold transition
                      ${
                        canGenerateExam
                          ? "bg-zinc-900 text-white border-zinc-900 hover:opacity-95"
                          : "bg-white text-zinc-400 border-zinc-200 cursor-not-allowed"
                      }`}>
                    <GraduationCap className="size-4" />
                    Generate Exam
                  </button>

                  <button
                    onClick={handleLikeCourse}
                    disabled={!userInfo}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 border text-sm font-semibold transition
                      ${
                        isLiked
                          ? "bg-rose-500 text-white border-rose-500"
                          : "bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-900"
                      }
                      ${!userInfo ? "opacity-60 cursor-not-allowed" : ""}`}>
                    <motion.div
                      animate={isLiked ? { scale: [0.9, 1.15, 1] } : { scale: 1 }}
                      transition={{ duration: 0.2 }}>
                      <Heart className={`size-5 ${isLiked ? "fill-white" : "fill-transparent"}`} />
                    </motion.div>
                    <span>{likesCount}</span>
                  </button>
                </div>
              </div>

              {!canGenerateExam && (
                <div className="mt-4 rounded-xl border bg-zinc-50 p-3 text-sm text-zinc-700">
                  <span className="font-semibold">Exam Generator locked.</span> Only students who
                  purchased this course can generate an exam.
                </div>
              )}

              <div className="mt-6 flex items-center justify-between gap-3 flex-wrap">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="bg-zinc-50 border rounded-full p-1">
                    {types.map((type) => (
                      <TabsTrigger
                        key={type}
                        value={type}
                        className="rounded-full px-4 data-[state=active]:bg-zinc-900 data-[state=active]:text-white">
                        {type}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>

                <div className="relative w-full sm:w-[320px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search resources..."
                    className="w-full rounded-full border bg-white pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ----------------------- Resources (MARK + DOWNLOAD) ----------------------- */}
          <div className="mt-6">
            <div className="hidden sm:grid grid-cols-[1fr_140px_260px] gap-4 px-2 pb-2">
              <div className="text-xs font-semibold text-zinc-500">Resource</div>
              <div className="text-xs font-semibold text-zinc-500">Size</div>
              <div className="text-xs font-semibold text-zinc-500 text-right">Actions</div>
            </div>

            <AnimatePresence mode="popLayout">
              {filteredProducts?.length > 0 ? (
                <motion.div layout className="space-y-3">
                  {filteredProducts.map((p: Resource) => {
                    const done = Boolean(completion.completed[p._id]);
                    const dl = fakeDl[p._id];
                    const isDownloading = downloadingId === p._id;

                    return (
                      <motion.div
                        key={p._id}
                        layout
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="rounded-2xl border bg-white px-4 py-4">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => openResourceModal(p)}
                            className="flex items-center gap-4 min-w-0 flex-1 text-left group"
                            type="button">
                            <div className="size-14 rounded-xl bg-zinc-50 flex items-center justify-center shrink-0">
                              <img src={fileIcon(p.file?.url)} className="size-12 object-contain" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-lg text-zinc-900 line-clamp-1 group-hover:underline">
                                {p.name}
                              </p>

                              <div className="mt-1 flex items-center gap-2 flex-wrap">
                                <span
                                  className={`text-[11px] font-semibold rounded-full px-2 py-1 ring-1 ${
                                    typePill[p.type] || "bg-zinc-50 text-zinc-700 ring-zinc-100"
                                  }`}>
                                  {p.type}
                                </span>
                                <span className="text-xs text-zinc-500">
                                  {fileExt(p.file?.url)}
                                </span>
                                {done && (
                                  <span className="text-[11px] font-semibold rounded-full px-2 py-1 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                                    Completed
                                  </span>
                                )}

                                {dl?.active && (
                                  <span className="text-[11px] font-semibold rounded-full px-2 py-1 bg-zinc-50 text-zinc-700 ring-1 ring-zinc-100">
                                    {dl.label} • {dl.percent}%
                                  </span>
                                )}
                              </div>

                              {/* ✅ Fake progress bar */}
                              {dl?.active && (
                                <div className="mt-2">
                                  <div className="h-2 w-full max-w-[420px] rounded-full bg-zinc-100 overflow-hidden">
                                    <div
                                      className="h-full bg-zinc-900 transition-[width] duration-300"
                                      style={{ width: `${dl.percent}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </button>

                          <div className="hidden sm:flex items-center gap-6">
                            <span className="text-sm text-zinc-500 w-[140px]">
                              {formatSize(p.size)}
                            </span>

                            <div className="w-[260px] flex justify-end gap-2">
                              <button
                                onClick={() => toggleCompleted(p._id)}
                                className={`inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full border text-sm font-semibold transition ${
                                  done
                                    ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                                    : "bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-900"
                                }`}
                                type="button">
                                <ListChecks className="size-4" />
                                {done ? "Marked" : "Mark"}
                              </button>

                              {locked ? (
                                <span className="inline-flex items-center gap-2 text-sm bg-zinc-100 p-2 rounded-full text-black">
                                  <Lock className="size-5" />
                                </span>
                              ) : isDownloading ? (
                                <Spinner className="border-t-black" />
                              ) : (
                                <button
                                  onClick={() => handleDownload(p._id, p.name)}
                                  className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full border bg-black text-white hover:bg-zinc-700"
                                  type="button">
                                  <Download className="size-4" /> Download
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="sm:hidden mt-3 flex items-center justify-between gap-2">
                          <span className="text-xs text-zinc-500">{formatSize(p.size)}</span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleCompleted(p._id)}
                              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border transition ${
                                done
                                  ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                                  : "bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-900"
                              }`}
                              type="button">
                              <ListChecks className="size-4" />
                              {done ? "Marked" : "Mark"}
                            </button>

                            {locked ? (
                              <span className="inline-flex bg-zinc-100 rounded-full p-2 items-center gap-2 text-sm text-black">
                                <Lock className="size-5" />
                              </span>
                            ) : isDownloading ? (
                              <Spinner className="border-t-black" />
                            ) : (
                              <button
                                onClick={() => handleDownload(p._id, p.name)}
                                className="inline-flex text-white items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border bg-black hover:bg-zinc-700"
                                type="button">
                                <Download className="size-4" />
                                Download
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-16 text-center">
                  <p className="text-zinc-700 text-lg font-semibold">
                    No {activeTab === "All" ? "resources" : activeTab.toLowerCase()}s found.
                  </p>
                  <p className="text-zinc-500 text-sm mt-2">Try changing filters or search.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ===================== KEEP YOUR MODALS AS IS BELOW ===================== */}
        {/* Exam Modal / Simple Timer Modal / Resource Info Modal */}
        {/* (unchanged from your code) */}
      </div>
    </Layout>
  );
};

export default Course;
