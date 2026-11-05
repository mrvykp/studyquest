import type {
  IDailyPracticeStat,
  IFlashcardReview,
  IPracticeSummary,
} from "../types/practice";

export const getPracticeSummary = (
  reviews: IFlashcardReview[],
): IPracticeSummary => {
  const reviewed = reviews.length;

  const remembered = reviews.filter(
    (review) => review.result === "REMEMBERED",
  ).length;

  const forgot = reviews.filter((review) => review.result === "FORGOT").length;

  const percentage =
    reviewed > 0 ? Math.round((remembered / reviewed) * 100) : 0;

  return {
    reviewed,
    remembered,
    forgot,
    percentage,
  };
};

const getLocalDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const getDailyPracticeStats = (
  reviews: IFlashcardReview[],
  today: Date,
): IDailyPracticeStat[] => {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - (6 - index),
    );

    const dataKey = getLocalDateKey(date);

    const dailyReviews = reviews.filter((review) => {
      const reviewedAt = new Date(review.reviewedAt);

      return (
        !Number.isNaN(reviewedAt.getTime()) &&
        getLocalDateKey(reviewedAt) === dataKey
      );
    });

    const reviewed = dailyReviews.length;

    const remembered = dailyReviews.filter(
      (review) => review.result === "REMEMBERED",
    ).length;

    const forgot = dailyReviews.filter(
      (review) => review.result === "FORGOT",
    ).length;

    const rememberedPercentage =
      reviewed > 0 ? Math.round((remembered / reviewed) * 100) : 0;

    return {
      date: dataKey,
      reviewed,
      remembered,
      forgot,
      rememberedPercentage,
    };
  });
};

export const calculateCurrentStreak = (
  reviews: IFlashcardReview[],
  today: Date,
): number => {
  const studyDays = new Set(
    reviews
      .map((review) => new Date(review.reviewedAt))
      .filter((date) => !Number.isNaN(date.getTime()))
      .map(getLocalDateKey),
  );

  let currentDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  if (!studyDays.has(getLocalDateKey(currentDate))) {
    currentDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() - 1,
    );
  }

  let streak = 0;

  while (studyDays.has(getLocalDateKey(currentDate))) {
    streak++;

    currentDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() - 1,
    );
  }
  return streak;
};
