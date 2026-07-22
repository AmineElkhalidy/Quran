import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../../src/constants/theme';
import { useQuranStore } from '../../../src/store/quranStore';
import { fetchVersesForSurah } from '../../../src/services/quranApiService';
import { getSurahById, SURAH_LIST } from '../../../src/constants/surahList';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CountdownTimer from '../../../src/components/CountdownTimer';

interface Option { id: string; label: string; isCorrect: boolean; }

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function SurahIdChallenge() {
  const { id, startAyah: startAyahParam, endAyah: endAyahParam } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const markCompleted = useQuranStore(s => s.markCompleted);

  // Parse optional rub' range params
  const rubStartAyah = startAyahParam ? parseInt(Array.isArray(startAyahParam) ? startAyahParam[0] : startAyahParam, 10) : undefined;
  const rubEndAyah = endAyahParam ? parseInt(Array.isArray(endAyahParam) ? endAyahParam[0] : endAyahParam, 10) : undefined;
  const isRubScoped = rubStartAyah != null && rubEndAyah != null;

  useEffect(() => {
    if (id === 'random') {
      const r = Math.floor(Math.random() * 114) + 1;
      router.replace(`/challenges/surah-id/${r}` as any);
    }
  }, [id, router]);

  const surahIdNum = id === 'random' ? 1 : parseInt(Array.isArray(id) ? id[0] : id ?? '1', 10);

  const [isLoading, setIsLoading] = useState(true);
  const [verseText, setVerseText] = useState('');
  const [options, setOptions] = useState<Option[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setSelected(null);
    setSubmitted(false);
    setCorrect(false);

    fetchVersesForSurah(surahIdNum).then(allVerses => {
      // Scope to rub' range if params are provided
      const verses = isRubScoped
        ? allVerses.filter(v => v.ayahNumber >= rubStartAyah! && v.ayahNumber <= rubEndAyah!)
        : allVerses;

      if (cancelled || verses.length === 0) { setIsLoading(false); return; }

      const verse = verses[Math.floor(Math.random() * verses.length)];
      
      const words = verse.text.split(' ');
      if (words.length > 5) {
        const start = Math.floor(Math.random() * (words.length - 4));
        const length = 3 + Math.floor(Math.random() * 3);
        setVerseText('... ' + words.slice(start, start + length).join(' ') + ' ...');
      } else {
        setVerseText(verse.text);
      }

      const correctSurah = getSurahById(surahIdNum)!;
      const distractorPool = SURAH_LIST.filter(s => s.id !== surahIdNum);
      const distractors = shuffle(distractorPool).slice(0, 5);

      const opts: Option[] = shuffle([
        { id: 'correct', label: correctSurah.nameArabic, isCorrect: true },
        ...distractors.map((s, i) => ({ id: `wrong_${i}`, label: s.nameArabic, isCorrect: false })),
      ]);

      setOptions(opts);
      setIsLoading(false);
    });

    return () => { cancelled = true; };
  }, [surahIdNum]);

  const check = () => {
    if (!selected) return;
    setSubmitted(true);
    const isCorrect = options.find(o => o.id === selected)?.isCorrect ?? false;
    setCorrect(isCorrect);
    if (isCorrect) markCompleted(surahIdNum, 1, 200);
  };

  if (isLoading) return (
    <View style={[styles.container, styles.center]}>
      <ActivityIndicator size="large" color={Colors.surahId} />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>تعرف على السورة</Text>
        <Text style={styles.subtitle}>من أي سورة هذه الآية؟</Text>
      </View>

      <CountdownTimer
        durationSeconds={30}
        onTimeUp={() => {
          setSubmitted(true);
          setCorrect(false);
        }}
        stopped={submitted}
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>

      <ScrollView contentContainerStyle={styles.verseBox}>
        <Text style={styles.verseText}>{verseText}</Text>
      </ScrollView>

      <View style={styles.optionsGrid}>
        {options.map(opt => {
          const isSelected = selected === opt.id;
          const showGreen = submitted && opt.isCorrect;
          const showRed = submitted && isSelected && !opt.isCorrect;
          return (
            <Pressable
              key={opt.id}
              style={[styles.option, isSelected && styles.optSelected, showGreen && styles.optCorrect, showRed && styles.optWrong]}
              onPress={() => !submitted && setSelected(opt.id)}
            >
              <Text style={[styles.optText, (showGreen || showRed || isSelected) && styles.optTextLight]}>
                {opt.label}
              </Text>
              {showGreen && <Text style={styles.resultIcon}>✅</Text>}
              {showRed && <Text style={styles.resultIcon}>❌</Text>}
            </Pressable>
          );
        })}
      </View>

            </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
        {submitted ? (
          <View style={styles.resultSection}>
            <Text style={correct ? styles.successText : styles.failText}>
              {correct ? 'صحيح! +٢٠٠ نقطة 🌟' : `الإجابة: ${options.find(o => o.isCorrect)?.label}`}
            </Text>
            <Pressable style={styles.btn} onPress={() => {
              if (isRubScoped) {
                router.replace({
                  pathname: `/challenges/surah-id/${surahIdNum}`,
                  params: { startAyah: rubStartAyah, endAyah: rubEndAyah, t: Date.now() }
                } as any);
              } else {
                router.replace('/challenges/surah-id/random' as any);
              }
            }}>
              <Text style={styles.btnText}>التحدي التالي</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={[styles.btn, !selected && styles.btnDisabled]} onPress={check} disabled={!selected}>
            <Text style={styles.btnText}>تحقق من الإجابة</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgLight, direction: 'rtl' },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { padding: Spacing.lg, backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.surface },
  title: { fontSize: Typography.heading2, fontWeight: 'bold', color: Colors.surahId, textAlign: 'right' },
  subtitle: { fontSize: Typography.body, color: Colors.textSecondary, marginTop: 4, textAlign: 'right' },
  verseBox: { padding: Spacing.xl, alignItems: 'center', justifyContent: 'center', minHeight: 160, backgroundColor: Colors.patternOverlay },
  verseText: { fontFamily: 'ScheherazadeNew', fontSize: Typography.ayahMd, color: Colors.textPrimary, textAlign: 'center', lineHeight: 50 },
  optionsGrid: { flex: 1, padding: Spacing.md, gap: Spacing.md },
  option: { backgroundColor: Colors.bgCard, padding: Spacing.md, borderRadius: BorderRadius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', ...Shadow.card },
  optSelected: { backgroundColor: Colors.primaryLight, borderWidth: 2, borderColor: Colors.primaryDark },
  optCorrect: { backgroundColor: Colors.success },
  optWrong: { backgroundColor: Colors.error },
  optText: { fontFamily: 'ScheherazadeNew', fontSize: Typography.ayahSm, color: Colors.textPrimary, textAlign: 'center' },
  optTextLight: { color: '#fff' },
  resultIcon: { position: 'absolute', right: Spacing.md, fontSize: 20 },
  footer: { padding: Spacing.lg, backgroundColor: Colors.bgCard, borderTopWidth: 1, borderTopColor: Colors.surface },
  resultSection: { alignItems: 'center', gap: Spacing.md },
  successText: { color: Colors.success, fontSize: Typography.heading3, fontWeight: 'bold' },
  failText: { color: Colors.error, fontSize: Typography.body, fontWeight: 'bold', textAlign: 'center' },
  btn: { width: '100%', backgroundColor: Colors.surahId, padding: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center' },
  btnDisabled: { backgroundColor: Colors.textMuted },
  btnText: { color: '#fff', fontSize: Typography.heading3, fontWeight: 'bold' },
});
