import { JSX } from "react";
import { Loader2 } from "lucide-react";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";

export type ButtonVariant = "primary" | "secondary";

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  loadingLabel?: string;
}

export function Button({
  variant = "primary",
  isLoading = false,
  disabled,
  className,
  children,
  loadingLabel = "Loading",
  ...rest
}: ButtonProps): JSX.Element {
  const prefersReduced = useReducedMotion();
  const classes = ["btn", `btn-${variant}`, className].filter(Boolean).join(" ");

  // Omit motion-conflicting props from rest to avoid type mismatches with motion.button
  const motionProps: Record<string, unknown> = { ...rest } as unknown as Record<string, unknown>;
  delete motionProps.onAnimationStart;
  delete motionProps.onDrag;
  delete motionProps.onDragEnd;
  delete motionProps.onDragStart;
  delete motionProps.style;

  // Decorative scale interactions are disabled for reduced-motion users.
  // The button still shows :active via CSS (transform: scale(0.95)) which is
  // a CSS-only affordance that browsers can suppress via their own UA sheet.
  const hoverProp = !prefersReduced && !disabled && !isLoading ? { scale: 1.02 } : undefined;
  const tapProp = !prefersReduced && !disabled && !isLoading ? { scale: 0.98 } : undefined;
  const transitionProp = prefersReduced
    ? { duration: 0.01 }
    : { duration: 0.15, ease: "easeInOut" };

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
          <Loader2
            className="btn-loader"
            size={18}
            aria-hidden="true"
          />
        </motion.span>
      ) : null}
    </motion.button>
  );
}
