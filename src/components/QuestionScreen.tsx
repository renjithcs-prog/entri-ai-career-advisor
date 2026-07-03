import { AnimatePresence, motion } from "framer-motion";
import type { Answers, Question } from "../types";
import { Button } from "./Button";
import { ProgressBar } from "./ProgressBar";

interface QuestionScreenProps {
  question: Question;
  stepIndex: number;
  totalSteps: number;
  answers: Answers;
  onSelect: (questionId: keyof Answers, value: string) => void;
  onToggleMulti: (questionId: "careerType", option: string, maxSelect: number) => void;
  onNext: () => void;
  onBack: () => void;
  canProceed: boolean;
}

export function QuestionScreen({
  question,
  stepIndex,
  totalSteps,
  answers,
  onSelect,
  onToggleMulti,
  onNext,
  onBack,
  canProceed,
}: QuestionScreenProps) {
  const isMulti = question.type === "multi";
  const answer = answers[question.id];
  const maxSelect = question.maxSelect ?? 2;
  const selectedMulti = isMulti ? (answer as string[]) : [];
  const atMax = isMulti && selectedMulti.length >= maxSelect;

  return (
    <AnimatePresence mode="wait">
      <motion.section
        key={question.id}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.3 }}
        className="py-4"
      >
        <ProgressBar current={stepIndex + 1} total={totalSteps} />

        <h2 id="question-title" className="mb-2 text-2xl font-bold text-primary-text">{question.title}</h2>
        {question.subtitle && (
          <p className="mb-5 text-sm text-subtext">{question.subtitle}</p>
        )}

        <div
          className="mb-8 flex flex-col gap-3"
          role={isMulti ? "group" : "radiogroup"}
          aria-labelledby="question-title"
        >
          {question.options.map((option) => {
            const selected = isMulti
              ? selectedMulti.includes(option)
              : answer === option;
            const disabled = isMulti && atMax && !selected;

            return (
              <motion.button
                key={option}
                type="button"
                whileTap={disabled ? undefined : { scale: 0.99 }}
                disabled={disabled}
                aria-pressed={selected}
                onClick={() =>
                  isMulti
                    ? onToggleMulti("careerType", option, maxSelect)
                    : onSelect(question.id, option)
                }
                className={`rounded-2xl border-2 px-4 py-4 text-left text-sm font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-entri-blue ${
                  selected
                    ? "border-entri-blue bg-blue-container text-on-blue-container shadow-md shadow-blue-500/10"
                    : "border-surface-outline bg-primary-container text-primary-text hover:border-entri-blue/40"
                } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
              >
                {option}
              </motion.button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {stepIndex > 0 && (
            <Button variant="ghost" onClick={onBack}>
              Back
            </Button>
          )}
          <Button onClick={onNext} disabled={!canProceed} className="flex-1">
            {stepIndex === totalSteps - 1 ? "See My Recommendations" : "Next"}
          </Button>
        </div>
      </motion.section>
    </AnimatePresence>
  );
}
