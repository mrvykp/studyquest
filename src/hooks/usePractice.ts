import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSubjects } from "../services/subjectService";
import { getTopics } from "../services/topicService";
import {
  completePracticeSession,
  createPracticeSession,
  getAllFlashcardReviews,
  getEligiblePracticeFlashcards,
  getPracticeSession,
  getSessionReviews,
  saveFlashcardReview,
} from "../services/practiceService";
import { getQuestions } from "../services/questionService";
import type { IFlashcardReview, IPracticeSession } from "../types/practice";
import { selectedRandomFlashcards } from "../utils/practiceSelection";

export const usePracticeSetup = (subjectId?: string) => {
  const queryClient = useQueryClient();

  const subjectsQuery = useQuery({
    queryKey: ["subjects"],
    queryFn: getSubjects,
  });

  const topicsQuery = useQuery({
    queryKey: ["topics"],
    queryFn: getTopics,
  });

  const flashcardsQuery = useQuery({
    queryKey: ["practice", "flashcards", subjectId],
    queryFn: () => getEligiblePracticeFlashcards(subjectId ?? "", []),
    enabled: Boolean(subjectId),
  });

  const startSessionMutation = useMutation({
    mutationFn: createPracticeSession,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["practiceSessions"],
      });
    },
  });
  return {
    subjectsQuery,
    topicsQuery,
    flashcardsQuery,
    startSessionMutation,
  };
};

export const usePracticeSession = (sessionId?: string) => {
  const queryClient = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: ["practice", "session", sessionId],
    queryFn: () => getPracticeSession(sessionId!),
    enabled: Boolean(sessionId),
  });

  const reviewsQuery = useQuery({
    queryKey: ["practice", "reviews", sessionId],
    queryFn: () => getSessionReviews(sessionId!),
    enabled: Boolean(sessionId),
  });

  const subjectsQuery = useQuery({
    queryKey: ["subjects"],
    queryFn: getSubjects,
  });

  const topicsQuery = useQuery({
    queryKey: ["topics"],
    queryFn: getTopics,
  });

  const questionsQuery = useQuery({
    queryKey: ["questions"],
    queryFn: getQuestions,
    enabled: Boolean(sessionId),
  });

  const saveReviewMutation = useMutation({
    mutationFn: saveFlashcardReview,
    onSuccess: (newReview) => {
      queryClient.setQueryData<IFlashcardReview[]>(
        ["practice", "reviews", sessionId],
        (previous = []) => [...previous, newReview],
      );

      void queryClient.invalidateQueries({
        queryKey: ["practice", "reviews", sessionId],
      });
    },
  });

  const completeSessionMutation = useMutation({
    mutationFn: () => completePracticeSession(sessionId!),

    onSuccess: (updatedSession) => {
      queryClient.setQueryData(
        ["practice", "session", sessionId],
        updatedSession,
      );

      void queryClient.invalidateQueries({ queryKey: ["practiceSessions"] });
    },
  });

  const restartSessionMutation = useMutation({
    mutationFn: async (session: IPracticeSession) => {
      const eligible = await getEligiblePracticeFlashcards(
        session.subjectId,
        session.selectedTopicIds,
      );

      if (eligible.length === 0) {
        throw new Error("No eligible Flashcards are available");
      }

      const count = Math.min(session.questionIds.length, eligible.length);

      const selectedCards = selectedRandomFlashcards(eligible, count);

      return createPracticeSession({
        subjectId: session.subjectId,
        selectedTopicIds: session.selectedTopicIds,
        questionIds: selectedCards.map((card) => card.id),
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["practiceSessions"],
      });
    },
  });

  return {
    sessionQuery,
    reviewsQuery,
    subjectsQuery,
    topicsQuery,
    questionsQuery,
    saveReviewMutation,
    completeSessionMutation,
    restartSessionMutation,
  };
};

export const usePracticeActivity = () => {
  return useQuery({
    queryKey: ["practice", "allReviews"],
    queryFn: getAllFlashcardReviews,
  });
};
