import { useState } from "react";
import { NavLink } from "react-router";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  CircleHelp,
  FileText,
  LayoutDashboard,
  MapPin,
  Menu,
  Pencil,
  Search,
  Settings,
  Share2,
  TrendingUp,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";

import "./ProjectDetail.css";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/" },
  { label: "Site Management", icon: Menu, to: "/projects" },
  { label: "Document Control", icon: FileText, to: "/files" },
  { label: "Cost Control", icon: WalletCards, to: "/costs" },
];

const tabs = ["Tổng quan", "Công việc", "Vật tư", "Nhân sự", "Tài liệu"];

export default function ProjectDetail() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Tổng quan");
  const [searchQuery, setSearchQuery] = useState("");

  const handleExport = () => {
    const report = [
      "BÁO CÁO DỰ ÁN SKYLINE TOWER - QUẬN 1",
      "Mã dự án: BF-2024-001",
      "Trạng thái: Đang thi công",
      "Tiến độ: 68%",
      "Thời gian: 428 / 630 ngày",
      "Ngân sách: VND 12.5 tỷ",
      "Nhân sự: 12 kỹ sư, 148 công nhân",
    ].join("\n");
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "skyline-tower-report.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="project-detail-app">
      <header className="project-detail-header">
        <button
          type="button"
          className="project-detail-mobile-menu"
          aria-label="Mở menu"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={22} />
        </button>

        <NavLink to="/projects" className="project-detail-wordmark">
          ConstructFriendly
        </NavLink>

        <div className="project-detail-header-actions">
          <label className="project-detail-search">
            <Search size={19} />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm kiếm tài liệu..."
              aria-label="Tìm kiếm tài liệu"
            />
          </label>
          <button type="button" aria-label="Thông báo">
            <Bell size={20} />
          </button>
          <img
            src="https://randomuser.me/api/portraits/women/44.jpg"
            alt="Tài khoản người dùng"
          />
        </div>
      </header>

      {sidebarOpen && (
        <button
          type="button"
          className="project-detail-overlay"
          aria-label="Đóng menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`project-detail-sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="project-detail-project-brand">
          <span className="project-detail-project-mark" />
          <div>
            <strong>Project Alpha</strong>
            <span>Site #1042</span>
          </div>
          <button type="button" aria-label="Đóng menu" onClick={() => setSidebarOpen(false)}>
            <X size={21} />
          </button>
        </div>

        <nav className="project-detail-nav" aria-label="Điều hướng dự án">
          {navigation.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={label}
              to={to}
              className={label === "Site Management" ? "active" : ""}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={20} strokeWidth={1.9} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <nav className="project-detail-secondary-nav" aria-label="Trợ giúp">
          <a href="#settings">
            <Settings size={20} />
            Settings
          </a>
          <a href="#support">
            <CircleHelp size={20} />
            Support
          </a>
        </nav>
      </aside>

      <main className="project-detail-main">
        <section className="project-detail-content">
          <div className="project-detail-title-row">
            <div className="project-detail-title-copy">
              <div className="project-detail-badges">
                <span>BF-2024-001</span>
                <span>Đang thi công</span>
              </div>
              <h1>Skyline Tower - Quận 1</h1>
              <div className="project-detail-meta">
                <span>
                  <MapPin size={17} />
                  22 Lê Duẩn, Quận 1, TP.HCM
                </span>
                <span>
                  <CalendarDays size={17} />
                  15/05/2024 - 20/12/2025
                </span>
              </div>
            </div>

            <div className="project-detail-title-actions">
              <button type="button" className="project-detail-edit-button">
                <Pencil size={18} />
                Chỉnh sửa
              </button>
              <button type="button" className="project-detail-export-button" onClick={handleExport}>
                <Share2 size={18} />
                Xuất báo cáo
              </button>
            </div>
          </div>

          <div className="project-detail-summary-grid">
            <article className="project-detail-progress-card">
              <div className="project-detail-card-title">
                <h2>Tiến độ tổng thể</h2>
                <span>
                  <TrendingUp size={21} />
                </span>
              </div>

              <div className="project-detail-progress-body">
                <div className="project-detail-progress-ring" aria-label="Tiến độ hoàn thành 68%">
                  <div>
                    <strong>68%</strong>
                    <span>Hoàn thành</span>
                  </div>
                </div>

                <div className="project-detail-progress-info">
                  <div>
                    <span>Thời gian đã trôi qua</span>
                    <strong>428 / 630 ngày</strong>
                    <div className="project-detail-time-track">
                      <span />
                    </div>
                  </div>
                  <div className="project-detail-budget">
                    <span>Ngân sách</span>
                    <strong>VND 12.5 tỷ</strong>
                  </div>
                </div>
              </div>
            </article>

            <article className="project-detail-workforce-card">
              <div className="project-detail-workforce-title">
                <h2>
                  <UsersRound size={21} />
                  Nhân sự hiện tại
                </h2>
                <ChevronRight size={30} />
              </div>

              <div className="project-detail-workforce-stats">
                <div>
                  <span>Kỹ sư</span>
                  <strong>12 <small>người</small></strong>
                </div>
                <div>
                  <span>Công nhân</span>
                  <strong>148 <small>người</small></strong>
                </div>
              </div>

              <button type="button">Quản lý chấm công</button>
            </article>
          </div>

          <nav className="project-detail-tabs" aria-label="Nội dung dự án">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={activeTab === tab ? "active" : ""}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>

          <section className="project-detail-tab-panel" aria-live="polite">
            <span className="sr-only">Đang xem mục {activeTab}</span>
          </section>
        </section>
      </main>
    </div>
  );
}
