import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Colors } from '../src/constants/theme';
import { initDatabase } from '../src/services/databaseService';
import {
  ScheherazadeNew_400Regular,
  ScheherazadeNew_700Bold,
} from '@expo-google-fonts/scheherazade-new';
import { Amiri_400Regular } from '@expo-google-fonts/amiri';
import { I18nManager } from 'react-native';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isDbReady, setIsDbReady] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    ScheherazadeNew: ScheherazadeNew_400Regular,
    ScheherazadeNewBold: ScheherazadeNew_700Bold,
    Amiri: Amiri_400Regular,
  });

  useEffect(() => {
    async function prepare() {
      try {
        await initDatabase();
        setIsDbReady(true);
      } catch (e) {
        console.warn('DB Init Error:', e);
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && isDbReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, isDbReady]);

  if (!fontsLoaded && !fontError) {
    return null; // Keep splash screen visible
  }

  if (!isDbReady) {
    return null; // Keep splash screen visible until DB is ready
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.textLight,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="reader/[surahId]" options={{ title: 'القارئ' }} />
      <Stack.Screen name="summary/[id]" options={{ title: 'ملخص السورة' }} />
      <Stack.Screen name="challenges/warsh-quiz/[id]" options={{ title: 'اختبار أحكام ورش' }} />
      <Stack.Screen name="challenges/fill-blank/[id]" options={{ title: 'أكمل الفراغ' }} />
      <Stack.Screen name="challenges/listening/[id]" options={{ title: 'اختبار الاستماع' }} />
      <Stack.Screen name="challenges/verse-ordering/[id]" options={{ title: 'ترتيب الآيات' }} />
      <Stack.Screen name="tafsir/[surahId]/[ayahNumber]" options={{ title: 'التفسير' }} />
    </Stack>
  );
}
