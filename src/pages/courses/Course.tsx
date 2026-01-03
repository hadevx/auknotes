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
  ListChecks,
  XCircle,
  CheckCircle2,
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

/* ============================ Fake Download Progress ============================ */
type FakeDownloadState = {
  active: boolean;
  percent: number; // 0..100
  label: "Starting" | "Downloading" | "Finalizing" | "Done";
};

const defaultFakeDl: FakeDownloadState = { active: false, percent: 0, label: "Starting" };
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

  // ✅ fake progress per resource
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

    setFakeDl((prev) => ({
      ...prev,
      [id]: { active: true, percent: 100, label: "Done" },
    }));

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
    setFakeDl((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  useEffect(() => {
    return () => {
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
    } catch (err) {
      console.log("error:", err);
      failFakeProgress(id);
      toast.error("Download failed. This file might be restricted or unavailable.");
    } finally {
      setDownloadingId(null);
    }
  };

  /* ------------------------------- likes ------------------------------- */
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

  /* =============================== EXAM STATE =============================== */
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

    const t = window.setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [examStage, exam?.durationMin, timeLeft]);

  const selectAnswer = (qid: string, idx: number) =>
    setAnswers((prev) => ({ ...prev, [qid]: idx }));

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

  /* ============================ Exam modal helpers ============================ */
  const closeExamModal = () => setExamOpen(false);

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

            {!hasAccess && (
              <Link
                to="/checkout"
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold bg-zinc-900 text-white hover:opacity-95 active:scale-[0.99]">
                <img src="/3d-fire.png" className="size-4" alt="Get Access" />
                Unlock All Courses
              </Link>
            )}
          </div>

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

        {/* =============================== EXAM SETUP MODAL =============================== */}
        <AnimatePresence>
          {examOpen && (
            <motion.div
              className="fixed inset-0 z-[60] flex items-center justify-center px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}>
              {/* Backdrop */}
              <button
                onClick={closeExamModal}
                className="absolute inset-0 bg-black/35"
                aria-label="Close exam modal"
                type="button"
              />

              {/* Card */}
              <motion.div
                initial={{ y: 18, opacity: 0, scale: 0.98 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 18, opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.18 }}
                className="relative w-full max-w-xl rounded-2xl border bg-white shadow-xl">
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border bg-zinc-50 text-zinc-700">
                        <GraduationCap className="size-4" />
                        Exam Generator
                      </div>

                      <h3 className="mt-3 text-xl font-extrabold tracking-tight text-zinc-900">
                        Create a practice exam
                      </h3>
                      <p className="mt-1 text-sm text-zinc-600">
                        We’ll pick <span className="font-semibold">{DEFAULT_COUNT}</span> random
                        questions from the local question bank for{" "}
                        <span className="font-semibold">{courseCodeForExam || "this course"}</span>.
                      </p>
                    </div>

                    <button
                      onClick={closeExamModal}
                      className="rounded-full p-2 border bg-white hover:bg-zinc-50"
                      type="button">
                      <XCircle className="size-5 text-zinc-700" />
                    </button>
                  </div>

                  {/* Status */}
                  <div className="mt-4 rounded-xl border bg-zinc-50 p-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="text-sm text-zinc-700">
                        Available questions:{" "}
                        <span className="font-extrabold text-zinc-900">{examPool.length}</span>
                      </div>

                      {examPool.length ? (
                        <span className="inline-flex items-center gap-2 text-xs font-semibold rounded-full px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="size-4" />
                          Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 text-xs font-semibold rounded-full px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="size-4" />
                          No questions
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Timer toggle + duration */}
                  <div className="mt-4 grid gap-3">
                    <div className="flex items-center justify-between gap-3 rounded-xl border p-3">
                      <div className="flex items-center gap-2">
                        <Clock className="size-4 text-zinc-700" />
                        <div>
                          <div className="text-sm font-bold text-zinc-900">Enable timer</div>
                          <div className="text-xs text-zinc-500">
                            If enabled, the exam auto-ends when time is up.
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setTimerEnabled((v) => !v)}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
                          timerEnabled ? "bg-zinc-900" : "bg-zinc-200"
                        }`}
                        type="button"
                        aria-pressed={timerEnabled}>
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                            timerEnabled ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="rounded-xl border p-3">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div>
                          <div className="text-sm font-bold text-zinc-900">Duration</div>
                          <div className="text-xs text-zinc-500">1–240 minutes</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            disabled={!timerEnabled}
                            onClick={() => setDurationMin((m) => clamp(m - 5, 1, 240))}
                            className={`rounded-full px-3 py-2 text-sm font-semibold border ${
                              timerEnabled
                                ? "bg-white hover:bg-zinc-50"
                                : "bg-zinc-50 text-zinc-400"
                            }`}
                            type="button">
                            -
                          </button>

                          <input
                            disabled={!timerEnabled}
                            value={durationMin}
                            onChange={(e) => setDurationMin(Number(e.target.value || 1))}
                            className={`w-24 rounded-full border px-3 py-2 text-sm font-semibold text-center outline-none ${
                              timerEnabled
                                ? "bg-white focus:ring-2 focus:ring-zinc-200"
                                : "bg-zinc-50 text-zinc-400"
                            }`}
                          />

                          <button
                            disabled={!timerEnabled}
                            onClick={() => setDurationMin((m) => clamp(m + 5, 1, 240))}
                            className={`rounded-full px-3 py-2 text-sm font-semibold border ${
                              timerEnabled
                                ? "bg-white hover:bg-zinc-50"
                                : "bg-zinc-50 text-zinc-400"
                            }`}
                            type="button">
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 flex items-center justify-end gap-2">
                    <button
                      onClick={closeExamModal}
                      className="rounded-full px-4 py-2 text-sm font-semibold border bg-white hover:bg-zinc-50"
                      type="button">
                      Cancel
                    </button>

                    <button
                      onClick={startExam}
                      disabled={!examPool.length}
                      className={`rounded-full px-4 py-2 text-sm font-semibold border transition ${
                        examPool.length
                          ? "bg-zinc-900 text-white border-zinc-900 hover:opacity-95"
                          : "bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed"
                      }`}
                      type="button">
                      Generate
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =============================== EXAM VIEW (FULLSCREEN) =============================== */}
        <AnimatePresence>
          {examStage === "exam" && exam && (
            <motion.div
              className="fixed inset-0 z-[70] bg-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}>
              <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
                {/* Top header */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border bg-zinc-50 text-zinc-700">
                        <GraduationCap className="size-4" />
                        {exam.courseCode}
                      </span>

                      <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border bg-zinc-50 text-zinc-700">
                        Q {currentQ + 1} / {exam.questions.length}
                      </span>

                      {exam.durationMin ? (
                        <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border bg-zinc-900 text-white border-zinc-900">
                          <Clock className="size-4" />
                          {formatTime(timeLeft)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border bg-zinc-50 text-zinc-700">
                          No timer
                        </span>
                      )}
                    </div>

                    <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">
                      Practice Exam
                    </h2>
                    <p className="mt-1 text-sm text-zinc-600">
                      Answer all questions, then finish to see your score.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        finishExam();
                      }}
                      className="rounded-full px-4 py-2 text-sm font-semibold border bg-zinc-900 text-white border-zinc-900 hover:opacity-95"
                      type="button">
                      Finish
                    </button>

                    <button
                      onClick={() => {
                        resetExam();
                      }}
                      className="rounded-full px-4 py-2 text-sm font-semibold border bg-white hover:bg-zinc-50"
                      type="button">
                      Exit
                    </button>
                  </div>
                </div>

                {/* Question card */}
                <div className="mt-6 rounded-2xl border bg-white p-5 sm:p-6">
                  {currentQuestion ? (
                    <>
                      <div className="text-sm text-zinc-500 font-semibold">
                        Question {currentQ + 1}
                      </div>
                      <div className="mt-2 text-lg sm:text-xl font-extrabold text-zinc-900">
                        {currentQuestion.question}
                      </div>

                      <div className="mt-5 grid gap-2">
                        {currentQuestion.choices.map((c, idx) => {
                          const selected = answers[currentQuestion.id] === idx;
                          return (
                            <button
                              key={idx}
                              onClick={() => selectAnswer(currentQuestion.id, idx)}
                              className={`text-left rounded-2xl border px-4 py-3 transition ${
                                selected
                                  ? "border-zinc-900 bg-zinc-900 text-white"
                                  : "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-900"
                              }`}
                              type="button">
                              <div className="flex items-start gap-3">
                                <div
                                  className={`mt-0.5 size-6 shrink-0 rounded-full border flex items-center justify-center text-xs font-extrabold ${
                                    selected ? "border-white/50" : "border-zinc-200"
                                  }`}>
                                  {String.fromCharCode(65 + idx)}
                                </div>
                                <div className="text-sm sm:text-base font-semibold">{c}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-6 flex items-center justify-between gap-3">
                        <button
                          onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
                          disabled={currentQ === 0}
                          className={`rounded-full px-4 py-2 text-sm font-semibold border ${
                            currentQ === 0
                              ? "bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed"
                              : "bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-900"
                          }`}
                          type="button">
                          Prev
                        </button>

                        <div className="text-xs text-zinc-500">
                          Answered:{" "}
                          <span className="font-extrabold text-zinc-900">
                            {Object.keys(answers).length}
                          </span>{" "}
                          / {exam.questions.length}
                        </div>

                        {currentQ === exam.questions.length - 1 ? (
                          <button
                            onClick={finishExam}
                            className="rounded-full px-4 py-2 text-sm font-semibold border bg-zinc-900 text-white border-zinc-900 hover:opacity-95"
                            type="button">
                            Finish
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              setCurrentQ((q) => Math.min(exam.questions.length - 1, q + 1))
                            }
                            className="rounded-full px-4 py-2 text-sm font-semibold border bg-zinc-900 text-white border-zinc-900 hover:opacity-95"
                            type="button">
                            Next
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-10 text-zinc-600">No question found.</div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =============================== RESULTS VIEW =============================== */}
        <AnimatePresence>
          {examStage === "result" && exam && (
            <motion.div
              className="fixed inset-0 z-[70] bg-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}>
              <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border bg-zinc-50 text-zinc-700">
                      <GraduationCap className="size-4" />
                      {exam.courseCode} • Results
                    </span>

                    <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">
                      Your score: {score.correct}/{score.total} ({score.percent}%)
                    </h2>
                    <p className="mt-1 text-sm text-zinc-600">
                      Review questions below. Correct answers are highlighted.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        resetExam();
                      }}
                      className="rounded-full px-4 py-2 text-sm font-semibold border bg-white hover:bg-zinc-50"
                      type="button">
                      Close
                    </button>
                    <button
                      onClick={() => {
                        // regenerate quickly with same settings
                        setExamStage("idle");
                        setTimeout(() => openExamModal(), 0);
                      }}
                      className="rounded-full px-4 py-2 text-sm font-semibold border bg-zinc-900 text-white border-zinc-900 hover:opacity-95"
                      type="button">
                      New Exam
                    </button>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {exam.questions.map((q, idx) => {
                    const picked = answers[q.id];
                    const isCorrect = picked === q.correctIndex;

                    return (
                      <div key={q.id} className="rounded-2xl border bg-white p-5">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="text-sm text-zinc-500 font-semibold">Q{idx + 1}</div>
                          {picked === undefined ? (
                            <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border bg-amber-50 text-amber-800 border-amber-200">
                              <XCircle className="size-4" />
                              Not answered
                            </span>
                          ) : isCorrect ? (
                            <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
                              <CheckCircle2 className="size-4" />
                              Correct
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border bg-rose-50 text-rose-700 border-rose-200">
                              <XCircle className="size-4" />
                              Wrong
                            </span>
                          )}
                        </div>

                        <div className="mt-2 text-lg font-extrabold text-zinc-900">
                          {q.question}
                        </div>

                        <div className="mt-4 grid gap-2">
                          {q.choices.map((c, cIdx) => {
                            const isRight = cIdx === q.correctIndex;
                            const isPicked = cIdx === picked;

                            const base =
                              "rounded-2xl border px-4 py-3 text-sm font-semibold text-left";
                            const style = isRight
                              ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                              : isPicked
                              ? "border-rose-300 bg-rose-50 text-rose-900"
                              : "border-zinc-200 bg-white text-zinc-900";

                            return (
                              <div key={cIdx} className={`${base} ${style}`}>
                                <div className="flex items-start gap-3">
                                  <div className="mt-0.5 size-6 shrink-0 rounded-full border border-zinc-200 flex items-center justify-center text-xs font-extrabold">
                                    {String.fromCharCode(65 + cIdx)}
                                  </div>
                                  <div>{c}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {q.explanation && (
                          <div className="mt-4 rounded-xl border bg-zinc-50 p-3 text-sm text-zinc-700">
                            <span className="font-extrabold text-zinc-900">Explanation: </span>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===================== Resource Info Modal placeholder (unchanged) ===================== */}
        {/* Keep your resource modal as-is below, you said only exam modal needed. */}
        {/* If you want, paste your current resource modal and I’ll merge it exactly. */}
        <AnimatePresence>
          {resourceOpen && selectedResource && (
            <motion.div
              className="fixed inset-0 z-[60] flex items-center justify-center px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}>
              <button
                onClick={closeResourceModal}
                className="absolute inset-0 bg-black/35"
                aria-label="Close resource modal"
                type="button"
              />

              <motion.div
                initial={{ y: 18, opacity: 0, scale: 0.98 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 18, opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.18 }}
                className="relative w-full max-w-lg rounded-2xl border bg-white shadow-xl">
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold text-zinc-500">Resource</div>
                      <div className="mt-1 text-xl font-extrabold text-zinc-900">
                        {selectedResource.name}
                      </div>
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[11px] font-semibold rounded-full px-2 py-1 ring-1 ${
                            typePill[selectedResource.type] ||
                            "bg-zinc-50 text-zinc-700 ring-zinc-100"
                          }`}>
                          {selectedResource.type}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {fileExt(selectedResource.file?.url)}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {formatSize(selectedResource.size)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={closeResourceModal}
                      className="rounded-full p-2 border bg-white hover:bg-zinc-50"
                      type="button">
                      <XCircle className="size-5 text-zinc-700" />
                    </button>
                  </div>

                  <div className="mt-5 flex items-center justify-end gap-2">
                    <button
                      onClick={closeResourceModal}
                      className="rounded-full px-4 py-2 text-sm font-semibold border bg-white hover:bg-zinc-50"
                      type="button">
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default Course;
