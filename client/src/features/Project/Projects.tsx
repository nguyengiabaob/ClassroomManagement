import { useMemo, useState } from "react";
import { NavLink } from "react-router";
import {
  Bell,
  CircleHelp,
  FileText,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";

import "./Projects.css";

type ProjectStatus = "Đang thi công" | "Lập kế hoạch" | "Hoàn thành";

type ProjectItem = {
  id: string;
  name: string;
  location: string;
  status: ProjectStatus;
  progress: number;
  image: string;
  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
};

const projects: ProjectItem[] = [
  {
    id: "BF-2024-001",
    name: "Skyline Tower",
    location: "Quận 1, TP. Hồ Chí Minh",
    status: "Đang thi công",
    progress: 68,
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=85",
    leftLabel: "Ngân sách đã dùng",
    leftValue: "$4.2M / $6.5M",
    rightLabel: "Nhân lực hiện tại",
    rightValue: "142 công nhân",
  },
  {
    id: "BF-2024-002",
    name: "Riverside Bridge",
    location: "TP. Thủ Đức, TP. HCM",
    status: "Lập kế hoạch",
    progress: 12,
    image:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1000&q=85",
    leftLabel: "Ngân sách dự kiến",
    leftValue: "$0.8M / $12.0M",
    rightLabel: "Đội ngũ thiết kế",
    rightValue: "24 kỹ sư",
  },
  {
    id: "BF-2023-018",
    name: "Green Valley Logistics",
    location: "KCN VSIP, Bình Dương",
    status: "Hoàn thành",
    progress: 100,
    image:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1000&q=85",
    leftLabel: "Ngân sách cuối cùng",
    leftValue: "$3.1M / $3.2M",
    rightLabel: "Bàn giao",
    rightValue: "12/2023",
  },
  {
    id: "BF-2024-005",
    name: "Ocean View Resort",
    location: "Cam Ranh, Khánh Hòa",
    status: "Đang thi công",
    progress: 45,
    image:
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1000&q=85",
    leftLabel: "Ngân sách đã dùng",
    leftValue: "$8.5M / $18.2M",
    rightLabel: "Nhân lực hiện tại",
    rightValue: "210 công nhân",
  },
];

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/" },
  { label: "Quản lý Công trường", icon: Menu, to: "/projects" },
  { label: "Kiểm soát Hồ sơ", icon: FileText, to: "/files" },
  { label: "Quản lý Chi phí", icon: WalletCards, to: "/costs" },
];

