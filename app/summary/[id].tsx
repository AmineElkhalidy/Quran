import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../src/constants/theme';
import { getSurahById } from '../../src/constants/surahList';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SurahSummaryScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const surahId = parseInt(Array.isArray(id) ? id[0] : id ?? '1', 10);
  const surah = getSurahById(surahId);

  if (!surah) return <Text style={styles.notFound}>السورة غير موجودة</Text>;

  const revelationLabel = surah.revelationType === 'Makki' ? 'مكية' : 'مدنية';
  const summaryText = surah.summaryArabic || `سورة ${surah.nameArabic} من السور ${revelationLabel} التي نزلت في عهد النبي ﷺ.`;
  const asbabText = surah.asbabNuzul || `توجيهات عامة نزلت على النبي ﷺ في الفترة ال${revelationLabel}.`;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <Text style={styles.arabicName}>{surah.nameArabic}</Text>
        <Text style={styles.transliteration}>{surah.nameTransliteration}</Text>
      </View>

      {/* Meta Cards */}
      <View style={styles.metaCardsContainer}>
        <View style={styles.metaCard}>
          <Text style={styles.metaIcon}>📍</Text>
          <Text style={styles.metaLabel}>النزول</Text>
          <Text style={styles.metaValue}>{revelationLabel}</Text>
        </View>
        <View style={styles.metaCard}>
          <Text style={styles.metaIcon}>🔢</Text>
          <Text style={styles.metaLabel}>عدد الآيات</Text>
          <Text style={styles.metaValue}>{surah.verseCount}</Text>
        </View>
        <View style={styles.metaCard}>
          <Text style={styles.metaIcon}>📚</Text>
          <Text style={styles.metaLabel}>الجزء</Text>
          <Text style={styles.metaValue}>{surah.juzStart}</Text>
        </View>
        <View style={styles.metaCard}>
          <Text style={styles.metaIcon}>🔄</Text>
          <Text style={styles.metaLabel}>ترتيب النزول</Text>
          <Text style={styles.metaValue}>{surah.orderInRevelation}</Text>
        </View>
      </View>

      {/* الملخص */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>الملخص</Text>
        <Text style={styles.sectionBody}>{summaryText}</Text>
      </View>

      {/* أسباب النزول */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>أسباب النزول</Text>
        <Text style={styles.sectionBody}>{asbabText}</Text>
      </View>

      {/* Button */}
      <View style={styles.actionContainer}>
        <Pressable
          style={({ pressed }) => [styles.readButton, pressed && { opacity: 0.85 }]}
          onPress={() => router.push(`/reader/${surah.id}`)}
        >
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
  notFound: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: Typography.heading3,
    color: Colors.textMuted,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    alignItems: 'center',
  },
  arabicName: {
    fontFamily: Typography.quranFontBold,
    fontSize: Typography.heading1 + 10,
    color: Colors.gold,
    textAlign: 'center',
  },
  transliteration: {
    fontFamily: Typography.uiFont,
    fontSize: Typography.heading3,
    color: 'rgba(255,255,255,0.7)',
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  metaCardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    marginTop: -Spacing.lg,
    marginBottom: Spacing.md,
  },
  metaCard: {
    width: '47%',
    backgroundColor: Colors.bgCard,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.sm,
    ...Shadow.card,
  },
  metaIcon: {
    fontSize: 26,
    marginBottom: 6,
  },
  metaLabel: {
    fontSize: Typography.caption,
    color: Colors.textMuted,
    fontFamily: Typography.uiFont,
    textAlign: 'center',
  },
  metaValue: {
    fontSize: Typography.heading3,
    fontWeight: 'bold',
    color: Colors.primaryDark,
    marginTop: 2,
    textAlign: 'center',
    fontFamily: Typography.uiFont,
  },
  section: {
    backgroundColor: Colors.bgCard,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    ...Shadow.card,
  },
  sectionTitle: {
    fontFamily: Typography.quranFontBold,
    fontSize: Typography.heading3,
    color: Colors.primary,
    textAlign: 'right',
    marginBottom: Spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: Colors.gold,
    paddingBottom: Spacing.sm,
  },
  sectionBody: {
    fontFamily: Typography.quranFont,
    fontSize: Typography.body + 2,
    color: Colors.textPrimary,
    textAlign: 'right',
    lineHeight: 34,
    writingDirection: 'rtl',
  },
  actionContainer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
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
    fontFamily: Typography.uiFont,
    color: Colors.textLight,
    fontSize: Typography.heading2,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
