import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AppProvider, useApp } from './src/AppContext';
import { ActiveAudioFloatingBar } from './src/components/ActiveAudioFloatingBar';
import { withAlpha } from './src/components/ui';
import { ExamScreen } from './src/screens/ExamScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { ReviewScreen } from './src/screens/ReviewScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { StudyScreen } from './src/screens/StudyScreen';
import { AppNavTab, TAB_TITLES } from './src/types';
import { SuccessGreen, useAppTheme } from './src/theme';

type NavIconName = keyof typeof MaterialCommunityIcons.glyphMap;

const NAV_ITEMS: {
  tab: AppNavTab;
  label: string;
  icon: NavIconName;
  outlineIcon: NavIconName;
}[] = [
  { tab: 'HOME', label: 'Home', icon: 'home', outlineIcon: 'home-outline' },
  { tab: 'STUDY', label: 'Study', icon: 'school', outlineIcon: 'school-outline' },
  {
    tab: 'EXAM',
    label: 'Exams',
    icon: 'help-circle',
    outlineIcon: 'help-circle-outline',
  },
  { tab: 'REVIEW', label: 'Revision', icon: 'cards', outlineIcon: 'cards-outline' },
  { tab: 'SETTINGS', label: 'Settings', icon: 'cog', outlineIcon: 'cog-outline' },
];

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const {
    hydrated,
    currentTab,
    setTab,
    quizState,
    exitQuiz,
    tts,
    ttsState,
  } = useApp();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (quizState.isActive) {
        exitQuiz();
        return true;
      }
      if (currentTab !== 'HOME') {
        setTab('HOME');
        return true;
      }
      return false;
    });
    return () => subscription.remove();
  }, [currentTab, exitQuiz, quizState.isActive, setTab]);

  if (!hydrated) {
    return (
      <View
        style={[
          styles.loading,
          { backgroundColor: theme.background },
        ]}
      >
        <StatusBar style={theme.dark ? 'light' : 'dark'} />
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />

      {!quizState.isActive ? (
        <View
          style={[
            styles.topBarOuter,
            {
              backgroundColor: theme.surface,
              paddingTop: insets.top,
              borderBottomColor: withAlpha(theme.outline, 0.25),
            },
          ]}
        >
          <View style={styles.topBar}>
            <Text style={[styles.topBarTitle, { color: theme.onSurface }]}>
              {TAB_TITLES[currentTab]}
            </Text>
            <View
              style={[
                styles.offlineBadge,
                { backgroundColor: withAlpha(SuccessGreen, 0.15) },
              ]}
            >
              <Text style={styles.offlineText}>OFFLINE • 421 PHRASES</Text>
            </View>
          </View>
        </View>
      ) : (
        <View
          style={{ height: insets.top, backgroundColor: theme.background }}
        />
      )}

      <View style={{ flex: 1 }}>
        {currentTab === 'HOME' ? (
          <HomeScreen />
        ) : currentTab === 'STUDY' ? (
          <StudyScreen />
        ) : currentTab === 'EXAM' ? (
          <ExamScreen />
        ) : currentTab === 'REVIEW' ? (
          <ReviewScreen />
        ) : (
          <SettingsScreen />
        )}
      </View>

      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: theme.surface,
            paddingBottom: insets.bottom,
            borderTopColor: withAlpha(theme.outline, 0.2),
            borderTopWidth: !quizState.isActive ? 1 : 0,
          },
        ]}
      >
        {ttsState.isPlaying ? (
          <ActiveAudioFloatingBar
            phrase={ttsState.activePhraseTitle}
            currentIndex={ttsState.currentCycle}
            targetCount={ttsState.totalCycles}
            currentFieldTitle={ttsState.currentFieldTitle}
            isPaused={ttsState.isPaused}
            bengaliWarning={ttsState.bengaliVoiceWarning}
            onPause={() => tts.pause()}
            onResume={() => tts.resume()}
            onStop={() => tts.stop()}
          />
        ) : null}

        {!quizState.isActive ? (
          <View style={styles.navRow}>
            {NAV_ITEMS.map(item => {
              const selected = currentTab === item.tab;
              return (
                <Pressable
                  key={item.tab}
                  accessibilityRole="tab"
                  accessibilityState={{ selected }}
                  accessibilityLabel={item.label}
                  onPress={() => setTab(item.tab)}
                  style={({ pressed }) => [
                    styles.navItem,
                    {
                      backgroundColor: selected
                        ? withAlpha(theme.primary, 0.1)
                        : 'transparent',
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={selected ? item.icon : item.outlineIcon}
                    size={22}
                    color={selected ? theme.primary : theme.onSurfaceVariant}
                  />
                  <Text
                    style={[
                      styles.navLabel,
                      {
                        color: selected ? theme.primary : theme.onSurfaceVariant,
                        fontWeight: selected ? '700' : '400',
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarOuter: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  topBar: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  offlineBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginTop: 2,
  },
  offlineText: {
    fontSize: 9,
    fontWeight: '700',
    color: SuccessGreen,
  },
  bottomBar: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 4,
    elevation: 6,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: 4,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    marginHorizontal: 2,
    borderRadius: 10,
  },
  navLabel: {
    fontSize: 10,
    marginTop: 2,
  },
});
