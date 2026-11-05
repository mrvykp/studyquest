export type FlashcardReviewResult = "REMEMBERED" | "FORGOT";

export interface IPracticeSession {
  id: string; // uuidv4()
  subjectId: string; // selected subject
  selectedTopicIds: string[]; // [] = all topics in subject
  questionIds: string[]; // unique, fixed order for this session
  status: "IN_PROGRESS" | "COMPLETED";
  startedAt: string; // ISO timestamp
  completedAt: string | null;
}

export interface IFlashcardReview {
  id: string; // uuidv4()
  sessionId: string;
  questionId: string;
  subjectId: string; // snapshot at review time
  topicIds: string[]; // snapshot at review time
  result: FlashcardReviewResult;
  reviewedAt: string; // ISO timestamp
}

export interface IPracticeSummary {
  reviewed: number;
  remembered: number;
  forgot: number;
  percentage: number;
}

export interface IDailyPracticeStat {
  date: string;
  reviewed: number;
  remembered: number;
  forgot: number;
  rememberedPercentage: number;
}
