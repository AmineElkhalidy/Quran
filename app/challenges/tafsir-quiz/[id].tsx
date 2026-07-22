import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../../src/constants/theme';
import { useQuranStore } from '../../../src/store/quranStore';
import { fetchVersesForSurah } from '../../../src/services/quranApiService';
import { getSurahById } from '../../../src/constants/surahList';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CountdownTimer from '../../../src/components/CountdownTimer';
import VictoryOverlay from '../../../src/components/VictoryOverlay';
import { playHaptic } from '../../../src/utils/haptics';
import { playSound } from '../../../src/utils/audio';

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Dummy Tafsir database for the prototype
const MOCK_TAFSIR: Record<string, { correct: string, distractors: string[] }> = {
  // Al-Fatiha
  "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ": {
    correct: "الثناء على الله بصفات الكمال، وهو المربي لجميع خلقه بالنعم.",
    distractors: ["الأمر بالشكر فقط في أوقات الرخاء.", "الإقرار بأن الله خلق السماوات والأرض فقط.", "دعاء بطلب الهداية والرحمة."]
  },
  "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ": {
    correct: "دلنا وأرشدنا ووفقنا إلى الطريق الواضح الذي لا اعوجاج فيه (الإسلام).",
    distractors: ["أرشدنا إلى طريق الرزق والغنى في الدنيا.", "احفظنا من شرور الطريق ومخاطره.", "نجنا من عذاب القبر ويوم القيامة."]
  },
  // Al-Baqarah
  "الم": {
    correct: "حروف مقطعة للإشارة إلى إعجاز القرآن، وأنه مركب من هذه الحروف.",
    distractors: ["اسم من أسماء النبي صلى الله عليه وسلم.", "قسم من الله تعالى بالملائكة.", "كلمة سريانية تعني البداية."]
  }
};

