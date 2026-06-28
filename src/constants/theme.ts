// ─── Design System Tokens ────────────────────────────────────────────────────
// Inspired by classical Islamic manuscript aesthetics:
// Deep teal + gold + cream (light) | Deep navy + muted gold (dark)

export const Colors = {
  // Primary palette
  primary: '#0D5C63',
  primaryLight: '#1A7A82',
  primaryDark: '#094449',

  // Gold accent — used for highlights, XP, badges
  gold: '#C9A84C',
  goldLight: '#E4C170',
  goldDark: '#A88530',

  // Background tones
  bgLight: '#FAF3E0',     // Warm cream (light mode)
  bgDark: '#0A1628',      // Deep navy (dark mode)
  bgCard: '#FFFFFF',
  bgCardDark: '#0F2040',

  // Surface/card
  surface: '#F5EDD8',
  surfaceDark: '#152035',

  // Text
  textPrimary: '#1A1A2E',
  textSecondary: '#4A5568',
  textMuted: '#718096',
  textLight: '#FAF3E0',
  textDark: '#E8D5B0',

  // Semantic
  success: '#38A169',
  warning: '#D69E2E',
  error: '#E53E3E',
  info: '#3182CE',

  // Challenge types
  verseOrder: '#6B46C1',
  fillBlank: '#0D5C63',
  listening: '#2C7A7B',
  warshQuiz: '#C9A84C',

  // Reward tiers
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  goldTier: '#FFD700',
  platinum: '#E5E4E2',

  // Islamic geometric pattern overlay (subtle)
  patternOverlay: 'rgba(201, 168, 76, 0.06)',
} as const;

export const Typography = {
  // Arabic Quran font — loaded via expo-font
  quranFont: 'ScheherazadeNew',
  quranFontBold: 'ScheherazadeNew',

  // UI font
  uiFont: 'Inter',

  // Sizes
  ayahLg: 30,
  ayahMd: 26,
  ayahSm: 22,

  surahName: 28,
  heading1: 24,
  heading2: 20,
  heading3: 17,
  body: 15,
  caption: 13,
  badge: 11,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  screen: 20,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gold: {
    shadowColor: '#C9A84C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

export const AnimationDuration = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;
