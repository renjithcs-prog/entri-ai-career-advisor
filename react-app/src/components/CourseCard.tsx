import { motion } from "framer-motion";
import type { IndicatorLevel } from "../types";

function indicatorColor(level: IndicatorLevel): string {
  if (level === "High") return "text-entri-green bg-green-container";
  if (level === "Growing") return "text-entri-orange bg-orange-container";
  return "text-subtext bg-secondary-container";
}

interface CourseCardProps {
  title: string;
  whyFits: string;
  careerOpportunities: string[];
  demand: IndicatorLevel;
  growth: IndicatorLevel;
  category: string[];
  compact?: boolean;
  index?: number;
}

export function CourseCard({
  title,
  whyFits,
  careerOpportunities,
  demand,
  growth,
  category,
  compact = false,
  index = 0,
}: CourseCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className={`glass rounded-2xl p-5 shadow-entri ${compact ? "" : "border border-surface-outline/60"}`}
    >
      <div className="mb-3 flex flex-wrap gap-2">
        {category.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-blue-container px-2.5 py-0.5 text-[11px] font-semibold text-on-blue-container"
          >
            {tag}
          </span>
        ))}
      </div>

      <h3 className="mb-2 text-lg font-bold text-primary-text">{title}</h3>

      <p className="mb-4 text-sm leading-relaxed text-subtext">
        <span className="font-semibold text-primary-text">Why this course suits you: </span>
        {whyFits}
      </p>

      {!compact && (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-secondary-container p-3">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-subtext">
                Career Opportunities
              </p>
              <p className="text-xs leading-relaxed text-primary-text">
                {careerOpportunities.slice(0, 3).join(" · ")}
              </p>
            </div>
            <div className="rounded-xl bg-secondary-container p-3">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-subtext">
                Demand · Growth
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${indicatorColor(demand)}`}>
                  {demand} Demand
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${indicatorColor(growth)}`}>
                  {growth} Growth
                </span>
              </div>
            </div>
          </div>

          <motion.a
            href="#"
            whileTap={{ scale: 0.98 }}
            onClick={(e) => e.preventDefault()}
            className="flex w-full items-center justify-center rounded-full bg-gradient-to-r from-entri-blue to-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20"
          >
            Explore Course
          </motion.a>
        </>
      )}
    </motion.article>
  );
}
