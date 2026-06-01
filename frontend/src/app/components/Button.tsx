import type { ButtonHTMLAttributes, JSX } from "react";
import { motion } from "framer-motion";

export type ButtonVariant = "primary" | "secondary";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
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
  const classes = ["btn", `btn-${variant}`, className].filter(Boolean).join(" ");

  return (
    <motion.button
      className={classes}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      aria-label={isLoading ? loadingLabel : rest["aria-label"]}
      whileHover={!disabled && !isLoading ? { scale: 1.02 } : undefined}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.15, ease: "easeInOut" }}
      {...rest}
    >
      <motion.span
        className="btn-content"
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.span>
      {isLoading ? (
        <motion.span
          className="btn-loader-wrap"
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <motion.svg
            className="btn-loader"
            viewBox="0 0 24 24"
            fill="none"
            focusable="false"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
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
