import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: "primary" | "ghost" | "outline" | "glass";
  children: ReactNode;
}

export function Button({ variant = "primary", children, className = "", ...props }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold tracking-wide transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-entri-blue disabled:opacity-40 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-gradient-to-r from-entri-blue to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:brightness-110",
    ghost: "bg-transparent text-subtext hover:text-primary-text",
    outline:
      "border-2 border-entri-blue text-entri-blue bg-transparent hover:bg-blue-container",
    glass:
      "glass text-primary-text border border-white/20 hover:bg-white/10 dark:hover:bg-white/5",
  };

  return (
    <motion.button
      whileTap={{ scale: props.disabled ? 1 : 0.98 }}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
