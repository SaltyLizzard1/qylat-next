'use client';

import { motion, MotionConfig } from 'framer-motion';

export default function RevealWrapper({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        viewport={{ once: true, margin: '-80px' }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}
