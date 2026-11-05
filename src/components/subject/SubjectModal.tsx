import { Form, Input, Modal } from "antd";
import type {
  ICreateAndUpdateSubjectRequest,
  ISubject,
} from "../../types/subject";
import type { FormInstance } from "antd";

interface SubjectModalProps {
  open: boolean;
  loading: boolean;
  editingSubject: ISubject | null;
  form: FormInstance<ICreateAndUpdateSubjectRequest>;
  onCancel: () => void;
  onSubmit: (values: ICreateAndUpdateSubjectRequest) => void;
}

const SubjectModal = ({
  open,
  loading,
  editingSubject,
  form,
  onCancel,
  onSubmit,
}: SubjectModalProps) => {
  const isEditing = editingSubject !== null;

  return (
    <Modal
      title={isEditing ? "Edit Subject" : "Add New Subject"}
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
          rules={[{ required: true, message: "Please enter a Subject Name" }]}
        >
          <Input placeholder="e.g. Mathetmatics" />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input.TextArea
            rows={3}
            placeholder="Enter subject description (optional)"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SubjectModal;
