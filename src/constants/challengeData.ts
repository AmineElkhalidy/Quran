export interface WordMeaningQuestion {
  word: string;
  ayahContext: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TajweedQuestion {
  ayahContext: string;
  highlightedWord: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface SimilarVerseQuestion {
  ayahSnippet: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const WORD_MEANINGS: WordMeaningQuestion[] = [
  {
    word: 'غَاسِقٍ',
    ayahContext: 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ',
    options: ['الليل إذا أظلم', 'القمر', 'السحر', 'النار'],
    correctIndex: 0,
    explanation: 'الغاسق هو الليل إذا اشتدت ظلمته، ووقب أي دخل بظلامه.',
  },
  {
    word: 'الصَّمَدُ',
    ayahContext: 'اللَّهُ الصَّمَدُ',
    options: ['القوي', 'الذي يقصده الخلائق في حوائجهم', 'الخالق', 'الغفور'],
    correctIndex: 1,
    explanation: 'الصمد هو السيد الذي يُقصد في الحوائج كلها ولا يحتاج إلى أحد.',
  },
  {
    word: 'ضَبْحًا',
    ayahContext: 'وَالْعَادِيَاتِ ضَبْحًا',
    options: ['صوت أنفاس الخيل', 'الغبار المتطاير', 'السرعة الشديدة', 'حوافر الخيل'],
    correctIndex: 0,
    explanation: 'الضبح هو صوت أنفاس الخيل حين تعدو بقوة في سبيل الله.',
  },
  {
    word: 'سِجِّيلٍ',
    ayahContext: 'تَرْمِيهِم بِحِجَارَةٍ مِّن سِجِّيلٍ',
    options: ['طين مطبوخ كالحجر', 'نار جهنم', 'حديد صلب', 'جبال عالية'],
    correctIndex: 0,
    explanation: 'سجيل يعني الطين المتحجر والمطبوخ بنار.',
  },
  {
    word: 'الْقَارِعَةُ',
    ayahContext: 'الْقَارِعَةُ (1) مَا الْقَارِعَةُ',
    options: ['يوم القيامة', 'جهنم', 'الصيحة العظيمة', 'المصيبة'],
    correctIndex: 0,
    explanation: 'القارعة اسم من أسماء يوم القيامة، سُميت بذلك لأنها تقرع القلوب بأهوالها.',
  }
];

export const TAJWEED_RULES: TajweedQuestion[] = [
  {
    ayahContext: 'مِن مَّاءٍ مَّهِينٍ',
    highlightedWord: 'مِن مَّاءٍ',
    options: ['إدغام بغنة', 'إدغام بغير غنة', 'إخفاء', 'إظهار'],
    correctIndex: 0,
    explanation: 'نون ساكنة بعدها حرف الميم (من حروف ينمو)، فهو إدغام بغنة.',
  },
  {
    ayahContext: 'أَنزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ',
    highlightedWord: 'أَنزَلْنَاهُ',
    options: ['إظهار', 'إخفاء حقيقي', 'إقلاب', 'إدغام'],
    correctIndex: 1,
    explanation: 'نون ساكنة بعدها حرف الزاي، وهو من حروف الإخفاء الحقيقي.',
  },
  {
    ayahContext: 'مِن بَعْدِ',
    highlightedWord: 'مِن بَعْدِ',
    options: ['إخفاء', 'إدغام', 'إظهار', 'إقلاب'],
    correctIndex: 3,
    explanation: 'نون ساكنة بعدها حرف الباء، فتقلب النون ميماً مخفاة مع الغنة (إقلاب).',
  },
  {
    ayahContext: 'لَمْ يَلِدْ وَلَمْ يُولَدْ',
    highlightedWord: 'يَلِدْ',
    options: ['قلقلة صغرى', 'قلقلة كبرى', 'إخفاء', 'مد طبيعي'],
    correctIndex: 0,
    explanation: 'حرف الدال ساكن في وسط الكلام أو آخره موصولاً، فيكون قلقلة صغرى.',
  },
  {
    ayahContext: 'سَمِيعٌ عَلِيمٌ',
    highlightedWord: 'سَمِيعٌ عَلِيمٌ',
    options: ['إخفاء', 'إدغام', 'إظهار حلقي', 'إقلاب'],
    correctIndex: 2,
    explanation: 'تنوين بعده حرف العين (من حروف الحلق)، فهو إظهار حلقي.',
  }
];

export const SIMILAR_VERSES: SimilarVerseQuestion[] = [
  {
    ayahSnippet: 'وَمَا اللَّهُ بِغَافِلٍ عَمَّا تَعْمَلُونَ',
    options: ['سورة البقرة', 'سورة آل عمران', 'سورة المائدة', 'سورة الأنعام'],
    correctIndex: 0,
    explanation: 'وردت هذه الصيغة بتاء المخاطب (تعملون) عدة مرات في سورة البقرة، بينما وردت (يعملون) في مواضع أخرى.',
  },
  {
    ayahSnippet: 'فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ',
    options: ['سورة الواقعة', 'سورة الرحمن', 'سورة الحاقة', 'سورة القمر'],
    correctIndex: 1,
    explanation: 'هذه الآية تكررت 31 مرة في سورة الرحمن.',
  },
  {
    ayahSnippet: 'وَيْلٌ يَوْمَئِذٍ لِّلْمُكَذِّبِينَ',
    options: ['سورة المطففين', 'سورة المرسلات', 'سورة النبأ', 'سورة النازعات'],
    correctIndex: 1,
    explanation: 'هذه الآية تكررت 10 مرات في سورة المرسلات.',
  },
  {
    ayahSnippet: 'إِنَّ فِي ذَٰلِكَ لَآيَةً ۖ وَمَا كَانَ أَكْثَرُهُم مُّؤْمِنِينَ',
    options: ['سورة الشعراء', 'سورة النمل', 'سورة القصص', 'سورة طه'],
    correctIndex: 0,
    explanation: 'هذا المقطع يتكرر كخاتمة لقصص الأنبياء في سورة الشعراء (8 مرات).',
  }
];
