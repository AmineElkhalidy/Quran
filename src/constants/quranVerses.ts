// ─── Embedded Quran Verse Data (Warsh an Nafi') ─────────────────────────────
// A small embedded corpus of short surahs for the reader to use.
// In production, this would be loaded from a full JSON corpus or database.

export interface VerseData {
  surahId: number;
  ayahNumber: number;
  textWarsh: string;
}

const VERSES: VerseData[] = [
  // ── Surah Al-Fatiha (1) ──────────────────────────────────────────────────
  { surahId: 1, ayahNumber: 1, textWarsh: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' },
  { surahId: 1, ayahNumber: 2, textWarsh: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ' },
  { surahId: 1, ayahNumber: 3, textWarsh: 'الرَّحْمَٰنِ الرَّحِيمِ' },
  { surahId: 1, ayahNumber: 4, textWarsh: 'مَلِكِ يَوْمِ الدِّينِ' },
  { surahId: 1, ayahNumber: 5, textWarsh: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ' },
  { surahId: 1, ayahNumber: 6, textWarsh: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ' },
  { surahId: 1, ayahNumber: 7, textWarsh: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ' },

  // ── Surah Al-Ikhlas (112) ─────────────────────────────────────────────────
  { surahId: 112, ayahNumber: 1, textWarsh: 'قُلْ هُوَ اللَّهُ أَحَدٌ' },
  { surahId: 112, ayahNumber: 2, textWarsh: 'اللَّهُ الصَّمَدُ' },
  { surahId: 112, ayahNumber: 3, textWarsh: 'لَمْ يَلِدْ وَلَمْ يُولَدْ' },
  { surahId: 112, ayahNumber: 4, textWarsh: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ' },

  // ── Surah Al-Falaq (113) ──────────────────────────────────────────────────
  { surahId: 113, ayahNumber: 1, textWarsh: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ' },
  { surahId: 113, ayahNumber: 2, textWarsh: 'مِن شَرِّ مَا خَلَقَ' },
  { surahId: 113, ayahNumber: 3, textWarsh: 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ' },
  { surahId: 113, ayahNumber: 4, textWarsh: 'وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ' },
  { surahId: 113, ayahNumber: 5, textWarsh: 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ' },

  // ── Surah An-Nas (114) ────────────────────────────────────────────────────
  { surahId: 114, ayahNumber: 1, textWarsh: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ' },
  { surahId: 114, ayahNumber: 2, textWarsh: 'مَلِكِ النَّاسِ' },
  { surahId: 114, ayahNumber: 3, textWarsh: 'إِلَٰهِ النَّاسِ' },
  { surahId: 114, ayahNumber: 4, textWarsh: 'مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ' },
  { surahId: 114, ayahNumber: 5, textWarsh: 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ' },
  { surahId: 114, ayahNumber: 6, textWarsh: 'مِنَ الْجِنَّةِ وَالنَّاسِ' },

  // ── Surah Al-Kawthar (108) ────────────────────────────────────────────────
  { surahId: 108, ayahNumber: 1, textWarsh: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ' },
  { surahId: 108, ayahNumber: 2, textWarsh: 'فَصَلِّ لِرَبِّكَ وَانْحَرْ' },
  { surahId: 108, ayahNumber: 3, textWarsh: 'إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ' },

  // ── Surah Al-Asr (103) ────────────────────────────────────────────────────
  { surahId: 103, ayahNumber: 1, textWarsh: 'وَالْعَصْرِ' },
  { surahId: 103, ayahNumber: 2, textWarsh: 'إِنَّ الْإِنسَانَ لَفِي خُسْرٍ' },
  { surahId: 103, ayahNumber: 3, textWarsh: 'إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ' },

  // ── Surah Al-Fil (105) ────────────────────────────────────────────────────
  { surahId: 105, ayahNumber: 1, textWarsh: 'أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَابِ الْفِيلِ' },
  { surahId: 105, ayahNumber: 2, textWarsh: 'أَلَمْ يَجْعَلْ كَيْدَهُمْ فِي تَضْلِيلٍ' },
  { surahId: 105, ayahNumber: 3, textWarsh: 'وَأَرْسَلَ عَلَيْهِمْ طَيْرًا أَبَابِيلَ' },
  { surahId: 105, ayahNumber: 4, textWarsh: 'تَرْمِيهِم بِحِجَارَةٍ مِّن سِجِّيلٍ' },
  { surahId: 105, ayahNumber: 5, textWarsh: 'فَجَعَلَهُمْ كَعَصْفٍ مَّأْكُولٍ' },

  // ── Surah Al-Kafirun (109) ────────────────────────────────────────────────
  { surahId: 109, ayahNumber: 1, textWarsh: 'قُلْ يَا أَيُّهَا الْكَافِرُونَ' },
  { surahId: 109, ayahNumber: 2, textWarsh: 'لَا أَعْبُدُ مَا تَعْبُدُونَ' },
  { surahId: 109, ayahNumber: 3, textWarsh: 'وَلَا أَنتُمْ عَابِدُونَ مَا أَعْبُدُ' },
  { surahId: 109, ayahNumber: 4, textWarsh: 'وَلَا أَنَا عَابِدٌ مَّا عَبَدتُّمْ' },
  { surahId: 109, ayahNumber: 5, textWarsh: 'وَلَا أَنتُمْ عَابِدُونَ مَا أَعْبُدُ' },
  { surahId: 109, ayahNumber: 6, textWarsh: 'لَكُمْ دِينُكُمْ وَلِيَ دِينِ' },

  // ── Surah An-Nasr (110) ───────────────────────────────────────────────────
  { surahId: 110, ayahNumber: 1, textWarsh: 'إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ' },
  { surahId: 110, ayahNumber: 2, textWarsh: 'وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا' },
  { surahId: 110, ayahNumber: 3, textWarsh: 'فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُ إِنَّهُ كَانَ تَوَّابًا' },

  // ── Surah Al-Masad (111) ──────────────────────────────────────────────────
  { surahId: 111, ayahNumber: 1, textWarsh: 'تَبَّتْ يَدَا أَبِي لَهَبٍ وَتَبَّ' },
  { surahId: 111, ayahNumber: 2, textWarsh: 'مَا أَغْنَىٰ عَنْهُ مَالُهُ وَمَا كَسَبَ' },
  { surahId: 111, ayahNumber: 3, textWarsh: 'سَيَصْلَىٰ نَارًا ذَاتَ لَهَبٍ' },
  { surahId: 111, ayahNumber: 4, textWarsh: 'وَامْرَأَتُهُ حَمَّالَةَ الْحَطَبِ' },
  { surahId: 111, ayahNumber: 5, textWarsh: 'فِي جِيدِهَا حَبْلٌ مِّن مَّسَدٍ' },
];

/**
 * Get all verses for a given surah.
 * Returns an empty array if the surah is not in the embedded dataset.
 */
export function getVersesForSurah(surahId: number): VerseData[] {
  return VERSES.filter(v => v.surahId === surahId);
}

/**
 * Get a specific verse.
 */
export function getVerse(surahId: number, ayahNumber: number): VerseData | undefined {
  return VERSES.find(v => v.surahId === surahId && v.ayahNumber === ayahNumber);
}

/**
 * Check if we have embedded verse data for a given surah.
 */
export function hasVerseData(surahId: number): boolean {
  return VERSES.some(v => v.surahId === surahId);
}
