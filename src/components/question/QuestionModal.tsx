import { useEffect, useState } from "react";
import type {
  IChoiceOption,
  ICreateAndUpdateQuestionRequest,
  IQuestion,
  QuestionType,
} from "../../types/questions";
import {
  Button,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Typography,
  type FormInstance,
} from "antd";
import type { ISubject } from "../../types/subject";
import type { ITopic } from "../../types/topic";
import {
  emptyDocument,
  hasMeaningfulContent,
  hasValidMedia,
} from "../../editor/editorUtils";
import RichTextEditor from "../../editor/RichTextEditor";
import RichTextViewer from "../../editor/RichTextViewer";
import ChoiceOptionsForm from "./ChoiceOptionsForm";
import { v4 as uuidv4 } from "uuid";
import ShortAnswerFields from "./ShortAnswerFields";
import MultipleChoicePreview from "./MultipleChoicePreview";
import ShortAnswerPreview from "./ShortAnswerPreview";
import SingleChoisePreview from "./SingleChoicePreview";
import {
  DEFAULT_CHOICE_CORRECT_POINTS,
  DEFAULT_CHOICE_INCORRECT_POINTS,
} from "../../constants/questionPointDefaults";

interface QuestionModalProps {
  open: boolean;
  loading: boolean;
  editingQuestion: IQuestion | null;
  form: FormInstance<ICreateAndUpdateQuestionRequest>;
  subjects: ISubject[];
  topics: ITopic[];
  onCancel: () => void;
  onSubmit: (values: ICreateAndUpdateQuestionRequest) => void;
}

const isChoiceType = (type: QuestionType | undefined) =>
  type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE";

