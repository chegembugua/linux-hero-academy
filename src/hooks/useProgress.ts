import { useState, useEffect } from 'react';
import { UserProgress } from '../types';

const STORAGE_KEY = 'linux_hero_progress';

// Added userId and dailyMinutes to the initial state
const INITIAL_PROGRESS: UserProgress = {
  userId: null, // This will be set during login
  xp: 0,
  level: 1,
  streak: 0,
  dailyMinutes: 0, // Track practice time
  lastVisit: new Date().toISOString(),
  completedModules: [],
  unlockedModules: ['m1'],
  unlockedAchievements: []
};

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure the UI doesn't crash if these new fields are missing from old storage
      return { 
        ...INITIAL_PROGRESS, 
        ...parsed,
        dailyMinutes: parsed.dailyMinutes || 0 
      };
    }
    return INITIAL_PROGRESS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  // NEW: Function to update minutes from the Heartbeat
  const updateDailyMinutes = (minutes: number) => {
    setProgress(prev => ({
      ...prev,
      dailyMinutes: minutes
    }));
  };

  // UPDATED: Ensure login/registration sets the userId
  const setUserId = (id: string) => {
    setProgress(prev => ({ ...prev, userId: id }));
  };

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

  return { 
    progress, 
    addXp, 
    completeModule, 
    updateDailyMinutes, 
    setUserId 
  };
}