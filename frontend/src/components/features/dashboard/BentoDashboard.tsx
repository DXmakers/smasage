'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { makeContainerVariants, makeEntranceVariants } from '../../../lib/motion';

export interface BentoDashboardProps {
  metrics: React.ReactNode;
  goalProgress: React.ReactNode;
  chart: React.ReactNode;
  agent: React.ReactNode;
  wallet?: React.ReactNode;
  status?: React.ReactNode;
}

export function BentoDashboard({
  metrics,
  goalProgress,
  chart,
  agent,
  wallet,
  status,
}: BentoDashboardProps) {
  const prefersReduced = useReducedMotion();
  const containerVariants = makeContainerVariants(!!prefersReduced);
  const itemVariants = makeEntranceVariants(!!prefersReduced);

  return (
    <motion.div
      className="bento-grid"
      aria-label="Portfolio dashboard"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="bento-area-metrics" variants={itemVariants}>
        {metrics}
      </motion.div>

      <motion.div className="bento-area-goal" variants={itemVariants}>
        {goalProgress}
      </motion.div>

      <motion.div className="bento-area-chart" variants={itemVariants}>
        {chart}
      </motion.div>

      {wallet && (
        <motion.div className="bento-area-wallet" variants={itemVariants}>
          {wallet}
        </motion.div>
      )}

      {status && (
        <motion.div className="bento-area-status" variants={itemVariants}>
          {status}
        </motion.div>
      )}

      <motion.div className="bento-area-agent" variants={itemVariants}>
        {agent}
      </motion.div>
    </motion.div>
  );
}
