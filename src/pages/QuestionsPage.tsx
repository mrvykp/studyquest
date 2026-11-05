import {
  Alert,
  Button,
  Flex,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  type TableProps,
} from "antd";
import {
  createQuestion,
  deleteQuestion,
  getQuestions,
  updateQuestion,
} from "../services/questionService";
import { useNotify } from "../hooks/useNotify";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ICreateAndUpdateQuestionRequest,
  IQuestion,
  QuestionType,
} from "../types/questions";
import { useSearchParams } from "react-router-dom";
import { getSubjects } from "../services/subjectService";
import { getTopics } from "../services/topicService";
import { useState } from "react";
import { emptyDocument } from "../editor/editorUtils";
import QuestionModal from "../components/question/QuestionModal";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import QuestionPreviewModal from "../components/question/QuestionPreviewModal";

const QuestionsPage = () => {
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingQuestion, setEditingQuestion] = useState<IQuestion | null>(
    null,
  );

  const [previewQuestion, setPreviewQuestion] = useState<IQuestion | null>(
    null,
  );

  const queryClient = useQueryClient();
  const notify = useNotify();
  const [form] = Form.useForm<ICreateAndUpdateQuestionRequest>();
  const [searchParams, setSearchParams] = useSearchParams();
  const subjectId = searchParams.get("subjectId");
  const selectedTopicIds = searchParams.getAll("topicId");
  const selectedType = searchParams.get("type");

  const {
    data: questions = [],
    isPending: questionsLoading,
    isError: questionsLoadingError,
  } = useQuery({
    queryKey: ["questions"],
    queryFn: getQuestions,
  });

  const {
    data: subjects = [],
    isPending: subjectsLoading,
    isError: subjectsError,
  } = useQuery({
    queryKey: ["subjects"],
    queryFn: getSubjects,
  });

  const {
    data: topics = [],
    isPending: topicsLoading,
    isError: topicsError,
  } = useQuery({
    queryKey: ["topics"],
    queryFn: getTopics,
  });

  const createQuestionMutation = useMutation({
    mutationFn: (values: ICreateAndUpdateQuestionRequest) =>
      createQuestion(values),

    onSuccess: async (newQuestion) => {
      await queryClient.invalidateQueries({
        queryKey: ["questions"],
      });

      form.resetFields();
      setIsModalOpen(false);

      notify.success(
        "Question created",
        `"${newQuestion.text}" was created successfully.`,
      );
    },

    onError: (error) => {
      console.error("Failed to create question:", error);

      notify.error("Question creation failed", error.message);
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: ({
      questionId,
      request,
    }: {
      questionId: string;
      request: ICreateAndUpdateQuestionRequest;
    }) => updateQuestion(questionId, request),

    onSuccess: async (updatedQuestion) => {
      await queryClient.invalidateQueries({
        queryKey: ["questions"],
      });

      notify.success(
        "Question updated",
        `"${updatedQuestion.text}" was updated successfully.`,
      );

      form.resetFields();
      setEditingQuestion(null);
      setIsModalOpen(false);
    },

    onError: (error) => {
      console.error("Failed to update question:", error);

      notify.error("Failed to update question", error.message);
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: (question: IQuestion) => deleteQuestion(question.id),

    onSuccess: async (_, deletedQuestion) => {
      await queryClient.invalidateQueries({
        queryKey: ["questions"],
      });

      notify.success(
        "Question deleted",
        `"${deletedQuestion.text}" was deleted successfully.`,
      );
    },

    onError: (error) => {
      console.error("Failed to delete question:", error);

      notify.error("Delete failed", error.message);
    },
  });

  const filteredQuestions = questions.filter((question) => {
    const matchesSubject = !subjectId || question.subjectId === subjectId;

    const matchesTopics =
      selectedTopicIds.length === 0 ||
      selectedTopicIds.some((topicId) => question.topicIds.includes(topicId));

    const matchesText = question.text
      .toLowerCase()
      .includes(searchText.trim().toLowerCase());

    const matchesType = !selectedType || question.type === selectedType;

    return matchesSubject && matchesTopics && matchesText && matchesType;
  });

  const showCreateModal = () => {
    setEditingQuestion(null);

    form.resetFields();

    form.setFieldsValue({
      type: "FLASHCARD",
      text: "",
      subjectId: undefined,
      topicIds: [],
      description: null,
      answer: emptyDocument,
    });

    setIsModalOpen(true);
  };

  const showEditModal = (question: IQuestion) => {
    setEditingQuestion(question);
    form.resetFields();

    const { id, createdAt, updatedAt, ...formValues } = question;

    form.setFieldsValue(formValues);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setEditingQuestion(null);
    setIsModalOpen(false);
  };

  const handlePreviewQuestion = (question: IQuestion) => {
    setPreviewQuestion(question);
  };

  const handleClosePreview = () => {
    setPreviewQuestion(null);
  };

  const handleSubjectChange = (newSubjectId?: string) => {
    setSearchParams((previous) => {
      const params = new URLSearchParams(previous);

      if (newSubjectId) {
        params.set("subjectId", newSubjectId);
      } else {
        params.delete("subjectId");
      }

      params.delete("topicId");

      return params;
    });
  };

  const handleTopicsChange = (newTopicIds: string[]) => {
    setSearchParams((previous) => {
      const params = new URLSearchParams(previous);

      params.delete("topicId");

      newTopicIds.forEach((id) => {
        params.append("topicId", id);
      });

      return params;
    });
  };

  const handleTypeChange = (newType?: string) => {
    setSearchParams((previous) => {
      const params = new URLSearchParams(previous);

      if (newType) {
        params.set("type", newType);
      } else {
        params.delete("type");
      }

      return params;
    });
  };

  const handleDeleteQuestion = (question: IQuestion) => {
    Modal.confirm({
      title: "Delete this question?",
      content: `Are you sure you want to delete "${question.text}"? This action cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",

      onOk: async () => {
        await deleteQuestionMutation.mutateAsync(question);
      },
    });
  };

  const onFinish = (values: ICreateAndUpdateQuestionRequest) => {
    if (editingQuestion) {
      updateQuestionMutation.mutate({
        questionId: editingQuestion.id,
        request: values,
      });

      return;
    }

    createQuestionMutation.mutate(values);
  };

  const columns: TableProps<IQuestion>["columns"] = [
    {
      title: "Question",
      dataIndex: "text",
      key: "text",
    },
    {
      title: "Subject",
      dataIndex: "subjectId",
      key: "subject",
      render: (subjectId) => {
        const subject = subjects.find((subject) => subject.id === subjectId);

        return subject?.name ?? "Unknown Subject";
      },
    },
    {
      title: "Topics",
      dataIndex: "topicIds",
      key: "topics",
      render: (topicIds: string[]) => (
        <Space size={[4, 4]} wrap>
          {topicIds.map((topicId) => {
            const topic = topics.find((topic) => topic.id === topicId);

            return <Tag key={topicId}>{topic?.name ?? "Unknown Topic"}</Tag>;
          })}
        </Space>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type: QuestionType) => {
        const labels = {
          FLASHCARD: "Flashcard",
          SINGLE_CHOICE: "Single Choice",
          MULTIPLE_CHOICE: "Multiple Choice",
          SHORT_ANSWER: "Short Answer",
        };

        return <Tag>{labels[type]}</Tag>;
      },
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },

    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handlePreviewQuestion(record);
            }}
          />

          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              showEditModal(record);
            }}
          />

          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteQuestion(record);
            }}
          />
        </Space>
      ),
    },
  ];
  return (
    <div>
      <Flex justify="space-between" align="center">
        <Typography.Title level={2}>Questions</Typography.Title>

        <Button type="primary" onClick={showCreateModal}>
          Add Question
        </Button>
      </Flex>

      {(questionsLoadingError || subjectsError || topicsError) && (
        <Alert
          type="error"
          title="Failed to load Question Bank data"
          description="Please check if JSON Server is running."
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Flex gap={12} wrap style={{ marginBottom: 20 }}>
        <Select
          placeholder="All Subjects"
          allowClear
          value={subjectId ?? undefined}
          onChange={handleSubjectChange}
          style={{ width: 200 }}
          options={subjects.map((subject) => ({
            label: subject.name,
            value: subject.id,
          }))}
        />

        <Select
          mode="multiple"
          placeholder="All Topics"
          allowClear
          disabled={!subjectId}
          value={selectedTopicIds}
          onChange={handleTopicsChange}
          style={{ minWidth: 250 }}
          options={topics
            .filter((topic) => topic.subjectId === subjectId)
            .map((topic) => ({
              label: topic.name,
              value: topic.id,
            }))}
        />

        <Select
          placeholder="All Types"
          allowClear
          value={selectedType ?? undefined}
          onChange={handleTypeChange}
          style={{ width: 180 }}
          options={[
            { label: "Flashcard", value: "FLASHCARD" },
            { label: "Single Choice", value: "SINGLE_CHOICE" },
            { label: "Multiple Choice", value: "MULTIPLE_CHOICE" },
            { label: "Short Answer", value: "SHORT_ANSWER" },
          ]}
        />

        <Input.Search
          placeholder="Search questions..."
          allowClear
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 250 }}
        />
      </Flex>

      <Table<IQuestion>
        columns={columns}
        dataSource={filteredQuestions}
        rowKey="id"
        loading={questionsLoading || subjectsLoading || topicsLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
        }}
      />
      <QuestionModal
        open={isModalOpen}
        loading={
          createQuestionMutation.isPending || updateQuestionMutation.isPending
        }
        editingQuestion={editingQuestion}
        form={form}
        subjects={subjects}
        topics={topics}
        onCancel={handleCancel}
        onSubmit={onFinish}
      />

      <QuestionPreviewModal
        open={previewQuestion !== null}
        question={previewQuestion}
        onClose={handleClosePreview}
      />
    </div>
  );
};

export default QuestionsPage;
