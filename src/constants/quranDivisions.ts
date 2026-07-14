// ─── Quran Divisions — Real Rub' al-Hizb Boundaries ─────────────────────────
// Source: Quran Foundation API v4 (standard Uthmani mushaf)
// The Quran is divided into 30 Juz → 60 Hizb → 240 Rub' al-Hizb.
// Each entry maps rub' number → { surahId: "startAyah-endAyah" }
//
// These boundaries are scholarly consensus, NOT calculated from verse counts.

import type { Thumn } from '../types';

interface RubEntry {
  /** 1–240 global rub' number */
  rubNumber: number;
  /** { surahId: "startAyah-endAyah" } — may span multiple surahs */
  verseMapping: Record<string, string>;
}

// prettier-ignore
const RUB_EL_HIZB_DATA: RubEntry[] = [
  { rubNumber: 1, verseMapping: {"1":"1-7","2":"1-25"} },
  { rubNumber: 2, verseMapping: {"2":"26-43"} },
  { rubNumber: 3, verseMapping: {"2":"44-59"} },
  { rubNumber: 4, verseMapping: {"2":"60-74"} },
  { rubNumber: 5, verseMapping: {"2":"75-91"} },
  { rubNumber: 6, verseMapping: {"2":"92-105"} },
  { rubNumber: 7, verseMapping: {"2":"106-123"} },
  { rubNumber: 8, verseMapping: {"2":"124-141"} },
  { rubNumber: 9, verseMapping: {"2":"142-157"} },
  { rubNumber: 10, verseMapping: {"2":"158-176"} },
  { rubNumber: 11, verseMapping: {"2":"177-188"} },
  { rubNumber: 12, verseMapping: {"2":"189-202"} },
  { rubNumber: 13, verseMapping: {"2":"203-218"} },
  { rubNumber: 14, verseMapping: {"2":"219-232"} },
  { rubNumber: 15, verseMapping: {"2":"233-242"} },
  { rubNumber: 16, verseMapping: {"2":"243-252"} },
  { rubNumber: 17, verseMapping: {"2":"253-262"} },
  { rubNumber: 18, verseMapping: {"2":"263-271"} },
  { rubNumber: 19, verseMapping: {"2":"272-282"} },
  { rubNumber: 20, verseMapping: {"2":"283-286","3":"1-14"} },
  { rubNumber: 21, verseMapping: {"3":"15-32"} },
  { rubNumber: 22, verseMapping: {"3":"33-51"} },
  { rubNumber: 23, verseMapping: {"3":"52-74"} },
  { rubNumber: 24, verseMapping: {"3":"75-92"} },
  { rubNumber: 25, verseMapping: {"3":"93-112"} },
  { rubNumber: 26, verseMapping: {"3":"113-132"} },
  { rubNumber: 27, verseMapping: {"3":"133-152"} },
  { rubNumber: 28, verseMapping: {"3":"153-170"} },
  { rubNumber: 29, verseMapping: {"3":"171-185"} },
  { rubNumber: 30, verseMapping: {"3":"186-200"} },
  { rubNumber: 31, verseMapping: {"4":"1-11"} },
  { rubNumber: 32, verseMapping: {"4":"12-23"} },
  { rubNumber: 33, verseMapping: {"4":"24-35"} },
  { rubNumber: 34, verseMapping: {"4":"36-57"} },
  { rubNumber: 35, verseMapping: {"4":"58-73"} },
  { rubNumber: 36, verseMapping: {"4":"74-87"} },
  { rubNumber: 37, verseMapping: {"4":"88-99"} },
  { rubNumber: 38, verseMapping: {"4":"100-113"} },
  { rubNumber: 39, verseMapping: {"4":"114-134"} },
  { rubNumber: 40, verseMapping: {"4":"135-147"} },
  { rubNumber: 41, verseMapping: {"4":"148-162"} },
  { rubNumber: 42, verseMapping: {"4":"163-176"} },
  { rubNumber: 43, verseMapping: {"5":"1-11"} },
  { rubNumber: 44, verseMapping: {"5":"12-26"} },
  { rubNumber: 45, verseMapping: {"5":"27-40"} },
  { rubNumber: 46, verseMapping: {"5":"41-50"} },
  { rubNumber: 47, verseMapping: {"5":"51-66"} },
  { rubNumber: 48, verseMapping: {"5":"67-81"} },
  { rubNumber: 49, verseMapping: {"5":"82-96"} },
  { rubNumber: 50, verseMapping: {"5":"97-108"} },
  { rubNumber: 51, verseMapping: {"5":"109-120","6":"1-12"} },
  { rubNumber: 52, verseMapping: {"6":"13-35"} },
  { rubNumber: 53, verseMapping: {"6":"36-58"} },
  { rubNumber: 54, verseMapping: {"6":"59-73"} },
  { rubNumber: 55, verseMapping: {"6":"74-94"} },
  { rubNumber: 56, verseMapping: {"6":"95-110"} },
  { rubNumber: 57, verseMapping: {"6":"111-126"} },
  { rubNumber: 58, verseMapping: {"6":"127-140"} },
  { rubNumber: 59, verseMapping: {"6":"141-150"} },
  { rubNumber: 60, verseMapping: {"6":"151-165"} },
  { rubNumber: 61, verseMapping: {"7":"1-30"} },
  { rubNumber: 62, verseMapping: {"7":"31-46"} },
  { rubNumber: 63, verseMapping: {"7":"47-64"} },
  { rubNumber: 64, verseMapping: {"7":"65-87"} },
  { rubNumber: 65, verseMapping: {"7":"88-116"} },
  { rubNumber: 66, verseMapping: {"7":"117-141"} },
  { rubNumber: 67, verseMapping: {"7":"142-155"} },
  { rubNumber: 68, verseMapping: {"7":"156-170"} },
  { rubNumber: 69, verseMapping: {"7":"171-188"} },
  { rubNumber: 70, verseMapping: {"7":"189-206"} },
  { rubNumber: 71, verseMapping: {"8":"1-21"} },
  { rubNumber: 72, verseMapping: {"8":"22-40"} },
  { rubNumber: 73, verseMapping: {"8":"41-60"} },
  { rubNumber: 74, verseMapping: {"8":"61-75"} },
  { rubNumber: 75, verseMapping: {"9":"1-18"} },
  { rubNumber: 76, verseMapping: {"9":"19-33"} },
  { rubNumber: 77, verseMapping: {"9":"34-45"} },
  { rubNumber: 78, verseMapping: {"9":"46-59"} },
  { rubNumber: 79, verseMapping: {"9":"60-74"} },
  { rubNumber: 80, verseMapping: {"9":"75-92"} },
  { rubNumber: 81, verseMapping: {"9":"93-110"} },
  { rubNumber: 82, verseMapping: {"9":"111-121"} },
  { rubNumber: 83, verseMapping: {"9":"122-129","10":"1-10"} },
  { rubNumber: 84, verseMapping: {"10":"11-25"} },
  { rubNumber: 85, verseMapping: {"10":"26-52"} },
  { rubNumber: 86, verseMapping: {"10":"53-70"} },
  { rubNumber: 87, verseMapping: {"10":"71-89"} },
  { rubNumber: 88, verseMapping: {"10":"90-109","11":"1-5"} },
  { rubNumber: 89, verseMapping: {"11":"6-23"} },
  { rubNumber: 90, verseMapping: {"11":"24-40"} },
  { rubNumber: 91, verseMapping: {"11":"41-60"} },
  { rubNumber: 92, verseMapping: {"11":"61-83"} },
  { rubNumber: 93, verseMapping: {"11":"84-107"} },
  { rubNumber: 94, verseMapping: {"11":"108-123","12":"1-6"} },
  { rubNumber: 95, verseMapping: {"12":"7-29"} },
  { rubNumber: 96, verseMapping: {"12":"30-52"} },
  { rubNumber: 97, verseMapping: {"12":"53-76"} },
  { rubNumber: 98, verseMapping: {"12":"77-100"} },
  { rubNumber: 99, verseMapping: {"12":"101-111","13":"1-4"} },
  { rubNumber: 100, verseMapping: {"13":"5-18"} },
  { rubNumber: 101, verseMapping: {"13":"19-34"} },
  { rubNumber: 102, verseMapping: {"13":"35-43","14":"1-9"} },
  { rubNumber: 103, verseMapping: {"14":"10-27"} },
  { rubNumber: 104, verseMapping: {"14":"28-52"} },
  { rubNumber: 105, verseMapping: {"15":"1-48"} },
  { rubNumber: 106, verseMapping: {"15":"49-99"} },
  { rubNumber: 107, verseMapping: {"16":"1-29"} },
  { rubNumber: 108, verseMapping: {"16":"30-50"} },
  { rubNumber: 109, verseMapping: {"16":"51-74"} },
  { rubNumber: 110, verseMapping: {"16":"75-89"} },
  { rubNumber: 111, verseMapping: {"16":"90-110"} },
  { rubNumber: 112, verseMapping: {"16":"111-128"} },
  { rubNumber: 113, verseMapping: {"17":"1-22"} },
  { rubNumber: 114, verseMapping: {"17":"23-49"} },
  { rubNumber: 115, verseMapping: {"17":"50-69"} },
  { rubNumber: 116, verseMapping: {"17":"70-98"} },
  { rubNumber: 117, verseMapping: {"17":"99-111","18":"1-16"} },
  { rubNumber: 118, verseMapping: {"18":"17-31"} },
  { rubNumber: 119, verseMapping: {"18":"32-50"} },
  { rubNumber: 120, verseMapping: {"18":"51-74"} },
  { rubNumber: 121, verseMapping: {"18":"75-98"} },
  { rubNumber: 122, verseMapping: {"18":"99-110","19":"1-21"} },
  { rubNumber: 123, verseMapping: {"19":"22-58"} },
  { rubNumber: 124, verseMapping: {"19":"59-98"} },
  { rubNumber: 125, verseMapping: {"20":"1-54"} },
  { rubNumber: 126, verseMapping: {"20":"55-82"} },
  { rubNumber: 127, verseMapping: {"20":"83-110"} },
  { rubNumber: 128, verseMapping: {"20":"111-135"} },
  { rubNumber: 129, verseMapping: {"21":"1-28"} },
  { rubNumber: 130, verseMapping: {"21":"29-50"} },
  { rubNumber: 131, verseMapping: {"21":"51-76"} },
  { rubNumber: 132, verseMapping: {"21":"77-112"} },
  { rubNumber: 133, verseMapping: {"22":"1-18"} },
  { rubNumber: 134, verseMapping: {"22":"19-37"} },
  { rubNumber: 135, verseMapping: {"22":"38-59"} },
  { rubNumber: 136, verseMapping: {"22":"60-78"} },
  { rubNumber: 137, verseMapping: {"23":"1-35"} },
  { rubNumber: 138, verseMapping: {"23":"36-74"} },
  { rubNumber: 139, verseMapping: {"23":"75-118"} },
  { rubNumber: 140, verseMapping: {"24":"1-20"} },
  { rubNumber: 141, verseMapping: {"24":"21-34"} },
  { rubNumber: 142, verseMapping: {"24":"35-52"} },
  { rubNumber: 143, verseMapping: {"24":"53-64"} },
  { rubNumber: 144, verseMapping: {"25":"1-20"} },
  { rubNumber: 145, verseMapping: {"25":"21-52"} },
  { rubNumber: 146, verseMapping: {"25":"53-77"} },
  { rubNumber: 147, verseMapping: {"26":"1-51"} },
  { rubNumber: 148, verseMapping: {"26":"52-110"} },
  { rubNumber: 149, verseMapping: {"26":"111-180"} },
  { rubNumber: 150, verseMapping: {"26":"181-227"} },
  { rubNumber: 151, verseMapping: {"27":"1-26"} },
  { rubNumber: 152, verseMapping: {"27":"27-55"} },
  { rubNumber: 153, verseMapping: {"27":"56-81"} },
  { rubNumber: 154, verseMapping: {"27":"82-93","28":"1-11"} },
  { rubNumber: 155, verseMapping: {"28":"12-28"} },
  { rubNumber: 156, verseMapping: {"28":"29-50"} },
  { rubNumber: 157, verseMapping: {"28":"51-75"} },
  { rubNumber: 158, verseMapping: {"28":"76-88"} },
  { rubNumber: 159, verseMapping: {"29":"1-25"} },
  { rubNumber: 160, verseMapping: {"29":"26-45"} },
  { rubNumber: 161, verseMapping: {"29":"46-69"} },
  { rubNumber: 162, verseMapping: {"30":"1-30"} },
  { rubNumber: 163, verseMapping: {"30":"31-53"} },
  { rubNumber: 164, verseMapping: {"30":"54-60","31":"1-21"} },
  { rubNumber: 165, verseMapping: {"31":"22-34","32":"1-10"} },
  { rubNumber: 166, verseMapping: {"32":"11-30"} },
  { rubNumber: 167, verseMapping: {"33":"1-17"} },
  { rubNumber: 168, verseMapping: {"33":"18-30"} },
  { rubNumber: 169, verseMapping: {"33":"31-50"} },
  { rubNumber: 170, verseMapping: {"33":"51-59"} },
  { rubNumber: 171, verseMapping: {"33":"60-73","34":"1-9"} },
  { rubNumber: 172, verseMapping: {"34":"10-23"} },
  { rubNumber: 173, verseMapping: {"34":"24-45"} },
  { rubNumber: 174, verseMapping: {"34":"46-54","35":"1-14"} },
  { rubNumber: 175, verseMapping: {"35":"15-40"} },
  { rubNumber: 176, verseMapping: {"35":"41-45","36":"1-27"} },
  { rubNumber: 177, verseMapping: {"36":"28-59"} },
  { rubNumber: 178, verseMapping: {"36":"60-83","37":"1-21"} },
  { rubNumber: 179, verseMapping: {"37":"22-82"} },
  { rubNumber: 180, verseMapping: {"37":"83-144"} },
  { rubNumber: 181, verseMapping: {"37":"145-182","38":"1-20"} },
  { rubNumber: 182, verseMapping: {"38":"21-51"} },
  { rubNumber: 183, verseMapping: {"38":"52-88","39":"1-7"} },
  { rubNumber: 184, verseMapping: {"39":"8-31"} },
  { rubNumber: 185, verseMapping: {"39":"32-52"} },
  { rubNumber: 186, verseMapping: {"39":"53-75"} },
  { rubNumber: 187, verseMapping: {"40":"1-20"} },
  { rubNumber: 188, verseMapping: {"40":"21-40"} },
  { rubNumber: 189, verseMapping: {"40":"41-65"} },
  { rubNumber: 190, verseMapping: {"40":"66-85","41":"1-8"} },
  { rubNumber: 191, verseMapping: {"41":"9-24"} },
  { rubNumber: 192, verseMapping: {"41":"25-46"} },
  { rubNumber: 193, verseMapping: {"41":"47-54","42":"1-12"} },
  { rubNumber: 194, verseMapping: {"42":"13-26"} },
  { rubNumber: 195, verseMapping: {"42":"27-50"} },
  { rubNumber: 196, verseMapping: {"42":"51-53","43":"1-23"} },
  { rubNumber: 197, verseMapping: {"43":"24-56"} },
  { rubNumber: 198, verseMapping: {"43":"57-89","44":"1-16"} },
  { rubNumber: 199, verseMapping: {"44":"17-59","45":"1-11"} },
  { rubNumber: 200, verseMapping: {"45":"12-37"} },
  { rubNumber: 201, verseMapping: {"46":"1-20"} },
  { rubNumber: 202, verseMapping: {"46":"21-35","47":"1-9"} },
  { rubNumber: 203, verseMapping: {"47":"10-32"} },
  { rubNumber: 204, verseMapping: {"47":"33-38","48":"1-17"} },
  { rubNumber: 205, verseMapping: {"48":"18-29"} },
  { rubNumber: 206, verseMapping: {"49":"1-13"} },
  { rubNumber: 207, verseMapping: {"49":"14-18","50":"1-26"} },
  { rubNumber: 208, verseMapping: {"50":"27-45","51":"1-30"} },
  { rubNumber: 209, verseMapping: {"51":"31-60","52":"1-23"} },
  { rubNumber: 210, verseMapping: {"52":"24-49","53":"1-25"} },
  { rubNumber: 211, verseMapping: {"53":"26-62","54":"1-8"} },
  { rubNumber: 212, verseMapping: {"54":"9-55"} },
  { rubNumber: 213, verseMapping: {"55":"1-78"} },
  { rubNumber: 214, verseMapping: {"56":"1-74"} },
  { rubNumber: 215, verseMapping: {"56":"75-96","57":"1-15"} },
  { rubNumber: 216, verseMapping: {"57":"16-29"} },
  { rubNumber: 217, verseMapping: {"58":"1-13"} },
  { rubNumber: 218, verseMapping: {"58":"14-22","59":"1-10"} },
  { rubNumber: 219, verseMapping: {"59":"11-24","60":"1-6"} },
  { rubNumber: 220, verseMapping: {"60":"7-13","61":"1-14"} },
  { rubNumber: 221, verseMapping: {"62":"1-11","63":"1-3"} },
  { rubNumber: 222, verseMapping: {"63":"4-11","64":"1-18"} },
  { rubNumber: 223, verseMapping: {"65":"1-12"} },
  { rubNumber: 224, verseMapping: {"66":"1-12"} },
  { rubNumber: 225, verseMapping: {"67":"1-30"} },
  { rubNumber: 226, verseMapping: {"68":"1-52"} },
  { rubNumber: 227, verseMapping: {"69":"1-52","70":"1-18"} },
  { rubNumber: 228, verseMapping: {"70":"19-44","71":"1-28"} },
  { rubNumber: 229, verseMapping: {"72":"1-28","73":"1-19"} },
  { rubNumber: 230, verseMapping: {"73":"20-20","74":"1-56"} },
  { rubNumber: 231, verseMapping: {"75":"1-40","76":"1-18"} },
  { rubNumber: 232, verseMapping: {"76":"19-31","77":"1-50"} },
  { rubNumber: 233, verseMapping: {"78":"1-40","79":"1-46"} },
  { rubNumber: 234, verseMapping: {"80":"1-42","81":"1-29"} },
  { rubNumber: 235, verseMapping: {"82":"1-19","83":"1-36"} },
  { rubNumber: 236, verseMapping: {"84":"1-25","85":"1-22","86":"1-17"} },
  { rubNumber: 237, verseMapping: {"87":"1-19","88":"1-26","89":"1-30"} },
  { rubNumber: 238, verseMapping: {"90":"1-20","91":"1-15","92":"1-21","93":"1-11"} },
  { rubNumber: 239, verseMapping: {"94":"1-8","95":"1-8","96":"1-19","97":"1-5","98":"1-8","99":"1-8","100":"1-8"} },
  { rubNumber: 240, verseMapping: {"100":"9-11","101":"1-11","102":"1-8","103":"1-3","104":"1-9","105":"1-5","106":"1-4","107":"1-7","108":"1-3","109":"1-6","110":"1-3","111":"1-5","112":"1-4","113":"1-5","114":"1-6"} },
];

