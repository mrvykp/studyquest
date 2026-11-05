import {
  Button,
  Checkbox,
  Form,
  InputNumber,
  Select,
  Typography,
  type FormInstance,
} from "antd";
import type { IQuizSettings, ScoredQuestionType } from "../../types/quiz";

interface SelectOption {
  label: string;
  value: string;
}

interface QuizSettingsFormProps {
  form: FormInstance<IQuizSettings>;
  subjectOptions: SelectOption[];
  topicOptions: SelectOption[];
  availableQuestionCount: number;
  subjectsLoading: boolean;
  topicsLoading: boolean;
  generatingDisabled: boolean;
  onGenerate: (values: IQuizSettings) => void;
}

const questionTypeOptions: {
  label: string;
  value: ScoredQuestionType;
}[] = [
  { label: "Single Choice", value: "SINGLE_CHOICE" },
  { label: "Multiple Choice", value: "MULTIPLE_CHOICE" },
  { label: "Short Answer", value: "SHORT_ANSWER" },
];

const QuizSettingsForm = ({
  form,
  subjectOptions,
  topicOptions,
  availableQuestionCount,
  subjectsLoading,
  topicsLoading,
  generatingDisabled,
  onGenerate,
}: QuizSettingsFormProps) => {
  const selectedSubjectId = Form.useWatch("subjectId", form);

  return (
    <Form<IQuizSettings>
      form={form}
      layout="vertical"
      onFinish={onGenerate}
      initialValues={{
        selectedTopicIds: [],
        questionTypes: ["SINGLE_CHOICE", "MULTIPLE_CHOICE", "SHORT_ANSWER"],
      }}
    >
      <Form.Item
        name="subjectId"
        label="Subject"
        rules={[{ required: true, message: "Select a subject" }]}
      >
        <Select
          placeholder="Choose a subject"
          loading={subjectsLoading}
          options={subjectOptions}
          onChange={() => {
            form.setFieldsValue({
              selectedTopicIds: [],
              count: undefined,
            });
          }}
        />
      </Form.Item>

      <Form.Item name="selectedTopicIds" label="Topics (Optional)">
        <Select
          mode="multiple"
          placeholder="All topics"
          disabled={!selectedSubjectId}
          loading={topicsLoading}
          options={topicOptions}
        />
      </Form.Item>

      <Form.Item
        name="questionTypes"
        label="Question Types"
        rules={[
          {
            type: "array",
            min: 1,
            required: true,
            message: "Select at least one question type",
          },
        ]}
      >
        <Checkbox.Group options={questionTypeOptions} />
      </Form.Item>

      <Form.Item
        name="count"
        label="Number of Questions"
        rules={[
          {
            required: true,
            message: "Choose the number of questions",
          },
          {
            validator: async (_, value: number | undefined) => {
              if (
                typeof value !== "number" ||
                !Number.isInteger(value) ||
                value < 1 ||
                value > availableQuestionCount
              ) {
                throw new Error("Enter a valid number of available questions");
              }
            },
          },
        ]}
      >
        <InputNumber
          min={1}
          max={availableQuestionCount}
          precision={0}
          disabled={availableQuestionCount === 0}
          style={{ width: 150 }}
        />
      </Form.Item>

      <Typography.Paragraph type="secondary">
        Available Questions: {availableQuestionCount}
      </Typography.Paragraph>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          block
          disabled={generatingDisabled}
        >
          Generate Quiz
        </Button>
      </Form.Item>
    </Form>
  );
};
export default QuizSettingsForm;
