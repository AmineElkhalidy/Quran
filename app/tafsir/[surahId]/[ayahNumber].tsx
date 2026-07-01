import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../../src/constants/theme';
import { getSurahById } from '../../../src/constants/surahList';
import { fetchVersesForSurah } from '../../../src/services/quranApiService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TafsirData {
  text: string;
  tafseerName: string;
}

async function fetchTafsir(surahId: number, ayahNumber: number): Promise<TafsirData | null> {
  try {
    // Use quran-tafseer.com API — tafseer_id 1 = التفسير الميسر
    const response = await fetch(
      `http://api.quran-tafseer.com/tafseer/1/${surahId}/${ayahNumber}`
    );
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    const json = await response.json();
    if (json.text) {
      return {
        text: json.text,
        tafseerName: json.tafseer_name || 'التفسير الميسر',
      };
    }
    return null;
  } catch (error) {
    console.error('[Tafsir] Failed to fetch:', error);
    return null;
  }
}

export default function TafsirScreen() {
  const { surahId, ayahNumber } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const sId = parseInt(Array.isArray(surahId) ? surahId[0] : surahId ?? '1', 10);
  const aNum = parseInt(Array.isArray(ayahNumber) ? ayahNumber[0] : ayahNumber ?? '1', 10);

  const surah = getSurahById(sId);

  const [verseText, setVerseText] = useState<string>('');
  const [tafsirText, setTafsirText] = useState<string | null>(null);
  const [tafsirName, setTafsirName] = useState<string>('التفسير الميسر');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Load verse text
      const verses = await fetchVersesForSurah(sId);
      const verse = verses.find(v => v.ayahNumber === aNum);
      if (!cancelled && verse) {
        setVerseText(verse.text);
      }

      // Load tafsir
      const tafsir = await fetchTafsir(sId, aNum);
      if (!cancelled) {
        setTafsirText(
          tafsir?.text || 'لم يتم العثور على تفسير لهذه الآية. يرجى التحقق من اتصالك بالإنترنت.'
        );
        if (tafsir?.tafseerName) setTafsirName(tafsir.tafseerName);
        setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [sId, aNum]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
    >
      {/* Verse Header */}
      <View style={styles.verseHeader}>
        <Text style={styles.surahLabel}>
          {surah?.nameArabic ?? 'القرآن الكريم'} — الآية {aNum}
        </Text>
        {verseText ? (
          <Text style={styles.verseText}>{verseText}</Text>
        ) : (
          <ActivityIndicator size="small" color={Colors.gold} style={{ marginTop: Spacing.md }} />
        )}
      </View>

      {/* Tafsir Content */}
      <View style={styles.tafsirSection}>
        <View style={styles.tafsirHeaderRow}>
          <Text style={styles.tafsirIcon}>📖</Text>
          <Text style={styles.tafsirTitle}>{tafsirName}</Text>
        </View>

        <View style={styles.tafsirDivider} />

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>جاري تحميل التفسير...</Text>
          </View>
        ) : (
          <Text style={styles.tafsirText}>{tafsirText}</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
  },
  verseHeader: {
    backgroundColor: Colors.primary,
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  surahLabel: {
    fontSize: Typography.caption,
    color: Colors.gold,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  verseText: {
    fontFamily: Typography.quranFont,
    fontSize: Typography.ayahMd,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 48,
    paddingHorizontal: Spacing.sm,
  },
  tafsirSection: {
    margin: Spacing.md,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadow.card,
  },
  tafsirHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
  tafsirIcon: {
    fontSize: 24,
  },
  tafsirTitle: {
    fontSize: Typography.heading2,
    fontWeight: 'bold',
    color: Colors.primaryDark,
  },
  tafsirDivider: {
    height: 2,
    backgroundColor: Colors.gold,
    marginVertical: Spacing.md,
    borderRadius: 1,
    opacity: 0.4,
  },
  tafsirText: {
    fontSize: Typography.body + 1,
    color: Colors.textPrimary,
    lineHeight: 30,
    textAlign: 'right',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.body,
    color: Colors.textMuted,
  },
});
