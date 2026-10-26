import { useEffect, useMemo, useState } from "react";
import { MapPin, Plus, Search, SlidersHorizontal } from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";

import AddProjectModal, {
  type NewProjectValues,
  type ProjectStatus,
} from "./AddProjectModal";
import {
  createProject as createProjectRequest,
  getProjectError,
  getProjects,
  toProjectData,
  type ListProjects,
  type ProjectItem,
} from "./projectService";
import "./Projects.css";

const DEFAULT_PROJECT_IMAGE =
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=85";

function ProjectCard({ project }: { project: ProjectItem }) {
  const statusClass = (project.status || "Lập kế hoạch")
    .toLowerCase()
    .replaceAll(" ", "-");
  const imageUrl =
    project.image?.trim() ||
    project.imageUrl?.trim() ||
    DEFAULT_PROJECT_IMAGE;

  return (
    <Link
      to={`/projects/${project.id}`}
      state={{ project }}
      className="projects-card-link"
      aria-label={`Xem chi tiết dự án ${project.name}`}
    >
      <article className="projects-card">
        <div className="projects-card-image">
          <img
            src={imageUrl}
            alt={`Dự án ${project.name}`}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = DEFAULT_PROJECT_IMAGE;
            }}
          />
          <span className={`projects-status is-${statusClass}`}>
            {project.status}
          </span>
        </div>

        <div className="projects-card-content">
          <div className="projects-card-heading">
            <h2>{project.name}</h2>
            <span>Mã: {project.projectCode}</span>
          </div>

          <p className="projects-location">
            <MapPin size={14} strokeWidth={2} />
            {project.location}
          </p>

          <div className="projects-progress-copy">
            <strong>Tiến độ tổng thể</strong>
            <span
              className={project.status === "Lập kế hoạch" ? "is-amber" : ""}
            >
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
    </Link>
  );
}

export default function Projects() {
  const [query] = useState("");
  const [status, setStatus] = useState<"Tất cả" | ProjectStatus>("Tất cả");
  const [projects, setProjects] = useState<ListProjects>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    getProjects(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setProjects(data);
          setError("");
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setError(getProjectError(error));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [reload]);

  const retry = () => {
    setLoading(true);
    setError("");
    setReload((value) => value + 1);
  };

  const visibleProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("vi");

    return projects?.data.filter((project) => {
      const matchesStatus = status === "Tất cả" || project.status === status;
      const matchesQuery =
        !normalizedQuery ||
        `${project.name} ${project.location} ${project.projectCode}`
          .toLocaleLowerCase("vi")
          .includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [projects, query, status]);

  const createProject = async (values: NewProjectValues) => {
    try {
      await createProjectRequest(toProjectData(values));
    } catch (error) {
      throw new Error(getProjectError(error));
    }
    setIsCreateOpen(false);
    toast.success("Đã tạo dự án mới");
    retry();
  };

  return (
    <div className="projects-app">
      <main className="projects-main">
        <section className="projects-content">
          <div className="projects-title-row">
            <div>
              <h1>Danh sách dự án</h1>
              <p>
                Quản lý và theo dõi tiến độ thi công các công trình hiện tại.
              </p>
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
              <button
                type="button"
                className="projects-create-button"
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus size={19} />
                Thêm dự án mới
              </button>
            </div>
          </div>

          {loading && <p role="status">Đang tải danh sách dự án...</p>}
          {!loading && error && (
            <div role="alert">
              <p>{error}</p>
              <button type="button" onClick={retry}>
                Thử lại
              </button>
            </div>
          )}
          {!loading && !error && (
            <div className="projects-grid">
              {visibleProjects?.slice(0, 3).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}

              {!query && status === "Tất cả" && (
                <button
                  type="button"
                  className="projects-add-card"
                  onClick={() => setIsCreateOpen(true)}
                >
                  <span className="projects-add-icon">
                    <Plus size={32} strokeWidth={1.8} />
                  </span>
                  <strong>Khởi tạo dự án mới</strong>
                  <span>
                    Thiết lập các mốc tiến độ
                    <br />
                    và ngân sách cho công trình mới.
                  </span>
                </button>
              )}

              {visibleProjects?.slice(3).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}

          {!loading && !error && visibleProjects?.length === 0 && (
            <div className="projects-empty">
              <Search size={28} />
              <h2>Không tìm thấy dự án</h2>
              <p>Hãy thử một trạng thái khác.</p>
            </div>
          )}
        </section>

        <button
          type="button"
          className="projects-floating-create"
          aria-label="Tạo dự án mới"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus size={31} />
        </button>
      </main>

      <AddProjectModal
        open={isCreateOpen}
        existingIds={
          projects?.data?.map((project) => project.projectCode) ?? []
        }
        onCancel={() => setIsCreateOpen(false)}
        onCreate={createProject}
      />
    </div>
  );
}
