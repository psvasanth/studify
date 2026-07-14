import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Calculator,
  BookOpen,
  CalendarClock,
  Settings as SettingsIcon,
  Plus,
  Trash2,
  X,
  Check,
  ChevronRight,
  RotateCcw,
  TrendingUp,
  Clock,
  Target,
  Flame,
  Sparkles,
  ArrowLeft,
  Delete,
  User,
  Palette,
  AlertTriangle,
  Pencil,
  ListChecks,
  CalendarPlus,
  Timer,
  Trophy,
  BarChart3,
  Dumbbell,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Constants & helpers                                                 */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = "studify_data_v1";

const ACCENT_HEX = {
  violet: "#8b5cf6",
  emerald: "#10b981",
  blue: "#3b82f6",
};

const ACCENTS = {
  violet: {
    label: "Violet",
    text: "text-violet-400",
    textBright: "text-violet-300",
    bg: "bg-violet-500",
    bgSoft: "bg-violet-500/10",
    bgSoft2: "bg-violet-500/15",
    border: "border-violet-500/40",
    borderBright: "border-violet-400",
    dot: "bg-violet-400",
    fromTo: "from-violet-500/20 to-purple-600/5",
  },
  emerald: {
    label: "Emerald",
    text: "text-emerald-400",
    textBright: "text-emerald-300",
    bg: "bg-emerald-500",
    bgSoft: "bg-emerald-500/10",
    bgSoft2: "bg-emerald-500/15",
    border: "border-emerald-500/40",
    borderBright: "border-emerald-400",
    dot: "bg-emerald-400",
    fromTo: "from-emerald-500/20 to-teal-600/5",
  },
  blue: {
    label: "Blue",
    text: "text-blue-400",
    textBright: "text-blue-300",
    bg: "bg-blue-500",
    bgSoft: "bg-blue-500/10",
    bgSoft2: "bg-blue-500/15",
    border: "border-blue-500/40",
    borderBright: "border-blue-400",
    dot: "bg-blue-400",
    fromTo: "from-blue-500/20 to-indigo-600/5",
  },
};

function hexToRgba(hex, alpha) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function glowStyle(hex, strength = 0.35) {
  return {
    boxShadow: `0 0 24px ${hexToRgba(hex, strength)}, 0 0 2px ${hexToRgba(
      hex,
      strength + 0.2
    )}`,
  };
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function toISODateLocal(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function todayISO() {
  return toISODateLocal(new Date());
}

function monthKeyOf(dateStr) {
  return dateStr.slice(0, 7);
}

function prettyDay(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const today = todayISO();
  const yestD = new Date();
  yestD.setDate(yestD.getDate() - 1);
  if (dateStr === today) return "Today";
  if (dateStr === toISODateLocal(yestD)) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function daysBetween(dateStr, now) {
  const target = new Date(dateStr);
  target.setHours(23, 59, 59, 999);
  const diffMs = target - now;
  return diffMs;
}

const SUBJECT_COLORS = {
  English: { hex: "#38bdf8", text: "text-sky-400", bg: "bg-sky-500" },
  Quants: { hex: "#a78bfa", text: "text-violet-400", bg: "bg-violet-500" },
  Reasoning: { hex: "#34d399", text: "text-emerald-400", bg: "bg-emerald-500" },
  "Current Affairs": { hex: "#fbbf24", text: "text-amber-400", bg: "bg-amber-500" },
  Other: { hex: "#f472b6", text: "text-pink-400", bg: "bg-pink-500" },
};

const SUBJECT_LIST = ["English", "Quants", "Reasoning", "Current Affairs", "Other"];

const BASE_EXERCISES = ["Skipping", "Push-ups", "Sit-ups", "Running"];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

/* ------------------------------------------------------------------ */
/* Default / mock data                                                 */
/* ------------------------------------------------------------------ */

function defaultData() {
  const now = new Date();
  const inDays = (n) => {
    const d = new Date(now);
    d.setDate(d.getDate() + n);
    return d.toISOString();
  };
  const dayOffsetISO = (n) => {
    const d = new Date(now);
    d.setDate(d.getDate() + n);
    return toISODateLocal(d);
  };

  return {
    view: "quiz",
    installBannerDismissed: false,
    profile: {
      name: "Aspirant",
      targetExam: "SSC CGL 2027",
      accent: "violet",
    },
    quiz: {
      config: {
        multiplierDepth: 20,
        tables: [11, 13, 16, 17],
        questionsPerRound: 10,
      },
      lastResult: null,
      mistakes: {
        "17 x 14": { wrong: 4, correct: 238 },
        "13 x 16": { wrong: 3, correct: 208 },
        "19 x 12": { wrong: 2, correct: 228 },
        "16 x 18": { wrong: 2, correct: 288 },
      },
    },
    study: {
      subjects: {
        English: {
          sub: [
            { id: uid(), name: "Reading Comprehension", hours: 12 },
            { id: uid(), name: "Grammar", hours: 8.5 },
            { id: uid(), name: "Vocabulary", hours: 4 },
          ],
        },
        Quants: {
          sub: [
            { id: uid(), name: "Algebra", hours: 15 },
            { id: uid(), name: "Time and Work", hours: 10 },
            { id: uid(), name: "Geometry", hours: 6.5 },
          ],
        },
        Reasoning: {
          sub: [
            { id: uid(), name: "Puzzles", hours: 9 },
            { id: uid(), name: "Syllogism", hours: 5 },
          ],
        },
        "Current Affairs": {
          sub: [{ id: uid(), name: "Monthly Digest", hours: 7 }],
        },
        Other: {
          sub: [{ id: uid(), name: "Mock Tests", hours: 11 }],
        },
      },
      log: [
        { id: uid(), subject: "Quants", sub: "Algebra", hours: 2, date: inDays(-1) },
        { id: uid(), subject: "English", sub: "Grammar", hours: 1.5, date: inDays(-2) },
        { id: uid(), subject: "Other", sub: "Mock Tests", hours: 3, date: inDays(-3) },
      ],
    },
    exams: [
      { id: uid(), name: "SSC CGL Tier 1", date: inDays(46) },
      { id: uid(), name: "Bank PO Prelims", date: inDays(92) },
      { id: uid(), name: "Mock Test #7", date: inDays(4) },
    ],
    exercise: {
      customTypes: [],
      logs: [
        { id: uid(), date: todayISO(), exercise: "Skipping", quantity: 100 },
        { id: uid(), date: dayOffsetISO(-1), exercise: "Push-ups", quantity: 60 },
        { id: uid(), date: dayOffsetISO(-1), exercise: "Sit-ups", quantity: 40 },
        { id: uid(), date: dayOffsetISO(-3), exercise: "Running", quantity: 5 },
        { id: uid(), date: dayOffsetISO(-9), exercise: "Push-ups", quantity: 80 },
        { id: uid(), date: dayOffsetISO(-35), exercise: "Push-ups", quantity: 120 },
      ],
    },
  };
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData();
    const parsed = JSON.parse(raw);
    return { ...defaultData(), ...parsed };
  } catch (e) {
    return defaultData();
  }
}

/* ------------------------------------------------------------------ */
/* Small shared UI atoms                                               */
/* ------------------------------------------------------------------ */

function StudifyMark({ size = 30, hex = "#8b5cf6" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="60" height="60" rx="18" fill="#09090b" stroke={hex} strokeOpacity="0.5" strokeWidth="2.5" />
      <circle cx="32" cy="32" r="15" fill="none" stroke={hex} strokeWidth="6" />
      <path d="M24 33l5 5 11-11" fill="none" stroke="#ede9fe" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="47" cy="15" r="4" fill={hex} />
    </svg>
  );
}

function TapButton({ children, className = "", style, onClick, disabled, active }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation", ...style }}
      className={
        "select-none transition-transform duration-150 active:scale-95 disabled:opacity-40 disabled:active:scale-100 " +
        className
      }
    >
      {children}
    </button>
  );
}

function SectionHeader({ icon: Icon, title, subtitle, accent }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div
        className={`w-11 h-11 rounded-2xl flex items-center justify-center ${accent.bgSoft} border ${accent.border}`}
      >
        <Icon size={20} className={accent.text} strokeWidth={2.25} />
      </div>
      <div>
        <h1 className="text-lg font-semibold text-zinc-50 tracking-tight">{title}</h1>
        {subtitle ? <p className="text-xs text-zinc-500">{subtitle}</p> : null}
      </div>
    </div>
  );
}

