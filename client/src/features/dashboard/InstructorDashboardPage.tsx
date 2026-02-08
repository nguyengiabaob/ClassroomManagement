import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Badge,
  Button,
  Card,
  Col,
  Row,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
const { Text, Title } = Typography;
const InstructorDashboardPage = () => {
  // const [view, setView] = useState("dashboard");

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    { title: "Phone", dataIndex: "phone", key: "phone" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "Active" ? "green" : "orange"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: () => (
        <Space>
          <Button size="small" icon={<EditOutlined />} />
          <Button size="small" danger icon={<DeleteOutlined />} />
          <Button
            size="small"
            type="primary"
            ghost
            // onClick={
            //   //() => setView("chat")
            // }
          >
            Message
          </Button>
        </Space>
      ),
    },
  ];

  const data = [
    {
      key: "1",
      name: "John Doe",
      phone: "0987654321",
      email: "john@gmail.com",
      status: "Active",
    },
    {
      key: "2",
      name: "Jane Smith",
      phone: "0123456789",
      email: "jane@gmail.com",
      status: "Pending",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Title level={3}>Student Management</Title>
        <Button type="primary" icon={<PlusOutlined />} size="large">
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
        <Table columns={columns} dataSource={data} />
      </Card>
    </div>
  );
};

export default InstructorDashboardPage;
