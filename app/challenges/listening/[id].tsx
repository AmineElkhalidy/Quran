import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../../src/constants/theme';
import { useQuranStore } from '../../../src/store/quranStore';
import { audioService } from '../../../src/services/audioService';
import { fetchVersesForSurah, ApiVerse } from '../../../src/services/quranApiService';
import { getSurahById } from '../../../src/constants/surahList';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CountdownTimer from '../../../src/components/CountdownTimer';

interface Option {
  id: string;
  label: string;
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

export default function ListeningChallengeScreen() {
  const { id, startAyah: startAyahParam, endAyah: endAyahParam } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const markCompleted = useQuranStore(state => state.markCompleted);

  // Parse optional rub' range params
  const rubStartAyah = startAyahParam ? parseInt(Array.isArray(startAyahParam) ? startAyahParam[0] : startAyahParam, 10) : undefined;
  const rubEndAyah = endAyahParam ? parseInt(Array.isArray(endAyahParam) ? endAyahParam[0] : endAyahParam, 10) : undefined;
  const isRubScoped = rubStartAyah != null && rubEndAyah != null;
  
  useEffect(() => {
    if (id === 'random') {
      const randomSurah = Math.floor(Math.random() * 114) + 1;
      router.replace(`/challenges/listening/${randomSurah}` as any);
    }
  }, [id, router]);

  const surahIdNum = id === 'random' ? 1 : parseInt(Array.isArray(id) ? id[0] : id ?? '1', 10);
  const surah = getSurahById(surahIdNum);

  const [isLoading, setIsLoading] = useState(true);
  const [correctAyah, setCorrectAyah] = useState<ApiVerse | null>(null);
  const [options, setOptions] = useState<Option[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);

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

      const verseIndex = Math.floor(Math.random() * verses.length);
      const targetVerse = verses[verseIndex];
      
      const otherVerses = verses.filter(v => v.ayahNumber !== targetVerse.ayahNumber);
      const distractors = new Set<ApiVerse>();
      
      while (distractors.size < 5 && otherVerses.length > 0) {
        const randVerse = otherVerses[Math.floor(Math.random() * otherVerses.length)];
        distractors.add(randVerse);
        if (distractors.size >= otherVerses.length) break;
      }

      const optionsList: Option[] = [
        { id: `correct_${targetVerse.ayahNumber}`, label: targetVerse.text, isCorrect: true },
        ...Array.from(distractors).map(d => ({ id: `wrong_${d.ayahNumber}`, label: d.text, isCorrect: false }))
      ];

      setCorrectAyah(targetVerse);
      setOptions(shuffleArray(optionsList));
      setIsLoading(false);
    });

    return () => { 
      cancelled = true; 
      audioService.stopPlayback();
    };
  }, [surahIdNum]);

  const togglePlay = async () => {
    if (!correctAyah || hasPlayed) return;
    
    setIsPlaying(true);
    setHasPlayed(true);
    setTimerStarted(true);
    await audioService.playWarshAudio(correctAyah.surahId, correctAyah.ayahNumber, () => {
      setIsPlaying(false);
    });
  };

  const handleSelect = (optionId: string) => {
    if (!isSubmitted) {
      setSelectedOption(optionId);
    }
  };

  const checkAnswer = () => {
    if (!selectedOption) return;
    setIsSubmitted(true);
    
    const correct = options.find(o => o.id === selectedOption)?.isCorrect ?? false;
    setIsCorrect(correct);

    if (correct) {
      markCompleted(surahIdNum, 2, 200); // 200 XP
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.listening} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, Spacing.lg) }]}>
        <Text style={styles.title}>اختبار الاستماع</Text>
        <Text style={styles.subtitle}>استمع إلى التلاوة برواية ورش وتعرف على الآية الصحيحة من {surah?.nameArabic ?? 'القرآن الكريم'}. (استماع واحد فقط)</Text>
      </View>

      <CountdownTimer
        durationSeconds={30}
        onTimeUp={() => {
          setIsSubmitted(true);
          setIsCorrect(false);
        }}
        paused={!timerStarted}
        stopped={isSubmitted}
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        <View style={styles.audioSection}>
          <Pressable 
            style={[styles.playButton, isPlaying && styles.playButtonActive, hasPlayed && !isPlaying && { opacity: 0.5 }]} 
            onPress={togglePlay}
            disabled={hasPlayed}
          >
            <Text style={styles.playIcon}>{isPlaying ? '🔊' : '▶️'}</Text>
          </Pressable>
          <Text style={styles.audioLabel}>
            {isPlaying ? 'جاري تشغيل الآية...' : hasPlayed ? 'تم الاستماع' : 'اضغط للاستماع (مرة واحدة)'}
          </Text>
        </View>

        <View style={styles.optionsList}>
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
                onPress={() => handleSelect(option.id)}
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

            </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
        {isSubmitted ? (
          <View style={styles.resultSection}>
            {isCorrect ? (
              <Text style={styles.successText}>صحيح! +٢٠٠ نقطة 🌟</Text>
            ) : (
              <Text style={styles.failText}>خطأ، حاول مرة أخرى.</Text>
            )}
            <View style={styles.footerButtons}>
              {isCorrect ? (
                <Pressable style={[styles.button, { flex: 1 }]} onPress={() => router.replace('/challenges/listening/random' as any)}>
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
    color: Colors.listening,
  },
  subtitle: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  audioSection: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.listening,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.card,
  },
  playButtonActive: {
    backgroundColor: Colors.primaryDark,
    transform: [{ scale: 0.95 }],
  },
  playIcon: {
    fontSize: 36,
    marginLeft: 4, // Visual centering for play triangle
  },
  audioLabel: {
    marginTop: Spacing.md,
    fontSize: Typography.body,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  optionsList: {
    padding: Spacing.md,
    gap: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  optionCard: {
    backgroundColor: Colors.bgCard,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    textAlign: 'center',
  },
  optionTextLight: {
    color: Colors.textLight,
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
    backgroundColor: Colors.listening,
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
