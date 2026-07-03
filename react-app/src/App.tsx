import { AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useCallback, useEffect, useMemo, useState } from "react";
import coursesData from "./data/courses.json";
import questionsData from "./data/questions.json";
import { generateRecommendations } from "./lib/recommendationEngine";
import type { Answers, AppScreen, Course, Question, RecommendationResult } from "./types";
import { useTheme } from "./context/ThemeContext";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { QuestionScreen } from "./components/QuestionScreen";
import { LoadingScreen } from "./components/LoadingScreen";
import { ResultsScreen } from "./components/ResultsScreen";

const questions = questionsData as Question[];
const courses = coursesData as Course[];

const initialAnswers: Answers = {
  goal: null,
  qualification: null,
  status: null,
  careerType: [],
  timeline: null,
};

function fireConfetti() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#0089FF", "#33A1FF", "#00805C", "#FFA000"],
  });
}

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [screen, setScreen] = useState<AppScreen>("welcome");
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({ ...initialAnswers });
  const [result, setResult] = useState<RecommendationResult | null>(null);

  const currentQuestion = questions[stepIndex];

  const canProceed = useMemo(() => {
    if (!currentQuestion) return false;
    const val = answers[currentQuestion.id];
    if (currentQuestion.type === "multi") return Array.isArray(val) && val.length > 0;
    return val != null && val !== "";
  }, [answers, currentQuestion]);

  const handleSelect = useCallback((questionId: keyof Answers, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const handleToggleMulti = useCallback(
    (questionId: "careerType", option: string, maxSelect: number) => {
      setAnswers((prev) => {
        const current = [...prev.careerType];
        const idx = current.indexOf(option);
        if (idx >= 0) current.splice(idx, 1);
        else if (current.length < maxSelect) current.push(option);
        return { ...prev, [questionId]: current };
      });
    },
    []
  );

  const handleStart = () => {
    setScreen("question");
    setStepIndex(0);
  };

  const handleNext = () => {
    if (!canProceed) return;
    if (stepIndex < questions.length - 1) {
      setStepIndex((s) => s + 1);
      return;
    }
    setScreen("loading");
    setTimeout(() => {
      const recommendations = generateRecommendations(courses, answers);
      setResult(recommendations);
      setScreen("results");
      fireConfetti();
    }, 1800);
  };

  const handleBack = () => {
    if (stepIndex > 0) setStepIndex((s) => s - 1);
  };

  const handleRetake = () => {
    setAnswers({ ...initialAnswers });
    setStepIndex(0);
    setResult(null);
    setScreen("welcome");
  };

  useEffect(() => {
    const live = document.getElementById("sr-live");
    if (!live) return;
    if (screen === "question" && currentQuestion) {
      live.textContent = `Question ${stepIndex + 1} of ${questions.length}: ${currentQuestion.title}`;
    } else if (screen === "results") {
      live.textContent = "Your personalized career recommendations are ready.";
    }
  }, [screen, stepIndex, currentQuestion]);

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 bg-entri-mesh" aria-hidden="true" />

      <header className="relative z-10 flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-entri-blue to-blue-700 text-sm font-bold text-white shadow-md">
            E
          </div>
          <div>
            <p className="text-sm font-bold text-primary-text">Entri</p>
            <p className="text-[10px] font-medium text-subtext">AI Career Advisor</p>
          </div>
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          className="glass rounded-full px-3 py-2 text-xs font-semibold text-primary-text"
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>
      </header>

      <main className="relative z-10 mx-auto max-w-lg px-5 pb-10">
        <AnimatePresence mode="wait">
          {screen === "welcome" && <WelcomeScreen key="welcome" onStart={handleStart} />}
          {screen === "question" && currentQuestion && (
            <QuestionScreen
              key={`q-${stepIndex}`}
              question={currentQuestion}
              stepIndex={stepIndex}
              totalSteps={questions.length}
              answers={answers}
              onSelect={handleSelect}
              onToggleMulti={handleToggleMulti}
              onNext={handleNext}
              onBack={handleBack}
              canProceed={canProceed}
            />
          )}
          {screen === "loading" && <LoadingScreen key="loading" />}
          {screen === "results" && result && (
            <ResultsScreen key="results" result={result} onRetake={handleRetake} />
          )}
        </AnimatePresence>
      </main>

      <div id="sr-live" className="sr-only" aria-live="polite" aria-atomic="true" />
    </div>
  );
}