// ─── Arabic numeral conversion ───────────────────────────────────────────────

const ARABIC_NUMS = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
function toArabicNumeral(n: number): string {
  return n.toString().split('').map(d => ARABIC_NUMS[parseInt(d)]).join('');
}

// ─── Lookup helpers ──────────────────────────────────────────────────────────

/** Which Juz does this rub' belong to? (1–30) */
export function getJuzForRub(rubNumber: number): number {
  return Math.ceil(rubNumber / 8);
}

/** Which Hizb does this rub' belong to? (1–60) */
export function getHizbForRub(rubNumber: number): number {
  return Math.ceil(rubNumber / 4);
}

/** Which quarter within the hizb? (1–4) */
export function getQuarterInHizb(rubNumber: number): number {
  return ((rubNumber - 1) % 4) + 1;
}

const QUARTER_NAMES = ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'];

/**
 * Arabic label for a rub', e.g. "الحزب ٣ — الربع ٢"
 */
export function getRubLabel(rubNumber: number): string {
  const hizb = getHizbForRub(rubNumber);
  const quarter = getQuarterInHizb(rubNumber);
  return `الحزب ${toArabicNumeral(hizb)} — ${QUARTER_NAMES[quarter - 1]}`;
}

// ─── Pre-computed surah → rub' segments index ────────────────────────────────
// For each surah, which rub' entries touch it and what's the ayah range?

