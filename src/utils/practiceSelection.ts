import type { IFlashcardQuestion, IQuestion } from "../types/questions";

export const getEligibleFlashcards = (
  questions: IQuestion[],
  subjectId: string,
  selectedTopicIds: string[],
): IFlashcardQuestion[] => {
  const seenIds = new Set<string>();

  return questions.filter((question): question is IFlashcardQuestion => {
    if (question.type !== "FLASHCARD" || question.subjectId !== subjectId) {
      return false;
    }

    const matchesTopics =
      selectedTopicIds.length === 0 ||
      selectedTopicIds.some((topicId) => question.topicIds.includes(topicId));

    if (!matchesTopics || seenIds.has(question.id)) {
      return false;
    }

    seenIds.add(question.id);
    return true;
  });
};

export const selectedRandomFlashcards = (
  eligible: IFlashcardQuestion[],
  count: number,
): IFlashcardQuestion[] => {
  const uniqueCards = [
    ...new Map(eligible.map((card) => [card.id, card])).values(),
  ];

  if (!Number.isInteger(count) || count < 1 || count > uniqueCards.length) {
    throw new Error("Invalid number of flashcards requested");
  }

  const shuffled = [...uniqueCards];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
};
