import { View, Text, StyleSheet, Pressable , ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../../src/constants/theme';
import { WARSH_RULES } from '../../../src/utils/warshUtils';
import { useQuranStore } from '../../../src/store/quranStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CountdownTimer from '../../../src/components/CountdownTimer';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function WarshQuizScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const markCompleted = useQuranStore(state => state.markCompleted);

  const [question, setQuestion] = useState<{ text: string, options: { id: string, label: string, isCorrect: boolean }[] } | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const nextQuestion = () => {
    const type = Math.random() > 0.5 ? 'desc' : 'example';
    const rule = WARSH_RULES[Math.floor(Math.random() * WARSH_RULES.length)];
    
    let text = '';
    let correctLabel = '';
    let distractorLabels: string[] = [];
    
    if (type === 'desc') {
      text = `ما هو تعريف حكم "${rule.nameArabic}"؟`;
      correctLabel = rule.description;
      distractorLabels = WARSH_RULES.filter(r => r.id !== rule.id).map(r => r.description);
    } else {
      const example = rule.examples[Math.floor(Math.random() * rule.examples.length)];
      text = `في رواية ورش، يُعتبر "${example.split(' becomes ')[0]}" مثالاً على أي حكم؟`;
      correctLabel = rule.nameArabic;
      distractorLabels = WARSH_RULES.filter(r => r.id !== rule.id).map(r => r.nameArabic);
    }

    const distractors = shuffle(distractorLabels).slice(0, 4);
    
    const opts = shuffle([
      { id: 'correct', label: correctLabel, isCorrect: true },
      ...distractors.map((d, i) => ({ id: `wrong_${i}`, label: d, isCorrect: false }))
    ]);

    setQuestion({ text, options: opts });
    setSelectedOption(null);
    setIsSubmitted(false);
    setIsCorrect(false);
  };

  useEffect(() => { nextQuestion(); }, []);

  const checkAnswer = () => {
    if (!selectedOption || !question) return;
    setIsSubmitted(true);
    
    const correct = question.options.find(o => o.id === selectedOption)?.isCorrect ?? false;
    setIsCorrect(correct);
    if (correct) {
      markCompleted(1, 1, 200); // 200 XP
    }
  };

  if (!question) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>اختبار أحكام ورش</Text>
        <Text style={styles.subtitle}>اختبر معرفتك بأحكام التلاوة</Text>
      </View>

      <CountdownTimer
        durationSeconds={20}
        onTimeUp={() => {
          setIsSubmitted(true);
          setIsCorrect(false);
        }}
        stopped={isSubmitted}
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{question.text}</Text>
      </View>

      <View style={styles.optionsList}>
        {question.options.map((option) => {
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
                {option.label}
              </Text>
              
              {showCorrect && <Text style={styles.resultIcon}>✅</Text>}
              {showIncorrect && <Text style={styles.resultIcon}>❌</Text>}
            </Pressable>
          );
        })}
      </View>

            </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
        {isSubmitted ? (
          <View style={{ alignItems: 'center', width: '100%' }}>
            <Text style={{ color: isCorrect ? Colors.success : Colors.error, fontSize: Typography.heading3, fontWeight: 'bold', marginBottom: Spacing.md }}>
              {isCorrect ? 'أحسنت! +٢٠٠ نقطة 🌟' : 'إجابة خاطئة!'}
            </Text>
            <Pressable style={[styles.button, { width: '100%' }]} onPress={nextQuestion}>
              <Text style={styles.buttonText}>السؤال التالي</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable 
            style={[styles.button, !selectedOption && styles.buttonDisabled, { width: '100%' }]} 
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
  header: {
    padding: Spacing.lg,
    backgroundColor: Colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface,
  },
  title: {
    fontSize: Typography.heading2,
    fontWeight: 'bold',
    color: Colors.warshQuiz,
  },
  subtitle: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    fontWeight: '500',
  },
  ruleContext: {
    padding: Spacing.md,
    backgroundColor: Colors.patternOverlay,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface,
  },
  ruleDesc: {
    fontSize: Typography.caption,
    color: Colors.textPrimary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  questionContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  questionText: {
    fontSize: Typography.heading3,
    color: Colors.textPrimary,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 28,
  },
  optionsList: {
    flex: 1,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  optionCard: {
    backgroundColor: Colors.bgCard,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
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
    flex: 1,
    textAlign: 'center',
  },
  optionTextLight: {
    color: Colors.textLight,
    fontWeight: 'bold',
  },
  resultIcon: {
    position: 'absolute',
    right: Spacing.md,
    fontSize: 20,
  },
  footer: {
    padding: Spacing.lg,
    backgroundColor: Colors.bgCard,
    borderTopWidth: 1,
    borderTopColor: Colors.surface,
  },
  button: {
    backgroundColor: Colors.warshQuiz,
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
