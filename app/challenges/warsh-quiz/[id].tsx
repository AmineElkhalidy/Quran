import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../../src/constants/theme';
import { WARSH_RULES } from '../../../src/utils/warshUtils';
import { useQuranStore } from '../../../src/store/quranStore';

export default function WarshQuizScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const markCompleted = useQuranStore(state => state.markCompleted);

  const rule = WARSH_RULES[0]; // Transfer of Vowel (Naql) for demo
  
  const QUESTION = `كيف تُنطق "${rule.examples[0].split(' becomes ')[0]}" برواية ورش؟`;
  const OPTIONS = [
    { id: '1', text: rule.examples[0].split(' becomes ')[1], isCorrect: true }, // مَنَ َامَنَ
    { id: '2', text: 'مَنْ ءَامَنَ (رواية حفص)', isCorrect: false },
    { id: '3', text: 'مَنِ امَنَ', isCorrect: false },
  ];

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const checkAnswer = () => {
    if (!selectedOption) return;
    setIsSubmitted(true);
    
    const isCorrect = OPTIONS.find(o => o.id === selectedOption)?.isCorrect;
    if (isCorrect) {
      markCompleted(1, 1, 200); // 200 XP for Warsh Quiz
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>اختبار أحكام ورش</Text>
        <Text style={styles.subtitle}>الحكم: {rule.nameArabic}</Text>
      </View>

      <View style={styles.ruleContext}>
        <Text style={styles.ruleDesc}>{rule.description}</Text>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{QUESTION}</Text>
      </View>

      <View style={styles.optionsList}>
        {OPTIONS.map((option) => {
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
              
              {showCorrect && <Text style={styles.resultIcon}>✅</Text>}
              {showIncorrect && <Text style={styles.resultIcon}>❌</Text>}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        {isSubmitted ? (
          <Pressable style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>العودة إلى التحديات</Text>
          </Pressable>
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
