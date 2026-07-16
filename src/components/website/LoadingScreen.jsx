import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import logoImg from '../../assets/profile.png';

const LoadingScreen = ({ isLoaded }) => {
  return (
    <AnimatePresence>
      {!isLoaded && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.8, ease: "easeInOut" }
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#FEF9E5]"
        >
          {/* Subtle Gold Gradient Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(166,124,0,0.1)_0%,transparent_70%)]" />
          
          <div className="relative flex flex-col items-center">
            {/* Logo with Pulse/Glow effect */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0, 1]
              }}
              transition={{ 
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                opacity: { duration: 0.5 }
              }}
              className="w-32 h-32 md:w-48 md:h-48 mb-8"
            >
              <img 
                src={logoImg} 
                alt="SDRS Logo" 
                className="w-full h-full object-contain" 
              />
            </motion.div>

            {/* Spinner */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="relative w-12 h-12"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-full h-full border-4 border-brand-gold/20 border-t-brand-gold rounded-full"
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-6 text-brand-red font-heading font-bold tracking-[0.2em] uppercase text-xs"
            >
              SDRS <span className="text-brand-text">Gold</span> Finance
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
