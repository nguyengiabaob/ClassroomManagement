import React from "react";
import { Route, Routes } from "react-router";
import LoginPage from "../features/login/LoginPage";
import InstructorDashboardPage from "../features/dashboard/InstructorDashboardPage";
import StudentDashBoardPage from "../features/dashboard/StudentDashBoardPage";
import SetupPasswordPage from "../features/SetUpPassword/SetupPasswordPage";

const RoutesApp = () => {
  return (
    <Routes>
      <Route path="setup-password" element={<SetupPasswordPage />} />
      <Route element={<LoginPage />} path="/login"></Route>
      <Route path="/dashboard/*">
        <Route path="instructor" element={<InstructorDashboardPage />}></Route>
        <Route path="student" element={<StudentDashBoardPage />} />
      </Route>
      {/* <Route></Route> */}
    </Routes>
  );
};

export default RoutesApp;
