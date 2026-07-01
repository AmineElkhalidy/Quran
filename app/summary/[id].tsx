import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../src/constants/theme';
import { getSurahById } from '../../src/constants/surahList';

export default function SurahSummaryScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const surahId = parseInt(Array.isArray(id) ? id[0] : id ?? '1', 10);
  const surah = getSurahById(surahId);

  if (!surah) return <Text>Surah not found</Text>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>العودة →</Text>
          </Pressable>
          <Text style={styles.arabicName}>{surah.nameArabic}</Text>
        </View>
        <Text style={styles.englishName}>{surah.nameArabic}</Text>
      </View>

      <View style={styles.metaCardsContainer}>
        <View style={styles.metaCard}>
          <Text style={styles.metaIcon}>📍</Text>
          <Text style={styles.metaLabel}>النزول</Text>
          <Text style={styles.metaValue}>{surah.revelationType === 'Makki' ? 'مكية' : 'مدنية'}</Text>
        </View>
        <View style={styles.metaCard}>
          <Text style={styles.metaIcon}>🔢</Text>
          <Text style={styles.metaLabel}>الآيات</Text>
          <Text style={styles.metaValue}>{surah.verseCount}</Text>
        </View>
        <View style={styles.metaCard}>
          <Text style={styles.metaIcon}>📚</Text>
          <Text style={styles.metaLabel}>الجزء</Text>
          <Text style={styles.metaValue}>{surah.juzStart}</Text>
        </View>
      </View>

      <View style={styles.contentSection}>
        <Text style={styles.sectionTitleArabic}>الملخص</Text>
        <Text style={styles.summaryTextArabic}>{surah.summaryArabic || surah.summaryEnglish}</Text>
      </View>

      {/* Placeholder for Asbab al-Nuzul (Context of Revelation) */}
      <View style={styles.contentSection}>
        <Text style={styles.sectionTitleArabic}>أسباب النزول</Text>
        <Text style={styles.summaryTextArabic}>
          {surah.asbabNuzul || "توجيهات عامة نزلت على النبي ﷺ في الفترة الـ" + (surah.revelationType === 'Makki' ? 'مكية' : 'مدنية') + "."}
        </Text>
      </View>
      
      <View style={styles.actionContainer}>
         <Pressable style={styles.readButton} onPress={() => router.push(`/reader/${surah.id}`)}>
            <Text style={styles.readButtonText}>اقرأ السورة</Text>
         </Pressable>
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
    padding: Spacing.xl,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    alignItems: 'center',
    paddingTop: Spacing.xxl, // Account for safe area roughly
  },
  headerTop: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    left: 0,
    padding: Spacing.sm,
  },
  backText: {
    color: Colors.gold,
    fontSize: Typography.body,
    fontWeight: 'bold',
  },
  arabicName: {
    fontFamily: Typography.quranFontBold,
    fontSize: Typography.heading1 + 8,
    color: Colors.gold,
  },
  englishName: {
    fontFamily: Typography.uiFont,
    fontSize: Typography.heading3,
    color: Colors.textLight,
    marginTop: Spacing.sm,
    fontWeight: '500',
  },
  metaCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.md,
    marginTop: -Spacing.xl, // Overlap header
  },
  metaCard: {
    backgroundColor: Colors.bgCard,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: Spacing.xs,
    ...Shadow.card,
  },
  metaIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  metaLabel: {
    fontSize: Typography.caption,
    color: Colors.textMuted,
  },
  metaValue: {
    fontSize: Typography.body,
    fontWeight: 'bold',
    color: Colors.primaryDark,
    marginTop: 2,
  },
  contentSection: {
    padding: Spacing.lg,
    backgroundColor: Colors.bgCard,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.md,
    ...Shadow.card,
  },
  sectionTitle: {
    fontSize: Typography.heading3,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  summaryText: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  arabicSummaryContainer: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.surface,
  },
  sectionTitleArabic: {
    fontSize: Typography.heading3,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Spacing.sm,
    textAlign: 'right',
    fontFamily: Typography.uiFont,
  },
  summaryTextArabic: {
    fontSize: Typography.body + 2,
    color: Colors.textSecondary,
    lineHeight: 30,
    textAlign: 'right',
    fontFamily: Typography.quranFont,
  },
  actionContainer: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  readButton: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadow.card,
  },
  readButtonText: {
    color: Colors.textLight,
    fontSize: Typography.heading2,
    fontWeight: 'bold',
  }
});
