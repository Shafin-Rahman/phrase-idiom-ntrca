import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import type { ComponentRef } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import { useApp } from '../AppContext';
import { BadgeChip, Card, ProgressBar, withAlpha } from '../components/ui';
import {
  AmberGold,
  ErrorRose,
  ErrorRoseLight,
  SuccessGreen,
  SuccessGreenLight,
  useAppTheme,
} from '../theme';
import { EXAM_MODES, QuizQuestion, displayBadge } from '../types';

export function ExamScreen() {
  const { quizState } = useApp();

  if (quizState.isActive) {
    return quizState.isCompleted ? <ExamSummaryView /> : <ActiveQuizView />;
  }
  return <ExamSetupView />;
}

function ExamSetupView() {
  const {
    userDataMap,
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
    autoPlayOnWrongAnswer,
    setAutoPlayOnWrongAnswer,
    startExam,
  } = useApp();
  const theme = useAppTheme();

  const incorrectCount = Object.values(userDataMap).filter(
    data => data.incorrectCount > 0,
  ).length;
  const bookmarkedCount = Object.values(userDataMap).filter(
    data => data.isBookmarked,
  ).length;

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.setupContent}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.introCard,
          { backgroundColor: withAlpha(theme.primaryContainer, 0.5) },
        ]}
      >
        <View style={styles.introRow}>
          <MaterialIcons name="quiz" size={32} color={theme.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.introTitle, { color: theme.onSurface }]}>
              Exam Practice & MCQ Trainer
            </Text>
            <Text style={[styles.introSubtitle, { color: theme.onSurfaceVariant }]}>
              Authentic questions with auto-audio repetition on mistakes
            </Text>
          </View>
        </View>
      </View>

      <Text style={[styles.stepTitle, { color: theme.onSurface }]}>
        1. Choose Exam Mode
      </Text>

      <View style={{ gap: 8 }}>
        {EXAM_MODES.map(mode => {
          const badge =
            mode.id === 'INCORRECT_PRACTICE'
              ? `${incorrectCount} items`
              : mode.id === 'BOOKMARKED_PRACTICE'
                ? `${bookmarkedCount} saved`
                : undefined;
          return (
            <ExamModeOptionCard
              key={mode.id}
              title={mode.title}
              subtitle={mode.subtitle}
              badge={badge}
              selected={selectedExamMode === mode.id}
              onPress={() => setSelectedExamMode(mode.id)}
            />
          );
        })}
      </View>

      {selectedExamMode === 'CATEGORY_EXAM' ? (
        <View style={{ gap: 8 }}>
          <Text style={[styles.filterTitle, { color: theme.onSurface }]}>
            Select Category:
          </Text>
          <View style={styles.twoColumn}>
            <CategoryRadioCard
              label="Previous BCS (17)"
              selected={examCategoryChoice === 'previous_bcs'}
              onPress={() => setExamCategoryChoice('previous_bcs')}
              style={{ flex: 1 }}
            />
            <CategoryRadioCard
              label="Previous NTRCA (106)"
              selected={examCategoryChoice === 'previous_ntrca'}
              onPress={() => setExamCategoryChoice('previous_ntrca')}
              style={{ flex: 1 }}
            />
          </View>
          <CategoryRadioCard
            label="Alphabetical A–Z (298 items)"
            selected={examCategoryChoice === 'alphabetical_a_z'}
            onPress={() => setExamCategoryChoice('alphabetical_a_z')}
          />
        </View>
      ) : null}

      {selectedExamMode === 'SET_EXAM' ? (
        <View style={{ gap: 8 }}>
          <Text style={[styles.filterTitle, { color: theme.onSurface }]}>
            Select Study Sets / Parts (1 to 21):
          </Text>
          <View style={styles.wrapRow}>
            {Array.from({ length: 21 }, (_, index) => index + 1).map(part => {
              const selected = examSelectedParts.has(part);
              return (
                <FilterChip
                  key={part}
                  label={`Part ${part}`}
                  selected={selected}
                  onPress={() => {
                    const next = new Set(examSelectedParts);
                    if (selected) {
                      if (next.size > 1) next.delete(part);
                    } else {
                      next.add(part);
                    }
                    setExamSelectedParts(next);
                  }}
                  fontSize={11}
                />
              );
            })}
          </View>
        </View>
      ) : null}

      {selectedExamMode === 'ALPHABET_EXAM' ? (
        <View style={{ gap: 8 }}>
          <Text style={[styles.filterTitle, { color: theme.onSurface }]}>
            Select Starting Letters:
          </Text>
          <View style={styles.wrapRow}>
            {Array.from({ length: 26 }, (_, index) =>
              String.fromCharCode(65 + index),
            ).map(letter => {
              const selected = examSelectedLetters.has(letter);
              return (
                <FilterChip
                  key={letter}
                  label={letter}
                  selected={selected}
                  onPress={() => {
                    const next = new Set(examSelectedLetters);
                    if (selected) {
                      if (next.size > 1) next.delete(letter);
                    } else {
                      next.add(letter);
                    }
                    setExamSelectedLetters(next);
                  }}
                  fontSize={12}
                />
              );
            })}
          </View>
        </View>
      ) : null}

      <Text style={[styles.stepTitle, { color: theme.onSurface }]}>
        2. Exam Settings & Audio Repetition
      </Text>

      <Card theme={theme} elevation={1} style={{ borderRadius: 14 }}>
        <View style={styles.settingsPadding}>
          <View style={styles.rowBetween}>
            <Text style={[styles.settingLabel, { color: theme.onSurface }]}>
              Number of Questions:
            </Text>
            <View style={styles.countRow}>
              {[5, 10, 15, 20].map(count => {
                const selected = examQuestionCount === count;
                return (
                  <Pressable
                    key={count}
                    onPress={() => setExamQuestionCount(count)}
                    style={{
                      borderRadius: 6,
                      backgroundColor: selected
                        ? theme.primary
                        : theme.surfaceVariant,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '700',
                        color: selected ? '#FFFFFF' : theme.onSurface,
                      }}
                    >
                      {count}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={[styles.rowBetween, { marginTop: 12 }]}>
            <Text style={[styles.settingLabel, { color: theme.onSurface }]}>
              Shuffle Question Order
            </Text>
            <Switch
              value={examShuffle}
              onValueChange={setExamShuffle}
              trackColor={{
                true: withAlpha(theme.primary, 0.5),
                false: theme.surfaceVariant,
              }}
              thumbColor={examShuffle ? theme.primary : '#F4F4F5'}
            />
          </View>

          <View style={[styles.rowBetween, { marginTop: 12 }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: theme.onSurface }]}>
                Auto-play on Incorrect Answer
              </Text>
              <Text style={[styles.settingHint, { color: theme.onSurfaceVariant }]}>
                Plays the phrase immediately to reinforce memory
              </Text>
            </View>
            <Switch
              value={autoPlayOnWrongAnswer}
              onValueChange={setAutoPlayOnWrongAnswer}
              trackColor={{
                true: withAlpha(theme.primary, 0.5),
                false: theme.surfaceVariant,
              }}
              thumbColor={autoPlayOnWrongAnswer ? theme.primary : '#F4F4F5'}
            />
          </View>

          {autoPlayOnWrongAnswer ? (
            <View style={[styles.rowBetween, { marginTop: 10 }]}>
              <Text style={[styles.settingLabel, { color: theme.onSurface }]}>
                Repetition on Mistake:
              </Text>
              <View style={styles.stepper}>
                <Pressable
                  onPress={() => {
                    if (examWrongAnswerRepeatCount > 1) {
                      setExamWrongAnswerRepeatCount(examWrongAnswerRepeatCount - 1);
                    }
                  }}
                  style={styles.stepButton}
                >
                  <Text style={[styles.stepText, { color: theme.onSurface }]}>−</Text>
                </Pressable>
                <View
                  style={[
                    styles.repeatBox,
                    { backgroundColor: theme.primaryContainer },
                  ]}
                >
                  <Text style={[styles.repeatText, { color: theme.primary }]}>
                    {examWrongAnswerRepeatCount} plays
                  </Text>
                </View>
                <Pressable
                  onPress={() => {
                    if (examWrongAnswerRepeatCount < 50) {
                      setExamWrongAnswerRepeatCount(examWrongAnswerRepeatCount + 1);
                    }
                  }}
                  style={styles.stepButton}
                >
                  <Text style={[styles.stepText, { color: theme.onSurface }]}>+</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </View>
      </Card>

      <Pressable
        onPress={() => startExam()}
        style={({ pressed }) => [
          styles.beginButton,
          { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <MaterialIcons name="play-arrow" size={22} color="#FFFFFF" />
        <Text style={styles.beginText}>Begin Exam</Text>
      </Pressable>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

function ExamModeOptionCard({
  title,
  subtitle,
  badge,
  selected,
  onPress,
}: {
  title: string;
  subtitle: string;
  badge?: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.modeCard,
        {
          backgroundColor: selected ? theme.primaryContainer : theme.surface,
          borderColor: selected
            ? theme.primary
            : withAlpha(theme.outline, 0.2),
          borderWidth: selected ? 1.5 : 1,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <View style={{ flex: 1 }}>
        <View style={styles.modeTitleRow}>
          <Text style={[styles.modeTitle, { color: theme.onSurface }]}>{title}</Text>
          {badge ? (
            <View
              style={[
                styles.modeBadge,
                { backgroundColor: withAlpha(theme.secondary, 0.15) },
              ]}
            >
              <Text style={[styles.modeBadgeText, { color: theme.secondary }]}>
                {badge}
              </Text>
            </View>
          ) : null}
        </View>
        <Text style={[styles.modeSubtitle, { color: theme.onSurfaceVariant }]}>
          {subtitle}
        </Text>
      </View>
      <View
        style={[
          styles.radio,
          {
            borderColor: selected
              ? theme.primary
              : withAlpha(theme.outline, 0.4),
            backgroundColor: selected ? theme.primary : 'transparent',
          },
        ]}
      />
    </Pressable>
  );
}

function CategoryRadioCard({
  label,
  selected,
  onPress,
  style,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  style?: object;
}) {
  const theme = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.categoryCard,
        {
          backgroundColor: selected ? theme.primaryContainer : theme.surface,
          borderColor: selected
            ? theme.primary
            : withAlpha(theme.outline, 0.25),
          opacity: pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: selected ? '700' : '500',
          color: selected ? theme.primary : theme.onSurface,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function FilterChip({
  label,
  selected,
  onPress,
  fontSize,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  fontSize: number;
}) {
  const theme = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterChip,
        {
          backgroundColor: selected ? theme.primary : theme.surfaceVariant,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <Text
        style={{
          fontSize,
          fontWeight: selected ? '700' : '500',
          color: selected ? '#FFFFFF' : theme.onSurface,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function ActiveQuizView() {
  const {
    quizState,
    selectOption,
    submitAnswer,
    nextQuestion,
    exitQuiz,
    examWrongAnswerRepeatCount,
    playAllForPhrase,
    playEnglishForPhrase,
    playPhraseWithCount,
    tts,
    ttsState,
  } = useApp();
  const theme = useAppTheme();
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [quizState.currentIndex]);

  const currentQuestion: QuizQuestion | undefined =
    quizState.questions[quizState.currentIndex];
  if (!currentQuestion) return null;

  const total = quizState.questions.length;
  const currentNumber = quizState.currentIndex + 1;
  const item = currentQuestion.phraseItem;
  const examBadge = item.examHistory[0]
    ? displayBadge(item.examHistory[0])
    : null;

  return (
    <ScrollView
      ref={scrollRef}
      style={{ flex: 1 }}
      contentContainerStyle={styles.quizContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.rowBetween}>
        <Text style={[styles.questionCounter, { color: theme.primary }]}>
          Question {currentNumber} of {total}
        </Text>
        <View style={styles.quizHeaderRight}>
          <Text style={[styles.scoreText, { color: SuccessGreen }]}>
            Score: {quizState.score}
          </Text>
          <Pressable
            accessibilityLabel="Exit Quiz"
            onPress={exitQuiz}
            hitSlop={6}
            style={styles.exitButton}
          >
            <MaterialIcons name="close" size={22} color={theme.onSurfaceVariant} />
          </Pressable>
        </View>
      </View>

      <ProgressBar
        progress={total > 0 ? currentNumber / total : 0}
        color={theme.primary}
        trackColor={theme.surfaceVariant}
        height={6}
      />

      <Card theme={theme} style={{ borderRadius: 16 }}>
        <View style={{ padding: 18 }}>
          <Text style={[styles.questionLead, { color: theme.onSurfaceVariant }]}>
            What is the meaning of:
          </Text>
          <Text style={[styles.questionPhrase, { color: theme.primary }]}>
            "{item.phrase}"
          </Text>

          <View style={[styles.rowBetween, { marginTop: 10 }]}>
            <View style={styles.quizAudioRow}>
              <Pressable
                onPress={() => playAllForPhrase(item, 1)}
                style={({ pressed }) => [
                  styles.smallPrimary,
                  { backgroundColor: theme.primary, opacity: pressed ? 0.75 : 1 },
                ]}
              >
                <MaterialIcons name="volume-up" size={16} color="#FFFFFF" />
                <Text style={styles.smallPrimaryText}>Play All</Text>
              </Pressable>
              <Pressable
                onPress={() => playPhraseWithCount(item.phrase, null, 1)}
                style={({ pressed }) => [
                  styles.smallOutline,
                  {
                    borderColor: withAlpha(theme.primary, 0.4),
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text style={{ color: theme.primary, fontSize: 12 }}>Pronounce</Text>
              </Pressable>
            </View>
            {examBadge ? (
              <BadgeChip
                text={examBadge}
                textColor={theme.primary}
                bgColor={withAlpha(theme.primary, 0.1)}
              />
            ) : null}
          </View>
        </View>
      </Card>

      <Text style={[styles.selectLabel, { color: theme.onSurface }]}>
        Select the correct meaning:
      </Text>

      <View style={{ gap: 8 }}>
        {currentQuestion.options.map((option, index) => {
          const isSelected = quizState.selectedOptionIndex === index;
          const submitted = quizState.isAnswerSubmitted;
          const isCorrectOption = index === currentQuestion.correctIndex;

          const backgroundColor = submitted && isCorrectOption
            ? SuccessGreenLight
            : submitted && isSelected && !isCorrectOption
              ? ErrorRoseLight
              : isSelected
                ? theme.primaryContainer
                : theme.surface;
          const borderColor = submitted && isCorrectOption
            ? SuccessGreen
            : submitted && isSelected && !isCorrectOption
              ? ErrorRose
              : isSelected
                ? theme.primary
                : withAlpha(theme.outline, 0.25);
          const letterBg = submitted && isCorrectOption
            ? SuccessGreen
            : submitted && isSelected && !isCorrectOption
              ? ErrorRose
              : isSelected
                ? theme.primary
                : theme.surfaceVariant;

          return (
            <Pressable
              key={`${currentQuestion.id}-option-${index}`}
              disabled={submitted}
              onPress={() => selectOption(index)}
              style={({ pressed }) => [
                styles.optionCard,
                {
                  backgroundColor,
                  borderColor,
                  opacity: pressed && !submitted ? 0.8 : 1,
                },
              ]}
            >
              <View style={[styles.optionLetter, { backgroundColor: letterBg }]}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color:
                      isSelected || (submitted && isCorrectOption)
                        ? '#FFFFFF'
                        : theme.onSurface,
                  }}
                >
                  {String.fromCharCode(65 + index)}
                </Text>
              </View>
              <Text
                style={[
                  styles.optionText,
                  {
                    color: theme.onSurface,
                    fontWeight:
                      isSelected || (submitted && isCorrectOption)
                        ? '700'
                        : '400',
                  },
                ]}
              >
                {option}
              </Text>
              {submitted && isCorrectOption ? (
                <MaterialIcons name="check" size={20} color={SuccessGreen} />
              ) : submitted && isSelected ? (
                <MaterialIcons name="close" size={20} color={ErrorRose} />
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {quizState.isAnswerSubmitted && !quizState.isCorrect ? (
        <View style={styles.wrongBanner}>
          <View style={styles.rowBetween}>
            <View style={styles.repetitionTitleRow}>
              <MaterialIcons name="volume-up" size={22} color={ErrorRose} />
              <Text style={styles.repetitionTitle}>Repetition Reinforcement</Text>
            </View>

            {ttsState.isPlaying ? (
              <View style={styles.smallButtonRow}>
                <Pressable
                  onPress={() => (ttsState.isPaused ? tts.resume() : tts.pause())}
                  style={({ pressed }) => [
                    styles.tinyTonal,
                    { backgroundColor: ErrorRoseLight, opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <Text style={{ color: ErrorRose, fontSize: 11 }}>
                    {ttsState.isPaused ? 'Resume' : 'Pause'}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => tts.stop()}
                  style={({ pressed }) => [
                    styles.tinyStop,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <MaterialIcons name="stop" size={16} color="#FFFFFF" />
                  <Text style={styles.tinyStopText}>Stop</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={() =>
                  playAllForPhrase(item, Math.max(1, examWrongAnswerRepeatCount))
                }
                style={({ pressed }) => [
                  styles.tinyOutline,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <MaterialIcons name="refresh" size={16} color={ErrorRose} />
                <Text style={{ color: ErrorRose, fontSize: 11 }}>
                  Replay All ({examWrongAnswerRepeatCount}×)
                </Text>
              </Pressable>
            )}
          </View>

          <Text style={styles.repetitionBody}>
            {ttsState.isPlaying
              ? `Playing cycle ${ttsState.currentCycle} of ${ttsState.totalCycles} • Speaking: ${
                  ttsState.currentFieldTitle || 'Phrase'
                }`
              : `Complete sequence repeated ${examWrongAnswerRepeatCount} times for deep memory retention.`}
          </Text>

          {ttsState.isPlaying ? (
            <View style={{ marginTop: 6 }}>
              <ProgressBar
                progress={
                  ttsState.totalCycles > 0
                    ? ttsState.currentCycle / ttsState.totalCycles
                    : 0
                }
                color={ErrorRose}
                trackColor="#FECDD3"
                height={4}
              />
            </View>
          ) : null}

          {ttsState.bengaliVoiceWarning ? (
            <Text style={styles.repetitionWarning}>
              ⚠️ Bengali TTS missing on device. Meaning displayed on screen.
            </Text>
          ) : null}
        </View>
      ) : null}

      {quizState.isAnswerSubmitted ? (
        <View
          style={[
            styles.explanationCard,
            { backgroundColor: withAlpha(theme.surfaceVariant, 0.5) },
          ]}
        >
          <View style={styles.rowBetween}>
            <Text
              style={[
                styles.resultText,
                { color: quizState.isCorrect ? SuccessGreen : ErrorRose },
              ]}
            >
              {quizState.isCorrect ? '✓ Correct Answer!' : '✕ Incorrect Answer'}
            </Text>
            <View style={styles.smallButtonRow}>
              <Pressable
                onPress={() => playAllForPhrase(item, 1)}
                style={({ pressed }) => [
                  styles.tinyPrimary,
                  { backgroundColor: theme.primary, opacity: pressed ? 0.75 : 1 },
                ]}
              >
                <MaterialIcons name="volume-up" size={14} color="#FFFFFF" />
                <Text style={styles.tinyPrimaryText}>Play All</Text>
              </Pressable>
              <Pressable
                onPress={() => playEnglishForPhrase(item, 1)}
                style={({ pressed }) => [
                  styles.tinyOutline,
                  {
                    borderColor: withAlpha(theme.primary, 0.4),
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text style={{ color: theme.primary, fontSize: 11 }}>English</Text>
              </Pressable>
            </View>
          </View>
          <Text style={[styles.explanationText, { color: theme.onSurface }]}>
            {currentQuestion.explanation}
          </Text>
        </View>
      ) : null}

      {!quizState.isAnswerSubmitted ? (
        <Pressable
          disabled={quizState.selectedOptionIndex == null}
          onPress={submitAnswer}
          style={({ pressed }) => [
            styles.actionButton,
            {
              backgroundColor: theme.primary,
              opacity:
                quizState.selectedOptionIndex == null ? 0.4 : pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text style={styles.actionButtonText}>Confirm Answer</Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={nextQuestion}
          style={({ pressed }) => [
            styles.actionButton,
            { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Text style={styles.actionButtonText}>
            {currentNumber < total ? 'Next Question →' : 'View Results →'}
          </Text>
        </Pressable>
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

function ExamSummaryView() {
  const { quizState, setSelectedExamMode, startExam, exitQuiz, playAllForPhrase } =
    useApp();
  const theme = useAppTheme();

  const total = quizState.questions.length;
  const correct = quizState.score;
  const wrongCount = quizState.wrongItems.length;
  const percentage = total > 0 ? Math.floor((correct * 100) / total) : 0;

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.summaryContent}
      showsVerticalScrollIndicator={false}
    >
      <Card theme={theme} style={{ borderRadius: 20 }}>
        <View style={styles.summaryPadding}>
          <Text style={[styles.summaryTitle, { color: theme.onSurface }]}>
            {percentage >= 80
              ? '🏆 Excellent Mastery!'
              : percentage >= 50
                ? '👍 Good Effort!'
                : '📚 Needs Further Review'}
          </Text>

          <View
            style={[
              styles.scoreCircle,
              {
                backgroundColor:
                  percentage >= 70 ? SuccessGreenLight : ErrorRoseLight,
              },
            ]}
          >
            <Text
              style={[
                styles.scorePercent,
                { color: percentage >= 70 ? SuccessGreen : ErrorRose },
              ]}
            >
              {percentage}%
            </Text>
          </View>

          <Text style={[styles.summaryBody, { color: theme.onSurfaceVariant }]}>
            You scored {correct} out of {total} questions correctly.
          </Text>
          <Text style={[styles.summaryExamTitle, { color: theme.primary }]}>
            {quizState.examTitle}
          </Text>
        </View>
      </Card>

      {quizState.wrongItems.length > 0 ? (
        <Card theme={theme} style={{ borderRadius: 16, marginTop: 16 }}>
          <View style={{ padding: 16 }}>
            <Text style={[styles.reviewTitle, { color: ErrorRose }]}>
              Phrases to Review ({wrongCount}):
            </Text>
            <View style={{ marginTop: 8 }}>
              {quizState.wrongItems.map((item, index) => (
                <View
                  key={`${item.id}-wrong-${index}`}
                  style={styles.wrongItemRow}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.wrongPhrase, { color: theme.onSurface }]}>
                      {item.phrase}
                    </Text>
                    <Text
                      style={[styles.wrongMeaning, { color: theme.onSurfaceVariant }]}
                    >
                      {item.primaryMeaningBn}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => playAllForPhrase(item, 5)}
                    style={styles.wrongPlayButton}
                  >
                    <MaterialIcons
                      name="volume-up"
                      size={22}
                      color={theme.primary}
                    />
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        </Card>
      ) : null}

      <View style={styles.summaryActions}>
        {quizState.wrongItems.length > 0 ? (
          <Pressable
            onPress={() => {
              setSelectedExamMode('INCORRECT_PRACTICE');
              startExam('INCORRECT_PRACTICE');
            }}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: ErrorRose, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Text style={styles.actionButtonText}>
              Re-Test Incorrect Items Now
            </Text>
          </Pressable>
        ) : null}

        <Pressable
          onPress={exitQuiz}
          style={({ pressed }) => [
            styles.actionButton,
            { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Text style={styles.actionButtonText}>Back to Exams Setup</Text>
        </Pressable>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  setupContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 30,
  },
  introCard: {
    borderRadius: 16,
    padding: 16,
  },
  introRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  introTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  introSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  filterTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  modeCard: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  modeTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  modeBadge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  modeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  modeSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  twoColumn: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryCard: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  filterChip: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  settingsPadding: {
    padding: 14,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  settingHint: {
    fontSize: 11,
    marginTop: 2,
  },
  countRow: {
    flexDirection: 'row',
    gap: 6,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontSize: 16,
    fontWeight: '700',
  },
  repeatBox: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  repeatText: {
    fontSize: 12,
    fontWeight: '700',
  },
  beginButton: {
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  beginText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  quizContent: {
    padding: 16,
    gap: 14,
    paddingBottom: 24,
  },
  questionCounter: {
    fontSize: 14,
    fontWeight: '700',
  },
  quizHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scoreText: {
    fontSize: 13,
    fontWeight: '700',
  },
  exitButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionLead: {
    fontSize: 13,
  },
  questionPhrase: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 6,
  },
  quizAudioRow: {
    flexDirection: 'row',
    gap: 6,
    flexShrink: 1,
  },
  smallPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  smallPrimaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  smallOutline: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    justifyContent: 'center',
  },
  selectLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  optionCard: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionLetter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
    fontSize: 14,
  },
  wrongBanner: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: ErrorRose,
    backgroundColor: ErrorRoseLight,
    padding: 14,
  },
  repetitionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  repetitionTitle: {
    color: ErrorRose,
    fontSize: 14,
    fontWeight: '700',
  },
  smallButtonRow: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  tinyTonal: {
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  tinyStop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 6,
    backgroundColor: ErrorRose,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  tinyStopText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  tinyOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: withAlpha(ErrorRose, 0.4),
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  repetitionBody: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9F1239',
    marginTop: 6,
  },
  repetitionWarning: {
    fontSize: 10,
    color: AmberGold,
    marginTop: 4,
  },
  explanationCard: {
    borderRadius: 12,
    padding: 14,
  },
  resultText: {
    fontSize: 14,
    fontWeight: '700',
    flexShrink: 1,
  },
  tinyPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  tinyPrimaryText: {
    color: '#FFFFFF',
    fontSize: 11,
  },
  explanationText: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  actionButton: {
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  summaryContent: {
    padding: 16,
    paddingBottom: 30,
  },
  summaryPadding: {
    padding: 24,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  scoreCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  scorePercent: {
    fontSize: 26,
    fontWeight: '700',
  },
  summaryBody: {
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
  },
  summaryExamTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  reviewTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  wrongItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    gap: 8,
  },
  wrongPhrase: {
    fontSize: 13,
    fontWeight: '700',
  },
  wrongMeaning: {
    fontSize: 12,
  },
  wrongPlayButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryActions: {
    gap: 8,
    marginTop: 16,
  },
});
