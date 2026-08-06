import { useState } from "react";
import {
  Bell,
  Building2,
  CircleHelp,
  ClipboardClock,
  Download,
  Eye,
  FileText,
  HardHat,
  House,
  Info,
  LayoutDashboard,
  Menu,
  Package,
  Plus,
  Search,
  Settings,
  Sun,
  Users,
  WalletCards,
  X,
} from "lucide-react";

import "./ManagedFields.css";

type Tone = "teal" | "amber" | "terracotta";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Site Management", icon: House, active: true },
  { label: "Document Control", icon: FileText },
  { label: "Cost Control", icon: WalletCards },
];

const inventory = [
  { name: "Bê tông tươi M350", current: "85/100", unit: "m³", value: 85, tone: "teal" },
  { name: "Thép cuộn D8", current: "12/15", unit: "Tấn", value: 80, tone: "amber" },
  { name: "Xi măng PCB40", current: "240/500", unit: "Bao", value: 48, tone: "terracotta" },
] as const;

const employees = [
  { initials: "NN", name: "Nguyễn Văn Nam", role: "Kỹ Sư hiện trường", time: "07:15 AM", status: "ĐÚNG GIỜ", avatar: "mint" },
  { initials: "TT", name: "Trần Đình Tú", role: "Tổ nề", time: "07:22 AM", status: "ĐÚNG GIỜ", avatar: "yellow" },
  { initials: "LH", name: "Lê Minh Hiếu", role: "Kỹ thuật điện", time: "07:45 AM", status: "MUỘN", avatar: "coral" },
];

function StatusCard({
  icon: Icon,
  iconTone,
  eyebrow,
  value,
  unit,
  badge,
}: {
  icon: typeof Users;
  iconTone: Tone;
  eyebrow: string;
  value: string;
  unit: string;
  badge: string;
}) {
  return (
    <article className="construction-stat-card">
      <div className={`construction-stat-icon is-${iconTone}`}><Icon size={22} strokeWidth={2} /></div>
      <span className={`construction-stat-badge is-${iconTone}`}>{badge}</span>
      <p>{eyebrow}</p>
      <div className="construction-stat-value"><strong>{value}</strong><span>{unit}</span></div>
    </article>
  );
}

