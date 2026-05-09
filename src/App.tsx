import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal as TerminalIcon, Home, User, BookOpen, Star, Trophy, Flame, Lock } from 'lucide-react';
import { useProgress } from './hooks/useProgress';
import { useTerminal } from './hooks/useTerminal';
import { MODULES } from './data/modules';
import ModuleCard from './components/ModuleCard';
import ModuleDetail from './components/ModuleDetail';
import TerminalSimulator from './components/TerminalSimulator';
import FileVisualizer from './components/FileVisualizer';

import DailyRoutine from './components/DailyRoutine';
import InfrastructureScenarios from './components/InfrastructureScenarios';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'terminal' | 'roadmap' | 'profile'>('home');
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const { progress, completeModule } = useProgress();

  const selectedModule = MODULES.find(m => m.id === selectedModuleId);

  return (
    <div className="min-h-screen bg-[#000] text-white flex flex-col lg:flex-row relative overflow-hidden font-sans">
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
         <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-green-500/10 blur-[120px] rounded-full" />
         <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Desktop Sidebar Navigation */}
      <aside className="w-full lg:w-64 bg-[#0d1117] border-r border-gray-800 z-30 flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3">
           <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center text-black font-black">L</div>
           <h1 className="font-bold tracking-tight text-white">Linux Hero</h1>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <SidebarButton 
            icon={<Home size={18} />} 
            label="Dashboard" 
            active={activeTab === 'home'} 
            onClick={() => setActiveTab('home')} 
          />
          <SidebarButton 
            icon={<BookOpen size={18} />} 
            label="Learning Path" 
            active={activeTab === 'roadmap'} 
            onClick={() => setActiveTab('roadmap')} 
          />
          <SidebarButton 
            icon={<TerminalIcon size={18} />} 
            label="Sandbox Terminal" 
            active={activeTab === 'terminal'} 
            onClick={() => setActiveTab('terminal')} 
          />
          <SidebarButton 
            icon={<User size={18} />} 
            label="Profile" 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')} 
          />
        </nav>

        <div className="p-4 mt-auto border-t border-gray-800">
          <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-xl">
             <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-500 font-bold">
               {progress.level}
             </div>
             <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Level {progress.level}</p>
                <div className="w-24 h-1.5 bg-gray-800 rounded-full mt-1 overflow-hidden">
                   <div className="h-full bg-green-500" style={{ width: `${(progress.xp % 500) / 5}%` }} />
                </div>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative z-10 flex flex-col h-screen">
        <header className="h-16 border-b border-gray-800 flex items-center justify-between px-8 bg-black/50 backdrop-blur-md sticky top-0 z-20">
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-full text-xs font-bold">
                 <Flame size={14} className="fill-orange-500" />
                 {progress.streak} Day Streak
              </div>
              <div className="h-4 w-px bg-gray-800" />
              <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                 <span className="text-green-500 font-bold">{progress.xp} XP</span>
              </div>
           </div>
           
           <div className="flex items-center gap-4">
              <button className="text-gray-400 hover:text-white transition-colors">
                 <Trophy size={20} />
              </button>
              <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 overflow-hidden">
                 <div className="w-full h-full flex items-center justify-center">👤</div>
              </div>
           </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto w-full flex-1">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   <div className="lg:col-span-2 space-y-8">
                      <section className="p-10 bg-gradient-to-br from-green-500/20 to-transparent border border-green-500/30 rounded-[32px] relative overflow-hidden group">
                         <div className="relative z-10 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500 text-black text-[10px] font-black uppercase tracking-widest rounded-full">
                               Professional Edition
                            </div>
                            <h2 className="text-5xl font-bold text-white tracking-tight leading-[0.9]">Experience<br />the <span className="text-green-500">Cloud Journey.</span></h2>
                            <p className="text-gray-400 max-w-md text-lg">Master Linux, Bash, and DevOps through focused 1-hour daily sessions designed for future infrastructure architects.</p>
                            <div className="flex gap-4">
                               <button 
                                 onClick={() => setActiveTab('roadmap')}
                                 className="px-8 py-4 bg-green-500 text-black font-extrabold rounded-2xl hover:bg-green-400 transition-all active:scale-95 shadow-[0_20px_50px_rgba(34,197,94,0.3)]"
                               >
                                 Continue Path
                               </button>
                               <button 
                                 onClick={() => setActiveTab('terminal')}
                                 className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all"
                               >
                                 Open Lab
                               </button>
                            </div>
                         </div>
                         <TerminalIcon size={180} className="absolute bottom-[-40px] right-[-40px] text-green-500/5 group-hover:rotate-12 transition-transform duration-700 pointer-events-none" />
                      </section>

                      <DailyRoutine />
                   </div>

                   {/* Right Column: Daily Streak/Challenge */}
                   <div className="space-y-6">
                      <section className="p-8 bg-[#161b22] border border-gray-800 rounded-3xl">
                         <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-gray-400 text-xs uppercase tracking-[0.2em]">Live Intelligence</h3>
                            <div className="flex items-center gap-1.5">
                               <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                               <span className="text-[10px] text-green-500 font-bold">Online</span>
                            </div>
                         </div>
                         
                         <div className="space-y-4">
                            <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                               <p className="text-xs text-gray-400 mb-2">Mentor Quick Tip:</p>
                               <p className="text-sm font-medium text-blue-100">"Infrastructure as Code is not just a tool, it's a philosophy. Start thinking about your servers as code collections."</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4">
                               <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/10">
                                  <div className="text-2xl font-bold">{progress.xp}</div>
                                  <div className="text-[10px] text-gray-500 uppercase font-black">Total XP</div>
                               </div>
                               <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/10">
                                  <div className="text-2xl font-bold">{progress.level}</div>
                                  <div className="text-[10px] text-gray-500 uppercase font-black">Level</div>
                               </div>
                            </div>
                         </div>
                      </section>
                      
                      <section className="p-8 bg-orange-500/5 border border-orange-500/10 rounded-3xl">
                         <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-orange-500/20 text-orange-500 rounded-xl">
                               <Flame size={20} />
                            </div>
                            <h3 className="font-bold">Execution Streak</h3>
                         </div>
                         <div className="flex justify-between items-center mb-6">
                            {[1, 2, 3, 4, 5, 6, 7].map(d => (
                              <div key={d} className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-bold border ${d <= progress.streak ? 'bg-orange-500 border-orange-600 text-black shadow-[0_10px_20px_rgba(249,115,22,0.3)]' : 'border-gray-800 text-gray-600'}`}>
                                {['M', 'T', 'W', 'T', 'F', 'S', 'S'][d-1]}
                              </div>
                            ))}
                         </div>
                      </section>
                      
                      <InfrastructureScenarios />
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'roadmap' && (
              <motion.div
                key="roadmap"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-8"
              >
                <div className="flex items-end justify-between">
                   <div>
                      <h2 className="text-3xl font-bold text-white mb-2">Learning Path</h2>
                      <p className="text-gray-400">Follow the path from Zero to Hero.</p>
                   </div>
                   <div className="flex gap-2">
                      <div className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-green-500" />
                         <span className="text-xs font-bold text-gray-300">Basics</span>
                      </div>
                      <div className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-orange-500" />
                         <span className="text-xs font-bold text-gray-300">Advanced</span>
                      </div>
                   </div>
                </div>

                <div className="space-y-12">
                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-8 bg-green-500 rounded-full" />
                      <h3 className="text-xl font-bold">Foundation: Linux & Bash</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {MODULES.filter(m => !m.isAdvanced).map((module) => (
                        <ModuleCard
                          key={module.id}
                          module={module}
                          isLocked={!progress.unlockedModules.includes(module.id)}
                          isCompleted={progress.completedModules.includes(module.id)}
                          onClick={() => setSelectedModuleId(module.id)}
                        />
                      ))}
                    </div>
                  </section>

                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-8 bg-orange-500 rounded-full" />
                      <div>
                        <h3 className="text-xl font-bold">The Engineering Path</h3>
                        <p className="text-sm text-gray-500 italic">Unlocks after completing 5 Foundation modules</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {MODULES.filter(m => m.isAdvanced).map((module) => (
                        <ModuleCard
                          key={module.id}
                          module={module}
                          isLocked={progress.completedModules.length < 5 || !progress.unlockedModules.includes(module.id)}
                          isCompleted={progress.completedModules.includes(module.id)}
                          onClick={() => setSelectedModuleId(module.id)}
                        />
                      ))}
                    </div>
                  </section>
                </div>
              </motion.div>
            )}

            {activeTab === 'terminal' && (
              <motion.div
                key="terminal"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="h-[calc(100vh-160px)] flex gap-6"
              >
                <div className="flex-1 min-w-0">
                  <TerminalSimulator />
                </div>
                <div className="w-80 hidden xl:flex flex-col gap-6">
                   <div className="flex-1 min-h-0">
                      <FileVisualizerHub />
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div key="profile" className="max-w-2xl mx-auto py-12">
                 <div className="bg-[#161b22] border border-gray-800 rounded-3xl p-10 text-center space-y-6">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-green-500 to-blue-500 p-1 mx-auto">
                       <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-5xl"> हीरो </div>
                    </div>
                    <div className="space-y-1">
                       <h2 className="text-3xl font-bold text-white">Terminal Enthusiast</h2>
                       <p className="text-gray-400">Student ID: #820261</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-6">
                       <div className="text-center">
                          <div className="text-2xl font-bold">{progress.xp}</div>
                          <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Total XP</div>
                       </div>
                       <div className="text-center">
                          <div className="text-2xl font-bold">{progress.completedModules.length}</div>
                          <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Modules</div>
                       </div>
                       <div className="text-center">
                          <div className="text-2xl font-bold">{progress.level}</div>
                          <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Level</div>
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Module Detail Overlay */}
      <AnimatePresence>
        {selectedModuleId && selectedModule && (
          <ModuleDetail
            module={selectedModule}
            onClose={() => setSelectedModuleId(null)}
            onComplete={() => completeModule(selectedModule.id, selectedModule.moduleXp)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}

function SidebarButton({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active 
          ? 'bg-green-500/10 text-green-500 ring-1 ring-green-500/20' 
          : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
      }`}
    >
      <span className={active ? 'text-green-500' : 'text-gray-500'}>{icon}</span>
      <span className="font-bold text-sm">{label}</span>
    </button>
  );
}

function RankBadge({ label, icon, unlocked }: { label: string, icon: string, unlocked: boolean }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${unlocked ? 'bg-gray-800/50 border-gray-700/50' : 'bg-black/20 border-gray-800 opacity-40 grayscale'}`}>
       <div className="text-xl">{icon}</div>
       <span className="text-xs font-bold text-gray-300">{label}</span>
       {!unlocked && <Lock size={12} className="ml-auto text-gray-600" />}
    </div>
  );
}

function FileVisualizerHub() {
  const { fs, cwd } = useTerminal();
  return <FileVisualizer fs={fs} cwd={cwd} />;
}

function NavButton({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-green-500' : 'text-gray-500 hover:text-gray-300'}`}
    >
      <motion.div 
        animate={active ? { scale: 1.2, y: -4 } : { scale: 1, y: 0 }}
        className={`${active ? 'bg-green-500/10 p-2 rounded-xl ring-1 ring-green-500/20' : ''}`}
      >
        {icon}
      </motion.div>
      <span className={`text-[10px] font-bold uppercase tracking-widest ${active ? 'opacity-100' : 'opacity-0'}`}>
        {label}
      </span>
    </button>
  );
}

