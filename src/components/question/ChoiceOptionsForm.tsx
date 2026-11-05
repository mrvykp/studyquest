import {
  Button,
  Checkbox,
  Flex,
  Form,
  Input,
  InputNumber,
  Radio,
  Typography,
} from "antd";
import { v4 as uuidv4 } from "uuid";
import type {
  ICreateAndUpdateQuestionRequest,
  IChoiceOption,
} from "../../types/questions";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import {
  DEFAULT_CHOICE_CORRECT_POINTS,
  DEFAULT_CHOICE_INCORRECT_POINTS,
} from "../../constants/questionPointDefaults";

interface ChoiceOptionsFormProps {
  type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE";
}

const ChoiceOptionsForm = ({ type }: ChoiceOptionsFormProps) => {
  const form = Form.useFormInstance<ICreateAndUpdateQuestionRequest>();

  const options = Form.useWatch("options", form) as IChoiceOption[] | undefined;

  const handleCorrectChange = (index: number, checked: boolean) => {
    const currentOptions = (form.getFieldValue("options") ??
      []) as IChoiceOption[];

    const updatedOptions = currentOptions.map((option, i) => {
      const isCorrect =
        type === "SINGLE_CHOICE"
          ? i === index
          : i === index
            ? checked
            : option.isCorrect;

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
  };
  return (
    <div>
      <Typography.Title level={5}>Answer Options</Typography.Title>

      <Typography.Text type="secondary">
        {type === "SINGLE_CHOICE"
          ? "Select exactly one correct answer."
          : "Select all correct answers."}
      </Typography.Text>

      <Form.List
        name="options"
        rules={[
          {
            validator: async (_, value: IChoiceOption[] | undefined) => {
              if (
                !Array.isArray(value) ||
                value.length < 2 ||
                value.length > 8
              ) {
                throw new Error("Add between 2 and 8 options");
              }

              const correctCount = value.filter(
                (option) => option?.isCorrect,
              ).length;

              if (type === "SINGLE_CHOICE" && correctCount !== 1) {
                throw new Error("Select exactly one correct option");
              }

              if (
                type === "MULTIPLE_CHOICE" &&
                (correctCount === 0 || correctCount === value.length)
              ) {
                throw new Error(
                  "Select at least one correct and one incorrect option",
                );
              }

              const texts = value.map((option) =>
                (option?.text ?? "").trim().toLowerCase(),
              );

              const nonEmptyTexts = texts.filter(Boolean);

              if (new Set(nonEmptyTexts).size !== nonEmptyTexts.length) {
                throw new Error("Option texts must be unique");
              }
            },
          },
        ]}
      >
        {(fields, { add, remove }, { errors }) => (
          <Flex vertical gap={12} style={{ marginTop: 16 }}>
            {fields.map((field, index) => (
              <div
                key={field.key}
                style={{
                  border: "1px solid #d9d9d9",
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                <Form.Item name={[field.name, "id"]} hidden>
                  <Input />
                </Form.Item>

                <Form.Item
                  name={[field.name, "isCorrect"]}
                  valuePropName="checked"
                  hidden
                >
                  <Checkbox />
                </Form.Item>

                <Flex align="center" gap={12} wrap="wrap">
                  {type === "SINGLE_CHOICE" ? (
                    <Radio
                      aria-label={`Mark option ${index + 1} as correct`}
                      checked={options?.[field.name]?.isCorrect ?? false}
                      onChange={() => handleCorrectChange(field.name, true)}
                    />
                  ) : (
                    <Checkbox
                      aria-label={`Mark option ${index + 1} as correct`}
                      checked={options?.[field.name]?.isCorrect ?? false}
                      onChange={(event) =>
                        handleCorrectChange(field.name, event.target.checked)
                      }
                    />
                  )}

                  <Form.Item
                    name={[field.name, "text"]}
                    style={{
                      flex: "1 1 220px",
                      minWidth: 160,
                      marginBottom: 0,
                    }}
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: "Enter option text",
                      },
                    ]}
                  >
                    <Input placeholder={`Option ${index + 1}`} />
                  </Form.Item>

                  <Form.Item
                    name={[field.name, "points"]}
                    style={{ marginBottom: 0 }}
                    rules={[
                      {
                        validator: async (_, value: number) => {
                          if (
                            !Number.isInteger(value) ||
                            value < -100 ||
                            value > 100
                          ) {
                            throw new Error("Use an integer from -100 to 100");
                          }

                          const currentOptions = (form.getFieldValue(
                            "options",
                          ) ?? []) as IChoiceOption[];

                          const isCorrect =
                            currentOptions[field.name]?.isCorrect;

                          if (isCorrect && value <= 0) {
                            throw new Error("Correct points must be positive");
                          }

                          if (!isCorrect && value > 0) {
                            throw new Error(
                              "Incorrect points must be zero or negative",
                            );
                          }
                        },
                      },
                    ]}
                  >
                    <InputNumber
                      aria-label={`Points for option ${index + 1}`}
                      min={-100}
                      max={100}
                      precision={0}
                      style={{ width: 90 }}
                    />
                  </Form.Item>

                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    aria-label={`Delete option ${index + 1}`}
                    disabled={fields.length <= 2}
                    onClick={() => remove(field.name)}
                  />
                </Flex>
              </div>
            ))}
            <Button
              type="dashed"
              block
              icon={<PlusOutlined />}
              disabled={fields.length >= 8}
              onClick={() =>
                add({
                  id: uuidv4(),
                  text: "",
                  isCorrect: false,
                  points: DEFAULT_CHOICE_INCORRECT_POINTS,
                })
              }
            >
              Add Option
            </Button>

            <Form.ErrorList errors={errors} />
          </Flex>
        )}
      </Form.List>
    </div>
  );
};

export default ChoiceOptionsForm;
