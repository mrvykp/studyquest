import {
  Alert,
  Button,
  Card,
  Form,
  InputNumber,
  message,
  Select,
  Typography,
} from "antd";
import { useForm } from "antd/es/form/Form";
import { useNavigate } from "react-router-dom";
import { usePracticeSetup } from "../hooks/usePractice";
import {
  getEligibleFlashcards,
  selectedRandomFlashcards,
} from "../utils/practiceSelection";
import { useEffect } from "react";

interface PracticeSetupFormValues {
  subjectId: string;
  selectedTopicIds: string[];
  count: number;
}
const PracticeSetupPage = () => {
  const [form] = useForm<PracticeSetupFormValues>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const subjectId = Form.useWatch("subjectId", form) as string | undefined;

  const selectedTopicIds = (Form.useWatch("selectedTopicIds", form) ??
    []) as string[];

  const { subjectsQuery, topicsQuery, flashcardsQuery, startSessionMutation } =
    usePracticeSetup(subjectId);

  const filteredTopics = (topicsQuery.data ?? []).filter(
    (topic) => topic.subjectId === subjectId,
  );

  const eligibleCards = getEligibleFlashcards(
    flashcardsQuery.data ?? [],
    subjectId ?? "",
    selectedTopicIds,
  );

  const availableCount = eligibleCards.length;

  useEffect(() => {
    const currentCount = form.getFieldValue("count");

    if (availableCount === 0) {
      form.setFieldValue("count", undefined);
    } else if (
      !Number.isInteger(currentCount) ||
      currentCount < 1 ||
      currentCount > availableCount
    ) {
      form.setFieldValue("count", Math.min(10, availableCount));
    }
  }, [availableCount, form]);

  const handleStart = async (values: PracticeSetupFormValues) => {
    try {
      const selectedCards = selectedRandomFlashcards(
        eligibleCards,
        values.count,
      );

      const session = await startSessionMutation.mutateAsync({
        subjectId: values.subjectId,
        selectedTopicIds: values.selectedTopicIds,
        questionIds: selectedCards.map((card) => card.id),
      });

      navigate(`/practice/${session.id}`);
    } catch (error) {
      messageApi.error(
        error instanceof Error ? error.message : "Failed to start practice",
      );
    }
  };
  return (
    <Card title="Daily Practice" style={{ maxWidth: 650, margin: "24px auto" }}>
      {contextHolder}
      <Typography.Paragraph type="secondary">
        Choose a subject, topics, and how many Flashcards you want to practice.
      </Typography.Paragraph>

      <Form
        form={form}
        layout="vertical"
        initialValues={{ selectedTopicIds: [] }}
        onFinish={handleStart}
      >
        <Form.Item
          name="subjectId"
          label="Subject"
          rules={[{ required: true, message: "Select a subject" }]}
        >
          <Select
            placeholder="Choose a subject"
            loading={subjectsQuery.isPending}
            options={(subjectsQuery.data ?? []).map((subject) => ({
              label: subject.name,
              value: subject.id,
            }))}
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
            disabled={!subjectId}
            loading={topicsQuery.isPending}
            options={filteredTopics.map((topic) => ({
              label: topic.name,
              value: topic.id,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="count"
          label="Number of Cards"
          rules={[
            { required: true, message: "Choose a card count" },
            {
              validator: async (_, value: number) => {
                if (
                  !Number.isInteger(value) ||
                  value < 1 ||
                  value > availableCount
                ) {
                  throw new Error("Choose a valid number of available cards");
                }
              },
            },
          ]}
        >
          <InputNumber
            min={1}
            max={availableCount}
            precision={0}
            style={{ width: 150 }}
            disabled={availableCount === 0}
          />
        </Form.Item>

        <Typography.Paragraph type="secondary">
          Available Flashcards: {availableCount}
        </Typography.Paragraph>

        {flashcardsQuery.isError && (
          <Alert
            type="error"
            showIcon
            title="Could not load Flashcards"
            style={{ marginBottom: 16 }}
          />
        )}

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={startSessionMutation.isPending}
            disabled={
              !subjectId ||
              availableCount === 0 ||
              flashcardsQuery.isFetching ||
              flashcardsQuery.isError
            }
          >
            Start Practice
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default PracticeSetupPage;
