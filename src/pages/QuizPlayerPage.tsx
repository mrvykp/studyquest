import { useLocation, useNavigate } from "react-router-dom";
import type {
  IQuizAttempt,
  IQuizDraft,
  IQuizResponse,
  ScoredQuestion,
} from "../types/quiz";
import { Alert, Button, Card, message, Modal, Typography } from "antd";
import { useRef, useState } from "react";
import QuizQuestion from "../components/quiz/QuizQuestion";
import QuizNavigation from "../components/quiz/QuizNavigation";
import { v4 as uuidv4 } from "uuid";
import { useSubmitQuizAttempt } from "../hooks/useQuizzes";
import { gradeQuiz } from "../utils/quizGrading";

const createEmptyQuizResponse = (question: ScoredQuestion): IQuizResponse => {
  switch (question.type) {
    case "SINGLE_CHOICE":
      return {
        questionId: question.id,
        type: "SINGLE_CHOICE",
        selectedOptionId: null,
      };

    case "MULTIPLE_CHOICE":
      return {
        questionId: question.id,
        type: "MULTIPLE_CHOICE",
        selectedOptionIds: [],
      };

    case "SHORT_ANSWER":
      return {
        questionId: question.id,
        type: "SHORT_ANSWER",
        answerText: "",
      };
  }
};

const isQuizResponseAnswered = (response: IQuizResponse): boolean => {
  switch (response.type) {
    case "SINGLE_CHOICE":
      return response.selectedOptionId !== null;

    case "MULTIPLE_CHOICE":
      return response.selectedOptionIds.length > 0;

    case "SHORT_ANSWER":
      return response.answerText.trim().length > 0;
  }
};

const QuizPlayerPage = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const [messageApi, messageContextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();

  const quizDraft = (location.state as { quizDraft?: IQuizDraft } | null)
    ?.quizDraft;

  const questions = quizDraft?.questionSnapshots ?? [];

  const [responses, setResponses] = useState<IQuizResponse[]>(() =>
    questions.map(createEmptyQuizResponse),
  );

  const [attemptId] = useState(() => uuidv4());

  const submissionInProgressRef = useRef(false);

  const submitQuizAttemptMutation = useSubmitQuizAttempt();

  const handleAnswerChange = (updatedResponse: IQuizResponse) => {
    setResponses((previousResponses) =>
      previousResponses.map((response) =>
        response.questionId === updatedResponse.questionId
          ? updatedResponse
          : response,
      ),
    );
  };

  const handlePrevious = () => {
    setCurrentQuestionIndex((previousIndex) => Math.max(0, previousIndex - 1));
  };

  const handleNext = () => {
    setCurrentQuestionIndex((previousIndex) =>
      Math.min(questions.length - 1, previousIndex + 1),
    );
  };

  const answeredQuestionCount = responses.filter(isQuizResponseAnswered).length;

  const handleSubmitQuiz = async () => {
    if (
      !quizDraft ||
      submissionInProgressRef.current ||
      submitQuizAttemptMutation.isPending
    ) {
      return;
    }

    submissionInProgressRef.current = true;

    try {
      const unansweredQuestionCount = responses.length - answeredQuestionCount;

      if (unansweredQuestionCount > 0) {
        const confirmed = await modal.confirm({
          title: "Submit Quiz?",
          content:
            `You have ${unansweredQuestionCount} unanswered` +
            `question(s). They will receive 0 points.`,
          okText: "Submit Quiz",
          cancelText: "Continue Quiz",
        });

        if (!confirmed) {
          return;
        }
      }

      const gradingSummary = gradeQuiz(quizDraft.questionSnapshots, responses);

      const completedAt = new Date();

      const startedAtMilliseconds = Date.parse(quizDraft.startedAt);

      if (Number.isNaN(startedAtMilliseconds)) {
        throw new Error("Invalid quiz start time");
      }

      const durationSeconds = Math.max(
        0,
        Math.floor((completedAt.getTime() - startedAtMilliseconds) / 1000),
      );

      const quizAttempt: IQuizAttempt = {
        id: attemptId,
        subjectId: quizDraft.settings.subjectId,
        selectedTopicIds: [...quizDraft.settings.selectedTopicIds],
        questionTypes: [...quizDraft.settings.questionTypes],
        questionSnapshots: structuredClone(quizDraft.questionSnapshots),
        responses: structuredClone(responses),
        results: gradingSummary.results,
        totalPoints: gradingSummary.totalPoints,
        maxPossiblePoints: gradingSummary.maxPossiblePoints,
        accuracyPercent: gradingSummary.accuracyPercent,
        startedAt: quizDraft.startedAt,
        completedAt: completedAt.toISOString(),
        durationSeconds,
      };

      const savedAttempt =
        await submitQuizAttemptMutation.mutateAsync(quizAttempt);

      navigate(`/quizzes/results/${savedAttempt.id}`, {
        replace: true,
      });
    } catch (error) {
      messageApi.error(
        error instanceof Error ? error.message : "Failed to submit quiz",
      );
    } finally {
      submissionInProgressRef.current = false;
    }
  };

  if (!quizDraft || questions.length === 0) {
    return (
      <Card>
        <Alert
          type="warning"
          showIcon
          title="No quiz in progress"
          description="Generate a quiz from Quiz Builder first."
        />

        <Button
          style={{ marginTop: 16 }}
          onClick={() => navigate("/quizzes/new")}
        >
          Back to Quiz Builder
        </Button>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  const currentResponse = responses.find(
    (response) => response.questionId === currentQuestion?.id,
  );

  if (!currentQuestion || !currentResponse) {
    return (
      <Alert
        type="error"
        showIcon
        title="Could not load the current quiz question"
      />
    );
  }

  return (
    <Card title="Quiz Player" style={{ maxWidth: 800, margin: "24px auto" }}>
      {modalContextHolder}
      {messageContextHolder}
      <Typography.Paragraph type="secondary">
        Question {currentQuestionIndex + 1} of {questions.length}
      </Typography.Paragraph>

      <QuizQuestion
        question={currentQuestion}
        response={currentResponse}
        onAnswerChange={handleAnswerChange}
        disabled={submitQuizAttemptMutation.isPending}
      />

      <div style={{ marginTop: 32 }}>
        <QuizNavigation
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={questions.length}
          answeredQuestionCount={answeredQuestionCount}
          submitting={submitQuizAttemptMutation.isPending}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSubmit={handleSubmitQuiz}
        />
      </div>
    </Card>
  );
};

export default QuizPlayerPage;
