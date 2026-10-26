import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock,
  Eye,
  HardHat,
  Hash,
  Layers,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserCheck,
} from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ProjectItem } from "../projectService";
import {
  getEmployeeInitials,
  loadProjectEmployees,
  type ProjectEmployee,
} from "./employeeManager";

export type TaskStatus =
  | "Cần làm"
  | "Đang thực hiện"
  | "Chờ nghiệm thu"
  | "Hoàn thành";

export type TaskPriority = "Cao" | "Trung bình" | "Thấp";

export type TaskCategory =
  | "Kết cấu"
  | "Hệ thống M&E"
  | "Hoàn thiện"
  | "An toàn HSE"
  | "Pháp lý & Hồ sơ";

export interface ProjectTask {
  id: number;
  code: string;
  title: string;
  description: string;
  category: TaskCategory;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  dueDate: string;
  progress: number;
}

const STATUS_FILTERS: Array<"Tất cả" | TaskStatus> = [
  "Tất cả",
  "Cần làm",
  "Đang thực hiện",
  "Chờ nghiệm thu",
  "Hoàn thành",
];

const CATEGORIES: TaskCategory[] = [
  "Kết cấu",
  "Hệ thống M&E",
  "Hoàn thiện",
  "An toàn HSE",
  "Pháp lý & Hồ sơ",
];

const PRIORITIES: TaskPriority[] = ["Cao", "Trung bình", "Thấp"];
const STATUSES: TaskStatus[] = [
  "Cần làm",
  "Đang thực hiện",
  "Chờ nghiệm thu",
  "Hoàn thành",
];

const PROGRESS_PRESETS = [0, 25, 50, 75, 100];

function getStorageKey(projectId: number) {
  return `cm_project_tasks_v1_${projectId}`;
}

function createInitialTasks(project: ProjectItem): ProjectTask[] {
  const prefix = project.projectCode.split("-")[0] || "CV";
  const isCompleted = project.progress >= 100;
  const isPlanning = project.progress <= 15;

  return [
    {
      id: 1,
      code: `${prefix}-T01`,
      title: "Kiểm định tĩnh tải & Nghiệm thu cốt thép móng",
      description:
        "Kiểm tra khoảng cách đai thép, lớp bê tông bảo vệ và lập biên bản nghiệm thu nội bộ trước khi đổ bê tông đài móng.",
      category: "Kết cấu",
      status: isPlanning ? "Đang thực hiện" : "Hoàn thành",
      priority: "Cao",
      assignee: "KS. Nguyễn Văn Nam",
      dueDate: "2026-10-28",
      progress: isPlanning ? 45 : 100,
    },
    {
      id: 2,
      code: `${prefix}-T02`,
      title: "Lắp đặt ống chờ cấp thoát nước & Trục điện M&E tầng điển hình",
      description:
        "Định vị sleeve xuyên dầm sàn theo bản vẽ shopdrawing đã duyệt, thử áp lực đường ống trục đứng.",
      category: "Hệ thống M&E",
      status: isCompleted ? "Hoàn thành" : "Đang thực hiện",
      priority: "Cao",
      assignee: "KS. Lê Minh Hiếu",
      dueDate: "2026-11-05",
      progress: isCompleted
        ? 100
        : Math.min(90, Math.max(30, project.progress)),
    },
    {
      id: 3,
      code: `${prefix}-T03`,
      title: "Kiểm tra an toàn giàn giáo & Lưới bao che mặt ngoài",
      description:
        "Rà soát toàn bộ neo giằng giáo ngoài, hành lang an toàn và biển cảnh báo khu vực cẩu tháp hoạt động.",
      category: "An toàn HSE",
      status: isCompleted ? "Hoàn thành" : "Chờ nghiệm thu",
      priority: "Trung bình",
      assignee: "KS. Trần Đình Tú",
      dueDate: "2026-11-02",
      progress: isCompleted ? 100 : 85,
    },
    {
      id: 4,
      code: `${prefix}-T04`,
      title: "Trình duyệt mẫu vật liệu ốp lát & Sơn hoàn thiện sảnh chính",
      description:
        "Tổng hợp bảng mẫu vật liệu (spec sheet), chứng chỉ xuất xứ CO/CQ trình Chủ đầu tư và Tư vấn giám sát phê duyệt.",
      category: "Pháp lý & Hồ sơ",
      status: isCompleted ? "Hoàn thành" : "Cần làm",
      priority: "Thấp",
      assignee: "KTS. Phạm Thu Hà",
      dueDate: "2026-11-12",
      progress: isCompleted ? 100 : 10,
    },
  ];
}

