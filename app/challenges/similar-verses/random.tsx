import { View, Text, StyleSheet, Pressable, Animated , ScrollView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../../src/constants/theme';
import { useQuranStore } from '../../../src/store/quranStore';
import { SIMILAR_VERSES, SimilarVerseQuestion } from '../../../src/constants/challengeData';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CountdownTimer from '../../../src/components/CountdownTimer';

export default function SimilarVersesChallenge() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const markCompleted = useQuranStore(s => s.markCompleted);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const [question, setQuestion] = useState<SimilarVerseQuestion | null>(null);
  const [prevSnippet, setPrevSnippet] = useState<string | null>(null);
  const [userAnswer, setUserAnswer] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [streak, setStreak] = useState(0);

  const nextQuestion = useCallback(() => {
    let randomQ = SIMILAR_VERSES[Math.floor(Math.random() * SIMILAR_VERSES.length)];
    while (randomQ.ayahSnippet === prevSnippet && SIMILAR_VERSES.length > 1) {
      randomQ = SIMILAR_VERSES[Math.floor(Math.random() * SIMILAR_VERSES.length)];
    }
    const correctText = randomQ.options[randomQ.correctIndex];
    const shuffledOptions = [...randomQ.options].sort(() => Math.random() - 0.5);
    const newCorrectIndex = shuffledOptions.indexOf(correctText);

    setPrevSnippet(randomQ.ayahSnippet);
    setQuestion({ ...randomQ, options: shuffledOptions, correctIndex: newCorrectIndex });
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
      markCompleted(1, 1, 200); // 200 XP
    } else {
      setStreak(0);
      shake();
    }
  };

  if (!question) return <View style={[styles.container, styles.center]} />;

  return (
    <>
      <Stack.Screen options={{ title: 'المتشابهات', headerTitleAlign: 'center' }} />
      <View style={styles.container}>
        <View style={styles.header}>
        <Text style={styles.title}>المتشابهات</Text>
        <View style={styles.streakRow}>
          <Text style={styles.subtitle}>في أي سورة وردت هذه الآية بالضبط؟</Text>
          {streak > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>🔥 {streak}</Text>
            </View>
          )}
        </View>
      </View>

      <CountdownTimer
        durationSeconds={20}
        onTimeUp={() => {
          if (!submitted) {
            setSubmitted(true);
            setIsCorrect(false);
            setStreak(0);
            shake();
          }
        }}
        stopped={submitted}
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>

      <Animated.View style={[styles.statementBox, { transform: [{ translateX: shakeAnim }] }]}>
        <Text style={styles.statementText}>{question.ayahSnippet}</Text>
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
          let btnStyle: any = styles.optionBtn;
          let textStyle: any = styles.optionText;

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

            </ScrollView>

      {submitted && (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
          <Text style={isCorrect ? styles.successText : styles.failText}>
            {isCorrect ? `أحسنت! +٢٠٠ نقطة 🌟` : 'إجابة خاطئة!'}
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
  title: { fontSize: Typography.heading2, fontWeight: 'bold', color: Colors.similarVerses, textAlign: 'right' },
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
    fontFamily: Typography.quranFont, fontSize: Typography.ayahLg,
    color: Colors.textPrimary, textAlign: 'center', lineHeight: 55,
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
  optionText: { fontSize: Typography.heading3, fontWeight: '600', color: Colors.textPrimary },
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
  nextBtn: { width: '100%', backgroundColor: Colors.similarVerses, padding: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center' },
  nextBtnText: { color: '#fff', fontSize: Typography.heading3, fontWeight: 'bold' },
});
