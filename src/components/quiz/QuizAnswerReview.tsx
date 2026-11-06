import { Card, Flex, Tag, Typography } from "antd";
import type {
  IQuizQuestionResult,
  IQuizResponse,
  ScoredQuestion,
} from "../../types/quiz";

interface QuizAnswerReviewProps {
  question: ScoredQuestion;
  response?: IQuizResponse;
  result: IQuizQuestionResult;
  questionNumber: number;
}

const QuizAnswerReview = ({
  question,
  result,
  response,
  questionNumber,
}: QuizAnswerReviewProps) => {
  let selectedOptionIds: string[] = [];

  if (
    response?.type === "SINGLE_CHOICE" &&
    response.selectedOptionId !== null
  ) {
    selectedOptionIds = [response.selectedOptionId];
  }

  if (response?.type === "MULTIPLE_CHOICE") {
    selectedOptionIds = response.selectedOptionIds;
  }

  return (
    <Card
      title={`Question ${questionNumber}`}
      size="small"
      style={{ width: "100%" }}
    >
      <Typography.Paragraph strong>{question.text}</Typography.Paragraph>

      <Flex gap={8} align="center" wrap="wrap">
        <Tag
          color={
            result.status === "CORRECT"
              ? "green"
              : result.status === "INCORRECT"
                ? "red"
                : result.status === "PARTIAL"
                  ? "orange"
                  : "default"
          }
        >
          {result.status}
        </Tag>

        <Typography.Text>
          {result.awardedPoints} / {result.maxPossiblePoints} points
        </Typography.Text>

        {question.type === "SHORT_ANSWER" ? (
          <Flex vertical gap={12} style={{ marginTop: 16 }}>
            <div>
              <Typography.Text type="secondary">Your Answer:</Typography.Text>

              <div>
                {response?.type === "SHORT_ANSWER"
                  ? response.answerText.trim() || "Not answered"
                  : "Not answered"}
              </div>
            </div>

            <div>
              <Typography.Text type="secondary">
                Accepted Answers:
              </Typography.Text>

              <div>{question.acceptedAnswers.join(", ")}</div>
            </div>
          </Flex>
        ) : (
          <Flex vertical gap={12} style={{ marginTop: 16 }}>
            {question.options.map((option) => {
              const isSelected = selectedOptionIds.includes(option.id);

              return (
                <Flex key={option.id} align="center" gap={8} wrap="wrap">
                  <Typography.Text>{option.text}</Typography.Text>

                  {isSelected && <Tag color="blue">Your Answer</Tag>}

                  {option.isCorrect && <Tag color="green">Correct Option</Tag>}

                  {isSelected && !option.isCorrect && (
                    <Tag color="red">Incorrect Selection</Tag>
                  )}

                  {isSelected && (
                    <Typography.Text type="secondary">
                      {option.points > 0 ? "+" : ""}
                      {option.points} pts
                    </Typography.Text>
                  )}
                </Flex>
              );
            })}
          </Flex>
        )}
      </Flex>
    </Card>
  );
};

export default QuizAnswerReview;
