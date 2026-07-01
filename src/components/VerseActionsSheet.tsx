import { View, Text, StyleSheet, Pressable, Modal, Animated } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../constants/theme';
import { audioService } from '../services/audioService';
import { useState, useRef, useEffect, useCallback } from 'react';
import { ApiVerse } from '../services/quranApiService';
import { useRouter } from 'expo-router';

interface VerseActionsSheetProps {
  visible: boolean;
  verse: ApiVerse | null;
  surahNameArabic: string;
  onClose: () => void;
  onShowTafsir: (verse: ApiVerse) => void;
}

export function VerseActionsSheet({
  visible,
  verse,
  surahNameArabic,
  onClose,
  onShowTafsir,
}: VerseActionsSheetProps) {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const [isPlaying, setIsPlaying] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = useCallback(() => {
    audioService.stopPlayback();
    setIsPlaying(false);
    onClose();
  }, [onClose]);

  const handleListen = useCallback(async () => {
    if (!verse) return;
    if (isPlaying) {
      await audioService.stopPlayback();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      await audioService.playWarshAudio(verse.surahId, verse.ayahNumber, () => {
        setIsPlaying(false);
      });
    }
  }, [verse, isPlaying]);

  const handleTafsir = useCallback(() => {
    if (!verse) return;
    handleClose();
    // Small delay to let the sheet close before navigating
    setTimeout(() => onShowTafsir(verse), 300);
  }, [verse, handleClose, onShowTafsir]);

  const handleOrderVerse = useCallback(() => {
    if (!verse) return;
    handleClose();
    setTimeout(() => {
      router.push(`/challenges/verse-ordering/${verse.surahId}?startVerse=${verse.ayahNumber}` as any);
    }, 300);
  }, [verse, handleClose, router]);

  if (!verse) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Animated.View
          style={[styles.backdropFill, { opacity: backdropAnim }]}
        />
      </Pressable>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Drag handle */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {/* Verse preview */}
        <View style={styles.versePreview}>
          <Text style={styles.versePreviewLabel}>
            {surahNameArabic} — الآية {verse.ayahNumber}
          </Text>
          <Text style={styles.versePreviewText} numberOfLines={2}>
            {verse.text}
          </Text>
        </View>

        {/* Separator */}
        <View style={styles.separator} />

        {/* Actions */}
        <View style={styles.actionsContainer}>
          {/* Listen */}
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
            ]}
            onPress={handleListen}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#E8F8F5' }]}>
              <Text style={styles.actionIconText}>
                {isPlaying ? '⏸' : '🎧'}
              </Text>
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>
                {isPlaying ? 'إيقاف التشغيل' : 'استمع للآية'}
              </Text>
              <Text style={styles.actionSubtitle}>
                تلاوة برواية ورش
              </Text>
            </View>
          </Pressable>

          {/* Tafsir */}
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
            ]}
            onPress={handleTafsir}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}>
              <Text style={styles.actionIconText}>📖</Text>
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>تفسير الآية</Text>
              <Text style={styles.actionSubtitle}>
                التفسير الميسر
              </Text>
            </View>
          </Pressable>

          {/* Order Verses Challenge */}
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
            ]}
            onPress={handleOrderVerse}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
              <Text style={styles.actionIconText}>🧩</Text>
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>ترتيب الآيات</Text>
              <Text style={styles.actionSubtitle}>
                اختبر حفظك للآيات
              </Text>
            </View>
          </Pressable>

          {/* Bookmark */}
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
            ]}
            onPress={handleClose}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#F3E5F5' }]}>
              <Text style={styles.actionIconText}>🔖</Text>
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>حفظ علامة</Text>
              <Text style={styles.actionSubtitle}>
                ارجع لهذه الآية لاحقاً
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Close button */}
        <Pressable style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeButtonText}>إغلاق</Text>
        </Pressable>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingBottom: Spacing.xl,
    ...Shadow.card,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.textMuted,
    opacity: 0.4,
  },
  versePreview: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.patternOverlay,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  versePreviewLabel: {
    fontSize: Typography.caption,
    color: Colors.primary,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  versePreviewText: {
    fontFamily: Typography.quranFont,
    fontSize: Typography.ayahSm,
    color: Colors.textPrimary,
    lineHeight: 36,
    textAlign: 'right',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
  },
  actionsContainer: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.bgCard,
  },
  actionButtonPressed: {
    backgroundColor: Colors.surface,
    transform: [{ scale: 0.98 }],
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.md,
  },
  actionIconText: {
    fontSize: 24,
  },
  actionTextContainer: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  actionTitle: {
    fontSize: Typography.heading3,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  actionSubtitle: {
    fontSize: Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: 'right',
  },
  closeButton: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: Typography.body,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
});
