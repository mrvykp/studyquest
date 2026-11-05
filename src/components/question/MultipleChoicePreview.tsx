import { useState } from "react";
import type { IMultipleChoiceQuestion } from "../../types/questions";
import {
  scoreMultipleChoice,
  type ScoreResult,
} from "../../utils/questionScoring";
import { Alert, Button, Checkbox, Flex, Typography } from "antd";
import RichTextViewer from "../../editor/RichTextViewer";

interface MultipleChoicePreviewProps {
  question: Pick<IMultipleChoiceQuestion, "text" | "description" | "options">;
}

const MultipleChoicePreview = ({ question }: MultipleChoicePreviewProps) => {
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);

  const [result, setResult] = useState<ScoreResult | null>(null);

  const handleOptionChange = (optionId: string, checked: boolean) => {
    setSelectedOptionIds((previous) =>
      checked
        ? [...previous, optionId]
        : previous.filter((id) => id !== optionId),
    );

    setResult(null);
  };

  const handleCheckAnswer = () => {
    if (selectedOptionIds.length === 0) return;

    const score = scoreMultipleChoice(question, selectedOptionIds);

    setResult(score);
  };

  const handleReset = () => {
    setSelectedOptionIds([]);
    setResult(null);
  };

  const statusLabels = {
    correct: "Correct!",
    partially_correct: "Partially Correct",
    incorrect: "Incorrect",
  };
  return (
    <Flex vertical gap={12}>
      <Typography.Title level={5}>{question.text}</Typography.Title>

      {question.description && (
        <RichTextViewer content={question.description} />
      )}

      <Flex vertical gap={12}>
        {question.options.map((option) => (
          <Checkbox
            key={option.id}
            checked={selectedOptionIds.includes(option.id)}
            onChange={(event) =>
              handleOptionChange(option.id, event.target.checked)
            }
          >
            {option.text}
          </Checkbox>
        ))}
      </Flex>

      <Flex gap={8}>
        <Button
          type="primary"
          disabled={selectedOptionIds.length === 0 || result !== null}
          onClick={handleCheckAnswer}
        >
          Check Answer
        </Button>

        <Button onClick={handleReset}>Reset</Button>
      </Flex>

      {result && (
        <Alert
          showIcon
          type={
            result.status === "correct"
              ? "success"
              : result.status === "partially_correct"
                ? "warning"
                : "error"
          }
          message={statusLabels[result.status]}
          description={`Points: ${result.points > 0 ? "+" : ""}${result.points}`}
        />
      )}
    </Flex>
  );
};

export default MultipleChoicePreview;
