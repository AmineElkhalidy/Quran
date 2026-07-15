import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedPressable from '../../src/components/AnimatedPressable';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../src/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Challenge definitions ────────────────────────────────────────────────────

interface ChallengeEntry {
  id: string;
  title: string;
  desc: string;
  icon: string;
  color: string;
  /** If true, the challenge can be scoped to a specific ayah range */
  isVerseBased: boolean;
  /** Route builder — receives surahId + optional range */
  buildRoute: (surahId: number, startAyah?: number, endAyah?: number) => string;
}

const ALL_CHALLENGES: ChallengeEntry[] = [
  // ── Verse-based (scoped to rub') ──────────────────────────────────────────
  {
    id: 'verse-ordering',
    title: 'ترتيب الآيات',
    desc: 'رتب آيات الربع في مكانها الصحيح',
    icon: '📋',
    color: Colors.verseOrder,
    isVerseBased: true,
    buildRoute: (s, sa, ea) =>
      sa != null && ea != null
        ? `/challenges/verse-ordering/${s}?startAyah=${sa}&endAyah=${ea}`
        : `/challenges/verse-ordering/${s}`,
  },
  {
    id: 'fill-blank',
    title: 'أكمل الفراغ',
    desc: 'ابحث عن الكلمة المفقودة في الآية',
    icon: '🔤',
    color: Colors.fillBlank,
    isVerseBased: true,
    buildRoute: (s, sa, ea) =>
      sa != null && ea != null
        ? `/challenges/fill-blank/${s}?startAyah=${sa}&endAyah=${ea}`
        : `/challenges/fill-blank/${s}`,
  },
  {
    id: 'verse-complete',
    title: 'إكمال الآية',
    desc: 'اختر النصف الثاني الصحيح للآية',
    icon: '✍️',
    color: Colors.verseComplete,
    isVerseBased: true,
    buildRoute: (s, sa, ea) =>
      sa != null && ea != null
        ? `/challenges/verse-complete/${s}?startAyah=${sa}&endAyah=${ea}`
        : `/challenges/verse-complete/${s}`,
  },
  {
    id: 'listening',
    title: 'اختبار الاستماع',
    desc: 'استمع إلى المقطع وتعرف على الآية',
    icon: '🎧',
    color: Colors.listening,
    isVerseBased: true,
    buildRoute: (s, sa, ea) =>
      sa != null && ea != null
        ? `/challenges/listening/${s}?startAyah=${sa}&endAyah=${ea}`
        : `/challenges/listening/${s}`,
  },
  {
    id: 'surah-id',
    title: 'تعرف على السورة',
    desc: 'من أي سورة هذه الآية؟ اختر الإجابة',
    icon: '🧠',
    color: Colors.surahId,
    isVerseBased: true,
    buildRoute: (s, sa, ea) =>
      sa != null && ea != null
        ? `/challenges/surah-id/${s}?startAyah=${sa}&endAyah=${ea}`
        : `/challenges/surah-id/${s}`,
  },
  {
    id: 'tafsir-quiz',
    title: 'تحدي التفسير',
    desc: 'اختر التفسير الأقرب لمعنى الآية',
    icon: '📖',
    color: Colors.tafsirQuiz,
    isVerseBased: true,
    buildRoute: (s, sa, ea) =>
      sa != null && ea != null
        ? `/challenges/tafsir-quiz/${s}?startAyah=${sa}&endAyah=${ea}`
        : `/challenges/tafsir-quiz/${s}`,
  },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function RubChallengesPickerScreen() {
  const { surahId: surahIdParam, startAyah: startAyahParam, endAyah: endAyahParam, rubLabel: rubLabelParam } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const surahId = parseInt(Array.isArray(surahIdParam) ? surahIdParam[0] : surahIdParam ?? '1', 10);
  const startAyah = parseInt(Array.isArray(startAyahParam) ? startAyahParam[0] : startAyahParam ?? '1', 10);
  const endAyah = parseInt(Array.isArray(endAyahParam) ? endAyahParam[0] : endAyahParam ?? '1', 10);
  const rubLabel = Array.isArray(rubLabelParam) ? rubLabelParam[0] : rubLabelParam ?? '';

  const handleSelectChallenge = (challenge: ChallengeEntry) => {
    const route = challenge.isVerseBased
      ? challenge.buildRoute(surahId, startAyah, endAyah)
      : challenge.buildRoute(surahId);
    router.push(route as any);
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Header */}
      <LinearGradient
        colors={Colors.gradients.primary as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerContainer}
      >
        <Text style={styles.headerIcon}>📝</Text>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>تحديات الربع</Text>
          <Text style={styles.headerSub}>{rubLabel}</Text>
          <Text style={styles.headerRange}>
            الآيات {startAyah} – {endAyah}
          </Text>
        </View>
      </LinearGradient>

      {/* Challenge cards */}
      <ScrollView
        style={styles.challengesScroll}
        contentContainerStyle={styles.challengesContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section: Verse-based */}
        <Text style={styles.sectionLabel}>تحديات النص والحفظ</Text>
        <Text style={styles.sectionHint}>
          هذه التحديات تستخدم آيات الربع الحالي فقط
        </Text>

        {ALL_CHALLENGES.filter(c => c.isVerseBased).map(challenge => (
          <AnimatedPressable
            key={challenge.id}
            style={({ pressed }) => [
              styles.challengeCard,
              { borderLeftColor: challenge.color },
              pressed && styles.challengeCardPressed,
            ]}
            onPress={() => handleSelectChallenge(challenge)}
          >
            <View style={[styles.iconWrap, { backgroundColor: challenge.color + '20' }]}>
              <Text style={styles.icon}>{challenge.icon}</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{challenge.title}</Text>
              <Text style={styles.cardDesc}>{challenge.desc}</Text>
            </View>
            <Text style={styles.arrow}>←</Text>
          </AnimatedPressable>
        ))}

      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
  },

  // Header
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    ...Shadow.header,
  },
  headerIcon: {
    fontSize: 36,
    marginLeft: Spacing.md,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.heading1,
    fontWeight: 'bold',
    color: Colors.gold,
    textAlign: 'right',
  },
  headerSub: {
    fontSize: Typography.body,
    color: Colors.textLight,
    marginTop: 2,
    textAlign: 'right',
  },
  headerRange: {
    fontSize: Typography.caption,
    color: Colors.goldLight,
    marginTop: 2,
    textAlign: 'right',
  },

  // Sections
  sectionLabel: {
    fontSize: Typography.caption,
    fontWeight: 'bold',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
    paddingHorizontal: 4,
    textAlign: 'right',
  },
  sectionHint: {
    fontSize: Typography.badge,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
    paddingHorizontal: 4,
    textAlign: 'right',
  },
  sectionSpacer: {
    height: Spacing.lg,
  },

  // Challenge cards
  challengesScroll: {
    flex: 1,
  },
  challengesContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  challengeCard: {
    backgroundColor: Colors.bgCard,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 5,
    marginBottom: Spacing.sm,
    ...Shadow.card,
  },
  challengeCardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: Typography.heading3,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  cardDesc: {
    fontSize: Typography.caption,
    color: Colors.textMuted,
    marginTop: 3,
    textAlign: 'right',
    lineHeight: 18,
  },
  arrow: {
    fontSize: 20,
    color: Colors.primary,
    fontWeight: 'bold',
    marginLeft: Spacing.sm,
  },
});
