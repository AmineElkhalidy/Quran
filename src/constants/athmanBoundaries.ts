import type { Thumn } from '../types';
import { getRubSegmentsForSurah, getRubIndexForAyah } from './quranDivisions';

// ─── Athman Boundaries — Real Rub' al-Hizb ──────────────────────────────────
// Delegates to quranDivisions.ts which holds the actual 240 rub' al-hizb
// boundaries from the standard Uthmani/Warsh mushaf.
//
// The function signatures are preserved for backward compatibility with all
// consumers (reader, home screen, challenges, store).

/**
 * Get all rub' al-hizb segments for a surah, as Thumn objects.
 * The number of segments varies per surah (NOT always 8).
 * Short surahs that share a rub' with others get 1 segment covering all their ayahs.
 */
export function calculateThumnBoundaries(surahId: number): Thumn[] {
  return getRubSegmentsForSurah(surahId);
}

// Pre-compute all surah boundaries (used by some consumers)
export const ALL_THUMN_BOUNDARIES: Map<number, Thumn[]> = new Map(
  Array.from({ length: 114 }, (_, i) => [i + 1, calculateThumnBoundaries(i + 1)] as [number, Thumn[]])
);

/**
 * Find which segment index (1-based) an ayah belongs to within its surah.
 */
export function getThumnForAyah(surahId: number, ayahNumber: number): number {
  return getRubIndexForAyah(surahId, ayahNumber);
}
