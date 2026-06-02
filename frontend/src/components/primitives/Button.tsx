import type { JSX } from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { buttonSpring } from "../../lib/motion";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingLabel?: string;
  icon?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  icon = false,
  disabled,
  className,
  children,
  loadingLabel = "Loading",
  ...rest
}: ButtonProps): JSX.Element {
  const prefersReduced = useReducedMotion();

  const sizeClass = size !== "md" ? `btn-${size}` : "";
  const iconClass = icon ? "btn-icon" : "";
  const classes = ["btn", `btn-${variant}`, sizeClass, iconClass, className]
    .filter(Boolean)
    .join(" ");

  // Omit motion-conflicting props to avoid type mismatches with motion.button
  const motionProps: Record<string, unknown> = {
    ...rest,
  } as unknown as Record<string, unknown>;
  delete motionProps.onAnimationStart;
  delete motionProps.onDrag;
  delete motionProps.onDragEnd;
  delete motionProps.onDragStart;
  delete motionProps.style;

  const isInteractive = !prefersReduced && !disabled && !isLoading;

  // Tactile spring: hover lifts slightly, tap compresses with spring rebound.
  const hoverProp = isInteractive ? { scale: 1.03 } : undefined;
  const tapProp = isInteractive ? { scale: 0.95 } : undefined;
  const transitionProp = prefersReduced ? { duration: 0.01 } : buttonSpring;

  return (
    <motion.button
      className={classes}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      aria-label={isLoading ? loadingLabel : rest["aria-label"]}
      whileHover={hoverProp}
      whileTap={tapProp}
      transition={transitionProp}
      {...(motionProps as HTMLMotionProps<"button">)}
    >
      <motion.span
        className="btn-content"
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={prefersReduced ? { duration: 0.01 } : { duration: 0.2 }}
      >
        {children}
      </motion.span>
      {isLoading ? (
        <motion.span
          className="btn-loader-wrap"
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={prefersReduced ? { duration: 0.01 } : { duration: 0.2 }}
        >
          <motion.svg
            className="btn-loader"
            viewBox="0 0 24 24"
            fill="none"
            focusable="false"
            // Spinner rotation is functional feedback, not purely decorative —
            // keep it but slow it down for reduced motion.
            animate={{ rotate: 360 }}
            transition={
              prefersReduced
                ? { duration: 2, repeat: Infinity, ease: "linear" }
                : { duration: 0.8, repeat: Infinity, ease: "linear" }
            }
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="56.5"
              strokeDashoffset="18"
            />
          </motion.svg>
        </motion.span>
      ) : null}
    </motion.button>
  );
}
