import { BellOutlined, LogoutOutlined } from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Button,
  Divider,
  Layout,
  Space,
  Typography,
} from "antd";
import Sider from "antd/es/layout/Sider";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { saveUserlogined } from "../redux/usersReducer";
import type { RootState } from "../redux/store";
import AppSideBar from "@/components/Layout/SideBar";

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
    <Layout className="h-screen overflow-hidden">
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        width={250}
        theme="light"
        className="shadow-lg z-10 relative"
      >
        <div className="h-full overflow-y-auto pb-20">
          <AppSideBar />
        </div>
        <div className="absolute bottom-6 w-full px-6 bg-white pt-2">
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

      <Layout className="bg-slate-50 flex flex-col">
        <Header
          style={{ backgroundColor: "#0015291a" }}
          className="bg-white px-8 flex items-center justify-between shadow-sm h-16 shrink-0 z-20"
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

        <Content className="p-4 md:p-8 flex-1 overflow-y-auto">
          <div className="max-w-8xl mx-auto h-full">{children}</div>
        </Content>
        <Footer className="text-center text-slate-400 py-6 shrink-0">
          Skipli Classroom Management System ©2024
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
