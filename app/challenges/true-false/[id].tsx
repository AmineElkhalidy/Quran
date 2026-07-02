import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../../src/constants/theme';
import { useQuranStore } from '../../../src/store/quranStore';
import { SURAH_LIST } from '../../../src/constants/surahList';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TFQuestion {
  statement: string;
  answer: boolean; // true = صح, false = خطأ
  surahId: number;
  explanation: string;
}

function generateTFQuestion(): TFQuestion {
  const idx = Math.floor(Math.random() * SURAH_LIST.length);
  const surah = SURAH_LIST[idx];

  const questionFns: Array<() => TFQuestion> = [
    // Verse count — true
    () => ({
      surahId: surah.id,
      statement: `سورة ${surah.nameArabic} تحتوي على ${surah.verseCount} آية`,
      answer: true,
      explanation: `نعم، سورة ${surah.nameArabic} تحتوي على ${surah.verseCount} آية`,
    }),
    // Verse count — false (random wrong count)
    () => {
      let wrongCount = surah.verseCount;
      while (wrongCount === surah.verseCount) wrongCount = Math.floor(Math.random() * 200) + 3;
      return {
        surahId: surah.id,
        statement: `سورة ${surah.nameArabic} تحتوي على ${wrongCount} آية`,
        answer: false,
        explanation: `خطأ، سورة ${surah.nameArabic} تحتوي على ${surah.verseCount} آية`,
      };
    },
    // Revelation type — true
    () => {
      const typeAr = surah.revelationType === 'Makki' ? 'مكية' : 'مدنية';
      return {
        surahId: surah.id,
        statement: `سورة ${surah.nameArabic} ${typeAr}`,
        answer: true,
        explanation: `نعم، سورة ${surah.nameArabic} ${typeAr}`,
      };
    },
    // Revelation type — false (swapped)
    () => {
      const typeAr = surah.revelationType === 'Makki' ? 'مدنية' : 'مكية';
      const correct = surah.revelationType === 'Makki' ? 'مكية' : 'مدنية';
      return {
        surahId: surah.id,
        statement: `سورة ${surah.nameArabic} ${typeAr}`,
        answer: false,
        explanation: `خطأ، سورة ${surah.nameArabic} ${correct}`,
      };
    },
    // Juz — true
    () => ({
      surahId: surah.id,
      statement: `سورة ${surah.nameArabic} تبدأ في الجزء ${surah.juzStart}`,
      answer: true,
      explanation: `نعم، سورة ${surah.nameArabic} تبدأ في الجزء ${surah.juzStart}`,
    }),
    // Juz — false
    () => {
      let wrongJuz = surah.juzStart;
      while (wrongJuz === surah.juzStart) wrongJuz = Math.floor(Math.random() * 30) + 1;
      return {
        surahId: surah.id,
        statement: `سورة ${surah.nameArabic} تبدأ في الجزء ${wrongJuz}`,
        answer: false,
        explanation: `خطأ، سورة ${surah.nameArabic} تبدأ في الجزء ${surah.juzStart}`,
      };
    },
  ];

  const fn = questionFns[Math.floor(Math.random() * questionFns.length)];
  return fn();
}

