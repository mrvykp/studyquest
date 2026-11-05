import { apiClient } from "../api/client";
import { v4 as uuidv4 } from "uuid";
import type { IFlashcardReview, IPracticeSession } from "../types/practice";
import type { IQuestion, IFlashcardQuestion } from "../types/questions";
import { getEligibleFlashcards } from "../utils/practiceSelection";

type CreateSessionRequest = Pick<
  IPracticeSession,
  "subjectId" | "selectedTopicIds" | "questionIds"
>;

type SaveReviewRequest = Pick<
  IFlashcardReview,
  "sessionId" | "questionId" | "result"
>;

export const getEligiblePracticeFlashcards = async (
  subjectId: string,
  selectedTopicIds: string[],
): Promise<IFlashcardQuestion[]> => {
  const response = await apiClient.get<IQuestion[]>("/questions", {
    params: {
      subjectId,
      type: "FLASHCARD",
    },
  });

  return getEligibleFlashcards(response.data, subjectId, selectedTopicIds);
};

export const createPracticeSession = async (
  request: CreateSessionRequest,
): Promise<IPracticeSession> => {
  const { subjectId, selectedTopicIds, questionIds } = request;

  if (!subjectId.trim()) {
    throw new Error("Please select a subject");
  }

  if (
    questionIds.length === 0 ||
    new Set(questionIds).size !== questionIds.length
  ) {
    throw new Error("Session must contain unique questions");
  }

  const eligible = await getEligiblePracticeFlashcards(
    subjectId,
    selectedTopicIds,
  );

  const eligibleIds = new Set(eligible.map((card) => card.id));

  if (questionIds.some((id) => !eligibleIds.has(id))) {
    throw new Error("Session contains ineligible flashcards");
  }

  const newSession: IPracticeSession = {
    id: uuidv4(),
    subjectId,
    selectedTopicIds,
    questionIds,
    status: "IN_PROGRESS",
    startedAt: new Date().toISOString(),
    completedAt: null,
  };

  const response = await apiClient.post<IPracticeSession>(
    "/practiceSessions",
    newSession,
  );
  return response.data;
};

export const getPracticeSession = async (
  sessionId: string,
): Promise<IPracticeSession> => {
  const response = await apiClient.get<IPracticeSession>(
    `/practiceSessions/${sessionId}`,
  );

  return response.data;
};

export const getPracticeSessions = async (): Promise<IPracticeSession[]> => {
  const response = await apiClient.get<IPracticeSession[]>("/practiceSessions");

  return response.data;
};

export const getSessionReviews = async (
  sessionId: string,
): Promise<IFlashcardReview[]> => {
  const response = await apiClient.get<IFlashcardReview[]>(
    "/flashcardReviews",
    {
      params: { sessionId },
    },
  );
  return response.data;
};

export const saveFlashcardReview = async (
  request: SaveReviewRequest,
): Promise<IFlashcardReview> => {
  const { sessionId, questionId, result } = request;

  if (result !== "REMEMBERED" && result !== "FORGOT") {
    throw new Error("Invalid review result");
  }

  const session = await getPracticeSession(sessionId);

  if (session.status !== "IN_PROGRESS") {
    throw new Error("This session is already completed");
  }

  if (!session.questionIds.includes(questionId)) {
    throw new Error("Question does not belong to this session");
  }

  const existingReviews = await getSessionReviews(sessionId);

  if (existingReviews.some((review) => review.questionId === questionId)) {
    throw new Error("This card has already been reviewed");
  }

  const questionResponse = await apiClient.get<IQuestion>(
    `/questions/${questionId}`,
  );

  const question = questionResponse.data;

  if (
    question.type !== "FLASHCARD" ||
    question.subjectId !== session.subjectId
  ) {
    throw new Error("Invalid flashcard for this session");
  }

  const newReview: IFlashcardReview = {
    id: uuidv4(),
    sessionId,
    questionId,
    subjectId: question.subjectId,
    topicIds: [...question.topicIds],
    result,
    reviewedAt: new Date().toISOString(),
  };

  const response = await apiClient.post<IFlashcardReview>(
    "/flashcardReviews",
    newReview,
  );

  return response.data;
};

export const completePracticeSession = async (
  sessionId: string,
): Promise<IPracticeSession> => {
  const session = await getPracticeSession(sessionId);

  if (session.status === "COMPLETED") {
    return session;
  }

  const reviews = await getSessionReviews(sessionId);

  const reviewedIds = new Set(reviews.map((review) => review.questionId));

  const allReviewed = session.questionIds.every((id) => reviewedIds.has(id));

  if (!allReviewed) {
    throw new Error("Review all cards before completing the session");
  }

  const response = await apiClient.patch<IPracticeSession>(
    `/practiceSessions/${sessionId}`,
    {
      status: "COMPLETED",
      completedAt: new Date().toISOString(),
    },
  );

  return response.data;
};

export const getAllFlashcardReviews = async (): Promise<IFlashcardReview[]> => {
  const response = await apiClient.get<IFlashcardReview[]>("/flashcardReviews");

  return response.data;
};
