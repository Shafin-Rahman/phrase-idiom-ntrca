import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

import { PhraseItem, displayBadge } from './types';

export interface SpeechSegment {
  fieldName: string;
  textToSpeak: string;
  language: string;
  isBengali: boolean;
  introLabel?: string;
}

export interface TtsState {
  isPlaying: boolean;
  isPaused: boolean;
  activePhraseTitle: string;
  activeItemId: string | null;
  currentCycle: number;
  totalCycles: number;
  currentFieldTitle: string;
  speechRate: number;
  engineName: string;
  statusNote: string;
  isBengaliVoiceAvailable: boolean;
  bengaliVoiceWarning: string | null;
}

const initialState: TtsState = {
  isPlaying: false,
  isPaused: false,
  activePhraseTitle: '',
  activeItemId: null,
  currentCycle: 0,
  totalCycles: 0,
  currentFieldTitle: '',
  speechRate: 1,
  engineName: Platform.OS === 'android' ? 'Android TTS' : 'iOS Speech',
  statusNote: 'Initializing speech engine...',
  isBengaliVoiceAvailable: false,
  bengaliVoiceWarning: null,
};

export class TtsController {
  private state: TtsState = initialState;
  private listeners = new Set<() => void>();

  private englishLocale = 'en-US';
  private bengaliLocale = 'bn-BD';
  private segments: SpeechSegment[] = [];
  private targetCycles = 1;
  private currentCycleIndex = 1;
  private currentSegmentIndex = 0;
  private loopActive = false;
  private runId = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private mounted = true;

  constructor() {
    void this.detectVoices();
  }

  getSnapshot = (): TtsState => this.state;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private setState(patch: Partial<TtsState>) {
    if (!this.mounted) return;
    this.state = { ...this.state, ...patch };
    this.listeners.forEach(listener => listener());
  }

