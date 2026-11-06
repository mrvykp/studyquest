import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSubjects } from "../services/subjectService";
import { getTopics } from "../services/topicService";
import {
  createQuizAttempt,
  getQuizAttemptById,
  getQuizCandidateQuestions,
} from "../services/quizService";

export const useQuizBuilder = (subjectId?: string) => {
  const subjectsQuery = useQuery({
    queryKey: ["subjects"],
    queryFn: getSubjects,
  });

  const topicsQuery = useQuery({
    queryKey: ["topics"],
    queryFn: getTopics,
  });

  const candidateQuestionsQuery = useQuery({
    queryKey: ["quizzes", "candidateQuestions", subjectId],
    queryFn: () => getQuizCandidateQuestions(subjectId!),
    enabled: Boolean(subjectId),
  });

  return {
    subjectsQuery,
    topicsQuery,
    candidateQuestionsQuery,
  };
};

export const useSubmitQuizAttempt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createQuizAttempt,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["quizzes", "attempts"],
      });
    },
  });
};

export const useQuizAttempt = (attemptId?: string) => {
  return useQuery({
    queryKey: ["quizzes", "attempts", attemptId],
    queryFn: () => getQuizAttemptById(attemptId!),
    enabled: Boolean(attemptId),
  });
};