function ProjectCard({ project }: { project: ProjectItem }) {
  const statusClass = project.status.toLowerCase().replaceAll(" ", "-");

  return (
    <article className="projects-card">
      <div className="projects-card-image">
        <img src={project.image} alt={`Dự án ${project.name}`} />
        <span className={`projects-status is-${statusClass}`}>{project.status}</span>
      </div>

      <div className="projects-card-content">
        <div className="projects-card-heading">
          <h2>{project.name}</h2>
          <span>ID: {project.id}</span>
        </div>

        <p className="projects-location">
          <MapPin size={14} strokeWidth={2} />
          {project.location}
        </p>

        <div className="projects-progress-copy">
          <strong>Tiến độ tổng thể</strong>
          <span className={project.status === "Lập kế hoạch" ? "is-amber" : ""}>
            {project.progress}%
          </span>
        </div>
        <div
          className="projects-progress"
          role="progressbar"
          aria-label={`Tiến độ dự án ${project.name}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={project.progress}
        >
          <span
            className={project.status === "Lập kế hoạch" ? "is-amber" : ""}
            style={{ width: `${project.progress}%` }}
          />
        </div>

        <div className="projects-card-stats">
          <div>
            <span>{project.leftLabel}</span>
            <strong>{project.leftValue}</strong>
          </div>
          <div>
            <span>{project.rightLabel}</span>
            <strong>{project.rightValue}</strong>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Projects() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"Tất cả" | ProjectStatus>("Tất cả");

  const visibleProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("vi");

    return projects.filter((project) => {
      const matchesStatus = status === "Tất cả" || project.status === status;
      const matchesQuery =
        !normalizedQuery ||
        `${project.name} ${project.location} ${project.id}`
          .toLocaleLowerCase("vi")
          .includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [query, status]);

  const openCreateDialog = () => {
    window.alert("Biểu mẫu tạo dự án mới sẽ được mở tại đây.");
  };

  return (
    <div className="projects-app">
      <header className="projects-header">
        <button
          type="button"
          className="projects-mobile-menu"
          aria-label="Mở menu"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={23} />
        </button>

        <label className="projects-search">
          <Search size={21} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm kiếm dự án, hồ sơ..."
            aria-label="Tìm kiếm dự án"
          />
        </label>

        <div className="projects-header-actions">
          <button type="button" aria-label="Thông báo" className="has-notification">
            <Bell size={21} />
          </button>
          <button type="button" aria-label="Trợ giúp">
            <CircleHelp size={21} />
          </button>
          <button type="button" aria-label="Cài đặt">
            <Settings size={21} />
          </button>
          <span className="projects-header-divider" />
          <div className="projects-user-copy">
            <strong>Minh Nguyen</strong>
            <span>Site Superintendent</span>
          </div>
          <img
            className="projects-user-avatar"
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="Minh Nguyen"
          />
        </div>
      </header>

      {sidebarOpen && (
        <button
          type="button"
          className="projects-overlay"
          aria-label="Đóng menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`projects-sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="projects-brand-row">
          <NavLink to="/projects" className="projects-brand" aria-label="ConstructFriendly">
            <span />
            <strong>ConstructFriendly</strong>
          </NavLink>
          <button type="button" aria-label="Đóng menu" onClick={() => setSidebarOpen(false)}>
            <X size={21} />
          </button>
        </div>

        <nav className="projects-nav" aria-label="Điều hướng chính">
          {navigation.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={label}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <Icon size={20} strokeWidth={2} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <button type="button" className="projects-sidebar-create" onClick={openCreateDialog}>
          <Plus size={18} />
          Dự án mới
        </button>

        <div className="projects-sidebar-footer">
          <a href="#support">
            <CircleHelp size={18} />
            Hỗ trợ
          </a>
          <a href="#account">
            <UserRound size={18} />
            Tài khoản
          </a>
          <div className="projects-profile-card">
            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="" />
            <div>
              <strong>Minh Nguyen</strong>
              <span>Site Superintendent</span>
            </div>
            <LogOut size={18} />
          </div>
        </div>
      </aside>

      <main className="projects-main">
        <section className="projects-content">
          <div className="projects-title-row">
            <div>
              <h1>Danh sách dự án</h1>
              <p>Quản lý và theo dõi tiến độ thi công các công trình hiện tại.</p>
            </div>

            <div className="projects-page-actions">
              <label className="projects-filter">
                <SlidersHorizontal size={17} />
                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as "Tất cả" | ProjectStatus)
                  }
                  aria-label="Lọc theo trạng thái"
                >
                  <option value="Tất cả">Lọc theo trạng thái</option>
                  <option value="Đang thi công">Đang thi công</option>
                  <option value="Lập kế hoạch">Lập kế hoạch</option>
                  <option value="Hoàn thành">Hoàn thành</option>
                </select>
              </label>
              <button type="button" className="projects-create-button" onClick={openCreateDialog}>
                <Plus size={19} />
                Thêm dự án mới
              </button>
            </div>
          </div>

          <div className="projects-grid">
            {visibleProjects.slice(0, 3).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}

            {!query && status === "Tất cả" && (
              <button type="button" className="projects-add-card" onClick={openCreateDialog}>
                <span className="projects-add-icon">
                  <Plus size={32} strokeWidth={1.8} />
                </span>
                <strong>Khởi tạo dự án mới</strong>
                <span>Thiết lập các mốc tiến độ<br />và ngân sách cho công trình mới.</span>
              </button>
            )}

            {visibleProjects.slice(3).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {visibleProjects.length === 0 && (
            <div className="projects-empty">
              <Search size={28} />
              <h2>Không tìm thấy dự án</h2>
              <p>Hãy thử một từ khóa hoặc trạng thái khác.</p>
            </div>
          )}
        </section>

        <button type="button" className="projects-floating-create" aria-label="Tạo dự án mới" onClick={openCreateDialog}>
          <Plus size={31} />
        </button>
      </main>
    </div>
  );
}
