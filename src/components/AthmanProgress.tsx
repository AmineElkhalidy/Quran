import { View, StyleSheet, Text } from 'react-native';
import { Colors, BorderRadius, Spacing } from '../constants/theme';

interface AthmanProgressProps {
  completedThumns: number[]; // Array of completed thumn numbers (1-8)
  currentThumn?: number; // Highlighted/active thumn
}

export function AthmanProgress({ completedThumns, currentThumn }: AthmanProgressProps) {
  // Generate 8 segments
  const segments = Array.from({ length: 8 }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>الأثمان</Text>
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
