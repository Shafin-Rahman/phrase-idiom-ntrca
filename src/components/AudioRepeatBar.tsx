import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AmberAccent, ErrorRose, useAppTheme } from '../theme';
import { withAlpha } from './ui';

interface AudioRepeatBarProps {
  phraseText: string;
  currentRepeatCount: number;
  isPlayingThis: boolean;
  isPaused: boolean;
  currentCycle: number;
  targetCycles: number;
  currentFieldTitle: string;
  onPlayAll: (count: number) => void;
  onPlayEnglish: (count: number) => void;
  onPlayPronounce: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onUpdateCount: (count: number) => void;
  bengaliWarning?: string | null;
}

export function AudioRepeatBar({
  currentRepeatCount,
  isPlayingThis,
  isPaused,
  currentCycle,
  targetCycles,
  currentFieldTitle,
  onPlayAll,
  onPlayEnglish,
  onPlayPronounce,
  onPause,
  onResume,
  onStop,
  onUpdateCount,
  bengaliWarning,
}: AudioRepeatBarProps) {
  const theme = useAppTheme();
  const [showDialog, setShowDialog] = useState(false);
  const [inputVal, setInputVal] = useState(String(currentRepeatCount));

  const progress =
    targetCycles > 0 ? Math.min(1, Math.max(0, currentCycle / targetCycles)) : 0;

  const openDialog = () => {
    setInputVal(String(currentRepeatCount));
    setShowDialog(true);
  };

  const saveDialog = () => {
    const parsed = Number.parseInt(inputVal, 10);
    onUpdateCount(
      Math.min(100, Math.max(1, Number.isNaN(parsed) ? currentRepeatCount : parsed)),
    );
    setShowDialog(false);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isPlayingThis
            ? withAlpha(theme.primaryContainer, 0.85)
            : withAlpha(theme.surfaceVariant, 0.6),
        },
      ]}
    >
      <View style={styles.topRow}>
        {isPlayingThis ? (
          <View style={styles.buttonRow}>
            {isPaused ? (
              <ActionButton
                icon="play-arrow"
                label="Resume"
                background={theme.primary}
                onPress={onResume}
              />
            ) : (
              <ActionButton
                icon="pause"
                label="Pause"
                background={theme.secondary}
                onPress={onPause}
              />
            )}
            <ActionButton
              icon="stop"
              label="Stop"
              background={ErrorRose}
              onPress={onStop}
            />
          </View>
        ) : (
          <View style={styles.buttonRow}>
            <ActionButton
              icon="volume-up"
              label={`Play All (${currentRepeatCount}×)`}
              background={theme.primary}
              onPress={() => onPlayAll(currentRepeatCount)}
            />
            <OutlineButton
              label={`English (${currentRepeatCount}×)`}
              color={theme.primary}
              onPress={() => onPlayEnglish(currentRepeatCount)}
            />
            <Pressable
              accessibilityLabel="Pronounce phrase only"
              onPress={onPlayPronounce}
              style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.6 : 1 }]}
            >
              <MaterialIcons
                name="record-voice-over"
                size={18}
                color={theme.primary}
              />
            </Pressable>
          </View>
        )}

        <View style={styles.stepper}>
          <Text style={[styles.cyclesLabel, { color: theme.onSurfaceVariant }]}>
            Cycles:
          </Text>
          <Pressable
            onPress={() => {
              if (currentRepeatCount > 1) onUpdateCount(currentRepeatCount - 1);
            }}
            style={styles.stepButton}
          >
            <Text style={[styles.stepText, { color: theme.onSurface }]}>−</Text>
          </Pressable>
          <Pressable
            onPress={openDialog}
            style={[
              styles.countBox,
              {
                backgroundColor: theme.surface,
                borderColor: withAlpha(theme.outline, 0.3),
              },
            ]}
          >
            <Text style={[styles.countText, { color: theme.primary }]}>
              {currentRepeatCount}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              if (currentRepeatCount < 100) onUpdateCount(currentRepeatCount + 1);
            }}
            style={styles.stepButton}
          >
            <Text style={[styles.stepText, { color: theme.onSurface }]}>+</Text>
          </Pressable>
        </View>
      </View>

      {isPlayingThis ? (
        <View style={{ marginTop: 8 }}>
          <View style={styles.cycleRow}>
            <Text style={[styles.cycleText, { color: theme.primary }]}>
              Cycle {currentCycle} of {targetCycles} • Speaking:{' '}
              {currentFieldTitle || 'Phrase'}
            </Text>
            <Text style={[styles.cycleText, { color: theme.primary }]}>
              {Math.floor(progress * 100)}%
            </Text>
          </View>
          <View style={{ marginTop: 4 }}>
            <View
              style={[
                styles.progressTrack,
                { backgroundColor: withAlpha(theme.primary, 0.2) },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress * 100}%`, backgroundColor: theme.primary },
                ]}
              />
            </View>
          </View>
        </View>
      ) : null}

      {bengaliWarning && isPlayingThis ? (
        <View style={styles.warningRow}>
          <MaterialIcons name="warning" size={14} color={AmberAccent} />
          <Text style={styles.warningText}>
            Bengali TTS missing on device. Meaning displayed on screen.
          </Text>
        </View>
      ) : null}

      <Modal
        transparent
        visible={showDialog}
        animationType="fade"
        onRequestClose={() => setShowDialog(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalRoot}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setShowDialog(false)}
          />
          <View style={[styles.dialog, { backgroundColor: theme.surface }]}>
            <Text style={[styles.dialogTitle, { color: theme.onSurface }]}>
              Set Repetition Cycles
            </Text>
            <Text style={[styles.dialogBody, { color: theme.onSurface }]}>
              Enter total number of complete playback cycles (e.g. 3, 5, 20):
            </Text>
            <TextInput
              value={inputVal}
              onChangeText={value =>
                setInputVal(value.replace(/[^0-9]/g, '').slice(0, 3))
              }
              keyboardType="number-pad"
              style={[
                styles.dialogInput,
                {
                  color: theme.onSurface,
                  borderColor: withAlpha(theme.outline, 0.5),
                },
              ]}
            />
            <Text style={[styles.dialogHint, { color: theme.onSurfaceVariant }]}>
              Each cycle plays all available fields in sequence.
            </Text>
            <View style={styles.dialogActions}>
              <Pressable onPress={() => setShowDialog(false)} style={styles.textButton}>
                <Text style={{ color: theme.primary, fontWeight: '600' }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={saveDialog}
                style={[styles.saveButton, { backgroundColor: theme.primary }]}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Save</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function ActionButton({
  icon,
  label,
  background,
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  background: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        { backgroundColor: background, opacity: pressed ? 0.75 : 1 },
      ]}
    >
      <MaterialIcons name={icon} size={16} color="#FFFFFF" />
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

function OutlineButton({
  label,
  color,
  onPress,
}: {
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.outlineButton,
        { borderColor: withAlpha(color, 0.45), opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Text style={[styles.outlineText, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  topRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  outlineButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  outlineText: {
    fontSize: 11,
    fontWeight: '600',
  },
  iconButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  cyclesLabel: {
    fontSize: 11,
  },
  stepButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontSize: 16,
    fontWeight: '700',
  },
  countBox: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    minWidth: 28,
    alignItems: 'center',
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cycleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  cycleText: {
    fontSize: 11,
    fontWeight: '700',
    flexShrink: 1,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  warningText: {
    color: AmberAccent,
    fontSize: 10,
    flexShrink: 1,
  },
  modalRoot: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  dialogBody: {
    fontSize: 13,
    marginBottom: 10,
  },
  dialogInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  dialogHint: {
    fontSize: 11,
    marginTop: 6,
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    marginTop: 18,
  },
  textButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  saveButton: {
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
});
