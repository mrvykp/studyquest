import type { IQuestion } from "../types/questions";
import type { ScoredQuestion, ScoredQuestionType } from "../types/quiz";

export const getEligibleQuizQuestions = (
  questions: IQuestion[],
  subjectId: string,
  selectedTopicIds: string[],
  questionTypes: ScoredQuestionType[],
): ScoredQuestion[] => {
  const seenQuestionIds = new Set<string>();

  return questions.filter((question): question is ScoredQuestion => {
    if (question.type === "FLASHCARD") {
      return false;
    }

    if (
      question.subjectId !== subjectId ||
      !questionTypes.includes(question.type)
    ) {
      return false;
    }

    const matchesTopics =
      selectedTopicIds.length === 0 ||
      selectedTopicIds.some((topicId) => question.topicIds.includes(topicId));

    if (!matchesTopics || seenQuestionIds.has(question.id)) {
      return false;
    }

    seenQuestionIds.add(question.id);

    return true;
  });
};

export const selectRandomQuizQuestions = (
  eligibleQuestions: ScoredQuestion[],
  questionCount: number,
): ScoredQuestion[] => {
  const uniqueQuestions = [
    ...new Map(
      eligibleQuestions.map((question) => [question.id, question]),
    ).values(),
  ];

  if (
    !Number.isInteger(questionCount) ||
    questionCount < 1 ||
    questionCount > uniqueQuestions.length
  ) {
    throw new Error("Invalid number of quiz questions requested");
  }

  const shuffledQuestions = [...uniqueQuestions];

  for (let i = shuffledQuestions.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));

    [shuffledQuestions[i], shuffledQuestions[randomIndex]] = [
      shuffledQuestions[randomIndex],
      shuffledQuestions[i],
    ];
  }

  return shuffledQuestions.slice(0, questionCount);
};
