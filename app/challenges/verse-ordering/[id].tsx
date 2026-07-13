import {
  View, Text, StyleSheet, Pressable,
  ActivityIndicator, ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../../src/constants/theme';
import { useQuranStore } from '../../../src/store/quranStore';
import { fetchVersesForSurah, ApiVerse } from '../../../src/services/quranApiService';
import { getSurahById } from '../../../src/constants/surahList';
import { calculateThumnBoundaries } from '../../../src/constants/athmanBoundaries';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CountdownTimer from '../../../src/components/CountdownTimer';

// ─── Types ────────────────────────────────────────────────────────────────────
interface VerseItem {
  ayahNumber: number; // actual Quran ayah number
  text: string;
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  // Guarantee it's actually shuffled
  const same = shuffled.every((v, i) => (v as any).ayahNumber === (arr[i] as any).ayahNumber);
  if (same && shuffled.length >= 2) {
    [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
  }
  return shuffled;
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function VerseOrderingScreen() {
  const { id, startVerse } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const markCompleted = useQuranStore(state => state.markCompleted);

  // Handle "random" surah
  useEffect(() => {
    if (id === 'random') {
      const randomSurah = Math.floor(Math.random() * 114) + 1;
      router.replace(`/challenges/verse-ordering/${randomSurah}` as any);
    }
  }, [id, router]);

  const surahIdNum = id === 'random' ? 1 : parseInt(Array.isArray(id) ? id[0] : id ?? '1', 10);
  const surah = getSurahById(surahIdNum);
  const thumns = calculateThumnBoundaries(surahIdNum);

  const [isLoading, setIsLoading] = useState(true);

  // The ordered target slots — each slot knows which ayah number it expects
  const [targetSlots, setTargetSlots] = useState<VerseItem[]>([]);

  // What's placed in each slot (null = empty)
  const [placedVerses, setPlacedVerses] = useState<(VerseItem | null)[]>([]);

  // Shuffled texts at the bottom (no ayah numbers visible to user)
  const [availableVerses, setAvailableVerses] = useState<VerseItem[]>([]);

  // Validation state
  const [incorrectSlots, setIncorrectSlots] = useState<Set<number>>(new Set());
  const [flashCorrect, setFlashCorrect] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // ─── Load verses ──────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    fetchVersesForSurah(surahIdNum).then(verses => {
      if (cancelled || verses.length === 0) {
        setIsLoading(false);
        return;
      }

      const MIN = 6;
      const MAX = 10;

      let selectedVerses: ApiVerse[];

      if (startVerse) {
        // Came from the reader — use the thumn that contains this verse
        const sv = parseInt(Array.isArray(startVerse) ? startVerse[0] : startVerse, 10);
        const thumn = thumns.find(t => sv >= t.startAyah && sv <= t.endAyah);
        
        if (thumn) {
          selectedVerses = verses.filter(v => v.ayahNumber >= thumn.startAyah && v.ayahNumber <= thumn.endAyah);
        } else {
          selectedVerses = verses.slice(0, Math.min(MAX, verses.length));
        }

        // If thumn is too small, extend with surrounding verses to reach MIN
        if (selectedVerses.length < MIN) {
          const startIdx = verses.findIndex(v => v.ayahNumber === selectedVerses[0].ayahNumber);
          const endIdx = startIdx + Math.min(MAX, verses.length - startIdx);
          selectedVerses = verses.slice(Math.max(0, startIdx), endIdx);
        }
      } else {
        // Came from the challenges hub — pick a random window of MIN–MAX consecutive verses
        const count = MIN + Math.floor(Math.random() * (MAX - MIN + 1)); // 4, 5, or 6
        const cappedCount = Math.min(count, verses.length);
        const maxStart = Math.max(0, verses.length - cappedCount);
        const startIdx = Math.floor(Math.random() * (maxStart + 1));
        selectedVerses = verses.slice(startIdx, startIdx + cappedCount);
      }

      // Cap at MAX
      const capped = selectedVerses.slice(0, MAX);

      const items: VerseItem[] = capped.map(v => ({
        ayahNumber: v.ayahNumber,
        text: v.text,
      }));

      setTargetSlots(items);                     // ordered — drives the numbered slots
      setPlacedVerses(Array(items.length).fill(null));
      setAvailableVerses(shuffleArray(items));    // shuffled — no numbers shown
      setIsLoading(false);
    });

    return () => { cancelled = true; };
  }, [surahIdNum]);

  // ─── Auto-validate when all slots filled ─────────────────────────────────
  useEffect(() => {
    if (placedVerses.length === 0) return;
    const isFull = placedVerses.every(v => v !== null);
    if (isFull && !isSubmitted) {
      validateOrder();
    }
  }, [placedVerses]);

  // ─── Place a verse from available tray into first empty slot ─────────────
  const placeVerse = (item: VerseItem) => {
    if (isCorrect) return;
    const firstEmpty = placedVerses.findIndex(v => v === null);
    if (firstEmpty === -1) return;

    setAvailableVerses(prev => prev.filter(v => v.ayahNumber !== item.ayahNumber));
    setPlacedVerses(prev => {
      const next = [...prev];
      next[firstEmpty] = item;
      return next;
    });
    setIncorrectSlots(new Set());
    setIsSubmitted(false);
  };

  // ─── Remove a verse from a slot back to available ─────────────────────────
  const removeVerse = (slotIndex: number) => {
    if (isCorrect) return;
    const item = placedVerses[slotIndex];
    if (!item) return;

    setPlacedVerses(prev => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
    setAvailableVerses(prev => [...prev, item]);
    setIncorrectSlots(new Set());
    setIsSubmitted(false);
  };

  // ─── Validate ─────────────────────────────────────────────────────────────
  const validateOrder = () => {
    setIsSubmitted(true);
    const wrong = new Set<number>();
    let allCorrect = true;

    placedVerses.forEach((placed, idx) => {
      if (!placed || placed.ayahNumber !== targetSlots[idx].ayahNumber) {
        wrong.add(idx);
        allCorrect = false;
      }
    });

    setIncorrectSlots(wrong);

    if (allCorrect) {
      setIsCorrect(true);
      setFlashCorrect(true);
      markCompleted(surahIdNum, 1, 200);
      setTimeout(() => setFlashCorrect(false), 1000);
    }
  };

  // ─── Retry ────────────────────────────────────────────────────────────────
  const retry = () => {
    const all = [
      ...availableVerses,
      ...(placedVerses.filter(v => v !== null) as VerseItem[]),
    ];
    setAvailableVerses(shuffleArray(all));
    setPlacedVerses(Array(targetSlots.length).fill(null));
    setIncorrectSlots(new Set());
    setIsCorrect(false);
    setFlashCorrect(false);
    setIsSubmitted(false);
  };

  // ─── Loading / Error ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.verseOrder} />
        <Text style={styles.loadingText}>جاري تحميل التحدي...</Text>
      </View>
    );
  }

  if (targetSlots.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.loadingText}>تعذر تحميل الآيات. تحقق من اتصالك.</Text>
        <Pressable style={styles.btn} onPress={() => router.back()}>
          <Text style={styles.btnText}>العودة</Text>
        </Pressable>
      </View>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ترتيب الآيات</Text>
        <Text style={styles.headerSub}>
          رتب آيات {surah?.nameArabic ?? 'السورة'} في مكانها الصحيح حسب رقمها.
          {'\n'}اضغط على آية لوضعها في الخانة، واضغط على الخانة لإزالتها.
        </Text>
      </View>
      <CountdownTimer
        durationSeconds={60}
        onTimeUp={() => {
          if (!isSubmitted) {
            validateOrder();
          }
        }}
        stopped={isSubmitted}
      />

      {/* ── Numbered Slots (top, scrollable) ───────────────────────────── */}
      <ScrollView
        style={styles.slotsScroll}
        contentContainerStyle={styles.slotsContent}
      >
        {targetSlots.map((target, idx) => {
          const placed = placedVerses[idx];
          const isWrong = isSubmitted && incorrectSlots.has(idx);
          const isFlash = flashCorrect && placed !== null;

          return (
            <Pressable
              key={`slot-${target.ayahNumber}`}
              style={[
                styles.slot,
                placed && styles.slotFilled,
                isWrong && styles.slotWrong,
                isFlash && styles.slotFlash,
              ]}
              onPress={() => removeVerse(idx)}
            >
              {/* Ayah number badge — always visible */}
              <View style={[
                styles.ayahBadge,
                isFlash && styles.ayahBadgeFlash,
                isWrong && styles.ayahBadgeWrong,
              ]}>
                <Text style={[
                  styles.ayahBadgeText,
                  (isFlash || isWrong) && { color: '#fff' },
                ]}>
                  ﴿ {target.ayahNumber} ﴾
                </Text>
              </View>

              {/* Verse text (or empty placeholder) */}
              {placed ? (
                <Text style={[
                  styles.slotText,
                  isFlash && styles.slotTextFlash,
                  isWrong && styles.slotTextWrong,
                ]} numberOfLines={3}>
                  {placed.text}
                </Text>
              ) : (
                <Text style={styles.slotPlaceholder}>اضغط على آية لوضعها هنا</Text>
              )}

              {/* Tap-to-remove hint */}
              {placed && !isCorrect && (
                <Text style={styles.removeHint}>×</Text>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ── Result banner ─────────────────────────────────────────────────── */}
      {isSubmitted && (
        <View style={styles.resultBanner}>
          {isCorrect ? (
            <>
              <Text style={styles.resultCorrect}>أحسنت! +٢٠٠ نقطة 🌟</Text>
              <Pressable
                style={[styles.btn, styles.btnFull]}
                onPress={() => router.replace('/challenges/verse-ordering/random' as any)}
              >
                <Text style={styles.btnText}>التحدي التالي</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.resultWrong}>بعض الآيات في غير مكانها — الخانات الحمراء تحتاج إلى تصحيح.</Text>
              <View style={styles.resultActions}>
                <Pressable style={[styles.btn, styles.btnRetry, { flex: 1 }]} onPress={retry}>
                  <Text style={styles.btnText}>إعادة المحاولة</Text>
                </Pressable>
                <Pressable style={[styles.btn, { flex: 1 }]} onPress={() => router.back()}>
                  <Text style={styles.btnText}>خروج</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      )}

      {/* ── Available Verses Tray (bottom) ────────────────────────────────── */}
      {!isCorrect && (
        <View style={[styles.tray, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}>
          <Text style={styles.trayLabel}>الآيات المتاحة — اضغط لوضعها</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.trayContent}
          >
            {availableVerses.map(item => (
              <Pressable
                key={`avail-${item.ayahNumber}`}
                style={styles.availCard}
                onPress={() => placeVerse(item)}
              >
                {/* Intentionally NO ayah number shown here */}
                <Text style={styles.availText} numberOfLines={4}>
                  {item.text}
                </Text>
              </Pressable>
            ))}
            {availableVerses.length === 0 && (
              <Text style={styles.trayEmpty}>كل الآيات موضوعة ✓</Text>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgLight, direction: 'rtl' },
  center: { justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  loadingText: { marginTop: Spacing.md, fontSize: Typography.body, color: Colors.textMuted, textAlign: 'center' },

  header: {
    backgroundColor: Colors.bgCard,
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface,
  },
  headerTitle: {
    fontSize: Typography.heading2,
    fontWeight: 'bold',
    color: Colors.verseOrder,
    textAlign: 'right',
  },
  headerSub: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    lineHeight: 20,
    textAlign: 'right',
  },

  // Slots
  slotsScroll: { flex: 1 },
  slotsContent: { padding: Spacing.md, gap: Spacing.md },

  slot: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    minHeight: 80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  slotFilled: {
    backgroundColor: Colors.bgCard,
    borderStyle: 'solid',
    borderColor: Colors.surface,
    ...Shadow.card,
  },
  slotWrong: {
    backgroundColor: '#FFEBEE',
    borderColor: Colors.error,
    borderStyle: 'solid',
  },
  slotFlash: {
    backgroundColor: '#4CAF50',
    borderColor: '#388E3C',
    borderStyle: 'solid',
  },

  ayahBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    minWidth: 56,
    alignItems: 'center',
  },
  ayahBadgeFlash: { backgroundColor: '#2E7D32' },
  ayahBadgeWrong: { backgroundColor: Colors.error },
  ayahBadgeText: {
    fontFamily: Typography.quranFont,
    fontSize: Typography.caption + 2,
    color: Colors.primaryDark,
    fontWeight: 'bold',
  },

  slotText: {
    flex: 1,
    fontFamily: Typography.quranFont,
    fontSize: Typography.body + 1,
    color: Colors.textPrimary,
    textAlign: 'right',
    lineHeight: 30,
  },
  slotTextFlash: { color: '#fff' },
  slotTextWrong: { color: Colors.error },
  slotPlaceholder: {
    flex: 1,
    fontSize: Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  removeHint: {
    fontSize: 20,
    color: Colors.textMuted,
    paddingHorizontal: 4,
  },

  // Result banner
  resultBanner: {
    backgroundColor: Colors.bgCard,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.surface,
    gap: Spacing.md,
  },
  resultCorrect: {
    color: Colors.success,
    fontSize: Typography.heading3,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultWrong: {
    color: Colors.error,
    fontSize: Typography.body,
    textAlign: 'center',
    lineHeight: 22,
  },
  resultActions: { flexDirection: 'row', gap: Spacing.md },

  // Buttons
  btn: {
    backgroundColor: Colors.verseOrder,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  btnFull: { width: '100%' },
  btnRetry: { backgroundColor: Colors.primaryDark },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: Typography.heading3 },

  // Bottom tray
  tray: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: Spacing.sm,
  },
  trayLabel: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  trayContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  availCard: {
    backgroundColor: Colors.bgCard,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    maxWidth: 220,
    minWidth: 140,
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.card,
  },
  availText: {
    fontFamily: Typography.quranFont,
    fontSize: Typography.body,
    color: Colors.primaryDark,
    textAlign: 'center',
    lineHeight: 28,
  },
  trayEmpty: {
    color: Colors.textMuted,
    fontStyle: 'italic',
    alignSelf: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
});
