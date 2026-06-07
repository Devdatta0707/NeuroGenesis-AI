import React from 'react';
import { motion } from 'framer-motion';
import { Dna } from 'lucide-react';

export const LoadingScreen: React.FC = () => (
  <div className="fixed inset-0 bg-[#0a0f1e] flex items-center justify-center z-50">
    {/* Background orbs */}
    <div className="absolute w-96 h-96 orb orb-blue opacity-30 top-1/4 left-1/4" />
    <div className="absolute w-64 h-64 orb orb-purple opacity-20 bottom-1/4 right-1/4" />

    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-6"
    >
      {/* Logo animation */}
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.4)]"
        >
          <Dna size={40} className="text-white" />
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-2xl bg-blue-500/20 blur-xl"
        />
      </div>

      <div className="text-center">
        <h1 className="text-2xl font-bold gradient-text mb-2">NeuroGenesis AI</h1>
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-slate-400 text-sm"
        >
          Initializing Biomedical AI Platform...
        </motion.p>
      </div>

      {/* Progress bar */}
      <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="h-full w-1/2 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full"
        />
      </div>
    </motion.div>
  </div>
);

export const PageLoader: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="flex items-center justify-center py-20">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-4"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center"
      >
        <Dna size={20} className="text-blue-400" />
      </motion.div>
      <p className="text-slate-400 text-sm">{message}</p>
    </motion.div>
  </div>
);