export default function ManagedFields() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="construction-app">
      <header className="construction-header">
        <button className="construction-menu-button" aria-label="Mở menu" onClick={() => setSidebarOpen(true)}>
          <Menu size={23} />
        </button>
        <a className="construction-brand" href="#top" aria-label="ConstructFriendly home">ConstructFriendly</a>
        <nav className="construction-top-nav" aria-label="Điều hướng chính">
          <a href="#projects">Dự án</a>
          <a className="active" href="#site-management">Quản lý Công trường</a>
          <a href="#equipment">Thiết bị</a>
        </nav>
        <div className="construction-header-actions">
          <label className="construction-search">
            <Search size={19} />
            <input aria-label="Tìm kiếm nhật ký" placeholder="Tìm kiếm nhật ký..." />
          </label>
          <button aria-label="Thông báo"><Bell size={21} /></button>
          <button aria-label="Cài đặt"><Settings size={21} /></button>
          <div className="construction-avatar" aria-label="Tài khoản Nguyễn Minh">
            <span>NM</span>
          </div>
        </div>
      </header>

      {sidebarOpen && <button className="construction-overlay" aria-label="Đóng menu" onClick={() => setSidebarOpen(false)} />}

      <aside className={`construction-sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="construction-sidebar-heading">
          <span>SITE PRO V2.0</span>
          <button aria-label="Đóng menu" onClick={() => setSidebarOpen(false)}><X size={21} /></button>
        </div>
        <nav aria-label="Menu công trường">
          {navigation.map(({ label, icon: Icon, active }) => (
            <a key={label} className={active ? "active" : ""} href={`#${label.toLowerCase().replaceAll(" ", "-")}`}>
              <Icon size={21} strokeWidth={2} />
              <span>{label}</span>
            </a>
          ))}
        </nav>
        <div className="construction-sidebar-bottom">
          <button className="construction-new-report"><Plus size={21} />Báo cáo mới</button>
          <a href="#help"><CircleHelp size={20} />Hỗ trợ</a>
        </div>
      </aside>

      <main id="top" className="construction-main">
        <section className="construction-content">
          <div className="construction-page-heading">
            <div>
              <h1>Nhật ký thi công</h1>
              <p>Dự án: Tòa nhà Văn phòng SkyLine - Giai đoạn 2</p>
            </div>
            <button className="construction-export"><Download size={17} />Xuất báo cáo PDF</button>
          </div>

          <section className="construction-summary-grid" aria-label="Tổng quan dự án">
            <StatusCard icon={Users} iconTone="teal" eyebrow="Nhân sự hôm nay" value="124" unit="Người" badge="+5%" />
            <StatusCard icon={Package} iconTone="amber" eyebrow="Vật tư đã nhận" value="12" unit="Lô hàng" badge="98%" />
            <StatusCard icon={ClipboardClock} iconTone="terracotta" eyebrow="Báo cáo chờ duyệt" value="08" unit="Yêu cầu" badge="08" />
            <article className="construction-progress-card">
              <p>Tiến độ tổng thể</p>
              <div className="construction-progress-copy">
                <strong>64%</strong>
                <span>Dự kiến<br /><b>60%</b></span>
              </div>
              <div className="construction-progress-track"><span style={{ width: "64%" }} /></div>
            </article>
          </section>

          <section className="construction-panel construction-material-panel">
            <h2>Theo dõi vật tư dự án</h2>
            <div className="construction-material-grid">
              {inventory.map((item) => (
                <article className="construction-material" key={item.name}>
                  <div><strong>{item.name}</strong><span>{item.current} {item.unit}</span></div>
                  <div className="construction-material-track"><span className={`is-${item.tone}`} style={{ width: `${item.value}%` }} /></div>
                </article>
              ))}
            </div>
            <button className="construction-outline-button">Chi tiết kho bãi</button>
          </section>

          <section className="construction-panel construction-checkin-panel">
            <div className="construction-panel-heading">
              <h2>Danh sách nhân viên Check-in</h2>
              <button>Xem tất cả</button>
            </div>
            <div className="construction-table-wrap">
              <table>
                <thead><tr><th>Nhân viên</th><th>Vị trí/Tổ đội</th><th>Thời gian<br />Check-in</th><th>Trạng thái</th><th><span className="sr-only">Chi tiết</span></th></tr></thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.name}>
                      <td><div className="construction-person"><span className={`is-${employee.avatar}`}>{employee.initials}</span><strong>{employee.name}</strong></div></td>
                      <td>{employee.role}</td>
                      <td>{employee.time}</td>
                      <td><span className={`construction-status ${employee.status === "MUỘN" ? "is-late" : ""}`}>{employee.status}</span></td>
                      <td><button className="construction-view-button" aria-label={`Xem ${employee.name}`}><Eye size={20} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </section>

        <aside className="construction-rightbar">
          <h2>TỔNG QUAN NHÂN LỰC</h2>
          <div className="construction-workforce-card">
            <WorkforceRow tone="teal" label="Tổ nề - Hoàn thiện" people="42 Thành viên" percent="100%" />
            <WorkforceRow tone="amber" label="Tổ cốt thép - Bê tông" people="58 Thành viên" percent="95%" />
            <WorkforceRow tone="terracotta" label="Kỹ sư & Giám sát" people="24 Thành viên" percent="100%" />
          </div>
          <div className="construction-notice"><Info size={21} /><span>Mật độ nhân sự đạt đỉnh vào lúc<br />09:00 sáng nay.</span></div>
          <div className="construction-weather">
            <div className="construction-weather-image" />
            <div className="construction-weather-overlay" />
            <div className="construction-weather-copy"><span>THỜI TIẾT HIỆN TẠI</span><strong>28°C / Nắng nhẹ</strong></div>
            <Sun className="construction-sun" size={24} />
            <Building2 className="construction-city-mark" size={42} />
          </div>
        </aside>
      </main>
    </div>
  );
}

function WorkforceRow({ tone, label, people, percent }: { tone: Tone; label: string; people: string; percent: string }) {
  return (
    <div className="construction-workforce-row">
      <span className={`construction-workforce-line is-${tone}`} />
      <div><span>{label}</span><strong>{people}</strong></div>
      <b className={`is-${tone}`}>{percent}</b>
    </div>
  );
}
