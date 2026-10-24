import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AmberGold, ErrorRose, useAppTheme } from '../theme';

export function ActiveAudioFloatingBar({
  phrase,
  currentIndex,
  targetCount,
  currentFieldTitle,
  isPaused,
  bengaliWarning,
  onPause,
  onResume,
  onStop,
}: {
  phrase: string;
  currentIndex: number;
  targetCount: number;
  currentFieldTitle: string;
  isPaused: boolean;
  bengaliWarning?: string | null;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}) {
  const theme = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.primary }]}>
      <View style={styles.row}>
        <View style={styles.info}>
          <MaterialIcons name="volume-up" size={22} color="#FFFFFF" />
          <View style={styles.textBlock}>
            <Text style={styles.phrase} numberOfLines={1}>
              "{phrase}"
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              Cycle {currentIndex} of {targetCount} •{' '}
              {currentFieldTitle || 'Speaking sequence'}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={isPaused ? onResume : onPause}
            style={({ pressed }) => [
              styles.secondaryButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={styles.secondaryText}>
              {isPaused ? 'Resume' : 'Pause'}
            </Text>
          </Pressable>
          <Pressable
            onPress={onStop}
            style={({ pressed }) => [
              styles.stopButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <MaterialIcons name="stop" size={16} color="#FFFFFF" />
            <Text style={styles.stopText}>Stop</Text>
          </Pressable>
        </View>
      </View>

      {bengaliWarning ? (
        <Text style={styles.warning}>
          ⚠️ Bengali voice missing on device. Meaning displayed on screen.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#0F172A',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  textBlock: {
    flex: 1,
  },
  phrase: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  secondaryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: ErrorRose,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  stopText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  warning: {
    color: AmberGold,
    fontSize: 10,
    marginTop: 4,
  },
});
