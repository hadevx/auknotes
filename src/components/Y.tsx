import Layout from "@/Layout";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ListChecks,
  Clock,
  RefreshCw,
  ChevronRight,
  CheckCircle2,
  XCircle,
  GraduationCap,
} from "lucide-react";
import { Link } from "react-router-dom";

/**
 * AukNotes — Simple MCQ Exam Generator
 * ✅ One button -> modal -> pick course + set time -> generate
 * ✅ No topic filter, no difficulty filter
 * ✅ User can set duration in minutes (and optionally disable timer)
 * Courses: CHEM 101, CPEG 210
 *
 * UI-only MVP: uses local QUESTION_BANK. Replace with backend later.
 */

type ExamType = "Quiz" | "Midterm" | "Final";
type Difficulty = "Easy" | "Medium" | "Hard";

type MCQ = {
  id: string;
  courseCode: "CHEM101" | "CPEG210";
  examType: ExamType;
  difficulty: Difficulty;
  question: string;
  choices: string[];
  correctIndex: number;
  explanation?: string;
};

const QUESTION_BANK: MCQ[] = [
  // =========================
  // CHEM101
  // =========================
  {
    id: "chem101-1",
    courseCode: "CHEM101",
    examType: "Quiz",
    difficulty: "Easy",
    question: "Which subatomic particle carries a negative charge?",
    choices: ["Proton", "Neutron", "Electron", "Nucleus"],
    correctIndex: 2,
    explanation: "Electrons are negatively charged; protons are positive; neutrons are neutral.",
  },
  {
    id: "chem101-2",
    courseCode: "CHEM101",
    examType: "Midterm",
    difficulty: "Medium",
    question: "Across a period (left → right), atomic radius generally:",
    choices: ["Increases", "Decreases", "Stays the same", "Becomes unpredictable"],
    correctIndex: 1,
    explanation:
      "Effective nuclear charge increases across a period, pulling electrons closer and decreasing radius.",
  },
  {
    id: "chem101-3",
    courseCode: "CHEM101",
    examType: "Final",
    difficulty: "Medium",
    question: "The coefficients in a balanced chemical equation represent:",
    choices: ["Mass ratios", "Mole ratios", "Volume ratios for solids only", "Charge ratios"],
    correctIndex: 1,
    explanation: "Coefficients represent relative numbers of moles (mole ratios).",
  },
  {
    id: "chem101-4",
    courseCode: "CHEM101",
    examType: "Final",
    difficulty: "Hard",
    question: "Which bond is most polar?",
    choices: ["C–H", "H–H", "H–F", "Cl–Cl"],
    correctIndex: 2,
    explanation: "Bond polarity increases with electronegativity difference; H–F is very polar.",
  },
  {
    id: "chem101-5",
    courseCode: "CHEM101",
    examType: "Midterm",
    difficulty: "Easy",
    question: "A Bronsted–Lowry acid is a:",
    choices: ["Electron pair donor", "Electron pair acceptor", "Proton donor", "Proton acceptor"],
    correctIndex: 2,
    explanation: "Bronsted–Lowry acids donate protons (H+).",
  },
  {
    id: "chem101-6",
    courseCode: "CHEM101",
    examType: "Quiz",
    difficulty: "Easy",
    question: "Which unit is commonly used for amount of substance?",
    choices: ["Joule", "Mole", "Watt", "Pascal"],
    correctIndex: 1,
    explanation: "Amount of substance is measured in moles (mol).",
  },

  // =========================
  // CPEG210
  // =========================
  {
    id: "cpeg210-1",
    courseCode: "CPEG210",
    examType: "Quiz",
    difficulty: "Easy",
    question: "What is the binary representation of decimal 13?",
    choices: ["1100", "1101", "1011", "1110"],
    correctIndex: 1,
    explanation: "13 = 8 + 4 + 1 → 1101.",
  },
  {
    id: "cpeg210-2",
    courseCode: "CPEG210",
    examType: "Midterm",
    difficulty: "Medium",
    question: "A NAND gate output is 0 only when:",
    choices: ["Any input is 0", "All inputs are 0", "All inputs are 1", "Inputs are different"],
    correctIndex: 2,
    explanation: "NAND = NOT(AND). AND is 1 only when all are 1 → NAND outputs 0 then.",
  },
  {
    id: "cpeg210-3",
    courseCode: "CPEG210",
    examType: "Quiz",
    difficulty: "Easy",
    question: "A multiplexer (MUX) is used to:",
    choices: [
      "Store data",
      "Select one input from many and forward it",
      "Convert analog to digital",
      "Generate a clock",
    ],
    correctIndex: 1,
    explanation: "A MUX selects one of multiple inputs using select lines.",
  },
  {
    id: "cpeg210-4",
    courseCode: "CPEG210",
    examType: "Final",
    difficulty: "Medium",
    question: "A flip-flop is primarily a:",
    choices: ["Combinational device", "Memory element", "Voltage regulator", "Signal amplifier"],
    correctIndex: 1,
    explanation: "Flip-flops store state (1 bit) — memory elements.",
  },
  {
    id: "cpeg210-5",
    courseCode: "CPEG210",
    examType: "Final",
    difficulty: "Hard",
    question: "A Mealy machine output depends on:",
    choices: ["Current state only", "Input only", "Current state and input", "Next state only"],
    correctIndex: 2,
    explanation: "Mealy output depends on state + input; Moore depends on state only.",
  },
  {
    id: "cpeg210-6",
    courseCode: "CPEG210",
    examType: "Midterm",
    difficulty: "Medium",
    question: "Which is equivalent to A + A'B ?",
    choices: ["A + B", "AB", "A' + B", "A(B + A')"],
    correctIndex: 0,
    explanation: "Absorption: A + A'B = A + B.",
  },
];

