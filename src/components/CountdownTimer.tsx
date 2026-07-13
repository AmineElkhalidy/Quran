import { View, Text, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';

interface CountdownTimerProps {
  durationSeconds: number;
  onTimeUp: () => void;
  paused?: boolean;
  /** Set to true to stop the timer permanently (e.g. after answer submitted) */
  stopped?: boolean;
}

export default function CountdownTimer({ durationSeconds, onTimeUp, paused = false, stopped = false }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(durationSeconds);
  const widthAnim = useRef(new Animated.Value(1)).current;
  const calledRef = useRef(false);

  useEffect(() => {
    if (paused || stopped || remaining <= 0) return;

    const interval = setInterval(() => {
      setRemaining(prev => {
        const next = prev - 1;
        if (next <= 0 && !calledRef.current) {
          calledRef.current = true;
          setTimeout(() => onTimeUp(), 0);
        }
        return Math.max(0, next);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [paused, stopped, remaining]);

  // Animate the bar width
  useEffect(() => {
    if (stopped) return;
    Animated.timing(widthAnim, {
      toValue: remaining / durationSeconds,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [remaining, stopped]);

  const isUrgent = remaining <= 5;
  const barColor = stopped
    ? Colors.textMuted
    : isUrgent
    ? '#E53E3E'
    : '#805AD5'; // Expert purple

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeText = minutes > 0
    ? `${minutes}:${seconds.toString().padStart(2, '0')}`
    : `${seconds}`;

  return (
    <View style={styles.container}>
      <View style={styles.barTrack}>
        <Animated.View
          style={[
            styles.barFill,
            {
              backgroundColor: barColor,
              width: widthAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      <Text style={[styles.timeText, isUrgent && !stopped && styles.urgentText]}>
        {stopped ? '⏸' : `⏱ ${timeText}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  timeText: {
    fontSize: Typography.caption,
    fontWeight: 'bold',
    color: '#805AD5',
    minWidth: 44,
    textAlign: 'center',
  },
  urgentText: {
    color: '#E53E3E',
  },
});
