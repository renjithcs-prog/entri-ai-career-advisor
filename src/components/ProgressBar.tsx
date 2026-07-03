import { motion } from "framer-motion";

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = Math.round((current / total) * 100);

  return (
    <div className="mb-6" role="group" aria-label={`Question ${current} of ${total}`}>
      <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-subtext">
        <span>Question {current} of {total}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-outline">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-entri-blue to-blue-400"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
