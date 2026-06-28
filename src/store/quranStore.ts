import { create } from 'zustand';
import { getProgress, getAllProgressForSurah, getUserStats } from '../services/databaseService';
import type { UserProgress, UserStats } from '../types';

interface QuranState {
  currentSurahId: number;
  currentThumnNumber: number;
  progressMap: Record<string, UserProgress>; // key: `${surahId}_${thumnNumber}`
  stats: UserStats;
  
  setCurrentSurah: (id: number) => void;
  setCurrentThumn: (thumn: number) => void;
  loadProgress: (surahId: number) => void;
  loadStats: () => void;
  markCompleted: (surahId: number, thumnNumber: number, xp: number) => void;
}

export const useQuranStore = create<QuranState>((set, get) => ({
  currentSurahId: 1,
  currentThumnNumber: 1,
  progressMap: {},
  stats: {
    totalXP: 0,
    level: 1,
    xpToNextLevel: 100,
    streak: {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: '',
      totalDaysActive: 0,
    },
    totalThumnCompleted: 0,
    totalChallengesCompleted: 0,
    averageAccuracy: 0,
  },

  setCurrentSurah: (id) => set({ currentSurahId: id }),
  
  setCurrentThumn: (thumn) => set({ currentThumnNumber: thumn }),
  
  loadProgress: (surahId) => {
    const records = getAllProgressForSurah(surahId);
    const newMap = { ...get().progressMap };
    records.forEach(record => {
      newMap[`${record.surahId}_${record.thumnNumber}`] = record;
    });
    set({ progressMap: newMap });
  },

  loadStats: () => {
    const dbStats = getUserStats();
    if (dbStats) {
      set((state) => ({
        stats: {
          ...state.stats,
          totalXP: dbStats.total_xp,
          level: dbStats.level,
          streak: {
            currentStreak: dbStats.current_streak,
            longestStreak: dbStats.longest_streak,
            lastActiveDate: dbStats.last_active_date,
            totalDaysActive: dbStats.total_days_active,
          }
        }
      }));
    }
  },

  markCompleted: (surahId, thumnNumber, xp) => {
    const key = `${surahId}_${thumnNumber}`;
    const existing = get().progressMap[key];
    
    set((state) => ({
      progressMap: {
        ...state.progressMap,
        [key]: {
          surahId,
          thumnNumber,
          completed: true,
          readCount: (existing?.readCount || 0) + 1,
          lastReadAt: new Date().toISOString(),
          xpEarned: (existing?.xpEarned || 0) + xp,
        }
      }
    }));
    get().loadStats(); // Refresh stats after adding XP
  }
}));