export default function TrueFalseChallenge() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const markCompleted = useQuranStore(s => s.markCompleted);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const [question, setQuestion] = useState<TFQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [streak, setStreak] = useState(0);

  const nextQuestion = useCallback(() => {
    setQuestion(generateTFQuestion());
    setUserAnswer(null);
    setSubmitted(false);
    setIsCorrect(false);
  }, []);

  useEffect(() => { nextQuestion(); }, []);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const answer = (choice: boolean) => {
    if (submitted || !question) return;
    setUserAnswer(choice);
    setSubmitted(true);
    const correct = choice === question.answer;
    setIsCorrect(correct);
    if (correct) {
      setStreak(s => s + 1);
      markCompleted(question.surahId, 1, 50);
    } else {
      setStreak(0);
      shake();
    }
  };

  if (!question) return <View style={[styles.container, styles.center]} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>صح أم خطأ؟</Text>
        <View style={styles.streakRow}>
          <Text style={styles.subtitle}>اختبر معلوماتك عن القرآن الكريم</Text>
          {streak > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>🔥 {streak}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Statement */}
      <Animated.View style={[styles.statementBox, { transform: [{ translateX: shakeAnim }] }]}>
        <Text style={styles.statementText}>{question.statement}</Text>
        {submitted && (
          <Text style={[styles.explanationText, isCorrect ? styles.explCorrect : styles.explWrong]}>
            {question.explanation}
          </Text>
        )}
      </Animated.View>

      {/* Buttons */}
      <View style={styles.buttonsRow}>
        <Pressable
          style={[
            styles.choiceBtn,
            styles.trueBtn,
            submitted && question.answer === true && styles.correctHighlight,
            submitted && userAnswer === true && !isCorrect && styles.wrongHighlight,
          ]}
          onPress={() => answer(true)}
          disabled={submitted}
        >
          <Text style={styles.choiceIcon}>✅</Text>
          <Text style={styles.choiceLabel}>صح</Text>
        </Pressable>

        <Pressable
          style={[
            styles.choiceBtn,
            styles.falseBtn,
            submitted && question.answer === false && styles.correctHighlight,
            submitted && userAnswer === false && !isCorrect && styles.wrongHighlight,
          ]}
          onPress={() => answer(false)}
          disabled={submitted}
        >
          <Text style={styles.choiceIcon}>❌</Text>
          <Text style={styles.choiceLabel}>خطأ</Text>
        </Pressable>
      </View>

      {/* Result footer */}
      {submitted && (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
          <Text style={isCorrect ? styles.successText : styles.failText}>
            {isCorrect ? `أحسنت! +٥٠ نقطة 🌟` : 'إجابة خاطئة!'}
          </Text>
          <Pressable style={styles.nextBtn} onPress={nextQuestion}>
            <Text style={styles.nextBtnText}>السؤال التالي</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgLight },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { padding: Spacing.lg, backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.surface },
  title: { fontSize: Typography.heading2, fontWeight: 'bold', color: Colors.trueFalse, textAlign: 'right' },
  streakRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  subtitle: { fontSize: Typography.body, color: Colors.textSecondary, textAlign: 'right' },
  streakBadge: { backgroundColor: Colors.gold, paddingHorizontal: 12, paddingVertical: 4, borderRadius: BorderRadius.full },
  streakText: { color: '#fff', fontWeight: 'bold', fontSize: Typography.caption },
  statementBox: {
    flex: 1, padding: Spacing.xl,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.patternOverlay,
    gap: Spacing.lg,
  },
  statementText: {
    fontFamily: 'ScheherazadeNew', fontSize: Typography.ayahMd,
    color: Colors.textPrimary, textAlign: 'center', lineHeight: 50,
  },
  explanationText: {
    fontFamily: 'ScheherazadeNew', fontSize: Typography.body + 2,
    textAlign: 'center', lineHeight: 34, paddingHorizontal: Spacing.md,
  },
  explCorrect: { color: Colors.success },
  explWrong: { color: Colors.error },
  buttonsRow: {
    flexDirection: 'row', padding: Spacing.lg, gap: Spacing.lg,
    backgroundColor: Colors.bgCard, borderTopWidth: 1, borderTopColor: Colors.surface,
  },
  choiceBtn: {
    flex: 1, borderRadius: BorderRadius.lg, paddingVertical: Spacing.lg,
    alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, ...Shadow.card,
  },
  trueBtn: { backgroundColor: '#E6FFED', borderWidth: 2, borderColor: Colors.success },
  falseBtn: { backgroundColor: '#FFF5F5', borderWidth: 2, borderColor: Colors.error },
  correctHighlight: { backgroundColor: Colors.success, borderColor: Colors.success },
  wrongHighlight: { backgroundColor: Colors.error, borderColor: Colors.error },
  choiceIcon: { fontSize: 36 },
  choiceLabel: { fontSize: Typography.heading2, fontWeight: 'bold', color: Colors.textPrimary },
  footer: {
    padding: Spacing.lg, backgroundColor: Colors.bgCard,
    borderTopWidth: 1, borderTopColor: Colors.surface, gap: Spacing.md, alignItems: 'center',
  },
  successText: { color: Colors.success, fontSize: Typography.heading3, fontWeight: 'bold' },
  failText: { color: Colors.error, fontSize: Typography.heading3, fontWeight: 'bold' },
  nextBtn: { width: '100%', backgroundColor: Colors.trueFalse, padding: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center' },
  nextBtnText: { color: '#fff', fontSize: Typography.heading3, fontWeight: 'bold' },
});
