import { apiClient } from "../api/client";
import type { IQuestion } from "../types/questions";

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
