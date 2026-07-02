import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', hoverEffect = false, delay = 0, style = {} }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.4, 0, 0.2, 1] }}
      className={`glass-panel ${hoverEffect ? 'glass-panel-hover' : ''} ${className}`}
      style={style}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