interface SurahRubSegment {
  rubNumber: number;
  startAyah: number;
  endAyah: number;
}

/** Build a map: surahId → array of rub' segments clipped to that surah */
function buildSurahRubIndex(): Map<number, SurahRubSegment[]> {
  const index = new Map<number, SurahRubSegment[]>();

  for (const rub of RUB_EL_HIZB_DATA) {
    for (const [surahStr, rangeStr] of Object.entries(rub.verseMapping)) {
      const surahId = parseInt(surahStr, 10);
      const [startStr, endStr] = rangeStr.split('-');
      const startAyah = parseInt(startStr, 10);
      const endAyah = parseInt(endStr, 10);

      if (!index.has(surahId)) {
        index.set(surahId, []);
      }
      index.get(surahId)!.push({
        rubNumber: rub.rubNumber,
        startAyah,
        endAyah,
      });
    }
  }

  // Sort each surah's segments by startAyah
  for (const [, segments] of index) {
    segments.sort((a, b) => a.startAyah - b.startAyah);
  }

  return index;
}

const SURAH_RUB_INDEX = buildSurahRubIndex();

/**
 * Get all rub' al-hizb segments that fall within a given surah,
 * returned as Thumn objects ready for the reader's pagination.
 */
export function getRubSegmentsForSurah(surahId: number): Thumn[] {
  const segments = SURAH_RUB_INDEX.get(surahId);
  if (!segments || segments.length === 0) {
    // Fallback for surahs with no data — shouldn't happen with complete data
    return [{
      surahId,
      thumnNumber: 1,
      startAyah: 1,
      endAyah: 1,
      label: getRubLabel(1),
    }];
  }

  return segments.map((seg, i) => ({
    surahId,
    thumnNumber: i + 1, // 1-based index within this surah
    startAyah: seg.startAyah,
    endAyah: seg.endAyah,
    label: getRubLabel(seg.rubNumber),
  }));
}

/**
 * Find which rub' segment (1-based index within surah) an ayah belongs to.
 */
export function getRubIndexForAyah(surahId: number, ayahNumber: number): number {
  const segments = SURAH_RUB_INDEX.get(surahId);
  if (!segments) return 1;

  for (let i = 0; i < segments.length; i++) {
    if (ayahNumber >= segments[i].startAyah && ayahNumber <= segments[i].endAyah) {
      return i + 1; // 1-based
    }
  }
  return 1;
}

/**
 * Get the global rub' number for an ayah.
 */
export function getGlobalRubForAyah(surahId: number, ayahNumber: number): number {
  const segments = SURAH_RUB_INDEX.get(surahId);
  if (!segments) return 1;

  for (const seg of segments) {
    if (ayahNumber >= seg.startAyah && ayahNumber <= seg.endAyah) {
      return seg.rubNumber;
    }
  }
  return 1;
}
