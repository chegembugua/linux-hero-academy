import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal as TerminalIcon, Search, Info, Brain, Sparkles, AlertCircle } from 'lucide-react';
import { useTerminal } from '../hooks/useTerminal';
import { getLocalMentorFeedback, MentorFeedback } from '../services/mentorService';

export default function TerminalSimulator() {
  const { cwd, output, execute, history, allCommands } = useTerminal();
  const [input, setInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [mentorFeedback, setMentorFeedback] = useState<MentorFeedback | null>(null);
  const [isMentorLoading, setIsMentorLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output, mentorFeedback]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmdLine = input.trim();
    if (!cmdLine) return;
    
    const [cmdName] = cmdLine.split(' ');
    const cmdData = allCommands[cmdName];
    
    execute(cmdLine);
    setInput('');
    setHistoryIndex(-1);
    
    // Mentor Logic
    setIsMentorLoading(true);
    const feedback = await getMentorFeedback(cmdLine, "output", {
      moduleTitle: "Sandbox",
      objective: "Experimenting with terminal",
      history: history,
      commonMistakes: cmdData?.commonMistakes
    });
    setMentorFeedback(feedback);
    setIsMentorLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      if (history.length > 0 && newIndex >= 0) {
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex < history.length) {
          setHistoryIndex(newIndex);
          setInput(history[newIndex]);
        } else {
          setHistoryIndex(-1);
          setInput('');
        }
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-[#c9d1d9] font-mono rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-bottom border-gray-800">
        <div className="flex items-center gap-2">
          <TerminalIcon size={16} className="text-green-500" />
          <span className="text-xs font-semibold text-gray-400">bash — 80x24</span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/50" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
          <div className="w-3 h-3 rounded-full bg-green-500/50" />
        </div>
      </div>

      {/* Output Area */}
      <div 
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto space-y-2 selection:bg-green-500/30"
      >
        <div className="text-gray-500 text-xs mb-4">
          Linux Hero Terminal v1.0.0 (tty1)<br />
          Type 'help' for available commands.
        </div>
        
        {/* Mentor Feedback Area */}
        <AnimatePresence>
          {mentorFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`p-4 rounded-xl border mb-4 flex gap-4 ${
                mentorFeedback.type === 'correction' 
                  ? 'bg-red-500/5 border-red-500/20 text-red-200' 
                  : 'bg-green-500/5 border-green-500/20 text-green-200'
              }`}
            >
              <div className="shrink-0 pt-1">
                {mentorFeedback.type === 'correction' ? <AlertCircle size={18} className="text-red-500" /> : <Brain size={18} className="text-green-500" />}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">
                    Pro Mentor Feedback
                  </span>
                  {isMentorLoading && (
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="text-green-500/50"
                    >
                      <Sparkles size={10} />
                    </motion.div>
                  )}
                </div>
                <p className="text-sm leading-relaxed">{mentorFeedback.message}</p>
                {mentorFeedback.suggestion && (
                  <button 
                    onClick={() => execute(mentorFeedback.suggestion!)}
                    className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded font-mono transition-colors"
                  >
                    Try: {mentorFeedback.suggestion}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {output.map((line, i) => (
          <div key={i} className="animate-in fade-in slide-in-from-left-2 duration-200">
            {line.type === 'input' ? (
              <div className="flex gap-2 items-center">
                <span className="text-green-400 font-bold">user@linuxhero</span>
                <span className="text-blue-400">:{line.dir}</span>
                <span className="text-white">$</span>
                <span className="text-white">{line.text}</span>
              </div>
            ) : line.type === 'info' && line.commandData ? (
              <div className="my-4 p-4 bg-slate-900/80 rounded-xl border border-blue-500/30 overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                  <TerminalIcon size={40} />
                </div>
                
                <div className="flex items-center gap-2 text-blue-400 mb-3">
                  <div className="p-1.5 bg-blue-500/10 rounded-lg">
                    <Info size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black uppercase tracking-[0.2em] text-[10px]">Reference Guide</span>
                    <span className="text-lg font-bold text-white leading-none mt-1">{line.commandData.name}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                    <p className="text-sm text-blue-100/90 leading-relaxed font-medium">{line.commandData.description}</p>
                    <p className="text-xs text-gray-500 italic mt-2 border-l-2 border-gray-700 pl-3">— "{line.commandData.analogy}"</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Usage Syntax</span>
                      </div>
                      <code className="block w-full text-green-400 text-xs bg-green-500/10 px-3 py-2 rounded-lg font-mono border border-green-500/20">
                        {line.commandData.syntax}
                      </code>
                    </div>

                    {line.commandData.realWorldUsage && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-blue-500/70 uppercase font-bold tracking-widest">In the Cloud</span>
                        <div className="text-xs text-gray-300 leading-relaxed bg-blue-500/5 p-3 rounded-lg border border-blue-500/10">
                          {line.commandData.realWorldUsage}
                        </div>
                      </div>
                    )}
                  </div>

                  {line.commandData.commonMistakes && line.commandData.commonMistakes.length > 0 && (
                    <div className="bg-red-500/5 border border-red-500/10 p-3 rounded-lg">
                      <span className="text-[10px] text-red-500/70 uppercase font-bold tracking-widest mb-2 block">Traps to Avoid</span>
                      <ul className="space-y-1">
                        {line.commandData.commonMistakes.map((mistake, idx) => (
                          <li key={idx} className="text-xs text-red-200/60 flex gap-2">
                            <span className="text-red-500/50">•</span>
                            {mistake}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {line.commandData.examples.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2 block">Quick Lab Tasks</span>
                      <div className="flex flex-wrap gap-2">
                        {line.commandData.examples.map((ex, idx) => (
                          <button 
                            key={idx} 
                            onClick={() => execute(ex)}
                            className="group/btn flex items-center gap-2 text-green-400/80 text-[11px] bg-white/5 hover:bg-green-500/10 border border-white/10 hover:border-green-500/30 px-3 py-1.5 rounded-lg transition-all active:scale-95"
                          >
                            <span className="text-gray-600 group-hover/btn:text-green-500/50 font-bold">$</span>
                            {ex}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="pl-0 whitespace-pre-wrap leading-relaxed text-[#8b949e]">
                {line.text}
              </div>
            )}
          </div>
        ))}

        {/* Input Line */}
        <form onSubmit={handleSubmit} className="flex gap-2 items-center relative">
          <span className="text-green-400 font-bold shrink-0">user@linuxhero</span>
          <span className="text-blue-400 shrink-0">:{cwd}</span>
          <span className="text-white font-bold shrink-0">$</span>
          <input
            type="text"
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-white selection:bg-green-500/30 w-full"
            spellCheck={false}
            autoComplete="off"
            onKeyDown={handleKeyDown}
            id="terminal-input"
          />
        </form>
      </div>

      {/* Quick Suggestions (Mobile Friendly) */}
      <div className="flex gap-2 p-3 bg-[#161b22] border-t border-gray-800 overflow-x-auto no-scrollbar">
        {['pwd', 'ls', 'whoami', 'help', 'clear', 'cd ..', 'ls -la'].map((cmd) => (
          <button
            key={cmd}
            onClick={() => execute(cmd)}
            className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-xs rounded-lg transition-colors whitespace-nowrap active:scale-95"
          >
            {cmd}
          </button>
        ))}
      </div>
    </div>
  );
}
