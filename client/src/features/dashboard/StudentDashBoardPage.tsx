import { CheckCircleOutlined } from "@ant-design/icons";
import { Button, Card, List, message, Tag, Typography } from "antd";
import React from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";

const { Title, Text, Paragraph } = Typography;

const StudentDashBoardPage = () => {
  const userLogined = useSelector((state: RootState) => state.users);
  const lessons = [
    {
      id: 1,
      title: "React Basics",
      date: "Oct 25, 2023",
      status: "pending",
      desc: "Introduction to Components, Props, and State.",
    },
    {
      id: 2,
      title: "Ant Design Mastery",
      date: "Oct 26, 2023",
      status: "done",
      desc: "Using Layouts, Grids, and Forms.",
    },
    {
      id: 3,
      title: "Firebase Integration",
      date: "Oct 27, 2023",
      status: "pending",
      desc: "Auth, Firestore, and Deployment.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-2xl text-white shadow-lg">
        <Title level={3} style={{ color: "white" }}>
          Welcome back,{userLogined?.name}!
        </Title>
        <Paragraph style={{ color: "rgba(255,255,255,0.8)" }}>
          You have 2 lessons to complete today.
        </Paragraph>
      </div>

      <Title level={4} className="mt-8">
        Your Assigned Lessons
      </Title>
      <List
        grid={{ gutter: 16, column: 1 }}
        dataSource={lessons}
        renderItem={(item) => (
          <List.Item>
            <Card
              className={`rounded-xl border-0 shadow-sm border-l-4 ${item.status === "done" ? "border-green-500" : "border-blue-500"}`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <Text
                    type="secondary"
                    className="text-xs uppercase tracking-wider"
                  >
                    {item.date}
                  </Text>
                  <Title level={5} style={{ margin: "4px 0" }}>
                    {item.title}
                  </Title>
                  <Text className="text-slate-500 italic">{item.desc}</Text>
                </div>
                {item.status === "done" ? (
                  <Tag
                    icon={<CheckCircleOutlined />}
                    color="success"
                    className="px-3 py-1 rounded-full"
                  >
                    COMPLETED
                  </Tag>
                ) : (
                  <Button
                    type="primary"
                    shape="round"
                    onClick={() => message.success("Lesson marked as done!")}
                  >
                    Mark as Done
                  </Button>
                )}
              </div>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default StudentDashBoardPage;
