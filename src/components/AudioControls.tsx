import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../constants/theme';
import { audioService } from '../services/audioService';
import { useState, useEffect } from 'react';

interface AudioControlsProps {
  surahId: number;
  ayahNumber: number;
  totalAyahs: number;
}

export function AudioControls({ 
  surahId, 
  ayahNumber, 
  totalAyahs 
}: AudioControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Stop playback when ayah changes
  useEffect(() => {
    return () => {
      audioService.stopPlayback();
    };
  }, [surahId, ayahNumber]);

  const togglePlayback = async () => {
    if (isPlaying) {
      await audioService.stopPlayback();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      await audioService.playWarshAudio(surahId, ayahNumber, () => {
        setIsPlaying(false);
      });
    }
  };

  const handlePractice = async () => {
    await audioService.startRecording();
  };

  return (
    <View style={styles.container}>
      {/* Audio Controls Row */}
      <View style={styles.controlsRow}>
        {/* Play Warsh Recitation */}
        <Pressable 
          style={[styles.playButton, isPlaying && styles.playButtonActive]}
          onPress={togglePlayback}
        >
          <Text style={styles.icon}>{isPlaying ? '⏸' : '▶️'}</Text>
          <Text style={styles.label}>{isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}</Text>
        </Pressable>

        {/* Practice (Record) */}
        <Pressable 
          style={styles.recordButtonContainer}
          onPress={handlePractice}
        >
          <View style={styles.recordButton}>
            <Text style={styles.icon}>🎙️</Text>
          </View>
          <Text style={styles.label}>تدريب</Text>
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
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  playButton: {
    alignItems: 'center',
    padding: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    minWidth: 100,
  },
  playButtonActive: {
    backgroundColor: Colors.primaryLight,
  },
  recordButtonContainer: {
    alignItems: 'center',
    minWidth: 100,
  },
  recordButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    ...Shadow.card,
  },
  icon: {
    fontSize: 24,
  },
  label: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
});
