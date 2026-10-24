import AsyncStorage from '@react-native-async-storage/async-storage';

import { DailyStudyLog, ExamResult, PhraseUserData } from './types';

const STORAGE_KEY = '@phrase_idiom_master/progress/v1';

export interface StoredProgress {
  userData: Record<string, PhraseUserData>;
  examResults: ExamResult[];
  dailyLogs: Record<string, DailyStudyLog>;
}

export const emptyProgress = (): StoredProgress => ({
  userData: {},
  examResults: [],
  dailyLogs: {},
});

export function todayString(): string {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export async function loadProgress(): Promise<StoredProgress> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw) as Partial<StoredProgress>;
    return {
      userData:
        parsed.userData && typeof parsed.userData === 'object'
          ? parsed.userData
          : {},
      examResults: Array.isArray(parsed.examResults)
        ? parsed.examResults.slice(0, 30)
        : [],
      dailyLogs:
        parsed.dailyLogs && typeof parsed.dailyLogs === 'object'
          ? parsed.dailyLogs
          : {},
    };
  } catch {
    return emptyProgress();
  }
}

let saveChain: Promise<void> = Promise.resolve();

export function saveProgress(progress: StoredProgress): Promise<void> {
  saveChain = saveChain
    .catch(() => undefined)
    .then(() => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress)));
  return saveChain;
}
