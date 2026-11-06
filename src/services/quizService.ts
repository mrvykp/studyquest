import { apiClient } from "../api/client";
import type { IQuestion } from "../types/questions";
import type { IQuizAttempt } from "../types/quiz";

export const getQuizCandidateQuestions = async (
  subjectId: string,
): Promise<IQuestion[]> => {
  const response = await apiClient.get<IQuestion[]>("/questions", {
    params: {
      subjectId,
    },
  });
  return response.data;
};

export const createQuizAttempt = async (
  quizAttempt: IQuizAttempt,
): Promise<IQuizAttempt> => {
  const response = await apiClient.post<IQuizAttempt>(
    "/quizAttempts",
    quizAttempt,
  );

  return response.data;
};

export const getQuizAttemptById = async (
  attemptId: string,
): Promise<IQuizAttempt> => {
  const response = await apiClient.get<IQuizAttempt>(
    `/quizAttempts/${attemptId}`,
  );
  return response.data;
};

export const getQuizAttempts = async (): Promise<IQuizAttempt[]> => {
  const response = await apiClient.get<IQuizAttempt[]>("/quizAttempts");

  return response.data;
};