function Card({ children, className = "", style }) {
  return (
    <div
      className={`rounded-3xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-sm p-4 ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard 1: Math Tables Quiz                                       */
/* ------------------------------------------------------------------ */

function QuizDashboard({ quiz, setQuiz, accent }) {
  const [stage, setStage] = useState("setup"); // setup | active | results
  const [session, setSession] = useState(null);
  const accentHex = ACCENT_HEX[accent];

  const config = quiz.config;

  const toggleTable = (n) => {
    setQuiz((q) => {
      const has = q.config.tables.includes(n);
      const tables = has
        ? q.config.tables.filter((t) => t !== n)
        : [...q.config.tables, n].sort((a, b) => a - b);
      return { ...q, config: { ...q.config, tables } };
    });
  };

  const setDepth = (n) => {
    setQuiz((q) => ({ ...q, config: { ...q.config, multiplierDepth: n } }));
  };

  const setQPR = (n) => {
    setQuiz((q) => ({ ...q, config: { ...q.config, questionsPerRound: n } }));
  };

  const buildQuestions = useCallback(() => {
    const combos = [];
    config.tables.forEach((a) => {
      for (let b = 1; b <= config.multiplierDepth; b++) {
        combos.push({ a, b, answer: a * b });
      }
    });
    const shuffle = (arr) => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    };
    shuffle(combos);
    const list = [];
    let lap = 0;
    while (list.length < config.questionsPerRound && combos.length > 0) {
      if (lap > 0) shuffle(combos);
      for (let i = 0; i < combos.length && list.length < config.questionsPerRound; i++) {
        list.push(combos[i]);
      }
      lap++;
    }
    return list;
  }, [config]);

  const startQuiz = () => {
    const questions = buildQuestions();
    setSession({
      questions,
      index: 0,
      input: "",
      feedback: null,
      correctCount: 0,
      sessionMistakes: [],
    });
    setStage("active");
  };

  const pressDigit = (d) => {
    setSession((s) => {
      if (s.feedback) return s;
      if (s.input.length >= 5) return s;
      return { ...s, input: s.input + d };
    });
  };
  const pressBackspace = () => {
    setSession((s) => (s.feedback ? s : { ...s, input: s.input.slice(0, -1) }));
  };
  const pressClear = () => {
    setSession((s) => (s.feedback ? s : { ...s, input: "" }));
  };

  const submitAnswer = useCallback(() => {
    setSession((s) => {
      if (!s || s.feedback) return s;
      const q = s.questions[s.index];
      const userVal = s.input === "" ? null : parseInt(s.input, 10);
      const correct = userVal !== null && userVal === q.answer;
      let mistakes = s.sessionMistakes;
      if (!correct) {
        mistakes = [...mistakes, { a: q.a, b: q.b, answer: q.answer, given: userVal }];
        setQuiz((qz) => {
          const key = `${q.a} x ${q.b}`;
          const prev = qz.mistakes[key];
          return {
            ...qz,
            mistakes: {
              ...qz.mistakes,
              [key]: { wrong: (prev?.wrong || 0) + 1, correct: q.answer },
            },
          };
        });
      }
      return {
        ...s,
        feedback: { correct, given: userVal },
        correctCount: correct ? s.correctCount + 1 : s.correctCount,
        sessionMistakes: mistakes,
      };
    });
  }, [setQuiz]);

  const nextQuestion = useCallback(() => {
    setSession((s) => {
      if (!s.feedback) return s;
      const nextIndex = s.index + 1;
      if (nextIndex >= s.questions.length) {
        setQuiz((qz) => ({
          ...qz,
          lastResult: {
            correct: s.correctCount,
            total: s.questions.length,
            date: new Date().toISOString(),
          },
        }));
        setStage("results");
        return s;
      }
      return { ...s, index: nextIndex, input: "", feedback: null };
    });
  }, [setQuiz]);

  // Auto-submit — no manual tick needed. Submits instantly once the digit
  // count matches the answer's length, or after 5s of inactivity either way.
  useEffect(() => {
    if (stage !== "active" || !session || session.feedback) return;
    const q = session.questions[session.index];
    const expectedLen = String(q.answer).length;
    if (session.input.length > 0 && session.input.length >= expectedLen) {
      submitAnswer();
      return;
    }
    const t = setTimeout(() => submitAnswer(), 5000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, session?.input, session?.index, session?.feedback]);

  // Auto-advance shortly after feedback appears — no manual tap required.
  useEffect(() => {
    if (stage !== "active" || !session?.feedback) return;
    const t = setTimeout(() => nextQuestion(), 850);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, session?.feedback]);

  const topMistakes = useMemo(() => {
    return Object.entries(quiz.mistakes)
      .map(([key, v]) => ({ key, ...v }))
      .sort((x, y) => y.wrong - x.wrong)
      .slice(0, 6);
  }, [quiz.mistakes]);

  /* ---------------- Setup screen ---------------- */
  if (stage === "setup") {
    return (
      <div className="pb-6">
        <Card className="mb-4">
          <p className="text-sm font-medium text-zinc-300 mb-3">Multiplier depth</p>
          <div className="flex gap-2 mb-3">
            {[10, 15, 20].map((n) => (
              <TapButton
                key={n}
                onClick={() => setDepth(n)}
                className={`flex-1 h-11 rounded-xl text-sm font-semibold border ${
                  config.multiplierDepth === n
                    ? `${ACCENTS[accent].bgSoft2} ${ACCENTS[accent].borderBright} ${ACCENTS[accent].textBright}`
                    : "border-zinc-800 text-zinc-400"
                }`}
              >
                ×{n}
              </TapButton>
            ))}
          </div>
          <input
            type="range"
            min="5"
            max="20"
            value={config.multiplierDepth}
            onChange={(e) => setDepth(parseInt(e.target.value, 10))}
            className="w-full accent-violet-500 h-2"
            style={{ accentColor: accentHex }}
          />
          <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
            <span>Up to 5</span>
            <span className={`font-semibold ${ACCENTS[accent].text}`}>
              Table × {config.multiplierDepth}
            </span>
            <span>Up to 20</span>
          </div>
        </Card>

        <Card className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-zinc-300">Select tables to practice</p>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setQuiz((q) => ({
                    ...q,
                    config: { ...q.config, tables: Array.from({ length: 30 }, (_, i) => i + 1) },
                  }))
                }
                className="text-[11px] text-zinc-400 underline underline-offset-2"
              >
                All
              </button>
              <button
                onClick={() => setQuiz((q) => ({ ...q, config: { ...q.config, tables: [] } }))}
                className="text-[11px] text-zinc-400 underline underline-offset-2"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => {
              const active = config.tables.includes(n);
              return (
                <TapButton
                  key={n}
                  onClick={() => toggleTable(n)}
                  className={`h-11 rounded-xl text-sm font-semibold border ${
                    active
                      ? `${ACCENTS[accent].bgSoft2} ${ACCENTS[accent].borderBright} ${ACCENTS[accent].textBright}`
                      : "border-zinc-800 text-zinc-500"
                  }`}
                >
                  {n}
                </TapButton>
              );
            })}
          </div>
        </Card>

        <Card className="mb-4">
          <p className="text-sm font-medium text-zinc-300 mb-3">Questions per round</p>
          <div className="grid grid-cols-4 gap-2">
            {[10, 20, 50, 100].map((n) => (
              <TapButton
                key={n}
                onClick={() => setQPR(n)}
                className={`h-11 rounded-xl text-sm font-semibold border ${
                  config.questionsPerRound === n
                    ? `${ACCENTS[accent].bgSoft2} ${ACCENTS[accent].borderBright} ${ACCENTS[accent].textBright}`
                    : "border-zinc-800 text-zinc-400"
                }`}
              >
                {n}
              </TapButton>
            ))}
          </div>
        </Card>

        {quiz.lastResult && (
          <Card className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Trophy size={16} className={ACCENTS[accent].text} />
              <p className="text-sm font-medium text-zinc-300">Last round</p>
            </div>
            <p className="text-2xl font-bold text-zinc-50">
              {quiz.lastResult.correct}
              <span className="text-zinc-500 text-base"> / {quiz.lastResult.total}</span>
            </p>
            <p className="text-xs text-zinc-500">
              {Math.round((quiz.lastResult.correct / quiz.lastResult.total) * 100)}% accuracy
            </p>
          </Card>
        )}

        {topMistakes.length > 0 && (
          <Card className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className="text-rose-400" />
              <p className="text-sm font-medium text-zinc-300">Repeated mistakes</p>
            </div>
            <div className="space-y-2">
              {topMistakes.map((m) => (
                <div
                  key={m.key}
                  className="flex items-center justify-between rounded-xl bg-rose-500/5 border border-rose-500/20 px-3 py-2"
                >
                  <span className="text-sm text-zinc-200 font-medium">
                    {m.key} = {m.correct}
                  </span>
                  <span className="text-[11px] text-rose-400 font-semibold">
                    missed ×{m.wrong}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <TapButton
          onClick={startQuiz}
          disabled={config.tables.length === 0}
          className={`w-full h-14 rounded-2xl font-semibold text-zinc-950 flex items-center justify-center gap-2 ${ACCENTS[accent].bg}`}
          style={glowStyle(accentHex, 0.4)}
        >
          <Sparkles size={18} />
          Start Quiz
        </TapButton>
      </div>
    );
  }

  /* ---------------- Active quiz screen ---------------- */
  if (stage === "active" && session) {
    const q = session.questions[session.index];
    return (
      <div className="pb-6 flex flex-col min-h-[70vh]">
        <div className="flex items-center justify-between mb-6">
          <TapButton
            onClick={() => setStage("setup")}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-zinc-900 border border-zinc-800"
          >
            <ArrowLeft size={16} className="text-zinc-400" />
          </TapButton>
          <p className="text-xs font-medium text-zinc-500">
            Question {session.index + 1} of {session.questions.length}
          </p>
          <div className="w-9 h-9" />
        </div>

        <div className="w-full h-1.5 rounded-full bg-zinc-900 mb-8 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${((session.index + (session.feedback ? 1 : 0)) / session.questions.length) * 100}%`,
              backgroundColor: accentHex,
            }}
          />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <p className="text-4xl font-bold text-zinc-50 tracking-tight">
            {q.a} <span className={ACCENTS[accent].text}>×</span> {q.b}
          </p>

          <div
            className={`w-full max-w-[260px] h-16 rounded-2xl border-2 flex items-center justify-center text-2xl font-bold transition-colors ${
              session.feedback
                ? session.feedback.correct
                  ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                  : "border-rose-500 text-rose-400 bg-rose-500/10"
                : "border-zinc-700 text-zinc-100 bg-zinc-900"
            }`}
          >
            {session.input || <span className="text-zinc-600">?</span>}
          </div>

          {session.feedback ? (
            <p
              className={`text-sm font-medium ${
                session.feedback.correct ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {session.feedback.correct ? "Correct!" : `Answer: ${q.answer}`}
            </p>
          ) : (
            <p className="text-[11px] text-zinc-600">Submits automatically as you type</p>
          )}
        </div>

        {!session.feedback ? (
          <div className="grid grid-cols-3 gap-3 mt-8">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
              <TapButton
                key={d}
                onClick={() => pressDigit(String(d))}
                className="h-14 rounded-2xl bg-zinc-900 border border-zinc-800 text-xl font-semibold text-zinc-100"
              >
                {d}
              </TapButton>
            ))}
            <TapButton
              onClick={pressBackspace}
              className="h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400"
            >
              <Delete size={20} />
            </TapButton>
            <TapButton
              onClick={() => pressDigit("0")}
              className="h-14 rounded-2xl bg-zinc-900 border border-zinc-800 text-xl font-semibold text-zinc-100"
            >
              0
            </TapButton>
            <TapButton
              onClick={pressClear}
              className="h-14 rounded-2xl flex items-center justify-center text-zinc-400 border border-zinc-800 bg-zinc-900"
            >
              <X size={20} />
            </TapButton>
          </div>
        ) : (
          <TapButton
            onClick={nextQuestion}
            className="w-full h-14 rounded-2xl font-medium text-zinc-500 mt-8 flex items-center justify-center gap-2 border border-zinc-800 bg-zinc-900/60"
          >
            {session.index + 1 >= session.questions.length ? "Loading results…" : "Next question in a moment"}
            <ChevronRight size={16} />
          </TapButton>
        )}
      </div>
    );
  }

  /* ---------------- Results screen ---------------- */
  if (stage === "results" && session) {
    const accuracy = Math.round((session.correctCount / session.questions.length) * 100);
    return (
      <div className="pb-6">
        <div className="flex flex-col items-center text-center mb-6 pt-2">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${ACCENTS[accent].bgSoft} border ${ACCENTS[accent].border}`}
            style={glowStyle(accentHex, 0.3)}
          >
            <Trophy size={32} className={ACCENTS[accent].text} />
          </div>
          <p className="text-3xl font-bold text-zinc-50">
            {session.correctCount}
            <span className="text-zinc-500 text-xl"> / {session.questions.length}</span>
          </p>
          <p className="text-sm text-zinc-500 mt-1">{accuracy}% accuracy this round</p>
        </div>

        {session.sessionMistakes.length > 0 && (
          <Card className="mb-4">
            <p className="text-sm font-medium text-zinc-300 mb-3">Missed this round</p>
            <div className="space-y-2">
              {session.sessionMistakes.map((m, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl bg-rose-500/5 border border-rose-500/20 px-3 py-2"
                >
                  <span className="text-sm text-zinc-200">
                    {m.a} × {m.b} = {m.answer}
                  </span>
                  <span className="text-[11px] text-rose-400">your answer: {m.given || "—"}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-rose-400" />
            <p className="text-sm font-medium text-zinc-300">All repeated mistakes</p>
          </div>
          <div className="space-y-2">
            {topMistakes.length === 0 && (
              <p className="text-xs text-zinc-500">No repeated mistakes yet — nice work.</p>
            )}
            {topMistakes.map((m) => (
              <div
                key={m.key}
                className="flex items-center justify-between rounded-xl bg-zinc-900/80 border border-zinc-800 px-3 py-2"
              >
                <span className="text-sm text-zinc-200 font-medium">
                  {m.key} = {m.correct}
                </span>
                <span className="text-[11px] text-rose-400 font-semibold">missed ×{m.wrong}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex gap-3">
          <TapButton
            onClick={startQuiz}
            className={`flex-1 h-14 rounded-2xl font-semibold text-zinc-950 flex items-center justify-center gap-2 ${ACCENTS[accent].bg}`}
            style={glowStyle(accentHex, 0.4)}
          >
            <RotateCcw size={18} />
            Try again
          </TapButton>
          <TapButton
            onClick={() => setStage("setup")}
            className="flex-1 h-14 rounded-2xl font-semibold text-zinc-300 border border-zinc-800 bg-zinc-900"
          >
            New setup
          </TapButton>
        </div>
      </div>
    );
  }

  return null;
}

/* ------------------------------------------------------------------ */
/* Dashboard 2: Study Tracker                                          */
/* ------------------------------------------------------------------ */

function StudyDashboard({ study, setStudy, accent }) {
  const [selSubject, setSelSubject] = useState(SUBJECT_LIST[0]);
  const [selSub, setSelSub] = useState(study.subjects[SUBJECT_LIST[0]].sub[0]?.id || null);
  const [hoursInput, setHoursInput] = useState(1);
  const [newSubName, setNewSubName] = useState("");
  const [editing, setEditing] = useState(null); // {subject, id}
  const [editValue, setEditValue] = useState("");
  const [managingSubject, setManagingSubject] = useState(null);

  const [chartDate, setChartDate] = useState(todayISO());
  const [allTime, setAllTime] = useState(false);

  const totals = useMemo(() => {
    const t = {};
    if (allTime) {
      SUBJECT_LIST.forEach((s) => {
        t[s] = study.subjects[s].sub.reduce((sum, x) => sum + x.hours, 0);
      });
    } else {
      SUBJECT_LIST.forEach((s) => (t[s] = 0));
      study.log.forEach((l) => {
        if (l.date.slice(0, 10) === chartDate && t[l.subject] !== undefined) {
          t[l.subject] += l.hours;
        }
      });
    }
    return t;
  }, [study, allTime, chartDate]);

  const totalAllSubjects = useMemo(
    () => Object.values(totals).reduce((a, b) => a + b, 0),
    [totals]
  );

  const currentSubOptions = study.subjects[selSubject].sub;

  useEffect(() => {
    if (!currentSubOptions.find((x) => x.id === selSub)) {
      setSelSub(currentSubOptions[0]?.id || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selSubject]);

  const logSession = () => {
    if (!selSub || hoursInput <= 0) return;
    setStudy((s) => {
      const subjectObj = s.subjects[selSubject];
      const sub = subjectObj.sub.map((x) =>
        x.id === selSub ? { ...x, hours: +(x.hours + hoursInput).toFixed(1) } : x
      );
      const subName = subjectObj.sub.find((x) => x.id === selSub)?.name;
      const log = [
        { id: uid(), subject: selSubject, sub: subName, hours: hoursInput, date: todayISO() },
        ...s.log,
      ].slice(0, 20);
      return { ...s, subjects: { ...s.subjects, [selSubject]: { sub } }, log };
    });
  };

  const addSub = (subject) => {
    if (!newSubName.trim()) return;
    setStudy((s) => ({
      ...s,
      subjects: {
        ...s.subjects,
        [subject]: {
          sub: [...s.subjects[subject].sub, { id: uid(), name: newSubName.trim(), hours: 0 }],
        },
      },
    }));
    setNewSubName("");
  };

  const deleteSub = (subject, id) => {
    setStudy((s) => ({
      ...s,
      subjects: {
        ...s.subjects,
        [subject]: { sub: s.subjects[subject].sub.filter((x) => x.id !== id) },
      },
    }));
  };

  const saveEdit = () => {
    if (!editing) return;
    setStudy((s) => ({
      ...s,
      subjects: {
        ...s.subjects,
        [editing.subject]: {
          sub: s.subjects[editing.subject].sub.map((x) =>
            x.id === editing.id ? { ...x, name: editValue || x.name } : x
          ),
        },
      },
    }));
    setEditing(null);
  };

  return (
    <div className="pb-6">
      {/* Progress overview */}
      <Card className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className={ACCENTS[accent].text} />
            <p className="text-sm font-medium text-zinc-300">Hours by subject</p>
          </div>
          <TapButton
            onClick={() => setAllTime((v) => !v)}
            className={`h-8 px-3 rounded-lg text-[11px] font-semibold border ${
              allTime
                ? `${ACCENTS[accent].bgSoft2} ${ACCENTS[accent].borderBright} ${ACCENTS[accent].textBright}`
                : "border-zinc-800 text-zinc-500"
            }`}
          >
            All time
          </TapButton>
        </div>

        {!allTime && (
          <input
            type="date"
            value={chartDate}
            max={todayISO()}
            onChange={(e) => setChartDate(e.target.value)}
            className="w-full h-11 rounded-xl bg-zinc-950 border border-zinc-800 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-600 mb-5"
          />
        )}

        <div className="flex items-center gap-6">
          <svg width="140" height="140" viewBox="0 0 140 140" className="shrink-0 -rotate-90">
            <circle cx="70" cy="70" r="58" fill="none" stroke="#27272a" strokeWidth="16" />
            {(() => {
              const r = 58;
              const circumference = 2 * Math.PI * r;
              let offset = 0;
              return SUBJECT_LIST.filter((s) => totals[s] > 0).map((s) => {
                const frac = totalAllSubjects > 0 ? totals[s] / totalAllSubjects : 0;
                const dash = frac * circumference;
                const el = (
                  <circle
                    key={s}
                    cx="70"
                    cy="70"
                    r={r}
                    fill="none"
                    stroke={SUBJECT_COLORS[s].hex}
                    strokeWidth="16"
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    strokeDashoffset={-offset}
                    strokeLinecap="butt"
                  />
                );
                offset += dash;
                return el;
              });
            })()}
          </svg>

          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-zinc-500 mb-0.5">
              Total {allTime ? "(all time)" : `· ${prettyDay(chartDate)}`}
            </p>
            <p className="text-3xl font-bold text-zinc-50 mb-3">{totalAllSubjects.toFixed(1)}h</p>
            <div className="space-y-1.5">
              {SUBJECT_LIST.map((s) => (
                <div key={s} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-zinc-400">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: SUBJECT_COLORS[s].hex }}
                    />
                    {s}
                  </span>
                  <span className="text-zinc-300 font-medium">{totals[s].toFixed(1)}h</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Logger */}
      <Card className="mb-4">
        <p className="text-sm font-medium text-zinc-300 mb-3">Log a session</p>

        <p className="text-[11px] uppercase tracking-wide text-zinc-500 mb-2">Subject</p>
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
          {SUBJECT_LIST.map((s) => (
            <TapButton
              key={s}
              onClick={() => setSelSubject(s)}
              className={`shrink-0 h-10 px-4 rounded-xl text-sm font-medium border ${
                selSubject === s
                  ? "bg-zinc-100 text-zinc-950 border-zinc-100"
                  : "border-zinc-800 text-zinc-400"
              }`}
            >
              {s}
            </TapButton>
          ))}
        </div>

        <p className="text-[11px] uppercase tracking-wide text-zinc-500 mb-2">Sub-topic</p>
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
          {currentSubOptions.length === 0 && (
            <p className="text-xs text-zinc-600 italic py-2">
              No sub-topics yet — add one in "Manage" below.
            </p>
          )}
          {currentSubOptions.map((x) => (
            <TapButton
              key={x.id}
              onClick={() => setSelSub(x.id)}
              className={`shrink-0 h-10 px-4 rounded-xl text-sm font-medium border ${
                selSub === x.id
                  ? `${ACCENTS[accent].bgSoft2} ${ACCENTS[accent].borderBright} ${ACCENTS[accent].textBright}`
                  : "border-zinc-800 text-zinc-400"
              }`}
            >
              {x.name}
            </TapButton>
          ))}
        </div>

        <p className="text-[11px] uppercase tracking-wide text-zinc-500 mb-2">Hours</p>
        <div className="flex items-center gap-3 mb-4">
          <TapButton
            onClick={() => setHoursInput((h) => Math.max(0.5, +(h - 0.5).toFixed(1)))}
            className="w-12 h-12 rounded-xl bg-zinc-800 text-zinc-200 text-lg font-bold flex items-center justify-center"
          >
            −
          </TapButton>
          <div className="flex-1 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-lg font-bold text-zinc-50">
            {hoursInput}h
          </div>
          <TapButton
            onClick={() => setHoursInput((h) => +(h + 0.5).toFixed(1))}
            className="w-12 h-12 rounded-xl bg-zinc-800 text-zinc-200 text-lg font-bold flex items-center justify-center"
          >
            +
          </TapButton>
        </div>

        <TapButton
          onClick={logSession}
          disabled={!selSub}
          className={`w-full h-14 rounded-2xl font-semibold text-zinc-950 flex items-center justify-center gap-2 ${ACCENTS[accent].bg}`}
          style={glowStyle(ACCENT_HEX[accent], 0.35)}
        >
          <Plus size={18} />
          Log session
        </TapButton>
      </Card>

      {/* Manage sub-subjects */}
      <Card className="mb-4">
        <p className="text-sm font-medium text-zinc-300 mb-3">Manage sub-topics</p>
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1 -mx-1 px-1">
          {SUBJECT_LIST.map((s) => (
            <TapButton
              key={s}
              onClick={() => setManagingSubject(managingSubject === s ? null : s)}
              className={`shrink-0 h-10 px-4 rounded-xl text-sm font-medium border flex items-center gap-1.5 ${
                managingSubject === s
                  ? `${ACCENTS[accent].bgSoft2} ${ACCENTS[accent].borderBright} ${ACCENTS[accent].textBright}`
                  : "border-zinc-800 text-zinc-400"
              }`}
            >
              {s}
              <ChevronRight
                size={14}
                className={`transition-transform ${managingSubject === s ? "rotate-90" : ""}`}
              />
            </TapButton>
          ))}
        </div>

        {managingSubject && (
          <div className="space-y-2 mb-3">
            {study.subjects[managingSubject].sub.map((x) => (
              <div
                key={x.id}
                className="flex items-center gap-2 rounded-xl bg-zinc-950/60 border border-zinc-800 px-3 py-2"
              >
                {editing?.id === x.id ? (
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                    className="flex-1 bg-transparent border-b border-zinc-700 text-sm text-zinc-100 outline-none py-0.5"
                  />
                ) : (
                  <span className="flex-1 text-sm text-zinc-200">{x.name}</span>
                )}
                <span className="text-xs text-zinc-500">{x.hours.toFixed(1)}h</span>
                <TapButton
                  onClick={() => {
                    setEditing({ subject: managingSubject, id: x.id });
                    setEditValue(x.name);
                  }}
                  className="w-8 h-8 flex items-center justify-center text-zinc-500"
                >
                  <Pencil size={14} />
                </TapButton>
                <TapButton
                  onClick={() => deleteSub(managingSubject, x.id)}
                  className="w-8 h-8 flex items-center justify-center text-rose-400"
                >
                  <Trash2 size={14} />
                </TapButton>
              </div>
            ))}

            <div className="flex gap-2 pt-1">
              <input
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                placeholder="New sub-topic name"
                className="flex-1 h-11 rounded-xl bg-zinc-950 border border-zinc-800 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-600"
              />
              <TapButton
                onClick={() => addSub(managingSubject)}
                className={`w-11 h-11 rounded-xl flex items-center justify-center text-zinc-950 ${ACCENTS[accent].bg}`}
              >
                <Plus size={18} />
              </TapButton>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard 3: Exam Countdown                                         */
/* ------------------------------------------------------------------ */

function ExamDashboard({ exams, setExams, accent }) {
  const [now, setNow] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const addExam = () => {
    if (!name.trim() || !date) return;
    setExams((e) => [...e, { id: uid(), name: name.trim(), date: new Date(date).toISOString() }]);
    setName("");
    setDate("");
    setShowForm(false);
  };

  const removeExam = (id) => setExams((e) => e.filter((x) => x.id !== id));

  const sorted = useMemo(
    () => [...exams].sort((a, b) => new Date(a.date) - new Date(b.date)),
    [exams]
  );

  return (
    <div className="pb-6">
      <div className="space-y-3 mb-4">
        {sorted.length === 0 && (
          <p className="text-sm text-zinc-600 text-center py-10">
            No events yet. Add your first exam below.
          </p>
        )}
        {sorted.map((ex) => {
          const diffMs = daysBetween(ex.date, now);
          const pastDue = diffMs < 0;
          const totalDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          const hours = Math.floor((Math.abs(diffMs) / (1000 * 60 * 60)) % 24);
          const urgent = !pastDue && totalDays <= 7;
          const soon = !pastDue && totalDays > 7 && totalDays <= 30;
          const urgencyHex = pastDue ? "#71717a" : urgent ? "#f43f5e" : soon ? "#f59e0b" : ACCENT_HEX[accent];

          return (
            <Card key={ex.id} className="relative overflow-hidden" style={{ borderColor: hexToRgba(urgencyHex, 0.35) }}>
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-100 truncate">{ex.name}</p>
                  <p className="text-xs text-zinc-500">{fmtDate(ex.date)}</p>
                </div>
                <TapButton
                  onClick={() => removeExam(ex.id)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-600 shrink-0"
                >
                  <Trash2 size={15} />
                </TapButton>
              </div>

              <div className="mt-3 flex items-end gap-2">
                <div
                  className="rounded-2xl px-4 py-2 flex items-baseline gap-1.5"
                  style={{
                    backgroundColor: hexToRgba(urgencyHex, 0.12),
                    border: `1px solid ${hexToRgba(urgencyHex, 0.4)}`,
                    boxShadow: pastDue ? "none" : `0 0 18px ${hexToRgba(urgencyHex, 0.25)}`,
                  }}
                >
                  <span className="text-2xl font-bold tabular-nums" style={{ color: urgencyHex }}>
                    {pastDue ? Math.abs(totalDays) : Math.max(totalDays, 0)}
                  </span>
                  <span className="text-xs font-medium" style={{ color: urgencyHex }}>
                    {pastDue ? "days ago" : totalDays === 0 ? `days · ${hours}h left` : "days left"}
                  </span>
                </div>
                {urgent && !pastDue && (
                  <span className="flex items-center gap-1 text-[11px] text-rose-400 font-medium mb-1">
                    <Flame size={12} /> urgent
                  </span>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {showForm && (
        <Card className="mb-4">
          <p className="text-[11px] uppercase tracking-wide text-zinc-500 mb-2">Name</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. NEET SS Mock #3"
            className="w-full h-12 rounded-xl bg-zinc-950 border border-zinc-800 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-600 mb-4"
          />
          <p className="text-[11px] uppercase tracking-wide text-zinc-500 mb-2">Date</p>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full h-12 rounded-xl bg-zinc-950 border border-zinc-800 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-600 mb-4"
          />
          <TapButton
            onClick={addExam}
            disabled={!name.trim() || !date}
            className={`w-full h-12 rounded-xl font-semibold text-zinc-950 ${ACCENTS[accent].bg}`}
          >
            Save event
          </TapButton>
        </Card>
      )}

      <TapButton
        onClick={() => setShowForm((v) => !v)}
        className={`w-full h-14 rounded-2xl font-semibold flex items-center justify-center gap-2 border ${
          showForm
            ? "border-zinc-700 text-zinc-300 bg-zinc-900"
            : `text-zinc-950 ${ACCENTS[accent].bg} border-transparent`
        }`}
        style={!showForm ? glowStyle(ACCENT_HEX[accent], 0.35) : undefined}
      >
        {showForm ? <X size={18} /> : <CalendarPlus size={18} />}
        {showForm ? "Cancel" : "Add exam"}
      </TapButton>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard 4: Settings                                               */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Dashboard 5: Exercise Tracker                                       */
/* ------------------------------------------------------------------ */

function ExerciseDashboard({ exercise, setExercise, accent }) {
  const allTypes = useMemo(() => {
    const fromLogs = Array.from(new Set(exercise.logs.map((l) => l.exercise)));
    return Array.from(new Set([...BASE_EXERCISES, ...exercise.customTypes, ...fromLogs]));
  }, [exercise]);

  const [date, setDate] = useState(todayISO());
  const [selType, setSelType] = useState(allTypes[0] || "Skipping");
  const [addingCustom, setAddingCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [quantity, setQuantity] = useState("");

  const [calCursor, setCalCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [calSelected, setCalSelected] = useState(todayISO());

  const [analyticsType, setAnalyticsType] = useState(allTypes[0] || "Skipping");
  const [timeframe, setTimeframe] = useState("month");

  const logWorkout = () => {
    const q = parseFloat(quantity);
    if (!selType || !q || q <= 0) return;
    setExercise((ex) => ({
      ...ex,
      logs: [{ id: uid(), date, exercise: selType, quantity: q }, ...ex.logs],
    }));
    setQuantity("");
  };

  const addCustomType = () => {
    const name = customName.trim();
    if (!name) return;
    setExercise((ex) =>
      ex.customTypes.includes(name) ? ex : { ...ex, customTypes: [...ex.customTypes, name] }
    );
    setSelType(name);
    setCustomName("");
    setAddingCustom(false);
  };

  const deleteLog = (id) => {
    setExercise((ex) => ({ ...ex, logs: ex.logs.filter((l) => l.id !== id) }));
  };

  const todayLogs = useMemo(
    () => exercise.logs.filter((l) => l.date === todayISO()),
    [exercise.logs]
  );

  const loggedDates = useMemo(
    () => new Set(exercise.logs.map((l) => l.date)),
    [exercise.logs]
  );

  const calGrid = useMemo(() => {
    const { year, month } = calCursor;
    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    }
    return cells;
  }, [calCursor]);

  const calSelectedResults = useMemo(
    () => exercise.logs.filter((l) => l.date === calSelected),
    [calSelected, exercise.logs]
  );

  const analyticsTotal = useMemo(() => {
    const now = new Date();
    const thisMonth = monthKeyOf(todayISO());
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, "0")}`;

    return exercise.logs
      .filter((l) => l.exercise === analyticsType)
      .filter((l) => {
        if (timeframe === "all") return true;
        if (timeframe === "month") return monthKeyOf(l.date) === thisMonth;
        if (timeframe === "lastMonth") return monthKeyOf(l.date) === lastMonth;
        return true;
      })
      .reduce((sum, l) => sum + l.quantity, 0);
  }, [exercise.logs, analyticsType, timeframe]);

  const accentHex = ACCENT_HEX[accent];

  return (
    <div className="pb-6">
      {/* Input form */}
      <Card className="mb-4">
        <p className="text-sm font-medium text-zinc-300 mb-3">Log a workout</p>

        <p className="text-[11px] uppercase tracking-wide text-zinc-500 mb-2">Date</p>
        <input
          type="date"
          value={date}
          max={todayISO()}
          onChange={(e) => setDate(e.target.value)}
          className="w-full h-12 rounded-xl bg-zinc-950 border border-zinc-800 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-600 mb-4"
        />

        <p className="text-[11px] uppercase tracking-wide text-zinc-500 mb-2">Exercise</p>
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
          {allTypes.map((t) => (
            <TapButton
              key={t}
              onClick={() => setSelType(t)}
              className={`shrink-0 h-10 px-4 rounded-xl text-sm font-medium border ${
                selType === t
                  ? `${ACCENTS[accent].bgSoft2} ${ACCENTS[accent].borderBright} ${ACCENTS[accent].textBright}`
                  : "border-zinc-800 text-zinc-400"
              }`}
            >
              {t}
            </TapButton>
          ))}
          <TapButton
            onClick={() => setAddingCustom((v) => !v)}
            className={`shrink-0 h-10 px-4 rounded-xl text-sm font-medium border flex items-center gap-1 ${
              addingCustom ? "border-zinc-600 text-zinc-200" : "border-zinc-800 text-zinc-500"
            }`}
          >
            <Plus size={14} />
            Add custom
          </TapButton>
        </div>

        {addingCustom && (
          <div className="flex gap-2 mb-4">
            <input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Squats"
              className="flex-1 h-11 rounded-xl bg-zinc-950 border border-zinc-800 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-600"
            />
            <TapButton
              onClick={addCustomType}
              className={`w-11 h-11 rounded-xl flex items-center justify-center text-zinc-950 ${ACCENTS[accent].bg}`}
            >
              <Check size={18} />
            </TapButton>
          </div>
        )}

        <p className="text-[11px] uppercase tracking-wide text-zinc-500 mb-2">
          Quantity (reps / km / etc.)
        </p>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="e.g. 100"
          className="w-full h-12 rounded-xl bg-zinc-950 border border-zinc-800 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-600 mb-4"
        />

        <TapButton
          onClick={logWorkout}
          disabled={!quantity || parseFloat(quantity) <= 0}
          className={`w-full h-14 rounded-2xl font-semibold text-zinc-950 flex items-center justify-center gap-2 ${ACCENTS[accent].bg}`}
          style={glowStyle(accentHex, 0.35)}
        >
          <Dumbbell size={18} />
          Log workout
        </TapButton>
      </Card>

      {/* Today's feed */}
      <Card className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Flame size={16} className={ACCENTS[accent].text} />
          <p className="text-sm font-medium text-zinc-300">Today</p>
        </div>
        {todayLogs.length === 0 ? (
          <p className="text-xs text-zinc-600">No workouts logged yet today.</p>
        ) : (
          <div className="space-y-2">
            {todayLogs.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between rounded-xl bg-zinc-950/60 border border-zinc-800 px-3 py-2"
              >
                <span className="text-sm text-zinc-200">
                  {l.quantity} {l.exercise}
                </span>
                <TapButton
                  onClick={() => deleteLog(l.id)}
                  className="w-7 h-7 flex items-center justify-center text-zinc-600"
                >
                  <X size={14} />
                </TapButton>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Calendar view */}
      <Card className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <TapButton
            onClick={() =>
              setCalCursor((c) => {
                const m = c.month === 0 ? 11 : c.month - 1;
                const y = c.month === 0 ? c.year - 1 : c.year;
                return { year: y, month: m };
              })
            }
            className="w-9 h-9 rounded-full flex items-center justify-center bg-zinc-900 border border-zinc-800"
          >
            <ArrowLeft size={15} className="text-zinc-400" />
          </TapButton>
          <p className="text-sm font-semibold text-zinc-200">
            {new Date(calCursor.year, calCursor.month, 1).toLocaleDateString("en-IN", {
              month: "long",
              year: "numeric",
            })}
          </p>
          <TapButton
            onClick={() =>
              setCalCursor((c) => {
                const m = c.month === 11 ? 0 : c.month + 1;
                const y = c.month === 11 ? c.year + 1 : c.year;
                return { year: y, month: m };
              })
            }
            className="w-9 h-9 rounded-full flex items-center justify-center bg-zinc-900 border border-zinc-800"
          >
            <ChevronRight size={15} className="text-zinc-400" />
          </TapButton>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} className="text-center text-[10px] text-zinc-600 font-medium py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calGrid.map((dateStr, i) => {
            if (!dateStr) return <div key={i} />;
            const isToday = dateStr === todayISO();
            const isSelected = dateStr === calSelected;
            const hasLog = loggedDates.has(dateStr);
            const dayNum = parseInt(dateStr.slice(8, 10), 10);
            return (
              <TapButton
                key={dateStr}
                onClick={() => setCalSelected(dateStr)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm relative border ${
                  isSelected
                    ? `${ACCENTS[accent].bgSoft2} ${ACCENTS[accent].borderBright} ${ACCENTS[accent].textBright} font-semibold`
                    : isToday
                    ? "border-zinc-600 text-zinc-100"
                    : "border-transparent text-zinc-400"
                }`}
              >
                {dayNum}
                {hasLog && (
                  <span
                    className={`absolute bottom-1.5 w-1 h-1 rounded-full ${
                      isSelected ? "bg-zinc-950" : ACCENTS[accent].dot
                    }`}
                  />
                )}
              </TapButton>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2">
          <p className="text-xs font-medium text-zinc-400 mb-2">{prettyDay(calSelected)}</p>
          {calSelectedResults.length === 0 ? (
            <p className="text-xs text-zinc-600">Nothing logged on this day.</p>
          ) : (
            calSelectedResults.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between rounded-xl bg-zinc-950/60 border border-zinc-800 px-3 py-2"
              >
                <span className="text-sm text-zinc-200">
                  {l.quantity} {l.exercise}
                </span>
                <TapButton
                  onClick={() => deleteLog(l.id)}
                  className="w-7 h-7 flex items-center justify-center text-zinc-600"
                >
                  <X size={14} />
                </TapButton>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Analytics */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={16} className={ACCENTS[accent].text} />
          <p className="text-sm font-medium text-zinc-300">Monthly totals</p>
        </div>

        <p className="text-[11px] uppercase tracking-wide text-zinc-500 mb-2">Exercise</p>
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
          {allTypes.map((t) => (
            <TapButton
              key={t}
              onClick={() => setAnalyticsType(t)}
              className={`shrink-0 h-10 px-4 rounded-xl text-sm font-medium border ${
                analyticsType === t
                  ? `${ACCENTS[accent].bgSoft2} ${ACCENTS[accent].borderBright} ${ACCENTS[accent].textBright}`
                  : "border-zinc-800 text-zinc-400"
              }`}
            >
              {t}
            </TapButton>
          ))}
        </div>

        <p className="text-[11px] uppercase tracking-wide text-zinc-500 mb-2">Timeframe</p>
        <div className="flex gap-2 mb-5">
          {[
            { key: "month", label: "This month" },
            { key: "lastMonth", label: "Last month" },
            { key: "all", label: "All time" },
          ].map((tf) => (
            <TapButton
              key={tf.key}
              onClick={() => setTimeframe(tf.key)}
              className={`flex-1 h-11 rounded-xl text-xs font-semibold border ${
                timeframe === tf.key
                  ? `${ACCENTS[accent].bgSoft2} ${ACCENTS[accent].borderBright} ${ACCENTS[accent].textBright}`
                  : "border-zinc-800 text-zinc-400"
              }`}
            >
              {tf.label}
            </TapButton>
          ))}
        </div>

        <div
          className={`rounded-2xl border ${ACCENTS[accent].border} ${ACCENTS[accent].bgSoft} px-4 py-4 text-center`}
        >
          <p className="text-[11px] text-zinc-500 mb-1">
            Total {analyticsType} ·{" "}
            {timeframe === "month" ? "this month" : timeframe === "lastMonth" ? "last month" : "all time"}
          </p>
          <p className={`text-3xl font-bold ${ACCENTS[accent].textBright}`}>{analyticsTotal}</p>
        </div>
      </Card>
    </div>
  );
}

function SettingsDashboard({ profile, setProfile, accent, onReset }) {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="pb-6">
      <Card className="mb-4">
        <div className="flex items-center gap-2 mb-4">
          <User size={16} className={ACCENTS[accent].text} />
          <p className="text-sm font-medium text-zinc-300">Profile</p>
        </div>
        <p className="text-[11px] uppercase tracking-wide text-zinc-500 mb-2">Name</p>
        <input
          value={profile.name}
          onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
          className="w-full h-12 rounded-xl bg-zinc-950 border border-zinc-800 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-600 mb-4"
        />
        <p className="text-[11px] uppercase tracking-wide text-zinc-500 mb-2">Target exam</p>
        <input
          value={profile.targetExam}
          onChange={(e) => setProfile((p) => ({ ...p, targetExam: e.target.value }))}
          className="w-full h-12 rounded-xl bg-zinc-950 border border-zinc-800 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-600"
        />
      </Card>

      <Card className="mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Palette size={16} className={ACCENTS[accent].text} />
          <p className="text-sm font-medium text-zinc-300">Accent color</p>
        </div>
        <div className="flex gap-3">
          {Object.entries(ACCENTS).map(([key, val]) => (
            <TapButton
              key={key}
              onClick={() => setProfile((p) => ({ ...p, accent: key }))}
              className={`flex-1 h-16 rounded-2xl border flex flex-col items-center justify-center gap-1.5 ${
                profile.accent === key ? val.borderBright : "border-zinc-800"
              }`}
              style={{
                backgroundColor: hexToRgba(ACCENT_HEX[key], profile.accent === key ? 0.15 : 0.05),
              }}
            >
              <span
                className="w-5 h-5 rounded-full"
                style={{
                  backgroundColor: ACCENT_HEX[key],
                  boxShadow: profile.accent === key ? glowStyle(ACCENT_HEX[key], 0.6).boxShadow : "none",
                }}
              />
              <span className="text-[11px] text-zinc-300 font-medium">{val.label}</span>
            </TapButton>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={16} className="text-rose-400" />
          <p className="text-sm font-medium text-zinc-300">Danger zone</p>
        </div>
        <p className="text-xs text-zinc-500 mb-4">
          This clears every saved quiz, study log, and exam from this device. It can't be undone.
        </p>
        {!confirmReset ? (
          <TapButton
            onClick={() => setConfirmReset(true)}
            className="w-full h-12 rounded-xl font-semibold text-rose-400 border border-rose-500/30 bg-rose-500/5"
          >
            Reset all data
          </TapButton>
        ) : (
          <div className="flex gap-3">
            <TapButton
              onClick={() => setConfirmReset(false)}
              className="flex-1 h-12 rounded-xl font-semibold text-zinc-300 border border-zinc-800 bg-zinc-900"
            >
              Cancel
            </TapButton>
            <TapButton
              onClick={onReset}
              className="flex-1 h-12 rounded-xl font-semibold text-zinc-950 bg-rose-500"
            >
              Confirm reset
            </TapButton>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Bottom navigation                                                    */
/* ------------------------------------------------------------------ */

function BottomNav({ view, setView, accent }) {
  const items = [
    { key: "quiz", label: "Quiz", icon: Calculator },
    { key: "study", label: "Study", icon: BookOpen },
    { key: "exams", label: "Exams", icon: CalendarClock },
    { key: "exercise", label: "Fitness", icon: Dumbbell },
    { key: "settings", label: "Settings", icon: SettingsIcon },
  ];
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 flex justify-center"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="w-full max-w-[480px] bg-zinc-950/90 backdrop-blur-lg border-t border-zinc-800/80 px-2 pt-2 pb-2 flex">
        {items.map((it) => {
          const active = view === it.key;
          const Icon = it.icon;
          return (
            <TapButton
              key={it.key}
              onClick={() => setView(it.key)}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded-2xl"
            >
              <div
                className={`w-11 h-8 rounded-xl flex items-center justify-center transition-colors ${
                  active ? ACCENTS[accent].bgSoft2 : ""
                }`}
              >
                <Icon
                  size={20}
                  strokeWidth={active ? 2.5 : 2}
                  className={active ? ACCENTS[accent].text : "text-zinc-500"}
                />
              </div>
              <span
                className={`text-[10.5px] font-medium ${
                  active ? ACCENTS[accent].textBright : "text-zinc-600"
                }`}
              >
                {it.label}
              </span>
            </TapButton>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Root App                                                             */
/* ------------------------------------------------------------------ */

export default function App() {
  const [data, setData] = useState(loadData);
  const firstRun = useRef(true);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      /* storage unavailable — fail silently */
    }
  }, [data]);

  const setView = (v) => setData((d) => ({ ...d, view: v }));
  const setProfile = (fn) => setData((d) => ({ ...d, profile: fn(d.profile) }));
  const setQuiz = (fn) => setData((d) => ({ ...d, quiz: fn(d.quiz) }));
  const setStudy = (fn) => setData((d) => ({ ...d, study: fn(d.study) }));
  const setExams = (fn) => setData((d) => ({ ...d, exams: typeof fn === "function" ? fn(d.exams) : fn }));
  const setExercise = (fn) => setData((d) => ({ ...d, exercise: fn(d.exercise) }));

  const accent = data.profile.accent;

  const handleReset = () => {
    const fresh = defaultData();
    setData(fresh);
  };

  const dismissBanner = () =>
    setData((d) => ({ ...d, installBannerDismissed: true }));

  return (
    <div
      className="min-h-screen w-full flex justify-center bg-black"
      style={{ overscrollBehaviorY: "none" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        .studify-root, .studify-root input, .studify-root button { font-family: 'Inter', -apple-system, sans-serif; }
        .studify-display { font-family: 'Space Grotesk', 'Inter', sans-serif; }
        .studify-root ::-webkit-scrollbar { display: none; }
        .studify-root input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); opacity: 0.6; }
      `}</style>

      <div className="studify-root w-full max-w-[480px] min-h-screen bg-zinc-950 relative flex flex-col">
        {/* Top status spacer + header */}
        <div style={{ paddingTop: "env(safe-area-inset-top)" }}>
          <div className="px-5 pt-4 pb-3 flex items-center justify-center relative">
            <p className="studify-display text-base font-bold text-zinc-100 tracking-tight text-center">
              {data.profile.targetExam || "Set target exam"}
            </p>
          </div>

          {!data.installBannerDismissed && (
            <div className="mx-5 mb-3 rounded-2xl bg-zinc-900/70 border border-zinc-800 px-4 py-3 flex items-center gap-3">
              <Sparkles size={16} className={ACCENTS[accent].text} />
              <p className="text-[11px] text-zinc-400 flex-1 leading-snug">
                Add Studify to your home screen for the full app experience.
              </p>
              <TapButton onClick={dismissBanner} className="text-zinc-500">
                <X size={15} />
              </TapButton>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 px-5 overflow-y-auto" style={{ paddingBottom: "110px" }}>
          {data.view === "quiz" && (
            <QuizDashboard quiz={data.quiz} setQuiz={setQuiz} accent={accent} />
          )}
          {data.view === "study" && (
            <StudyDashboard study={data.study} setStudy={setStudy} accent={accent} />
          )}
          {data.view === "exams" && (
            <ExamDashboard exams={data.exams} setExams={setExams} accent={accent} />
          )}
          {data.view === "exercise" && (
            <ExerciseDashboard exercise={data.exercise} setExercise={setExercise} accent={accent} />
          )}
          {data.view === "settings" && (
            <SettingsDashboard
              profile={data.profile}
              setProfile={setProfile}
              accent={accent}
              onReset={handleReset}
            />
          )}
        </div>

        <BottomNav view={data.view} setView={setView} accent={accent} />
      </div>
    </div>
  );
}
