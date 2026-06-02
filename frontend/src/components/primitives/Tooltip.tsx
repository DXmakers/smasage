'use client';

import React, { useState, useId } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  placement?: TooltipPlacement;
}

export function Tooltip({ content, children, placement = 'top' }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const prefersReduced = useReducedMotion();
  const tooltipId = useId();

  const show = () => setVisible(true);
  const hide = () => setVisible(false);

  const {
    onMouseEnter: origMouseEnter,
    onMouseLeave: origMouseLeave,
    onFocus: origFocus,
    onBlur: origBlur,
  } = children.props as React.HTMLAttributes<HTMLElement>;

  const trigger = React.cloneElement(children, {
    'aria-describedby': visible ? tooltipId : undefined,
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => { origMouseEnter?.(e); show(); },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => { origMouseLeave?.(e); hide(); },
    onFocus: (e: React.FocusEvent<HTMLElement>) => { origFocus?.(e); show(); },
    onBlur: (e: React.FocusEvent<HTMLElement>) => { origBlur?.(e); hide(); },
  });

  const transition = { duration: prefersReduced ? 0.08 : 0.12, ease: 'easeOut' as const };

  return (
    <div className="tooltip-wrapper">
      {trigger}
      <AnimatePresence>
        {visible && (
          <div className={`tooltip-anchor tooltip-${placement}`}>
            <motion.div
              id={tooltipId}
              role="tooltip"
              className="tooltip-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={transition}
            >
              {content}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
