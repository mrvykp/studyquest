import { Alert, Card, Form, message, Typography } from "antd";
import type {
  IQuizDraft,
  IQuizSettings,
  ScoredQuestionType,
} from "../types/quiz";
import { useNavigate } from "react-router-dom";
import { useQuizBuilder } from "../hooks/useQuizzes";
import {
  getEligibleQuizQuestions,
  selectRandomQuizQuestions,
} from "../utils/quizSelection";
import { useEffect } from "react";
import QuizSettingsForm from "../components/quiz/QuizSettingsForm";

const QuizBuilderPage = () => {
  const [form] = Form.useForm<IQuizSettings>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const selectedSubjectId = Form.useWatch("subjectId", form) as
    | string
    | undefined;

  const selectedTopicIds = (Form.useWatch("selectedTopicIds", form) ??
    []) as string[];

  const selectedQuestionTypes = (Form.useWatch("questionTypes", form) ??
    []) as ScoredQuestionType[];

  const { subjectsQuery, topicsQuery, candidateQuestionsQuery } =
    useQuizBuilder(selectedSubjectId);

  const subjectOptions = (subjectsQuery.data ?? []).map((subject) => ({
    label: subject.name,
    value: subject.id,
  }));

  const topicOptions = (topicsQuery.data ?? [])
    .filter((topic) => topic.subjectId === selectedSubjectId)
    .map((topic) => ({
      label: topic.name,
      value: topic.id,
    }));

  const eligibleQuestions = getEligibleQuizQuestions(
    candidateQuestionsQuery.data ?? [],
    selectedSubjectId ?? "",
    selectedTopicIds,
    selectedQuestionTypes,
  );

  const availableQuestionCount = eligibleQuestions.length;

  useEffect(() => {
    const currentCount = form.getFieldValue("count") as number | undefined;

    if (availableQuestionCount === 0) {
      if (currentCount !== undefined) {
        form.setFieldValue("count", undefined);
      }
      return;
    }

    if (
      typeof currentCount !== "number" ||
      !Number.isInteger(currentCount) ||
      currentCount < 1 ||
      currentCount > availableQuestionCount
    ) {
      form.setFieldValue("count", Math.min(5, availableQuestionCount));
    }
  }, [availableQuestionCount, form]);

  const handleGenerateQuiz = (values: IQuizSettings) => {
    try {
      if (
        candidateQuestionsQuery.isFetching ||
        candidateQuestionsQuery.isError
      ) {
        throw new Error("Questions are not ready yet");
      }

      const matchingQuestions = getEligibleQuizQuestions(
        candidateQuestionsQuery.data ?? [],
        values.subjectId,
        values.selectedTopicIds,
        values.questionTypes,
      );

      const selectedQuestions = selectRandomQuizQuestions(
        matchingQuestions,
        values.count,
      );

      const questionSnapshots = structuredClone(selectedQuestions);

      const quizDraft: IQuizDraft = {
        settings: {
          ...values,
          selectedTopicIds: [...values.selectedTopicIds],
          questionTypes: [...values.questionTypes],
        },
        questionSnapshots,
        startedAt: new Date().toISOString(),
      };

      navigate("/quizzes/play", {
        state: { quizDraft },
      });
    } catch (error) {
      messageApi.error(
        error instanceof Error ? error.message : "Failed to generate quiz",
      );
    }
  };

  const generatingDisabled =
    !selectedSubjectId ||
    selectedQuestionTypes.length === 0 ||
    availableQuestionCount === 0 ||
    candidateQuestionsQuery.isFetching ||
    candidateQuestionsQuery.isError ||
    subjectsQuery.isError ||
    topicsQuery.isError;

  return (
    <Card title="Quiz Builder" style={{ maxWidth: 700, margin: "24px auto" }}>
      {contextHolder}

      <Typography.Paragraph type="secondary">
        Select your subject, topics, question types, and the number of questions
        to generate a quiz.
      </Typography.Paragraph>

      {(subjectsQuery.isError || topicsQuery.isError) && (
        <Alert
          type="error"
          showIcon
          title="Could not load subjects or topics"
          style={{ marginBottom: 16 }}
        />
      )}

      {candidateQuestionsQuery.isError && (
        <Alert
          type="error"
          showIcon
          title="Could not load questions"
          style={{ marginBottom: 16 }}
        />
      )}

      <QuizSettingsForm
        form={form}
        subjectOptions={subjectOptions}
        topicOptions={topicOptions}
        availableQuestionCount={availableQuestionCount}
        subjectsLoading={subjectsQuery.isPending}
        topicsLoading={topicsQuery.isPending}
        generatingDisabled={generatingDisabled}
        onGenerate={handleGenerateQuiz}
      />
    </Card>
  );
};

export default QuizBuilderPage;
