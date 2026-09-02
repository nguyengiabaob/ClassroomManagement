import { Bell, Search, Settings } from "lucide-react"
import type { ChangeEvent } from "react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface UserProp {
  name: string
  role: string
  avatarUrl?: string
  initials?: string
}

export interface HeaderProps {
  title?: string
  user?: UserProp
  notificationCount?: number
  searchValue?: string
  onSearchChange?: (value: string) => void
  onNotificationClick?: () => void
  onSettingsClick?: () => void
  onProfileClick?: () => void
  onNavigationChange?: (item: string) => void
}

const navigationItems = ["Dự án", "Quản lý Công trường", "Thiết bị"]

export const Header = ({
  title = "Quản lý Công trường",
  user,
  notificationCount = 0,
  searchValue,
  onSearchChange,
  onNotificationClick,
  onSettingsClick,
  onProfileClick,
  onNavigationChange,
}: HeaderProps) => {
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange?.(event.target.value)
  }

  return (
    <header className="flex h-16 w-full shrink-0 items-center border-b border-slate-200/70 bg-[#fbf9ff] px-4 sm:px-6 lg:px-8">
      <nav aria-label="Điều hướng chính" className="hidden h-full shrink-0 items-center gap-7 lg:flex xl:gap-10">
        {navigationItems.map((item) => {
          const active = item === title

          return (
            <button
              key={item}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => onNavigationChange?.(item)}
              className={cn(
                "relative flex h-full items-center border-0 bg-transparent px-1 text-[15px] font-medium text-slate-600 outline-none transition-colors hover:text-[#006d64] focus-visible:ring-2 focus-visible:ring-[#007f73]/30",
                active && "font-bold text-[#006d64] after:absolute after:inset-x-0 after:bottom-3 after:h-0.5 after:bg-[#007f73]",
              )}
            >
              {item}
            </button>
          )
        })}
      </nav>

      <div className="mx-auto min-w-0 flex-1 px-3 sm:px-6 lg:max-w-md xl:max-w-lg">
        <label className="relative block">
          <span className="sr-only">Tìm kiếm nhật ký</span>
          <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 z-10 size-[19px] -translate-y-1/2 text-slate-500" />
          <Input
            type="search"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Tìm kiếm nhật ký..."
            className="h-10 rounded-xl border-transparent bg-[#f7f5fc] pl-11 pr-4 text-sm text-slate-800 shadow-none placeholder:text-slate-500 focus-visible:border-[#007f73]/30 focus-visible:ring-[#007f73]/15"
          />
        </label>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={notificationCount > 0 ? `${notificationCount} thông báo mới` : "Thông báo"}
          onClick={onNotificationClick}
          className="relative size-9 rounded-full text-[#007f73] hover:bg-emerald-50 hover:text-[#006d64]"
        >
          <Bell className="size-5" strokeWidth={2} />
          {notificationCount > 0 && (
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full border-2 border-[#fbf9ff] bg-rose-500" />
          )}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Cài đặt"
          onClick={onSettingsClick}
          className="hidden size-9 rounded-full text-[#007f73] hover:bg-emerald-50 hover:text-[#006d64] sm:inline-flex"
        >
          <Settings className="size-5" strokeWidth={2} />
        </Button>

        {user && (
          <Button
            type="button"
            variant="ghost"
            onClick={onProfileClick}
            aria-label={`Mở hồ sơ của ${user.name}`}
            className="ml-1 size-10 rounded-full p-0 hover:ring-2 hover:ring-[#007f73]/20"
          >
            <Avatar className="size-9 border border-white shadow-sm">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="size-full object-cover" />
              ) : (
                <AvatarFallback className="bg-[#007f73] text-xs font-bold text-white">
                  {user.initials || user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
          </Button>
        )}
      </div>
    </header>
  )
}

export default Header
