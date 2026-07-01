import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../../src/constants/theme';
import { useQuranStore } from '../../../src/store/quranStore';
import { fetchVersesForSurah, ApiVerse } from '../../../src/services/quranApiService';
import { getSurahById } from '../../../src/constants/surahList';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface OrderItem {
  id: number;
  text: string;
  correctIndex: number;
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const isOriginalOrder = shuffled.every((item, idx) => (item as any).correctIndex === idx);
  if (isOriginalOrder && shuffled.length >= 2) {
    [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
  }
  return shuffled;
}

export default function VerseOrderingScreen() {
  const { id, startVerse } = useLocalSearchParams();
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

  const [isLoading, setIsLoading] = useState(true);
  
  // Game State
  const [originalVerses, setOriginalVerses] = useState<OrderItem[]>([]);
  const [availableVerses, setAvailableVerses] = useState<OrderItem[]>([]);
  const [placedVerses, setPlacedVerses] = useState<(OrderItem | null)[]>([]);
  
  // Validation State
  const [incorrectIndices, setIncorrectIndices] = useState<Set<number>>(new Set());
  const [isCorrect, setIsCorrect] = useState(false);
  const [flashCorrect, setFlashCorrect] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Load verses and create challenge
  useEffect(() => {
    let cancelled = false;

    fetchVersesForSurah(surahIdNum).then(verses => {
      if (cancelled || verses.length === 0) {
        setIsLoading(false);
        return;
      }

      // Pick a range of 4 consecutive verses
      const count = Math.min(4, verses.length);
      const maxStart = verses.length - count;
      
      let startIdx;
      if (startVerse) {
        const startVerseStr = Array.isArray(startVerse) ? startVerse[0] : startVerse;
        startIdx = parseInt(startVerseStr, 10) - 1;
        startIdx = Math.max(0, Math.min(startIdx, maxStart));
      } else {
        startIdx = Math.floor(Math.random() * (maxStart + 1));
      }
      
      const selectedVerses = verses.slice(startIdx, startIdx + count);

      const orderItems: OrderItem[] = selectedVerses.map((v, idx) => ({
        id: v.ayahNumber,
        text: v.text,
        correctIndex: idx,
      }));

      const shuffled = shuffleArray(orderItems);
      
      setOriginalVerses(orderItems);
      setAvailableVerses(shuffled);
      setPlacedVerses(Array(count).fill(null));
      setIsLoading(false);
    });

    return () => { cancelled = true; };
  }, [surahIdNum]);

  // Handle placing a verse from available to the first empty slot
  const placeVerse = (itemToPlace: OrderItem) => {
    if (isCorrect) return; // Game over

    const firstEmptyIdx = placedVerses.findIndex(v => v === null);
    if (firstEmptyIdx === -1) return; // No empty slots

    setAvailableVerses(prev => prev.filter(v => v.id !== itemToPlace.id));
    setPlacedVerses(prev => {
      const next = [...prev];
      next[firstEmptyIdx] = itemToPlace;
      return next;
    });
    
    // Clear incorrect markings when changing
    setIncorrectIndices(new Set());
    setIsSubmitted(false);
  };

  // Handle removing a verse from a slot back to available
  const removeVerse = (slotIndex: number) => {
    if (isCorrect) return; // Game over
    const itemToRemove = placedVerses[slotIndex];
    if (!itemToRemove) return;

    setPlacedVerses(prev => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
    
    setAvailableVerses(prev => [...prev, itemToRemove]);
    setIncorrectIndices(new Set());
    setIsSubmitted(false);
  };

  // Auto-validate when all slots are filled
  useEffect(() => {
    if (placedVerses.length === 0) return;
    const isFull = placedVerses.every(v => v !== null);
    
    if (isFull && !isSubmitted) {
      validateOrder();
    }
  }, [placedVerses]);

  const validateOrder = () => {
    setIsSubmitted(true);
    let allCorrect = true;
    const wrong = new Set<number>();

    placedVerses.forEach((item, index) => {
      if (item && item.correctIndex !== index) {
        allCorrect = false;
        wrong.add(index);
      }
    });

    setIncorrectIndices(wrong);

    if (allCorrect) {
      setIsCorrect(true);
      setFlashCorrect(true);
      markCompleted(surahIdNum, 1, 100);
      
      // Flash green for 1 second, then turn it off
      setTimeout(() => {
        setFlashCorrect(false);
      }, 1000);
    }
  };

  const retry = () => {
    setIsSubmitted(false);
    setIsCorrect(false);
    setFlashCorrect(false);
    setIncorrectIndices(new Set());
    
    // Move everything back to available and shuffle
    const allItems = [...availableVerses, ...placedVerses.filter(v => v !== null) as OrderItem[]];
    setAvailableVerses(shuffleArray(allItems));
    setPlacedVerses(Array(originalVerses.length).fill(null));
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.verseOrder} />
        <Text style={styles.loadingText}>جاري تحميل التحدي...</Text>
      </View>
    );
  }

  if (originalVerses.length === 0) {
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
          رتب الآيات بالتسلسل الصحيح.
          {'\n'}اضغط على الآية بالأسفل لوضعها في المكان المناسب.
        </Text>
      </View>

      {/* Top Area: The Slots */}
      <ScrollView 
        style={styles.slotsAreaContainer} 
        contentContainerStyle={styles.slotsAreaContent}
      >
        {placedVerses.map((item, index) => {
          const isWrong = isSubmitted && incorrectIndices.has(index);
          const isFlash = flashCorrect;

          return (
            <Pressable
              key={`slot-${index}`}
              style={[
                styles.slotCard,
                item && styles.slotCardFilled,
                isWrong && styles.slotCardIncorrect,
                isFlash && styles.slotCardFlash,
              ]}
              onPress={() => removeVerse(index)}
            >
              {item ? (
                <Text style={[styles.ayahText, isFlash && styles.ayahTextFlash]}>
                  {item.text}
                </Text>
              ) : (
                <Text style={styles.slotPlaceholderText}>
                  الآية {index + 1}
                </Text>
              )}
              {item && !isCorrect && (
                <Text style={styles.removeIcon}>×</Text>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Bottom Area: Available Verses */}
      {!isCorrect && (
        <View style={[styles.bottomTray, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
          <Text style={styles.trayTitle}>الآيات المتاحة:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trayContent}>
            {availableVerses.map((item) => (
              <Pressable
                key={`avail-${item.id}`}
                style={styles.availableCard}
                onPress={() => placeVerse(item)}
              >
                <Text style={styles.availableText}>{item.text}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Success/Retry Footer overlay (shows when complete or stuck) */}
      {isSubmitted && (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
          <View style={styles.resultSection}>
            {isCorrect ? (
              <Text style={styles.successText}>صحيح! +100 نقطة 🌟</Text>
            ) : (
              <Text style={styles.failText}>هناك أخطاء في الترتيب، تفقد الآيات المحددة بالأحمر.</Text>
            )}
            <View style={styles.footerButtons}>
              {!isCorrect && (
                <Pressable style={[styles.button, styles.flexButton, styles.retryButton]} onPress={retry}>
                  <Text style={styles.buttonText}>إعادة الترتيب</Text>
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
        </View>
      )}
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
  slotsAreaContainer: {
    flex: 1,
  },
  slotsAreaContent: {
    padding: Spacing.md,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  slotCard: {
    minHeight: 80,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
    position: 'relative',
  },
  slotCardFilled: {
    backgroundColor: Colors.bgCard,
    borderStyle: 'solid',
    borderColor: Colors.surface,
    ...Shadow.card,
  },
  slotCardIncorrect: {
    backgroundColor: '#FFEBEE',
    borderColor: Colors.error,
    borderStyle: 'solid',
  },
  slotCardFlash: {
    backgroundColor: '#4CAF50',
    borderColor: '#388E3C',
    borderStyle: 'solid',
  },
  slotPlaceholderText: {
    color: Colors.textMuted,
    fontSize: Typography.heading3,
    fontWeight: 'bold',
  },
  ayahText: {
    fontFamily: Typography.quranFont,
    fontSize: Typography.ayahSm,
    textAlign: 'center',
    color: Colors.textPrimary,
    lineHeight: 34,
  },
  ayahTextFlash: {
    color: '#FFFFFF',
  },
  removeIcon: {
    position: 'absolute',
    top: 4,
    left: 8,
    fontSize: 20,
    color: Colors.textMuted,
  },
  bottomTray: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: Spacing.sm,
  },
  trayTitle: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    fontWeight: 'bold',
  },
  trayContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  availableCard: {
    backgroundColor: Colors.bgCard,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    maxWidth: 250,
    minWidth: 150,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    ...Shadow.sm,
  },
  availableText: {
    fontFamily: Typography.quranFont,
    fontSize: Typography.body,
    textAlign: 'center',
    color: Colors.primaryDark,
    lineHeight: 28,
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
    fontSize: Typography.body,
    textAlign: 'center',
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
    backgroundColor: Colors.primaryDark,
  },
  buttonText: {
    color: Colors.textLight,
    fontSize: Typography.heading3,
    fontWeight: 'bold',
  },
});
