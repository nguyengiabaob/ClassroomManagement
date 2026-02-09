import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Badge,
  Button,
  Card,
  Col,
  message,
  Row,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import ModalAddingStudent from "../../components/ModalAddingStudent";
import { useEffect, useState } from "react";
import {
  addNewStudents,
  getStudents,
  updateStudents,
  type userInforamation,
} from "./InstructorService";
const { Text, Title } = Typography;
const InstructorDashboardPage = () => {
  // const [view, setView] = useState("dashboard");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [listUsers, setListUsers] = useState<userInforamation[]>();
  const [userData, setUser] = useState<userInforamation | unknown>();
  const columns = [
    {
      title: "Name",
      dataIndex: "fullName",
      key: "name",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    { title: "Phone", dataIndex: "phone", key: "phone" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (value: boolean) => (
        <Tag color={value === true ? "green" : "orange"}>
          {value === true ? "Active" : "non-Active"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (value: unknown, row: unknown) => (
        <Space>
          <Button
            onClick={() => {
              showModal();
              setUser(row);
            }}
            size="small"
            icon={<EditOutlined />}
          />
          <Button size="small" danger icon={<DeleteOutlined />} />
          <Button size="small" type="primary" ghost>
            Message
          </Button>
        </Space>
      ),
    },
  ];

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const getAllStudents = async () => {
    const result = await getStudents();
    if (result.data) {
      console.log("dsadas", result.data);

      setListUsers(result.data);
    } else {
      setListUsers([]);
    }
  };

  const saveStudent = async (value: userInforamation) => {
    if (value) {
      if (userData) {
        const result = await updateStudents(value);
        if (result.data) {
          message.success({
            content: "Updated successfully",
            duration: 2,
          });
          handleCancel();
          getAllStudents();
        } else {
          message.error({
            content: "Updated failed",
            duration: 2,
          });
        }
      }
    } else {
      const result = await addNewStudents(value);
      if (result.data) {
        message.success({
          content: "created successfully",
          duration: 2,
        });
        handleCancel();
        getAllStudents();
      } else {
        message.error({
          content: "created failed",
          duration: 2,
        });
      }
    }
  };

  useEffect(() => {
    (async () => {
      await getAllStudents();
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Title level={3}>Student Management</Title>
        <Button
          onClick={() => {
            showModal();
          }}
          type="primary"
          icon={<PlusOutlined />}
          size="large"
        >
          Add New Student
        </Button>
      </div>

      <Row gutter={16}>
        <Col span={8}>
          <Card className="rounded-xl border-0 shadow-sm">
            <Badge.Ribbon text="Total" color="blue">
              <div className="p-4">
                <Text type="secondary">Total Students</Text>
                <Title level={2} style={{ margin: 0 }}>
                  42
                </Title>
              </div>
            </Badge.Ribbon>
          </Card>
        </Col>
        <Col span={8}>
          <Card className="rounded-xl border-0 shadow-sm">
            <Badge.Ribbon text="This Week" color="green">
              <div className="p-4">
                <Text type="secondary">Lessons Completed</Text>
                <Title level={2} style={{ margin: 0 }}>
                  128
                </Title>
              </div>
            </Badge.Ribbon>
          </Card>
        </Col>
        <Col span={8}>
          <Card className="rounded-xl border-0 shadow-sm">
            <Badge.Ribbon text="Urgent" color="orange">
              <div className="p-4">
                <Text type="secondary">New Messages</Text>
                <Title level={2} style={{ margin: 0 }}>
                  5
                </Title>
              </div>
            </Badge.Ribbon>
          </Card>
        </Col>
      </Row>

      <Card
        title="Student Directory"
        className="shadow-sm border-0 rounded-xl overflow-hidden"
      >
        <Table columns={columns} dataSource={listUsers} />
      </Card>

      <ModalAddingStudent
        dataUpdate={userData}
        handleCancel={handleCancel}
        isModalOpen={isModalOpen}
        onFinishAddStudent={saveStudent}
      />
    </div>
  );
};

export default InstructorDashboardPage;
