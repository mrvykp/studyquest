import { useState } from "react";
import type { FlashcardReviewResult } from "../../types/practice";
import type { IFlashcardQuestion } from "../../types/questions";
import { Button, Card, Flex, Typography } from "antd";
import RichTextViewer from "../../editor/RichTextViewer";

interface FlashcardPlayerProps {
  question: IFlashcardQuestion;
  saving: boolean;
  onReview: (result: FlashcardReviewResult) => void;
}

const FlashcardPlayer = ({
  question,
  saving,
  onReview,
}: FlashcardPlayerProps) => {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <Card>
      <Flex vertical gap={20}>
        <Typography.Title level={4}>{question.text}</Typography.Title>

        {question.description && (
          <RichTextViewer content={question.description} />
        )}

        {!showAnswer ? (
          <Button
            type="primary"
            disabled={saving}
            onClick={() => setShowAnswer(true)}
          >
            Reveal Answer
          </Button>
        ) : (
          <>
            <Typography.Title level={5}>Answer</Typography.Title>

            <RichTextViewer content={question.answer} />

            <Flex gap={12}>
              <Button
                type="primary"
                loading={saving}
                disabled={saving}
                onClick={() => onReview("REMEMBERED")}
              >
                Remembered
              </Button>

              <Button disabled={saving} onClick={() => onReview("FORGOT")}>
                Forgot
              </Button>
            </Flex>
          </>
        )}
      </Flex>
    </Card>
  );
};

export default FlashcardPlayer;