  private async detectVoices() {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      if (!this.mounted) return;

      if (!voices || voices.length === 0) {
        this.setState({
          statusNote: 'English voice ready. Bengali voice availability depends on installed device voice data.',
          isBengaliVoiceAvailable: true,
          bengaliVoiceWarning: null,
        });
        return;
      }

      const bengali = voices.find(voice =>
        voice.language?.toLowerCase().replace('_', '-').startsWith('bn'),
      );
      const english = voices.find(voice =>
        voice.language?.toLowerCase().replace('_', '-').startsWith('en'),
      );
      if (english?.language) this.englishLocale = english.language.replace('_', '-');
      if (bengali?.language) this.bengaliLocale = bengali.language.replace('_', '-');

      if (bengali) {
        this.setState({
          isBengaliVoiceAvailable: true,
          bengaliVoiceWarning: null,
          statusNote: `TTS Ready: English and Bengali (${this.bengaliLocale}) voices available.`,
        });
      } else {
        this.setState({
          isBengaliVoiceAvailable: false,
          bengaliVoiceWarning:
            'Bengali TTS voice is missing on device. Install Bengali voice data in Android Settings > Accessibility > Text-to-speech output.',
          statusNote: 'English voice ready. Bengali voice missing on this device.',
        });
      }
    } catch {
      if (!this.mounted) return;
      this.setState({
        statusNote: 'TTS ready. Voice availability is managed by your device speech settings.',
        isBengaliVoiceAvailable: true,
      });
    }
  }

  private clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private resetPlayback() {
    this.loopActive = false;
    this.clearTimer();
    this.runId += 1;
    void Speech.stop();
  }

  buildPlayAllSegments(item: PhraseItem): SpeechSegment[] {
    const segments: SpeechSegment[] = [];

    const cleanPhrase = item.phrase.trim();
    if (cleanPhrase && cleanPhrase !== 'null') {
      segments.push({
        fieldName: 'Phrase',
        textToSpeak: `Phrase: ${cleanPhrase}.`,
        language: this.englishLocale,
        isBengali: false,
      });
    }

    const validBn = item.meaningBn.filter(value => value.trim() && value !== 'null');
    if (validBn.length) {
      segments.push({
        fieldName: 'Bengali Meaning',
        textToSpeak: validBn.join(', '),
        language: this.bengaliLocale,
        isBengali: true,
        introLabel: 'Bengali meaning',
      });
    }

    const validEn = item.meaningEn.filter(value => value.trim() && value !== 'null');
    if (validEn.length) {
      segments.push({
        fieldName: 'English Meaning',
        textToSpeak: `English meaning: ${validEn.join('; ')}.`,
        language: this.englishLocale,
        isBengali: false,
      });
    }

    const validEx = item.example.filter(value => value.trim() && value !== 'null');
    if (validEx.length) {
      segments.push({
        fieldName: 'Example',
        textToSpeak: `Example: ${validEx.join(' ')}.`,
        language: this.englishLocale,
        isBengali: false,
      });
    }

    const examBadges = Array.from(
      new Set(
        item.examHistory
          .map(displayBadge)
          .filter(badge => badge.trim() && badge !== 'null'),
      ),
    );
    if (examBadges.length) {
      segments.push({
        fieldName: 'Exam History',
        textToSpeak: `Exam history: ${examBadges.join(', ')}.`,
        language: this.englishLocale,
        isBengali: false,
      });
    }

    const cleanTip = item.memorizationTip.trim();
    if (cleanTip && cleanTip !== 'null') {
      segments.push({
        fieldName: 'Exam Tip',
        textToSpeak: `Exam tip: ${cleanTip}.`,
        language: this.englishLocale,
        isBengali: false,
      });
    }

    const cleanMnemonic = item.mnemonic.trim();
    if (cleanMnemonic && cleanMnemonic !== 'null') {
      segments.push({
        fieldName: 'Mnemonic',
        textToSpeak: `Mnemonic: ${cleanMnemonic}.`,
        language: this.englishLocale,
        isBengali: false,
      });
    }

    return segments;
  }

  buildPlayEnglishSegments(item: PhraseItem): SpeechSegment[] {
    return this.buildPlayAllSegments(item).filter(segment => !segment.isBengali);
  }

  buildPhraseOnlySegments(phrase: string): SpeechSegment[] {
    return [
      {
        fieldName: 'Phrase',
        textToSpeak: phrase.trim(),
        language: this.englishLocale,
        isBengali: false,
      },
    ];
  }

  playAllForPhrase(item: PhraseItem, count = 1) {
    this.startSequence(
      item.phrase,
      item.id,
      this.buildPlayAllSegments(item),
      count,
    );
  }

  playEnglishForPhrase(item: PhraseItem, count = 1) {
    this.startSequence(
      item.phrase,
      item.id,
      this.buildPlayEnglishSegments(item),
      count,
    );
  }

  playPhraseOnly(phrase: string, phraseId: string | null = null, count = 1) {
    this.startSequence(
      phrase,
      phraseId,
      this.buildPhraseOnlySegments(phrase),
      count,
    );
  }

  private startSequence(
    phraseTitle: string,
    itemId: string | null,
    segments: SpeechSegment[],
    cycles: number,
  ) {
    this.resetPlayback();
    if (segments.length === 0) return;

    const safeCycles = Math.min(100, Math.max(1, cycles));
    this.segments = segments;
    this.targetCycles = safeCycles;
    this.currentCycleIndex = 1;
    this.currentSegmentIndex = 0;
    this.loopActive = true;
    const run = ++this.runId;

    this.setState({
      isPlaying: true,
      isPaused: false,
      activePhraseTitle: phraseTitle.trim(),
      activeItemId: itemId,
      currentCycle: 1,
      totalCycles: safeCycles,
      currentFieldTitle: segments[0].fieldName,
    });

    this.playNextSegment(run);
  }

  private playNextSegment(run: number) {
    if (!this.loopActive || this.state.isPaused || run !== this.runId) return;
    if (this.currentSegmentIndex >= this.segments.length) return;

    const segment = this.segments[this.currentSegmentIndex];
    this.setState({ currentFieldTitle: segment.fieldName });

    if (segment.introLabel) {
      this.speakText(segment.introLabel, this.englishLocale, run, () => {
        if (!this.loopActive || this.state.isPaused || run !== this.runId) return;
        this.timer = setTimeout(() => {
          if (this.loopActive && !this.state.isPaused && run === this.runId) {
            this.speakCurrentSegmentBody(run);
          }
        }, 300);
      });
    } else {
      this.speakCurrentSegmentBody(run);
    }
  }

  private speakCurrentSegmentBody(run: number) {
    if (!this.loopActive || this.state.isPaused || run !== this.runId) return;
    const segment = this.segments[this.currentSegmentIndex];
    if (!segment) return;

    if (!segment.isBengali) {
      this.speakText(segment.textToSpeak, segment.language, run, () =>
        this.onSegmentDone(run),
      );
      return;
    }

    if (!this.state.isBengaliVoiceAvailable) {
      this.onBengaliMissing(run);
      return;
    }

    this.speakText(segment.textToSpeak, this.bengaliLocale, run, () =>
      this.onSegmentDone(run),
      () => this.onBengaliMissing(run),
    );
  }

  private onBengaliMissing(run: number) {
    if (run !== this.runId) return;
    this.setState({
      isBengaliVoiceAvailable: false,
      bengaliVoiceWarning:
        'Bengali TTS voice is missing on device. Install Bengali voice data in Android Settings > Accessibility > Text-to-speech output.',
    });
    this.speakText(
      'Bengali voice data is missing on this device. Bengali meaning is displayed on screen.',
      this.englishLocale,
      run,
      () => this.onSegmentDone(run),
    );
  }

  private speakText(
    text: string,
    language: string,
    run: number,
    onDone: () => void,
    onError?: () => void,
  ) {
    if (run !== this.runId || !text.trim()) {
      onDone();
      return;
    }
    Speech.speak(text, {
      language,
      rate: this.state.speechRate,
      onDone: () => {
        if (run === this.runId) onDone();
      },
      onStopped: () => {
        // Pause/stop owns the state transition; do not advance the sequence.
      },
      onError: () => {
        if (run !== this.runId) return;
        if (onError) onError();
        else this.stop();
      },
    });
  }

  private onSegmentDone(run: number) {
    if (run !== this.runId || !this.loopActive || this.state.isPaused) return;

    this.currentSegmentIndex += 1;
    if (this.currentSegmentIndex < this.segments.length) {
      this.timer = setTimeout(() => {
        if (this.loopActive && !this.state.isPaused && run === this.runId) {
          this.playNextSegment(run);
        }
      }, 600);
      return;
    }

    if (this.currentCycleIndex < this.targetCycles) {
      this.currentCycleIndex += 1;
      this.currentSegmentIndex = 0;
      this.setState({ currentCycle: this.currentCycleIndex });
      this.timer = setTimeout(() => {
        if (this.loopActive && !this.state.isPaused && run === this.runId) {
          this.playNextSegment(run);
        }
      }, 1000);
      return;
    }

    this.loopActive = false;
    this.setState({
      isPlaying: false,
      isPaused: false,
      currentFieldTitle: 'Completed',
    });
  }

  pause() {
    if (this.state.isPlaying && !this.state.isPaused) {
      this.clearTimer();
      this.setState({ isPaused: true });
      void Speech.stop();
    }
  }

  resume() {
    if (this.state.isPaused && this.loopActive) {
      this.setState({ isPaused: false, isPlaying: true });
      const run = this.runId;
      this.playNextSegment(run);
    }
  }

  stop() {
    this.resetPlayback();
    this.setState({
      isPlaying: false,
      isPaused: false,
      currentCycle: 0,
      currentFieldTitle: '',
    });
  }

  setSpeechRate(rate: number) {
    const safeRate = Math.min(2, Math.max(0.5, rate));
    this.setState({ speechRate: safeRate });
  }

  testEnglishVoice(sample = 'A blessing in disguise') {
    this.resetPlayback();
    const run = ++this.runId;
    this.setState({
      isPlaying: true,
      isPaused: false,
      activePhraseTitle: sample,
      activeItemId: null,
      currentCycle: 1,
      totalCycles: 1,
      currentFieldTitle: 'Phrase',
    });
    this.speakText(sample, this.englishLocale, run, () => {
      this.setState({ isPlaying: false, currentFieldTitle: 'Completed' });
    });
  }

  testBengaliVoice(sample = 'অপ্রত্যাশিতভাবে ভালো কিছু হওয়া') {
    this.resetPlayback();
    const run = ++this.runId;
    this.setState({
      isPlaying: true,
      isPaused: false,
      activePhraseTitle: sample,
      activeItemId: null,
      currentCycle: 1,
      totalCycles: 1,
      currentFieldTitle: 'Bengali Meaning',
    });

    if (!this.state.isBengaliVoiceAvailable) {
      this.setState({
        bengaliVoiceWarning:
          'Bengali voice not installed on device. Please install Bengali speech in Android settings.',
      });
      this.speakText(
        'Bengali speech voice is not installed on this device.',
        this.englishLocale,
        run,
        () => this.setState({ isPlaying: false }),
      );
      return;
    }

    this.speakText(
      sample,
      this.bengaliLocale,
      run,
      () => this.setState({ isPlaying: false, currentFieldTitle: 'Completed' }),
      () => {
        this.setState({
          isBengaliVoiceAvailable: false,
          bengaliVoiceWarning:
            'Bengali voice not installed on device. Please install Bengali speech in Android settings.',
        });
        this.speakText(
          'Bengali speech voice is not installed on this device.',
          this.englishLocale,
          run,
          () => this.setState({ isPlaying: false }),
        );
      },
    );
  }

  shutdown() {
    this.mounted = false;
    this.resetPlayback();
    this.listeners.clear();
  }
}
