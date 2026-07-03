import { motion } from "framer-motion";
import { Button } from "./Button";

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[70vh] flex-col items-center justify-center px-2 text-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-entri-blue to-blue-700 text-4xl shadow-xl shadow-blue-500/30"
      >
        🎯
      </motion.div>

      <h1 className="mb-4 text-3xl font-bold leading-tight text-primary-text md:text-4xl">
        Find Your Perfect Career Path
      </h1>

      <p className="mb-2 max-w-md text-base leading-relaxed text-subtext md:text-lg">
        Answer a few quick questions and our AI Career Advisor will recommend the best learning path for you.
      </p>

      <p className="mb-8 text-sm font-medium text-entri-blue">⏱ Estimated time: 60 Seconds</p>

      <Button onClick={onStart} className="min-w-[200px]">
        Get Started
      </Button>
    </motion.section>
  );
}
