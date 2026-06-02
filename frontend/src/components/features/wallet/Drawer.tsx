'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, title, children }) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      // Prevent scrolling when drawer is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Focus management: focus the close button when opened
  useEffect(() => {
    if (isOpen) {
      const closeButton = drawerRef.current?.querySelector('button');
      closeButton?.focus();
    }
  }, [isOpen]);

  // Reduced-motion: slide is decorative — use opacity fade instead.
  // The drawer still opens/closes (functional), just without the x-axis movement.
  const drawerInitial = prefersReduced ? { opacity: 0 } : { x: '100%' };
  const drawerAnimate = prefersReduced ? { opacity: 1, x: 0 } : { x: 0 };
  const drawerExit = prefersReduced ? { opacity: 0 } : { x: '100%' };
  const drawerTransition = prefersReduced
    ? { duration: 0.15 }
    : { type: 'spring' as const, damping: 25, stiffness: 200 };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={prefersReduced ? { duration: 0.12 } : { duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <motion.div
            ref={drawerRef}
            className="drawer-content"
            initial={drawerInitial}
            animate={drawerAnimate}
            exit={drawerExit}
            transition={drawerTransition}
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
          >
            <div className="drawer-header">
              <h2 id="drawer-title" className="drawer-title">{title}</h2>
              <button
                className="drawer-close-btn"
                onClick={onClose}
                aria-label="Close drawer"
                title="Close drawer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="drawer-body">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
