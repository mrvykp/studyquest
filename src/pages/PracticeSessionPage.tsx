import { Alert, Button, Card, Flex, message, Spin, Typography } from "antd";
import { useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePracticeSession } from "../hooks/usePractice";
import { getPracticeSummary } from "../utils/practiceStats";
import type { FlashcardReviewResult } from "../types/practice";
import PracticeSummary from "../components/practice/PracticeSummary";
import PracticeProgress from "../components/practice/PracticeProgress";
import type { IFlashcardQuestion } from "../types/questions";
import FlashcardPlayer from "../components/practice/FlashcardPlayer";

const PracticeSessionPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [messageApi, contextHolder] = message.useMessage();

  const submittingRef = useRef(false);

  const {
    sessionQuery,
    reviewsQuery,
    questionsQuery,
    subjectsQuery,
    topicsQuery,
    saveReviewMutation,
    completeSessionMutation,
    restartSessionMutation,
  } = usePracticeSession(sessionId);

  if (!sessionId) {
    return <Alert type="error" showIcon title="Invalid session" />;
  }

  if (sessionQuery.isPending || reviewsQuery.isPending) {
    return <Spin size="large" />;
  }

  if (sessionQuery.isError || reviewsQuery.isError || !sessionQuery.data) {
    return (
      <Alert type="error" showIcon title="Could not load practice session" />
    );
  }

  const session = sessionQuery.data;
  const reviews = reviewsQuery.data;

  const reviewedIds = new Set(reviews.map((review) => review.questionId));

  const reviewedCount = session.questionIds.filter((id) =>
    reviewedIds.has(id),
  ).length;

  const nextQuestionId = session.questionIds.find((id) => !reviewedIds.has(id));

  const summary = getPracticeSummary(reviews);

  const handleReview = async (result: FlashcardReviewResult) => {
    if (
      submittingRef.current ||
      saveReviewMutation.isPending ||
      !nextQuestionId
    ) {
      return;
    }
    submittingRef.current = true;

    try {
      await saveReviewMutation.mutateAsync({
        sessionId,
        questionId: nextQuestionId,
        result,
      });
    } catch (error) {
      messageApi.error(
        error instanceof Error ? error.message : "Failed to save review",
      );
    } finally {
      submittingRef.current = false;
    }
  };

  const handlePracticeAgain = async () => {
    try {
      const newSession = await restartSessionMutation.mutateAsync(session);

      navigate(`/practice/${newSession.id}`);
    } catch (error) {
      messageApi.error(
        error instanceof Error ? error.message : "Failed to restart practice",
      );
    }
  };

  if (session.status === "COMPLETED") {
    return (
      <>
        {contextHolder}

        <PracticeSummary
          summary={summary}
          restarting={restartSessionMutation.isPending}
          onPracticeAgain={() => void handlePracticeAgain()}
          onBackToPractice={() => navigate("/practice")}
        />
      </>
    );
  }

  if (!nextQuestionId) {
    return (
      <Card title="All Flashcards Reviewed">
        {contextHolder}

        <Flex vertical gap={16}>
          <PracticeProgress
            reviewed={reviewedCount}
            total={session.questionIds.length}
          />

          <Typography.Text>
            All reviews are saved. Finish the session to see your summary.
          </Typography.Text>

          <Button
            type="primary"
            loading={completeSessionMutation.isPending}
            onClick={async () => {
              try {
                await completeSessionMutation.mutateAsync();
              } catch {
                messageApi.error("Could not complete the session");
              }
            }}
          >
            Finish Session
          </Button>
        </Flex>
      </Card>
    );
  }

  if (questionsQuery.isPending) {
    return <Spin size="large" />;
  }

  if (questionsQuery.isError) {
    return <Alert type="error" showIcon title="Could not load Flashcards" />;
  }

  const currentQuestion = questionsQuery.data?.find(
    (question): question is IFlashcardQuestion =>
      question.id === nextQuestionId && question.type === "FLASHCARD",
  );

  if (!currentQuestion) {
    return (
      <Alert
        type="error"
        showIcon
        title="Flashcard unavailable"
        description="A question in this session may have been deleted."
      />
    );
  }

  const subjectName =
    subjectsQuery.data?.find((subject) => subject.id === session.subjectId)
      ?.name ?? "Subject";

  const topicNames = (topicsQuery.data ?? [])
    .filter((topic) => currentQuestion.topicIds.includes(topic.id))
    .map((topic) => topic.name)
    .join(", ");
  return (
    <Flex vertical gap={24} style={{ maxWidth: 850, margin: "24px auto" }}>
      {contextHolder}
      <Flex vertical gap={4}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          {subjectName} - {topicNames || "Topics"}
        </Typography.Title>
      </Flex>

      <PracticeProgress
        reviewed={reviewedCount}
        total={session.questionIds.length}
      />

      <FlashcardPlayer
        key={currentQuestion.id}
        question={currentQuestion}
        saving={saveReviewMutation.isPending}
        onReview={(result) => void handleReview(result)}
      />
    </Flex>
  );
};

export default PracticeSessionPage;
