import { useEffect, useState } from "react";
import type { IQuestion } from "../../types/questions";
import { Button, Divider, Modal, Typography } from "antd";
import { hasMeaningfulContent } from "../../editor/editorUtils";
import RichTextViewer from "../../editor/RichTextViewer";
import SingleChoicePreview from "./SingleChoicePreview";
import MultipleChoicePreview from "./MultipleChoicePreview";
import ShortAnswerPreview from "./ShortAnswerPreview";

interface QuestionPreviewModalProps {
  open: boolean;
  question: IQuestion | null;
  onClose: () => void;
}

const QuestionPreviewModal = ({
  open,
  question,
  onClose,
}: QuestionPreviewModalProps) => {
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    setShowAnswer(false);
  }, [open, question?.id]);

  return (
    <Modal
      title="Question Preview"
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
      destroyOnHidden
    >
      {question && (
        <div style={{ padding: "16px 0" }}>
          {question.type === "FLASHCARD" && (
            <>
              <Typography.Text type="secondary">Question</Typography.Text>

              <Typography.Title level={4}>{question.text}</Typography.Title>

              {question.description &&
                hasMeaningfulContent(question.description) && (
                  <RichTextViewer content={question.description} />
                )}

              <Divider />

              <Button
                type="primary"
                onClick={() => setShowAnswer((previous) => !previous)}
              >
                {showAnswer ? "Hide Answer" : "Reveal Answer"}
              </Button>

              {showAnswer && (
                <div style={{ marginTop: 24 }}>
                  <Typography.Title level={5}>Answer</Typography.Title>

                  <RichTextViewer content={question.answer} />
                </div>
              )}
            </>
          )}

          {question.type === "SINGLE_CHOICE" && (
            <SingleChoicePreview key={question.id} question={question} />
          )}

          {question.type === "MULTIPLE_CHOICE" && (
            <MultipleChoicePreview key={question.id} question={question} />
          )}

          {question.type === "SHORT_ANSWER" && (
            <ShortAnswerPreview key={question.id} question={question} />
          )}
        </div>
      )}
    </Modal>
  );
};

export default QuestionPreviewModal;
