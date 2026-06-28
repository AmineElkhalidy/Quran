// ─── TypeScript Types ─────────────────────────────────────────────────────────

export interface Surah {
  id: number;
  nameArabic: string;
  nameEnglish: string;
  nameTransliteration: string;
  revelationType: 'Makki' | 'Madani';
  verseCount: number;
  orderInRevelation: number;
  juzStart: number;
  summaryArabic?: string;
  summaryEnglish?: string;
  asbabNuzul?: string;
}

export interface Ayah {
  id: number;
  surahId: number;
  ayahNumber: number;
  textWarsh: string;
  textHafs?: string;
  warshNotes?: string;
  thumnNumber: number; // 1-8 (eighth within surah)
  juzNumber: number;
  pageNumber?: number;
}

export interface Thumn {
  surahId: number;
  thumnNumber: number; // 1–8
  startAyah: number;
  endAyah: number;
  label: string; // e.g. "الثمن الأول"
}

export interface UserProgress {
  id?: number;
  surahId: number;
  thumnNumber: number;
  completed: boolean;
  readCount: number;
  lastReadAt?: string;
  xpEarned: number;
}

export type ChallengeType = 'verse_ordering' | 'fill_blank' | 'listening' | 'warsh_quiz';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface Challenge {
  id: number;
  type: ChallengeType;
  surahId: number;
  thumnNumber: number;
  difficulty: Difficulty;
  payload: VerseOrderingPayload | FillBlankPayload | ListeningPayload | WarshQuizPayload;
  xpReward: number;
}

export interface VerseOrderingPayload {
  ayahs: Array<{ id: number; text: string; correctIndex: number }>;
}

export interface FillBlankPayload {
  ayahId: number;
  fullText: string;
  blankWord: string;
  options: string[];
  correctOption: string;
}

export interface ListeningPayload {
  ayahId: number;
  surahId: number;
  ayahNumber: number;
  options: Array<{ label: string; isCorrect: boolean }>;
}

export interface WarshQuizPayload {
  ruleName: string;
  ruleDescription: string;
  exampleAyah: string;
  question: string;
  options: string[];
  correctOption: string;
}

export interface ChallengeResult {
  id?: number;
  challengeId: number;
  score: number;
  accuracy: number;
  timeTakenSeconds: number;
  completedAt: string;
  xpEarned: number;
}

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Badge {
  key: string;
  nameArabic: string;
  nameEnglish: string;
  description: string;
  iconEmoji: string;
  xpThreshold?: number;
  condition: string;
  tier: BadgeTier;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface Recording {
  id?: number;
  ayahId: number;
  filePath: string;
  durationMs: number;
  feedbackScore?: number;
  recordedAt: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  totalDaysActive: number;
}

export interface UserStats {
  totalXP: number;
  level: number;
  xpToNextLevel: number;
  streak: StreakData;
  totalThumnCompleted: number;
  totalChallengesCompleted: number;
  averageAccuracy: number;
}
