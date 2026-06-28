import { View, FlatList, StyleSheet, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Colors, Spacing } from '../../src/constants/theme';
import { SURAH_LIST } from '../../src/constants/surahList';
import { SurahCard } from '../../src/components/SurahCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ReaderScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const insets = useSafeAreaInsets();

  const filteredSurahs = SURAH_LIST.filter(surah => 
    surah.nameArabic.includes(searchQuery) || 
    surah.nameEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
    surah.nameTransliteration.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.searchContainer}>
        <TextInput 
          style={styles.searchInput}
          placeholder="Search Surah..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.textMuted}
        />
      </View>

      <FlatList
        data={filteredSurahs}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable 
            onPress={() => router.push(`/reader/${item.id}`)}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            <SurahCard surah={item} progressPercentage={0} />
          </Pressable>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
  },
  searchContainer: {
    padding: Spacing.md,
    backgroundColor: Colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface,
  },
  searchInput: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    color: Colors.textPrimary,
    textAlign: 'right', // Support Arabic input natively
  },
  listContent: {
    padding: Spacing.md,
  },
});
