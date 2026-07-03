import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useResponsive } from '../utils/responsive';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  contentContainerStyle?: ViewStyle | ViewStyle[];
  centerContent?: boolean;
}

export function ResponsiveContainer({ 
  children, 
  style, 
  contentContainerStyle,
  centerContent = true
}: ResponsiveContainerProps) {
  const { maxWidth, isTablet } = useResponsive();

  return (
    <View style={[styles.container, style]}>
      <View 
        style={[
          styles.content, 
          { maxWidth }, 
          isTablet && centerContent && styles.tabletCentered,
          contentContainerStyle
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  content: {
    flex: 1,
    width: '100%',
  },
  tabletCentered: {
    alignSelf: 'center',
    // Optional subtle shadow or border could be added here for the 'sheet' effect on tablets
  }
});
