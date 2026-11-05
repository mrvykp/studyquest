import { useLocation, useNavigate } from "react-router-dom";
import type { IQuizDraft, IQuizResponse, ScoredQuestion } from "../types/quiz";
import { Alert, Button, Card, Typography } from "antd";
import { useState } from "react";
import QuizQuestion from "../components/quiz/QuizQuestion";
import QuizNavigation from "../components/quiz/QuizNavigation";

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

  const quizDraft = (location.state as { quizDraft?: IQuizDraft } | null)
    ?.quizDraft;

  const questions = quizDraft?.questionSnapshots ?? [];

  const [responses, setResponses] = useState<IQuizResponse[]>(() =>
    questions.map(createEmptyQuizResponse),
  );

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
      <Typography.Paragraph type="secondary">
        Question {currentQuestionIndex + 1} of {questions.length}
      </Typography.Paragraph>

      <QuizQuestion
        question={currentQuestion}
        response={currentResponse}
        onAnswerChange={handleAnswerChange}
      />

      <div style={{ marginTop: 32 }}>
        <QuizNavigation
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={questions.length}
          answeredQuestionCount={answeredQuestionCount}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      </div>
    </Card>
  );
};

export default QuizPlayerPage;