const QuestionModal = ({
  open,
  loading,
  editingQuestion,
  form,
  subjects,
  topics,
  onCancel,
  onSubmit,
}: QuestionModalProps) => {
  const [previewValues, setPreviewValues] =
    useState<ICreateAndUpdateQuestionRequest | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const selectedSubjectId = Form.useWatch("subjectId", form);
  const selectedType = Form.useWatch("type", form) as QuestionType | undefined;

  const applyTypeChange = (newType: QuestionType) => {
    if (isChoiceType(selectedType) && isChoiceType(newType)) {
      if (newType === "SINGLE_CHOICE") {
        const currentOptions = (form.getFieldValue("options") ??
          []) as IChoiceOption[];

        const firstCorrectIndex = currentOptions.findIndex(
          (option) => option.isCorrect,
        );

        const correctIndex = firstCorrectIndex >= 0 ? firstCorrectIndex : 0;

        const updatedOptions = currentOptions.map((option, index) => {
          const isCorrect = index === correctIndex;

          return {
            ...option,
            isCorrect,
            points: isCorrect
              ? option.points > 0
                ? option.points
                : DEFAULT_CHOICE_CORRECT_POINTS
              : option.points <= 0
                ? option.points
                : DEFAULT_CHOICE_INCORRECT_POINTS,
          };
        });

        form.setFieldValue("options", updatedOptions);
      }

      form.setFieldValue("type", newType);

      setPreviewValues(null);
      setShowAnswer(false);
      return;
    }

    form.setFieldValue("answer", undefined);
    form.setFieldValue("options", undefined);
    form.setFieldValue("acceptedAnswers", undefined);
    form.setFieldValue("caseSensitive", undefined);
    form.setFieldValue("correctPoints", undefined);
    form.setFieldValue("incorrectPoints", undefined);

    if (newType === "FLASHCARD") {
      form.setFieldValue("answer", emptyDocument);
    }

    if (newType === "SINGLE_CHOICE" || newType === "MULTIPLE_CHOICE") {
      form.setFieldValue("options", [
        {
          id: uuidv4(),
          text: "",
          isCorrect: true,
          points: DEFAULT_CHOICE_CORRECT_POINTS,
        },
        {
          id: uuidv4(),
          text: "",
          isCorrect: false,
          points: DEFAULT_CHOICE_INCORRECT_POINTS,
        },
      ]);
    }

    if (newType === "SHORT_ANSWER") {
      form.setFieldsValue({
        acceptedAnswers: [""],
        caseSensitive: false,
        correctPoints: DEFAULT_CHOICE_CORRECT_POINTS,
        incorrectPoints: DEFAULT_CHOICE_INCORRECT_POINTS,
      });
    }

    form.setFieldValue("type", newType);

    setPreviewValues(null);
    setShowAnswer(false);
  };

  const isEditing = editingQuestion !== null;

  const handleTypeChange = (newType: QuestionType) => {
    if (isEditing || newType === selectedType) return;

    const currentAnswer = form.getFieldValue("answer");

    if (isChoiceType(selectedType) && isChoiceType(newType)) {
      applyTypeChange(newType);
      return;
    }

    const currentOptions = (form.getFieldValue("options") ??
      []) as IChoiceOption[];

    const currentAnswers = (form.getFieldValue("acceptedAnswers") ??
      []) as string[];

    const hasExistingContent =
      hasMeaningfulContent(currentAnswer) ||
      currentOptions.some((option) => Boolean(option.text?.trim())) ||
      currentAnswers.some((answer) => Boolean(answer?.trim()));

    if (hasExistingContent) {
      Modal.confirm({
        title: "Change question type?",
        content:
          "Changing the question type will remove the existing answer or option content.",
        okText: "Change Type",
        onOk: () => applyTypeChange(newType),
      });

      return;
    }

    applyTypeChange(newType);
  };

  const filteredTopics = topics.filter(
    (topic) => topic.subjectId === selectedSubjectId,
  );

  useEffect(() => {
    setPreviewValues(null);
    setShowAnswer(false);
  }, [open, editingQuestion?.id]);

  const handlePreview = async () => {
    try {
      const values = await form.validateFields();

      setPreviewValues({
        ...values,
        description: hasMeaningfulContent(values.description)
          ? values.description
          : null,
      });

      setShowAnswer(false);
    } catch {
      // Ant Design displays the validation errors.
    }
  };

  const handleFinish = (values: ICreateAndUpdateQuestionRequest) => {
    onSubmit({
      ...values,
      description: hasMeaningfulContent(values.description)
        ? values.description
        : null,
    });
  };

  return (
    <Modal
      title={isEditing ? "Edit Question" : "Add New Question"}
      open={open}
      width={850}
      onCancel={onCancel}
      closable={!loading}
      keyboard={!loading}
      destroyOnHidden
      styles={{
        body: {
          maxHeight: "70vh",
          overflowY: "auto",
        },
      }}
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>,

        <Button
          key="preview"
          disabled={loading || !selectedType}
          onClick={() => {
            if (previewValues) {
              setPreviewValues(null);
            } else {
              void handlePreview();
            }
          }}
        >
          {previewValues ? "Back to Editing" : "Preview"}
        </Button>,

        <Button
          key="save"
          type="primary"
          loading={loading}
          disabled={loading || !!previewValues}
          onClick={() => form.submit()}
        >
          {isEditing ? "Save Changes" : "Create Question"}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        style={{
          display: previewValues ? "none" : undefined,
        }}
      >
        <Form.Item
          name="type"
          hidden
          rules={[
            {
              required: true,
              message: "Please select a question type",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Question Type" required>
          <Select
            placeholder="Select question type"
            value={selectedType}
            onChange={handleTypeChange}
            disabled={isEditing}
            options={[
              { label: "Flashcard", value: "FLASHCARD" },
              { label: "Single Choice", value: "SINGLE_CHOICE" },
              { label: "Multiple Choice", value: "MULTIPLE_CHOICE" },
              { label: "Short Answer", value: "SHORT_ANSWER" },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Question Title"
          name="text"
          rules={[
            {
              required: true,
              whitespace: true,
              message: "Please enter a question title",
            },
          ]}
        >
          <Input placeholder="e.g. What is an interface in Java?" />
        </Form.Item>

        <Form.Item
          label="Subject"
          name="subjectId"
          rules={[
            {
              required: true,
              message: "Please select a subject",
            },
          ]}
        >
          <Select
            placeholder="Select subject"
            options={subjects.map((subject) => ({
              label: subject.name,
              value: subject.id,
            }))}
            onChange={() => {
              form.setFieldValue("topicIds", []);
            }}
          />
        </Form.Item>

        <Form.Item
          label="Topics"
          name="topicIds"
          rules={[
            {
              required: true,
              type: "array",
              min: 1,
              message: "Select at least one topic",
            },
          ]}
        >
          <Select
            mode="multiple"
            placeholder="Select topics"
            disabled={!selectedSubjectId}
            options={filteredTopics.map((topic) => ({
              label: topic.name,
              value: topic.id,
            }))}
          />
        </Form.Item>

        <Form.Item
          label="Description (Optional)"
          name="description"
          rules={[
            {
              validator: async (_, value) => {
                if (!hasValidMedia(value)) {
                  throw new Error(
                    "Only valid HTTP(S) links and HTTPS images are allowed",
                  );
                }
              },
            },
          ]}
        >
          <RichTextEditor placeholder="Write additional context for the question..." />
        </Form.Item>

        {selectedType === "FLASHCARD" && (
          <Form.Item
            label="Answer"
            name="answer"
            rules={[
              {
                validator: async (_, value) => {
                  if (!hasMeaningfulContent(value)) {
                    throw new Error("Please enter a meaningful answer");
                  }

                  if (!hasValidMedia(value)) {
                    throw new Error(
                      "Only valid HTTP(S) links and HTTPS images are allowed",
                    );
                  }
                },
              },
            ]}
          >
            <RichTextEditor placeholder="Write the answer to this flashcard..." />
          </Form.Item>
        )}

        {(selectedType === "SINGLE_CHOICE" ||
          selectedType === "MULTIPLE_CHOICE") && (
          <ChoiceOptionsForm type={selectedType} />
        )}

        {selectedType === "SHORT_ANSWER" && <ShortAnswerFields />}
      </Form>
      {previewValues?.type === "FLASHCARD" && (
        <div>
          <Typography.Title level={4}>Flashcard Preview</Typography.Title>

          <Typography.Title level={5}>{previewValues.text}</Typography.Title>

          {previewValues.description && (
            <RichTextViewer content={previewValues.description} />
          )}

          <Space style={{ marginTop: 20 }}>
            <Button
              type="primary"
              onClick={() => setShowAnswer((previous) => !previous)}
            >
              {showAnswer ? "Hide Answer" : "Reveal Answer"}
            </Button>
          </Space>

          {showAnswer && (
            <div style={{ marginTop: 20 }}>
              <Typography.Title level={5}>Answer</Typography.Title>

              <RichTextViewer content={previewValues.answer} />
            </div>
          )}
        </div>
      )}
      {previewValues?.type === "SINGLE_CHOICE" && (
        <SingleChoisePreview question={previewValues} />
      )}

      {previewValues?.type === "MULTIPLE_CHOICE" && (
        <MultipleChoicePreview question={previewValues} />
      )}

      {previewValues?.type === "SHORT_ANSWER" && (
        <ShortAnswerPreview question={previewValues} />
      )}
    </Modal>
  );
};

export default QuestionModal;
