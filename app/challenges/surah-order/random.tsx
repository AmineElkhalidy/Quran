import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../../src/constants/theme';
import { useQuranStore } from '../../../src/store/quranStore';
import { SURAH_LIST } from '../../../src/constants/surahList';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SurahOrderQuestion {
  questionText: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

function generateSurahOrderQuestion(): SurahOrderQuestion {
  // Decide 'before' (0) or 'after' (1)
  const isAfter = Math.random() > 0.5;
  
  let targetIdx: number;
  let correctSurah: any;
  let referenceSurah: any;

  if (isAfter) {
    // Cannot pick the last Surah (An-Nas) to ask what comes after it
    referenceSurah = SURAH_LIST[Math.floor(Math.random() * 113)];
    targetIdx = referenceSurah.id; // Because id is 1-indexed, target is id (which is idx + 1)
    correctSurah = SURAH_LIST[targetIdx];
  } else {
    // Cannot pick the first Surah (Al-Fatiha) to ask what comes before it
    referenceSurah = SURAH_LIST[Math.floor(Math.random() * 113) + 1];
    targetIdx = referenceSurah.id - 2;
    correctSurah = SURAH_LIST[targetIdx];
  }

  const questionText = isAfter 
    ? `أي سورة تأتي بعد سورة ${referenceSurah.nameArabic} في المصحف؟`
    : `أي سورة تأتي قبل سورة ${referenceSurah.nameArabic} في المصحف؟`;

  // Generate 3 random wrong options
  const wrongOptions = new Set<string>();
  while (wrongOptions.size < 3) {
    const randomSurah = SURAH_LIST[Math.floor(Math.random() * 114)];
    if (randomSurah.id !== correctSurah.id) {
      wrongOptions.add(randomSurah.nameArabic);
    }
  }

  const options = Array.from(wrongOptions);
  // Insert correct option at random index
  const correctIndex = Math.floor(Math.random() * 4);
  options.splice(correctIndex, 0, correctSurah.nameArabic);

  return {
    questionText,
    options,
    correctIndex,
    explanation: isAfter 
      ? `سورة ${correctSurah.nameArabic} تلي سورة ${referenceSurah.nameArabic} مباشرة.`
      : `سورة ${correctSurah.nameArabic} تسبق سورة ${referenceSurah.nameArabic} مباشرة.`,
  };
}

export default function SurahOrderChallenge() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const markCompleted = useQuranStore(s => s.markCompleted);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const [question, setQuestion] = useState<SurahOrderQuestion | null>(null);
  const [prevText, setPrevText] = useState<string | null>(null);
  const [userAnswer, setUserAnswer] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [streak, setStreak] = useState(0);

  const nextQuestion = useCallback(() => {
    let newQ = generateSurahOrderQuestion();
    while (newQ.questionText === prevText) {
      newQ = generateSurahOrderQuestion();
    }
    setPrevText(newQ.questionText);
    setQuestion(newQ);
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

  const answer = (idx: number) => {
    if (submitted || !question) return;
    setUserAnswer(idx);
    setSubmitted(true);
    const correct = idx === question.correctIndex;
    setIsCorrect(correct);
    if (correct) {
      setStreak(s => s + 1);
      markCompleted(1, 1, 50); 
    } else {
      setStreak(0);
      shake();
    }
  };

  if (!question) return <View style={[styles.container, styles.center]} />;

  return (
    <>
      <Stack.Screen options={{ title: 'ترتيب السور', headerTitleAlign: 'center' }} />
      <View style={styles.container}>
        <View style={styles.header}>
        <Text style={styles.title}>ترتيب السور</Text>
        <View style={styles.streakRow}>
          <Text style={styles.subtitle}>اختبر حفظك لترتيب سور المصحف</Text>
          {streak > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>🔥 {streak}</Text>
            </View>
          )}
        </View>
      </View>

      <Animated.View style={[styles.statementBox, { transform: [{ translateX: shakeAnim }] }]}>
        <Text style={styles.statementText}>{question.questionText}</Text>
        {submitted && (
          <Text style={[styles.explanationText, isCorrect ? styles.explCorrect : styles.explWrong]}>
            {question.explanation}
          </Text>
        )}
      </Animated.View>

      <View style={styles.optionsContainer}>
        {question.options.map((opt, idx) => {
          const isSelected = userAnswer === idx;
          const isActualCorrect = question.correctIndex === idx;
          let btnStyle = styles.optionBtn;
          let textStyle = styles.optionText;

          if (submitted) {
            if (isActualCorrect) {
              btnStyle = [styles.optionBtn, styles.correctBtn];
              textStyle = [styles.optionText, styles.correctText];
            } else if (isSelected && !isActualCorrect) {
              btnStyle = [styles.optionBtn, styles.wrongBtn];
              textStyle = [styles.optionText, styles.wrongText];
            }
          }

          return (
            <Pressable
              key={idx}
              style={btnStyle}
              onPress={() => answer(idx)}
              disabled={submitted}
            >
              <Text style={textStyle}>{opt}</Text>
            </Pressable>
          );
        })}
      </View>

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
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgLight, direction: 'rtl' },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { padding: Spacing.lg, backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.surface },
  title: { fontSize: Typography.heading2, fontWeight: 'bold', color: Colors.surahOrder, textAlign: 'right' },
  streakRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  subtitle: { fontSize: Typography.body, color: Colors.textSecondary, textAlign: 'right' },
  streakBadge: { backgroundColor: Colors.gold, paddingHorizontal: 12, paddingVertical: 4, borderRadius: BorderRadius.full },
  streakText: { color: '#fff', fontWeight: 'bold', fontSize: Typography.caption },
  statementBox: {
    padding: Spacing.xl,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.patternOverlay,
    minHeight: 180,
    gap: Spacing.lg,
  },
  statementText: {
    fontFamily: Typography.uiFont, fontSize: Typography.heading1, fontWeight: 'bold',
    color: Colors.textPrimary, textAlign: 'center', lineHeight: 40,
  },
  explanationText: {
    fontFamily: Typography.uiFont, fontSize: Typography.body,
    textAlign: 'center', lineHeight: 24, paddingHorizontal: Spacing.md,
  },
  explCorrect: { color: Colors.success },
  explWrong: { color: Colors.error },
  optionsContainer: { flex: 1, padding: Spacing.lg, gap: Spacing.md, backgroundColor: Colors.bgCard },
  optionBtn: {
    backgroundColor: Colors.surface, padding: Spacing.lg,
    borderRadius: BorderRadius.md, alignItems: 'center',
  },
  optionText: { fontFamily: Typography.quranFontBold, fontSize: Typography.heading2, color: Colors.textPrimary },
  correctBtn: { backgroundColor: '#E6FFED', borderWidth: 2, borderColor: Colors.success },
  correctText: { color: Colors.success },
  wrongBtn: { backgroundColor: '#FFF5F5', borderWidth: 2, borderColor: Colors.error },
  wrongText: { color: Colors.error },
  footer: {
    padding: Spacing.lg, backgroundColor: Colors.bgCard,
    borderTopWidth: 1, borderTopColor: Colors.surface, gap: Spacing.md, alignItems: 'center',
  },
  successText: { color: Colors.success, fontSize: Typography.heading3, fontWeight: 'bold' },
  failText: { color: Colors.error, fontSize: Typography.heading3, fontWeight: 'bold' },
  nextBtn: { width: '100%', backgroundColor: Colors.surahOrder, padding: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center' },
  nextBtnText: { color: '#fff', fontSize: Typography.heading3, fontWeight: 'bold' },
});
