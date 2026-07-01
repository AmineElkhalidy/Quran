import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../src/constants/theme';
import { useQuranStore } from '../../src/store/quranStore';
import { useEffect, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSurahById } from '../../src/constants/surahList';
import { calculateThumnBoundaries } from '../../src/constants/athmanBoundaries';

export default function HomeScreen() {
  const router = useRouter();
  const stats = useQuranStore(state => state.stats);
  const lastRead = useQuranStore(state => state.lastRead);
  const loadStats = useQuranStore(state => state.loadStats);
  const insets = useSafeAreaInsets();

  // Load stats on mount and whenever the screen re-renders
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Also refresh when the component gains focus (user navigates back)
  // Using a simple interval approach since @react-navigation/native isn't a direct dep
  useEffect(() => {
    const interval = setInterval(() => {
      loadStats();
    }, 2000); // Refresh every 2s while home is mounted
    return () => clearInterval(interval);
  }, [loadStats]);

  // Compute progress bar percentage
  const xpProgress = stats.xpToNextLevel > 0
    ? Math.min(100, ((stats.totalXP % stats.xpToNextLevel) / stats.xpToNextLevel) * 100)
    : 0;

  // Determine the "continue learning" card content
  const lastReadSurah = lastRead ? getSurahById(lastRead.surahId) : null;
  const lastReadThumns = lastRead ? calculateThumnBoundaries(lastRead.surahId) : [];
  const lastReadThumn = lastReadThumns.find(t => t.thumnNumber === lastRead?.thumnNumber);

  // Check if streak was active today
  const isActiveToday = stats.streak.lastActiveDate
    ? new Date(stats.streak.lastActiveDate).toDateString() === new Date().toDateString()
    : false;

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContent,
        { 
          paddingTop: insets.top + Spacing.md,
          paddingBottom: insets.bottom + Spacing.xxl // Extra space for tab bar
        }
      ]}
    >
      {/* Header Profile / Stats */}
      <View style={styles.statsCard}>
        <View style={styles.statsHeader}>
          <View>
            <Text style={styles.levelText}>المستوى {stats.level}</Text>
            <Text style={styles.xpText}>{stats.totalXP} نقطة خبرة</Text>
          </View>
          <View style={[styles.streakBadge, isActiveToday && styles.streakBadgeActive]}>
            <Text style={styles.streakIcon}>🔥</Text>
            <Text style={styles.streakText}>{stats.streak.currentStreak} أيام</Text>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>
            إلى المستوى {stats.level + 1} — {stats.xpToNextLevel - (stats.totalXP % stats.xpToNextLevel)} نقطة متبقية
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${xpProgress}%` }
              ]} 
            />
          </View>
        </View>

        {/* Mini Stats Row */}
        <View style={styles.miniStatsRow}>
          <View style={styles.miniStat}>
            <Text style={styles.miniStatValue}>{stats.totalThumnCompleted}</Text>
            <Text style={styles.miniStatLabel}>أثمان مكتملة</Text>
          </View>
          <View style={styles.miniStatDivider} />
          <View style={styles.miniStat}>
            <Text style={styles.miniStatValue}>{stats.totalChallengesCompleted}</Text>
            <Text style={styles.miniStatLabel}>تحديات</Text>
          </View>
          <View style={styles.miniStatDivider} />
          <View style={styles.miniStat}>
            <Text style={styles.miniStatValue}>{stats.streak.longestStreak}</Text>
            <Text style={styles.miniStatLabel}>أعلى سلسلة</Text>
          </View>
        </View>
      </View>

      {/* Continue Learning */}
      <Text style={styles.sectionTitle}>مواصلة التعلم</Text>
      {lastReadSurah && lastReadThumn ? (
        <Pressable 
          style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
          onPress={() => router.push(`/reader/${lastReadSurah.id}`)}
        >
          <View style={styles.actionCardContent}>
            <View>
              <Text style={styles.actionTitle}>{lastReadSurah.nameArabic}</Text>
              <Text style={styles.actionSub}>
                {lastReadThumn.label} • الآيات {lastReadThumn.startAyah}-{lastReadThumn.endAyah}
              </Text>
            </View>
            <Text style={styles.actionArrow}>←</Text>
          </View>
        </Pressable>
      ) : (
        <Pressable 
          style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
          onPress={() => router.push('/reader/1')}
        >
          <View style={styles.actionCardContent}>
            <View>
              <Text style={styles.actionTitle}>ابدأ رحلتك</Text>
              <Text style={styles.actionSub}>سورة الفاتحة • الآيات 1-7</Text>
            </View>
            <Text style={styles.actionArrow}>←</Text>
          </View>
        </Pressable>
      )}

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
  },
  scrollContent: {
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
  streakBadgeActive: {
    backgroundColor: Colors.goldDark,
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
    borderRadius: 4,
  },
  miniStatsRow: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
  },
  miniStat: {
    flex: 1,
    alignItems: 'center',
  },
  miniStatValue: {
    color: Colors.gold,
    fontSize: Typography.heading3,
    fontWeight: 'bold',
  },
  miniStatLabel: {
    color: Colors.textLight,
    fontSize: 11,
    marginTop: 2,
    opacity: 0.8,
  },
  miniStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
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
