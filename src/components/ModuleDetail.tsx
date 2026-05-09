import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Play, BookOpen, Terminal as TerminalIcon, CheckCircle, Award } from 'lucide-react';
import { Module } from '../types';
import TerminalSimulator from './TerminalSimulator';

interface ModuleDetailProps {
  module: Module;
  onClose: () => void;
  onComplete: () => void;
}

export default function ModuleDetail({ module, onClose, onComplete }: ModuleDetailProps) {
  const [currentStep, setCurrentStep] = useState(0); // 0: intro, 1..n: lessons, n+1: commands, n+2: quiz/lab, n+3: finished
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const totalSteps = module.lessons.length + (module.commands.length > 0 ? 1 : 0) + (module.quiz.length > 0 ? 1 : 0) + (module.lab ? 1 : 0);

  const next = () => setCurrentStep(prev => prev + 1);
  const prev = () => setCurrentStep(prev => Math.max(0, prev - 1));

  const handleQuizAnswer = (idx: number, correct: boolean) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    if (correct) setQuizScore(prev => prev + 1);
    
    setTimeout(() => {
      setSelectedAnswer(null);
      if (currentStep < totalSteps) next();
      else setQuizFinished(true);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 bg-[#000] flex flex-col"
    >
      {/* Header */}
      <div className="px-4 py-4 flex items-center justify-between border-b border-gray-800 shrink-0">
        <button onClick={onClose} className="p-2 -ml-2 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        <div className="flex-1 px-4">
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              className="h-full bg-green-500" 
            />
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs font-mono text-gray-500">
          <span>{currentStep}</span>
          <span>/</span>
          <span>{totalSteps}</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          {/* Lessons */}
          {currentStep >= 0 && currentStep < module.lessons.length && (
            <motion.div
              key={`lesson-${currentStep}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 max-w-lg mx-auto"
            >
              <div className="flex items-center gap-3 text-green-500">
                <BookOpen size={24} />
                <h2 className="text-sm font-bold uppercase tracking-widest">Lesson {currentStep + 1}</h2>
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight leading-tight">
                {module.lessons[currentStep].title}
              </h1>
              <div className="prose prose-invert max-w-none">
                <p className="text-lg text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {module.lessons[currentStep].content}
                </p>
              </div>
            </motion.div>
          )}

          {/* Commands Section */}
          {currentStep === module.lessons.length && module.commands.length > 0 && (
            <motion.div
              key="commands"
              className="space-y-6 max-w-lg mx-auto"
            >
              <div className="flex items-center gap-3 text-blue-500">
                <TerminalIcon size={24} />
                <h2 className="text-sm font-bold uppercase tracking-widest">Command Cheat Sheet</h2>
              </div>
              <div className="space-y-4">
                {module.commands.map((cmd, i) => (
                  <div key={i} className="p-4 bg-[#161b22] rounded-xl border border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                       <code className="text-green-400 font-bold px-2 py-0.5 bg-green-500/10 rounded">{cmd.name}</code>
                    </div>
                    <p className="text-sm text-gray-300 mb-3">{cmd.description}</p>
                    <div className="bg-black/50 p-2 rounded-lg font-mono text-xs text-gray-400">
                      $ {cmd.syntax}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Quiz Section */}
          {currentStep === (module.lessons.length + (module.commands.length > 0 ? 1 : 0)) && module.quiz.length > 0 && (
            <motion.div
              key="quiz"
              className="space-y-8 max-w-lg mx-auto"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 bg-yellow-500/10 text-yellow-500 rounded-2xl mb-2">
                  <Award size={32} />
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Mini Challenge</h2>
                <p className="text-gray-400">Test your knowledge to earn {module.moduleXp} XP.</p>
              </div>

              <div className="space-y-6">
                {module.quiz.map((q, qIdx) => (
                  <div key={q.id} className="space-y-4">
                    <p className="text-xl font-medium text-white">{q.question}</p>
                    <div className="grid gap-3">
                      {q.options.map((opt, i) => (
                        <button
                          key={i}
                          disabled={selectedAnswer !== null}
                          onClick={() => handleQuizAnswer(i, i === q.correctAnswer)}
                          className={`p-4 rounded-xl text-left transition-all border ${
                            selectedAnswer === i 
                              ? (i === q.correctAnswer ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-red-500/20 border-red-500 text-red-100')
                              : (selectedAnswer !== null && i === q.correctAnswer ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-700')
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Lab Section */}
          {currentStep === totalSteps - 1 && module.lab && (
            <motion.div key="lab" className="flex flex-col h-[70vh] gap-4">
              <div className="space-y-2 px-4">
                <h2 className="text-2xl font-bold text-white">Interactive Lab: {module.lab.title}</h2>
                <p className="text-gray-400 text-sm">{module.lab.description}</p>
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">Objective</p>
                  <p className="text-sm text-blue-100">{module.lab.objective}</p>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <TerminalSimulator />
              </div>
            </motion.div>
          )}

          {/* Finished Step */}
          {currentStep === totalSteps && (
            <motion.div key="finish" className="text-center py-12 space-y-6">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-24 h-24 bg-green-500 text-black rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(34,197,94,0.3)]"
              >
                <CheckCircle size={48} strokeWidth={3} />
              </motion.div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white">Module Perfected!</h2>
                <p className="text-gray-400">You earned +{module.moduleXp} XP</p>
              </div>
              <button
                onClick={() => {
                  onComplete();
                  onClose();
                }}
                className="px-8 py-3 bg-green-500 text-black font-bold rounded-full hover:bg-green-400 transition-colors"
              >
                Continue Adventure
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
      {currentStep < totalSteps && (
        <div className="p-4 border-t border-gray-800 bg-black/80 backdrop-blur-md flex gap-3">
          <button
            onClick={prev}
            disabled={currentStep === 0}
            className="p-4 rounded-2xl bg-gray-900 border border-gray-800 text-gray-400 disabled:opacity-30 disabled:grayscale transition-all active:scale-90"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={next}
            className="flex-1 p-4 bg-green-500 text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-green-400 transition-all active:scale-[0.98]"
          >
            {currentStep === totalSteps - 1 ? 'Finish Module' : 'Next Step'} <ChevronRight size={20} />
          </button>
        </div>
      )}
    </motion.div>
  );
}
