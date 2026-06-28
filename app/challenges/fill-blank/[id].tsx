import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../../src/constants/theme';
import { useQuranStore } from '../../../src/store/quranStore';
import { fetchVersesForSurah } from '../../../src/services/quranApiService';
import { getSurahById } from '../../../src/constants/surahList';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

export default function FillBlankChallengeScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const markCompleted = useQuranStore(state => state.markCompleted);

  useEffect(() => {
    if (id === 'random') {
      const randomSurah = Math.floor(Math.random() * (114 - 87 + 1)) + 87;
      router.replace(`/challenges/fill-blank/${randomSurah}` as any);
    }
  }, [id, router]);

  const surahIdNum = id === 'random' ? 1 : parseInt(Array.isArray(id) ? id[0] : id ?? '1', 10);
  const surah = getSurahById(surahIdNum);

  const [isLoading, setIsLoading] = useState(true);
  const [ayahParts, setAyahParts] = useState<string[]>(['', '']);
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchVersesForSurah(surahIdNum).then(verses => {
      if (cancelled || verses.length === 0) {
        setIsLoading(false);
        return;
      }

      const verseIndex = Math.floor(Math.random() * verses.length);
      const verse = verses[verseIndex];
      
      const words = verse.text.split(' ');
      
      let wordIndex = Math.floor(Math.random() * words.length);
      for (let i = 0; i < 5; i++) {
        if (words[wordIndex].length > 3) break;
        wordIndex = Math.floor(Math.random() * words.length);
      }

      const correctWord = words[wordIndex];
      
      const part1 = words.slice(0, wordIndex).join(' ') + (wordIndex > 0 ? ' ' : '');
      const part2 = (wordIndex < words.length - 1 ? ' ' : '') + words.slice(wordIndex + 1).join(' ');

      const allWords = verses.flatMap(v => v.text.split(' ')).filter(w => w.length > 2 && w !== correctWord);
      
      const distractors = new Set<string>();
      while (distractors.size < 3 && allWords.length > 0) {
        const randWord = allWords[Math.floor(Math.random() * allWords.length)];
        distractors.add(randWord);
        if (distractors.size >= allWords.length) break;
      }

      const optionsList: Option[] = [
        { id: 'correct', text: correctWord, isCorrect: true },
        ...Array.from(distractors).map((d, i) => ({ id: `wrong_${i}`, text: d, isCorrect: false }))
      ];

      setAyahParts([part1, part2]);
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
      markCompleted(surahIdNum, 1, 50); // 50 XP
    }
  };

  const getSelectedWord = () => {
    if (!selectedOption) return '_________';
    return options.find(o => o.id === selectedOption)?.text || '_________';
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.fillBlank} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>أكمل الفراغ</Text>
        <Text style={styles.subtitle}>اختر الكلمة الصحيحة لإكمال الآية من {surah?.nameArabic ?? 'القرآن الكريم'}.</Text>
      </View>

      <View style={styles.ayahContainer}>
        <Text style={styles.ayahText}>
          {ayahParts[0]}
          <Text style={[
            styles.blankWord,
            selectedOption && styles.blankWordFilled,
            isSubmitted && options.find(o => o.id === selectedOption)?.isCorrect && styles.blankWordCorrect,
            isSubmitted && selectedOption && !options.find(o => o.id === selectedOption)?.isCorrect && styles.blankWordIncorrect
          ]}>
             {getSelectedWord()} 
          </Text>
          {ayahParts[1]}
        </Text>
      </View>

      <View style={styles.optionsGrid}>
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

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
        {isSubmitted ? (
          <View style={styles.resultSection}>
            {isCorrect ? (
              <Text style={styles.successText}>صحيح! +50 نقطة 🌟</Text>
            ) : (
              <Text style={styles.failText}>خطأ، حاول مرة أخرى.</Text>
            )}
            <View style={styles.footerButtons}>
              {isCorrect ? (
                <Pressable style={[styles.button, { flex: 1 }]} onPress={() => router.replace('/challenges/fill-blank/random' as any)}>
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
    color: Colors.fillBlank,
  },
  subtitle: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  ayahContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.patternOverlay,
    minHeight: 200,
  },
  ayahText: {
    fontFamily: Typography.quranFont,
    fontSize: Typography.ayahLg,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 60,
  },
  blankWord: {
    color: Colors.textMuted,
    textDecorationLine: 'underline',
  },
  blankWordFilled: {
    color: Colors.fillBlank,
    textDecorationLine: 'none',
  },
  blankWordCorrect: {
    color: Colors.success,
  },
  blankWordIncorrect: {
    color: Colors.error,
  },
  optionsGrid: {
    flex: 1,
    padding: Spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  optionCard: {
    backgroundColor: Colors.bgCard,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    width: '45%',
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
    fontFamily: Typography.quranFont,
    fontSize: Typography.ayahSm,
    color: Colors.textPrimary,
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
    backgroundColor: Colors.fillBlank,
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
