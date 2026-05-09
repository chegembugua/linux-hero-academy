import { useState, useEffect } from 'react';
import { UserProgress } from '../types';

const STORAGE_KEY = 'linux_hero_progress';

const INITIAL_PROGRESS: UserProgress = {
  xp: 0,
  level: 1,
  streak: 0,
  lastVisit: new Date().toISOString(),
  completedModules: [],
  unlockedModules: ['m1'],
  unlockedAchievements: []
};

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : INITIAL_PROGRESS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const addXp = (amount: number) => {
    setProgress(prev => {
      const newXp = prev.xp + amount;
      const newLevel = Math.floor(newXp / 500) + 1;
      return { ...prev, xp: newXp, level: newLevel };
    });
  };

  const completeModule = (moduleId: string, xpBonus: number) => {
    if (progress.completedModules.includes(moduleId)) return;
    
    setProgress(prev => {
      const newCompleted = [...prev.completedModules, moduleId];
      // Logic to unlock next module (simplified)
      const nextIndex = parseInt(moduleId.replace('m', '')) + 1;
      const nextId = `m${nextIndex}`;
      const newUnlocked = [...prev.unlockedModules];
      if (!newUnlocked.includes(nextId)) {
        newUnlocked.push(nextId);
      }
      return {
        ...prev,
        completedModules: newCompleted,
        unlockedModules: newUnlocked,
        xp: prev.xp + xpBonus,
        level: Math.floor((prev.xp + xpBonus) / 500) + 1
      };
    });
  };

  return { progress, addXp, completeModule };
}
