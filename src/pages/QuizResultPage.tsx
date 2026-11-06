import { useNavigate, useParams } from "react-router-dom";
import { useQuizAttempt } from "../hooks/useQuizzes";
import {
  Alert,
  Button,
  Card,
  Descriptions,
  List,
  Spin,
  Tag,
  Typography,
} from "antd";
import QuizAnswerReview from "../components/quiz/QuizAnswerReview";

const QuizResultPage = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();

  const attemptQuery = useQuizAttempt(attemptId);

  if (!attemptId) {
    return <Alert type="error" title="Missing quiz attempt ID" />;
  }

  if (attemptQuery.isPending) {
    return <Spin tip="Loading quiz results..." size="large" />;
  }

  if (attemptQuery.isError || !attemptQuery.data) {
    return (
      <Alert
        type="error"
        title="Could not load quiz results"
        description="The saved quiz attempt could not be retrieved."
        showIcon
      />
    );
  }

  const attempt = attemptQuery.data;

  return (
    <Card title="Quiz Results" style={{ maxWidth: 800, margin: "24px auto" }}>
      <Typography.Title level={4}>Quiz Completed</Typography.Title>

      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="Questions">
          {attempt.questionSnapshots.length}
        </Descriptions.Item>

        <Descriptions.Item label="Total Points">
          {attempt.totalPoints} / {attempt.maxPossiblePoints}
        </Descriptions.Item>

        <Descriptions.Item label="Accuracy">
          {attempt.accuracyPercent.toFixed(1)}%
        </Descriptions.Item>

        <Descriptions.Item label="Duration">
          {attempt.durationSeconds} seconds
        </Descriptions.Item>

        <Descriptions.Item label="Completed">
          {new Date(attempt.completedAt).toLocaleString()}
        </Descriptions.Item>
      </Descriptions>

      <Typography.Title level={5} style={{ marginTop: 24 }}>
        Question Results
      </Typography.Title>

      <List
        dataSource={attempt.questionSnapshots}
        renderItem={(question, index) => {
          const response = attempt.responses.find(
            (item) => item.questionId === question.id,
          );

          const result = attempt.results.find(
            (item) => item.questionId === question.id,
          );

          if (!result) {
            return (
              <List.Item>
                <Alert
                  type="error"
                  title="Result not found for this question"
                  showIcon
                />
              </List.Item>
            );
          }

          return (
            <List.Item>
              <QuizAnswerReview
                question={question}
                response={response}
                result={result}
                questionNumber={index + 1}
              />
            </List.Item>
          );
        }}
      />

      <Button
        type="primary"
        style={{ marginTop: 24 }}
        onClick={() => navigate("/quizzes/new")}
      >
        Take Another Quiz
      </Button>
    </Card>
  );
};

export default QuizResultPage;
