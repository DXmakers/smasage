import type { Transition, Variants } from "framer-motion";

/** Spring preset for tactile card interactions — not linear, feels physical. */
export const cardSpring: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 28,
  mass: 0.6,
};

/**
 * Snappier spring for buttons — faster response than cards so press feedback
 * is immediate, with a slight overshoot that reads as "springy" not "bouncy".
 */
export const buttonSpring: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 40,
  mass: 0.4,
};

/** Hover + press variants for the revamp Button primitive. */
export const buttonVariants: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.03, transition: buttonSpring },
  tap: { scale: 0.95, transition: buttonSpring },
};

/** Hover + press variants for clickable dashboard cards. */
export const cardInteractionVariants: Variants = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.018, y: -3, transition: cardSpring },
  tap: { scale: 0.975, y: 0, transition: cardSpring },
};

/** Focus-visible styles mirror the hover affordance via CSS; this variant
 *  keeps layout stable (no extra y shift) so focused-but-not-hovered cards
 *  don't confuse sighted keyboard users.
 */
export const cardFocusVariants: Variants = {
  rest: { scale: 1 },
  focus: { scale: 1.012, transition: cardSpring },
};

/**
 * Instant transition — used when the user prefers reduced motion.
 * Duration is near-zero so state changes are still communicated without
 * decorative movement.
 */
export const reducedTransition: Transition = {
  duration: 0.01,
};

/**
 * Returns entrance variants that respect the user's motion preference.
 *
 * - Full motion: fade + slide up (opacity + y)
 * - Reduced motion: fade only (opacity), no positional shift
 */
export function makeEntranceVariants(prefersReduced: boolean): Variants {
  if (prefersReduced) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.15 } },
    };
  }
  return {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
    },
  };
}

/**
 * Returns stagger container variants that respect the user's motion preference.
 *
 * - Full motion: staggered children
 * - Reduced motion: no stagger, children appear together
 */
export function makeContainerVariants(prefersReduced: boolean): Variants {
  if (prefersReduced) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.15 } },
    };
  }
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };
}
