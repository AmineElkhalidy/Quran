import { View, Text, StyleSheet, Pressable, ScrollView, Animated } from 'react-native';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../constants/theme';
import { ApiVerse } from '../services/quranApiService';

interface InlineVerseOrderingProps {
  verses: ApiVerse[];
  thumnLabel: string;
  onExit: () => void;
}

/**
 * Inline verse ordering memorization mode.
 * Renders entirely within the Thumn Reading Screen — no navigation.
 *
 * Flow:
 * 1. Verse texts are replaced by numbered blank placeholders.
 * 2. Shuffled verses appear in a bottom pool (no numbers).
 * 3. User taps a verse from the pool to place it in the current slot (sequential).
 * 4. Correct → fills slot with ✓. Wrong → shakes and stays in pool.
 * 5. All correct → completion overlay with stats.
 */
export function InlineVerseOrdering({ verses, thumnLabel, onExit }: InlineVerseOrderingProps) {
  // ── Derived data ──────────────────────────────────────────────────────────
  const sortedVerses = useMemo(
    () => [...verses].sort((a, b) => a.ayahNumber - b.ayahNumber),
    [verses],
  );

  const shuffledPool = useMemo(() => {
    const pool = [...sortedVerses];
    // Fisher-Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool;
  }, [sortedVerses]);

  // ── State ─────────────────────────────────────────────────────────────────
  const [placedVerses, setPlacedVerses] = useState<Record<number, ApiVerse | null>>({});
  const [currentSlotIndex, setCurrentSlotIndex] = useState(0);
  const [remainingPool, setRemainingPool] = useState<ApiVerse[]>(shuffledPool);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [wrongVerseKey, setWrongVerseKey] = useState<number | null>(null);

  // ── Animations ────────────────────────────────────────────────────────────
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const completionScale = useRef(new Animated.Value(0)).current;
  const completionOpacity = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-60)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  // Per-pool-item shake animations — keyed by ayahNumber
  const shakeAnims = useRef<Record<number, Animated.Value>>({});
  const getShakeAnim = (ayahNumber: number) => {
    if (!shakeAnims.current[ayahNumber]) {
      shakeAnims.current[ayahNumber] = new Animated.Value(0);
    }
    return shakeAnims.current[ayahNumber];
  };

  // Per-slot fill animations — keyed by slot index
  const slotFillAnims = useRef<Record<number, Animated.Value>>({});
  const getSlotFillAnim = (index: number) => {
    if (!slotFillAnims.current[index]) {
      slotFillAnims.current[index] = new Animated.Value(0);
    }
    return slotFillAnims.current[index];
  };

  // Slot scroll ref
  const slotsScrollRef = useRef<ScrollView>(null);

  // ── Entrance animation ────────────────────────────────────────────────────
  useEffect(() => {
    Animated.parallel([
      Animated.spring(headerSlide, {
        toValue: 0,
        useNativeDriver: true,
        tension: 60,
        friction: 10,
      }),
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ── Pulse animation for the active slot ───────────────────────────────────
  useEffect(() => {
    if (isComplete) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isComplete, currentSlotIndex]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleVerseTap = useCallback(
    (tappedVerse: ApiVerse) => {
      if (isComplete) return;

      const expectedVerse = sortedVerses[currentSlotIndex];
      setTotalAttempts(prev => prev + 1);

      if (tappedVerse.ayahNumber === expectedVerse.ayahNumber) {
        // ✅ Correct placement
        setPlacedVerses(prev => ({ ...prev, [currentSlotIndex]: tappedVerse }));
        setRemainingPool(prev => prev.filter(v => v.ayahNumber !== tappedVerse.ayahNumber));

        // Animate slot fill
        Animated.spring(getSlotFillAnim(currentSlotIndex), {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }).start();

        const nextIndex = currentSlotIndex + 1;
        if (nextIndex >= sortedVerses.length) {
          // 🎉 All done
          setIsComplete(true);
          Animated.parallel([
            Animated.spring(completionScale, {
              toValue: 1,
              useNativeDriver: true,
              tension: 50,
              friction: 7,
            }),
            Animated.timing(completionOpacity, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start();
        } else {
          setCurrentSlotIndex(nextIndex);
          // Auto-scroll to next slot
          setTimeout(() => {
            slotsScrollRef.current?.scrollTo({ y: nextIndex * 72, animated: true });
          }, 200);
        }
      } else {
        // ❌ Wrong placement — shake the tapped card
        setWrongAttempts(prev => prev + 1);
        setWrongVerseKey(tappedVerse.ayahNumber);

        const shakeVal = getShakeAnim(tappedVerse.ayahNumber);
        Animated.sequence([
          Animated.timing(shakeVal, { toValue: 12, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeVal, { toValue: -12, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeVal, { toValue: 10, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeVal, { toValue: -10, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeVal, { toValue: 0, duration: 60, useNativeDriver: true }),
        ]).start(() => {
          setWrongVerseKey(null);
        });
      }
    },
    [isComplete, sortedVerses, currentSlotIndex],
  );

  // ── Computed ──────────────────────────────────────────────────────────────
  const accuracy =
    totalAttempts > 0 ? Math.round(((totalAttempts - wrongAttempts) / totalAttempts) * 100) : 100;
  const progress = `${Object.keys(placedVerses).length}/${sortedVerses.length}`;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={s.container}>
      {/* ─── Header ────────────────────────────────────────────────────────── */}
      <Animated.View
        style={[
          s.header,
          {
            transform: [{ translateY: headerSlide }],
            opacity: headerOpacity,
          },
        ]}
      >
        <Pressable
          onPress={onExit}
          style={({ pressed }) => [s.exitBtn, pressed && s.exitBtnPressed]}
        >
          <Text style={s.exitBtnText}>✕ خروج</Text>
        </Pressable>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>ترتيب الآيات</Text>
          <Text style={s.headerSub}>{thumnLabel}</Text>
        </View>
        <View style={s.progressBadge}>
          <Text style={s.progressText}>{progress}</Text>
        </View>
      </Animated.View>

      {/* ─── Placeholder Slots ─────────────────────────────────────────────── */}
      <View style={s.slotsSection}>
        <Text style={s.sectionLabel}>رتّب الآيات بالترتيب الصحيح</Text>
        <ScrollView
          ref={slotsScrollRef}
          style={s.slotsScroll}
          contentContainerStyle={s.slotsContent}
          showsVerticalScrollIndicator={false}
        >
          {sortedVerses.map((verse, index) => {
            const isActive = index === currentSlotIndex && !isComplete;
            const isFilled = !!placedVerses[index];
            const fillAnim = getSlotFillAnim(index);

            return (
              <Animated.View
                key={verse.ayahNumber}
                style={[
                  s.slotRow,
                  isActive && s.slotRowActive,
                  isFilled && s.slotRowFilled,
                  isActive && { transform: [{ scale: pulseAnim }] },
                  isFilled && {
                    opacity: Animated.add(0.4, Animated.multiply(fillAnim, 0.6)),
                    transform: [{ scale: Animated.add(0.95, Animated.multiply(fillAnim, 0.05)) }],
                  },
                ]}
              >
                <Text style={[s.slotNumber, isFilled && s.slotNumberFilled]}>
                  ﴿ {verse.ayahNumber} ﴾
                </Text>
                {isFilled ? (
                  <View style={s.slotFilledContent}>
                    <Text style={s.slotCheckmark}>✓</Text>
                    <Text style={s.slotVerseText} numberOfLines={1}>
                      {placedVerses[index]!.text}
                    </Text>
                  </View>
                ) : (
                  <View style={[s.slotBlank, isActive && s.slotBlankActive]}>
                    <Text style={[s.slotBlankText, isActive && s.slotBlankTextActive]}>
                      {isActive ? 'ضع الآية هنا...' : ''}
                    </Text>
                  </View>
                )}
              </Animated.View>
            );
          })}
        </ScrollView>
      </View>

      {/* ─── Separator ─────────────────────────────────────────────────────── */}
      <View style={s.separator}>
        <View style={s.separatorLine} />
        <View style={s.separatorBadge}>
          <Text style={s.separatorBadgeText}>اختر الآية</Text>
        </View>
        <View style={s.separatorLine} />
      </View>

      {/* ─── Verse Pool ────────────────────────────────────────────────────── */}
      <View style={s.poolSection}>
        <ScrollView
          style={s.poolScroll}
          contentContainerStyle={s.poolContent}
          showsVerticalScrollIndicator={false}
        >
          {remainingPool.map(verse => {
            const shake = getShakeAnim(verse.ayahNumber);
            const isWrong = wrongVerseKey === verse.ayahNumber;

            return (
              <Animated.View
                key={verse.ayahNumber}
                style={[
                  { transform: [{ translateX: shake }] },
                ]}
              >
                <Pressable
                  onPress={() => handleVerseTap(verse)}
                  style={({ pressed }) => [
                    s.poolCard,
                    pressed && s.poolCardPressed,
                    isWrong && s.poolCardWrong,
                  ]}
                >
                  <Text style={s.poolVerseText}>{verse.text}</Text>
                </Pressable>
              </Animated.View>
            );
          })}
          {remainingPool.length === 0 && !isComplete && (
            <Text style={s.poolEmptyText}>جميع الآيات تم وضعها ✓</Text>
          )}
        </ScrollView>
      </View>

      {/* ─── Completion Overlay ────────────────────────────────────────────── */}
      {isComplete && (
        <Animated.View
          style={[
            s.completionOverlay,
            {
              opacity: completionOpacity,
            },
          ]}
        >
          <Animated.View
            style={[
              s.completionCard,
              {
                transform: [{ scale: completionScale }],
              },
            ]}
          >
            <Text style={s.completionEmoji}>🎉</Text>
            <Text style={s.completionTitle}>أحسنت!</Text>
            <Text style={s.completionSubtitle}>لقد رتّبت جميع الآيات بنجاح</Text>

            <View style={s.statsRow}>
              <View style={s.statItem}>
                <Text style={s.statValue}>{sortedVerses.length}</Text>
                <Text style={s.statLabel}>آيات</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.statItem}>
                <Text style={s.statValue}>{accuracy}%</Text>
                <Text style={s.statLabel}>الدقة</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.statItem}>
                <Text style={s.statValue}>{wrongAttempts}</Text>
                <Text style={s.statLabel}>أخطاء</Text>
              </View>
            </View>

            <Pressable
              onPress={onExit}
              style={({ pressed }) => [s.completionBtn, pressed && s.completionBtnPressed]}
            >
              <Text style={s.completionBtnText}>عودة للقراءة</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
  },

  // ── Header ──────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: BorderRadius.lg,
    borderBottomRightRadius: BorderRadius.lg,
    ...Shadow.card,
  },
  exitBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  exitBtnPressed: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  exitBtnText: {
    color: Colors.textLight,
    fontSize: Typography.caption,
    fontWeight: '700',
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    color: Colors.textLight,
    fontSize: Typography.heading3,
    fontWeight: '700',
  },
  headerSub: {
    color: Colors.goldLight,
    fontSize: Typography.caption,
    marginTop: 2,
  },
  progressBadge: {
    backgroundColor: Colors.gold,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  progressText: {
    color: Colors.primaryDark,
    fontSize: Typography.caption,
    fontWeight: '800',
  },

  // ── Slots Section ───────────────────────────────────────────
  slotsSection: {
    flex: 1,
    paddingTop: Spacing.sm,
  },
  sectionLabel: {
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: Typography.caption,
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  slotsScroll: {
    flex: 1,
  },
  slotsContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    padding: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.surface,
    minHeight: 56,
    ...Shadow.card,
  },
  slotRowActive: {
    borderColor: Colors.gold,
    backgroundColor: 'rgba(201, 168, 76, 0.06)',
    borderWidth: 2,
  },
  slotRowFilled: {
    borderColor: Colors.success,
    backgroundColor: 'rgba(56, 161, 105, 0.06)',
  },
  slotNumber: {
    fontSize: Typography.heading3,
    color: Colors.goldDark,
    fontWeight: '700',
    minWidth: 56,
    textAlign: 'center',
  },
  slotNumberFilled: {
    color: Colors.success,
  },
  slotFilledContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  slotCheckmark: {
    fontSize: Typography.heading3,
    color: Colors.success,
    fontWeight: '800',
  },
  slotVerseText: {
    flex: 1,
    fontFamily: Typography.quranFont,
    fontSize: Typography.body,
    color: Colors.textPrimary,
    textAlign: 'right',
    lineHeight: 28,
  },
  slotBlank: {
    flex: 1,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  slotBlankActive: {
    backgroundColor: 'rgba(201, 168, 76, 0.12)',
    borderWidth: 1,
    borderColor: Colors.goldLight,
    borderStyle: 'dashed',
  },
  slotBlankText: {
    color: Colors.textMuted,
    fontSize: Typography.caption,
    textAlign: 'center',
  },
  slotBlankTextActive: {
    color: Colors.goldDark,
    fontWeight: '600',
  },

  // ── Separator ───────────────────────────────────────────────
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.surface,
  },
  separatorBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginHorizontal: Spacing.sm,
  },
  separatorBadgeText: {
    color: Colors.textLight,
    fontSize: Typography.badge,
    fontWeight: '700',
  },

  // ── Pool Section ────────────────────────────────────────────
  poolSection: {
    flex: 1,
    backgroundColor: 'rgba(13, 92, 99, 0.04)',
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
  },
  poolScroll: {
    flex: 1,
  },
  poolContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  poolCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surface,
    ...Shadow.card,
  },
  poolCardPressed: {
    backgroundColor: Colors.patternOverlay,
    borderColor: Colors.primaryLight,
    transform: [{ scale: 0.98 }],
  },
  poolCardWrong: {
    borderColor: Colors.error,
    backgroundColor: 'rgba(229, 62, 62, 0.06)',
  },
  poolVerseText: {
    fontFamily: Typography.quranFont,
    fontSize: Typography.ayahSm,
    color: Colors.textPrimary,
    lineHeight: 38,
    textAlign: 'center',
  },
  poolEmptyText: {
    textAlign: 'center',
    color: Colors.success,
    fontSize: Typography.body,
    fontWeight: '600',
    marginTop: Spacing.xl,
  },

  // ── Completion Overlay ──────────────────────────────────────
  completionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 22, 40, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    zIndex: 10,
  },
  completionCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    width: '90%',
    maxWidth: 380,
    ...Shadow.gold,
  },
  completionEmoji: {
    fontSize: 56,
    marginBottom: Spacing.md,
  },
  completionTitle: {
    fontSize: Typography.heading1,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  completionSubtitle: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    width: '100%',
    marginBottom: Spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.heading2,
    fontWeight: '800',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.textMuted,
    opacity: 0.2,
  },
  completionBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    width: '100%',
    alignItems: 'center',
    ...Shadow.card,
  },
  completionBtnPressed: {
    backgroundColor: Colors.primaryDark,
    transform: [{ scale: 0.98 }],
  },
  completionBtnText: {
    color: Colors.textLight,
    fontSize: Typography.heading3,
    fontWeight: '700',
  },
});
