import { useState } from "react";
import type { ISingleChoiceQuestion } from "../../types/questions";
import {
  scoreSingleChoice,
  type ScoreResult,
} from "../../utils/questionScoring";
import { Alert, Button, Radio, Space, Typography } from "antd";
import RichTextViewer from "../../editor/RichTextViewer";

interface SingleChoicePreviewProps {
  question: Pick<ISingleChoiceQuestion, "text" | "description" | "options">;
}

const SingleChoisePreview = ({ question }: SingleChoicePreviewProps) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const [result, setResult] = useState<ScoreResult | null>(null);

  const handleCheckAnswer = () => {
    if (!selectedOptionId) return;

    const score = scoreSingleChoice(question, selectedOptionId);

    setResult(score);
  };

  const handleReset = () => {
    setSelectedOptionId(null);
    setResult(null);
  };

  return (
    <Space orientation="vertical" size="large" style={{ width: "100%" }}>
      <Typography.Title level={5}>{question.text}</Typography.Title>

      {question.description && (
        <RichTextViewer content={question.description} />
      )}

      <Radio.Group
        value={selectedOptionId}
        onChange={(event) => {
          setSelectedOptionId(event.target.value);
          setResult(null);
        }}
      >
        <Space orientation="vertical">
          {question.options.map((option) => (
            <Radio key={option.id} value={option.id}>
              {option.text}
            </Radio>
          ))}
        </Space>
      </Radio.Group>

      <Space>
        <Button
          type="primary"
          disabled={!selectedOptionId || result !== null}
          onClick={handleCheckAnswer}
        >
          Check Answer
        </Button>

        <Button onClick={handleReset}>Reset</Button>
      </Space>

      {result && (
        <Alert
          type={result.status === "correct" ? "success" : "error"}
          showIcon
          message={result.status === "correct" ? "Correct!" : "Incorrect"}
          description={`Points: ${result.points > 0 ? "+" : ""}${result.points}`}
        />
      )}
    </Space>
  );
};

export default SingleChoisePreview;
