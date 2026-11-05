import type {
  IMultipleChoiceQuestion,
  IShortAnswerQuestion,
  ISingleChoiceQuestion,
} from "./questions";

export type ScoredQuestion =
  | ISingleChoiceQuestion
  | IMultipleChoiceQuestion
  | IShortAnswerQuestion;

export type ScoredQuestionType = ScoredQuestion["type"];

export interface IQuizSettings {
  subjectId: string;
  selectedTopicIds: string[];
  questionTypes: ScoredQuestionType[];
  count: number;
}

export interface IQuizDraft {
  settings: IQuizSettings;
  questionSnapshots: ScoredQuestion[];
  startedAt: string;
}

export type IQuizResponse =
  | {
      questionId: string;
      type: "SINGLE_CHOICE";
      selectedOptionId: string | null;
    }
  | {
      questionId: string;
      type: "MULTIPLE_CHOICE";
      selectedOptionIds: string[];
    }
  | {
      questionId: string;
      type: "SHORT_ANSWER";
      answerText: string;
    };

export type QuizQuestionStatus =
  | "CORRECT"
  | "PARTIAL"
  | "INCORRECT"
  | "UNANSWERED";

export interface IQuizQuestionResult {
  questionId: string;
  status: QuizQuestionStatus;
  awardedPoints: number;
  maxPossiblePoints: number;
}

export interface IQuizAttempt {
  id: string;
  subjectId: string;
  selectedTopicIds: string[];
  questionTypes: ScoredQuestionType[];

  questionSnapshots: ScoredQuestion[];
  responses: IQuizResponse[];
  results: IQuizQuestionResult[];

  totalPoints: number;
  maxPossiblePoints: number;
  accuracyPercent: number;

  startedAt: string;
  completedAt: string;
  durationSeconds: number;
}

export interface IQuizGradingSummary {
  results: IQuizQuestionResult[];
  totalPoints: number;
  maxPossiblePoints: number;
  accuracyPercent: number;
}
