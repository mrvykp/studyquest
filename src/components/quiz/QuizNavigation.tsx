import { Button, Flex, Progress, Typography } from "antd";

interface QuizNavigationProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  answeredQuestionCount: number;
  submitting: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

const QuizNavigation = ({
  currentQuestionIndex,
  totalQuestions,
  answeredQuestionCount,
  submitting,
  onPrevious,
  onNext,
  onSubmit,
}: QuizNavigationProps) => {
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  return (
    <Flex vertical gap={16}>
      <Typography.Text type="secondary">
        Answered {answeredQuestionCount} of (totalQuestions)
      </Typography.Text>

      <Progress
        percent={
          totalQuestions > 0
            ? Math.round((answeredQuestionCount / totalQuestions) * 100)
            : 0
        }
      />

      <Flex justify="space-between">
        <Button disabled={isFirstQuestion || submitting} onClick={onPrevious}>
          Previous
        </Button>

        {isLastQuestion ? (
          <Button type="primary" loading={submitting} onClick={onSubmit}>
            Submit Quiz
          </Button>
        ) : (
          <Button disabled={isLastQuestion} onClick={onNext}>
            Next
          </Button>
        )}
      </Flex>

      {isLastQuestion && (
        <Typography.Text type="secondary">
          You've reached the last question. Quiz submission will be connected in
          the next step.
        </Typography.Text>
      )}
    </Flex>
  );
};

export default QuizNavigation;
