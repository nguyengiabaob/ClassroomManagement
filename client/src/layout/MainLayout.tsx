import { Layout } from "antd";
import Sider from "antd/es/layout/Sider";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import AppHeader from "@/components/Layout/Header";
import AppSideBar from "@/components/Layout/SideBar";
import { saveUserlogined } from "../redux/usersReducer";
import type { RootState } from "../redux/store";
import { logout } from "../shared/auth.api";

interface MainLayoutProps {
  children: React.ReactNode;
}
const MainLayout = (props: MainLayoutProps) => {
  const { children } = props;
  const { Content, Footer } = Layout;
  const user = useSelector((state: RootState) => state.users);
  const [view, setView] = useState("Quản lý Công trường");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      dispatch(saveUserlogined(null));
      localStorage.removeItem("user_session");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      navigate("/login", { replace: true });
      setView("dashboard");
    }
  };
  return (
    <Layout className="h-screen overflow-hidden">
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        width={280}
        theme="light"
        style={{ backgroundColor: "#ffffff" }}
        className="relative z-10 border-r border-slate-100 shadow-none"
      >
        <AppSideBar
          user={
            user
              ? {
                  name: user.name,
                  role: user.role === "instructor" ? "Site Superintendent" : "Học viên",
                  avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
                }
              : undefined
          }
          onLogout={handleLogout}
        />
      </Sider>

      <Layout className="bg-slate-50 flex flex-col">
        <AppHeader
          title={view}
          notificationCount={5}
          user={
            user
              ? {
                  name: user.name,
                  role: user.role === "instructor" ? "Giảng viên" : "Học viên",
                  avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
                }
              : undefined
          }
          onNavigationChange={(item) => setView(item)}
        />

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
