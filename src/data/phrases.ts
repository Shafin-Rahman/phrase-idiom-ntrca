import phrasesJson from '../../assets/phrase_idioms.json';
import mappingJson from '../../assets/phrase_mapping.json';
import { getExamTip, getMnemonic } from './mnemonics';
import {
  Category,
  ExamHistoryItem,
  PhraseItem,
  QuizQuestion,
  displayBadge,
} from '../types';

interface RawExamHistory {
  exam_category?: string | null;
  exam_name?: string | null;
  year?: string | null;
  question_number?: number | null;
  source_page?: number | null;
}

interface RawPhrase {
  id?: string;
  phrase?: string;
  type?: string;
  meaning_bn?: (string | null)[];
  meaning_en?: (string | null)[];
  example?: (string | null)[];
  exam_history?: RawExamHistory[];
  source_pages?: number[];
  source_text?: (string | null)[];
}

interface RawMapping {
  final_id?: string;
  source_part?: number;
}

const CATEGORIES: Category[] = [
  'previous_bcs',
  'previous_ntrca',
  'alphabetical_a_z',
  'previous_other_exams',
];

const CATEGORY_LABELS: Record<Category, string> = {
  previous_bcs: 'Previous BCS',
  previous_ntrca: 'Previous NTRCA',
  alphabetical_a_z: 'Alphabetical A–Z',
  previous_other_exams: 'Previous Other Exams',
};

function cleanList(values?: (string | null)[]): string[] {
  if (!Array.isArray(values)) return [];
  return values
    .map(value => (value == null ? '' : String(value).trim()))
    .filter(value => value.length > 0);
}

function buildPhrases(): PhraseItem[] {
  const partMapping = new Map<string, Set<number>>();
  const mappings = (mappingJson as { mappings?: RawMapping[] }).mappings ?? [];
  for (const mapping of mappings) {
    const finalId = mapping.final_id?.trim();
    if (!finalId) continue;
    const bucket = partMapping.get(finalId) ?? new Set<number>();
    bucket.add(mapping.source_part ?? 1);
    partMapping.set(finalId, bucket);
  }

  const root = phrasesJson as unknown as Record<string, RawPhrase[] | undefined>;
  const result: PhraseItem[] = [];

  for (const category of CATEGORIES) {
    const items = root[category];
    if (!Array.isArray(items)) continue;

    for (const raw of items) {
      const id = raw.id ?? '';
      const phrase = (raw.phrase ?? '').trim();
      const type = raw.type ?? 'idiom';
      const meaningBn = cleanList(raw.meaning_bn);
      const meaningEn = cleanList(raw.meaning_en);
      const example = cleanList(raw.example);

      const examHistory: ExamHistoryItem[] = (raw.exam_history ?? []).map(item => ({
        examCategory: item.exam_category?.trim() || null,
        examName: item.exam_name?.trim() || null,
        year: item.year?.trim() || null,
        questionNumber: item.question_number ?? null,
        sourcePage: item.source_page ?? null,
      }));

      const sourcePages = Array.isArray(raw.source_pages) ? raw.source_pages : [];
      const sourceText = cleanList(raw.source_text);
      const sourceParts = Array.from(partMapping.get(id) ?? new Set([1])).sort(
        (a, b) => a - b,
      );

      const primaryBn = meaningBn[0] ?? '';
      const primaryEn = meaningEn[0] ?? '';
      const examBadge = examHistory[0] ? displayBadge(examHistory[0]) : null;

      result.push({
        id,
        phrase,
        type,
        meaningBn,
        meaningEn,
        example,
        examHistory,
        sourcePages,
        sourceText,
        category,
        sourceParts,
        mnemonic: getMnemonic(phrase, primaryBn, primaryEn),
        memorizationTip: getExamTip(phrase, primaryBn, primaryEn, examBadge),
        primaryMeaningBn: primaryBn,
        fullMeaningBn: meaningBn.join(' • '),
        primaryMeaningEn: primaryEn,
        fullMeaningEn: meaningEn.join('; '),
        categoryLabel: CATEGORY_LABELS[category],
        firstLetter: phrase.trim().charAt(0).toUpperCase() || 'A',
      });
    }
  }

  return result;
}

export const ALL_PHRASES: PhraseItem[] = buildPhrases();

export const PHRASE_BY_ID: Record<string, PhraseItem> = Object.fromEntries(
  ALL_PHRASES.map(item => [item.id, item]),
);

export function shuffle<T>(values: T[]): T[] {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function generateQuiz(
  sourceItems: PhraseItem[],
  questionCount = 10,
  shouldShuffle = true,
): QuizQuestion[] {
  if (sourceItems.length === 0) return [];

  const all = ALL_PHRASES;
  const pool = shouldShuffle ? shuffle(sourceItems) : [...sourceItems];
  const selected = pool.slice(0, Math.min(questionCount, pool.length));
  const questions: QuizQuestion[] = [];

  for (const item of selected) {
    const correctMeaning = item.primaryMeaningBn || item.primaryMeaningEn;
    if (!correctMeaning.trim()) continue;

    const otherItems = all.filter(other => other.id !== item.id);
    const distractorPool = Array.from(
      new Set(
        otherItems
          .map(other => other.primaryMeaningBn || other.primaryMeaningEn)
          .filter(
            otherMeaning =>
              otherMeaning.trim().length > 0 &&
              otherMeaning !== correctMeaning &&
              !item.meaningBn.includes(otherMeaning) &&
              !item.meaningEn.includes(otherMeaning),
          ),
      ),
    );

    const distractors = shuffle(distractorPool).slice(0, 3);
    if (distractors.length < 2) continue;

    const options = shuffle(
      Array.from(new Set([...distractors, correctMeaning])),
    );
    const correctIndex = options.indexOf(correctMeaning);

    const explanationParts = [`Phrase: "${item.phrase}"`];
    if (item.meaningBn.length > 0) {
      explanationParts.push(`• Bengali: ${item.fullMeaningBn}`);
    }
    if (item.meaningEn.length > 0) {
      explanationParts.push(`• English: ${item.fullMeaningEn}`);
    }
    const exam = item.examHistory[0]
      ? displayBadge(item.examHistory[0])
      : null;
    if (exam) explanationParts.push(`• Exam: ${exam}`);
    if (item.memorizationTip.trim()) {
      explanationParts.push(`• Memory Tip: ${item.memorizationTip}`);
    }

    questions.push({
      id: item.id,
      phraseItem: item,
      prompt: `What is the meaning of: "${item.phrase}"?`,
      options,
      correctIndex,
      explanation: explanationParts.join('\n'),
    });
  }

  return questions;
}
