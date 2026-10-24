import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import { ALL_PHRASES, generateQuiz } from './data/phrases';
import { loadProgress, saveProgress, StoredProgress, emptyProgress, todayString } from './storage';
import { TtsController, TtsState } from './tts';
import {
  AppNavTab,
  DailyStudyLog,
  ExamModeType,
  ExamResult,
  PhraseItem,
  PhraseUserData,
  QuizState,
  emptyQuizState,
  emptyUserData,
} from './types';

export type QuickFilter = 'all' | 'bookmarked' | 'incorrect' | 'mastered' | 'unstudied';

interface AppContextValue {
  hydrated: boolean;
  allPhrases: PhraseItem[];
  userDataMap: Record<string, PhraseUserData>;
  examResults: ExamResult[];
  todayLog: DailyStudyLog | null;

  currentTab: AppNavTab;
  setTab: (tab: AppNavTab) => void;

  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  selectedLetter: string | null;
  setSelectedLetter: (value: string | null) => void;
  selectedPart: number | null;
  setSelectedPart: (value: number | null) => void;
  quickFilter: QuickFilter;
  setQuickFilter: (value: QuickFilter) => void;
  filteredPhrases: PhraseItem[];
  clearFilters: () => void;

  selectedExamMode: ExamModeType;
  setSelectedExamMode: (mode: ExamModeType) => void;
  examCategoryChoice: string;
  setExamCategoryChoice: (value: string) => void;
  examSelectedLetters: Set<string>;
  setExamSelectedLetters: React.Dispatch<React.SetStateAction<Set<string>>>;
  examSelectedParts: Set<number>;
  setExamSelectedParts: React.Dispatch<React.SetStateAction<Set<number>>>;
  examQuestionCount: number;
  setExamQuestionCount: (value: number) => void;
  examShuffle: boolean;
  setExamShuffle: (value: boolean) => void;
  examWrongAnswerRepeatCount: number;
  setExamWrongAnswerRepeatCount: (value: number) => void;
  quizState: QuizState;

  globalDefaultRepeatCount: number;
  setGlobalDefaultRepeatCount: (value: number) => void;
  autoPlayOnWrongAnswer: boolean;
  setAutoPlayOnWrongAnswer: (value: boolean) => void;

  toggleBookmark: (phraseId: string) => void;
  toggleMastered: (phraseId: string) => void;
  playAllForPhrase: (item: PhraseItem, count?: number) => void;
  playEnglishForPhrase: (item: PhraseItem, count?: number) => void;
  playPhraseWithCount: (phrase: string, phraseId?: string | null, count?: number) => void;
  playPronouncePhrase: (phrase: string, phraseId?: string | null, count?: number) => void;
  updatePhraseRepeatPreference: (phraseId: string, newCount: number) => void;

  startExam: (modeOverride?: ExamModeType) => void;
  selectOption: (optionIndex: number) => void;
  submitAnswer: () => void;
  nextQuestion: () => void;
  exitQuiz: () => void;

  resetProgress: (onComplete?: () => void) => void;

