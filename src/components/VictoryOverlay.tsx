import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutUp } from 'react-native-reanimated';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';

interface VictoryOverlayProps {
  xpEarned: number;
  message?: string;
}

export default function VictoryOverlay({ xpEarned, message = 'أحسنت!' }: VictoryOverlayProps) {
  return (
    <Animated.View 
      entering={FadeIn.duration(300)} 
      exiting={FadeOut.duration(300)} 
      style={styles.overlay}
      pointerEvents="none"
    >
      <ConfettiCannon 
        count={50} 
        origin={{ x: -10, y: 0 }} 
        autoStart={true} 
        fadeOut={true} 
        colors={[Colors.gold, Colors.primary, Colors.success, '#FF69B4']}
      />
      
      <Animated.View 
        entering={SlideInDown.springify().damping(12)} 
        exiting={SlideOutUp.duration(200)}
        style={styles.banner}
      >
        <Text style={styles.messageText}>{message}</Text>
        <Text style={styles.xpText}>+{xpEarned} XP</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  banner: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: Colors.goldLight,
  },
  messageText: {
    fontSize: Typography.heading2,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  xpText: {
    fontSize: Typography.heading2,
    fontWeight: '900',
    color: Colors.goldDark,
  },
});
