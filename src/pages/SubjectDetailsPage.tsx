import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getSubjectById } from "../services/subjectService";
import {
  createTopic,
  deleteTopic,
  getTopicsBySubjectId,
  updateTopic,
} from "../services/topicService";
import {
  Alert,
  Button,
  Divider,
  Flex,
  Form,
  Modal,
  Space,
  Spin,
  Table,
  Typography,
  type TableProps,
} from "antd";
import type { ICreateAndUpdateTopicRequest, ITopic } from "../types/topic";
import { getQuestions } from "../services/questionService";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useNotify } from "../hooks/useNotify";
import { useState } from "react";
import TopicModal from "../components/topic/TopicModal";

const SubjectDetailsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<ITopic | null>(null);
  const { subjectId } = useParams<{ subjectId: string }>();
  const queryClient = useQueryClient();
  const notify = useNotify();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const {
    data: subject,
    isPending: subjectLoading,
    isError: subjectError,
  } = useQuery({
    queryKey: ["subject", subjectId],
    queryFn: () => getSubjectById(subjectId!),
    enabled: !!subjectId,
  });

  const {
    data: subjectTopics = [],
    isPending: topicsLoading,
    isError: topicsError,
  } = useQuery({
    queryKey: ["topics", subjectId],
    queryFn: () => getTopicsBySubjectId(subjectId!),
    enabled: !!subjectId,
  });

  const {
    data: questions,
    isPending: questionsLoading,
    isError: questionsLoadingError,
  } = useQuery({
    queryKey: ["questions"],
    queryFn: getQuestions,
  });

  const createTopicMutation = useMutation({
    mutationFn: (values: ICreateAndUpdateTopicRequest) =>
      createTopic(subjectId!, values),

    onSuccess: async (newTopic) => {
      await queryClient.invalidateQueries({
        queryKey: ["topics"],
      });

      setIsModalOpen(false);

      notify.success(
        "Topic created",
        `"${newTopic.name}" was created successfully.`,
      );
    },

    onError: (error) => {
      console.error("Failed to create topic:", error);

      notify.error("Topic creation failed", "Please try again.");
    },
  });

  const updateTopicMutation = useMutation({
    mutationFn: ({
      topicId,
      request,
    }: {
      topicId: string;
      request: ICreateAndUpdateTopicRequest;
    }) => updateTopic(topicId, request),

    onSuccess: async (updatedTopic) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["topics"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["topic", updatedTopic.id],
        }),
      ]);

      notify.success("Topic updated", "Changes saved successfully.");

      form.resetFields();
      setEditingTopic(null);
      setIsModalOpen(false);
    },

    onError: (error) => {
      console.error("Failed to update topic:", error);

      notify.error("Failed to update topic", error.message);
    },
  });

  const deleteTopicMutation = useMutation({
    mutationFn: (topic: ITopic) => deleteTopic(topic.id),

    onSuccess: (_, deletedTopic) => {
      queryClient.invalidateQueries({
        queryKey: ["topics"],
      });
      queryClient.removeQueries({
        queryKey: ["topic", deletedTopic.id],
      });

      notify.success(
        "Topic deleted",
        `"${deletedTopic.name}" was deleted successfully.`,
      );
    },

    onError: (error) => {
      console.error("Failed to delete topic:", error);

      notify.error("Delete failed", "The topic could not be deleted.");
    },
  });

  const showCreateModal = () => {
    setEditingTopic(null);
    form.resetFields();

    setIsModalOpen(true);
  };

  const showEditModal = (topic: ITopic) => {
    setEditingTopic(topic);

    form.setFieldsValue({
      name: topic.name,
    });

    setIsModalOpen(true);
  };

  const handleDeleteTopic = (topic: ITopic) => {
    Modal.confirm({
      title: "Delete this topic?",
      content: `Are you sure you want to delete "${topic.name}"?`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",

      onOk: async () => deleteTopicMutation.mutateAsync(topic),
    });
  };

  const onFinish = (values: ICreateAndUpdateTopicRequest) => {
    if (editingTopic) {
      updateTopicMutation.mutate({
        topicId: editingTopic.id,
        request: values,
      });

      return;
    }

    createTopicMutation.mutate(values);
  };

  const handleCancel = () => {
    form.resetFields();
    setEditingTopic(null);
    setIsModalOpen(false);
  };

  if (!subjectId) {
    return <Alert type="error" title="Subject ID is missing" />;
  }

  if (subjectLoading || topicsLoading || questionsLoading) {
    return <Spin />;
  }

  if (subjectError || topicsError || questionsLoadingError) {
    return (
      <Alert
        type="error"
        title="Failed to load subject details"
        description="Please check the subject ID and JSON Server."
        showIcon
      />
    );
  }

  const columns: TableProps<ITopic>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Number of Questions",
      key: "questions",
      render: (_, record) => {
        return (
          questions?.filter((question) => question.topicIds.includes(record.id))
            .length ?? 0
        );
      },
    },

    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
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
              handleDeleteTopic(record);
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Link
        to="/subjects"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 20,
        }}
      >
        <ArrowLeftOutlined />
        Back to Subjects
      </Link>

      <Flex justify="space-between" align="start" wrap="wrap" gap={16}>
        <div>
          <Typography.Title level={2} style={{ marginBottom: 4 }}>
            {subject.name}
          </Typography.Title>

          <Typography.Paragraph type="secondary">
            {subject.description || "No description provided."}
          </Typography.Paragraph>
        </div>

        <Button
          icon={<ArrowRightOutlined />}
          onClick={() => navigate(`/questions?subjectId=${subjectId}`)}
        >
          View All Questions
        </Button>
      </Flex>

      <Divider style={{ margin: "24px 0" }} />

      <Flex
        justify="space-between"
        align="center"
        wrap="wrap"
        gap={16}
        style={{ marginBottom: 20 }}
      >
        <Flex align="center" gap={12}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Topics
          </Typography.Title>

          <Typography.Text type="secondary">
            ({subjectTopics.length})
          </Typography.Text>
        </Flex>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showCreateModal}
        >
          Add Topic
        </Button>
      </Flex>

      <Table<ITopic>
        columns={columns}
        rowKey="id"
        dataSource={subjectTopics}
        loading={topicsLoading || questionsLoading}
        pagination={{ pageSize: 10 }}
        locale={{
          emptyText: "No topics yet. Add your first topic.",
        }}
        onRow={(record) => ({
          onClick: () =>
            navigate(`/questions?subjectId=${subjectId}&topicId=${record.id}`),
          style: { cursor: "pointer" },
        })}
      />

      <TopicModal
        open={isModalOpen}
        loading={createTopicMutation.isPending}
        editingTopic={editingTopic}
        form={form}
        onCancel={handleCancel}
        onSubmit={onFinish}
      />
    </div>
  );
};

export default SubjectDetailsPage;
