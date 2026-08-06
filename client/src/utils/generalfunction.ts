import type { MenuSection } from "@/components/Layout/SideBar";
import {
  AlertTriangle,
  Building,
  Files,
  Home,
  ListTodo,
  Package,
  Settings,
  Users,
} from "lucide-react";

export const defaultSections: MenuSection[] = [
  {
    title: "CHÍNH",
    items: [
      { title: "Tổng quan", url: "/", icon: Home },
      { title: "Dự án", url: "/projects", icon: Building },
      { title: "Hồ sơ & bản vẽ", url: "/files", icon: Files },
      { title: "Công việc", url: "/tasks", icon: ListTodo },
      { title: "Vấn đề", url: "/issues", icon: AlertTriangle },
    ],
  },
  {
    title: "VẬN HÀNH",
    items: [
      { title: "Vật tư", url: "/materials", icon: Package },
      { title: "Nhân sự", url: "/personnel", icon: Users },
      { title: "Cài đặt", url: "/settings", icon: Settings },
    ],
  },
];
