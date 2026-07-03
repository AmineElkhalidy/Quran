import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../src/constants/theme';
import { BADGES } from '../../src/constants/badges';
import { useQuranStore } from '../../src/store/quranStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsive } from '../../src/utils/responsive';

export default function RewardsScreen() {
  const stats = useQuranStore(state => state.stats);
  const insets = useSafeAreaInsets();
  const { maxWidth } = useResponsive();

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return Colors.bronze;
      case 'silver': return Colors.silver;
      case 'gold': return Colors.goldTier;
      case 'platinum': return Colors.platinum;
      default: return Colors.surface;
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={{
        paddingTop: insets.top,
        maxWidth,
        width: '100%',
        alignSelf: 'center'
      }}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>الإنجازات</Text>
        <Text style={styles.headerSub}>افتح الأوسمة كلما تقدمت في رحلتك.</Text>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>النقاط</Text>
          <Text style={styles.statValue}>{stats.totalXP}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>أعلى سلسلة</Text>
          <Text style={styles.statValue}>{stats.streak.longestStreak} أيام</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>التحديات</Text>
          <Text style={styles.statValue}>{stats.totalChallengesCompleted}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>الأوسمة ({BADGES.filter(b => b.unlocked).length}/{BADGES.length})</Text>
      
      <View style={styles.badgesGrid}>
        {BADGES.map((badge) => {
          // For demo purposes, we unlock the first two badges
          const isUnlocked = badge.key === 'first_step' || badge.key === 'al_fatiha' || badge.unlocked;

          return (
            <View key={badge.key} style={[styles.badgeCard, !isUnlocked && styles.badgeLocked]}>
              <View style={[styles.iconRing, { borderColor: isUnlocked ? getTierColor(badge.tier) : Colors.surface }]}>
                <Text style={[styles.badgeIcon, !isUnlocked && styles.iconLocked]}>
                  {badge.iconEmoji}
                </Text>
              </View>
              <Text style={styles.badgeNameArabic}>{badge.nameArabic}</Text>
              <Text style={styles.badgeNameEnglish}>{badge.nameEnglish}</Text>
              <Text style={styles.badgeDesc} numberOfLines={2}>
                {isUnlocked ? badge.description : 'مغلق'}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
  },
  header: {
    padding: Spacing.lg,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  headerTitle: {
    color: Colors.gold,
    fontSize: Typography.heading1,
    fontWeight: 'bold',
  },
  headerSub: {
    color: Colors.textLight,
    fontSize: Typography.body,
    marginTop: 4,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    margin: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    justifyContent: 'space-between',
    ...Shadow.card,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: Typography.heading2,
    fontWeight: 'bold',
    color: Colors.primaryDark,
  },
  divider: {
    width: 1,
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.heading2,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.xs,
    justifyContent: 'space-around',
    paddingBottom: Spacing.xl,
  },
  badgeCard: {
    width: '45%',
    backgroundColor: Colors.bgCard,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadow.card,
  },
  badgeLocked: {
    opacity: 0.6,
    backgroundColor: Colors.surface,
  },
  iconRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    backgroundColor: Colors.bgLight,
  },
  badgeIcon: {
    fontSize: 28,
  },
  iconLocked: {
    opacity: 0.3,
  },
  badgeNameArabic: {
    fontFamily: Typography.quranFontBold,
    fontSize: Typography.heading3,
    color: Colors.primary,
    textAlign: 'center',
  },
  badgeNameEnglish: {
    fontFamily: Typography.uiFont,
    fontSize: Typography.caption,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: 2,
  },
  badgeDesc: {
    fontFamily: Typography.uiFont,
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
});
