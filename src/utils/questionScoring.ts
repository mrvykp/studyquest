import type {
  IMultipleChoiceQuestion,
  IShortAnswerQuestion,
  ISingleChoiceQuestion,
} from "../types/questions";
import { normalizeAnswer } from "./questionValidation";

export interface ScoreResult {
  status: "correct" | "partially_correct" | "incorrect";
  points: number;
}

export const scoreSingleChoice = (
  question: Pick<ISingleChoiceQuestion, "options">,
  selectedOptionId: string,
): ScoreResult => {
  const selectedOption = question.options.find(
    (option) => option.id === selectedOptionId,
  );

  if (!selectedOption) {
    throw new Error("Please select a valid option");
  }

  return {
    status: selectedOption.isCorrect ? "correct" : "incorrect",
    points: selectedOption.points,
  };
};

export const scoreMultipleChoice = (
  question: Pick<IMultipleChoiceQuestion, "options">,
  selectedOptionIds: string[],
): ScoreResult => {
  const selectedIds = new Set(selectedOptionIds);

  if (selectedIds.size === 0) {
    throw new Error("Please select at least one option");
  }

  const selectedOptions = question.options.filter((option) =>
    selectedIds.has(option.id),
  );

  if (selectedOptions.length !== selectedIds.size) {
    throw new Error("One or more selected options are invalid");
  }

  const points = selectedOptions.reduce(
    (total, option) => total + option.points,
    0,
  );

  const totalCorrectOptions = question.options.filter(
    (option) => option.isCorrect,
  ).length;

  const selectedCorrectOptions = selectedOptions.filter(
    (option) => option.isCorrect,
  ).length;

  const hasIncorrectSelection = selectedOptions.some(
    (option) => !option.isCorrect,
  );

  let status: ScoreResult["status"];

  if (
    !hasIncorrectSelection &&
    selectedCorrectOptions === totalCorrectOptions
  ) {
    status = "correct";
  } else if (
    !hasIncorrectSelection &&
    selectedCorrectOptions < totalCorrectOptions
  ) {
    status = "partially_correct";
  } else {
    status = "incorrect";
  }

  return {
    status,
    points,
  };
};

export const scoreShortAnswer = (
  question: Pick<
    IShortAnswerQuestion,
    "acceptedAnswers" | "caseSensitive" | "correctPoints" | "incorrectPoints"
  >,
  userAnswer: string,
): ScoreResult => {
  const normalizedInput = normalizeAnswer(userAnswer, question.caseSensitive);

  if (!normalizedInput) {
    throw new Error("Please enter an answer");
  }

  const isCorrect = question.acceptedAnswers.some(
    (answer) =>
      normalizeAnswer(answer, question.caseSensitive) === normalizedInput,
  );

  return {
    status: isCorrect ? "correct" : "incorrect",
    points: isCorrect ? question.correctPoints : question.incorrectPoints,
  };
};
