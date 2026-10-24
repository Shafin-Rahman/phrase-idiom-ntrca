import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  AmberAccent,
  AmberGold,
  SuccessGreen,
  useAppTheme,
} from '../theme';
import { PhraseItem, PhraseUserData, displayBadge } from '../types';
import { AudioRepeatBar } from './AudioRepeatBar';
import { BadgeChip, Card, withAlpha } from './ui';

interface PhraseCardProps {
  phraseItem: PhraseItem;
  userData?: PhraseUserData;
  isPlaying: boolean;
  isPaused: boolean;
  currentCycle: number;
  targetCycles: number;
  currentFieldTitle: string;
  onPlayAll: (count: number) => void;
  onPlayEnglish: (count: number) => void;
  onPlayPronounce: () => void;
  onPauseAudio: () => void;
  onResumeAudio: () => void;
  onStopAudio: () => void;
  onUpdateRepeatCount: (count: number) => void;
  onToggleBookmark: () => void;
  onToggleMastered: () => void;
  bengaliWarning?: string | null;
}

export function PhraseCard({
  phraseItem,
  userData,
  isPlaying,
  isPaused,
  currentCycle,
  targetCycles,
  currentFieldTitle,
  onPlayAll,
  onPlayEnglish,
  onPlayPronounce,
  onPauseAudio,
  onResumeAudio,
  onStopAudio,
  onUpdateRepeatCount,
  onToggleBookmark,
  onToggleMastered,
  bengaliWarning,
}: PhraseCardProps) {
  const theme = useAppTheme();
  const [expanded, setExpanded] = useState(false);
  const isBookmarked = userData?.isBookmarked === true;
  const isMastered = userData?.isMastered === true;
  const repeatCount = userData?.customRepeatCount ?? 5;
  const examBadge = phraseItem.examHistory[0]
    ? displayBadge(phraseItem.examHistory[0])
    : null;
  const showDetails =
    phraseItem.examHistory.length > 1 || phraseItem.sourceText.length > 0;

  return (
    <Card theme={theme} style={styles.card}>
      <View style={styles.padding}>
        <View style={styles.headerRow}>
          <View style={styles.tags}>
            {phraseItem.category === 'previous_bcs' ? (
              <BadgeChip text="BCS Exam" textColor="#D97706" bgColor="#FEF3C7" />
            ) : phraseItem.category === 'previous_ntrca' ? (
              <BadgeChip text="NTRCA Exam" textColor="#0284C7" bgColor="#E0F2FE" />
            ) : (
              <BadgeChip
                text="A–Z Vocabulary"
                textColor="#475569"
                bgColor="#F1F5F9"
              />
            )}
            <BadgeChip
              text={phraseItem.type.toUpperCase()}
              textColor="#64748B"
              bgColor="#F8FAFC"
            />
            {examBadge ? (
              <BadgeChip text={examBadge} textColor="#7C3AED" bgColor="#EDE9FE" />
            ) : null}
          </View>

          <View style={styles.iconRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Mastered"
              onPress={onToggleMastered}
              hitSlop={4}
              style={styles.smallIcon}
            >
              <MaterialIcons
                name={isMastered ? 'check-circle' : 'check-circle-outline'}
                size={22}
                color={
                  isMastered ? SuccessGreen : withAlpha(theme.onSurfaceVariant, 0.5)
                }
              />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Bookmark"
              onPress={onToggleBookmark}
              hitSlop={4}
              style={styles.smallIcon}
            >
              <MaterialIcons
                name={isBookmarked ? 'bookmark' : 'bookmark-border'}
                size={22}
                color={
                  isBookmarked ? AmberGold : withAlpha(theme.onSurfaceVariant, 0.5)
                }
              />
            </Pressable>
          </View>
        </View>

        <Text style={[styles.phrase, { color: theme.onSurface }]}>
          {phraseItem.phrase}
        </Text>

        <View
          style={[
            styles.meaningBox,
            { backgroundColor: withAlpha(theme.primary, 0.08) },
          ]}
        >
          <Text style={styles.meaningText}>
            <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 12 }}>
              বাংলা অর্থ:{' '}
            </Text>
            <Text
              style={{
                color: theme.onSurface,
                fontWeight: '600',
                fontSize: 14,
              }}
            >
              {phraseItem.fullMeaningBn || 'অর্থ পাওয়া যায়নি'}
            </Text>
          </Text>
        </View>

        {phraseItem.meaningEn.length > 0 ? (
          <Text style={styles.englishRow}>
            <Text
              style={{
                color: theme.secondary,
                fontWeight: '700',
                fontSize: 12,
              }}
            >
              English:{' '}
            </Text>
            <Text
              style={{
                color: theme.onSurfaceVariant,
                fontSize: 13,
              }}
            >
              {phraseItem.fullMeaningEn}
            </Text>
          </Text>
        ) : null}

        <View
          style={[
            styles.mnemonicBox,
            {
              backgroundColor: withAlpha(theme.surfaceVariant, 0.45),
              borderColor: withAlpha(theme.outline, 0.15),
            },
          ]}
        >
          <View style={styles.mnemonicHeader}>
            <MaterialIcons name="lightbulb" size={16} color={AmberAccent} />
            <Text style={styles.mnemonicTitle}>Mnemonic / Memory Link</Text>
          </View>
          <Text style={[styles.mnemonicText, { color: theme.onSurface }]}>
            {phraseItem.mnemonic}
          </Text>
          {phraseItem.memorizationTip.trim() ? (
            <Text
              style={[styles.tipText, { color: theme.onSurfaceVariant }]}
            >
              {phraseItem.memorizationTip}
            </Text>
          ) : null}
        </View>

        {phraseItem.example.length > 0 ? (
          <Text style={[styles.example, { color: theme.onSurfaceVariant }]}>
            Example: {phraseItem.example.join(' ')}
          </Text>
        ) : null}

        <View style={{ marginTop: 12 }}>
          <AudioRepeatBar
            phraseText={phraseItem.phrase}
            currentRepeatCount={repeatCount}
            isPlayingThis={isPlaying}
            isPaused={isPaused}
            currentCycle={currentCycle}
            targetCycles={targetCycles}
            currentFieldTitle={currentFieldTitle}
            onPlayAll={onPlayAll}
            onPlayEnglish={onPlayEnglish}
            onPlayPronounce={onPlayPronounce}
            onPause={onPauseAudio}
            onResume={onResumeAudio}
            onStop={onStopAudio}
            onUpdateCount={onUpdateRepeatCount}
            bengaliWarning={bengaliWarning}
          />
        </View>

        {showDetails ? (
          <>
            <Pressable
              onPress={() => setExpanded(value => !value)}
              style={styles.detailsButton}
            >
              <Text style={[styles.detailsText, { color: theme.primary }]}>
                {expanded
                  ? 'Hide Details ▲'
                  : `View Exam Records (${phraseItem.examHistory.length}) ▼`}
              </Text>
            </Pressable>

            {expanded ? (
              <View
                style={[
                  styles.detailsBox,
                  { backgroundColor: withAlpha(theme.surfaceVariant, 0.3) },
                ]}
              >
                <Text style={[styles.detailsTitle, { color: theme.primary }]}>
                  Full Exam Appearances & Source Notes:
                </Text>
                {phraseItem.examHistory.map((exam, index) => (
                  <Text
                    key={`${phraseItem.id}-exam-${index}`}
                    style={[styles.detailsLine, { color: theme.onSurfaceVariant }]}
                  >
                    • {displayBadge(exam)} (Source Page: {exam.sourcePage ?? '-'})
                  </Text>
                ))}
                {phraseItem.sourceParts.length > 0 ? (
                  <Text style={[styles.detailsLine, { color: theme.onSurfaceVariant }]}>
                    • Extracted Part: Part {phraseItem.sourceParts.join(', ')}
                  </Text>
                ) : null}
              </View>
            ) : null}
          </>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
  },
  padding: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phrase: {
    fontSize: 21,
    fontWeight: '700',
    marginTop: 10,
  },
  meaningBox: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 6,
  },
  meaningText: {
    flexShrink: 1,
  },
  englishRow: {
    marginTop: 6,
    flexWrap: 'wrap',
  },
  mnemonicBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  mnemonicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mnemonicTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: AmberAccent,
  },
  mnemonicText: {
    fontSize: 12,
    marginTop: 4,
  },
  tipText: {
    fontSize: 11,
    marginTop: 6,
  },
  example: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
  },
  detailsButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  detailsText: {
    fontSize: 11,
  },
  detailsBox: {
    borderRadius: 8,
    padding: 8,
  },
  detailsTitle: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  detailsLine: {
    fontSize: 11,
    marginTop: 2,
  },
});
