import type { Thumn } from '../types';
import { SURAH_LIST } from './surahList';

// ─── Athman (Eighths) Boundary Calculator ────────────────────────────────────
// Each surah is divided into 8 equal parts based on ayah count.
// thumn 1 = ayahs 1..ceil(total/8)
// ...etc

const THUMN_LABELS_AR = [
  'الثمن الأول', 'الثمن الثاني', 'الثمن الثالث', 'الثمن الرابع',
  'الثمن الخامس', 'الثمن السادس', 'الثمن السابع', 'الثمن الثامن',
];

export function calculateThumnBoundaries(surahId: number): Thumn[] {
  const surah = SURAH_LIST.find(s => s.id === surahId);
  if (!surah) return [];

  const total = surah.verseCount;
  const thumanList: Thumn[] = [];

  for (let i = 0; i < 8; i++) {
    const startAyah = Math.floor((i * total) / 8) + 1;
    const endAyah = Math.floor(((i + 1) * total) / 8);
    // Last thumn goes to end
    const clampedEnd = i === 7 ? total : endAyah;

    thumanList.push({
      surahId,
      thumnNumber: i + 1,
      startAyah,
      endAyah: clampedEnd,
      label: THUMN_LABELS_AR[i],
    });
  }

  return thumanList;
}

// Pre-compute all 114 × 8 = 912 thumn boundaries
export const ALL_THUMN_BOUNDARIES: Map<number, Thumn[]> = new Map(
  SURAH_LIST.map(s => [s.id, calculateThumnBoundaries(s.id)])
);

export function getThumnForAyah(surahId: number, ayahNumber: number): number {
  const thumanList = ALL_THUMN_BOUNDARIES.get(surahId) ?? [];
  const thumn = thumanList.find(
    t => ayahNumber >= t.startAyah && ayahNumber <= t.endAyah
  );
  return thumn?.thumnNumber ?? 1;
}
