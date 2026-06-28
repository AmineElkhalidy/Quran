import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../../src/constants/theme';
import { useQuranStore } from '../../../src/store/quranStore';
import { fetchVersesForSurah, ApiVerse } from '../../../src/services/quranApiService';
import { getSurahById } from '../../../src/constants/surahList';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface OrderItem {
  id: number;
  text: string;
  correctIndex: number; // The original position in the correct sequence
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  // Fisher-Yates shuffle — but ensure it's actually shuffled
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  // If shuffle produced the original order, swap the first two
  const isOriginalOrder = shuffled.every((item, idx) => (item as any).correctIndex === idx);
  if (isOriginalOrder && shuffled.length >= 2) {
    [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
  }
  return shuffled;
}

export default function VerseOrderingScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const markCompleted = useQuranStore(state => state.markCompleted);

  useEffect(() => {
    if (id === 'random') {
      const randomSurah = Math.floor(Math.random() * (114 - 87 + 1)) + 87;
      router.replace(`/challenges/verse-ordering/${randomSurah}` as any);
    }
  }, [id, router]);

  const surahIdNum = id === 'random' ? 1 : parseInt(Array.isArray(id) ? id[0] : id ?? '1', 10);
  const surah = getSurahById(surahIdNum);

  const [items, setItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [incorrectIndices, setIncorrectIndices] = useState<Set<number>>(new Set());

  // Load verses and create challenge
  useEffect(() => {
    let cancelled = false;

    fetchVersesForSurah(surahIdNum).then(verses => {
      if (cancelled || verses.length === 0) {
        setIsLoading(false);
        return;
      }

      // Pick a range of 4 consecutive verses (or fewer if surah is short)
      const count = Math.min(4, verses.length);
      const maxStart = verses.length - count;
      const startIdx = Math.floor(Math.random() * (maxStart + 1));
      const selectedVerses = verses.slice(startIdx, startIdx + count);

      // Create order items with correct indices
      const orderItems: OrderItem[] = selectedVerses.map((v, idx) => ({
        id: v.ayahNumber,
        text: v.text,
        correctIndex: idx,
      }));

      // Shuffle them
      const shuffled = shuffleArray(orderItems);
      setItems(shuffled);
      setIsLoading(false);
    });

    return () => { cancelled = true; };
  }, [surahIdNum]);

  // Tap to select, tap again to swap
  const handleTap = useCallback((index: number) => {
    if (isSubmitted) return;

    if (selectedIndex === null) {
      // First tap — select this item
      setSelectedIndex(index);
    } else if (selectedIndex === index) {
      // Tapped the same item — deselect
      setSelectedIndex(null);
    } else {
      // Second tap — swap the two items
      setItems(prev => {
        const newItems = [...prev];
        [newItems[selectedIndex], newItems[index]] = [newItems[index], newItems[selectedIndex]];
        return newItems;
      });
      setSelectedIndex(null);
    }
  }, [selectedIndex, isSubmitted]);

  // Move item up
  const moveUp = useCallback((index: number) => {
    if (isSubmitted || index === 0) return;
    setItems(prev => {
      const newItems = [...prev];
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
      return newItems;
    });
    setSelectedIndex(null);
  }, [isSubmitted]);

  // Move item down
  const moveDown = useCallback((index: number) => {
    if (isSubmitted || index === items.length - 1) return;
    setItems(prev => {
      const newItems = [...prev];
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
      return newItems;
    });
    setSelectedIndex(null);
  }, [isSubmitted, items.length]);

  const checkOrder = () => {
    setIsSubmitted(true);
    setSelectedIndex(null);

    // Check if every item is in its correct position
    const wrong = new Set<number>();
    let allCorrect = true;
    items.forEach((item, idx) => {
      if (item.correctIndex !== idx) {
        wrong.add(idx);
        allCorrect = false;
      }
    });

    setIncorrectIndices(wrong);
    setIsCorrect(allCorrect);

    if (allCorrect) {
      markCompleted(surahIdNum, 1, 100); // 100 XP
    }
  };

  const retry = () => {
    setIsSubmitted(false);
    setIsCorrect(false);
    setIncorrectIndices(new Set());
    setSelectedIndex(null);
    setItems(prev => shuffleArray([...prev]));
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.verseOrder} />
        <Text style={styles.loadingText}>جاري تحميل التحدي...</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>تعذر تحميل الآيات. تحقق من اتصالك.</Text>
        <Pressable style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>العودة</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ترتيب الآيات</Text>
        <Text style={styles.subtitle}>
          رتب هذه الآيات من {surah?.nameArabic ?? 'القرآن الكريم'} بالتسلسل الصحيح.
          {'\n'}اضغط على آية لتحديدها، ثم اضغط على أخرى للتبديل.
        </Text>
      </View>

      <View style={styles.listArea}>
        {items.map((item, index) => {
          const isSelected = selectedIndex === index;
          const isWrong = isSubmitted && incorrectIndices.has(index);
          const isRight = isSubmitted && !incorrectIndices.has(index);

          return (
            <Pressable
              key={item.id}
              style={[
                styles.ayahCard,
                isSelected && styles.ayahCardSelected,
                isRight && styles.ayahCardCorrect,
                isWrong && styles.ayahCardIncorrect,
              ]}
              onPress={() => handleTap(index)}
            >
              {/* Reorder arrows */}
              {!isSubmitted && (
                <View style={styles.arrowColumn}>
                  <Pressable
                    onPress={() => moveUp(index)}
                    disabled={index === 0}
                    style={[styles.arrowBtn, index === 0 && styles.arrowBtnDisabled]}
                  >
                    <Text style={styles.arrowText}>▲</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => moveDown(index)}
                    disabled={index === items.length - 1}
                    style={[styles.arrowBtn, index === items.length - 1 && styles.arrowBtnDisabled]}
                  >
                    <Text style={styles.arrowText}>▼</Text>
                  </Pressable>
                </View>
              )}

              {/* Status icon after submission */}
              {isSubmitted && (
                <View style={styles.statusIcon}>
                  <Text style={{ fontSize: 18 }}>{isRight ? '✅' : '❌'}</Text>
                </View>
              )}

              <Text style={[
                styles.ayahText,
                isSelected && styles.ayahTextSelected,
                (isRight || isWrong) && styles.ayahTextSubmitted,
              ]}>
                {item.text}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
        {isSubmitted ? (
          <View style={styles.resultSection}>
            {isCorrect ? (
              <Text style={styles.successText}>صحيح! +100 نقطة 🌟</Text>
            ) : (
              <Text style={styles.failText}>خطأ، حاول مرة أخرى!</Text>
            )}
            <View style={styles.footerButtons}>
              {!isCorrect && (
                <Pressable style={[styles.button, styles.flexButton, styles.retryButton]} onPress={retry}>
                  <Text style={styles.buttonText}>حاول مرة أخرى</Text>
                </Pressable>
              )}
              {isCorrect ? (
                <Pressable style={[styles.button, styles.flexButton]} onPress={() => router.replace('/challenges/verse-ordering/random' as any)}>
                  <Text style={styles.buttonText}>التحدي التالي</Text>
                </Pressable>
              ) : (
                <Pressable style={[styles.button, styles.flexButton]} onPress={() => router.back()}>
                  <Text style={styles.buttonText}>خروج</Text>
                </Pressable>
              )}
            </View>
          </View>
        ) : (
          <Pressable style={styles.button} onPress={checkOrder}>
            <Text style={styles.buttonText}>تأكيد الترتيب</Text>
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
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
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
    color: Colors.verseOrder,
  },
  subtitle: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  listArea: {
    flex: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  ayahCard: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    ...Shadow.card,
  },
  ayahCardSelected: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  ayahCardCorrect: {
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: Colors.success,
  },
  ayahCardIncorrect: {
    backgroundColor: '#FFEBEE',
    borderWidth: 2,
    borderColor: Colors.error,
  },
  arrowColumn: {
    marginRight: Spacing.sm,
    gap: 4,
  },
  arrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowBtnDisabled: {
    opacity: 0.3,
  },
  arrowText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statusIcon: {
    marginRight: Spacing.sm,
    width: 28,
    alignItems: 'center',
  },
  ayahText: {
    flex: 1,
    fontFamily: Typography.quranFont,
    fontSize: Typography.ayahSm,
    textAlign: 'right',
    color: Colors.textPrimary,
    lineHeight: 40,
  },
  ayahTextSelected: {
    color: Colors.textLight,
  },
  ayahTextSubmitted: {
    color: Colors.textPrimary,
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
    backgroundColor: Colors.verseOrder,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  flexButton: {
    flex: 1,
  },
  retryButton: {
    backgroundColor: Colors.primaryLight,
  },
  buttonText: {
    color: Colors.textLight,
    fontSize: Typography.heading3,
    fontWeight: 'bold',
  },
});
