import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import { toast } from "sonner";
import AddProjectModal, { type NewProjectValues } from "../AddProjectModal";
import {
  getProjectById,
  getProjectError,
  toProject,
  toProjectData,
  updateProject,
  type ProjectItem,
} from "../projectService";
import {
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  ChevronRight,
  Clock,
  CloudSun,
  FileText,
  HardHat,
  Layers,
  MapPin,
  Package,
  Pencil,
  Share2,
  ShieldCheck,
  TrendingUp,
  UsersRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import EmployeeManager from "./employeeManager";
import ProjectTasksTab from "./ProjectTasksTab";
import "./ProjectDetail.css";

const tabs = ["Tổng quan", "Công việc", "Vật tư", "Nhân sự", "Tài liệu"];

export default function ProjectDetail() {
  const [activeTab, setActiveTab] = useState("Tổng quan");

  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const stateProject = useMemo(() => {
    const raw = (location.state as { project?: unknown } | null)?.project;
    if (!raw || typeof raw !== "object") return undefined;
    try {
      const item = toProject(raw);
      if (
        String(item.id) === String(projectId ?? "") ||
        item.projectCode.toLowerCase() === String(projectId ?? "").toLowerCase()
      ) {
        return item;
      }
    } catch {
      return undefined;
    }
    return undefined;
  }, [location.state, projectId]);

  const [result, setResult] = useState<{
    id: string;
    project?: ProjectItem;
    error?: string;
  }>();
  const [reload, setReload] = useState(0);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    getProjectById(projectId ?? "", controller.signal)
      .then((project) => {
        if (!controller.signal.aborted) {
          setResult({ id: projectId ?? "", project: project ?? stateProject });
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          if (stateProject) {
            setResult({ id: projectId ?? "", project: stateProject });
          } else {
            setResult({ id: projectId ?? "", error: getProjectError(error) });
          }
        }
      });
    return () => controller.abort();
  }, [projectId, reload, stateProject]);

  const retry = () => {
    setResult(undefined);
    setReload((value) => value + 1);
  };

  const isCurrentResult = result?.id === (projectId ?? "");
  const project = (isCurrentResult ? result?.project : undefined) ?? stateProject;

  if (!project && !isCurrentResult) {
    return (
      <div className="project-detail-app">
        <main className="project-detail-content">
          <p role="status">Đang tải chi tiết dự án...</p>
        </main>
      </div>
    );
  }

  if (!project && result?.error) {
    return (
      <div className="project-detail-app">
        <main className="project-detail-content">
          <p role="alert">{result.error}</p>
          <Button onClick={retry}>Thử lại</Button>
          <Link to="/projects">Quay lại danh sách dự án</Link>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-detail-app">
        <main className="project-detail-content">
          <h1>Không tìm thấy dự án</h1>
          <p role="alert">Mã dự án {projectId} không tồn tại.</p>
          <Link to="/projects">Quay lại danh sách dự án</Link>
        </main>
      </div>
    );
  }

  const handleUpdate = async (values: NewProjectValues) => {
    try {
      await updateProject(project.id, toProjectData(values));
    } catch (error) {
      throw new Error(getProjectError(error));
    }
    setIsEditOpen(false);
    toast.success("Đã cập nhật dự án");
    retry();
  };

  const handleExport = () => {
    const report = [
      project.name,
      project.projectCode,
      project.location,
      project.status,
      `Tiến độ: ${project.progress}%`,
      `${project.leftLabel}: ${project.leftValue}`,
      `${project.rightLabel}: ${project.rightValue}`,
    ].join("\n");
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `${project.id}-report.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const formatVnd = (amount: number) =>
    `${new Intl.NumberFormat("vi-VN").format(Math.max(0, Math.round(amount)))} VNĐ`;

  const disbursedBudget = project.budget * (project.progress / 100);
  const remainingBudget = Math.max(0, project.budget - disbursedBudget);
  const engineersCount = Math.max(
    1,
    Math.round(project.expectedPersonnel * 0.18),
  );
  const workersCount = Math.max(0, project.expectedPersonnel - engineersCount);

  const milestones = [
    {
      step: "01",
      title: "Chuẩn bị mặt bằng & Pháp lý công trình",
      detail: "Khảo sát địa chất, cấp phép xây dựng và bàn giao mốc giới",
      threshold: 25,
      prevThreshold: 0,
    },
    {
      step: "02",
      title: "Thi công móng & Hạng mục ngầm",
      detail: "Ép cọc đại trà, đài móng bê tông cốt thép và hầm kỹ thuật",
      threshold: 55,
      prevThreshold: 25,
    },
    {
      step: "03",
      title: "Kết cấu phần thân & Hệ thống cơ điện (M&E)",
      detail: "Đổ bê tông sàn các tầng, lắp đặt trục kỹ thuật điện - nước - PCCC",
      threshold: 85,
      prevThreshold: 55,
    },
    {
      step: "04",
      title: "Hoàn thiện kiến trúc & Nghiệm thu bàn giao",
      detail: "Ốp lát, sơn hoàn thiện, chạy thử liên động và bàn giao chủ đầu tư",
      threshold: 100,
      prevThreshold: 85,
    },
  ].map((item) => {
    const span = item.threshold - item.prevThreshold;
    const rawPhaseProgress =
      ((project.progress - item.prevThreshold) / span) * 100;
    const phaseProgress = Math.max(0, Math.min(100, Math.round(rawPhaseProgress)));
    const state: "done" | "active" | "upcoming" =
      phaseProgress >= 100
        ? "done"
        : phaseProgress > 0 || (project.progress === 0 && item.step === "01")
          ? "active"
          : "upcoming";
    const label =
      state === "done"
        ? "Hoàn thành"
        : state === "active"
          ? `Đang triển khai · ${phaseProgress}%`
          : "Sắp tới";

    return { ...item, phaseProgress, state, label };
  });

  const budgetAllocations = [
    {
      label: "Vật tư kết cấu (Bê tông & Cốt thép)",
      share: 48,
      amount: formatVnd(project.budget * 0.48),
      tone: "is-done" as const,
    },
    {
      label: "Hệ thống cơ điện & PCCC (M&E)",
      share: 27,
      amount: formatVnd(project.budget * 0.27),
      tone: "is-active" as const,
    },
    {
      label: "Nhân công & Vận hành hiện trường",
      share: 25,
      amount: formatVnd(project.budget * 0.25),
      tone: "is-done" as const,
    },
  ];

  const defaultCover =
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=85";
  const coverImage =
    project.image?.trim() || project.imageUrl?.trim() || defaultCover;

  return (
    <div className="project-detail-app">
      <main className="project-detail-main">
        <section className="project-detail-content">
          <div className="project-detail-title-row">
            <div className="project-detail-title-copy">
              <div className="project-detail-badges">
                <Badge variant="secondary">{project.projectCode}</Badge>
                <Badge variant="outline">{project.status}</Badge>
              </div>
              <h1>{project.name}</h1>
              <div className="project-detail-meta">
                <span>
                  <MapPin size={17} />
                  {project.location}
                </span>
              </div>
            </div>

            <div className="project-detail-title-actions">
              <Button type="button" variant="outline" className="project-detail-edit-button" onClick={() => setIsEditOpen(true)}>
                <Pencil size={18} />
                Chỉnh sửa
              </Button>
              <Button type="button" className="project-detail-export-button" onClick={handleExport}>
                <Share2 size={18} />
                Xuất báo cáo
              </Button>
            </div>
          </div>

          <div className="project-detail-summary-grid">
            <Card className="project-detail-progress-card block gap-0 py-0">
              <div className="project-detail-card-title">
                <h2>Tiến độ tổng thể</h2>
                <span>
                  <TrendingUp size={21} />
                </span>
              </div>

              <div className="project-detail-progress-body">
                <div className="project-detail-progress-ring" aria-label={`Tiến độ hoàn thành ${project.progress}%`} style={{ background: `conic-gradient(from -90deg, #087f74 0 ${project.progress}%, #eeebf4 ${project.progress}% 100%)` }}>
                  <div>
                    <strong>{project.progress}%</strong>
                    <span>Hoàn thành</span>
                  </div>
                </div>

                <div className="project-detail-progress-info">
                  <div>
                    <span>Giải ngân theo tiến độ</span>
                    <strong>{formatVnd(disbursedBudget)}</strong>
                    <Progress value={project.progress} className="project-detail-time-track" indicatorClassName="project-detail-time-indicator" />
                  </div>
                  <div className="project-detail-budget">
                    <span>{project.leftLabel}</span>
                    <strong>{project.leftValue}</strong>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="project-detail-workforce-card block gap-0 border-0 py-0 text-white">
              <div className="project-detail-workforce-title">
                <h2>
                  <UsersRound size={21} />
                  {project.rightLabel}
                </h2>
                <ChevronRight size={30} />
              </div>

              <div className="project-detail-workforce-stats">
                <div>
                  <span>Kỹ sư giám sát</span>
                  <strong>
                    {engineersCount} <small>người</small>
                  </strong>
                </div>
                <div>
                  <span>Công nhân thi công</span>
                  <strong>
                    {workersCount} <small>người</small>
                  </strong>
                </div>
              </div>

              <Button type="button" variant="secondary" onClick={() => setActiveTab("Nhân sự")}>
                Quản lý chấm công
              </Button>
            </Card>
          </div>

          <nav className="project-detail-tabs" aria-label="Nội dung dự án">
            {tabs.map((tab) => (
              <Button
                key={tab}
                type="button"
                variant="ghost"
                className={activeTab === tab ? "active" : ""}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </Button>
            ))}
          </nav>

          <section className="project-detail-tab-panel" aria-live="polite">
            <span className="sr-only">Đang xem mục {activeTab}</span>

            {activeTab === "Tổng quan" && (
              <div className="project-overview-grid">
                <div className="project-overview-stack">
                  <article className="project-overview-card">
                    <div className="project-overview-hero">
                      <img
                        src={coverImage}
                        alt={`Phối cảnh dự án ${project.name}`}
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = defaultCover;
                        }}
                      />
                      <div className="project-overview-hero-overlay">
                        <div className="project-overview-hero-top">
                          <span className="project-overview-pill">
                            <span className="project-overview-pill-dot" />
                            {project.status}
                          </span>
                          <span className="project-overview-pill">
                            Mã: {project.projectCode}
                          </span>
                        </div>
                        <div className="project-overview-hero-bottom">
                          <h3>{project.name}</h3>
                          <p>
                            <MapPin size={14} />
                            {project.location}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="project-overview-dossier">
                      <p className="project-overview-description">
                        Công trình <strong>{project.name}</strong> ({project.projectCode}) đang ở trạng thái{" "}
                        <strong>{project.status.toLowerCase()}</strong> tại khu vực{" "}
                        <strong>{project.location}</strong> với mức hoàn thành tổng thể{" "}
                        <strong>{project.progress}%</strong>. Hồ sơ kỹ thuật, định mức vật tư và nhật ký an toàn được đồng bộ trực tiếp theo ca thi công.
                      </p>

                      <div className="project-overview-metrics">
                        <div className="project-overview-metric-box">
                          <span>Tổng ngân sách dự kiến</span>
                          <strong>{project.leftValue}</strong>
                        </div>
                        <div className="project-overview-metric-box">
                          <span>Hạn mức còn lại</span>
                          <strong className="is-teal">
                            {formatVnd(remainingBudget)}
                          </strong>
                        </div>
                        <div className="project-overview-metric-box">
                          <span>Quy mô nhân sự</span>
                          <strong>{project.rightValue}</strong>
                        </div>
                        <div className="project-overview-metric-box">
                          <span>Tình trạng an toàn (HSE)</span>
                          <strong className="is-teal">100% đạt chuẩn</strong>
                        </div>
                      </div>
                    </div>
                  </article>

                  <article className="project-overview-card">
                    <div className="project-overview-section-header">
                      <h3>
                        <Layers size={19} />
                        Lộ trình & Mốc thi công chính
                      </h3>
                      <span className="project-overview-eyebrow">
                        {project.progress}% hoàn thành
                      </span>
                    </div>

                    <div className="project-overview-milestones">
                      {milestones.map((milestone) => (
                        <div
                          key={milestone.step}
                          className="project-milestone-item"
                        >
                          <div
                            className={`project-milestone-icon is-${milestone.state}`}
                          >
                            {milestone.state === "done" ? (
                              <CheckCircle2 size={18} />
                            ) : (
                              milestone.step
                            )}
                          </div>
                          <div className="project-milestone-body">
                            <div className="project-milestone-row">
                              <strong>{milestone.title}</strong>
                              <span
                                className={`project-milestone-tag is-${milestone.state}`}
                              >
                                {milestone.label}
                              </span>
                            </div>
                            <p>{milestone.detail}</p>
                            <div className="project-milestone-bar">
                              <span
                                className={`is-${milestone.state}`}
                                style={{ width: `${milestone.phaseProgress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>
                </div>

                <div className="project-overview-stack">
                  <article className="project-overview-card">
                    <div className="project-overview-section-header">
                      <h3>
                        <Banknote size={19} />
                        Cơ cấu phân bổ ngân sách
                      </h3>
                      <span className="project-overview-eyebrow">
                        {project.projectCode}
                      </span>
                    </div>

                    <div className="project-overview-Allocations">
                      {budgetAllocations.map((item) => (
                        <div
                          key={item.label}
                          className="project-allocation-row"
                        >
                          <div className="project-allocation-copy">
                            <span>{item.label}</span>
                            <strong>{item.share}%</strong>
                          </div>
                          <div className="project-milestone-bar">
                            <span
                              className={item.tone}
                              style={{ width: `${item.share}%` }}
                            />
                          </div>
                          <div className="project-allocation-sub">
                            <span>Hạn mức phân bổ</span>
                            <span>{item.amount}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>

                  <article className="project-overview-card">
                    <div className="project-overview-section-header">
                      <h3>
                        <HardHat size={19} />
                        Nhịp độ công trường hôm nay
                      </h3>
                    </div>

                    <div className="project-site-pulse">
                      <div className="project-pulse-item">
                        <div className="project-pulse-icon is-amber">
                          <CloudSun size={19} />
                        </div>
                        <div className="project-pulse-copy">
                          <strong>Thời tiết thuận lợi · 29°C Nắng nhẹ</strong>
                          <p>
                            Độ ẩm 64% tại {project.location}, đủ điều kiện đổ bê tông và cẩu lắp tầng cao.
                          </p>
                        </div>
                      </div>

                      <div className="project-pulse-item">
                        <div className="project-pulse-icon is-teal">
                          <ShieldCheck size={19} />
                        </div>
                        <div className="project-pulse-copy">
                          <strong>Kiểm định an toàn đầu ca hoàn tất</strong>
                          <p>
                            {project.expectedPersonnel} nhân sự đã trang bị đầy đủ bảo hộ lao động (PPE) và thẻ ra vào.
                          </p>
                        </div>
                      </div>

                      <div className="project-pulse-item">
                        <div className="project-pulse-icon is-terracotta">
                          <Clock size={19} />
                        </div>
                        <div className="project-pulse-copy">
                          <strong>Báo cáo nghiệm thu giai đoạn</strong>
                          <p>
                            Cập nhật hồ sơ bản vẽ hoàn công và nhật ký giám sát định kỳ tuần này.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="project-quick-links">
                      <button
                        type="button"
                        className="project-quick-link-btn"
                        onClick={() => setActiveTab("Công việc")}
                      >
                        <span>Hạng mục công việc</span>
                        <ArrowUpRight size={15} />
                      </button>
                      <button
                        type="button"
                        className="project-quick-link-btn"
                        onClick={() => setActiveTab("Vật tư")}
                      >
                        <span>Định mức vật tư</span>
                        <ArrowUpRight size={15} />
                      </button>
                      <Link to="/files" className="project-quick-link-btn">
                        <span>Hồ sơ & Bản vẽ CAD</span>
                        <ArrowUpRight size={15} />
                      </Link>
                      <Link
                        to="/managed-fields"
                        className="project-quick-link-btn"
                      >
                        <span>Nhật ký hiện trường</span>
                        <ArrowUpRight size={15} />
                      </Link>
                    </div>
                  </article>
                </div>
              </div>
            )}

            {activeTab === "Công việc" && (
              <ProjectTasksTab project={project} />
            )}

            {activeTab === "Nhân sự" && (
              <EmployeeManager project={project} />
            )}

            {activeTab !== "Tổng quan" &&
              activeTab !== "Công việc" &&
              activeTab !== "Nhân sự" && (
              <article className="project-overview-card">
                <div className="project-overview-section-header">
                  <h3>
                    {activeTab === "Vật tư" && <Package size={19} />}
                    {activeTab === "Tài liệu" && <FileText size={19} />}
                    Phân hệ {activeTab} · {project.name}
                  </h3>
                  <span className="project-overview-eyebrow">
                    {project.projectCode}
                  </span>
                </div>
                <div className="project-overview-dossier">
                  <p className="project-overview-description">
                    Dữ liệu chi tiết mục <strong>{activeTab}</strong> của công trình{" "}
                    <strong>{project.name}</strong> đang được đồng bộ với tiến độ{" "}
                    <strong>{project.progress}%</strong>. Bạn có thể quay lại tab{" "}
                    <strong>Tổng quan</strong> hoặc mở trực tiếp kho tài liệu và nhật ký hiện trường.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("Tổng quan")}
                    >
                      Xem Tổng quan dự án
                    </Button>
                    {activeTab === "Tài liệu" && (
                      <Link
                        to="/files"
                        className="project-quick-link-btn"
                      >
                        <span>Mở trung tâm Tài liệu & Bản vẽ</span>
                        <ArrowUpRight size={15} />
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            )}
          </section>
        </section>
      </main>
      {isEditOpen && <AddProjectModal
        key={project.id}
        open
        mode="edit"
        existingIds={[]}
        initialValues={{
          id: project.projectCode,
          name: project.name,
          location: project.location,
          status: project.status,
          progress: project.progress,
          budget: project.budget,
          teamSize: project.expectedPersonnel,
          image: project.image,
        }}
        onCancel={() => setIsEditOpen(false)}
        onCreate={handleUpdate}
      />}
    </div>
  );
}
