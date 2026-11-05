import {
  Button,
  Flex,
  Form,
  Input,
  InputNumber,
  Switch,
  Typography,
} from "antd";
import type { ICreateAndUpdateQuestionRequest } from "../../types/questions";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { normalizeAnswer } from "../../utils/questionValidation";

const ShortAnswerFields = () => {
  const form = Form.useFormInstance<ICreateAndUpdateQuestionRequest>();

  const caseSensitive = Form.useWatch("caseSensitive", form) ?? false;

  return (
    <Flex vertical gap={16}>
      <Typography.Title level={5}>Short Answer Settings</Typography.Title>

      <Typography.Text type="secondary">
        Add all acceptable answers for this question.
      </Typography.Text>

      <Form.List
        name="acceptedAnswers"
        rules={[
          {
            validator: async (_, answers: string[] | undefined) => {
              if (!Array.isArray(answers) || answers.length === 0) {
                throw new Error("Add at least one accepted answer");
              }

              const normalizedAnswers = answers.map((answer) =>
                normalizeAnswer(answer ?? "", caseSensitive),
              );

              if (normalizedAnswers.some((answer) => !answer)) {
                throw new Error("Accepted answers cannot be empty");
              }

              if (
                new Set(normalizedAnswers).size !== normalizedAnswers.length
              ) {
                throw new Error("Accepted answers must be unique");
              }
            },
          },
        ]}
      >
        {(fields, { add, remove }, { errors }) => (
          <Flex vertical gap={12}>
            {fields.map((field, index) => (
              <Flex key={field.key} align="start" gap={8}>
                <Form.Item
                  label={`Accepted Answer ${index + 1}`}
                  name={field.name}
                  style={{ flex: 1, marginBottom: 0 }}
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: "Enter an accepted answer",
                    },
                  ]}
                >
                  <Input placeholder="Enter accepted answer..." />
                </Form.Item>

                <Button
                  danger
                  type="text"
                  icon={<DeleteOutlined />}
                  disabled={fields.length <= 1}
                  onClick={() => remove(field.name)}
                  style={{ marginTop: 30 }}
                />
              </Flex>
            ))}

            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => add("")}
            >
              Add Accepted Answer
            </Button>
            <Form.ErrorList errors={errors} />
          </Flex>
        )}
      </Form.List>
      <Form.Item
        name="caseSensitive"
        label="Case Sensitive"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>
      <Flex gap={16} wrap="wrap">
        <Form.Item
          label="Correct Points"
          name="correctPoints"
          rules={[
            {
              validator: async (_, value) => {
                if (!Number.isInteger(value) || value < 1 || value > 100) {
                  throw new Error("Enter an integer from 1 to 100");
                }
              },
            },
          ]}
        >
          <InputNumber min={1} max={100} step={1} />
        </Form.Item>

        <Form.Item
          label="Incorrect Points"
          name="incorrectPoints"
          rules={[
            {
              validator: async (_, value) => {
                if (!Number.isInteger(value) || value < -100 || value > 0) {
                  throw new Error("Enter an integer from -100 to 0");
                }
              },
            },
          ]}
        >
          <InputNumber min={-100} max={0} step={1} />
        </Form.Item>
      </Flex>
    </Flex>
  );
};

export default ShortAnswerFields;
