import type {
  IQuizGradingSummary,
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
export const gradeQuiz = (
  questions: ScoredQuestion[],
  responses: IQuizResponse[],
): IQuizGradingSummary => {
  if (questions.length === 0) {
    throw new Error("Cannot grade an empty quiz");
  }

  const questionIds = new Set(questions.map((question) => question.id));

  if (questionIds.size !== questions.length) {
    throw new Error("Quiz contains duplicate questions");
  }

  const responsesByQuestionId = new Map<string, IQuizResponse>();

  for (const response of responses) {
    if (!questionIds.has(response.questionId)) {
      throw new Error("Response contains an unknown question");
    }
    if (responsesByQuestionId.has(response.questionId)) {
      throw new Error("Duplicate response for one question");
    }
    responsesByQuestionId.set(response.questionId, response);
  }

  const results = questions.map((question) =>
    gradeQuizQuestion(question, responsesByQuestionId.get(question.id)),
  );

  const totalPoints = results.reduce(
    (total, result) => total + result.awardedPoints,
    0,
  );

  const maxPossiblePoints = results.reduce(
    (total, result) => total + result.maxPossiblePoints,
    0,
  );

  const correctQuestionCount = results.filter(
    (result) => result.status === "CORRECT",
  ).length;

  const accuracyPercent = (correctQuestionCount / questions.length) * 100;

  return { results, totalPoints, maxPossiblePoints, accuracyPercent };
};
