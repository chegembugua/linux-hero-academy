import React from 'react';
import { motion } from 'motion/react';
import { Clock, CheckCircle2, ChevronRight, Play, Book, Terminal, Settings, AlertTriangle } from 'lucide-react';

interface DailyTask {
  id: string;
  title: string;
  duration: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'completed' | 'active';
}

export default function DailyRoutine() {
  const [tasks, setTasks] = React.useState<DailyTask[]>([
    {
      id: 'cmd',
      title: 'Command Mastery',
      duration: '15 mins',
      description: 'Review and practice commands from your spaced repetition queue.',
      icon: <Settings size={20} className="text-blue-400" />,
      status: 'active'
    },
    {
      id: 'terminal',
      title: 'Terminal Practice',
      duration: '15 mins',
      description: 'Hands-on navigation and file management drills.',
      icon: <Terminal size={20} className="text-green-400" />,
      status: 'pending'
    },
    {
      id: 'lab',
      title: 'Engineering Lab',
      duration: '20 mins',
      description: 'Deploy a mini-service or fix a broken configuration.',
      icon: <Book size={20} className="text-purple-400" />,
      status: 'pending'
    },
    {
      id: 'scenario',
      title: 'Real-World Outage',
      duration: '10 mins',
      description: 'Solve a high-stakes production troubleshooting scenario.',
      icon: <AlertTriangle size={20} className="text-orange-400" />,
      status: 'pending'
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <Clock size={20} className="text-green-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Daily Engineering Routine</h2>
            <p className="text-sm text-gray-500">1 hour focused practice system</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-green-500">25% Done</div>
          <div className="w-32 h-1.5 bg-gray-800 rounded-full mt-1">
            <div className="h-full bg-green-500 w-1/4" />
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {tasks.map((task, idx) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`p-6 rounded-2xl border transition-all ${
              task.status === 'active' 
                ? 'bg-gradient-to-br from-green-500/10 to-transparent border-green-500/30 ring-1 ring-green-500/20' 
                : 'bg-[#161b22] border-gray-800 hover:border-gray-700'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${task.status === 'active' ? 'bg-green-500/20' : 'bg-gray-800'}`}>
                {task.status === 'completed' ? <CheckCircle2 size={24} className="text-green-500" /> : task.icon}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`font-bold ${task.status === 'active' ? 'text-white' : 'text-gray-300'}`}>{task.title}</h3>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{task.duration}</span>
                </div>
                <p className="text-sm text-gray-500 mb-4">{task.description}</p>
                
                {task.status === 'active' ? (
                  <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-black font-black rounded-lg text-xs uppercase tracking-tighter hover:scale-105 active:scale-95 transition-all">
                    <Play size={12} fill="black" />
                    Start Session
                  </button>
                ) : task.status === 'completed' ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-green-500/70">
                    <CheckCircle2 size={12} />
                    Session Completed
                  </div>
                ) : (
                  <button className="text-xs font-bold text-gray-500 flex items-center gap-1 hover:text-gray-300 transition-colors">
                    Unlock <ChevronRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
