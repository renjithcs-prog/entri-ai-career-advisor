import { motion } from "framer-motion";
import type { RecommendationResult } from "../types";
import { CourseCard } from "./CourseCard";
import { Button } from "./Button";

interface ResultsScreenProps {
  result: RecommendationResult;
  onRetake: () => void;
}

const FUTURE_FEATURES = [
  { icon: "📄", label: "Resume Builder", soon: true },
  { icon: "💬", label: "Talk to an Expert", soon: true },
  { icon: "📱", label: "WhatsApp Recommendation", soon: true },
  { icon: "💼", label: "Entri Jobs", soon: true },
  { icon: "📥", label: "Download Report", soon: true },
];

export function ResultsScreen({ result, onRetake }: ResultsScreenProps) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-8"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-6 text-center"
      >
        <span className="mb-3 inline-block rounded-full bg-green-container px-4 py-1 text-sm font-bold text-on-green-container">
          🎉 Congratulations!
        </span>
        <h2 className="mb-2 text-2xl font-bold text-primary-text md:text-3xl">
          Based on your profile, here are your best career paths
        </h2>
        <p className="text-sm text-subtext">{result.profileNarrative}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass mb-8 rounded-2xl border border-entri-blue/20 p-5"
      >
        <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-entri-blue">
          Your Career Summary
        </h3>
        <p className="text-sm leading-relaxed text-primary-text">{result.personalSummary}</p>
      </motion.div>

      <div className="mb-8 space-y-4">
        {result.topPicks.map((item, i) => (
          <CourseCard
            key={item.course.id}
            index={i}
            title={item.course.title}
            whyFits={item.whyFits}
            careerOpportunities={item.course.careerOpportunities}
            demand={item.course.demandIndicator}
            growth={item.course.futureGrowthIndicator}
            category={item.course.category}
          />
        ))}
      </div>

      {result.alsoLike.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-bold text-primary-text">You may also like</h3>
          <div className="space-y-3">
            {result.alsoLike.map((item, i) => (
              <CourseCard
                key={item.course.id}
                compact
                index={i}
                title={item.course.title}
                whyFits={item.whyFits}
                careerOpportunities={item.course.careerOpportunities}
                demand={item.course.demandIndicator}
                growth={item.course.futureGrowthIndicator}
                category={item.course.category}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mb-8">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-subtext">
          Coming Soon
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {FUTURE_FEATURES.map((feature) => (
            <button
              key={feature.label}
              type="button"
              disabled
              className="glass flex flex-col items-center gap-2 rounded-2xl border border-dashed border-surface-outline p-4 text-center opacity-70"
              title="Coming soon"
            >
              <span className="text-2xl">{feature.icon}</span>
              <span className="text-xs font-semibold text-primary-text">{feature.label}</span>
              <span className="rounded-full bg-orange-container px-2 py-0.5 text-[10px] font-bold text-on-orange-container">
                Soon
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="text-center">
        <Button variant="ghost" onClick={onRetake}>
          Retake Quiz
        </Button>
      </div>
    </motion.section>
  );
}
