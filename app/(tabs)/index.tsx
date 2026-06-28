import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../src/constants/theme';
import { useQuranStore } from '../../src/store/quranStore';
import { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const stats = useQuranStore(state => state.stats);
  const loadStats = useQuranStore(state => state.loadStats);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top + Spacing.md }]}>
      {/* Header Profile / Stats */}
      <View style={styles.statsCard}>
        <View style={styles.statsHeader}>
          <View>
            <Text style={styles.levelText}>المستوى {stats.level}</Text>
            <Text style={styles.xpText}>{stats.totalXP} نقطة خبرة</Text>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakIcon}>🔥</Text>
            <Text style={styles.streakText}>{stats.streak.currentStreak} أيام</Text>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>إلى المستوى {stats.level + 1}</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${Math.min(100, (stats.totalXP / stats.xpToNextLevel) * 100)}%` }
              ]} 
            />
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>مواصلة التعلم</Text>
      <Pressable 
        style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
        onPress={() => router.push('/reader/1')}
      >
        <View style={styles.actionCardContent}>
          <View>
            <Text style={styles.actionTitle}>سورة الفاتحة</Text>
            <Text style={styles.actionSub}>الثمن 1 • الآيات 1-7</Text>
          </View>
          <Text style={styles.actionArrow}>←</Text>
        </View>
      </Pressable>

      <Text style={styles.sectionTitle}>التحدي اليومي</Text>
      <Pressable 
        style={({ pressed }) => [
          styles.actionCard, 
          { borderLeftColor: Colors.verseOrder, borderLeftWidth: 4 },
          pressed && styles.actionCardPressed
        ]}
        onPress={() => router.push('/challenges/verse-ordering/random' as any)}
      >
        <View style={styles.actionCardContent}>
          <View>
            <Text style={styles.actionTitle}>ترتيب الآيات</Text>
            <Text style={styles.actionSub}>تحدي يومي عشوائي • +100 نقطة خبرة</Text>
          </View>
          <Text style={styles.actionArrow}>←</Text>
        </View>
      </Pressable>

      {/* Quick access to short surahs */}
      <Text style={styles.sectionTitle}>قراءة سريعة</Text>
      <View style={styles.quickReadRow}>
        {[
          { id: 112, name: 'الإخلاص' },
          { id: 113, name: 'الفلق' },
          { id: 114, name: 'الناس' },
        ].map((s) => (
          <Pressable 
            key={s.id}
            style={({ pressed }) => [styles.quickReadCard, pressed && styles.actionCardPressed]}
            onPress={() => router.push(`/reader/${s.id}`)}
          >
            <Text style={styles.quickReadArabic}>{s.name}</Text>
            <Text style={styles.quickReadNum}>{s.id}</Text>
          </Pressable>
        ))}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
    padding: Spacing.md,
  },
  statsCard: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelText: {
    color: Colors.gold,
    fontSize: Typography.heading3,
    fontWeight: 'bold',
  },
  xpText: {
    color: Colors.textLight,
    fontSize: Typography.body,
    marginTop: 4,
  },
  streakBadge: {
    backgroundColor: Colors.primaryDark,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  streakText: {
    color: Colors.gold,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginTop: Spacing.lg,
  },
  progressLabel: {
    color: Colors.textLight,
    fontSize: Typography.caption,
    marginBottom: 6,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.primaryDark,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.gold,
  },
  sectionTitle: {
    fontSize: Typography.heading2,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  actionCard: {
    backgroundColor: Colors.bgCard,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    ...Shadow.card,
  },
  actionCardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  actionCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: Typography.heading3,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  actionSub: {
    fontSize: Typography.caption,
    color: Colors.textMuted,
    marginTop: 4,
  },
  actionArrow: {
    fontSize: 20,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  quickReadRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  quickReadCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadow.card,
  },
  quickReadArabic: {
    fontFamily: Typography.quranFontBold,
    fontSize: Typography.heading3,
    color: Colors.primary,
  },
  quickReadNum: {
    fontSize: Typography.caption,
    color: Colors.textMuted,
    marginTop: 4,
  },
});
