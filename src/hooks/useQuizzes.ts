import { useQuery } from "@tanstack/react-query";
import { getSubjects } from "../services/subjectService";
import { getTopics } from "../services/topicService";
import { getQuizCandidateQuestions } from "../services/quizService";

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
