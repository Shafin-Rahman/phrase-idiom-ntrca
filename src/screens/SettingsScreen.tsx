import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useApp } from '../AppContext';
import { Card, Dialog, SectionTitle, withAlpha } from '../components/ui';
import {
  ErrorRose,
  IndigoPrimary,
  SuccessGreen,
  useAppTheme,
} from '../theme';

export function SettingsScreen() {
  const {
    tts,
    ttsState,
    globalDefaultRepeatCount,
    setGlobalDefaultRepeatCount,
    resetProgress,
  } = useApp();
  const theme = useAppTheme();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Card theme={theme}>
        <View style={styles.padding16}>
          <View style={styles.identityRow}>
            <View
              style={[
                styles.greenCircle,
                { backgroundColor: withAlpha(SuccessGreen, 0.15) },
              ]}
            >
              <MaterialIcons name="check-circle" size={24} color={SuccessGreen} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.identityTitle, { color: theme.onSurface }]}>
                100% Free & Completely Offline
              </Text>
              <Text
                style={[styles.identitySubtitle, { color: theme.onSurfaceVariant }]}
              >
                Zero API fees • Zero internet required • No account needed
              </Text>
            </View>
          </View>
          <Text style={[styles.identityBody, { color: theme.onSurfaceVariant }]}>
            All 421 phrases, authentic Bengali meanings, exam records, mnemonics,
            and user progress are stored entirely on your device in local storage.
          </Text>
        </View>
      </Card>

      <SectionTitle theme={theme}>Speech & Audio Settings</SectionTitle>

      <Card theme={theme} elevation={1}>
        <View style={styles.padding16}>
          <View style={styles.rowBetween}>
            <View style={styles.labelRow}>
              <MaterialIcons name="speed" size={20} color={theme.primary} />
              <Text style={[styles.label, { color: theme.onSurface }]}>
                Speech Rate:
              </Text>
            </View>
            <Text style={[styles.rateValue, { color: theme.primary }]}>
              {ttsState.speechRate.toFixed(2)}×
            </Text>
          </View>

          <Slider
            minimumValue={0.5}
            maximumValue={1.5}
            step={0.25}
            value={ttsState.speechRate}
            onValueChange={value => tts.setSpeechRate(value)}
            minimumTrackTintColor={theme.primary}
            maximumTrackTintColor={withAlpha(theme.outline, 0.4)}
            thumbTintColor={theme.primary}
            style={styles.slider}
          />

          <View style={styles.sliderLabels}>
            <Text style={[styles.smallLabel, { color: theme.onSurfaceVariant }]}>
              0.5× (Slow)
            </Text>
            <Text style={[styles.smallLabel, { color: theme.onSurfaceVariant }]}>
              1.0× (Normal)
            </Text>
            <Text style={[styles.smallLabel, { color: theme.onSurfaceVariant }]}>
              1.5× (Fast)
            </Text>
          </View>

          <View style={[styles.rowBetween, { marginTop: 14 }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.onSurface }]}>
                Default Audio Repetition:
              </Text>
              <Text style={[styles.smallLabel, { color: theme.onSurfaceVariant }]}>
                Number of times each item plays by default
              </Text>
            </View>
            <View style={styles.stepper}>
              <Pressable
                onPress={() => {
                  if (globalDefaultRepeatCount > 1) {
                    setGlobalDefaultRepeatCount(globalDefaultRepeatCount - 1);
                  }
                }}
                style={styles.stepButton}
              >
                <Text style={[styles.stepText, { color: theme.onSurface }]}>−</Text>
              </Pressable>
              <View
                style={[
                  styles.countBox,
                  { backgroundColor: theme.primaryContainer },
                ]}
              >
                <Text style={[styles.countText, { color: theme.primary }]}>
                  {globalDefaultRepeatCount}×
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  if (globalDefaultRepeatCount < 50) {
                    setGlobalDefaultRepeatCount(globalDefaultRepeatCount + 1);
                  }
                }}
                style={styles.stepButton}
              >
                <Text style={[styles.stepText, { color: theme.onSurface }]}>+</Text>
              </Pressable>
            </View>
          </View>

          <View style={[styles.voiceRow, { marginTop: 14 }]}>
            <Pressable
              onPress={() => tts.testEnglishVoice('A blessing in disguise')}
              style={({ pressed }) => [
                styles.testButton,
                { backgroundColor: IndigoPrimary, opacity: pressed ? 0.75 : 1 },
              ]}
            >
              <MaterialIcons name="volume-up" size={16} color="#FFFFFF" />
              <Text style={styles.testButtonText}>Test English</Text>
            </Pressable>
            <Pressable
              onPress={() => tts.testBengaliVoice('অপ্রত্যাশিতভাবে ভালো কিছু হওয়া')}
              style={({ pressed }) => [
                styles.testButton,
                {
                  backgroundColor: theme.primaryContainer,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              <MaterialIcons name="volume-up" size={16} color={theme.primary} />
              <Text style={[styles.testButtonText, { color: theme.primary }]}>
                Test Bengali
              </Text>
            </Pressable>
          </View>

          <View
            style={[
              styles.statusBox,
              { backgroundColor: withAlpha(theme.surfaceVariant, 0.5) },
            ]}
          >
            <View style={styles.statusHeader}>
              <MaterialIcons name="info" size={16} color={theme.primary} />
              <Text style={[styles.statusNote, { color: theme.onSurface }]}>
                {ttsState.statusNote}
              </Text>
            </View>
            <Text style={[styles.statusLine, { color: theme.onSurfaceVariant }]}>
              • English Voice: Active{'\n'}• Bengali Voice:{' '}
              {ttsState.isBengaliVoiceAvailable
                ? 'Available (Native bn-BD/bn-IN)'
                : 'Missing (Meaning shown on screen)'}
            </Text>
            {!ttsState.isBengaliVoiceAvailable ? (
              <Text style={[styles.instructions, { color: theme.primary }]}>
                💡 To enable Bengali speech output:{'\n'}
                1. Open phone Settings &gt; Accessibility &gt; Text-to-speech
                output.{'\n'}
                2. Tap the settings gear next to Preferred engine (e.g. Speech
                Services by Google).{'\n'}
                3. Tap 'Install voice data' and select 'Bengali'.
              </Text>
            ) : null}
          </View>
        </View>
      </Card>

      <SectionTitle theme={theme}>Build & APK Installation Guide</SectionTitle>

      <Card theme={theme} elevation={1}>
        <View style={styles.padding16}>
          <View style={styles.labelRow}>
            <MaterialIcons name="build" size={20} color={theme.primary} />
            <Text style={[styles.buildTitle, { color: theme.onSurface }]}>
              How to install on your personal phone:
            </Text>
          </View>
          {[
            '1. Download or Export the project ZIP file to your Windows PC.',
            '2. Extract the ZIP folder on your computer.',
            '3. Open free Android Studio (available free from developer.android.com).',
            '4. Click File > Open, then select the extracted project folder.',
            '5. Wait 1–2 minutes for Gradle to index the bundled files.',
            '6. In the top menu bar, click: Build > Build Bundle(s) / APK(s) > Build APK(s).',
            "7. When finished, click 'locate' to find app-debug.apk (located at app/build/outputs/apk/debug/app-debug.apk).",
            '8. Transfer app-debug.apk to your phone via USB cable, Google Drive, or Bluetooth.',
            "9. On your Android phone, tap the APK. If Android asks 'Install unknown apps', toggle 'Allow from this source'.",
            '10. The app installs immediately and works 100% offline!',
          ].map(line => (
            <Text
              key={line}
              style={[styles.guideLine, { color: theme.onSurfaceVariant }]}
            >
              {line}
            </Text>
          ))}
        </View>
      </Card>

      <SectionTitle theme={theme}>Data Management</SectionTitle>

      <Card theme={theme} elevation={1}>
        <View style={styles.padding16}>
          <Text style={[styles.dangerTitle, { color: ErrorRose }]}>
            Reset All Study History & Scores
          </Text>
          <Text style={[styles.smallLabel, { color: theme.onSurfaceVariant }]}>
            Clears all bookmarks, mastery statuses, incorrect lists, and exam
            scores. Does not delete any phrases.
          </Text>
          <Pressable
            onPress={() => setShowResetDialog(true)}
            style={({ pressed }) => [
              styles.resetButton,
              { borderColor: withAlpha(ErrorRose, 0.5), opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <MaterialIcons name="delete" size={16} color={ErrorRose} />
            <Text style={{ color: ErrorRose, fontWeight: '600' }}>
              Reset Progress...
            </Text>
          </Pressable>
        </View>
      </Card>

      <View style={{ height: 30 }} />

      <Dialog
        visible={showResetDialog}
        title="Reset Progress?"
        message="Are you sure you want to reset all your study records, bookmarks, and quiz scores? This cannot be undone."
        confirmLabel="Yes, Reset All"
        cancelLabel="Cancel"
        danger
        theme={theme}
        onCancel={() => setShowResetDialog(false)}
        onConfirm={() => {
          resetProgress(() => {
            setShowResetDialog(false);
            setShowSuccess(true);
          });
        }}
      />

      <Dialog
        visible={showSuccess}
        title="Progress Reset"
        message="All your local study progress has been reset successfully."
        confirmLabel="OK"
        theme={theme}
        onConfirm={() => setShowSuccess(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 24,
  },
  padding16: {
    padding: 16,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  greenCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  identitySubtitle: {
    fontSize: 11,
  },
  identityBody: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  rateValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  slider: {
    width: '100%',
    height: 40,
    marginTop: 4,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallLabel: {
    fontSize: 11,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontSize: 16,
    fontWeight: '700',
  },
  countBox: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
  },
  voiceRow: {
    flexDirection: 'row',
    gap: 8,
  },
  testButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 8,
    paddingVertical: 10,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBox: {
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusNote: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  statusLine: {
    fontSize: 11,
    marginTop: 6,
    lineHeight: 16,
  },
  instructions: {
    fontSize: 10,
    lineHeight: 14,
    marginTop: 6,
  },
  buildTitle: {
    fontSize: 13,
    fontWeight: '700',
    flexShrink: 1,
  },
  guideLine: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
  dangerTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginTop: 10,
  },
});
