import React from "react";
import { Navigate, Route, Routes } from "react-router";
import LoginPage from "../features/login/LoginPage";
import InstructorDashboardPage from "../features/dashboard/InstructorDashboardPage";
import SetupPasswordPage from "../features/SetUpPassword/SetupPasswordPage";
import MainLayout from "../layout/MainLayout";
import ChatPage from "../features/chat/ChatPage";
import Projects from "@/features/Project/Projects";
import ProjectDetail from "@/features/Project/Detail/ProjectDetail";
import FilesPage from "@/features/FilesPage/FilesPage";
import ManagedFields from "@/features/ManagedFields/ManagedFields";
import UserManagement from "@/features/UserManagement/UserManagement";
import NotFound from "@/components/Layout/NotFound";
import DetailTask from "@/features/Task/detailTask";

const RoutesApp = () => {
  return (
    <Routes>
      <Route path="setup-password" element={<SetupPasswordPage />} />
      <Route element={<LoginPage />} path="/login"></Route>
      <Route element={<ManagedFields />} path="/managed-fields"></Route>
      <Route path="*" element={<RoutesMainApp />}></Route>

      {/* <Route></Route> */}
    </Routes>
  );
};

const RoutesMainApp = () => {
  return (
    <MainLayout>
      <Routes>
        <Route path="/dashboard" element={<InstructorDashboardPage />}>
          {/* <Route
            path="instructor"
            element={<InstructorDashboardPage />}
          ></Route> */}
          {/* <Route path="student" element={<StudentDashBoardPage />} /> */}
        </Route>
        <Route path="/files" element={<FilesPage />}></Route>
        <Route path="/projects" element={<Projects />}></Route>
        <Route path="/projects/:projectId" element={<ProjectDetail />}></Route>
        <Route path="/tasks" element={<DetailTask />}></Route>
        <Route path="/tasks/:taskId" element={<DetailTask />}></Route>
        <Route path="/personnel" element={<UserManagement />}></Route>
        <Route path="/users" element={<UserManagement />}></Route>
        <Route path="/chat" element={<ChatPage />}></Route>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MainLayout>
  );
};

export { RoutesApp, RoutesMainApp };
