import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../src/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsive } from '../../src/utils/responsive';

const CATEGORIES = [
  {
    label: 'تحديات النص',
    challenges: [
      {
        id: 'verse-ordering',
        route: '/challenges/verse-ordering/random',
        title: 'ترتيب الآيات',
        desc: 'رتب آيات الثمن في مكانها الصحيح',
        icon: '📋',
        color: Colors.verseOrder,
        difficulty: 'متوسط',
        xp: 100,
      },
      {
        id: 'fill-blank',
        route: '/challenges/fill-blank/random',
        title: 'أكمل الفراغ',
        desc: 'ابحث عن الكلمة المفقودة في الآية',
        icon: '🔤',
        color: Colors.fillBlank,
        difficulty: 'سهل',
        xp: 50,
      },
      {
        id: 'verse-complete',
        route: '/challenges/verse-complete/random',
        title: 'إكمال الآية',
        desc: 'اختر النصف الثاني الصحيح للآية',
        icon: '✍️',
        color: Colors.verseComplete,
        difficulty: 'متوسط',
        xp: 75,
      },
    ],
  },
  {
    label: 'تحديات الاستماع والتعرف',
    challenges: [
      {
        id: 'listening',
        route: '/challenges/listening/random',
        title: 'اختبار الاستماع',
        desc: 'استمع إلى المقطع وتعرف على الآية',
        icon: '🎧',
        color: Colors.listening,
        difficulty: 'صعب',
        xp: 150,
      },
      {
        id: 'surah-id',
        route: '/challenges/surah-id/random',
        title: 'تعرف على السورة',
        desc: 'من أي سورة هذه الآية؟ اختر الإجابة',
        icon: '🧠',
        color: Colors.surahId,
        difficulty: 'متوسط',
        xp: 80,
      },
    ],
  },
  {
    label: 'اختبارات المعلومات',
    challenges: [
      {
        id: 'surah-quiz',
        route: '/challenges/surah-quiz/random',
        title: 'معلومات السور',
        desc: 'أسئلة عن آيات السور، الجزء، والنزول',
        icon: '📖',
        color: Colors.surahQuiz,
        difficulty: 'سهل',
        xp: 60,
      },
      {
        id: 'true-false',
        route: '/challenges/true-false/random',
        title: 'صح أم خطأ',
        desc: 'حقائق قرآنية — هل هي صحيحة أم خاطئة؟',
        icon: '⚖️',
        color: Colors.trueFalse,
        difficulty: 'سهل',
        xp: 50,
      },
      {
        id: 'warsh-quiz',
        route: '/challenges/warsh-quiz/random',
        title: 'أحكام رواية ورش',
        desc: 'اختبر معرفتك بأحكام التجويد لرواية ورش',
        icon: '🎓',
        color: Colors.warshQuiz,
        difficulty: 'خبير',
        xp: 200,
      },
    ],
  },
  {
    label: 'الفهم والتجويد',
    challenges: [
      {
        id: 'word-meaning',
        route: '/challenges/word-meaning/random',
        title: 'معاني الكلمات',
        desc: 'اختر المعنى الصحيح للكلمة القرآنية',
        icon: '📖',
        color: Colors.wordMeaning,
        difficulty: 'متوسط',
        xp: 60,
      },
      {
        id: 'tajweed',
        route: '/challenges/tajweed/random',
        title: 'أحكام التجويد',
        desc: 'تعرف على الحكم التجويدي المطبق',
        icon: '🗣️',
        color: Colors.tajweed,
        difficulty: 'صعب',
        xp: 75,
      },
      {
        id: 'similar-verses',
        route: '/challenges/similar-verses/random',
        title: 'المتشابهات',
        desc: 'ميز بين الآيات المتشابهة في السور',
        icon: '🔍',
        color: Colors.similarVerses,
        difficulty: 'خبير',
        xp: 80,
      },
      {
        id: 'surah-order',
        route: '/challenges/surah-order/random',
        title: 'ترتيب السور',
        desc: 'اختبر حفظك لترتيب سور المصحف',
        icon: '🔢',
        color: Colors.surahOrder,
        difficulty: 'متوسط',
        xp: 50,
      },
      {
        id: 'guess-juz',
        route: '/challenges/guess-juz/random',
        title: 'في أي جزء؟',
        desc: 'حدد الجزء الذي تبدأ فيه السورة',
        icon: '🧩',
        color: Colors.guessJuz,
        difficulty: 'سهل',
        xp: 50,
      },
    ],
  },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  'سهل': '#38A169',
  'متوسط': '#D69E2E',
  'صعب': '#E53E3E',
  'خبير': '#805AD5',
};

export default function ChallengesHubScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { maxWidth } = useResponsive();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ 
        paddingTop: insets.top, 
        paddingBottom: insets.bottom + Spacing.xl,
        maxWidth,
        width: '100%',
        alignSelf: 'center'
      }}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>التحديات</Text>
        <Text style={styles.headerSub}>اختبر حفظك واكسب نقاط الخبرة!</Text>
      </View>

      {CATEGORIES.map(cat => (
        <View key={cat.label} style={styles.category}>
          <Text style={styles.categoryLabel}>{cat.label}</Text>
          {cat.challenges.map(challenge => (
            <Pressable
              key={challenge.id}
              style={({ pressed }) => [
                styles.card,
                { borderLeftColor: challenge.color, opacity: pressed ? 0.85 : 1 },
              ]}
              onPress={() => router.push(challenge.route as any)}
            >
              <View style={[styles.iconWrap, { backgroundColor: challenge.color + '20' }]}>
                <Text style={styles.icon}>{challenge.icon}</Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{challenge.title}</Text>
                <Text style={styles.cardDesc}>{challenge.desc}</Text>
                <View style={styles.metaRow}>
                  <Text style={[styles.diffBadge, { backgroundColor: DIFFICULTY_COLORS[challenge.difficulty] + '22', color: DIFFICULTY_COLORS[challenge.difficulty] }]}>
                    {challenge.difficulty}
                  </Text>
                  <Text style={styles.xpText}>+{challenge.xp} نقطة</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgLight },
  header: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
  },
  headerTitle: { color: Colors.gold, fontSize: Typography.heading1, fontWeight: 'bold' },
  headerSub: { color: Colors.textLight, fontSize: Typography.body, marginTop: 4 },
  category: { paddingHorizontal: Spacing.md, marginBottom: Spacing.lg },
  categoryLabel: {
    fontSize: Typography.caption,
    fontWeight: 'bold',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    paddingHorizontal: 4,
    textAlign: 'right',
  },
  card: {
    backgroundColor: Colors.bgCard,
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 5,
    marginBottom: Spacing.sm,
    ...Shadow.card,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  icon: { fontSize: 26 },
  cardBody: { flex: 1, justifyContent: 'center' },
  cardTitle: { fontSize: Typography.heading3, fontWeight: '700', color: Colors.textPrimary },
  cardDesc: { fontSize: Typography.caption, color: Colors.textMuted, marginTop: 3, lineHeight: 18 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.sm },
  diffBadge: {
    fontSize: Typography.badge,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  xpText: { fontSize: Typography.caption, fontWeight: 'bold', color: Colors.goldDark },
});

