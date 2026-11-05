import { validate as uuidValidate, version as uuidVersion } from "uuid";
import type {
  IChoiceOption,
  ICreateAndUpdateQuestionRequest,
} from "../types/questions";
import { hasMeaningfulContent, hasValidMedia } from "../editor/editorUtils";
import type { ITopic } from "../types/topic";

const isValidPoints = (points: number) => {
  return Number.isInteger(points) && points >= -100 && points <= 100;
};

export const normalizeAnswer = (answer: string, caseSensitive: boolean) => {
  const normalized = answer.trim().replace(/\s+/g, " ");

  return caseSensitive ? normalized : normalized.toLowerCase();
};

const validateChoiceOptions = (
  options: IChoiceOption[],
  type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE",
): IChoiceOption[] => {
  if (!Array.isArray(options) || options.length < 2 || options.length > 8) {
    throw new Error("A choice question must have 2 to 8 options");
  }

  const optionTexts = new Set<string>();
  const optionIds = new Set<string>();

  const validatedOptions = options.map((option) => {
    const text = option.text.trim();

    if (!text) {
      throw new Error("Option text cannot be empty");
    }

    const normalizedText = text.toLowerCase();

    if (optionTexts.has(normalizedText)) {
      throw new Error("Option texts must be unique");
    }

    optionTexts.add(normalizedText);

    if (!uuidValidate(option.id) || uuidVersion(option.id) !== 4) {
      throw new Error("Each option must have a valid UUID v4");
    }

    if (optionIds.has(option.id)) {
      throw new Error("Option IDs must be unique");
    }

    optionIds.add(option.id);

    if (typeof option.isCorrect !== "boolean") {
      throw new Error("Each option must specify whether it is correct");
    }

    if (!isValidPoints(option.points)) {
      throw new Error("Points must be integers between -100 and 100");
    }

    if (option.isCorrect && option.points <= 0) {
      throw new Error("Correct options must have positive points");
    }

    if (!option.isCorrect && option.points > 0) {
      throw new Error("Incorrect options must have zero or negative points");
    }

    return {
      id: option.id,
      text,
      isCorrect: option.isCorrect,
      points: option.points,
    };
  });

  const correctCount = validatedOptions.filter(
    (option) => option.isCorrect,
  ).length;

  if (type === "SINGLE_CHOICE" && correctCount !== 1) {
    throw new Error("Single choice must have exactly one correct option");
  }

  if (
    type === "MULTIPLE_CHOICE" &&
    (correctCount === 0 || correctCount === validatedOptions.length)
  ) {
    throw new Error(
      "Multiple choice must have at least one correct and one incorrect option",
    );
  }

  return validatedOptions;
};

export const validateQuestion = (
  question: ICreateAndUpdateQuestionRequest,
): ICreateAndUpdateQuestionRequest => {
  const text = question.text.trim();
  const subjectId = question.subjectId?.trim();

  if (!text) {
    throw new Error("Question title is required");
  }

  if (!subjectId) {
    throw new Error("Please select a subject");
  }

  const topicIds = [...new Set(question.topicIds ?? [])];

  if (topicIds.length === 0) {
    throw new Error("Please select at least one topic");
  }

  if (!hasValidMedia(question.description)) {
    throw new Error("Invalid link or image URL in description");
  }

  const description = hasMeaningfulContent(question.description)
    ? question.description
    : null;

  const commonFields = {
    text,
    subjectId,
    topicIds,
    description,
  };

  switch (question.type) {
    case "FLASHCARD": {
      if (!hasMeaningfulContent(question.answer)) {
        throw new Error("Question answer is required");
      }

      if (!hasValidMedia(question.answer)) {
        throw new Error("Invalid link or image URL in answer");
      }

      return {
        ...commonFields,
        type: "FLASHCARD",
        answer: question.answer,
      };
    }

    case "SINGLE_CHOICE": {
      return {
        ...commonFields,
        type: "SINGLE_CHOICE",
        options: validateChoiceOptions(question.options, "SINGLE_CHOICE"),
      };
    }

    case "MULTIPLE_CHOICE": {
      return {
        ...commonFields,
        type: "MULTIPLE_CHOICE",
        options: validateChoiceOptions(question.options, "MULTIPLE_CHOICE"),
      };
    }

    case "SHORT_ANSWER": {
      if (
        !Array.isArray(question.acceptedAnswers) ||
        question.acceptedAnswers.length === 0
      ) {
        throw new Error("Enter at least one accepted answer");
      }

      if (typeof question.caseSensitive !== "boolean") {
        throw new Error("Case sensitivity must be specified");
      }

      const acceptedAnswers = question.acceptedAnswers.map((answer) =>
        answer.trim(),
      );

      if (acceptedAnswers.some((answer) => !answer)) {
        throw new Error("Accepted answers cannot be empty");
      }

      const normalizedAnswers = acceptedAnswers.map((answer) =>
        normalizeAnswer(answer, question.caseSensitive),
      );

      if (new Set(normalizedAnswers).size !== normalizedAnswers.length) {
        throw new Error("Accepted answers must be unique");
      }

      if (
        !isValidPoints(question.correctPoints) ||
        question.correctPoints <= 0
      ) {
        throw new Error("Correct points must be a positive integer up to 100");
      }

      if (
        !isValidPoints(question.incorrectPoints) ||
        question.incorrectPoints > 0
      ) {
        throw new Error(
          "Incorrect points must be an integer between -100 and 0",
        );
      }

      return {
        ...commonFields,
        type: "SHORT_ANSWER",
        acceptedAnswers,
        caseSensitive: question.caseSensitive,
        correctPoints: question.correctPoints,
        incorrectPoints: question.incorrectPoints,
      };
    }

    default:
      throw new Error("Unsupported question type");
  }
};

export const validateQuestionTopics = (
  subjectId: string,
  topicIds: string[],
  topics: ITopic[],
) => {
  const validTopicIds = new Set(
    topics
      .filter((topic) => topic.subjectId === subjectId)
      .map((topic) => topic.id),
  );

  const hasInvalidTopic = topicIds.some(
    (topicId) => !validTopicIds.has(topicId),
  );

  if (hasInvalidTopic) {
    throw new Error(
      "One or more selected topics do not belong to this subject",
    );
  }
};
