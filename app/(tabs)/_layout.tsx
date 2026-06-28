import { Tabs } from 'expo-router';
import { Colors } from '../../src/constants/theme';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.gold,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: { backgroundColor: Colors.bgCard, borderTopColor: Colors.surface },
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.textLight,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'الرئيسية',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="reader"
        options={{
          title: 'القرآن',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>📖</Text>,
        }}
      />
      <Tabs.Screen
        name="challenges"
        options={{
          title: 'التحديات',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>⚔️</Text>,
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: 'المكافآت',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏆</Text>,
        }}
      />
    </Tabs>
  );
}
