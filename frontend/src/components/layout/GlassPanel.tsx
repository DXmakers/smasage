import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface GlassPanelProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
}

export function GlassPanel({ children, className, ...props }: GlassPanelProps) {
  return (
    <motion.div
      className={`glass-panel${className ? ` ${className}` : ""}`}
      // Default animations if not provided via variants
      initial={props.variants ? undefined : { opacity: 0, y: 20 }}
      animate={props.variants ? undefined : { opacity: 1, y: 0 }}
      transition={props.variants ? undefined : { duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
