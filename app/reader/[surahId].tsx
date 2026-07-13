import { View, Text, StyleSheet, ActivityIndicator, FlatList, Dimensions, Pressable, Switch, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { Colors, Typography, Spacing, BorderRadius } from '../../src/constants/theme';
import { getSurahById } from '../../src/constants/surahList';
import { AthmanProgress } from '../../src/components/AthmanProgress';
import { AudioControls } from '../../src/components/AudioControls';
import { VerseActionsSheet } from '../../src/components/VerseActionsSheet';
import { calculateThumnBoundaries } from '../../src/constants/athmanBoundaries';
import { fetchVersesForSurah, ApiVerse } from '../../src/services/quranApiService';
import type { Thumn } from '../../src/types';
import { useResponsive } from '../../src/utils/responsive';

export default function SurahReaderScreen() {
  const { surahId } = useLocalSearchParams();
  const router = useRouter();
  const id = parseInt(Array.isArray(surahId) ? surahId[0] : surahId ?? '1', 10);
  
  const surah = getSurahById(id);
  const { width, maxWidth } = useResponsive();

  const [verses, setVerses] = useState<ApiVerse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  const [currentThumnIndex, setCurrentThumnIndex] = useState(0);
  const [isTestMode, setIsTestMode] = useState(false);
  const [revealedAyahs, setRevealedAyahs] = useState<Record<number, boolean>>({});

  // Verse actions sheet state
  const [selectedVerse, setSelectedVerse] = useState<ApiVerse | null>(null);
  const [isSheetVisible, setIsSheetVisible] = useState(false);

  const thumns = calculateThumnBoundaries(id);
  
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    setCurrentThumnIndex(0);
    setIsTestMode(false);
    setRevealedAyahs({});

    fetchVersesForSurah(id).then(data => {
      if (cancelled) return;
      if (data.length === 0) {
        setLoadError('تعذر تحميل الآيات. يرجى التحقق من اتصالك بالإنترنت.');
      }
      setVerses(data);
      setIsLoading(false);
    });

    return () => { cancelled = true; };
  }, [id]);

  if (!surah) return <Text>سورة غير موجودة</Text>;

  const currentThumn = thumns[currentThumnIndex];
  const completedThumns = thumns.slice(0, currentThumnIndex).map(t => t.thumnNumber);

  const showBismillah = id !== 9;

  const handleVerseLongPress = useCallback((verse: ApiVerse) => {
    setSelectedVerse(verse);
    setIsSheetVisible(true);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setIsSheetVisible(false);
    setTimeout(() => setSelectedVerse(null), 350);
  }, []);

  const handleShowTafsir = useCallback((verse: ApiVerse) => {
    router.push(`/tafsir/${verse.surahId}/${verse.ayahNumber}` as any);
  }, [router]);

  // Each thumn page renders its own AudioControls with its own correct ayah range.
  // This completely eliminates all scroll-tracking complexity.
  const renderThumn = ({ item }: { item: Thumn }) => {
    const thumnVerses = verses.filter(v => v.ayahNumber >= item.startAyah && v.ayahNumber <= item.endAyah);
    
    return (
      <View style={{ width, flex: 1 }}>
        <ScrollView 
          contentContainerStyle={{ 
            padding: Spacing.md, 
            paddingBottom: 16,
            maxWidth: maxWidth as any,
            width: '100%',
            alignSelf: 'center'
          }}
        >
          <Text style={styles.thumnLabel}>{item.label}</Text>
          
          <View style={styles.testModeToggle}>
            <Text style={styles.testModeLabel}>اختبر حفظك</Text>
            <Switch 
              value={isTestMode} 
              onValueChange={setIsTestMode}
              trackColor={{ false: Colors.surface, true: Colors.gold }}
              thumbColor={isTestMode ? Colors.primary : Colors.textMuted}
            />
          </View>

          {showBismillah && item.startAyah === 1 && (
            <Text style={styles.bismillah}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
          )}
          
          <View style={styles.versesFlow}>
            {thumnVerses.map(verse => {
              const isHidden = isTestMode && !revealedAyahs[verse.ayahNumber];
              const isSelected = selectedVerse?.ayahNumber === verse.ayahNumber;
              return (
                <Pressable 
                  key={verse.ayahNumber} 
                  onPress={() => {
                    if (isTestMode) {
                      setRevealedAyahs(prev => ({ ...prev, [verse.ayahNumber]: !prev[verse.ayahNumber] }));
                    }
                  }}
                  onLongPress={() => handleVerseLongPress(verse)}
                  delayLongPress={400}
                  style={[
                    styles.verseTextContainer, 
                    isHidden && styles.verseHidden,
                    isSelected && styles.verseSelected,
                  ]}
                >
                  {isHidden ? (
                    <Text style={styles.hiddenTextPlaceholder}>انقر لإظهار الآية {verse.ayahNumber}</Text>
                  ) : (
                    <Text style={styles.verseText}>
                      {verse.text} <Text style={styles.ayahNumberBadge}>﴿ {verse.ayahNumber} ﴾</Text>
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>

          {!isTestMode && (
            <Text style={styles.longPressHint}>اضغط مطولاً على أي آية لعرض الخيارات</Text>
          )}
        </ScrollView>

        {/* 
          AudioControls lives INSIDE each thumn page.
          startAyah/endAyah are always correct for this specific page — 
          no scroll tracking needed whatsoever.
        */}
        <AudioControls 
          surahId={id}
          startAyah={item.startAyah}
          endAyah={item.endAyah}
          totalAyahs={surah?.verseCount ?? 0}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { maxWidth: maxWidth as any, width: '100%', alignSelf: 'center', borderBottomWidth: 0 }]}>
        <Text style={styles.arabicName}>{surah.nameArabic}</Text>
        <Text style={styles.meta}>{surah.revelationType === 'Makki' ? 'مكية' : 'مدنية'} • {surah.verseCount} آية</Text>
        
        <View style={styles.athmanContainer}>
          <AthmanProgress completedThumns={completedThumns} currentThumn={currentThumn?.thumnNumber || 1} />
        </View>
      </View>
      <View style={styles.headerBorder} />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>جاري تحميل الآيات...</Text>
        </View>
      ) : loadError ? (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderIcon}>⚠️</Text>
          <Text style={styles.placeholderText}>{loadError}</Text>
        </View>
      ) : (
        <FlatList
          data={thumns}
          renderItem={renderThumn}
          keyExtractor={item => item.thumnNumber.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            // Only update thumn index for the AthmanProgress header indicator.
            // Audio is driven per-page, so this doesn't affect playback correctness.
            const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
            const clamped = Math.max(0, Math.min(newIndex, thumns.length - 1));
            if (clamped !== currentThumnIndex) {
              setCurrentThumnIndex(clamped);
              setRevealedAyahs({});
            }
          }}
          style={styles.readerArea}
        />
      )}
      
      {/* Verse actions bottom sheet */}
      <VerseActionsSheet
        visible={isSheetVisible}
        verse={selectedVerse}
        surahNameArabic={surah.nameArabic}
        onClose={handleCloseSheet}
        onShowTafsir={handleShowTafsir}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgLight },
  header: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  headerBorder: { borderBottomWidth: 1, borderBottomColor: Colors.surface },
  arabicName: { fontFamily: Typography.quranFontBold, fontSize: Typography.heading1, color: Colors.primary },
  meta: { fontFamily: Typography.uiFont, color: Colors.textMuted, fontSize: Typography.caption, marginTop: 4 },
  athmanContainer: { width: '100%', marginTop: Spacing.md },
  readerArea: { flex: 1 },
  loadingContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xxl },
  loadingText: { marginTop: Spacing.md, fontSize: Typography.body, color: Colors.textMuted },
  thumnLabel: { fontSize: Typography.heading3, color: Colors.primaryDark, fontWeight: 'bold', textAlign: 'center', marginBottom: Spacing.sm },
  testModeToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md, backgroundColor: Colors.surface, padding: Spacing.sm, borderRadius: BorderRadius.md },
  testModeLabel: { marginRight: Spacing.sm, fontSize: Typography.body, fontWeight: 'bold', color: Colors.textPrimary },
  bismillah: { fontFamily: Typography.quranFont, fontSize: Typography.ayahMd, textAlign: 'center', color: Colors.textPrimary, marginVertical: Spacing.lg },
  versesFlow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', paddingBottom: 16 },
  verseTextContainer: { marginHorizontal: 4, marginVertical: 8, borderRadius: BorderRadius.sm, padding: 4 },
  verseText: { fontFamily: Typography.quranFont, fontSize: Typography.ayahMd, color: Colors.textPrimary, lineHeight: 45, textAlign: 'center' },
  ayahNumberBadge: { color: Colors.goldDark, fontSize: Typography.heading3 },
  verseSelected: { backgroundColor: 'rgba(201, 168, 76, 0.15)', borderRadius: BorderRadius.md },
  verseHidden: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.sm, alignItems: 'center', justifyContent: 'center', minWidth: 100 },
  hiddenTextPlaceholder: { color: Colors.textMuted, fontSize: Typography.caption },
  longPressHint: { textAlign: 'center', color: Colors.textMuted, fontSize: Typography.caption, marginTop: Spacing.sm, fontStyle: 'italic' },
  placeholderContainer: { alignItems: 'center', padding: Spacing.xl },
  placeholderIcon: { fontSize: 48, marginBottom: Spacing.md },
  placeholderText: { fontSize: Typography.body, color: Colors.textSecondary, textAlign: 'center' },
});
