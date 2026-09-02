import { CircleHelp, CirclePlus, LogOut, UserRound } from "lucide-react"
import type { ElementType } from "react"
import { NavLink } from "react-router"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { defaultSections } from "@/utils"

export interface MenuItem {
  title: string
  url: string
  icon: ElementType
}

export interface MenuSection {
  title?: string
  items: MenuItem[]
}

export interface SidebarUser {
  name: string
  role: string
  avatarUrl?: string
  initials?: string
}

export interface SideBarProps {
  sections?: MenuSection[]
  brandName?: string
  user?: SidebarUser
  onLogout?: () => void
}

const AppSideBar = ({
  sections = defaultSections,
  brandName = "ConstructFriendly",
  user,
  onLogout,
}: SideBarProps) => {
  return (
    <aside
      className="flex h-full min-h-0 w-full flex-col px-5 pb-5 pt-6 text-left"
      style={{ backgroundColor: "#ffffff", color: "#202124" }}
    >
      <NavLink
        to="/"
        aria-label={`${brandName} - Trang chủ`}
        className="mb-8 flex shrink-0 items-center gap-3 rounded-xl px-2 text-slate-950 outline-none focus-visible:ring-2 focus-visible:ring-[#007f73]/30"
      >
        <span
          className="size-10 shrink-0 rounded-xl"
          style={{
            backgroundColor: "#00796f",
            boxShadow: "0 8px 18px rgba(0, 121, 111, 0.24)",
          }}
        />
        <span className="truncate text-xl font-bold tracking-tight">{brandName}</span>
      </NavLink>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-width:thin]">
        <nav aria-label="Điều hướng thanh bên" className="space-y-5">
          {sections.map((section, sectionIndex) => (
            <section key={section.title || sectionIndex}>
              {section.title && (
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  {section.title}
                </p>
              )}

              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={`${item.title}-${item.url}`}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      style={({ isActive }) => ({
                        backgroundColor: isActive ? "#00796f" : "transparent",
                        color: isActive ? "#ffffff" : "#4f5756",
                        boxShadow: isActive
                          ? "0 7px 16px rgba(0, 121, 111, 0.22)"
                          : "none",
                      })}
                      className={({ isActive }) =>
                        cn(
                          "group flex h-11 items-center gap-3 rounded-xl px-4 text-sm font-semibold text-slate-600 outline-none transition-all hover:bg-slate-50 hover:text-[#006d64] focus-visible:ring-2 focus-visible:ring-[#007f73]/30",
                          isActive &&
                            "bg-[#007f73] text-white shadow-[0_7px_16px_rgba(0,127,115,0.2)] hover:bg-[#007166] hover:text-white",
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon
                            aria-hidden="true"
                            className="size-[19px] shrink-0 transition-colors"
                            style={{ color: isActive ? "#ffffff" : "#53605e" }}
                            strokeWidth={2}
                          />
                          <span className="truncate">{item.title}</span>
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>

        <Separator className="my-5 bg-slate-100" />

        <Button
          render={<NavLink to="/projects" />}
          variant="ghost"
          className="h-13 w-full justify-center gap-2 rounded-xl bg-[#e6f2f1] text-sm font-bold text-[#007f73] hover:bg-[#dbeceb] hover:text-[#006d64]"
          style={{ backgroundColor: "#e5f1ef", color: "#00796f" }}
        >
          <CirclePlus className="size-[18px]" />
          Dự án mới
        </Button>
      </div>

      <div className="mt-5 shrink-0 space-y-1">
        <Button
          type="button"
          variant="ghost"
          className="h-10 w-full justify-start gap-3 px-4 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-[#006d64]"
        >
          <CircleHelp className="size-[17px]" />
          Hỗ trợ
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-10 w-full justify-start gap-3 px-4 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-[#006d64]"
        >
          <UserRound className="size-[17px]" />
          Tài khoản
        </Button>

        {user && (
          <div
            className="mt-4 flex items-center gap-3 rounded-2xl border p-3"
            style={{ backgroundColor: "#f7f4ff", borderColor: "#ece7f8" }}
          >
            <Avatar className="size-10 border border-white shadow-sm">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="size-full object-cover" />
              ) : (
                <AvatarFallback className="bg-[#007f73] text-xs font-bold text-white">
                  {user.initials || user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold leading-4 text-slate-900">{user.name}</p>
              <p className="mt-1 truncate text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                {user.role}
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Đăng xuất"
              title="Đăng xuất"
              onClick={onLogout}
              className="text-slate-600 hover:bg-white hover:text-rose-600"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </aside>
  )
}

export default AppSideBar
