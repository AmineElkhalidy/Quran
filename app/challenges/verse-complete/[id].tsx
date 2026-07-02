import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../../src/constants/theme';
import { useQuranStore } from '../../../src/store/quranStore';
import { fetchVersesForSurah } from '../../../src/services/quranApiService';
import { getSurahById } from '../../../src/constants/surahList';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Option { id: string; label: string; isCorrect: boolean; }

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Split a verse roughly in half by words
function splitVerse(text: string): [string, string] {
  const words = text.split(' ');
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
}

export default function VerseCompleteChallenge() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const markCompleted = useQuranStore(s => s.markCompleted);

  useEffect(() => {
    if (id === 'random') {
      const r = Math.floor(Math.random() * (114 - 87 + 1)) + 87;
      router.replace(`/challenges/verse-complete/${r}` as any);
    }
  }, [id, router]);

  const surahIdNum = id === 'random' ? 87 : parseInt(Array.isArray(id) ? id[0] : id ?? '87', 10);
  const surah = getSurahById(surahIdNum);

  const [isLoading, setIsLoading] = useState(true);
  const [firstHalf, setFirstHalf] = useState('');
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

    fetchVersesForSurah(surahIdNum).then(verses => {
      if (cancelled || verses.length < 4) { setIsLoading(false); return; }

      // Pick a target verse (with at least 4 words)
      const candidates = verses.filter(v => v.text.split(' ').length >= 4);
      if (candidates.length === 0) { setIsLoading(false); return; }

      const target = candidates[Math.floor(Math.random() * candidates.length)];
      const [half1, half2] = splitVerse(target.text);

      // Distractors: second halves of other verses
      const others = verses.filter(v => v.ayahNumber !== target.ayahNumber && v.text.split(' ').length >= 4);
      const distractors = shuffle(others).slice(0, 3).map(v => splitVerse(v.text)[1]);

      const opts: Option[] = shuffle([
        { id: 'correct', label: half2, isCorrect: true },
        ...distractors.map((d, i) => ({ id: `wrong_${i}`, label: d, isCorrect: false })),
      ]);

      setFirstHalf(half1);
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
    if (isCorrect) markCompleted(surahIdNum, 1, 75);
  };

  if (isLoading) return (
    <View style={[styles.container, styles.center]}>
      <ActivityIndicator size="large" color={Colors.verseComplete} />
    </View>
  );

  if (options.length === 0) return (
    <View style={[styles.container, styles.center]}>
      <Text style={styles.errText}>تعذر تحميل التحدي</Text>
      <Pressable style={styles.btn} onPress={() => router.back()}>
        <Text style={styles.btnText}>العودة</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>إكمال الآية</Text>
        <Text style={styles.subtitle}>اختر الجزء الثاني الصحيح لإكمال الآية من {surah?.nameArabic ?? 'القرآن الكريم'}</Text>
      </View>

      {/* First half display */}
      <View style={styles.firstHalfBox}>
        <Text style={styles.labelText}>بداية الآية:</Text>
        <Text style={styles.firstHalfText}>{firstHalf} …</Text>
      </View>

      {/* Options */}
      <ScrollView contentContainerStyle={styles.optionsContainer}>
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
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
        {submitted ? (
          <View style={styles.resultSection}>
            <Text style={correct ? styles.successText : styles.failText}>
              {correct ? 'صحيح! +٧٥ نقطة 🌟' : 'خطأ، هذه الإجابة الصحيحة باللون الأخضر'}
            </Text>
            <Pressable style={styles.btn} onPress={() => router.replace('/challenges/verse-complete/random' as any)}>
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
  container: { flex: 1, backgroundColor: Colors.bgLight },
  center: { justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  errText: { fontSize: Typography.body, color: Colors.textMuted, marginBottom: Spacing.md, textAlign: 'center' },
  header: { padding: Spacing.lg, backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.surface },
  title: { fontSize: Typography.heading2, fontWeight: 'bold', color: Colors.verseComplete, textAlign: 'right' },
  subtitle: { fontSize: Typography.body, color: Colors.textSecondary, marginTop: 4, textAlign: 'right', lineHeight: 22 },
  firstHalfBox: { padding: Spacing.xl, backgroundColor: Colors.patternOverlay, alignItems: 'center', gap: Spacing.sm },
  labelText: { fontSize: Typography.caption, color: Colors.textMuted, fontWeight: 'bold', textAlign: 'center' },
  firstHalfText: { fontFamily: 'ScheherazadeNew', fontSize: Typography.ayahMd, color: Colors.primaryDark, textAlign: 'center', lineHeight: 46 },
  optionsContainer: { padding: Spacing.md, gap: Spacing.md },
  option: { backgroundColor: Colors.bgCard, padding: Spacing.lg, borderRadius: BorderRadius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', ...Shadow.card },
  optSelected: { backgroundColor: Colors.primaryLight, borderWidth: 2, borderColor: Colors.verseComplete },
  optCorrect: { backgroundColor: Colors.success },
  optWrong: { backgroundColor: Colors.error },
  optText: { fontFamily: 'ScheherazadeNew', fontSize: Typography.body + 2, color: Colors.textPrimary, textAlign: 'center', flex: 1, lineHeight: 32 },
  optTextLight: { color: '#fff' },
  resultIcon: { fontSize: 20, marginLeft: Spacing.sm },
  footer: { padding: Spacing.lg, backgroundColor: Colors.bgCard, borderTopWidth: 1, borderTopColor: Colors.surface },
  resultSection: { alignItems: 'center', gap: Spacing.md },
  successText: { color: Colors.success, fontSize: Typography.heading3, fontWeight: 'bold' },
  failText: { color: Colors.error, fontSize: Typography.body, fontWeight: 'bold', textAlign: 'center' },
  btn: { width: '100%', backgroundColor: Colors.verseComplete, padding: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center' },
  btnDisabled: { backgroundColor: Colors.textMuted },
  btnText: { color: '#fff', fontSize: Typography.heading3, fontWeight: 'bold' },
});
