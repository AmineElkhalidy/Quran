import { create } from 'zustand';
import {
  getProgress,
  getAllProgressForSurah,
  getUserStats,
  markThumnRead,
  updateStreak,
  getLastReadProgress,
  getTotalThumnCompleted,
  getTotalChallengesCompleted,
} from '../services/databaseService';
import type { UserProgress, UserStats } from '../types';

interface QuranState {
  currentSurahId: number;
  currentThumnNumber: number;
  progressMap: Record<string, UserProgress>; // key: `${surahId}_${thumnNumber}`
  stats: UserStats;
  lastRead: { surahId: number; thumnNumber: number } | null;
  
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
  lastRead: null,
  stats: {
    totalXP: 0,
    level: 1,
    xpToNextLevel: 500,
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
    const lastRead = getLastReadProgress();
    const totalThumn = getTotalThumnCompleted();
    const totalChallenges = getTotalChallengesCompleted();

    if (dbStats) {
      set({
        lastRead: lastRead ? { surahId: lastRead.surahId, thumnNumber: lastRead.thumnNumber } : null,
        stats: {
          totalXP: dbStats.total_xp,
          level: dbStats.level,
          xpToNextLevel: dbStats.xp_to_next_level,
          streak: {
            currentStreak: dbStats.current_streak,
            longestStreak: dbStats.longest_streak,
            lastActiveDate: dbStats.last_active_date,
            totalDaysActive: dbStats.total_days_active,
          },
          totalThumnCompleted: totalThumn,
          totalChallengesCompleted: totalChallenges,
          averageAccuracy: 0,
        },
      });
    }
  },

  markCompleted: (surahId, thumnNumber, xp) => {
    // Persist to database
    markThumnRead(surahId, thumnNumber, xp);
    updateStreak();

    // Update local state
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

    // Refresh stats from DB to get accurate level/streak
    get().loadStats();
  }
}));
