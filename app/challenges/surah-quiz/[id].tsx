import { View, Text, StyleSheet, Pressable, ActivityIndicator , ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../../src/constants/theme';
import { useQuranStore } from '../../../src/store/quranStore';
import { SURAH_LIST } from '../../../src/constants/surahList';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CountdownTimer from '../../../src/components/CountdownTimer';

type QuestionType = 'verse-count' | 'revelation' | 'juz' | 'order';

interface Question {
  text: string;
  options: { id: string; label: string; isCorrect: boolean }[];
  surahId: number;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickClusteredNumbers(correct: number, count: number, minBound: number, maxBound: number): number[] {
  const distractors = new Set<number>();
  while (distractors.size < count) {
    const offset = Math.floor(Math.random() * 9) - 4; // -4 to +4
    const candidate = correct + offset;
    if (candidate !== correct && candidate >= minBound && candidate <= maxBound) {
      distractors.add(candidate);
    }
  }
  return Array.from(distractors);
}

function generateQuestion(type: QuestionType): Question {
  const surah = SURAH_LIST[Math.floor(Math.random() * SURAH_LIST.length)];
  const allSurahs = SURAH_LIST;

  if (type === 'verse-count') {
    const distractors = pickClusteredNumbers(surah.verseCount, 5, 3, 286);
    return {
      surahId: surah.id,
      text: `كم عدد آيات سورة ${surah.nameArabic}؟`,
      options: shuffle([
        { id: 'c', label: `${surah.verseCount} آية`, isCorrect: true },
        ...distractors.map((d, i) => ({ id: `w${i}`, label: `${d} آية`, isCorrect: false })),
      ]),
    };
  }

  if (type === 'revelation') {
    const correctLabel = surah.revelationType === 'Makki' ? 'مكية' : 'مدنية';
    const wrongLabel = surah.revelationType === 'Makki' ? 'مدنية' : 'مكية';
    return {
      surahId: surah.id,
      text: `ما نوع سورة ${surah.nameArabic}؟`,
      options: shuffle([
        { id: 'c', label: correctLabel, isCorrect: true },
        { id: 'w0', label: wrongLabel, isCorrect: false },
      ]),
    };
  }

  if (type === 'juz') {
    const distractors = pickClusteredNumbers(surah.juzStart, 5, 1, 30);
    return {
      surahId: surah.id,
      text: `في أي جزء تبدأ سورة ${surah.nameArabic}؟`,
      options: shuffle([
        { id: 'c', label: `الجزء ${surah.juzStart}`, isCorrect: true },
        ...distractors.map((d, i) => ({ id: `w${i}`, label: `الجزء ${d}`, isCorrect: false })),
      ]),
    };
  }

  // order
  const distractors = pickClusteredNumbers(surah.orderInRevelation, 5, 1, 114);
  return {
    surahId: surah.id,
    text: `ما هو ترتيب سورة ${surah.nameArabic} في النزول؟`,
    options: shuffle([
      { id: 'c', label: `الترتيب ${surah.orderInRevelation}`, isCorrect: true },
      ...distractors.map((d, i) => ({ id: `w${i}`, label: `الترتيب ${d}`, isCorrect: false })),
    ]),
  };
}

const QUESTION_TYPES: QuestionType[] = ['verse-count', 'revelation', 'juz', 'order'];

export default function SurahQuizChallenge() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const markCompleted = useQuranStore(s => s.markCompleted);

  const [question, setQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);

  const nextQuestion = useCallback(() => {
    const type = QUESTION_TYPES[Math.floor(Math.random() * QUESTION_TYPES.length)];
    setQuestion(generateQuestion(type));
    setSelected(null);
    setSubmitted(false);
    setCorrect(false);
  }, []);

  useEffect(() => { nextQuestion(); }, []);

  const check = () => {
    if (!selected || !question) return;
    setSubmitted(true);
    const isCorrect = question.options.find(o => o.id === selected)?.isCorrect ?? false;
    setCorrect(isCorrect);
    if (isCorrect) markCompleted(question.surahId, 1, 200);
  };

  if (!question) return (
    <View style={[styles.container, styles.center]}>
      <ActivityIndicator size="large" color={Colors.surahQuiz} />
    </View>
  );

  const isRevelationType = question.options.length === 2;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>معلومات السور</Text>
        <Text style={styles.subtitle}>اختبر معرفتك بالقرآن الكريم</Text>
      </View>

      <CountdownTimer
        durationSeconds={20}
        onTimeUp={() => {
          setSubmitted(true);
          setCorrect(false);
        }}
        stopped={submitted}
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>

      <View style={styles.questionBox}>
        <Text style={styles.questionText}>{question.text}</Text>
      </View>

      <View style={[styles.optionsGrid, isRevelationType && styles.optionsGridTwoCol]}>
        {question.options.map(opt => {
          const isSelected = selected === opt.id;
          const showGreen = submitted && opt.isCorrect;
          const showRed = submitted && isSelected && !opt.isCorrect;
          return (
            <Pressable
              key={opt.id}
              style={[
                styles.option,
                isRevelationType && styles.optionHalf,
                isSelected && styles.optSelected,
                showGreen && styles.optCorrect,
                showRed && styles.optWrong,
              ]}
              onPress={() => !submitted && setSelected(opt.id)}
            >
              <Text style={[styles.optText, (showGreen || showRed || isSelected) && styles.optTextLight]}>
                {opt.label}
              </Text>
              {showGreen && <Text>✅</Text>}
              {showRed && <Text>❌</Text>}
            </Pressable>
          );
        })}
      </View>

            </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
        {submitted ? (
          <View style={styles.resultSection}>
            <Text style={correct ? styles.successText : styles.failText}>
              {correct
                ? 'ممتاز! +٢٠٠ نقطة 🌟'
                : `الإجابة الصحيحة: ${question.options.find(o => o.isCorrect)?.label}`}
            </Text>
            <Pressable style={styles.btn} onPress={nextQuestion}>
              <Text style={styles.btnText}>سؤال آخر</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={[styles.btn, !selected && styles.btnDisabled]} onPress={check} disabled={!selected}>
            <Text style={styles.btnText}>تحقق من الإجابة</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgLight, direction: 'rtl' },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { padding: Spacing.lg, backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.surface },
  title: { fontSize: Typography.heading2, fontWeight: 'bold', color: Colors.surahQuiz, textAlign: 'right' },
  subtitle: { fontSize: Typography.body, color: Colors.textSecondary, marginTop: 4, textAlign: 'right' },
  questionBox: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    padding: Spacing.xl, backgroundColor: Colors.patternOverlay,
  },
  questionText: {
    fontFamily: 'ScheherazadeNew', fontSize: Typography.ayahMd,
    color: Colors.textPrimary, textAlign: 'center', lineHeight: 50,
  },
  optionsGrid: { padding: Spacing.md, gap: Spacing.md },
  optionsGridTwoCol: { flexDirection: 'row', flexWrap: 'wrap' },
  option: {
    backgroundColor: Colors.bgCard, padding: Spacing.lg,
    borderRadius: BorderRadius.md, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, ...Shadow.card,
  },
  optionHalf: { flex: 1, marginHorizontal: Spacing.xs },
  optSelected: { backgroundColor: Colors.primaryLight, borderWidth: 2, borderColor: Colors.surahQuiz },
  optCorrect: { backgroundColor: Colors.success },
  optWrong: { backgroundColor: Colors.error },
  optText: { fontFamily: 'ScheherazadeNew', fontSize: Typography.heading3, color: Colors.textPrimary, textAlign: 'center' },
  optTextLight: { color: '#fff' },
  footer: { padding: Spacing.lg, backgroundColor: Colors.bgCard, borderTopWidth: 1, borderTopColor: Colors.surface },
  resultSection: { alignItems: 'center', gap: Spacing.md },
  successText: { color: Colors.success, fontSize: Typography.heading3, fontWeight: 'bold' },
  failText: { color: Colors.error, fontSize: Typography.body, fontWeight: 'bold', textAlign: 'center' },
  btn: { width: '100%', backgroundColor: Colors.surahQuiz, padding: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center' },
  btnDisabled: { backgroundColor: Colors.textMuted },
  btnText: { color: '#fff', fontSize: Typography.heading3, fontWeight: 'bold' },
});
