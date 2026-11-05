import type { ICreateAndUpdateTopicRequest, ITopic } from "../../types/topic";
import { Form, Input, Modal, type FormInstance } from "antd";

interface TopicModalProps {
  open: boolean;
  loading: boolean;
  editingTopic: ITopic | null;
  form: FormInstance<ICreateAndUpdateTopicRequest>;
  onCancel: () => void;
  onSubmit: (values: ICreateAndUpdateTopicRequest) => void;
}

const TopicModal = ({
  open,
  loading,
  editingTopic,
  form,
  onCancel,
  onSubmit,
}: TopicModalProps) => {
  const isEditing = editingTopic !== null;

  return (
    <Modal
      title={isEditing ? "Edit Topic" : "Add New Topic"}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={isEditing ? "Save Changes" : "Create"}
      confirmLoading={loading}
      okButtonProps={{ disabled: loading }}
      cancelButtonProps={{ disabled: loading }}
      closable={!loading}
      afterClose={() => form.resetFields()}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Please enter a Topic Name" }]}
        >
          <Input placeholder="e.g. Algebra" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TopicModal;
