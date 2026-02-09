import { MailOutlined, PhoneOutlined, UserOutlined } from "@ant-design/icons";
import { Col, Input, Modal, Row, Form, Divider, Button } from "antd";
import { useForm } from "antd/es/form/Form";
import React, { useEffect, useState } from "react";
import type { userInforamation } from "../features/dashboard/InstructorService";
interface ModalAddingStudentProps {
  dataUpdate?: userInforamation | unknown;
  isModalOpen: boolean;
  handleCancel: () => void;
  onFinishAddStudent: (value: userInforamation) => void;
}

const ModalAddingStudent = (props: ModalAddingStudentProps) => {
  const { isModalOpen, handleCancel, onFinishAddStudent, dataUpdate } = props;
  const [form] = useForm();
  const [loading, setLoading] = useState(false);

  const fillDataUpdate = () => {
    if (dataUpdate) {
      form.setFieldsValue(dataUpdate);
    }
  };

  useEffect(() => {
    fillDataUpdate();
  }, [dataUpdate]);

  return (
    <Modal
      title={<div className="text-xl font-bold py-2">Add New Student</div>}
      open={isModalOpen}
      onCancel={() => {
        handleCancel();
        form.resetFields();
      }}
      footer={null}
      width={600}
      className="rounded-2xl overflow-hidden"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={(val) => {
          setLoading(true);
          onFinishAddStudent(val);
          setLoading(false);
        }}
        requiredMark="optional"
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Full Name"
              name="fullName"
              rules={[{ required: true, message: "Please enter full name" }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="full name"
                size="large"
                className="rounded-lg"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Email Address"
              name="email"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Please enter valid email",
                },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="robert@example.com"
                size="large"
                className="rounded-lg"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Phone Number"
              name="phone"
              rules={[{ required: true, message: "Please enter phone number" }]}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="+1 (555) 000-0000"
                size="large"
                className="rounded-lg"
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="id"></Form.Item>
        {/* <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Class / Batch"
              name="batch"
              rules={[{ required: true, message: "Select a class" }]}
            >
              <Select
                placeholder="Select class"
                size="large"
                className="rounded-lg w-full"
              >
                <Option value="react-basic">React Basics (Batch A)</Option>
                <Option value="advanced-js">Advanced JS (Batch B)</Option>
                <Option value="ui-design">UI/UX Design</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Admission Date" name="date">
              <Input type="date" size="large" className="rounded-lg" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Notes (Optional)" name="notes">
          <Input.TextArea
            placeholder="Any additional notes..."
            rows={3}
            className="rounded-lg"
          />
        </Form.Item> */}

        <Divider className="my-4" />

        <div className="flex justify-end gap-3">
          <Button
            onClick={handleCancel}
            size="large"
            className="rounded-lg px-8"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            className="rounded-lg px-8 bg-blue-600 font-bold"
            loading={loading}
          >
            Save
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
export default ModalAddingStudent;
