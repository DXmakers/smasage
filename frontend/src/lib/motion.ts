import type { Transition, Variants } from "framer-motion";

/** Spring preset for tactile card interactions — not linear, feels physical. */
export const cardSpring: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 28,
  mass: 0.6,
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
