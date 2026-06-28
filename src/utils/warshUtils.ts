// ─── Warsh Rules Explanations & Utilities ───────────────────────────────────

export interface WarshRule {
  id: string;
  nameArabic: string;
  nameEnglish: string;
  description: string;
  examples: string[];
}

export const WARSH_RULES: WarshRule[] = [
  {
    id: 'naql',
    nameArabic: 'النقل',
    nameEnglish: 'Transfer of Vowel (Naql)',
    description: 'In Warsh, when a word ends with a consonant and the next word begins with Hamzat al-Qat (ء), the vowel of the Hamzah is transferred to the preceding consonant, and the Hamzah is dropped.',
    examples: ['مَنْ ءَامَنَ becomes مَنَ َامَنَ', 'قَدْ أَفْلَحَ becomes قَدَ َفْلَحَ']
  },
  {
    id: 'badal',
    nameArabic: 'مد البدل',
    nameEnglish: 'Badal Prolongation',
    description: 'When a Hamzah precedes a Madd letter, Warsh allows 2, 4, or 6 counts of prolongation, whereas Hafs only allows 2 counts.',
    examples: ['ءَامَنُوا', 'أُوتُوا', 'إِيمَانًا']
  },
  {
    id: 'taghleez_lam',
    nameArabic: 'تغليظ اللام',
    nameEnglish: 'Thickening of the Lam',
    description: 'The letter Lam (ل) is pronounced with a heavy/thick sound (Mufakhkham) if it has a Fathah and is preceded by Sad (ص), Ta (ط), or Dha (ظ) that has either a Fathah or Sukun.',
    examples: ['الصَّلَاةَ', 'الطَّلَاقِ', 'مَطْلَعِ']
  },
  {
    id: 'tarqeeq_ra',
    nameArabic: 'ترقيق الراء',
    nameEnglish: 'Thinning of the Ra',
    description: 'The letter Ra (ر) with a Fathah or Dammah is pronounced light (Muraqqaq) if preceded by a Kasrah or a Ya with Sukun, with some exceptions.',
    examples: ['فِرْعَوْنَ', 'خَيْرٌ']
  },
  {
    id: 'taqleel',
    nameArabic: 'التقليل',
    nameEnglish: 'Taqleel (Minor Imalah)',
    description: 'A pronunciation between Fathah and Kasrah (closer to an "e" sound), applied to Alif Maqsura at the end of words, especially in certain Surahs.',
    examples: ['مُوسَىٰ', 'يَحْيَىٰ', 'الْهُدَىٰ']
  }
];

export function getRuleById(id: string): WarshRule | undefined {
  return WARSH_RULES.find(rule => rule.id === id);
}
