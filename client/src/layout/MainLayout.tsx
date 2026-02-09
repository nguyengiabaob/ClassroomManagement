import {
  BellOutlined,
  BookOutlined,
  LogoutOutlined,
  MessageOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Button,
  Divider,
  Layout,
  Menu,
  Space,
  Tag,
  Typography,
} from "antd";
import Sider from "antd/es/layout/Sider";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { saveUserlogined } from "../redux/usersReducer";
import type { RootState } from "../redux/store";

interface MainLayoutProps {
  children: React.ReactNode;
}
const MainLayout = (props: MainLayoutProps) => {
  const { children } = props;
  const { Header, Content, Footer } = Layout;
  const { Title, Text } = Typography;
  const user = useSelector((state: RootState) => state.users);
  const [view, setView] = useState("dashboard");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout = () => {
    dispatch(saveUserlogined(null));
    localStorage.removeItem("user_session");
    navigate("/login");
    setView("dashboard");
  };
  return (
    <Layout className="!min-h-screen">
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        theme="light"
        className="shadow-lg z-10"
      >
        <div className="p-6 text-center border-b border-slate-100 mb-4">
          <div className="bg-blue-600 w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center text-white font-bold text-2xl shadow-blue-200 shadow-lg">
            S
          </div>
          <Title level={4} style={{ margin: 0 }}>
            Skipli CMS
          </Title>
          <Tag
            color={user?.role === "instructor" ? "gold" : "blue"}
            className="mt-2 rounded-full border-0 px-3 py-0.5"
          >
            {user?.role?.toUpperCase()}
          </Tag>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[view]}
          onClick={({ key }) => setView(key)}
          className="border-0 px-2"
          items={[
            {
              key: "dashboard",
              icon: <BookOutlined />,
              label: "Dashboard",
              onClick: () => {
                navigate("/dashboard/instructor");
              },
            },
            {
              key: "chat",
              icon: <MessageOutlined />,
              label: "Chat",
              onClick: () => {
                navigate("/chat");
              },
            },
            { key: "profile", icon: <UserOutlined />, label: "Profile " },
          ]}
        />
        <div className="absolute bottom-6 w-full px-6">
          <Button
            type="text"
            danger
            block
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            className="flex items-center justify-center hover:bg-red-50 rounded-lg h-10"
          >
            Đăng xuất
          </Button>
        </div>
      </Sider>

      <Layout className="bg-slate-50">
        <Header
          style={{ backgroundColor: "#0015291a" }}
          className="bg-white px-8 flex items-center justify-between shadow-sm h-16 sticky top-0 z-20"
        >
          <Title level={5} style={{ margin: 0, color: "#64748b" }}>
            {view === "dashboard" ? "DashBoard" : view.toUpperCase()}
          </Title>
          <Space size="middle">
            <Badge count={5} size="small">
              <Button
                type="text"
                icon={<BellOutlined className="text-xl text-slate-400" />}
              />
            </Badge>
            <Divider type="vertical" />
            <Space className="cursor-pointer hover:bg-slate-50 px-2 py-1 rounded-lg transition-all">
              <Avatar
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                className="bg-blue-100"
              />
              <div className="hidden md:block leading-none">
                <Text strong className="block text-sm">
                  {user?.name}
                </Text>
                <Text type="secondary" className="text-xs">
                  {user?.role === "instructor" ? "Giảng viên" : "Học viên"}
                </Text>
              </div>
            </Space>
          </Space>
        </Header>

        <Content className="p-4 md:p-8">
          <div className="max-w-8xl mx-auto h-full">{children}</div>
        </Content>
        <Footer className="text-center text-slate-400 py-6">
          Skipli Classroom Management System ©2024
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
