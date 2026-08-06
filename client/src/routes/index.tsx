import React from "react";
import { Route, Routes } from "react-router";
import LoginPage from "../features/login/LoginPage";
import InstructorDashboardPage from "../features/dashboard/InstructorDashboardPage";
import SetupPasswordPage from "../features/SetUpPassword/SetupPasswordPage";
import MainLayout from "../layout/MainLayout";
import ChatPage from "../features/chat/ChatPage";
import Project from "@/features/Project/Project";
import FilesPage from "@/features/FilesPage/FilesPage";
import ManagedFields from "@/features/ManagedFields/ManagedFields";

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
        <Route path="/" element={<InstructorDashboardPage />}>
          {/* <Route
            path="instructor"
            element={<InstructorDashboardPage />}
          ></Route> */}
          {/* <Route path="student" element={<StudentDashBoardPage />} /> */}
        </Route>
        <Route path="/projects" element={<Project />}></Route>
        <Route path="/files" element={<FilesPage />}></Route>
        <Route path="/chat" element={<ChatPage />}></Route>
      </Routes>
    </MainLayout>
  );
};

export { RoutesApp, RoutesMainApp };
