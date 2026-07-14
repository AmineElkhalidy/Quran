import { View, StyleSheet, Text } from 'react-native';
import { Colors, BorderRadius, Spacing } from '../constants/theme';

interface AthmanProgressProps {
  completedThumns: number[]; // Array of completed segment numbers (1-based)
  currentThumn?: number; // Highlighted/active segment
  totalSegments?: number; // Number of rub' segments for this surah (varies)
}

export function AthmanProgress({ completedThumns, currentThumn, totalSegments = 8 }: AthmanProgressProps) {
  // Generate segments based on actual rub' count
  const segments = Array.from({ length: totalSegments }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>الأرباع</Text>
      <View style={styles.track}>
        {segments.map((thumn) => {
          const isCompleted = completedThumns.includes(thumn);
          const isActive = currentThumn === thumn;
          
          return (
            <View 
              key={thumn}
              style={[
                styles.segment,
                isCompleted && styles.completed,
                isActive && styles.active,
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
    width: '100%',
  },
  label: {
    textAlign: 'right',
    color: Colors.textMuted,
    fontSize: 12,
    marginBottom: 4,
  },
  track: {
    flexDirection: 'row-reverse', // RTL for Arabic reading flow
    height: 8,
    gap: 2,
  },
  segment: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
  },
  completed: {
    backgroundColor: Colors.gold,
  },
  active: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
  },
});
