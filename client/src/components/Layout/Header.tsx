import React from 'react';
import { Bell } from 'lucide-react';

export interface UserProp {
  name: string;
  role: string;
  avatarUrl?: string; // Optional image URL
  initials?: string;  // Fallback initials like "AF"
}

export interface HeaderProps {
  title: string;
  user?: UserProp;
  notificationCount?: number;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  user,
  notificationCount = 0,
  onNotificationClick,
  onProfileClick,
}) => {
  return (
    <header className="flex h-20 items-center justify-between border-b border-gray-100 bg-white px-8">
      {/* Title section */}
      <div className="flex items-center">
        <h1 className="text-[22px] font-semibold text-slate-800">{title}</h1>
      </div>

      <div className="flex items-center gap-6">
        {/* Notification Bell */}
        <button 
          type="button"
          className="relative text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          onClick={onNotificationClick}
        >
          <Bell className="h-[22px] w-[22px]" strokeWidth={2} />
          {notificationCount > 0 && (
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full border-2 border-white bg-red-500 box-content"></span>
          )}
        </button>

        {/* Divider */}
        <div className="h-8 w-[1px] bg-slate-200" />

        {/* User Profile Info */}
        {user && (
          <button 
            type="button"
            className="flex items-center gap-3 text-right group cursor-pointer"
            onClick={onProfileClick}
          >
            <div className="hidden sm:flex flex-col items-end justify-center">
              <span className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                {user.name}
              </span>
              <span className="text-[13px] font-medium text-slate-500">
                {user.role}
              </span>
            </div>

            {/* Avatar */}
            <div className="h-10 w-10 flex-shrink-0">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-full w-full rounded-full object-cover border border-slate-100"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-[#1b5df1] text-sm font-semibold text-white shadow-sm">
                  {user.initials || user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
