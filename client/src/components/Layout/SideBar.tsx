import React from "react";
import { NavLink } from "react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
} from "@/components/ui/sidebar";

import { HardHat } from "lucide-react";
import { defaultSections } from "@/utils";

export interface MenuItem {
  title: string;
  url: string;
  icon: React.ElementType;
}

export interface MenuSection {
  title?: string;
  items: MenuItem[];
}

export interface SideBarProps {
  sections?: MenuSection[];
  brandName?: string;
}

const AppSideBar: React.FC<SideBarProps> = ({
  sections = defaultSections,
  brandName = "SKYBUILD",
}) => {
  return (
    <SidebarProvider>
      <Sidebar className="border-r-slate-100 w-[250px]">
        <SidebarHeader className="pt-6 pb-2 px-6">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="flex items-center justify-center w-12 h-12 bg-[#2563eb] rounded-2xl text-white shadow-lg shadow-blue-200/50 shrink-0">
              <HardHat className="w-6 h-6" />
            </div>
            <span className="font-[900] italic text-[24px] tracking-wide text-[#1e293b]">
              {brandName}
            </span>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2 mt-4">
          {sections.map((section, idx) => (
            <SidebarGroup key={idx} className="mb-2">
              {section.title && (
                <SidebarGroupLabel className="text-[12px] font-bold text-[#94a3b8] mb-1 uppercase tracking-wider px-2">
                  {section.title}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <NavLink to={item.url} className="w-full block">
                        {({ isActive }: { isActive: boolean }) => (
                          <SidebarMenuButton
                            isActive={isActive}
                            tooltip={item.title}
                            className={`h-11 rounded-xl px-3 transition-colors ${
                              isActive
                                ? "bg-[#f0f5ff] text-[#2563eb] hover:bg-[#f0f5ff] hover:text-[#1d4ed8]"
                                : "text-[#475569] hover:bg-slate-50 hover:text-slate-900"
                            }`}
                          >
                            <item.icon
                              className={`w-5 h-5 mr-2 ${
                                isActive ? "text-[#2563eb]" : "text-slate-500"
                              }`}
                            />
                            <span className="font-medium text-[15px]">
                              {item.title}
                            </span>
                          </SidebarMenuButton>
                        )}
                      </NavLink>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
};

export default AppSideBar;
