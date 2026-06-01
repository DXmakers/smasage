import React from "react";
import { motion, useReducedMotion, HTMLMotionProps } from "framer-motion";

interface GlassPanelProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
}

export function GlassPanel({ children, className, ...props }: GlassPanelProps) {
  const prefersReduced = useReducedMotion();

  // When the user prefers reduced motion, skip the y-shift entrance and use
  // a simple opacity fade instead. Positional movement is decorative here.
  const defaultInitial = prefersReduced ? { opacity: 0 } : { opacity: 0, y: 20 };
  const defaultAnimate = { opacity: 1, y: 0 };
  const defaultTransition = prefersReduced
    ? { duration: 0.15 }
    : { duration: 0.4, ease: [0.4, 0, 0.2, 1] };

  return (
    <motion.div
      className={`glass-panel${className ? ` ${className}` : ""}`}
      // Default animations if not provided via variants
      initial={props.variants ? undefined : defaultInitial}
      animate={props.variants ? undefined : defaultAnimate}
      transition={props.variants ? undefined : defaultTransition}
      {...props}
    >
      {children}
    </motion.div>
  );
}
