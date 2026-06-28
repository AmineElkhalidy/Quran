import { View, Text, StyleSheet, ActivityIndicator, FlatList, Dimensions, Pressable, Switch, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Colors, Typography, Spacing, BorderRadius } from '../../src/constants/theme';
import { getSurahById } from '../../src/constants/surahList';
import { AthmanProgress } from '../../src/components/AthmanProgress';
import { AudioControls } from '../../src/components/AudioControls';
import { calculateThumnBoundaries } from '../../src/constants/athmanBoundaries';
import { fetchVersesForSurah, ApiVerse } from '../../src/services/quranApiService';

const { width } = Dimensions.get('window');

export default function SurahReaderScreen() {
  const { surahId } = useLocalSearchParams();
  const id = parseInt(Array.isArray(surahId) ? surahId[0] : surahId ?? '1', 10);
  
  const surah = getSurahById(id);

  const [verses, setVerses] = useState<ApiVerse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  const [currentThumnIndex, setCurrentThumnIndex] = useState(0);
  const [isTestMode, setIsTestMode] = useState(false);
  const [revealedAyahs, setRevealedAyahs] = useState<Record<number, boolean>>({});

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

  const toggleAyahReveal = (ayahNumber: number) => {
    if (!isTestMode) return;
    setRevealedAyahs(prev => ({
      ...prev,
      [ayahNumber]: !prev[ayahNumber]
    }));
  };

  const renderThumn = ({ item }: { item: any }) => {
    const thumnVerses = verses.filter(v => v.ayahNumber >= item.startAyah && v.ayahNumber <= item.endAyah);
    
    return (
      <ScrollView style={{ width }} contentContainerStyle={{ padding: Spacing.md }}>
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
            return (
              <Pressable 
                key={verse.ayahNumber} 
                onPress={() => toggleAyahReveal(verse.ayahNumber)}
                style={[styles.verseTextContainer, isHidden && styles.verseHidden]}
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
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.arabicName}>{surah.nameArabic}</Text>
        <Text style={styles.meta}>{surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • {surah.verseCount} آية</Text>
        
        <View style={styles.athmanContainer}>
          <AthmanProgress completedThumns={completedThumns} currentThumn={currentThumn?.thumnNumber || 1} />
        </View>
      </View>

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
            const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
            if (newIndex !== currentThumnIndex) {
              setCurrentThumnIndex(newIndex);
              setRevealedAyahs({}); // Reset memory test when switching thumn
            }
          }}
          style={styles.readerArea}
        />
      )}
      
      {/* Pass the first ayah of the current thumn to the audio controls */}
      <AudioControls 
        surahId={id} 
        ayahNumber={currentThumn?.startAyah || 1}
        totalAyahs={surah.verseCount}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgLight },
  header: {
    backgroundColor: Colors.bgCard, padding: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.surface, alignItems: 'center',
  },
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
  versesFlow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', paddingBottom: 40 },
  verseTextContainer: { marginHorizontal: 4, marginVertical: 8 },
  verseText: { fontFamily: Typography.quranFont, fontSize: Typography.ayahMd, color: Colors.textPrimary, lineHeight: 45, textAlign: 'center' },
  ayahNumberBadge: { color: Colors.goldDark, fontSize: Typography.heading3 },
  verseHidden: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.sm, alignItems: 'center', justifyContent: 'center', minWidth: 100 },
  hiddenTextPlaceholder: { color: Colors.textMuted, fontSize: Typography.caption },
  placeholderContainer: { alignItems: 'center', padding: Spacing.xl },
  placeholderIcon: { fontSize: 48, marginBottom: Spacing.md },
  placeholderText: { fontSize: Typography.body, color: Colors.textSecondary, textAlign: 'center' },
});
