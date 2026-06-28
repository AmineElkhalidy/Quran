import type { Badge } from '../types';

export const BADGES: Badge[] = [
  {
    key: 'first_step',
    nameArabic: 'الخطوة الأولى',
    nameEnglish: 'First Step',
    description: 'Complete your first thumn',
    iconEmoji: '🌱',
    condition: 'thumn_completed >= 1',
    tier: 'bronze',
    unlocked: false,
  },
  {
    key: 'al_fatiha',
    nameArabic: 'الفاتحة',
    nameEnglish: 'Al-Fatiha',
    description: 'Complete Surah Al-Fatiha entirely',
    iconEmoji: '📖',
    condition: 'surah_1_completed',
    tier: 'bronze',
    unlocked: false,
  },
  {
    key: 'streak_keeper',
    nameArabic: 'المواظب',
    nameEnglish: 'Streak Keeper',
    description: 'Maintain a 7-day learning streak',
    iconEmoji: '🔥',
    condition: 'streak >= 7',
    tier: 'silver',
    unlocked: false,
  },
  {
    key: 'challenge_warrior',
    nameArabic: 'المتحدي',
    nameEnglish: 'Challenge Warrior',
    description: 'Complete 10 challenges',
    iconEmoji: '⚔️',
    condition: 'challenges_completed >= 10',
    tier: 'silver',
    unlocked: false,
  },
  {
    key: 'perfect_reciter',
    nameArabic: 'المتقن',
    nameEnglish: 'The Precise Reciter',
    description: 'Score 100% on a fill-in-the-blank challenge',
    iconEmoji: '🎯',
    condition: 'perfect_score_fill_blank',
    tier: 'silver',
    unlocked: false,
  },
  {
    key: 'physician_quran',
    nameArabic: 'الطبيب القارئ',
    nameEnglish: 'The Physician of the Quran',
    description: 'Complete 10 Warsh Rules quizzes',
    iconEmoji: '🩺',
    condition: 'warsh_quiz_completed >= 10',
    tier: 'gold',
    unlocked: false,
  },
  {
    key: 'warsh_master',
    nameArabic: 'إمام ورش',
    nameEnglish: 'Warsh Master',
    description: 'Pass all Warsh pronunciation rules quizzes',
    iconEmoji: '🏆',
    condition: 'all_warsh_quizzes_passed',
    tier: 'gold',
    unlocked: false,
  },
  {
    key: 'thirty_streak',
    nameArabic: 'الثابت',
    nameEnglish: 'The Steadfast',
    description: 'Maintain a 30-day learning streak',
    iconEmoji: '💎',
    condition: 'streak >= 30',
    tier: 'platinum',
    unlocked: false,
  },
  {
    key: 'half_quran',
    nameArabic: 'نصف الحفظ',
    nameEnglish: 'Halfway There',
    description: 'Complete 57 surahs (half the Quran)',
    iconEmoji: '🌙',
    condition: 'surahs_completed >= 57',
    tier: 'gold',
    unlocked: false,
  },
  {
    key: 'full_quran',
    nameArabic: 'خاتم القرآن',
    nameEnglish: 'Seal of the Quran',
    description: 'Complete all 114 surahs',
    iconEmoji: '🕌',
    condition: 'surahs_completed >= 114',
    tier: 'platinum',
    unlocked: false,
  },
  {
    key: 'xp_1000',
    nameArabic: 'ألف نقطة',
    nameEnglish: '1,000 XP',
    description: 'Earn 1,000 XP points',
    iconEmoji: '⭐',
    xpThreshold: 1000,
    condition: 'xp >= 1000',
    tier: 'bronze',
    unlocked: false,
  },
  {
    key: 'xp_5000',
    nameArabic: 'خمسة آلاف نقطة',
    nameEnglish: '5,000 XP',
    description: 'Earn 5,000 XP points',
    iconEmoji: '🌟',
    xpThreshold: 5000,
    condition: 'xp >= 5000',
    tier: 'silver',
    unlocked: false,
  },
  {
    key: 'recorder',
    nameArabic: 'المسجّل',
    nameEnglish: 'Voice Recorder',
    description: 'Record your first recitation',
    iconEmoji: '🎙️',
    condition: 'recordings >= 1',
    tier: 'bronze',
    unlocked: false,
  },
  {
    key: 'listening_ace',
    nameArabic: 'الحافظ',
    nameEnglish: 'Listening Ace',
    description: 'Score 100% on 5 listening challenges',
    iconEmoji: '👂',
    condition: 'perfect_listening >= 5',
    tier: 'gold',
    unlocked: false,
  },
];

export const LEVEL_THRESHOLDS = [
  0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500,
  7000, 9000, 12000, 15000, 20000, 26000, 33000, 42000, 53000, 70000,
];

export function getLevelFromXP(xp: number): number {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return Math.min(level, 20);
}

export function getXPToNextLevel(xp: number): number {
  const level = getLevelFromXP(xp);
  if (level >= 20) return 0;
  return LEVEL_THRESHOLDS[level] - xp;
}
