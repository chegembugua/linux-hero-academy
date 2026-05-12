import { useState, useEffect, useCallback } from 'react';
import { UserProgress } from '../types';
import { api } from '../api'; 

const INITIAL_PROGRESS: UserProgress = {
  userId: null,
  xp: 0,
  level: 1,
  streak: 0,
  dailyMinutes: 0,
  lastVisit: new Date().toISOString(),
  completedModules: [],
  unlockedModules: ['m1'], // m1 is the default starting point
  unlockedAchievements: []
};

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(INITIAL_PROGRESS);
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. THE CALCULATOR ---
  // This is the "Brain" that decides what is unlocked.
  // We wrap it in useCallback so it's a stable reference.
  const calculateUnlockedModules = useCallback((completed: string[]) => {
    const unlocked = ['m1']; // m1 is always available
    
    completed.forEach(moduleId => {
      const currentNum = parseInt(moduleId.replace(/[^\d]/g, ''), 10); // Extract number only
      if (!isNaN(currentNum)) {
        const nextId = `m${currentNum + 1}`;
        if (!unlocked.includes(nextId)) {
          unlocked.push(nextId);
        }
      }
    });
    return unlocked;
  }, []);

  // --- 2. FETCH PROGRESS FROM SERVER ---
  const fetchProgress = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.request('/user/progress');
      
      // Handle the fact that Prisma sometimes sends a string instead of an array
      const rawCompleted = data.completedModules;
      const parsedCompleted = Array.isArray(rawCompleted) 
        ? rawCompleted 
        : JSON.parse(rawCompleted || '[]');

      setProgress(prev => ({
        ...prev,
        ...data,
        completedModules: parsedCompleted,
        unlockedModules: calculateUnlockedModules(parsedCompleted)
      }));
    } catch (error) {
      console.error("🔴 Failed to load progress:", error);
    } finally {
      setIsLoading(false);
    }
  }, [calculateUnlockedModules]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // --- 3. HEARTBEAT ---
  const updateDailyMinutes = useCallback((minutes: number) => {
    setProgress(prev => ({
      ...prev,
      dailyMinutes: minutes
    }));
  }, []);

  // --- 4. COMPLETE MODULE (THE LOCK BREAKER) ---
  const completeModule = async (moduleId: string, xpBonus: number) => {
    // 1. UPDATE LOCALLY FIRST (Optimistic UI)
    // This makes the next module unlock IMMEDIATELY without waiting for the server.
    setProgress(prev => {
      const newCompleted = [...prev.completedModules];
      if (!newCompleted.includes(moduleId)) {
        newCompleted.push(moduleId);
      }
      
      const newUnlocked = calculateUnlockedModules(newCompleted);
      const newXp = prev.xp + xpBonus;

      return {
        ...prev,
        completedModules: newCompleted,
        unlockedModules: newUnlocked,
        xp: newXp,
        level: Math.floor(newXp / 500) + 1
      };
    });

    // 2. SYNC WITH SERVER IN BACKGROUND
    try {
      await api.request('/user/complete-module', {
        method: 'POST',
        body: JSON.stringify({ moduleId, xpBonus })
      });
      // Optional: re-fetch to ensure sync is perfect
      // await fetchProgress(); 
    } catch (err) {
      console.error("🔴 Failed to sync completion to server:", err);
    }
  };

  const setUserId = (id: string) => {
    setProgress(prev => ({ ...prev, userId: id }));
  };

  return { 
    progress, 
    isLoading, 
    completeModule, 
    updateDailyMinutes, 
    setUserId,
    refreshProgress: fetchProgress 
  };
}