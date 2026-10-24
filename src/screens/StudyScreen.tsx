import { MaterialIcons } from '@expo/vector-icons';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useApp } from '../AppContext';
import { PhraseCard } from '../components/PhraseCard';
import { AlphaChip, Chip, withAlpha } from '../components/ui';
import { useAppTheme } from '../theme';
import { PhraseItem } from '../types';

const LETTERS: (string | null)[] = [
  null,
  ...Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index)),
];

export function StudyScreen() {
  const {
    filteredPhrases,
    userDataMap,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedLetter,
    setSelectedLetter,
    selectedPart,
    setSelectedPart,
    quickFilter,
    setQuickFilter,
    clearFilters,
    toggleBookmark,
    toggleMastered,
    playAllForPhrase,
    playEnglishForPhrase,
    playPronouncePhrase,
    updatePhraseRepeatPreference,
    tts,
    ttsState,
  } = useApp();
  const theme = useAppTheme();

  const hasActiveFilter =
    selectedPart !== null ||
    selectedLetter !== null ||
    selectedCategory !== 'all' ||
    searchQuery.trim().length > 0 ||
    quickFilter !== 'all';

  const renderItem = ({ item }: { item: PhraseItem }) => {
    const isThisPlaying =
      ttsState.isPlaying &&
      (ttsState.activeItemId === item.id ||
        ttsState.activePhraseTitle.toLowerCase() === item.phrase.toLowerCase());
    const userData = userDataMap[item.id];

    return (
      <PhraseCard
        phraseItem={item}
        userData={userData}
        isPlaying={isThisPlaying}
        isPaused={ttsState.isPaused}
        currentCycle={isThisPlaying ? ttsState.currentCycle : 0}
        targetCycles={
          isThisPlaying ? ttsState.totalCycles : (userData?.customRepeatCount ?? 5)
        }
        currentFieldTitle={isThisPlaying ? ttsState.currentFieldTitle : ''}
        onPlayAll={count => playAllForPhrase(item, count)}
        onPlayEnglish={count => playEnglishForPhrase(item, count)}
        onPlayPronounce={() => playPronouncePhrase(item.phrase, item.id, 1)}
        onPauseAudio={() => tts.pause()}
        onResumeAudio={() => tts.resume()}
        onStopAudio={() => tts.stop()}
        onUpdateRepeatCount={newCount =>
          updatePhraseRepeatPreference(item.id, newCount)
        }
        onToggleBookmark={() => toggleBookmark(item.id)}
        onToggleMastered={() => toggleMastered(item.id)}
        bengaliWarning={isThisPlaying ? ttsState.bengaliVoiceWarning : null}
      />
    );
  };

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.searchBox,
          {
            backgroundColor: theme.surface,
            borderColor: withAlpha(theme.outline, 0.5),
          },
        ]}
      >
        <MaterialIcons name="search" size={20} color={theme.onSurfaceVariant} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search phrase, Bengali or English meaning..."
          placeholderTextColor={withAlpha(theme.onSurfaceVariant, 0.75)}
          style={[styles.searchInput, { color: theme.onSurface }]}
          autoCorrect={false}
          returnKeyType="search"
        />
        {searchQuery.trim().length > 0 ? (
          <Pressable
            accessibilityLabel="Clear search"
            onPress={() => setSearchQuery('')}
            hitSlop={6}
          >
            <MaterialIcons name="clear" size={20} color={theme.onSurfaceVariant} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.chipRow}
      >
        <Chip
          label="All (421)"
          selected={selectedCategory === 'all'}
          onPress={() => setSelectedCategory('all')}
          theme={theme}
        />
        <Chip
          label="BCS (17)"
          selected={selectedCategory === 'previous_bcs'}
          onPress={() => setSelectedCategory('previous_bcs')}
          theme={theme}
        />
        <Chip
          label="NTRCA (106)"
          selected={selectedCategory === 'previous_ntrca'}
          onPress={() => setSelectedCategory('previous_ntrca')}
          theme={theme}
        />
        <Chip
          label="A–Z (298)"
          selected={selectedCategory === 'alphabetical_a_z'}
          onPress={() => setSelectedCategory('alphabetical_a_z')}
          theme={theme}
        />
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.alphaRow}
      >
        {LETTERS.map(letter => (
          <AlphaChip
            key={letter ?? 'ALL'}
            label={letter ?? 'ALL A-Z'}
            selected={selectedLetter === letter}
            onPress={() => setSelectedLetter(letter)}
            theme={theme}
          />
        ))}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.quickRow}
      >
        <Pressable
          onPress={() => {
            const current = selectedPart;
            setSelectedPart(current == null ? 1 : current < 21 ? current + 1 : null);
          }}
          style={{
            backgroundColor:
              selectedPart != null ? theme.secondary : theme.surfaceVariant,
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 6,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <MaterialIcons
            name="filter-list"
            size={14}
            color={selectedPart != null ? '#FFFFFF' : theme.onSurfaceVariant}
          />
          <Text
            style={{
              fontSize: 11,
              fontWeight: '600',
              color: selectedPart != null ? '#FFFFFF' : theme.onSurfaceVariant,
            }}
          >
            {selectedPart != null ? `Part ${selectedPart} / 21 ✕` : 'Filter by Part (1–21)'}
          </Text>
        </Pressable>

        <Chip
          label="All Items"
          selected={quickFilter === 'all'}
          onPress={() => setQuickFilter('all')}
          theme={theme}
          variant="quick"
          style={{ paddingHorizontal: 10, paddingVertical: 5 }}
        />
        <Chip
          label="Bookmarks ★"
          selected={quickFilter === 'bookmarked'}
          onPress={() => setQuickFilter('bookmarked')}
          theme={theme}
          variant="quick"
          style={{ paddingHorizontal: 10, paddingVertical: 5 }}
        />
        <Chip
          label="Mistakes ⚠️"
          selected={quickFilter === 'incorrect'}
          onPress={() => setQuickFilter('incorrect')}
          theme={theme}
          variant="quick"
          style={{ paddingHorizontal: 10, paddingVertical: 5 }}
        />
        <Chip
          label="Mastered ✓"
          selected={quickFilter === 'mastered'}
          onPress={() => setQuickFilter('mastered')}
          theme={theme}
          variant="quick"
          style={{ paddingHorizontal: 10, paddingVertical: 5 }}
        />
      </ScrollView>

      <View style={styles.resultRow}>
        <Text style={[styles.resultText, { color: theme.onSurfaceVariant }]}>
          Showing {filteredPhrases.length} phrases
        </Text>
        {hasActiveFilter ? (
          <Pressable onPress={clearFilters} style={{ paddingVertical: 6 }}>
            <Text style={{ color: theme.primary, fontSize: 11 }}>Clear Filters</Text>
          </Pressable>
        ) : null}
      </View>

      {filteredPhrases.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 36 }}>🔍</Text>
          <Text style={[styles.emptyTitle, { color: theme.onSurface }]}>
            No phrases found matching this filter
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.onSurfaceVariant }]}>
            Try switching the letter, resetting filters, or clearing your search
            query.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredPhrases}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={7}
          removeClippedSubviews
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 4,
  },
  chipRow: {
    gap: 8,
    paddingVertical: 2,
  },
  alphaRow: {
    gap: 6,
    paddingTop: 6,
  },
  quickRow: {
    gap: 8,
    alignItems: 'center',
    paddingTop: 6,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 4,
  },
  resultText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 30,
    paddingTop: 4,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
  },
});
