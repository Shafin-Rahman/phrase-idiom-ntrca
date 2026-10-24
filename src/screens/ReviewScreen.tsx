import { MaterialIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useApp } from '../AppContext';
import { PhraseCard } from '../components/PhraseCard';
import { withAlpha } from '../components/ui';
import {
  AmberAccent,
  AmberGold,
  SuccessGreen,
  useAppTheme,
} from '../theme';
import { PhraseItem, PhraseUserData } from '../types';

export function ReviewScreen() {
  const { allPhrases, userDataMap } = useApp();
  const theme = useAppTheme();
  const [selectedSubTab, setSelectedSubTab] = useState(0);

  const incorrectPhrases = useMemo(() => {
    const wrongIds = new Set(
      Object.values(userDataMap)
        .filter(data => data.incorrectCount > 0)
        .map(data => data.phraseId),
    );
    return allPhrases.filter(item => wrongIds.has(item.id));
  }, [allPhrases, userDataMap]);

  const bookmarkedPhrases = useMemo(() => {
    const savedIds = new Set(
      Object.values(userDataMap)
        .filter(data => data.isBookmarked)
        .map(data => data.phraseId),
    );
    return allPhrases.filter(item => savedIds.has(item.id));
  }, [allPhrases, userDataMap]);

  return (
    <View style={styles.root}>
      <View style={[styles.tabRow, { borderBottomColor: withAlpha(theme.outline, 0.3) }]}>
        {[
          'Quick Flashcards',
          `Weak (${incorrectPhrases.length})`,
          `Saved (${bookmarkedPhrases.length})`,
        ].map((label, index) => {
          const selected = selectedSubTab === index;
          return (
            <Pressable
              key={label}
              onPress={() => setSelectedSubTab(index)}
              style={styles.tabButton}
            >
              <Text
                style={[
                  styles.tabLabel,
                  { color: selected ? theme.primary : theme.onSurfaceVariant },
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
              <View
                style={{
                  height: 2.5,
                  width: '100%',
                  borderRadius: 2,
                  marginTop: 8,
                  backgroundColor: selected ? theme.primary : 'transparent',
                }}
              />
            </Pressable>
          );
        })}
      </View>

      <View style={{ flex: 1, marginTop: 12 }}>
        {selectedSubTab === 0 ? (
          <FlashcardReviewMode phrases={allPhrases} />
        ) : selectedSubTab === 1 ? (
          <PhraseItemsList
            phrases={incorrectPhrases}
            emptyTitle="No Weak Phrases Recorded"
            emptySubtitle="When you make an error during an exam, the phrase is added here for dedicated audio repetition."
            userDataMap={userDataMap}
          />
        ) : (
          <PhraseItemsList
            phrases={bookmarkedPhrases}
            emptyTitle="No Bookmarks Saved Yet"
            emptySubtitle="Tap the bookmark icon on any phrase card in the Study tab to save it for quick review."
            userDataMap={userDataMap}
          />
        )}
      </View>
    </View>
  );
}

function FlashcardReviewMode({ phrases }: { phrases: PhraseItem[] }) {
  const {
    userDataMap,
    toggleBookmark,
    playAllForPhrase,
    playEnglishForPhrase,
    tts,
  } = useApp();
  const theme = useAppTheme();
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (phrases.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ color: theme.onSurface }}>Loading phrases...</Text>
      </View>
    );
  }

  const safeIndex = Math.min(phrases.length - 1, Math.max(0, cardIndex));
  const item = phrases[safeIndex];
  const isBookmarked = userDataMap[item.id]?.isBookmarked === true;

  return (
    <View style={styles.flashRoot}>
      <View style={styles.flashHeader}>
        <Text style={[styles.cardIndex, { color: theme.primary }]}>
          Card {safeIndex + 1} of {phrases.length}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable
            onPress={() => toggleBookmark(item.id)}
            hitSlop={4}
            style={styles.iconButton}
          >
            <MaterialIcons
              name="bookmark"
              size={24}
              color={isBookmarked ? AmberGold : theme.outline}
            />
          </Pressable>
          <Pressable
            onPress={() => {
              setCardIndex(Math.floor(Math.random() * phrases.length));
              setIsFlipped(false);
            }}
            hitSlop={4}
            style={styles.iconButton}
          >
            <MaterialIcons name="repeat" size={24} color={theme.secondary} />
          </Pressable>
        </View>
      </View>

      <Pressable
        onPress={() => setIsFlipped(value => !value)}
        style={({ pressed }) => [
          styles.flashCard,
          {
            backgroundColor: isFlipped
              ? withAlpha(theme.surfaceVariant, 0.5)
              : theme.surface,
            opacity: pressed ? 0.95 : 1,
          },
        ]}
      >
        {!isFlipped ? (
          <View style={styles.front}>
            <View
              style={[
                styles.typeBadge,
                { backgroundColor: withAlpha(theme.primary, 0.1) },
              ]}
            >
              <Text style={[styles.typeBadgeText, { color: theme.primary }]}>
                {item.type.toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.frontPhrase, { color: theme.onSurface }]}>
              {item.phrase}
            </Text>
            <Text style={[styles.tapHint, { color: theme.onSurfaceVariant }]}>
              👉 Tap to reveal meaning & mnemonic
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.back}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.backPhrase, { color: theme.primary }]}>
              {item.phrase}
            </Text>

            <View style={[styles.meaningCard, { backgroundColor: theme.surface }]}>
              <Text style={[styles.bnLabel, { color: theme.primary }]}>
                বাংলা অর্থ:
              </Text>
              <Text style={[styles.bnMeaning, { color: theme.onSurface }]}>
                {item.fullMeaningBn}
              </Text>
              {item.meaningEn.length > 0 ? (
                <Text style={[styles.enMeaning, { color: theme.onSurfaceVariant }]}>
                  English: {item.fullMeaningEn}
                </Text>
              ) : null}
            </View>

            <View
              style={[
                styles.mnemonicBox,
                { backgroundColor: withAlpha(AmberGold, 0.1) },
              ]}
            >
              <MaterialIcons name="lightbulb" size={18} color={AmberAccent} />
              <Text style={[styles.mnemonicText, { color: theme.onSurface }]}>
                {item.mnemonic}
              </Text>
            </View>

            <View style={styles.audioRow}>
              <Pressable
                onPress={() => playAllForPhrase(item, 1)}
                style={({ pressed }) => [
                  styles.primaryButton,
                  { backgroundColor: theme.primary, opacity: pressed ? 0.75 : 1 },
                ]}
              >
                <MaterialIcons name="volume-up" size={16} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Play All</Text>
              </Pressable>
              <Pressable
                onPress={() => playEnglishForPhrase(item, 1)}
                style={({ pressed }) => [
                  styles.outlineButton,
                  { borderColor: withAlpha(theme.primary, 0.4), opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text style={{ color: theme.primary, fontSize: 12 }}>English</Text>
              </Pressable>
              <Pressable
                onPress={() => tts.stop()}
                style={({ pressed }) => [
                  styles.outlineButton,
                  { borderColor: withAlpha(theme.outline, 0.4), opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text style={{ color: theme.onSurfaceVariant, fontSize: 12 }}>Stop</Text>
              </Pressable>
            </View>
          </ScrollView>
        )}
      </Pressable>

      <View style={styles.navRow}>
        <Pressable
          disabled={cardIndex <= 0}
          onPress={() => {
            setCardIndex(value => Math.max(0, value - 1));
            setIsFlipped(false);
          }}
          style={({ pressed }) => [
            styles.navButton,
            {
              borderColor: withAlpha(theme.outline, 0.4),
              opacity: cardIndex <= 0 ? 0.4 : pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text style={{ color: theme.primary, fontWeight: '500' }}>← Previous</Text>
        </Pressable>
        <Pressable
          disabled={cardIndex >= phrases.length - 1}
          onPress={() => {
            setCardIndex(value => Math.min(phrases.length - 1, value + 1));
            setIsFlipped(false);
          }}
          style={({ pressed }) => [
            styles.navButton,
            {
              borderWidth: 0,
              backgroundColor: theme.primary,
              opacity: cardIndex >= phrases.length - 1 ? 0.4 : pressed ? 0.75 : 1,
            },
          ]}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '500' }}>Next Card →</Text>
        </Pressable>
      </View>
    </View>
  );
}

function PhraseItemsList({
  phrases,
  emptyTitle,
  emptySubtitle,
  userDataMap,
}: {
  phrases: PhraseItem[];
  emptyTitle: string;
  emptySubtitle: string;
  userDataMap: Record<string, PhraseUserData>;
}) {
  const {
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

  if (phrases.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={{ fontSize: 42, color: SuccessGreen }}>✓</Text>
        <Text style={[styles.emptyTitle, { color: theme.onSurface }]}>
          {emptyTitle}
        </Text>
        <Text style={[styles.emptySubtitle, { color: theme.onSurfaceVariant }]}>
          {emptySubtitle}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={phrases}
      keyExtractor={item => item.id}
      contentContainerStyle={{ paddingBottom: 30 }}
      ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
      ListHeaderComponent={
        <Text style={[styles.listHeader, { color: theme.onSurfaceVariant }]}>
          {phrases.length} phrases ready for revision
        </Text>
      }
      renderItem={({ item }) => {
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
            onUpdateRepeatCount={count => updatePhraseRepeatPreference(item.id, count)}
            onToggleBookmark={() => toggleBookmark(item.id)}
            onToggleMastered={() => toggleMastered(item.id)}
            bengaliWarning={isThisPlaying ? ttsState.bengaliVoiceWarning : null}
          />
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 16,
  },
  tabRow: {
    flexDirection: 'row',
    paddingTop: 8,
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  flashRoot: {
    flex: 1,
    paddingVertical: 8,
  },
  flashHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardIndex: {
    fontSize: 13,
    fontWeight: '700',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashCard: {
    flex: 1,
    marginTop: 12,
    borderRadius: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 4,
  },
  front: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  typeBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  frontPhrase: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 20,
  },
  tapHint: {
    fontSize: 12,
    marginTop: 24,
  },
  back: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  backPhrase: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  meaningCard: {
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
  },
  bnLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  bnMeaning: {
    fontSize: 16,
    fontWeight: '700',
  },
  enMeaning: {
    fontSize: 13,
    marginTop: 6,
  },
  mnemonicBox: {
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mnemonicText: {
    fontSize: 12,
    flex: 1,
  },
  audioRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  outlineButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  navRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingBottom: 16,
  },
  navButton: {
    flex: 1,
    height: 46,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  listHeader: {
    fontSize: 12,
    fontWeight: '600',
    paddingVertical: 8,
  },
});
