import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../constants/theme';
import { audioService } from '../services/audioService';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';

interface AudioControlsProps {
  surahId: number;
  startAyah: number;
  endAyah: number;
  totalAyahs: number;
  rubLabel?: string;
}

export function AudioControls({ 
  surahId, 
  startAyah,
  endAyah,
  totalAyahs,
  rubLabel,
}: AudioControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const router = useRouter();

  // Stop playback when thumn changes
  useEffect(() => {
    return () => {
      audioService.stopPlayback();
      setIsPlaying(false);
    };
  }, [surahId, startAyah, endAyah]);

  const togglePlayback = async () => {
    if (isPlaying) {
      await audioService.stopPlayback();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      await audioService.playAyahRange(surahId, startAyah, endAyah, () => {
        setIsPlaying(false);
      });
    }
  };

  const handleOrder = () => {
    router.push(`/challenges/verse-ordering/${surahId}?startVerse=${startAyah}` as any);
  };

  const handleChallenges = () => {
    router.push(`/challenges/rub-picker?surahId=${surahId}&startAyah=${startAyah}&endAyah=${endAyah}&rubLabel=${encodeURIComponent(rubLabel ?? '')}` as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.controlsRow}>
        {/* Play Warsh Recitation */}
        <Pressable 
          style={[styles.actionButton, isPlaying && styles.actionButtonActive]}
          onPress={togglePlayback}
        >
          <Text style={styles.icon}>{isPlaying ? '⏸' : '▶️'}</Text>
          <Text style={[styles.label, isPlaying && styles.labelActive]}>
            {isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
          </Text>
        </Pressable>

        {/* Order Verses Challenge */}
        <Pressable 
          style={styles.actionButton}
          onPress={handleOrder}
        >
          <Text style={styles.icon}>🧩</Text>
          <Text style={styles.label}>ترتيب الآيات</Text>
        </Pressable>

        {/* Rub' Challenges */}
        <Pressable 
          style={[styles.actionButton, styles.challengesActionButton]}
          onPress={handleChallenges}
        >
          <Text style={styles.icon}>📝</Text>
          <Text style={[styles.label, styles.challengesLabel]}>تحديات الربع</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    backgroundColor: Colors.bgCard,
    borderTopWidth: 1,
    borderTopColor: Colors.surface,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    ...Shadow.card,
  },
  actionButtonActive: {
    backgroundColor: Colors.primaryLight,
  },
  icon: {
    fontSize: 24,
    marginBottom: 4,
  },
  label: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  labelActive: {
    color: Colors.textLight,
  },
  challengesActionButton: {
    backgroundColor: Colors.primary,
  },
  challengesLabel: {
    color: Colors.gold,
  },
});
