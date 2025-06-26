import React from 'react';
import { motion } from 'framer-motion';

const PrismLogo: React.FC<{ className?: string; size?: number }> = ({ 
  className = '', 
  size = 32 
}) => {
  return (
    <motion.div 
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      whileHover={{ scale: 1.1 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="drop-shadow-lg"
      >
        {/* Main Prism Triangle */}
        <defs>
          <linearGradient id="prismGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="50%" stopColor="#2a2a2a" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </linearGradient>
          <linearGradient id="rainbowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff0000" />
            <stop offset="16.66%" stopColor="#ff8000" />
            <stop offset="33.33%" stopColor="#ffff00" />
            <stop offset="50%" stopColor="#00ff00" />
            <stop offset="66.66%" stopColor="#0080ff" />
            <stop offset="83.33%" stopColor="#8000ff" />
            <stop offset="100%" stopColor="#ff0080" />
          </linearGradient>
        </defs>
        
        {/* Prism Triangle */}
        <polygon
          points="20,80 50,20 80,80"
          fill="url(#prismGradient)"
          stroke="#14b8a6"
          strokeWidth="1"
          className="drop-shadow-md"
        />
        
        {/* Light Ray Input */}
        <line
          x1="5"
          y1="50"
          x2="20"
          y2="50"
          stroke="#ffffff"
          strokeWidth="2"
          opacity="0.8"
        />
        
        {/* Rainbow Light Output */}
        <motion.g
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <line x1="80" y1="80" x2="95" y2="85" stroke="#ff0000" strokeWidth="1.5" />
          <line x1="80" y1="80" x2="95" y2="82" stroke="#ff8000" strokeWidth="1.5" />
          <line x1="80" y1="80" x2="95" y2="79" stroke="#ffff00" strokeWidth="1.5" />
          <line x1="80" y1="80" x2="95" y2="76" stroke="#00ff00" strokeWidth="1.5" />
          <line x1="80" y1="80" x2="95" y2="73" stroke="#0080ff" strokeWidth="1.5" />
          <line x1="80" y1="80" x2="95" y2="70" stroke="#8000ff" strokeWidth="1.5" />
        </motion.g>
      </svg>
    </motion.div>
  );
};

export default PrismLogo;