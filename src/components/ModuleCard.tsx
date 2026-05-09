import { motion } from 'motion/react';
import { CheckCircle2, ChevronRight, Lock } from 'lucide-react';
import { Module } from '../types';

interface ModuleCardProps {
  key?: string;
  module: Module;
  isLocked: boolean;
  isCompleted: boolean;
  onClick: () => void;
}

export default function ModuleCard({ module, isLocked, isCompleted, onClick }: ModuleCardProps) {
  return (
    <motion.button
      whileTap={isLocked ? {} : { scale: 0.98 }}
      onClick={isLocked ? undefined : onClick}
      className={`w-full p-4 rounded-2xl flex items-center gap-4 border text-left transition-all relative overflow-hidden ${
        isLocked 
          ? 'bg-gray-900/40 border-gray-800 opacity-60 grayscale cursor-not-allowed' 
          : 'bg-[#1c1c1e] border-gray-800/50 hover:border-green-500/30'
      }`}
    >
      {/* Icon */}
      <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
        isLocked ? 'bg-gray-800 text-gray-500' : 'bg-green-500/10 text-green-500'
      }`}>
        {isLocked ? <Lock size={20} /> : <div className="text-xl">bash</div>}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-white tracking-tight truncate">{module.title}</h3>
          {isCompleted && <CheckCircle2 size={16} className="text-green-500 fill-green-500/10 shrink-0" />}
        </div>
        <p className="text-xs text-gray-400 line-clamp-1">{module.shortDescription}</p>
      </div>

      {/* Action */}
      {!isLocked && (
        <div className="w-8 h-8 rounded-full bg-gray-800/50 flex items-center justify-center">
          <ChevronRight size={16} className="text-gray-400" />
        </div>
      )}

      {/* Progress Bar (if active) */}
      {!isLocked && !isCompleted && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-800">
          <div className="h-full bg-green-500" style={{ width: '0%' }} />
        </div>
      )}
    </motion.button>
  );
}
