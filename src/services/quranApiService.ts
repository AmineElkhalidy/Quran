import { getVersesForSurah as getEmbeddedVerses, hasVerseData } from '../constants/quranVerses';

// ─── Quran API Service ───────────────────────────────────────────────────────
// Fetches verse text from alquran.cloud API with in-memory caching.
// Falls back to embedded data for offline-available short surahs.

export interface ApiVerse {
  surahId: number;
  ayahNumber: number;
  text: string;
}

interface AlQuranApiResponse {
  code: number;
  status: string;
  data: {
    number: number;
    name: string;
    englishName: string;
    ayahs: Array<{
      number: number;
      text: string;
      numberInSurah: number;
      juz: number;
      page: number;
    }>;
  };
}

// In-memory cache: surahId → verses
const versesCache = new Map<number, ApiVerse[]>();

/**
 * Fetch all verses for a surah.
 * Checks cache first, then embedded data, then fetches from API.
 */
export async function fetchVersesForSurah(surahId: number): Promise<ApiVerse[]> {
  // 1. Check cache
  if (versesCache.has(surahId)) {
    return versesCache.get(surahId)!;
  }

  // 2. Check embedded data (works offline for short surahs)
  if (hasVerseData(surahId)) {
    const embedded = getEmbeddedVerses(surahId);
    const verses: ApiVerse[] = embedded.map(v => ({
      surahId: v.surahId,
      ayahNumber: v.ayahNumber,
      text: v.textWarsh,
    }));
    versesCache.set(surahId, verses);
    return verses;
  }

  // 3. Fetch from API
  try {
    const response = await fetch(
      `https://api.alquran.cloud/v1/surah/${surahId}/quran-uthmani`
    );
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const json: AlQuranApiResponse = await response.json();

    if (json.code !== 200 || !json.data?.ayahs) {
      throw new Error('Invalid API response');
    }

    const verses: ApiVerse[] = json.data.ayahs.map(ayah => ({
      surahId,
      ayahNumber: ayah.numberInSurah,
      text: ayah.text,
    }));

    // Cache the result
    versesCache.set(surahId, verses);
    return verses;
  } catch (error) {
    console.error(`[QuranAPI] Failed to fetch surah ${surahId}:`, error);
    // Return empty — caller should handle gracefully
    return [];
  }
}

/**
 * Get a specific verse (from cache only — call fetchVersesForSurah first).
 */
export function getCachedVerse(surahId: number, ayahNumber: number): ApiVerse | undefined {
  const cached = versesCache.get(surahId);
  if (!cached) return undefined;
  return cached.find(v => v.ayahNumber === ayahNumber);
}

/**
 * Check if verses are cached for a surah.
 */
export function isVersesCached(surahId: number): boolean {
  return versesCache.has(surahId);
}

/**
 * Get a random subset of consecutive verses for challenges.
 * Returns the verses in correct order.
 */
export function getRandomVerseRange(
  surahId: number,
  count: number = 4
): ApiVerse[] {
  const cached = versesCache.get(surahId);
  if (!cached || cached.length === 0) return [];

  const maxCount = Math.min(count, cached.length);
  const maxStart = cached.length - maxCount;
  const startIndex = Math.floor(Math.random() * (maxStart + 1));

  return cached.slice(startIndex, startIndex + maxCount);
}
