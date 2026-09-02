import { useMemo, useState } from "react"
import { MapPin, Plus, Search, SlidersHorizontal } from "lucide-react"
import { Link } from "react-router"

import "./Projects.css"

type ProjectStatus = "Đang thi công" | "Lập kế hoạch" | "Hoàn thành"

type ProjectItem = {
  id: string
  name: string
  location: string
  status: ProjectStatus
  progress: number
  image: string
  leftLabel: string
  leftValue: string
  rightLabel: string
  rightValue: string
}

const projects: ProjectItem[] = [
  {
    id: "BF-2024-001",
    name: "Skyline Tower",
    location: "Quận 1, TP. Hồ Chí Minh",
    status: "Đang thi công",
    progress: 68,
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=85",
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
    image: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1000&q=85",
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
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1000&q=85",
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
    image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1000&q=85",
    leftLabel: "Ngân sách đã dùng",
    leftValue: "$8.5M / $18.2M",
    rightLabel: "Nhân lực hiện tại",
    rightValue: "210 công nhân",
  },
]

function ProjectCard({ project }: { project: ProjectItem }) {
  const statusClass = project.status.toLowerCase().replaceAll(" ", "-")

  return (
    <Link
      to={`/projects/${project.id}`}
      className="projects-card-link"
      aria-label={`Xem chi tiết dự án ${project.name}`}
    >
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
            <span className={project.status === "Lập kế hoạch" ? "is-amber" : ""}>{project.progress}%</span>
          </div>
          <div className="projects-progress" role="progressbar" aria-label={`Tiến độ dự án ${project.name}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={project.progress}>
            <span className={project.status === "Lập kế hoạch" ? "is-amber" : ""} style={{ width: `${project.progress}%` }} />
          </div>

          <div className="projects-card-stats">
            <div><span>{project.leftLabel}</span><strong>{project.leftValue}</strong></div>
            <div><span>{project.rightLabel}</span><strong>{project.rightValue}</strong></div>
          </div>
        </div>
      </article>
    </Link>
  )
}

export default function Projects() {
  const [query] = useState("")
  const [status, setStatus] = useState<"Tất cả" | ProjectStatus>("Tất cả")

  const visibleProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("vi")

    return projects.filter((project) => {
      const matchesStatus = status === "Tất cả" || project.status === status
      const matchesQuery =
        !normalizedQuery ||
        `${project.name} ${project.location} ${project.id}`.toLocaleLowerCase("vi").includes(normalizedQuery)

      return matchesStatus && matchesQuery
    })
  }, [query, status])

  const openCreateDialog = () => {
    window.alert("Biểu mẫu tạo dự án mới sẽ được mở tại đây.")
  }

  return (
    <div className="projects-app">
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
                <select value={status} onChange={(event) => setStatus(event.target.value as "Tất cả" | ProjectStatus)} aria-label="Lọc theo trạng thái">
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
            {visibleProjects.slice(0, 3).map((project) => <ProjectCard key={project.id} project={project} />)}

            {!query && status === "Tất cả" && (
              <button type="button" className="projects-add-card" onClick={openCreateDialog}>
                <span className="projects-add-icon"><Plus size={32} strokeWidth={1.8} /></span>
                <strong>Khởi tạo dự án mới</strong>
                <span>Thiết lập các mốc tiến độ<br />và ngân sách cho công trình mới.</span>
              </button>
            )}

            {visibleProjects.slice(3).map((project) => <ProjectCard key={project.id} project={project} />)}
          </div>

          {visibleProjects.length === 0 && (
            <div className="projects-empty">
              <Search size={28} />
              <h2>Không tìm thấy dự án</h2>
              <p>Hãy thử một trạng thái khác.</p>
            </div>
          )}
        </section>

        <button type="button" className="projects-floating-create" aria-label="Tạo dự án mới" onClick={openCreateDialog}>
          <Plus size={31} />
        </button>
      </main>
    </div>
  )
}