function loadTasks(project: ProjectItem): ProjectTask[] {
  try {
    const raw = localStorage.getItem(getStorageKey(project.id));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Fallback to initial seeded tasks
  }
  const seeded = createInitialTasks(project);
  saveTasks(project.id, seeded);
  return seeded;
}

function saveTasks(projectId: number, tasks: ProjectTask[]) {
  try {
    localStorage.setItem(getStorageKey(projectId), JSON.stringify(tasks));
  } catch {
    // Ignore storage quota errors
  }
}

function getInitials(name: string): string {
  const clean = name.replace(/^(KS\.|KTS\.|TS\.)\s*/i, "").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "NV";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatDueDate(dateStr: string): string {
  if (!dateStr) return "Chưa đặt hạn";
  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return dateStr;
  return `${d}/${m}/${y}`;
}

function getStatusClass(status: TaskStatus): string {
  switch (status) {
    case "Hoàn thành":
      return "is-done";
    case "Đang thực hiện":
      return "is-progress";
    case "Chờ nghiệm thu":
      return "is-review";
    default:
      return "is-todo";
  }
}

function getPriorityClass(priority: TaskPriority): string {
  switch (priority) {
    case "Cao":
      return "is-high";
    case "Trung bình":
      return "is-medium";
    default:
      return "is-low";
  }
}

export default function ProjectTasksTab({ project }: { project: ProjectItem }) {
  const [tasks, setTasks] = useState<ProjectTask[]>(() => loadTasks(project));
  const [employees, setEmployees] = useState<ProjectEmployee[]>(() =>
    loadProjectEmployees(project),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Tất cả" | TaskStatus>(
    "Tất cả",
  );

  // Modal state for Create / Edit
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);

  // Form controlled values
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TaskCategory>("Kết cấu");
  const [status, setStatus] = useState<TaskStatus>("Cần làm");
  const [priority, setPriority] = useState<TaskPriority>("Trung bình");
  const [assignee, setAssignee] = useState("");
  const [assigneeSearch, setAssigneeSearch] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [progress, setProgress] = useState(0);

  // Delete dialog state
  const [deletingTask, setDeletingTask] = useState<ProjectTask | null>(null);

  useEffect(() => {
    setTasks(loadTasks(project));
    setEmployees(loadProjectEmployees(project));
  }, [project]);

  useEffect(() => {
    const syncEmployees = () => {
      setEmployees(loadProjectEmployees(project));
    };
    window.addEventListener("cm-project-employees-updated", syncEmployees);
    return () => {
      window.removeEventListener("cm-project-employees-updated", syncEmployees);
    };
  }, [project]);

  const updateTaskList = (nextTasks: ProjectTask[]) => {
    setTasks(nextTasks);
    saveTasks(project.id, nextTasks);
  };

  const counts = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "Hoàn thành").length;
    const inProgress = tasks.filter(
      (t) => t.status === "Đang thực hiện" || t.status === "Chờ nghiệm thu",
    ).length;
    const highPriority = tasks.filter(
      (t) => t.priority === "Cao" && t.status !== "Hoàn thành",
    ).length;
    const avgProgress =
      total > 0
        ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / total)
        : 0;

    return { total, completed, inProgress, highPriority, avgProgress };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const q = searchQuery.trim().toLocaleLowerCase("vi");
    return tasks.filter((task) => {
      const matchesStatus =
        statusFilter === "Tất cả" || task.status === statusFilter;
      const matchesSearch =
        !q ||
        `${task.code} ${task.title} ${task.description} ${task.assignee} ${task.category}`
          .toLocaleLowerCase("vi")
          .includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [tasks, searchQuery, statusFilter]);

  const filteredModalEmployees = useMemo(() => {
    const q = assigneeSearch.trim().toLocaleLowerCase("vi");
    if (!q) return employees;
    return employees.filter((emp) =>
      `${emp.code} ${emp.name} ${emp.role} ${emp.team}`
        .toLocaleLowerCase("vi")
        .includes(q),
    );
  }, [employees, assigneeSearch]);

  const openCreateModal = () => {
    const latestEmployees = loadProjectEmployees(project);
    setEmployees(latestEmployees);

    const prefix = project.projectCode.split("-")[0] || "CV";
    const existingCodes = new Set(tasks.map((t) => t.code.toUpperCase()));
    let num = tasks.length + 1;
    let suggestedCode = `${prefix}-T${String(num).padStart(2, "0")}`;
    while (existingCodes.has(suggestedCode.toUpperCase())) {
      num += 1;
      suggestedCode = `${prefix}-T${String(num).padStart(2, "0")}`;
    }

    setEditingTask(null);
    setCode(suggestedCode);
    setCodeError("");
    setTitle("");
    setDescription("");
    setCategory("Kết cấu");
    setStatus("Cần làm");
    setPriority("Trung bình");
    setAssignee(latestEmployees[0]?.name ?? "KS. Nguyễn Văn Nam");
    setAssigneeSearch("");
    setDueDate(new Date().toISOString().slice(0, 10));
    setProgress(0);
    setIsFormOpen(true);
  };

  const openEditModal = (task: ProjectTask) => {
    setEmployees(loadProjectEmployees(project));
    setEditingTask(task);
    setCode(task.code);
    setCodeError("");
    setTitle(task.title);
    setDescription(task.description);
    setCategory(task.category);
    setStatus(task.status);
    setPriority(task.priority);
    setAssignee(task.assignee);
    setAssigneeSearch("");
    setDueDate(task.dueDate);
    setProgress(task.progress);
    setIsFormOpen(true);
  };

  const handleStatusChangeInModal = (nextStatus: TaskStatus) => {
    setStatus(nextStatus);
    if (nextStatus === "Hoàn thành") {
      setProgress(100);
    } else if (nextStatus === "Cần làm") {
      setProgress(0);
    } else if (nextStatus === "Đang thực hiện" && (progress === 0 || progress === 100)) {
      setProgress(45);
    } else if (nextStatus === "Chờ nghiệm thu" && (progress < 75 || progress === 100)) {
      setProgress(85);
    }
  };

  const handleProgressChange = (nextVal: number) => {
    const clamped = Math.max(0, Math.min(100, nextVal));
    setProgress(clamped);
    if (clamped === 100) {
      setStatus("Hoàn thành");
    } else if (clamped === 0) {
      setStatus("Cần làm");
    } else if (clamped >= 80 && status === "Cần làm") {
      setStatus("Chờ nghiệm thu");
    } else if (status === "Hoàn thành" || status === "Cần làm") {
      setStatus("Đang thực hiện");
    }
  };

  const handleSaveTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const normalizedCode = code.trim().toUpperCase();

    if (!trimmedTitle) {
      toast.error("Vui lòng nhập tên công việc");
      return;
    }

    const isDuplicateCode = tasks.some(
      (item) =>
        item.code.toUpperCase() === normalizedCode &&
        item.id !== editingTask?.id,
    );
    if (isDuplicateCode) {
      setCodeError("Mã công việc này đã tồn tại trong dự án");
      return;
    }

    const normalizedProgress =
      status === "Hoàn thành"
        ? 100
        : Math.max(0, Math.min(100, Number(progress) || 0));
    const normalizedStatus: TaskStatus =
      normalizedProgress === 100 ? "Hoàn thành" : status;

    if (editingTask) {
      const updated = tasks.map((item) =>
        item.id === editingTask.id
          ? {
              ...item,
              code: normalizedCode || item.code,
              title: trimmedTitle,
              description: description.trim(),
              category,
              status: normalizedStatus,
              priority,
              assignee: assignee.trim() || "Ban chỉ huy",
              dueDate,
              progress: normalizedProgress,
            }
          : item,
      );
      updateTaskList(updated);
      toast.success(`Đã cập nhật công việc "${trimmedTitle}"`);
    } else {
      const nextId =
        tasks.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;
      const newTask: ProjectTask = {
        id: nextId,
        code:
          normalizedCode || `CV-T${String(nextId).padStart(2, "0")}`,
        title: trimmedTitle,
        description: description.trim(),
        category,
        status: normalizedStatus,
        priority,
        assignee: assignee.trim() || "Ban chỉ huy",
        dueDate,
        progress: normalizedProgress,
      };
      updateTaskList([newTask, ...tasks]);
      toast.success(`Đã thêm công việc "${trimmedTitle}"`);
    }

    setIsFormOpen(false);
    setEditingTask(null);
  };

  const toggleTaskComplete = (task: ProjectTask) => {
    const isDone = task.status === "Hoàn thành";
    const nextStatus: TaskStatus = isDone ? "Đang thực hiện" : "Hoàn thành";
    const nextProgress = isDone ? Math.min(task.progress, 60) : 100;

    const updated = tasks.map((item) =>
      item.id === task.id
        ? { ...item, status: nextStatus, progress: nextProgress }
        : item,
    );
    updateTaskList(updated);
    toast.success(
      isDone
        ? `Đã mở lại công việc "${task.title}"`
        : `Đã đánh dấu hoàn thành "${task.title}"`,
    );
  };

  const confirmDeleteTask = () => {
    if (!deletingTask) return;
    const updated = tasks.filter((item) => item.id !== deletingTask.id);
    updateTaskList(updated);
    toast.success(`Đã xóa công việc "${deletingTask.title}"`);
    setDeletingTask(null);
  };

  return (
    <div className="project-tasks-wrapper">
      {/* KPI Summary Strip */}
      <div className="project-tasks-kpis">
        <div className="project-tasks-kpi-card">
          <div className="project-tasks-kpi-copy">
            <span>Tổng hạng mục công việc</span>
            <strong>
              {counts.completed} / {counts.total}
            </strong>
            <small>Hoàn thành trung bình {counts.avgProgress}%</small>
          </div>
          <div className="project-tasks-kpi-icon is-teal">
            <ClipboardList size={21} />
          </div>
        </div>

        <div className="project-tasks-kpi-card">
          <div className="project-tasks-kpi-copy">
            <span>Đang triển khai & Nghiệm thu</span>
            <strong>{counts.inProgress}</strong>
            <small>Hạng mục đang chạy ngoài hiện trường</small>
          </div>
          <div className="project-tasks-kpi-icon is-amber">
            <Clock size={21} />
          </div>
        </div>

        <div className="project-tasks-kpi-card">
          <div className="project-tasks-kpi-copy">
            <span>Ưu tiên cao cần xử lý</span>
            <strong>{counts.highPriority}</strong>
            <small>Hạng mục trọng điểm kỹ thuật & an toàn</small>
          </div>
          <div className="project-tasks-kpi-icon is-terracotta">
            <AlertTriangle size={21} />
          </div>
        </div>
      </div>

      {/* Filter & Action Toolbar */}
      <div className="project-tasks-toolbar">
        <div className="project-tasks-search-group">
          <label className="project-tasks-search">
            <Search size={17} />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm mã, tên công việc, kỹ sư phụ trách..."
              aria-label="Tìm kiếm công việc"
            />
          </label>

          <div
            className="project-tasks-filter-pills"
            role="group"
            aria-label="Lọc theo trạng thái công việc"
          >
            {STATUS_FILTERS.map((filterName) => {
              const count =
                filterName === "Tất cả"
                  ? tasks.length
                  : tasks.filter((t) => t.status === filterName).length;
              return (
                <button
                  key={filterName}
                  type="button"
                  className={`project-tasks-pill-btn ${
                    statusFilter === filterName ? "is-active" : ""
                  }`}
                  onClick={() => setStatusFilter(filterName)}
                >
                  <span>{filterName}</span>
                  <span className="project-tasks-pill-count">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          className="project-tasks-add-btn"
          onClick={openCreateModal}
        >
          <Plus size={18} />
          Thêm công việc
        </button>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="project-tasks-empty">
          <CheckCircle2 size={34} className="mx-auto text-[#00786e]" />
          <h3>Không tìm thấy hạng mục công việc</h3>
          <p>
            Chưa có công việc nào khớp với bộ lọc hiện tại hoặc bạn có thể khởi
            tạo hạng mục thi công mới cho dự án.
          </p>
          <Button
            type="button"
            onClick={openCreateModal}
            className="bg-[#087f74] text-white hover:bg-[#006b61]"
          >
            <Plus size={17} />
            Tạo công việc đầu tiên
          </Button>
        </div>
      ) : (
        <div className="project-tasks-list">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === "Hoàn thành";
            return (
              <article
                key={task.id}
                className={`project-task-card ${
                  isCompleted ? "is-completed" : ""
                }`}
              >
                <button
                  type="button"
                  className={`project-task-check ${
                    isCompleted ? "is-checked" : ""
                  }`}
                  onClick={() => toggleTaskComplete(task)}
                  aria-label={
                    isCompleted
                      ? `Đánh dấu chưa hoàn thành ${task.title}`
                      : `Đánh dấu hoàn thành ${task.title}`
                  }
                  title={
                    isCompleted ? "Mở lại công việc" : "Đánh dấu hoàn thành"
                  }
                >
                  <Check size={15} strokeWidth={3} />
                </button>

                <div className="project-task-main">
                  <div className="project-task-header">
                    <span className="project-task-code">{task.code}</span>
                    <span className="project-task-category">
                      {task.category}
                    </span>
                    <span
                      className={`project-task-priority ${getPriorityClass(
                        task.priority,
                      )}`}
                    >
                      Ưu tiên: {task.priority}
                    </span>
                    <span
                      className={`project-task-status ${getStatusClass(
                        task.status,
                      )}`}
                    >
                      {task.status}
                    </span>
                  </div>

                  <h3 className="project-task-title">
                    <Link
                      to={`/tasks/${task.code}`}
                      state={{ task, project }}
                      className="hover:text-[#00796f] hover:underline"
                    >
                      {task.title}
                    </Link>
                  </h3>
                  {task.description && (
                    <p className="project-task-desc">{task.description}</p>
                  )}

                  <div className="project-task-meta">
                    <span className="project-task-meta-item">
                      <span className="project-task-avatar">
                        {getInitials(task.assignee)}
                      </span>
                      <strong>{task.assignee}</strong>
                    </span>

                    <span className="project-task-meta-item">
                      <CalendarDays size={14} />
                      Hạn: {formatDueDate(task.dueDate)}
                    </span>

                    <div className="project-task-progress-wrap">
                      <div className="project-task-progress-bar">
                        <span style={{ width: `${task.progress}%` }} />
                      </div>
                      <strong>{task.progress}%</strong>
                    </div>
                  </div>
                </div>

                <div className="project-task-actions">
                  <Link
                    to={`/tasks/${task.code}`}
                    state={{ task, project }}
                    className="project-task-icon-btn"
                    aria-label={`Xem chi tiết ${task.title}`}
                    title="Xem chi tiết công việc"
                  >
                    <Eye size={16} />
                  </Link>
                  <button
                    type="button"
                    className="project-task-icon-btn"
                    onClick={() => openEditModal(task)}
                    aria-label={`Chỉnh sửa ${task.title}`}
                    title="Chỉnh sửa công việc"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    className="project-task-icon-btn is-danger"
                    onClick={() => setDeletingTask(task)}
                    aria-label={`Xóa ${task.title}`}
                    title="Xóa công việc"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* High-Craft Create / Edit Task Dialog */}
      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsFormOpen(false);
            setEditingTask(null);
            setCodeError("");
          }
        }}
      >
        <DialogContent className="task-modal max-h-[calc(100vh-2rem)] max-w-[680px] overflow-y-auto p-0">
          <DialogHeader className="task-modal__header">
            <div className="task-modal__icon-badge">
              <HardHat size={23} />
            </div>
            <div className="task-modal__header-copy">
              <span className="task-modal__eyebrow">
                {project.projectCode} · {project.name}
              </span>
              <DialogTitle className="task-modal__title">
                {editingTask
                  ? "Cập nhật hạng mục công việc"
                  : "Khởi tạo hạng mục công việc mới"}
              </DialogTitle>
              <DialogDescription className="task-modal__subtitle">
                Thiết lập tiêu chuẩn kỹ thuật, phân công kỹ sư hiện trường và
                theo dõi tiến độ nghiệm thu.
              </DialogDescription>
            </div>
          </DialogHeader>

          <form onSubmit={handleSaveTask} className="task-modal__form">
            {/* Row 1: Title & Task Code */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="task-modal__field sm:col-span-2">
                <div className="task-modal__label-row">
                  <label htmlFor="task-title" className="task-modal__label">
                    Tên hạng mục công việc
                  </label>
                  <span className="task-modal__hint">Bắt buộc</span>
                </div>
                <div className="task-modal__input-box">
                  <ClipboardList size={17} />
                  <Input
                    id="task-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    maxLength={120}
                    placeholder="VD: Nghiệm thu cốt thép dầm sàn tầng 5"
                    required
                  />
                </div>
              </div>

              <div className="task-modal__field">
                <div className="task-modal__label-row">
                  <label htmlFor="task-code" className="task-modal__label">
                    Mã công việc
                  </label>
                </div>
                <div
                  className={`task-modal__input-box ${
                    codeError ? "is-error" : ""
                  }`}
                >
                  <Hash size={16} />
                  <Input
                    id="task-code"
                    className="is-mono"
                    value={code}
                    onChange={(event) => {
                      setCode(event.target.value.toUpperCase());
                      setCodeError("");
                    }}
                    placeholder="CV-T01"
                    required
                  />
                </div>
                {codeError && (
                  <p className="task-modal__error" role="alert">
                    {codeError}
                  </p>
                )}
              </div>
            </div>

            {/* Row 2: Tactile Category Chips */}
            <div className="task-modal__field">
              <div className="task-modal__label-row">
                <span className="task-modal__label">Phân loại kỹ thuật</span>
                <span className="task-modal__hint">Chọn bộ môn phụ trách</span>
              </div>
              <div
                className="task-modal__chips"
                role="radiogroup"
                aria-label="Phân loại kỹ thuật"
              >
                {CATEGORIES.map((cat) => {
                  const selected = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className={`task-modal__chip ${
                        selected ? "is-selected" : ""
                      }`}
                      onClick={() => setCategory(cat)}
                    >
                      <Layers size={13} />
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 3: Priority Segmented Selector */}
            <div className="task-modal__field">
              <div className="task-modal__label-row">
                <span className="task-modal__label">Mức độ ưu tiên</span>
                <span className="task-modal__hint">
                  Ảnh hưởng cảnh báo tiến độ
                </span>
              </div>
              <div
                className="task-modal__priority-grid"
                role="radiogroup"
                aria-label="Mức độ ưu tiên"
              >
                {PRIORITIES.map((p) => {
                  const selected = priority === p;
                  const toneClass =
                    p === "Cao"
                      ? "is-high"
                      : p === "Trung bình"
                        ? "is-medium"
                        : "is-low";
                  return (
                    <button
                      key={p}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className={`task-modal__priority-btn ${toneClass} ${
                        selected ? "is-selected" : ""
                      }`}
                      onClick={() => setPriority(p)}
                    >
                      <span className="task-modal__priority-dot" />
                      Ưu tiên {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 4: Assignee from Nhân lực dự kiến & Due Date */}
            <div className="task-modal__field">
              <div className="task-modal__label-row">
                <label
                  htmlFor="task-assignee-search"
                  className="task-modal__label"
                >
                  Kỹ sư / Tổ đội phụ trách (từ Nhân lực dự kiến)
                </label>
                <span className="task-modal__hint">
                  Hiển thị {filteredModalEmployees.length}/{employees.length}{" "}
                  nhân sự
                </span>
              </div>

              <div className="task-modal__progress-panel">
                <div className="task-modal__input-box">
                  <Search size={16} />
                  <Input
                    id="task-assignee-search"
                    type="search"
                    value={assigneeSearch}
                    onChange={(event) => setAssigneeSearch(event.target.value)}
                    placeholder="Tìm nhanh theo tên kỹ sư, tổ đội, mã NV hoặc chức vụ..."
                  />
                </div>

                {filteredModalEmployees.length === 0 ? (
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dashed border-[#cfd8d6] bg-white px-3 py-2.5 text-xs text-[#5f6765]">
                    <span>
                      Không tìm thấy "{assigneeSearch}" trong danh sách nhân lực
                      dự kiến.
                    </span>
                    {assigneeSearch.trim() && (
                      <button
                        type="button"
                        className="font-semibold text-[#00786e] hover:underline"
                        onClick={() => {
                          setAssignee(assigneeSearch.trim());
                          setAssigneeSearch("");
                        }}
                      >
                        Chọn "{assigneeSearch.trim()}" làm người phụ trách
                      </button>
                    )}
                  </div>
                ) : (
                  <div
                    className="task-modal__employee-grid"
                    role="radiogroup"
                    aria-label="Chọn Kỹ sư hoặc Tổ đội phụ trách từ Nhân lực dự kiến"
                  >
                    {filteredModalEmployees.map((emp) => {
                      const isSelected = assignee === emp.name;
                      return (
                        <button
                          key={emp.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          className={`task-modal__employee-card ${
                            isSelected ? "is-selected" : ""
                          }`}
                          onClick={() => setAssignee(emp.name)}
                        >
                          <span className="task-modal__employee-avatar">
                            {getEmployeeInitials(emp.name)}
                          </span>
                          <div className="task-modal__employee-info">
                            <strong>{emp.name}</strong>
                            <span>
                              {emp.code} · {emp.role}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="grid gap-3 pt-1 sm:grid-cols-2">
                  <div className="task-modal__field">
                    <label
                      htmlFor="task-assignee"
                      className="task-modal__label"
                    >
                      Người / Tổ đội đang được chọn
                    </label>
                    <div className="task-modal__input-box">
                      <UserCheck size={17} />
                      <Input
                        id="task-assignee"
                        value={assignee}
                        onChange={(event) => setAssignee(event.target.value)}
                        placeholder="Chọn từ danh sách hoặc nhập tên..."
                        required
                      />
                    </div>
                  </div>

                  <div className="task-modal__field">
                    <div className="task-modal__label-row">
                      <label
                        htmlFor="task-due-date"
                        className="task-modal__label"
                      >
                        Hạn hoàn thành dự kiến
                      </label>
                      <span className="task-modal__hint">
                        {formatDueDate(dueDate)}
                      </span>
                    </div>
                    <div className="task-modal__input-box">
                      <CalendarDays size={17} />
                      <Input
                        id="task-due-date"
                        type="date"
                        value={dueDate}
                        onChange={(event) => setDueDate(event.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 5: Interactive Status & Progress Panel */}
            <div className="task-modal__field">
              <div className="task-modal__label-row">
                <span className="task-modal__label">
                  Trạng thái & Tiến độ thực hiện
                </span>
                <span className="task-modal__hint">
                  Tự động đồng bộ khi đạt 100%
                </span>
              </div>

              <div className="task-modal__progress-panel">
                <div
                  className="task-modal__status-pills"
                  role="radiogroup"
                  aria-label="Trạng thái công việc"
                >
                  {STATUSES.map((st) => (
                    <button
                      key={st}
                      type="button"
                      role="radio"
                      aria-checked={status === st}
                      className={`task-modal__status-btn ${
                        status === st ? "is-selected" : ""
                      }`}
                      onClick={() => handleStatusChangeInModal(st)}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="task-modal__slider-row">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={progress}
                    onChange={(event) =>
                      handleProgressChange(Number(event.target.value))
                    }
                    className="task-modal__range"
                    aria-label="Thanh kéo tiến độ công việc"
                  />
                  <span className="task-modal__progress-badge">
                    {progress}%
                  </span>
                </div>

                <div className="task-modal__presets">
                  {PROGRESS_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className={`task-modal__preset-btn ${
                        progress === preset ? "is-active" : ""
                      }`}
                      onClick={() => handleProgressChange(preset)}
                    >
                      {preset}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 6: Technical Description */}
            <div className="task-modal__field">
              <div className="task-modal__label-row">
                <label htmlFor="task-desc" className="task-modal__label">
                  Yêu cầu kỹ thuật & Tiêu chuẩn nghiệm thu
                </label>
                <span className="task-modal__hint">
                  {description.length}/300 ký tự
                </span>
              </div>
              <Textarea
                id="task-desc"
                rows={3}
                maxLength={300}
                className="task-modal__textarea"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Ghi chú chi tiết tiêu chuẩn nghiệm thu (TCVN), bản vẽ shopdrawing tham chiếu hoặc lưu ý an toàn lao động..."
              />
            </div>

            <DialogFooter className="task-modal__footer">
              <Button
                type="button"
                variant="outline"
                className="task-modal__cancel-btn"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingTask(null);
                  setCodeError("");
                }}
              >
                Hủy bỏ
              </Button>
              <Button type="submit" className="task-modal__submit-btn">
                {editingTask ? "Lưu cập nhật" : "Khởi tạo công việc"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deletingTask)}
        onOpenChange={(open) => !open && setDeletingTask(null)}
      >
        <DialogContent className="max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa công việc</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa hạng mục{" "}
              <strong>{deletingTask?.title}</strong> ({deletingTask?.code}) khỏi
              dự án <strong>{project.name}</strong>? Hành động này không thể
              hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingTask(null)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDeleteTask}
            >
              Xóa công việc
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
