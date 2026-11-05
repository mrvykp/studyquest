import type { JSONContent } from "@tiptap/core";

export type QuestionType =
  | "FLASHCARD"
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE"
  | "SHORT_ANSWER";

export interface IQuestionBase {
  id: string;
  subjectId: string;
  topicIds: string[];
  text: string; // Plain-text question title for lists/search
  description: JSONContent | null; // Optional rich-text prompt/context
  createdAt: string;
  updatedAt: string;
}

export interface IFlashcardQuestion extends IQuestionBase {
  type: "FLASHCARD";
  answer: JSONContent; // required Tiptap JSON (back)
}

export interface IChoiceOption {
  id: string; // uuidv4(), stable during edits
  text: string; // plain text in Phase 2
  isCorrect: boolean;
  points: number; // + for correct selection, 0/- for wrong
}

export interface ISingleChoiceQuestion extends IQuestionBase {
  type: "SINGLE_CHOICE";
  options: IChoiceOption[];
}

export interface IMultipleChoiceQuestion extends IQuestionBase {
  type: "MULTIPLE_CHOICE";
  options: IChoiceOption[];
}

export interface IShortAnswerQuestion extends IQuestionBase {
  type: "SHORT_ANSWER";
  acceptedAnswers: string[]; // e.g. ["OOP", "Object Oriented Programming"]
  caseSensitive: boolean;
  correctPoints: number; // e.g. +5
  incorrectPoints: number; // e.g. -2 or 0
}

export type IQuestion =
  | IFlashcardQuestion
  | ISingleChoiceQuestion
  | IMultipleChoiceQuestion
  | IShortAnswerQuestion;

type QuestionRequestExcludedFields = "id" | "createdAt" | "updatedAt";

export type ICreateAndUpdateQuestionRequest =
  | Omit<IFlashcardQuestion, QuestionRequestExcludedFields>
  | Omit<ISingleChoiceQuestion, QuestionRequestExcludedFields>
  | Omit<IMultipleChoiceQuestion, QuestionRequestExcludedFields>
  | Omit<IShortAnswerQuestion, QuestionRequestExcludedFields>;