export default function TafsirChallengeScreen() {
  const { id, startAyah: startAyahParam, endAyah: endAyahParam } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const markCompleted = useQuranStore(state => state.markCompleted);

  useEffect(() => {
    if (id === 'random') {
      const randomSurah = Math.floor(Math.random() * 114) + 1;
      router.replace(`/challenges/tafsir-quiz/${randomSurah}` as any);
    }
  }, [id, router]);

  // Parse optional rub' range params
  const rubStartAyah = startAyahParam ? parseInt(Array.isArray(startAyahParam) ? startAyahParam[0] : startAyahParam, 10) : undefined;
  const rubEndAyah = endAyahParam ? parseInt(Array.isArray(endAyahParam) ? endAyahParam[0] : endAyahParam, 10) : undefined;
  const isRubScoped = rubStartAyah != null && rubEndAyah != null;

  const surahIdNum = id === 'random' ? 1 : parseInt(Array.isArray(id) ? id[0] : id ?? '1', 10);
  const surah = getSurahById(surahIdNum);

  const [isLoading, setIsLoading] = useState(true);
  const [verseText, setVerseText] = useState('');
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchVersesForSurah(surahIdNum).then(allVerses => {
      // Scope to rub' range if params are provided
      const verses = isRubScoped
        ? allVerses.filter(v => v.ayahNumber >= rubStartAyah! && v.ayahNumber <= rubEndAyah!)
        : allVerses;

      if (cancelled || verses.length === 0) {
        setIsLoading(false);
        return;
      }

      // Pick a random verse from the Rub'
      const verseIndex = Math.floor(Math.random() * verses.length);
      const verse = verses[verseIndex];
      setVerseText(verse.text);
      
      // Look up in mock database, or generate fallback options
      const tafsirData = MOCK_TAFSIR[verse.text];
      
      let correctText = "";
      let distractors: string[] = [];

      if (tafsirData) {
        correctText = tafsirData.correct;
        distractors = tafsirData.distractors;
      } else {
        // Fallback generic generator for prototype
        const snippet = verse.text.split(' ').slice(0, 3).join(' ');
        correctText = `التفسير الصحيح والمطابق لمعنى (${snippet}...)`;
        distractors = [
          "تفسير خاطئ يركز على جانب فقهي غير موجود بالآية.",
          "تفسير لآية أخرى مشابهة في سورة مختلفة.",
          "تفسير مبني على رأي ضعيف ومخالف لإجماع المفسرين."
        ];
      }

      const optionsList: Option[] = [
        { id: 'correct', text: correctText, isCorrect: true },
        ...distractors.map((d, i) => ({ id: `wrong_${i}`, text: d, isCorrect: false }))
      ];

      setOptions(shuffleArray(optionsList));
      setIsLoading(false);
    });

    return () => { cancelled = true; };
  }, [surahIdNum]);

  const checkAnswer = () => {
    if (!selectedOption) return;
    setIsSubmitted(true);
    
    const correct = options.find(o => o.id === selectedOption)?.isCorrect ?? false;
    setIsCorrect(correct);

    if (correct) {
      playHaptic.success();
      playSound.success();
      markCompleted(surahIdNum, 1, 200); // 200 XP
    } else {
      playHaptic.error();
      playSound.error();
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.tafsirQuiz} />
      </View>
    );
  }

  if (options.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={{ fontSize: Typography.body, color: Colors.textMuted, marginBottom: Spacing.md }}>تعذر تحميل التحدي</Text>
        <Pressable style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>العودة</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isSubmitted && isCorrect && <VictoryOverlay xpEarned={200} />}
      
      <View style={styles.header}>
        <Text style={styles.title}>تحدي التفسير</Text>
        <Text style={styles.subtitle}>اختر التفسير الأقرب لمعنى هذه الآية من {surah?.nameArabic ?? 'القرآن الكريم'}.</Text>
      </View>

      <CountdownTimer
        durationSeconds={30}
        onTimeUp={() => {
          if (!isSubmitted) {
            setIsSubmitted(true);
            setIsCorrect(false);
          }
        }}
        stopped={isSubmitted}
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View style={styles.ayahContainer}>
          <Text style={styles.ayahText}>
            {verseText}
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {options.map((option) => {
            const isSelected = selectedOption === option.id;
            const showCorrect = isSubmitted && option.isCorrect;
            const showIncorrect = isSubmitted && isSelected && !option.isCorrect;

            return (
              <Pressable
                key={option.id}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionSelected,
                  showCorrect && styles.optionCorrect,
                  showIncorrect && styles.optionIncorrect,
                ]}
                onPress={() => !isSubmitted && setSelectedOption(option.id)}
              >
                <Text style={[
                  styles.optionText,
                  (showCorrect || showIncorrect || isSelected) && styles.optionTextLight
                ]}>
                  {option.text}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
        {isSubmitted ? (
          <View style={styles.resultSection}>
            {isCorrect ? (
              <Text style={styles.successText}>صحيح! +200 نقطة 🌟</Text>
            ) : (
              <Text style={styles.failText}>خطأ، حاول مرة أخرى.</Text>
            )}
            <View style={styles.footerButtons}>
              {isCorrect ? (
                <Pressable style={[styles.button, { flex: 1 }]} onPress={() => {
                  if (isRubScoped) {
                    router.replace({
                      pathname: `/challenges/tafsir-quiz/${surahIdNum}`,
                      params: { startAyah: rubStartAyah, endAyah: rubEndAyah, t: Date.now() }
                    } as any);
                  } else {
                    router.replace('/challenges/tafsir-quiz/random' as any);
                  }
                }}>
                  <Text style={styles.buttonText}>التحدي التالي</Text>
                </Pressable>
              ) : (
                <Pressable style={[styles.button, { flex: 1 }]} onPress={() => router.back()}>
                  <Text style={styles.buttonText}>خروج</Text>
                </Pressable>
              )}
            </View>
          </View>
        ) : (
          <Pressable 
            style={[styles.button, !selectedOption && styles.buttonDisabled]} 
            onPress={checkAnswer}
            disabled={!selectedOption}
          >
            <Text style={styles.buttonText}>تحقق من الإجابة</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
    direction: 'rtl',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: Spacing.lg,
    backgroundColor: Colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface,
  },
  title: {
    fontSize: Typography.heading2,
    fontWeight: 'bold',
    color: Colors.tafsirQuiz,
    textAlign: 'right',
  },
  subtitle: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'right',
  },
  ayahContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.patternOverlay,
    minHeight: 150,
  },
  ayahText: {
    fontFamily: Typography.quranFont,
    fontSize: Typography.ayahMd,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 50,
  },
  optionsContainer: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  optionCard: {
    backgroundColor: Colors.bgCard,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    ...Shadow.card,
  },
  optionSelected: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 2,
    borderColor: Colors.primaryDark,
  },
  optionCorrect: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  optionIncorrect: {
    backgroundColor: Colors.error,
    borderColor: Colors.error,
  },
  optionText: {
    fontFamily: Typography.uiFont,
    fontSize: Typography.body,
    color: Colors.textPrimary,
    textAlign: 'right',
    lineHeight: 22,
  },
  optionTextLight: {
    color: Colors.textLight,
  },
  footer: {
    padding: Spacing.lg,
    backgroundColor: Colors.bgCard,
    borderTopWidth: 1,
    borderTopColor: Colors.surface,
  },
  resultSection: {
    alignItems: 'center',
  },
  successText: {
    color: Colors.success,
    fontSize: Typography.heading3,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
  },
  failText: {
    color: Colors.error,
    fontSize: Typography.heading3,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  button: {
    width: '100%',
    backgroundColor: Colors.tafsirQuiz,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: Colors.textMuted,
  },
  buttonText: {
    color: Colors.textLight,
    fontSize: Typography.heading3,
    fontWeight: 'bold',
  },
});
