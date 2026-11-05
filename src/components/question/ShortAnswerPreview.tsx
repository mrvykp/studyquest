import { useState } from "react";
import type { IShortAnswerQuestion } from "../../types/questions";
import {
  scoreShortAnswer,
  type ScoreResult,
} from "../../utils/questionScoring";
import { Alert, Button, Flex, Input, Typography } from "antd";
import RichTextViewer from "../../editor/RichTextViewer";

interface ShortAnswerPreviewProps {
  question: Pick<
    IShortAnswerQuestion,
    | "text"
    | "description"
    | "acceptedAnswers"
    | "caseSensitive"
    | "correctPoints"
    | "incorrectPoints"
  >;
}
const ShortAnswerPreview = ({ question }: ShortAnswerPreviewProps) => {
  const [userAnswer, setUserAnswer] = useState("");

  const [result, setResult] = useState<ScoreResult | null>(null);

  const handleCheckAnswer = () => {
    if (!userAnswer.trim()) return;

    const score = scoreShortAnswer(question, userAnswer);

    setResult(score);
  };

  const handleReset = () => {
    setUserAnswer("");
    setResult(null);
  };
  return (
    <Flex vertical gap={12}>
      <Typography.Title level={5}>{question.text}</Typography.Title>

      {question.description && (
        <RichTextViewer content={question.description} />
      )}

      <Input
        placeholder="Type your answer"
        value={userAnswer}
        onChange={(event) => {
          setUserAnswer(event.target.value);
          setResult(null);
        }}
      />

      <Flex gap={8}>
        <Button
          type="primary"
          disabled={!userAnswer.trim() || result !== null}
          onClick={handleCheckAnswer}
        >
          Check Answer
        </Button>

        <Button onClick={handleReset}>Reset</Button>
      </Flex>

      {result && (
        <Alert
          showIcon
          type={result.status === "correct" ? "success" : "error"}
          message={result.status === "correct" ? "Correct!" : "Incorrect"}
          description={`Points: ${
            result.points > 0 ? "+" : ""
          }${result.points}`}
        />
      )}
    </Flex>
  );
};

export default ShortAnswerPreview;
