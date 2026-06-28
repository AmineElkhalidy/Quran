import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../constants/theme';
import type { Surah } from '../types';

interface SurahCardProps {
  surah: Surah;
  progressPercentage?: number;
}

export function SurahCard({ surah, progressPercentage = 0 }: SurahCardProps) {
  const router = useRouter();

  return (
    <Pressable 
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}
      onPress={() => router.push(`/reader/${surah.id}`)}
    >
      <View style={styles.numberBadge}>
        <Text style={styles.numberText}>{surah.id}</Text>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.englishName}>{surah.nameEnglish}</Text>
        <Text style={styles.metaText}>
          {surah.revelationType} • {surah.verseCount} Ayahs
        </Text>
        
        {/* Progress Bar */}
        <View style={styles.progressTrack}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${progressPercentage}%` }
            ]} 
          />
        </View>
      </View>
      
      <View style={styles.arabicContainer}>
        <Text style={styles.arabicName}>{surah.nameArabic}</Text>
      </View>
      
      <Pressable 
        style={styles.infoBtn}
        onPress={(e) => {
          e.stopPropagation();
          router.push(`/summary/${surah.id}`);
        }}
      >
        <Text style={styles.infoIcon}>ℹ️</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.card,
  },
  numberBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.patternOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.goldLight,
  },
  numberText: {
    color: Colors.goldDark,
    fontFamily: Typography.uiFont,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  englishName: {
    fontFamily: Typography.uiFont,
    fontSize: Typography.heading3,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  metaText: {
    fontFamily: Typography.uiFont,
    fontSize: Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  arabicContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    minWidth: 80,
  },
  arabicName: {
    fontFamily: Typography.quranFontBold,
    fontSize: Typography.heading1,
    color: Colors.primary,
  },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.surface,
    borderRadius: 2,
    marginTop: Spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.gold,
  },
  infoBtn: {
    padding: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  infoIcon: {
    fontSize: 20,
  }
});
