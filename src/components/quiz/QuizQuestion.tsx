import { Checkbox, Input, Radio, Space, Typography } from "antd";
import type { IQuizResponse, ScoredQuestion } from "../../types/quiz";

interface QuizQuestionProps {
  question: ScoredQuestion;
  response: IQuizResponse;
  disabled?: boolean;
  onAnswerChange: (response: IQuizResponse) => void;
}
const QuizQuestion = ({
  question,
  response,
  disabled = false,
  onAnswerChange,
}: QuizQuestionProps) => {
  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Typography.Title level={4}>{question.text}</Typography.Title>

      {question.type === "SINGLE_CHOICE" && (
        <Radio.Group
          disabled={disabled}
          value={
            response.type === "SINGLE_CHOICE" ? response.selectedOptionId : null
          }
          onChange={(event) =>
            onAnswerChange({
              questionId: question.id,
              type: "SINGLE_CHOICE",
              selectedOptionId: event.target.value as string,
            })
          }
        >
          <Space direction="vertical">
            {question.options.map((option) => (
              <Radio key={option.id} value={option.id}>
                {option.text}
              </Radio>
            ))}
          </Space>
        </Radio.Group>
      )}

      {question.type === "MULTIPLE_CHOICE" && (
        <Checkbox.Group
          disabled={disabled}
          value={
            response.type === "MULTIPLE_CHOICE"
              ? response.selectedOptionIds
              : []
          }
          onChange={(selectedValues) =>
            onAnswerChange({
              questionId: question.id,
              type: "MULTIPLE_CHOICE",
              selectedOptionIds: selectedValues.map(String),
            })
          }
        >
          <Space direction="vertical">
            {question.options.map((option) => (
              <Checkbox key={option.id} value={option.id}>
                {option.text}
              </Checkbox>
            ))}
          </Space>
        </Checkbox.Group>
      )}

      {question.type === "SHORT_ANSWER" && (
        <Input
          disabled={disabled}
          placeholder="Enter your answer..."
          value={response.type === "SHORT_ANSWER" ? response.answerText : ""}
          onChange={(event) =>
            onAnswerChange({
              questionId: question.id,
              type: "SHORT_ANSWER",
              answerText: event.target.value,
            })
          }
        />
      )}
    </Space>
  );
};

export default QuizQuestion;
