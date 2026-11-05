import type {
  IQuizQuestionResult,
  IQuizResponse,
  QuizQuestionStatus,
  ScoredQuestion,
} from "../types/quiz";
import {
  scoreMultipleChoice,
  scoreShortAnswer,
  scoreSingleChoice,
  type ScoreResult,
} from "./questionScoring";

const statusMap: Record<ScoreResult["status"], QuizQuestionStatus> = {
  correct: "CORRECT",
  partially_correct: "PARTIAL",
  incorrect: "INCORRECT",
};

const getQuestionMaxPossiblePoints = (question: ScoredQuestion): number => {
  if (question.type === "SHORT_ANSWER") {
    return question.correctPoints;
  }

  const correctOptions = question.options.filter((option) => option.isCorrect);

  if (question.type === "SINGLE_CHOICE" && correctOptions.length !== 1) {
    throw new Error("Single Choice requires one correct option");
  }

  if (correctOptions.length === 0) {
    throw new Error("Question must contain a correct option");
  }

  return correctOptions.reduce((total, option) => total + option.points, 0);
};

const gradeQuizQuestion = (
  question: ScoredQuestion,
  response?: IQuizResponse,
): IQuizQuestionResult => {
  const maxPossiblePoints = getQuestionMaxPossiblePoints(question);

  const createResult = (
    status: QuizQuestionStatus,
    awardedPoints: number,
  ): IQuizQuestionResult => ({
    questionId: question.id,
    status,
    awardedPoints,
    maxPossiblePoints,
  });

  if (!response) {
    return createResult("UNANSWERED", 0);
  }

  if (response.type !== question.type) {
    throw new Error(`Response type does not match question ${question.id}`);
  }

  if (question.type === "SINGLE_CHOICE" && response.type === "SINGLE_CHOICE") {
    if (response.selectedOptionId === null) {
      return createResult("UNANSWERED", 0);
    }

    const score = scoreSingleChoice(question, response.selectedOptionId);

    return createResult(statusMap[score.status], score.points);
  }
  if (
    question.type === "MULTIPLE_CHOICE" &&
    response.type === "MULTIPLE_CHOICE"
  ) {
    const uniqueSelectedOptionIds = [...new Set(response.selectedOptionIds)];

    if (uniqueSelectedOptionIds.length === 0) {
      return createResult("UNANSWERED", 0);
    }
    const score = scoreMultipleChoice(question, uniqueSelectedOptionIds);

    return createResult(statusMap[score.status], score.points);
  }
  if (question.type === "SHORT_ANSWER" && response.type === "SHORT_ANSWER") {
    if (response.answerText.trim().length === 0) {
      return createResult("UNANSWERED", 0);
    }

    const score = scoreShortAnswer(question, response.answerText);

    return createResult(statusMap[score.status], score.points);
  }
  throw new Error("Unsupported question response");
};

// Grade the entire quiz
