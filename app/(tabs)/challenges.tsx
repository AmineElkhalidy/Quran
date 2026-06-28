import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../src/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CHALLENGES = [
  {
    id: 'verse-ordering',
    title: 'ترتيب الآيات',
    desc: 'اسحب وأفلت الآيات في التسلسل الصحيح',
    icon: '📋',
    color: Colors.verseOrder,
    difficulty: 'متوسط',
    xp: 100,
  },
  {
    id: 'fill-blank',
    title: 'أكمل الفراغ',
    desc: 'ابحث عن الكلمة المفقودة في الآية',
    icon: '🔤',
    color: Colors.fillBlank,
    difficulty: 'سهل',
    xp: 50,
  },
  {
    id: 'listening',
    title: 'اختبار الاستماع',
    desc: 'استمع إلى المقطع وتعرف على الآية',
    icon: '🎧',
    color: Colors.listening,
    difficulty: 'صعب',
    xp: 150,
  },
  {
    id: 'warsh-quiz',
    title: 'اختبار أحكام ورش',
    desc: 'اختبر معرفتك بأحكام التجويد الخاصة برواية ورش',
    icon: '🎓',
    color: Colors.warshQuiz,
    difficulty: 'خبير',
    xp: 200,
  },
];

export default function ChallengesHubScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>التحديات اليومية</Text>
        <Text style={styles.headerSub}>اختبر حفظك واكسب نقاط الخبرة!</Text>
      </View>

      <View style={styles.list}>
        {CHALLENGES.map((challenge) => (
          <Pressable
            key={challenge.id}
            style={({ pressed }) => [
              styles.card,
              { borderLeftColor: challenge.color, opacity: pressed ? 0.8 : 1 }
            ]}
            onPress={() => router.push(`/challenges/${challenge.id}/random` as any)}
          >
            <View style={[styles.iconContainer, { backgroundColor: challenge.color + '1A' }]}>
              <Text style={styles.icon}>{challenge.icon}</Text>
            </View>
            <View style={styles.content}>
              <Text style={styles.title}>{challenge.title}</Text>
              <Text style={styles.desc}>{challenge.desc}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.difficulty}>{challenge.difficulty}</Text>
                <Text style={styles.xp}>+{challenge.xp} نقطة</Text>
              </View>
            </View>
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
  header: {
    padding: Spacing.lg,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
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
  list: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.bgCard,
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 6,
    ...Shadow.card,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  icon: {
    fontSize: 28,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: Typography.heading3,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  desc: {
    fontSize: Typography.caption,
    color: Colors.textMuted,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  difficulty: {
    fontSize: Typography.caption,
    fontWeight: '500',
    color: Colors.textSecondary,
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  xp: {
    fontSize: Typography.caption,
    fontWeight: 'bold',
    color: Colors.goldDark,
  },
});