const shuffle = <T,>(arr: T[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

type GeneratedExam = {
  courseCode: "CHEM101" | "CPEG210";
  durationMin: number | null;
  questions: MCQ[];
};

const courseLabel = (c: "CHEM101" | "CPEG210") => (c === "CHEM101" ? "CHEM 101" : "CPEG 210");

const DEFAULT_COUNT = 10;
const DEFAULT_DURATION_MIN = 25;

const SimpleExamGenerator = () => {
  const [stage, setStage] = useState<"idle" | "exam" | "result">("idle");

  // Modal
  const [open, setOpen] = useState(false);
  const [courseCode, setCourseCode] = useState<"CHEM101" | "CPEG210">("CHEM101");

  // Timer controls (set in modal)
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [durationMin, setDurationMin] = useState<number>(DEFAULT_DURATION_MIN);

  // Exam state
  const [exam, setExam] = useState<GeneratedExam | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  const poolSize = useMemo(() => {
    return QUESTION_BANK.filter((q) => q.courseCode === courseCode).length;
  }, [courseCode]);

  const generate = () => {
    const pool = QUESTION_BANK.filter((q) => q.courseCode === courseCode);
    const picked = shuffle(pool).slice(0, Math.min(DEFAULT_COUNT, pool.length));

    const duration = timerEnabled ? Math.max(1, Math.min(240, durationMin)) : null;

    const newExam: GeneratedExam = {
      courseCode,
      durationMin: duration,
      questions: picked,
    };

    setExam(newExam);
    setAnswers({});
    setCurrent(0);

    const totalSeconds = duration ? duration * 60 : 0;
    setTimeLeft(totalSeconds);

    setStage("exam");
    setOpen(false);
  };

  // Timer countdown
  useEffect(() => {
    if (stage !== "exam") return;
    if (!exam?.durationMin) return;

    if (timeLeft <= 0) {
      setStage("result");
      return;
    }

    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [stage, exam?.durationMin, timeLeft]);

  const selectAnswer = (qid: string, idx: number) => {
    setAnswers((prev) => ({ ...prev, [qid]: idx }));
  };

  const finish = () => setStage("result");

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

  const reset = () => {
    setExam(null);
    setAnswers({});
    setCurrent(0);
    setTimeLeft(0);
    setStage("idle");
  };

  const currentQuestion = exam?.questions[current];

  return (
    <Layout>
      <div className="min-h-screen bg-biege">
        <div className="max-w-4xl mx-auto px-3 lg:px-6 py-10">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-700">
                <Sparkles className="size-4 text-tomato" />
                Quick Exam Generator
              </div>
              <h1 className="mt-2 text-2xl lg:text-3xl font-extrabold tracking-tight text-zinc-900">
                One click → Generate an MCQ exam
              </h1>
              <p className="mt-2 text-sm text-zinc-600 max-w-2xl">
                Pick the course, set the duration, and start.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border bg-white hover:bg-zinc-50">
                <Clock className="size-4" />
                Courses
              </Link>
              <Button onClick={() => setOpen(true)} className="rounded-full bg-zinc-900 text-white">
                <GraduationCap className="mr-2 size-4" />
                Generate Exam
              </Button>
            </div>
          </div>

          {/* Idle */}
          {stage === "idle" && (
            <div className="mt-8 rounded-2xl border bg-white p-8">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900">Ready</h2>
                  <p className="mt-2 text-sm text-zinc-600">
                    Click <b>Generate Exam</b>, choose the course, and set the timer.
                  </p>
                  <div className="mt-4 text-sm text-zinc-600">
                    <p>
                      • Default: <b>{DEFAULT_COUNT}</b> questions
                    </p>
                    <p>
                      • Timer: <b>{timerEnabled ? `${durationMin} minutes` : "Off"}</b>
                    </p>
                  </div>
                </div>

                <Button onClick={() => setOpen(true)} className="rounded-xl bg-zinc-900 text-white">
                  Generate Exam
                  <ChevronRight className="ml-2 size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Exam */}
          {stage === "exam" && exam && (
            <div className="mt-6">
              <div className="rounded-2xl border bg-white p-4 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                  <span className="rounded-full border bg-zinc-50 px-3 py-1">
                    {courseLabel(exam.courseCode)}
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

                <div className="flex items-center gap-3">
                  {exam.durationMin ? (
                    <div className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm font-semibold">
                      <Clock className="size-4" />
                      {formatTime(timeLeft)}
                    </div>
                  ) : null}

                  <Button onClick={finish} variant="outline" className="rounded-full">
                    Finish
                  </Button>
                </div>
              </div>

              {currentQuestion && (
                <div className="mt-4 rounded-2xl border bg-white p-5">
                  <p className="text-xs font-semibold text-zinc-500">
                    Question {current + 1} / {exam.questions.length}
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

                  <div className="mt-5 flex items-center justify-between">
                    <Button
                      variant="outline"
                      className="rounded-full"
                      disabled={current === 0}
                      onClick={() => setCurrent((i) => Math.max(0, i - 1))}>
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
                        if (current === exam.questions.length - 1) finish();
                        else setCurrent((i) => Math.min(exam.questions.length - 1, i + 1));
                      }}>
                      {current === exam.questions.length - 1 ? "Finish" : "Next"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Result */}
          {stage === "result" && exam && (
            <div className="mt-6">
              <div className="rounded-2xl border bg-white p-5 lg:p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-xs font-semibold text-zinc-500">Result</p>
                    <h2 className="mt-2 text-2xl font-extrabold text-zinc-900">
                      Score: {score.correct}/{score.total} ({score.percent}%)
                    </h2>
                    <p className="mt-2 text-sm text-zinc-600">Review your answers below.</p>
                  </div>

                  <Button variant="outline" className="rounded-full" onClick={reset}>
                    <RefreshCw className="mr-2 size-4" />
                    Generate Another
                  </Button>
                </div>
              </div>

              <div className="mt-4 space-y-3">
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
                            <div key={i} className={`rounded-xl border px-4 py-2 text-sm ${cls}`}>
                              {c}
                              {isCorrect && (
                                <span className="ml-2 text-xs font-semibold">(Correct)</span>
                              )}
                              {isUser && !isCorrect && (
                                <span className="ml-2 text-xs font-semibold">(Your choice)</span>
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

          {/* Modal */}
          {open && (
            <div
              className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
              role="dialog"
              aria-modal="true">
              <button
                className="absolute inset-0 bg-black/40"
                onClick={() => setOpen(false)}
                aria-label="Close"
              />

              <div className="relative w-full sm:w-[520px] bg-white rounded-t-2xl sm:rounded-2xl border p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-zinc-500">Generate Exam</p>
                    <h3 className="mt-1 text-lg font-extrabold text-zinc-900">
                      Pick course + set time
                    </h3>
                    <p className="mt-2 text-sm text-zinc-600">
                      Exam size: <b>{DEFAULT_COUNT}</b> questions (or fewer if the bank is small).
                    </p>
                  </div>

                  <Button variant="outline" className="rounded-full" onClick={() => setOpen(false)}>
                    Close
                  </Button>
                </div>

                <div className="mt-5 grid gap-3">
                  <button
                    onClick={() => setCourseCode("CHEM101")}
                    className={`rounded-2xl border p-4 text-left transition ${
                      courseCode === "CHEM101"
                        ? "border-zinc-900 bg-zinc-50"
                        : "border-zinc-200 hover:bg-zinc-50"
                    }`}>
                    <p className="text-sm font-extrabold text-zinc-900">CHEM 101</p>
                    <p className="mt-1 text-xs text-zinc-600">General chemistry basics.</p>
                    <p className="mt-2 text-xs text-zinc-500">
                      Questions:{" "}
                      <b>{QUESTION_BANK.filter((q) => q.courseCode === "CHEM101").length}</b>
                    </p>
                  </button>

                  <button
                    onClick={() => setCourseCode("CPEG210")}
                    className={`rounded-2xl border p-4 text-left transition ${
                      courseCode === "CPEG210"
                        ? "border-zinc-900 bg-zinc-50"
                        : "border-zinc-200 hover:bg-zinc-50"
                    }`}>
                    <p className="text-sm font-extrabold text-zinc-900">CPEG 210</p>
                    <p className="mt-1 text-xs text-zinc-600">Digital logic & fundamentals.</p>
                    <p className="mt-2 text-xs text-zinc-500">
                      Questions:{" "}
                      <b>{QUESTION_BANK.filter((q) => q.courseCode === "CPEG210").length}</b>
                    </p>
                  </button>
                </div>

                {/* Timer controls */}
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

                {poolSize < DEFAULT_COUNT && (
                  <div className="mt-4 rounded-xl border bg-zinc-50 p-3 text-sm text-zinc-700">
                    Note: this course has <b>{poolSize}</b> questions in the bank, so your exam will
                    have <b>{poolSize}</b>.
                  </div>
                )}

                <div className="mt-5 flex items-center justify-end gap-2">
                  <Button variant="outline" className="rounded-full" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={generate} className="rounded-full bg-zinc-900 text-white">
                    Generate
                    <ChevronRight className="ml-2 size-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Empty bank */}
          {!QUESTION_BANK.length && (
            <div className="mt-6 rounded-2xl border bg-white p-10 text-center text-zinc-600">
              No questions in bank yet.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SimpleExamGenerator;
