import { motion } from "framer-motion";

const MESSAGES = [
  "Analyzing your career profile…",
  "Matching skills with market demand…",
  "Finding your best learning paths…",
];

export function LoadingScreen() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center"
    >
      <div className="relative mb-8 h-20 w-20">
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-blue-container"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-entri-blue"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-2xl">✨</div>
      </div>

      <motion.div
        key={MESSAGES[0]}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.5 }}
      >
        <h2 className="mb-2 text-xl font-bold text-primary-text">AI is analyzing your answers</h2>
        <p className="text-sm text-subtext">{MESSAGES[0]}</p>
      </motion.div>

      <div className="mt-8 flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-entri-blue"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </motion.section>
  );
}
