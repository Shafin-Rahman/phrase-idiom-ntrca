export type Category =
  | 'previous_bcs'
  | 'previous_ntrca'
  | 'alphabetical_a_z'
  | 'previous_other_exams';

export type AppNavTab = 'HOME' | 'STUDY' | 'EXAM' | 'REVIEW' | 'SETTINGS';

export type ExamModeType =
  | 'SET_EXAM'
  | 'CATEGORY_EXAM'
  | 'ALPHABET_EXAM'
  | 'INCORRECT_PRACTICE'
  | 'BOOKMARKED_PRACTICE'
  | 'ALL_PRACTICE';

export interface ExamHistoryItem {
  examCategory: string | null;
  examName: string | null;
  year: string | null;
  questionNumber: number | null;
  sourcePage: number | null;
}

export interface PhraseItem {
  id: string;
  phrase: string;
  type: string;
  meaningBn: string[];
  meaningEn: string[];
  example: string[];
  examHistory: ExamHistoryItem[];
  sourcePages: number[];
  sourceText: string[];
  category: Category;
  sourceParts: number[];
  mnemonic: string;
  memorizationTip: string;
  primaryMeaningBn: string;
  fullMeaningBn: string;
  primaryMeaningEn: string;
  fullMeaningEn: string;
  categoryLabel: string;
  firstLetter: string;
}

export interface QuizQuestion {
  id: string;
  phraseItem: PhraseItem;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface PhraseUserData {
  phraseId: string;
  isBookmarked: boolean;
  isMastered: boolean;
  studyCount: number;
  correctCount: number;
  incorrectCount: number;
  lastStudiedAt: number;
  customRepeatCount: number;
  needsRevision: boolean;
}

export interface ExamResult {
  id: number;
  timestamp: number;
  examTitle: string;
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
}

export interface DailyStudyLog {
  dateString: string;
  count: number;
  target: number;
}

export interface QuizState {
  isActive: boolean;
  questions: QuizQuestion[];
  currentIndex: number;
  selectedOptionIndex: number | null;
  isAnswerSubmitted: boolean;
  isCorrect: boolean;
  score: number;
  wrongItems: PhraseItem[];
  isCompleted: boolean;
  examTitle: string;
}

export const emptyQuizState = (): QuizState => ({
  isActive: false,
  questions: [],
  currentIndex: 0,
  selectedOptionIndex: null,
  isAnswerSubmitted: false,
  isCorrect: false,
  score: 0,
  wrongItems: [],
  isCompleted: false,
  examTitle: '',
});

export function displayBadge(item: ExamHistoryItem): string {
  let result = '';
  if (item.examName?.trim()) {
    result += item.examName;
  } else if (item.examCategory?.trim()) {
    result += item.examCategory;
  }
  if (item.year?.trim()) result += ` (${item.year})`;
  if (item.questionNumber != null && item.questionNumber > 0) {
    result += ` Q${item.questionNumber}`;
  }
  return result.trim() || item.examCategory || 'Exam';
}

export const emptyUserData = (phraseId: string): PhraseUserData => ({
  phraseId,
  isBookmarked: false,
  isMastered: false,
  studyCount: 0,
  correctCount: 0,
  incorrectCount: 0,
  lastStudiedAt: 0,
  customRepeatCount: 5,
  needsRevision: false,
});

export const EXAM_MODES: {
  id: ExamModeType;
  title: string;
  subtitle: string;
}[] = [
  {
    id: 'SET_EXAM',
    title: 'Study Set Exam',
    subtitle: 'Select one or more parts (1–21)',
  },
  {
    id: 'CATEGORY_EXAM',
    title: 'Category Exam',
    subtitle: 'BCS, NTRCA, or Alphabetical A–Z',
  },
  {
    id: 'ALPHABET_EXAM',
    title: 'Alphabet Exam',
    subtitle: 'Filter by specific letters (A, B, C...)',
  },
  {
    id: 'INCORRECT_PRACTICE',
    title: 'Incorrect Review',
    subtitle: 'Re-test phrases you got wrong',
  },
  {
    id: 'BOOKMARKED_PRACTICE',
    title: 'Bookmarked Practice',
    subtitle: 'Test your saved favorites',
  },
  {
    id: 'ALL_PRACTICE',
    title: 'Full Dataset Practice',
    subtitle: 'Random mixed exam from all 421 phrases',
  },
];

export const TAB_TITLES: Record<AppNavTab, string> = {
  HOME: 'Dashboard',
  STUDY: 'Study & Audio',
  EXAM: 'Exam Practice',
  REVIEW: 'Revision',
  SETTINGS: 'Settings',
};
