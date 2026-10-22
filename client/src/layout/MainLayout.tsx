import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import AppHeader from "@/components/Layout/Header";
import AppSideBar from "@/components/Layout/SideBar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { saveUserlogined } from "../redux/usersReducer";
import type { RootState } from "../redux/store";
import { logout } from "../shared/auth.api";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = (props: MainLayoutProps) => {
  const { children } = props;
  const user = useSelector((state: RootState) => state.users);
  const [view, setView] = useState("Quản lý Công trường");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const sidebarUserData = user
    ? {
        name: user.name,
        role: user.role === "instructor" ? "Site Superintendent" : "Học viên",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
      }
    : undefined;

  const headerUserData = user
    ? {
        name: user.name,
        role: user.role === "instructor" ? "Giảng viên" : "Học viên",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
      }
    : undefined;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Persistent Sidebar */}
      <aside className="relative z-10 hidden w-[280px] shrink-0 border-r border-slate-100 bg-white shadow-none lg:block">
        <AppSideBar
          user={sidebarUserData}
          onLogout={handleLogout}
        />
      </aside>

      {/* Mobile Responsive Drawer Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side="left"
          className="w-[285px] sm:w-[320px] max-w-[85vw] p-0 border-r border-slate-200 bg-white shadow-2xl focus:outline-none"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Menu điều hướng</SheetTitle>
            <SheetDescription>Thanh bên điều hướng ứng dụng</SheetDescription>
          </SheetHeader>
          <AppSideBar
            user={sidebarUserData}
            onLogout={() => {
              setMobileMenuOpen(false);
              handleLogout();
            }}
            onNavigate={() => setMobileMenuOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col bg-slate-50">
        <AppHeader
          title={view}
          notificationCount={5}
          user={headerUserData}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onNavigationChange={(item) => setView(item)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-8xl mx-auto h-full">{children}</div>
        </main>
        <footer className="shrink-0 py-6 text-center text-slate-400">
          Skipli Classroom Management System ©2024
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
