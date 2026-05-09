import React from 'react';
import { motion } from 'motion/react';
import { Shield, Server, Activity, Globe, ChevronRight, Zap } from 'lucide-react';
import { Scenario } from '../types';

const MOCK_SCENARIOS: Scenario[] = [
  {
    id: 'sc1',
    title: 'The Production Blackout',
    description: 'A critical service is down and the team is panicking. Logs show a segmentation fault.',
    category: 'production',
    difficulty: 'senior',
    objective: 'Locate the faulting service and roll back to the stable version.',
    hints: ['Check syslog', 'Verify binary checksums'],
    solutionCommands: ['tail -f /var/log/syslog', 'git checkout stable']
  },
  {
    id: 'sc2',
    title: 'Zombies in the Cluster',
    description: 'One of the nodes is showing 100% CPU usage due to runaway processes.',
    category: 'performance',
    difficulty: 'mid',
    objective: 'Identify the runaway process and terminate it safely.',
    hints: ['top is your friend', 'kill -9 is the last resort'],
    solutionCommands: ['top', 'kill -15 [pid]']
  }
];

export default function InfrastructureScenarios() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Activity size={20} className="text-orange-500" />
          Real-World Troubleshooting
        </h2>
        <span className="text-xs text-gray-500 uppercase font-black tracking-widest">Active Tickets: 2</span>
      </div>

      <div className="grid gap-4">
        {MOCK_SCENARIOS.map((sc, idx) => (
          <motion.div
            key={sc.id}
            whileHover={{ scale: 1.01 }}
            className="p-5 bg-orange-500/5 border border-orange-500/10 rounded-2xl group cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500">
                {sc.category === 'production' ? <Server size={24} /> : sc.category === 'security' ? <Shield size={24} /> : <Globe size={24} />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                    sc.difficulty === 'senior' ? 'bg-red-500/20 text-red-500' : 'bg-orange-500/20 text-orange-500'
                  }`}>
                    {sc.difficulty}
                  </span>
                  <h3 className="font-bold text-white transition-colors group-hover:text-orange-400">{sc.title}</h3>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">{sc.description}</p>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-yellow-500" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Solve to earn +500 XP</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-700 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <button className="w-full py-3 border border-dashed border-gray-800 rounded-2xl text-xs font-bold text-gray-600 hover:border-gray-600 hover:text-gray-400 transition-all">
        Unlock Advanced Scenarios (Level 15+)
      </button>
    </div>
  );
}
