import Layout from "@/Layout";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  useGetCourseByIdQuery,
  useGetProductsByCourseQuery,
  useLazyDownloadResourceQuery,
  useLikeCourseMutation,
} from "../../redux/queries/productApi";
import Loader from "@/components/Loader";
import { useEffect, useMemo, useState } from "react";
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

const shuffle = <T,>(arr: T[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

/* ----------------------- exam (local demo question bank) ----------------------- */
type ExamType = "Quiz" | "Midterm" | "Final";
type Difficulty = "Easy" | "Medium" | "Hard";

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
  // add any fields you have (uploader, description, etc.)
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

  // Purchase access (resources)
  const hasAccess = category?.isPaid
    ? userInfo?.purchasedCourses?.some((c: any) => c.toString() === category?._id?.toString())
    : true;

  const locked = category?.isClosed || !hasAccess;

  // ✅ Only students who purchased THIS course can generate exam
  const canGenerateExam = Boolean(hasAccess && !category?.isClosed);

  const filteredProducts = useMemo(() => {
    const list: Resource[] = (products as any) || [];
    const byType = activeTab === "All" ? list : list.filter((p: any) => p.type === activeTab);
    const q = query.trim().toLowerCase();
    if (!q) return byType;
    return byType.filter((p: any) => (p?.name || "").toLowerCase().includes(q));
  }, [products, activeTab, query]);

  const handleDownload = async (id: string, fileName: string) => {
    try {
      setDownloadingId(id);
      const { blob, filename } = await triggerDownload(id).unwrap();

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

  // Timer countdown
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

                  <div className="mt-4 flex items-center gap-1 text-sm text-zinc-600">
                    <span className="font-semibold text-zinc-900">{products?.length || 0}</span>
                    resource/s available
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

          {/* ---------------------- EXAM UI (below header) ---------------------- */}
          {examStage !== "idle" && exam && (
            <div className="mt-6">
              <div className="rounded-2xl border bg-white px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                  <span className="rounded-full border bg-zinc-50 px-3 py-1">
                    Exam • {category?.code}
                  </span>
                  <span className="rounded-full border bg-zinc-50 px-3 py-1">
                    {exam.questions.length} questions
                  </span>
                  {exam.durationMin ? (
                    <span className="rounded-full border bg-zinc-50 px-3 py-1">
                      {exam.durationMin} min
                    </span>
                  ) : (
                    <span className="rounded-full border bg-zinc-50 px-3 py-1">Timer off</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {exam.durationMin ? (
                    <div className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm font-semibold">
                      <Clock className="size-4" />
                      {formatTime(timeLeft)}
                    </div>
                  ) : null}

                  {examStage === "exam" ? (
                    <Button onClick={finishExam} variant="outline" className="rounded-full">
                      Finish
                    </Button>
                  ) : (
                    <Button onClick={resetExam} variant="outline" className="rounded-full">
                      <RefreshCw className="mr-2 size-4" />
                      Close Exam
                    </Button>
                  )}
                </div>
              </div>

              {examStage === "exam" && currentQuestion && (
                <div className="mt-3 rounded-2xl border bg-white p-5">
                  <p className="text-xs font-semibold text-zinc-500">
                    Question {currentQ + 1} / {exam.questions.length}
                  </p>
                  <h2 className="mt-2 text-lg font-extrabold text-zinc-900">
                    {currentQuestion.question}
                  </h2>

                  <div className="mt-4 grid gap-2">
                    {currentQuestion.choices.map((c, idx) => {
                      const selected = answers[currentQuestion.id] === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => selectAnswer(currentQuestion.id, idx)}
                          className={`text-left rounded-xl border px-4 py-3 text-sm font-semibold transition
                            ${
                              selected
                                ? "border-zinc-900 bg-zinc-50"
                                : "bg-white hover:bg-zinc-50 border-zinc-200"
                            }`}>
                          {c}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-5 flex items-center justify-between flex-wrap gap-3">
                    <Button
                      variant="outline"
                      className="rounded-full"
                      disabled={currentQ === 0}
                      onClick={() => setCurrentQ((i) => Math.max(0, i - 1))}>
                      Prev
                    </Button>

                    <div className="text-sm text-zinc-500">
                      Answered{" "}
                      <span className="font-semibold text-zinc-900">
                        {Object.keys(answers).length}
                      </span>{" "}
                      / {exam.questions.length}
                    </div>

                    <Button
                      className="rounded-full bg-zinc-900 text-white"
                      onClick={() => {
                        if (currentQ === exam.questions.length - 1) finishExam();
                        else setCurrentQ((i) => Math.min(exam.questions.length - 1, i + 1));
                      }}>
                      {currentQ === exam.questions.length - 1 ? "Finish" : "Next"}
                      <ChevronRight className="ml-2 size-4" />
                    </Button>
                  </div>
                </div>
              )}

              {examStage === "result" && (
                <div className="mt-3">
                  <div className="rounded-2xl border bg-white p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <p className="text-xs font-semibold text-zinc-500">Result</p>
                        <h2 className="mt-2 text-2xl font-extrabold text-zinc-900">
                          Score: {score.correct}/{score.total} ({score.percent}%)
                        </h2>
                        <p className="mt-2 text-sm text-zinc-600">Review your answers below.</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          className="rounded-full"
                          onClick={() => {
                            setExamStage("idle");
                            resetExam();
                            openExamModal();
                          }}>
                          Generate New
                        </Button>
                        <Button variant="outline" className="rounded-full" onClick={resetExam}>
                          <RefreshCw className="mr-2 size-4" />
                          Close
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 space-y-3">
                    {exam.questions.map((q, idx) => {
                      const userPick = answers[q.id];
                      const correct = userPick === q.correctIndex;

                      return (
                        <div key={q.id} className="rounded-2xl border bg-white p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-zinc-500">Q{idx + 1}</p>
                              <p className="mt-2 font-semibold text-zinc-900">{q.question}</p>
                            </div>

                            <div className="shrink-0">
                              {correct ? (
                                <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                  <CheckCircle2 className="size-4" />
                                  Correct
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold bg-rose-50 text-rose-700 border border-rose-100">
                                  <XCircle className="size-4" />
                                  Wrong
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 grid gap-2">
                            {q.choices.map((c, i) => {
                              const isCorrect = i === q.correctIndex;
                              const isUser = i === userPick;

                              const cls = isCorrect
                                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                : isUser && !isCorrect
                                ? "border-rose-200 bg-rose-50 text-rose-800"
                                : "border-zinc-200 bg-white text-zinc-800";

                              return (
                                <div
                                  key={i}
                                  className={`rounded-xl border px-4 py-2 text-sm ${cls}`}>
                                  {c}
                                  {isCorrect && (
                                    <span className="ml-2 text-xs font-semibold">(Correct)</span>
                                  )}
                                  {isUser && !isCorrect && (
                                    <span className="ml-2 text-xs font-semibold">
                                      (Your choice)
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {q.explanation && (
                            <div className="mt-4 rounded-xl border bg-zinc-50 p-3 text-sm text-zinc-700">
                              <span className="font-semibold text-zinc-900">Explanation: </span>
                              {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ----------------------- Resources (SEPARATED + CLICKABLE) ----------------------- */}
          <div className="mt-6">
            <div className="hidden sm:grid grid-cols-[1fr_140px_120px] gap-4 px-2 pb-2">
              <div className="text-xs font-semibold text-zinc-500">Resource</div>
              <div className="text-xs font-semibold text-zinc-500">Size</div>
              <div className="text-xs font-semibold text-zinc-500 text-right">Action</div>
            </div>

            <AnimatePresence mode="popLayout">
              {filteredProducts?.length > 0 ? (
                <motion.div layout className="space-y-3">
                  {filteredProducts.map((p: Resource) => (
                    <motion.div
                      key={p._id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="rounded-2xl border bg-white px-4 py-4">
                      <div className="flex items-center gap-4">
                        {/* clickable area */}
                        <button
                          onClick={() => openResourceModal(p)}
                          className="flex items-center gap-4 min-w-0 flex-1 text-left group"
                          type="button">
                          <div className="size-14 rounded-xl bg-zinc-50 flex items-center justify-center shrink-0">
                            <img src={fileIcon(p.file?.url)} className="size-12 object-contain" />
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold text-lg text-zinc-900 line-clamp-1 group-hover:underline">
                              {p.name}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              <span
                                className={`text-[11px] font-semibold rounded-full px-2 py-1 ring-1 ${
                                  typePill[p.type] || "bg-zinc-50 text-zinc-700 ring-zinc-100"
                                }`}>
                                {p.type}
                              </span>
                              <span className="text-xs text-zinc-500">{fileExt(p.file?.url)}</span>
                            </div>
                          </div>
                        </button>

                        {/* desktop size + action */}
                        <div className="hidden sm:flex items-center gap-6">
                          <span className="text-sm text-zinc-500 w-[140px]">
                            {formatSize(p.size)}
                          </span>

                          <div className="w-[120px] flex justify-end">
                            {locked ? (
                              <span className="inline-flex items-center gap-2 text-sm bg-zinc-100 p-2 rounded-full text-black">
                                <Lock className="size-5" />
                              </span>
                            ) : downloadingId === p._id ? (
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

                      {/* mobile row */}
                      <div className="sm:hidden mt-3 flex items-center justify-between">
                        <span className="text-xs text-zinc-500">{formatSize(p.size)}</span>
                        {locked ? (
                          <span className="inline-flex bg-zinc-100 rounded-full p-2 items-center gap-2 text-sm text-black">
                            <Lock className="size-5" />
                          </span>
                        ) : downloadingId === p._id ? (
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
                    </motion.div>
                  ))}
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

        {/* ---------------------------- Exam Modal ---------------------------- */}
        {examOpen && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            role="dialog"
            aria-modal="true">
            <button
              className="absolute inset-0 bg-black/40"
              onClick={() => setExamOpen(false)}
              aria-label="Close"
            />
            <div className="relative w-full sm:w-[520px] bg-white rounded-t-2xl sm:rounded-2xl border p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-zinc-500">Generate Exam</p>
                  <h3 className="mt-1 text-lg font-extrabold text-zinc-900">Set your exam time</h3>
                  <p className="mt-2 text-sm text-zinc-600">
                    Course: <b>{category?.code}</b> • Questions:{" "}
                    <b>{Math.min(DEFAULT_COUNT, examPool.length)}</b>
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setExamOpen(false)}>
                  Close
                </Button>
              </div>

              <div className="mt-5 rounded-2xl border bg-white p-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-zinc-700" />
                    <p className="text-sm font-semibold text-zinc-900">Timer</p>
                  </div>

                  <button
                    onClick={() => setTimerEnabled((s) => !s)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 border text-sm font-semibold transition
                      ${
                        timerEnabled
                          ? "bg-zinc-900 text-white border-zinc-900"
                          : "bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-900"
                      }`}>
                    {timerEnabled ? "Enabled" : "Disabled"}
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={240}
                    value={durationMin}
                    disabled={!timerEnabled}
                    onChange={(e) => setDurationMin(Number(e.target.value))}
                    className={`w-28 rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200 ${
                      timerEnabled ? "bg-white" : "bg-zinc-50 text-zinc-400"
                    }`}
                  />
                  <span className="text-sm text-zinc-600">minutes</span>
                  <span className="text-xs text-zinc-500">(1–240)</span>
                </div>
              </div>

              {!examPool.length && (
                <div className="mt-4 rounded-xl border bg-zinc-50 p-3 text-sm text-zinc-700">
                  No questions available for this course yet. Add questions to the bank or connect
                  your backend.
                </div>
              )}

              <div className="mt-5 flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setExamOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={startExam}
                  disabled={!examPool.length}
                  className="rounded-full bg-zinc-900 text-white">
                  Start Exam
                  <ChevronRight className="ml-2 size-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------- Resource Info Modal -------------------------- */}
        {resourceOpen && selectedResource && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            role="dialog"
            aria-modal="true">
            <button
              className="absolute inset-0 bg-black/40"
              onClick={closeResourceModal}
              aria-label="Close"
            />

            <div className="relative w-full sm:w-[560px] bg-white rounded-t-2xl sm:rounded-2xl border p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-zinc-500">Resource details</p>
                  <h3 className="mt-1 text-lg font-extrabold text-zinc-900 break-words">
                    {selectedResource.name}
                  </h3>
                </div>

                <Button variant="outline" className="rounded-full" onClick={closeResourceModal}>
                  Close
                </Button>
              </div>

              <div className="mt-5 flex items-start gap-4">
                <div className="size-14 rounded-xl bg-zinc-50 flex items-center justify-center shrink-0 border">
                  <img
                    src={fileIcon(selectedResource.file?.url)}
                    className="size-12 object-contain"
                    alt="file"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[11px] font-semibold rounded-full px-2 py-1 ring-1 ${
                        typePill[selectedResource.type] || "bg-zinc-50 text-zinc-700 ring-zinc-100"
                      }`}>
                      {selectedResource.type}
                    </span>
                    <span className="text-xs text-zinc-600">
                      {fileExt(selectedResource.file?.url)}
                    </span>
                    <span className="text-xs text-zinc-600">
                      • {formatSize(selectedResource.size)}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl border bg-zinc-50 p-3">
                      <div className="text-xs font-semibold text-zinc-500">Course</div>
                      <div className="mt-1 font-semibold text-zinc-900">
                        {category?.code || "—"}
                      </div>
                    </div>
                    <div className="rounded-xl border bg-zinc-50 p-3">
                      <div className="text-xs font-semibold text-zinc-500">Access</div>
                      <div className="mt-1 font-semibold text-zinc-900">
                        {locked ? "Locked" : "Available"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2">
                {locked ? (
                  <div className="inline-flex items-center gap-2 rounded-full border bg-zinc-50 px-4 py-2 text-sm font-semibold text-zinc-700">
                    <Lock className="size-4" /> Locked
                  </div>
                ) : downloadingId === selectedResource._id ? (
                  <Spinner className="border-t-black" />
                ) : (
                  <button
                    onClick={() => handleDownload(selectedResource._id, selectedResource.name)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border bg-black text-white hover:bg-zinc-700"
                    type="button">
                    <Download className="size-4" /> Download
                  </button>
                )}
              </div>

              {/* optional hint */}
              <div className="mt-4 text-xs text-zinc-500 flex items-center gap-2">
                <FileText className="size-4" />
                Tip: click any resource to view full title + details here.
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Course;
