import {
  Button,
  Flex,
  Typography,
  Space,
  Table,
  Alert,
  Form,
  Modal,
  Input,
} from "antd";
import type { TableProps } from "antd";
import type {
  ICreateAndUpdateSubjectRequest,
  ISubject,
} from "../types/subject";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSubject,
  deleteSubject,
  getSubjects,
  updateSubject,
} from "../services/subjectService";
import { getTopics } from "../services/topicService";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useState } from "react";
import SubjectModal from "../components/subject/SubjectModal";
import { useNotify } from "../hooks/useNotify";
import { useNavigate } from "react-router-dom";

const SubjectsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const notify = useNotify();
  const [form] = Form.useForm();
  const [editingSubject, setEditingSubject] = useState<ISubject | null>(null);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  const {
    data: subjects = [],
    isPending: subjectsLoading,
    isError: subjectsLoadingError,
  } = useQuery({
    queryKey: ["subjects"],
    queryFn: getSubjects,
  });

  const {
    data: topics,
    isPending: topicsLoading,
    isError: topicsLoadingError,
  } = useQuery({
    queryKey: ["topics"],
    queryFn: getTopics,
  });

  const filteredSubjects = subjects.filter((subject) =>
    subject.name.toLowerCase().includes(searchText.trim().toLowerCase()),
  );

  const createSubjectMutation = useMutation({
    mutationFn: createSubject,
    onSuccess: async (newSubject) => {
      await queryClient.invalidateQueries({
        queryKey: ["subjects"],
      });

      setIsModalOpen(false);

      notify.success(
        "Subject created",
        `"${newSubject.name}" was created successfully.`,
      );
    },

    onError: (error) => {
      console.error("Failed to create subject:", error);

      notify.error("Subject creation failed", "Please try again.");
    },
  });

  const updateSubjectMutation = useMutation({
    mutationFn: ({
      subjectId,
      request,
    }: {
      subjectId: string;
      request: ICreateAndUpdateSubjectRequest;
    }) => updateSubject(subjectId, request),

    onSuccess: async (updatedSubject) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["subjects"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["subject", updatedSubject.id],
        }),
      ]);

      notify.success("Subject updated", "Changes saved successfully.");

      form.resetFields();
      setEditingSubject(null);
      setIsModalOpen(false);
    },

    onError: (error) => {
      console.error("Failed to update subject:", error);

      notify.error("Failed to update subject", error.message);
    },
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: (subject: ISubject) => deleteSubject(subject.id),

    onSuccess: (_, deletedSubject) => {
      queryClient.invalidateQueries({
        queryKey: ["subjects"],
      });
      queryClient.removeQueries({
        queryKey: ["subject", deletedSubject.id],
      });

      notify.success(
        "Subject deleted",
        `"${deletedSubject.name}" was deleted successfully.`,
      );
    },

    onError: (error) => {
      console.error("Failed to delete subject:", error);

      notify.error("Delete failed", "The subject could not be deleted.");
    },
  });

  const showCreateModal = () => {
    setEditingSubject(null);
    form.resetFields();

    setIsModalOpen(true);
  };

  const showEditModal = (subject: ISubject) => {
    setEditingSubject(subject);

    form.setFieldsValue({
      name: subject.name,
      description: subject.description,
    });

    setIsModalOpen(true);
  };

  const handleDeleteSubject = (subject: ISubject) => {
    Modal.confirm({
      title: "Delete this subject?",
      content: `Are you sure you want to delete "${subject.name}"?`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",

      onOk: async () => deleteSubjectMutation.mutateAsync(subject),
    });
  };

  const onFinish = (values: ICreateAndUpdateSubjectRequest) => {
    if (editingSubject) {
      updateSubjectMutation.mutate({
        subjectId: editingSubject.id,
        request: values,
      });

      return;
    }

    createSubjectMutation.mutate(values);
  };

  const handleCancel = () => {
    form.resetFields();
    setEditingSubject(null);
    setIsModalOpen(false);
  };

  const columns: TableProps<ISubject>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },

    {
      title: "Number of Topics",
      key: "topics",
      render: (_, record) => {
        return topics?.filter((topic) => topic.subjectId === record.id).length;
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
              handleDeleteSubject(record);
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Flex justify="space-between" align="center">
        <Typography.Title level={2}>Subjects</Typography.Title>

        <Button type="primary" onClick={showCreateModal}>
          Add Subject
        </Button>
      </Flex>

      <Input.Search
        placeholder="Search subjects by name..."
        allowClear
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ width: 300, marginBottom: 20 }}
      />

      {(subjectsLoadingError || topicsLoadingError) && (
        <Alert
          type="error"
          title="Failed to load subjects"
          description="Please check if JSON Server is running."
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Table<ISubject>
        columns={columns}
        dataSource={filteredSubjects}
        rowKey="id"
        loading={subjectsLoading || topicsLoading}
        onRow={(record) => ({
          onClick: () => navigate(`/subjects/${record.id}`),
          style: { cursor: "pointer" },
        })}
      />

      <SubjectModal
        open={isModalOpen}
        loading={
          createSubjectMutation.isPending || updateSubjectMutation.isPending
        }
        editingSubject={editingSubject}
        form={form}
        onCancel={handleCancel}
        onSubmit={onFinish}
      />
    </div>
  );
};

export default SubjectsPage;