  tts: TtsController;
  ttsState: TtsState;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<StoredProgress>(emptyProgress);
  const [hydrated, setHydrated] = useState(false);
  const [currentTab, setCurrentTab] = useState<AppNavTab>('HOME');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLetter, setSelectedLetter] = useState<string | null>('A');
  const [selectedPart, setSelectedPart] = useState<number | null>(null);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');

  const [selectedExamMode, setSelectedExamMode] =
    useState<ExamModeType>('CATEGORY_EXAM');
  const [examCategoryChoice, setExamCategoryChoice] = useState('previous_bcs');
  const [examSelectedLetters, setExamSelectedLetters] = useState<Set<string>>(
    () => new Set(['A']),
  );
  const [examSelectedParts, setExamSelectedParts] = useState<Set<number>>(
    () => new Set([1]),
  );
  const [examQuestionCount, setExamQuestionCount] = useState(10);
  const [examShuffle, setExamShuffle] = useState(true);
  const [examWrongAnswerRepeatCount, setExamWrongAnswerRepeatCount] = useState(5);
  const [quizState, setQuizState] = useState<QuizState>(emptyQuizState);

  const [globalDefaultRepeatCount, setGlobalDefaultRepeatCount] = useState(5);
  const [autoPlayOnWrongAnswer, setAutoPlayOnWrongAnswer] = useState(true);

  const ttsRef = useRef<TtsController | null>(null);
  if (!ttsRef.current) ttsRef.current = new TtsController();
  const tts = ttsRef.current;
  const ttsState = useSyncExternalStore(tts.subscribe, tts.getSnapshot, tts.getSnapshot);

  useEffect(() => {
    let cancelled = false;
    void loadProgress().then(stored => {
      if (cancelled) return;
      setProgress(stored);
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (hydrated) void saveProgress(progress);
  }, [hydrated, progress]);

  useEffect(
    () => () => {
      tts.shutdown();
    },
    [tts],
  );

  const userDataMap = progress.userData;
  const todayLog = progress.dailyLogs[todayString()] ?? null;
  const examResults = progress.examResults;

  const updateUserData = useCallback(
    (phraseId: string, updater: (current: PhraseUserData) => PhraseUserData) => {
      setProgress(previous => {
        const current = previous.userData[phraseId] ?? emptyUserData(phraseId);
        return {
          ...previous,
          userData: {
            ...previous.userData,
            [phraseId]: updater(current),
          },
        };
      });
    },
    [],
  );

  const incrementDailyLog = useCallback(() => {
    const today = todayString();
    setProgress(previous => {
      const current = previous.dailyLogs[today];
      return {
        ...previous,
        dailyLogs: {
          ...previous.dailyLogs,
          [today]: current
            ? { ...current, count: current.count + 1 }
            : { dateString: today, count: 1, target: 15 },
        },
      };
    });
  }, []);

  const toggleBookmark = useCallback(
    (phraseId: string) => {
      updateUserData(phraseId, current => ({
        ...current,
        isBookmarked: !current.isBookmarked,
      }));
    },
    [updateUserData],
  );

  const toggleMastered = useCallback(
    (phraseId: string) => {
      updateUserData(phraseId, current => ({
        ...current,
        isMastered: !current.isMastered,
      }));
    },
    [updateUserData],
  );

  const recordStudySession = useCallback(
    (phraseId: string) => {
      updateUserData(phraseId, current => ({
        ...current,
        studyCount: current.studyCount + 1,
        lastStudiedAt: Date.now(),
      }));
      incrementDailyLog();
    },
    [incrementDailyLog, updateUserData],
  );

  const recordAnswerResult = useCallback(
    (phraseId: string, isCorrect: boolean) => {
      updateUserData(phraseId, current => {
        if (isCorrect) {
          return {
            ...current,
            correctCount: current.correctCount + 1,
            needsRevision: false,
            lastStudiedAt: Date.now(),
          };
        }
        return {
          ...current,
          incorrectCount: current.incorrectCount + 1,
          needsRevision: true,
          lastStudiedAt: Date.now(),
        };
      });
      incrementDailyLog();
    },
    [incrementDailyLog, updateUserData],
  );

  const playAllForPhrase = useCallback(
    (item: PhraseItem, count?: number) => {
      const targetCount =
        count ??
        userDataMap[item.id]?.customRepeatCount ??
        globalDefaultRepeatCount;
      tts.playAllForPhrase(item, targetCount);
      recordStudySession(item.id);
    },
    [globalDefaultRepeatCount, recordStudySession, tts, userDataMap],
  );

  const playEnglishForPhrase = useCallback(
    (item: PhraseItem, count?: number) => {
      const targetCount =
        count ??
        userDataMap[item.id]?.customRepeatCount ??
        globalDefaultRepeatCount;
      tts.playEnglishForPhrase(item, targetCount);
      recordStudySession(item.id);
    },
    [globalDefaultRepeatCount, recordStudySession, tts, userDataMap],
  );

  const playPhraseWithCount = useCallback(
    (phrase: string, phraseId?: string | null, count?: number) => {
      const targetCount =
        count ??
        (phraseId ? userDataMap[phraseId]?.customRepeatCount : undefined) ??
        globalDefaultRepeatCount;
      tts.playPhraseOnly(phrase, phraseId ?? null, targetCount);
      if (phraseId) recordStudySession(phraseId);
    },
    [globalDefaultRepeatCount, recordStudySession, tts, userDataMap],
  );

  const playPronouncePhrase = useCallback(
    (phrase: string, phraseId?: string | null, count = 1) => {
      playPhraseWithCount(phrase, phraseId, count);
    },
    [playPhraseWithCount],
  );

  const updatePhraseRepeatPreference = useCallback(
    (phraseId: string, newCount: number) => {
      const safe = Math.min(100, Math.max(1, newCount));
      updateUserData(phraseId, current => ({
        ...current,
        customRepeatCount: safe,
      }));
    },
    [updateUserData],
  );

  const filteredPhrases = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return ALL_PHRASES.filter(item => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (selectedLetter != null && item.firstLetter !== selectedLetter) {
        return false;
      }
      if (selectedPart != null && !item.sourceParts.includes(selectedPart)) {
        return false;
      }

      const data = userDataMap[item.id];
      if (quickFilter === 'bookmarked' && data?.isBookmarked !== true) return false;
      if (quickFilter === 'incorrect' && (data?.incorrectCount ?? 0) <= 0) return false;
      if (quickFilter === 'mastered' && data?.isMastered !== true) return false;
      if (quickFilter === 'unstudied' && (data?.studyCount ?? 0) > 0) return false;

      if (query) {
        const matchPhrase = item.phrase.toLowerCase().includes(query);
        const matchBn = item.meaningBn.some(value => value.toLowerCase().includes(query));
        const matchEn = item.meaningEn.some(value => value.toLowerCase().includes(query));
        const matchExam = item.examHistory.some(
          item =>
            item.examName?.toLowerCase().includes(query) === true ||
            item.examCategory?.toLowerCase().includes(query) === true,
        );
        if (!matchPhrase && !matchBn && !matchEn && !matchExam) return false;
      }

      return true;
    });
  }, [quickFilter, searchQuery, selectedCategory, selectedLetter, selectedPart, userDataMap]);

  const clearFilters = useCallback(() => {
    setSelectedCategory('all');
    setSelectedLetter(null);
    setSelectedPart(null);
    setQuickFilter('all');
    setSearchQuery('');
  }, []);

  const startExam = useCallback(
    (modeOverride?: ExamModeType) => {
      const mode = modeOverride ?? selectedExamMode;
      let eligible: PhraseItem[] = [];
      let examTitle = '';

      switch (mode) {
        case 'SET_EXAM': {
          const parts = examSelectedParts;
          eligible = ALL_PHRASES.filter(item =>
            item.sourceParts.some(part => parts.has(part)),
          );
          const sortedParts = Array.from(parts).sort((a, b) => a - b);
          examTitle = `Set Exam (Parts ${sortedParts.join(', ')})`;
          break;
        }
        case 'CATEGORY_EXAM': {
          const category = examCategoryChoice;
          const label =
            category === 'previous_bcs'
              ? 'Previous BCS'
              : category === 'previous_ntrca'
                ? 'Previous NTRCA'
                : category === 'alphabetical_a_z'
                  ? 'Alphabetical A–Z'
                  : category;
          eligible = ALL_PHRASES.filter(item => item.category === category);
          examTitle = `${label} Exam`;
          break;
        }
        case 'ALPHABET_EXAM': {
          const letters = examSelectedLetters;
          eligible = ALL_PHRASES.filter(item => letters.has(item.firstLetter));
          const sortedLetters = Array.from(letters).sort();
          examTitle = `Letters ${sortedLetters.join(', ')} Exam`;
          break;
        }
        case 'INCORRECT_PRACTICE': {
          const wrongIds = new Set(
            Object.values(userDataMap)
              .filter(data => data.incorrectCount > 0)
              .map(data => data.phraseId),
          );
          eligible = ALL_PHRASES.filter(item => wrongIds.has(item.id));
          examTitle = 'Incorrect / Weak Items Revision';
          break;
        }
        case 'BOOKMARKED_PRACTICE': {
          const savedIds = new Set(
            Object.values(userDataMap)
              .filter(data => data.isBookmarked)
              .map(data => data.phraseId),
          );
          eligible = ALL_PHRASES.filter(item => savedIds.has(item.id));
          examTitle = 'Bookmarked Phrases Practice';
          break;
        }
        case 'ALL_PRACTICE':
          eligible = ALL_PHRASES;
          examTitle = 'Comprehensive Exam (All 421 Phrases)';
          break;
      }

      if (eligible.length === 0) return;
      const questions = generateQuiz(eligible, examQuestionCount, examShuffle);
      if (questions.length === 0) return;

      setQuizState({
        ...emptyQuizState(),
        isActive: true,
        questions,
        examTitle,
      });
    },
    [
      examCategoryChoice,
      examQuestionCount,
      examSelectedLetters,
      examSelectedParts,
      examShuffle,
      selectedExamMode,
      userDataMap,
    ],
  );

  const selectOption = useCallback((optionIndex: number) => {
    setQuizState(current => {
      if (current.isAnswerSubmitted) return current;
      return { ...current, selectedOptionIndex: optionIndex };
    });
  }, []);

  const submitAnswer = useCallback(() => {
    const current = quizState;
    const selected = current.selectedOptionIndex;
    if (selected == null || current.isAnswerSubmitted) return;
    const question = current.questions[current.currentIndex];
    if (!question) return;

    const isCorrect = selected === question.correctIndex;
    setQuizState({
      ...current,
      isAnswerSubmitted: true,
      isCorrect,
      score: isCorrect ? current.score + 1 : current.score,
      wrongItems: isCorrect
        ? current.wrongItems
        : [...current.wrongItems, question.phraseItem],
    });

    recordAnswerResult(question.phraseItem.id, isCorrect);
    if (!isCorrect && autoPlayOnWrongAnswer) {
      const plays = Math.min(100, Math.max(1, examWrongAnswerRepeatCount));
      tts.playAllForPhrase(question.phraseItem, plays);
    }
  }, [
    autoPlayOnWrongAnswer,
    examWrongAnswerRepeatCount,
    quizState,
    recordAnswerResult,
    tts,
  ]);

  const nextQuestion = useCallback(() => {
    tts.stop();
    const current = quizState;

    if (current.currentIndex + 1 < current.questions.length) {
      setQuizState({
        ...current,
        currentIndex: current.currentIndex + 1,
        selectedOptionIndex: null,
        isAnswerSubmitted: false,
        isCorrect: false,
      });
      return;
    }

    const total = current.questions.length;
    const correct = current.score;
    const percentage = total > 0 ? Math.floor((correct * 100) / total) : 0;
    setQuizState({ ...current, isCompleted: true });
    setProgress(previous => {
      const nextId =
        previous.examResults.reduce((max, item) => Math.max(max, item.id), 0) + 1;
      const result: ExamResult = {
        id: nextId,
        timestamp: Date.now(),
        examTitle: current.examTitle,
        totalQuestions: total,
        correctAnswers: correct,
        scorePercentage: percentage,
      };
      return {
        ...previous,
        examResults: [result, ...previous.examResults].slice(0, 30),
      };
    });
  }, [quizState, tts]);

  const exitQuiz = useCallback(() => {
    tts.stop();
    setQuizState(emptyQuizState());
  }, [tts]);

  const resetProgress = useCallback(
    (onComplete?: () => void) => {
      tts.stop();
      setProgress(emptyProgress());
      setQuizState(emptyQuizState());
      onComplete?.();
    },
    [tts],
  );

  const setTab = useCallback((tab: AppNavTab) => setCurrentTab(tab), []);

  const value: AppContextValue = {
    hydrated,
    allPhrases: ALL_PHRASES,
    userDataMap,
    examResults,
    todayLog,
    currentTab,
    setTab,
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
    filteredPhrases,
    clearFilters,
    selectedExamMode,
    setSelectedExamMode,
    examCategoryChoice,
    setExamCategoryChoice,
    examSelectedLetters,
    setExamSelectedLetters,
    examSelectedParts,
    setExamSelectedParts,
    examQuestionCount,
    setExamQuestionCount,
    examShuffle,
    setExamShuffle,
    examWrongAnswerRepeatCount,
    setExamWrongAnswerRepeatCount,
    quizState,
    globalDefaultRepeatCount,
    setGlobalDefaultRepeatCount,
    autoPlayOnWrongAnswer,
    setAutoPlayOnWrongAnswer,
    toggleBookmark,
    toggleMastered,
    playAllForPhrase,
    playEnglishForPhrase,
    playPhraseWithCount,
    playPronouncePhrase,
    updatePhraseRepeatPreference,
    startExam,
    selectOption,
    submitAnswer,
    nextQuestion,
    exitQuiz,
    resetProgress,
    tts,
    ttsState,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
