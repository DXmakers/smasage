"use client";

import React from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { cardInteractionVariants, cardSpring } from "../../lib/motion";

interface MotionCardProps extends Omit<HTMLMotionProps<"div">, "variants" | "initial" | "whileHover" | "whileTap" | "whileFocus" | "transition"> {
  children: React.ReactNode;
  /** Set to false for non-clickable tiles that should stay visually stable. */
  interactive?: boolean;
}

export function MotionCard({
  children,
  interactive = true,
  className,
  ...props
}: MotionCardProps) {
  const prefersReduced = useReducedMotion();

  if (!interactive || prefersReduced) {
    return (
      <motion.div
        className={["bento-card", className].filter(Boolean).join(" ")}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={["bento-card", className].filter(Boolean).join(" ")}
      variants={cardInteractionVariants}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      whileFocus="hover"
      transition={cardSpring}
      {...props}
    >
      {children}
    </motion.div>
  );
}
