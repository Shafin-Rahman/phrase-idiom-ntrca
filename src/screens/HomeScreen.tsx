import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../AppContext';
import { Card, ProgressBar, withAlpha } from '../components/ui';
import {
  AmberAccent,
  AmberGold,
  ErrorRose,
  SkySecondary,
  SuccessGreen,
  useAppTheme,
} from '../theme';

type IconName = keyof typeof MaterialIcons.glyphMap;

export function HomeScreen() {
  const {
    allPhrases,
    userDataMap,
    todayLog,
    setTab,
    setSelectedExamMode,
    setExamCategoryChoice,
    setQuickFilter,
  } = useApp();
  const theme = useAppTheme();

  const masteredCount = Object.values(userDataMap).filter(data => data.isMastered).length;
  const bookmarkedCount = Object.values(userDataMap).filter(
    data => data.isBookmarked,
  ).length;
  const incorrectCount = Object.values(userDataMap).filter(
    data => data.incorrectCount > 0,
  ).length;

  const studiedToday = todayLog?.count ?? 0;
  const targetToday = todayLog?.target ?? 15;
  const targetProgress =
    targetToday > 0 ? Math.min(1, Math.max(0, studiedToday / targetToday)) : 0;

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <LinearGradient
          colors={[theme.primary, theme.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          <View style={styles.heroTitleRow}>
            <Text style={styles.heroTitle}>Phrase & Idiom Master</Text>
            <View style={styles.offlineBadge}>
              <Text style={styles.offlineBadgeText}>100% Offline</Text>
            </View>
          </View>
          <Text style={styles.heroSubtitle}>
            Authentic dataset of 421 BCS & NTRCA phrases with Bengali meanings &
            repetition audio.
          </Text>

          <View style={styles.heroActions}>
            <Pressable
              onPress={() => setTab('STUDY')}
              style={({ pressed }) => [
                styles.heroButton,
                { backgroundColor: '#FFFFFF', opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <MaterialIcons name="school" size={16} color={theme.primary} />
              <Text style={[styles.heroButtonText, { color: theme.primary }]}>
                Study Now
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setSelectedExamMode('CATEGORY_EXAM');
                setExamCategoryChoice('previous_bcs');
                setTab('EXAM');
              }}
              style={({ pressed }) => [
                styles.heroButton,
                {
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <MaterialIcons name="quiz" size={16} color="#FFFFFF" />
              <Text style={[styles.heroButtonText, { color: '#FFFFFF' }]}>
                BCS Quiz
              </Text>
            </Pressable>
          </View>
        </LinearGradient>
      </View>

      <Card theme={theme} style={styles.block}>
        <View style={styles.padding16}>
          <View style={styles.dailyHeader}>
            <View style={styles.dailyInfo}>
              <View
                style={[
                  styles.circleIcon,
                  { backgroundColor: withAlpha(theme.primary, 0.1) },
                ]}
              >
                <MaterialIcons name="star" size={20} color={theme.primary} />
              </View>
              <View style={{ flexShrink: 1 }}>
                <Text style={[styles.dailyTitle, { color: theme.onSurface }]}>
                  Daily Memorization Target
                </Text>
                <Text
                  style={[styles.dailySubtitle, { color: theme.onSurfaceVariant }]}
                >
                  Goal: {targetToday} phrases per day
                </Text>
              </View>
            </View>
            <Text
              style={[
                styles.dailyCount,
                { color: studiedToday >= targetToday ? SuccessGreen : theme.primary },
              ]}
            >
              {studiedToday} / {targetToday}
            </Text>
          </View>

          <View style={{ marginTop: 12 }}>
            <ProgressBar
              progress={targetProgress}
              color={studiedToday >= targetToday ? SuccessGreen : theme.primary}
              trackColor={theme.surfaceVariant}
              height={8}
            />
          </View>
          <Text
            style={[
              styles.dailyFootnote,
              {
                color:
                  studiedToday >= targetToday ? SuccessGreen : theme.onSurfaceVariant,
              },
            ]}
          >
            {studiedToday >= targetToday
              ? '🎉 Daily target achieved! Fantastic job!'
              : `${targetToday - studiedToday} more phrases to reach today's target.`}
          </Text>
        </View>
      </Card>

      <View>
        <Text style={[styles.sectionHeading, { color: theme.onSurface }]}>
          Collection Overview
        </Text>
        <View style={styles.gridRow}>
          <HomeStatCard
            title="Total Items"
            count={`${allPhrases.length}`}
            subtitle="421 phrases & idioms"
            icon="school"
            tint={theme.primary}
          />
          <HomeStatCard
            title="Previous BCS"
            count="17"
            subtitle="High-priority exam items"
            icon="workspace-premium"
            tint={AmberGold}
          />
        </View>
        <View style={[styles.gridRow, { marginTop: 10 }]}>
          <HomeStatCard
            title="Previous NTRCA"
            count="106"
            subtitle="Past registration questions"
            icon="quiz"
            tint={SkySecondary}
          />
          <HomeStatCard
            title="Mastered"
            count={`${masteredCount}`}
            subtitle="Marked complete"
            icon="check-circle"
            tint={SuccessGreen}
          />
        </View>
      </View>

      <View>
        <Text style={[styles.sectionHeading, { color: theme.onSurface }]}>
          Quick Practice
        </Text>
        <View style={styles.gridRow}>
          <ShortcutCard
            title="Weak / Mistakes"
            count={`${incorrectCount} items`}
            icon="error-outline"
            color={ErrorRose}
            onPress={() => {
              setSelectedExamMode('INCORRECT_PRACTICE');
              setTab('EXAM');
            }}
          />
          <ShortcutCard
            title="Saved Bookmarks"
            count={`${bookmarkedCount} saved`}
            icon="bookmark"
            color={AmberAccent}
            onPress={() => {
              setQuickFilter('bookmarked');
              setTab('STUDY');
            }}
          />
        </View>
      </View>

      <Card
        theme={theme}
        elevation={0}
        style={[
          styles.block,
          { backgroundColor: withAlpha(theme.surfaceVariant, 0.5) },
        ]}
      >
        <View style={styles.padding16}>
          <Text style={[styles.setsTitle, { color: theme.onSurface }]}>
            21 Extracted Study Sets Included
          </Text>
          <Text style={[styles.setsBody, { color: theme.onSurfaceVariant }]}>
            Browse by original study parts 1 through 21 or filter alphabetically
            A–Z. Every item includes native TextToSpeech audio with customizable
            repetition.
          </Text>
          <Pressable
            onPress={() => setTab('STUDY')}
            style={({ pressed }) => [
              styles.tonalButton,
              {
                backgroundColor: theme.primaryContainer,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <Text style={[styles.tonalButtonText, { color: theme.onPrimaryContainer }]}>
              Explore All Study Sets
            </Text>
          </Pressable>
        </View>
      </Card>
    </ScrollView>
  );
}

function HomeStatCard({
  title,
  count,
  subtitle,
  icon,
  tint,
}: {
  title: string;
  count: string;
  subtitle: string;
  icon: IconName;
  tint: string;
}) {
  const theme = useAppTheme();
  return (
    <Card theme={theme} elevation={1} style={{ flex: 1, borderRadius: 14 }}>
      <View style={{ padding: 14 }}>
        <View style={styles.statHeader}>
          <Text style={[styles.statTitle, { color: theme.onSurfaceVariant }]}>
            {title}
          </Text>
          <MaterialIcons name={icon} size={20} color={tint} />
        </View>
        <Text style={[styles.statCount, { color: theme.onSurface }]}>{count}</Text>
        <Text style={[styles.statSubtitle, { color: theme.onSurfaceVariant }]}>
          {subtitle}
        </Text>
      </View>
    </Card>
  );
}

function ShortcutCard({
  title,
  count,
  icon,
  color,
  onPress,
}: {
  title: string;
  count: string;
  icon: IconName;
  color: string;
  onPress: () => void;
}) {
  const theme = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.shortcut,
        {
          backgroundColor: withAlpha(color, 0.08),
          borderColor: withAlpha(color, 0.2),
          opacity: pressed ? 0.7 : 1,
          flex: 1,
        },
      ]}
    >
      <View
        style={[styles.shortcutIcon, { backgroundColor: withAlpha(color, 0.15) }]}
      >
        <MaterialIcons name={icon} size={18} color={color} />
      </View>
      <View style={{ flexShrink: 1 }}>
        <Text style={[styles.shortcutTitle, { color: theme.onSurface }]}>
          {title}
        </Text>
        <Text style={[styles.shortcutCount, { color }]}>{count}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 24,
    gap: 16,
  },
  hero: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  heroGradient: {
    padding: 20,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    flexShrink: 1,
  },
  offlineBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  offlineBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    marginTop: 6,
  },
  heroActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  heroButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  block: {
    borderRadius: 16,
  },
  padding16: {
    padding: 16,
  },
  dailyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  dailyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  circleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dailyTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  dailySubtitle: {
    fontSize: 12,
  },
  dailyCount: {
    fontSize: 16,
    fontWeight: '700',
  },
  dailyFootnote: {
    fontSize: 11,
    marginTop: 6,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 1,
  },
  statCount: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 6,
  },
  statSubtitle: {
    fontSize: 10,
    marginTop: 2,
  },
  shortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  shortcutIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  shortcutCount: {
    fontSize: 11,
  },
  setsTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  setsBody: {
    fontSize: 12,
    marginTop: 4,
  },
  tonalButton: {
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 10,
  },
  tonalButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
