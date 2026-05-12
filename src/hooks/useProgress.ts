// src/hooks/useProgress.ts
import { useState, useEffect, useCallback } from 'react';
import { UserProgress } from '../types';

const INITIAL_PROGRESS: UserProgress = {
  userId: null,
  xp: 0,
  level: 1,
  streak: 0,
  dailyMinutes: 0,
  lastVisit: new Date().toISOString(),
  completedModules: [],
  unlockedModules: ['m1'],
  unlockedAchievements: []
};

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(INITIAL_PROGRESS);
  const [isLoading, setIsLoading] = useState(true);

  // Load progress from the server when the hook mounts
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        // Fetch the JWT token that is saved during login
        const token = localStorage.getItem('token'); 
        if (!token) {
           setIsLoading(false);
           return;
        }

        const response = await fetch('/api/user/progress', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setProgress(prev => ({
            ...prev,
            ...data,
            // Calculate unlocked modules dynamically based on what the server says is completed
            unlockedModules: calculateUnlockedModules(data.completedModules)
          }));
        }
      } catch (error) {
        console.error("Failed to load progress:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, []);

  // Helper function to figure out what's unlocked based on what's completed
  const calculateUnlockedModules = (completed: string[]) => {
    const unlocked = ['m1'];
    completed.forEach(moduleId => {
      const nextIndex = parseInt(moduleId.replace('m', '')) + 1;
      const nextId = `m${nextIndex}`;
      if (!unlocked.includes(nextId)) {
        unlocked.push(nextId);
      }
    });
    return unlocked;
  };

  // Heartbeat function (used by App.tsx)
  const updateDailyMinutes = useCallback((minutes: number) => {
    setProgress(prev => ({
      ...prev,
      dailyMinutes: minutes
    }));
  }, []);

  // Sync completed modules to the server
  const completeModule = async (moduleId: string, xpBonus: number) => {
    if (progress.completedModules.includes(moduleId) || !progress.userId) return;

    // Optimistic UI update (update frontend immediately so the user doesn't feel a delay)
    setProgress(prev => {
      const newCompleted = [...prev.completedModules, moduleId];
      return {
        ...prev,
        completedModules: newCompleted,
        unlockedModules: calculateUnlockedModules(newCompleted),
        xp: prev.xp + xpBonus,
        level: Math.floor((prev.xp + xpBonus) / 500) + 1
      };
    });

    // Send the actual update to the server securely
    try {
      await fetch('/api/user/complete-module', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ moduleId, xpBonus })
      });
    } catch (error) {
      console.error("Failed to sync completed module:", error);
    }
  };

  const addXp = (amount: number) => {
      setProgress(prev => {
        const newXp = prev.xp + amount;
        const newLevel = Math.floor(newXp / 500) + 1;
        return { ...prev, xp: newXp, level: newLevel };
      });
  };

  const setUserId = (id: string) => {
    setProgress(prev => ({ ...prev, userId: id }));
  };

  return { 
    progress, 
    isLoading, 
    addXp, 
    completeModule, 
    updateDailyMinutes, 
    setUserId 
  };
}