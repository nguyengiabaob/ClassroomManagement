import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowLeft,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Download,
  FileText,
  HardHat,
  ImagePlus,
  Layers,
  MapPin,
  Package,
  Pencil,
  Plus,
  RotateCcw,
  Send,
  ShieldCheck,
  Trash2,
  TrendingUp,
  UsersRound,
  X,
  ZoomIn,
} from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  ProjectTask,
  TaskCategory,
  TaskPriority,
  TaskStatus,
} from "@/features/Project/Detail/ProjectTasksTab";
import { getInitials } from "@/features/UserManagement/UserManagementService";
import "./detailTask.css";

export interface ChecklistStep {
  id: number;
  title: string;
  standardRef: string;
  inspector: string;
  completed: boolean;
  completedAt?: string;
}

export interface TaskMaterialRow {
  id: number;
  code: string;
  name: string;
  unit: string;
  plannedQty: number;
  issuedQty: number;
  ready: boolean;
}

export interface TaskFieldLog {
  id: number;
  author: string;
  role: string;
  timestamp: string;
  content: string;
}

export interface TaskAttachment {
  id: number;
  fileName: string;
  version: string;
  size: string;
  updatedAt: string;
}

export interface TaskPhotoEvidence {
  id: number;
  title: string;
  caption: string;
  imageUrl: string;
}

interface TaskExtraState {
  locationZone: string;
  standardCode: string;
  supervisorUnit: string;
  equipmentUsed: string;
  crewSize: number;
  shiftHours: string;
  heroImage: string;
  checklist: ChecklistStep[];
  materials: TaskMaterialRow[];
  logs: TaskFieldLog[];
  attachments: TaskAttachment[];
  photos: TaskPhotoEvidence[];
}

export interface DetailTaskProps {
  task?: ProjectTask;
  projectId?: number;
  projectName?: string;
  projectCode?: string;
  onBack?: () => void;
  onTaskUpdated?: (updated: ProjectTask) => void;
}

const DEFAULT_TASKS: Array<
  ProjectTask & { projectId: number; projectName: string; projectCode: string }
> = [
  {
    id: 1,
    projectId: 1,
    projectCode: "HZ-2026",
    projectName: "Chung cư Horizon Tower · Quận 2",
    code: "HZ-T01",
    title: "Kiểm định tĩnh tải & Nghiệm thu cốt thép đài móng Block A",
    description:
      "Kiểm tra khoảng cách đai thép, chiều dày lớp bê tông bảo vệ 50mm, mối nối chồng cốt thép D28 và lập biên bản nghiệm thu nội bộ trước khi đổ bê tông đài móng M350.",
    category: "Kết cấu",
    status: "Đang thực hiện",
    priority: "Cao",
    assignee: "KS. Nguyễn Văn Nam",
    dueDate: "2026-10-28",
    progress: 75,
  },
  {
    id: 2,
    projectId: 1,
    projectCode: "HZ-2026",
    projectName: "Chung cư Horizon Tower · Quận 2",
    code: "HZ-T02",
    title: "Lắp đặt ống chờ cấp thoát nước & Trục điện M&E tầng điển hình",
    description:
      "Định vị sleeve xuyên dầm sàn theo bản vẽ shopdrawing đã duyệt, thử áp lực đường ống trục đứng PPR PN16 ở mức 10 bar trong 60 phút.",
    category: "Hệ thống M&E",
    status: "Chờ nghiệm thu",
    priority: "Cao",
    assignee: "KS. Lê Minh Hiếu",
    dueDate: "2026-11-05",
    progress: 85,
  },
  {
    id: 3,
    projectId: 2,
    projectCode: "GP-2026",
    projectName: "TTTM Green Plaza · Quận 1",
    code: "GP-T03",
    title: "Kiểm tra an toàn giàn giáo & Lưới bao che mặt ngoài",
    description:
      "Rà soát toàn bộ neo giằng giáo ngoài, hành lang an toàn và biển cảnh báo khu vực cẩu tháp hoạt động từ tầng 5 đến tầng 12.",
    category: "An toàn HSE",
    status: "Đang thực hiện",
    priority: "Trung bình",
    assignee: "KS. Trần Đình Tú",
    dueDate: "2026-11-02",
    progress: 50,
  },
  {
    id: 4,
    projectId: 2,
    projectCode: "GP-2026",
    projectName: "TTTM Green Plaza · Quận 1",
    code: "GP-T04",
    title: "Trình duyệt mẫu vật liệu ốp lát & Sơn hoàn thiện sảnh chính",
    description:
      "Tổng hợp bảng mẫu vật liệu (spec sheet), chứng chỉ xuất xứ CO/CQ trình Chủ đầu tư và Tư vấn giám sát phê duyệt.",
    category: "Pháp lý & Hồ sơ",
    status: "Cần làm",
    priority: "Thấp",
    assignee: "KTS. Phạm Thu Hà",
    dueDate: "2026-11-12",
    progress: 25,
  },
];

const STATUS_OPTIONS: TaskStatus[] = [
  "Cần làm",
  "Đang thực hiện",
  "Chờ nghiệm thu",
  "Hoàn thành",
];

const PRIORITY_OPTIONS: TaskPriority[] = ["Cao", "Trung bình", "Thấp"];
const CATEGORY_OPTIONS: TaskCategory[] = [
  "Kết cấu",
  "Hệ thống M&E",
  "Hoàn thiện",
  "An toàn HSE",
  "Pháp lý & Hồ sơ",
];
const PROGRESS_STEPS = [0, 25, 50, 75, 100];

const ASSIGNEE_OPTIONS = [
  "KS. Nguyễn Văn Nam",
  "KS. Lê Minh Hiếu",
  "KS. Trần Đình Tú",
  "KTS. Phạm Thu Hà",
  "Tổ trưởng Đặng Quốc Khánh",
  "KS. Vũ Hoàng Long",
];

interface TaskCrewMember {
  id: number;
  code: string;
  fullName: string;
  role: string;
  shift: string;
}

const TASK_CREW_ROSTER: TaskCrewMember[] = [
  {
    id: 1,
    code: "CF-NV04",
    fullName: "Đặng Quốc Khánh",
    role: "Tổ trưởng thi công cốt thép",
    shift: "Ca ngày",
  },
  {
    id: 2,
    code: "CF-NV06",
    fullName: "KS. Vũ Hoàng Long",
    role: "Kỹ sư Trắc đạc & QA/QC",
    shift: "Ca ngày",
  },
  {
    id: 3,
    code: "CF-NV02",
    fullName: "KS. Lê Minh Hiếu",
    role: "Kỹ sư Phối hợp M&E",
    shift: "Ca ngày",
  },
  {
    id: 4,
    code: "CF-NV03",
    fullName: "KS. Trần Đình Tú",
    role: "Giám sát An toàn HSE",
    shift: "Ca ngày",
  },
  {
    id: 5,
    code: "CF-NV05",
    fullName: "KTS. Phạm Thu Hà",
    role: "Kỹ sư Hồ sơ Shopdrawing",
    shift: "Ca ngày",
  },
  {
    id: 6,
    code: "CF-CN08",
    fullName: "Nguyễn Hữu Phước",
    role: "Thợ bậc 5/7 · Hàn & Lắp dựng",
    shift: "Ca ngày",
  },
  {
    id: 7,
    code: "CF-CN09",
    fullName: "Trương Văn Hòa",
    role: "Thợ bậc 5/7 · Cốp pha & Giàn giáo",
    shift: "Ca ngày",
  },
  {
    id: 8,
    code: "CF-CN11",
    fullName: "Bùi Thanh Tùng",
    role: "Vận hành thiết bị & Máy đo",
    shift: "Ca tăng cường",
  },
  {
    id: 9,
    code: "CF-CN12",
    fullName: "Lý Minh Tâm",
    role: "Tổ đội bê tông & Bảo dưỡng",
    shift: "Ca tăng cường",
  },
];

function getExtraStorageKey(taskCode: string) {
  return `cm_task_detail_v2_${taskCode.toUpperCase()}`;
}

function buildDefaultExtra(task: ProjectTask): TaskExtraState {
  const isME = task.category === "Hệ thống M&E";
  const isHSE = task.category === "An toàn HSE";

  return {
    locationZone: isME
      ? "Trục kỹ thuật M&E · Tầng 6–12 (Cao trình +21.40m)"
      : isHSE
        ? "Mặt đứng trục A–F · Hành lang giàn giáo ngoài"
        : "Phân khu Block A · Trục 1–8 / A–D (Cao trình -3.20m)",
    standardCode: isME
      ? "TCVN 4519:1988 & QCVN 06:2022/BXD"
      : isHSE
        ? "QCVN 18:2021/BXD · An toàn trong thi công"
        : "TCVN 4453:1995 & TCVN 9340:2012",
    supervisorUnit: "Đoàn Tư vấn Giám sát IBST & Ban QA/QC Nội bộ",
    equipmentUsed: isME
      ? "Bơm thử áp thủy lực 16 Bar & Máy dò cốt thép Bosch"
      : "Máy toàn đạc Leica TS07 & Súng bật nảy bê tông",
    crewSize: isME ? 12 : isHSE ? 8 : 16,
    shiftHours: "Ca ngày 07:00 – 17:30 (Tăng ca 18:00 – 20:30)",
    heroImage:
      "https://images.unsplash.com/photo-1541888946425-d09bb18086f6?auto=format&fit=crop&w=1200&q=85",
    checklist: [
      {
        id: 1,
        title: "Đối chiếu tim cốt, kích thước hình học theo bản vẽ Shopdrawing",
        standardRef: "Sai số cho phép ±5mm · Đã đo bằng máy toàn đạc điện tử",
        inspector: "KS. Vũ Hoàng Long (Trắc đạc)",
        completed: true,
        completedAt: "24/10 · 08:30",
      },
      {
        id: 2,
        title:
          "Kiểm tra chủng loại, đường kính và khoảng cách cốt thép / vật tư lắp đặt",
        standardRef: "Đúng chứng chỉ CO/CQ lô hàng nhập kho đợt 3",
        inspector: task.assignee,
        completed: true,
        completedAt: "24/10 · 11:15",
      },
      {
        id: 3,
        title:
          "Lắp đặt con kê bê tông bảo vệ & Vệ sinh mặt bằng trước nghiệm thu",
        standardRef: "Chiều dày lớp bảo vệ 50mm · Không đọng nước đáy móng",
        inspector: "Tổ trưởng Đặng Quốc Khánh",
        completed: task.progress >= 50,
        completedAt: task.progress >= 50 ? "25/10 · 15:40" : undefined,
      },
      {
        id: 4,
        title:
          "Ký biên bản nghiệm thu nội bộ giữa Ban chỉ huy và Tư vấn giám sát",
        standardRef: "Biên bản mã số BBNT-04/HZ · Đính kèm ảnh hiện trường",
        inspector: "KS. Nguyễn Văn Nam",
        completed: task.progress >= 100 || task.status === "Hoàn thành",
        completedAt:
          task.progress >= 100 || task.status === "Hoàn thành"
            ? "26/10 · 16:20"
            : undefined,
      },
    ],
    materials: [
      {
        id: 1,
        code: "VT-THEP-D28",
        name: "Thép thanh vằn CB400-V D28 (Hòa Phát)",
        unit: "Tấn",
        plannedQty: 14.5,
        issuedQty: 14.5,
        ready: true,
      },
      {
        id: 2,
        code: "VT-BT-M350",
        name: "Bê tông thương phẩm M350 độ sụt 12±2cm",
        unit: "m³",
        plannedQty: 120,
        issuedQty: 96,
        ready: false,
      },
      {
        id: 3,
        code: "TB-MAY-TOANDAC",
        name: "Máy toàn đạc điện tử Leica TS07 & Bộ kiểm định",
        unit: "Bộ",
        plannedQty: 2,
        issuedQty: 2,
        ready: true,
      },
    ],
    logs: [
      {
        id: 1,
        author: task.assignee,
        role: "Kỹ sư chủ trì hạng mục",
        timestamp: "Hôm nay, 09:20",
        content:
          "Tổ đội đã hoàn tất gia công lắp dựng cốt thép lớp dưới và lớp trên. Đã bổ sung thêm thép gia cường tại vị trí cổ cột trục B4 theo yêu cầu của Tư vấn giám sát.",
      },
      {
        id: 2,
        author: "KS. Vũ Hoàng Long",
        role: "Kỹ sư QA/QC & Trắc đạc",
        timestamp: "Hôm qua, 16:45",
        content:
          "Đã bắn mực cao độ và kiểm tra độ thẳng đứng của cốp pha biên. Sai số đo đạc thực tế +2mm (nằm trong giới hạn cho phép của TCVN 4453:1995).",
      },
    ],
    attachments: [
      {
        id: 1,
        fileName: `Shopdrawing-${task.code}-Rev03.pdf`,
        version: "Rev.03 (Đã duyệt)",
        size: "4.8 MB",
        updatedAt: "22/10/2026",
      },
      {
        id: 2,
        fileName: `Bien-ban-nghiem-thu-noi-bo-${task.code}.docx`,
        version: "Biểu mẫu QA/QC",
        size: "640 KB",
        updatedAt: "25/10/2026",
      },
      {
        id: 3,
        fileName: "Chung-chi-co-ly-vat-tu-CO-CQ-Dot3.pdf",
        version: "Hồ sơ vật liệu",
        size: "2.1 MB",
        updatedAt: "20/10/2026",
      },
    ],
    photos: [
      {
        id: 1,
        title: "Lắp dựng lồng thép đài móng trục A1–A4",
        caption: "24/10 · Đạt khoảng cách đai @150",
        imageUrl:
          "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80",
      },
      {
        id: 2,
        title: "Kiểm tra máy toàn đạc & tim trục B4",
        caption: "25/10 · Sai số ±2mm đạt chuẩn",
        imageUrl:
          "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80",
      },
      {
        id: 3,
        title: "Nghiệm thu cốp pha & hành lang an toàn",
        caption: "26/10 · Sẵn sàng đổ bê tông",
        imageUrl:
          "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80",
      },
    ],
  };
}

function loadExtraState(task: ProjectTask): TaskExtraState {
  try {
    const raw = localStorage.getItem(getExtraStorageKey(task.code));
    if (raw) {
      const parsed = JSON.parse(raw) as TaskExtraState;
      if (parsed && Array.isArray(parsed.checklist)) {
        return parsed;
      }
    }
  } catch {
    // Fallback to default seeded details
  }
  const seeded = buildDefaultExtra(task);
  saveExtraState(task.code, seeded);
  return seeded;
}

function saveExtraState(taskCode: string, state: TaskExtraState) {
  try {
    localStorage.setItem(getExtraStorageKey(taskCode), JSON.stringify(state));
  } catch {
    // Ignore storage quota errors
  }
}

function loadAllAvailableTasks(): Array<
  ProjectTask & { projectId: number; projectName: string; projectCode: string }
> {
  const collected: Array<
    ProjectTask & {
      projectId: number;
      projectName: string;
      projectCode: string;
    }
  > = [];

  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith("cm_project_tasks_v1_")) continue;
      const pid = Number(key.replace("cm_project_tasks_v1_", "")) || 1;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item && typeof item === "object" && "code" in item) {
            const t = item as ProjectTask;
            collected.push({
              ...t,
              projectId: pid,
              projectCode: t.code.split("-")[0] || `PRJ-${pid}`,
              projectName: `Dự án #${pid}`,
            });
          }
        }
      }
    }
  } catch {
    // Ignore storage read errors
  }

  return collected.length > 0 ? collected : DEFAULT_TASKS;
}

function formatDateVi(dateStr: string): string {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return dateStr;
  return `${d}/${m}/${y}`;
}

function getStatusBadgeClass(status: TaskStatus): string {
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

function getPriorityBadgeClass(priority: TaskPriority): string {
  switch (priority) {
    case "Cao":
      return "is-high";
    case "Trung bình":
      return "is-medium";
    default:
      return "is-low";
  }
}

export function DetailTask({
  task: propTask,
  projectId: propProjectId,
  projectName: propProjectName,
  projectCode: propProjectCode,
  onBack,
  onTaskUpdated,
}: DetailTaskProps) {
  const params = useParams<{ taskId?: string; projectId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const routeState = (location.state ?? {}) as {
    task?: ProjectTask;
    project?: { id: number; name: string; projectCode: string };
  };

  const allTasks = useMemo(() => loadAllAvailableTasks(), []);

  const initialResolved = useMemo(() => {
    if (propTask) {
      return {
        task: propTask,
        projectId: propProjectId ?? 1,
        projectName: propProjectName ?? "Chung cư Horizon Tower · Quận 2",
        projectCode: propProjectCode ?? propTask.code.split("-")[0] ?? "HZ-2026",
      };
    }

    if (routeState.task) {
      return {
        task: routeState.task,
        projectId: routeState.project?.id ?? Number(params.projectId || 1),
        projectName:
          routeState.project?.name ?? "Chung cư Horizon Tower · Quận 2",
        projectCode:
          routeState.project?.projectCode ??
          routeState.task.code.split("-")[0] ??
          "HZ-2026",
      };
    }

    if (params.taskId) {
      const matched = allTasks.find(
        (t) =>
          String(t.id) === params.taskId ||
          t.code.toLowerCase() === params.taskId?.toLowerCase(),
      );
      if (matched) {
        return {
          task: matched,
          projectId: matched.projectId,
          projectName: matched.projectName,
          projectCode: matched.projectCode,
        };
      }
    }

    const first = allTasks[0] ?? DEFAULT_TASKS[0];
    return {
      task: first,
      projectId: first.projectId,
      projectName: first.projectName,
      projectCode: first.projectCode,
    };
  }, [
    propTask,
    propProjectId,
    propProjectName,
    propProjectCode,
    routeState.task,
    routeState.project,
    params.taskId,
    params.projectId,
    allTasks,
  ]);

  const [currentTask, setCurrentTask] = useState<ProjectTask>(
    initialResolved.task,
  );
  const [activeProjectId, setActiveProjectId] = useState<number>(
    initialResolved.projectId,
  );
  const [activeProjectName, setActiveProjectName] = useState<string>(
    initialResolved.projectName,
  );
  const [activeProjectCode, setActiveProjectCode] = useState<string>(
    initialResolved.projectCode,
  );

  const [extra, setExtra] = useState<TaskExtraState>(() =>
    loadExtraState(initialResolved.task),
  );
  const [newStepTitle, setNewStepTitle] = useState("");
  const [newComment, setNewComment] = useState("");

  // Photo gallery & upload state
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Edit Modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editCategory, setEditCategory] = useState<TaskCategory>("Kết cấu");
  const [editPriority, setEditPriority] = useState<TaskPriority>("Cao");
  const [editAssignee, setEditAssignee] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editLocationZone, setEditLocationZone] = useState("");

  useEffect(() => {
    setCurrentTask(initialResolved.task);
    setActiveProjectId(initialResolved.projectId);
    setActiveProjectName(initialResolved.projectName);
    setActiveProjectCode(initialResolved.projectCode);
    setExtra(loadExtraState(initialResolved.task));
  }, [initialResolved]);

  const persistTaskChange = (updated: ProjectTask) => {
    setCurrentTask(updated);
    onTaskUpdated?.(updated);

    try {
      const key = `cm_project_tasks_v1_${activeProjectId}`;
      const raw = localStorage.getItem(key);
      if (raw) {
        const list = JSON.parse(raw) as ProjectTask[];
        if (Array.isArray(list)) {
          const next = list.map((item) =>
            item.id === updated.id || item.code === updated.code
              ? updated
              : item,
          );
          localStorage.setItem(key, JSON.stringify(next));
        }
      }
    } catch {
      // Ignore storage errors
    }
  };

  const persistExtraChange = (nextExtra: TaskExtraState) => {
    setExtra(nextExtra);
    saveExtraState(currentTask.code, nextExtra);
  };

  const metrics = useMemo(() => {
    const totalSteps = extra.checklist.length;
    const doneSteps = extra.checklist.filter((s) => s.completed).length;
    const openSteps = totalSteps - doneSteps;

    console.assert(
      doneSteps + openSteps === totalSteps,
      "Checklist completed + open steps must equal total steps",
    );

    const totalMaterials = extra.materials.length;
    const readyMaterials = extra.materials.filter((m) => m.ready).length;

    const today = new Date("2026-10-27T00:00:00");
    const due = currentTask.dueDate
      ? new Date(`${currentTask.dueDate}T00:00:00`)
      : today;
    const diffDays = Math.ceil(
      (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    return {
      totalSteps,
      doneSteps,
      openSteps,
      totalMaterials,
      readyMaterials,
      diffDays,
    };
  }, [extra.checklist, extra.materials, currentTask.dueDate]);

  const handleSelectTaskFromSwitcher = (code: string) => {
    const found = allTasks.find((t) => t.code === code);
    if (!found) return;
    setCurrentTask(found);
    setActiveProjectId(found.projectId);
    setActiveProjectName(found.projectName);
    setActiveProjectCode(found.projectCode);
    setExtra(loadExtraState(found));
  };

  const handleProgressStepClick = (nextProgress: number) => {
    const nextStatus: TaskStatus =
      nextProgress === 100
        ? "Hoàn thành"
        : nextProgress === 0
          ? "Cần làm"
          : nextProgress >= 80
            ? "Chờ nghiệm thu"
            : "Đang thực hiện";

    const updated: ProjectTask = {
      ...currentTask,
      progress: nextProgress,
      status: nextStatus,
    };
    persistTaskChange(updated);
    toast.success(
      `Đã cập nhật tiến độ "${currentTask.code}": ${nextProgress}% (${nextStatus})`,
    );
  };

  const handleToggleCompleteMain = () => {
    const isDone = currentTask.status === "Hoàn thành";
    const nextStatus: TaskStatus = isDone ? "Đang thực hiện" : "Hoàn thành";
    const nextProgress = isDone ? 75 : 100;
    const updated: ProjectTask = {
      ...currentTask,
      status: nextStatus,
      progress: nextProgress,
    };
    persistTaskChange(updated);
    toast.success(
      isDone
        ? `Đã mở lại hạng mục "${currentTask.code}"`
        : `Đã nghiệm thu hoàn thành "${currentTask.code}"`,
    );
  };

  const handleToggleChecklistStep = (stepId: number) => {
    const nowStamp = "27/10 · 00:45";
    const nextChecklist = extra.checklist.map((step) =>
      step.id === stepId
        ? {
            ...step,
            completed: !step.completed,
            completedAt: !step.completed ? nowStamp : undefined,
          }
        : step,
    );

    persistExtraChange({ ...extra, checklist: nextChecklist });

    const doneCount = nextChecklist.filter((s) => s.completed).length;
    const computedProgress =
      nextChecklist.length > 0
        ? Math.round((doneCount / nextChecklist.length) * 100)
        : currentTask.progress;
    const computedStatus: TaskStatus =
      computedProgress === 100
        ? "Hoàn thành"
        : computedProgress === 0
          ? "Cần làm"
          : computedProgress >= 75
            ? "Chờ nghiệm thu"
            : "Đang thực hiện";

    persistTaskChange({
      ...currentTask,
      progress: computedProgress,
      status: computedStatus,
    });
  };

  const handleAddChecklistStep = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = newStepTitle.trim();
    if (!trimmed) return;

    const nextId =
      extra.checklist.reduce((max, s) => Math.max(max, s.id), 0) + 1;
    const nextChecklist: ChecklistStep[] = [
      ...extra.checklist,
      {
        id: nextId,
        title: trimmed,
        standardRef: "Bổ sung tại hiện trường · Theo dõi nghiệm thu",
        inspector: currentTask.assignee,
        completed: false,
      },
    ];

    persistExtraChange({ ...extra, checklist: nextChecklist });
    setNewStepTitle("");
    toast.success("Đã thêm bước kiểm tra vào checklist nghiệm thu");
  };

  const handleDeleteChecklistStep = (stepId: number) => {
    const nextChecklist = extra.checklist.filter((s) => s.id !== stepId);
    persistExtraChange({ ...extra, checklist: nextChecklist });
    toast.success("Đã xóa mục kiểm tra");
  };

  const handleToggleMaterialReady = (matId: number) => {
    const nextMaterials = extra.materials.map((m) =>
      m.id === matId
        ? {
            ...m,
            ready: !m.ready,
            issuedQty: !m.ready ? m.plannedQty : Math.round(m.plannedQty * 0.65),
          }
        : m,
    );
    persistExtraChange({ ...extra, materials: nextMaterials });
    toast.success("Đã cập nhật trạng thái cấp phát vật tư");
  };

  const handleAddFieldLog = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = newComment.trim();
    if (!trimmed) return;

    const nextId = extra.logs.reduce((max, l) => Math.max(max, l.id), 0) + 1;
    const newEntry: TaskFieldLog = {
      id: nextId,
      author: currentTask.assignee,
      role: "Kỹ sư chủ trì hạng mục",
      timestamp: "Vừa xong",
      content: trimmed,
    };

    persistExtraChange({
      ...extra,
      logs: [newEntry, ...extra.logs],
    });
    setNewComment("");
    toast.success("Đã ghi nhật ký hiện trường");
  };

  const openEditTaskModal = () => {
    setEditTitle(currentTask.title);
    setEditDesc(currentTask.description);
    setEditCategory(currentTask.category);
    setEditPriority(currentTask.priority);
    setEditAssignee(currentTask.assignee);
    setEditDueDate(currentTask.dueDate);
    setEditLocationZone(extra.locationZone);
    setIsEditOpen(true);
  };

  const handleSaveTaskModal = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editTitle.trim()) {
      toast.error("Vui lòng nhập tên hạng mục công việc");
      return;
    }

    const updated: ProjectTask = {
      ...currentTask,
      title: editTitle.trim(),
      description: editDesc.trim(),
      category: editCategory,
      priority: editPriority,
      assignee: editAssignee.trim() || currentTask.assignee,
      dueDate: editDueDate || currentTask.dueDate,
    };
    persistTaskChange(updated);
    persistExtraChange({
      ...extra,
      locationZone: editLocationZone.trim() || extra.locationZone,
    });
    setIsEditOpen(false);
    toast.success("Đã lưu thông tin hạng mục công việc");
  };

  const compressImageFile = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("File read failed"));
      reader.onload = () => {
        const rawDataUrl = String(reader.result || "");
        const img = new Image();
        img.onerror = () => resolve(rawDataUrl);
        img.onload = () => {
          const maxDim = 1280;
          const scale = Math.min(
            1,
            maxDim / Math.max(img.width || 1, img.height || 1),
          );
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(rawDataUrl);
            return;
          }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.84));
        };
        img.src = rawDataUrl;
      };
      reader.readAsDataURL(file);
    });

  const handleUploadPhotos = async (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList).filter((f) =>
      f.type.startsWith("image/"),
    );
    event.target.value = "";

    if (files.length === 0) {
      toast.error("Vui lòng chọn tệp hình ảnh hợp lệ (JPG, PNG, WEBP)");
      return;
    }

    try {
      const dataUrls = await Promise.all(files.map(compressImageFile));
      const now = new Date();
      const dateStr = now.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      });
      const timeStr = now.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const stamp = `${dateStr} · ${timeStr}`;

      let nextId =
        extra.photos.reduce((max, p) => Math.max(max, p.id), 0) + 1;

      const uploadedItems: TaskPhotoEvidence[] = files.map((file, idx) => {
        const cleanTitle =
          file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ") ||
          `Ảnh hiện trường #${nextId}`;
        const item: TaskPhotoEvidence = {
          id: nextId,
          title: cleanTitle,
          caption: `${stamp} · Tải lên từ hiện trường`,
          imageUrl: dataUrls[idx],
        };
        nextId += 1;
        return item;
      });

      const nextPhotos = [...uploadedItems, ...extra.photos];
      persistExtraChange({
        ...extra,
        photos: nextPhotos,
      });
      toast.success(
        `Đã tải lên ${uploadedItems.length} ảnh nghiệm thu hiện trường`,
      );
    } catch {
      toast.error("Không thể xử lý ảnh tải lên, vui lòng thử lại");
    }
  };

  const handleDeletePhoto = (photoId: number) => {
    const nextPhotos = extra.photos.filter((p) => p.id !== photoId);
    persistExtraChange({
      ...extra,
      photos: nextPhotos,
    });
    if (previewIndex !== null) {
      if (nextPhotos.length === 0) {
        setPreviewIndex(null);
      } else if (previewIndex >= nextPhotos.length) {
        setPreviewIndex(nextPhotos.length - 1);
      }
    }
    toast.success("Đã xóa ảnh khỏi hồ sơ nghiệm thu");
  };

  const handlePrevPhoto = () => {
    if (extra.photos.length === 0) return;
    setPreviewIndex((prev) =>
      prev === null
        ? 0
        : (prev - 1 + extra.photos.length) % extra.photos.length,
    );
  };

  const handleNextPhoto = () => {
    if (extra.photos.length === 0) return;
    setPreviewIndex((prev) =>
      prev === null ? 0 : (prev + 1) % extra.photos.length,
    );
  };

  useEffect(() => {
    if (previewIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setPreviewIndex((prev) =>
          prev === null || extra.photos.length === 0
            ? prev
            : (prev - 1 + extra.photos.length) % extra.photos.length,
        );
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        setPreviewIndex((prev) =>
          prev === null || extra.photos.length === 0
            ? prev
            : (prev + 1) % extra.photos.length,
        );
      } else if (event.key === "Escape") {
        event.preventDefault();
        setPreviewIndex(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previewIndex, extra.photos.length]);

  const activePreviewPhoto =
    previewIndex !== null ? extra.photos[previewIndex] ?? null : null;

  const { visibleCrew, restCrew } = useMemo(() => {
    const filtered = TASK_CREW_ROSTER.filter(
      (member) =>
        member.fullName.toLowerCase() !== currentTask.assignee.toLowerCase(),
    );
    return {
      visibleCrew: filtered.slice(0, 2),
      restCrew: filtered.slice(2),
    };
  }, [currentTask.assignee]);

  return (
    <section
      className="td-page"
      aria-label={`Chi tiết công việc ${currentTask.code}`}
    >
      <div className="td-container">
        {/* Top Breadcrumb & Instant Task Switcher */}
        <div className="td-nav-bar">
          <div className="td-breadcrumbs">
            <button
              type="button"
              className="td-back-btn"
              onClick={() => {
                if (onBack) {
                  onBack();
                } else {
                  navigate(-1);
                }
              }}
            >
              <ArrowLeft size={15} />
              Quay lại
            </button>
            <span>/</span>
            <Link
              to={`/projects/${activeProjectId}`}
              className="td-crumb-link"
            >
              {activeProjectName}
            </Link>
            <span>/</span>
            <span className="td-crumb-code">{currentTask.code}</span>
          </div>

          <div className="td-switcher-wrap">
            <span className="td-switcher-label">Chuyển nhanh hạng mục:</span>
            <select
              className="td-switcher-select"
              value={currentTask.code}
              onChange={(event) =>
                handleSelectTaskFromSwitcher(event.target.value)
              }
              aria-label="Chuyển nhanh hạng mục công việc"
            >
              {allTasks.map((t) => (
                <option key={t.code} value={t.code}>
                  {t.code} · {t.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Title Header Row */}
        <header className="td-title-row">
          <div className="td-title-copy">
            <div className="td-badges">
              <span className="td-badge is-code">{currentTask.code}</span>
              <span
                className={`td-badge ${getStatusBadgeClass(currentTask.status)}`}
              >
                {currentTask.status}
              </span>
              <span
                className={`td-badge ${getPriorityBadgeClass(
                  currentTask.priority,
                )}`}
              >
                Ưu tiên: {currentTask.priority}
              </span>
              <span className="td-badge is-low">{currentTask.category}</span>
            </div>

            <h1 className="td-title">{currentTask.title}</h1>

            <div className="td-meta-row">
              <span className="td-meta-item">
                <MapPin size={15} />
                {extra.locationZone}
              </span>
              <span className="td-meta-item">
                <CalendarDays size={15} />
                Hạn bàn giao: <strong>{formatDateVi(currentTask.dueDate)}</strong>
              </span>
              <span className="td-meta-item">
                <ShieldCheck size={15} />
                {extra.standardCode}
              </span>
            </div>
          </div>

          <div className="td-title-actions">
            <button
              type="button"
              className="td-btn td-btn-outline"
              onClick={openEditTaskModal}
            >
              <Pencil size={16} />
              Chỉnh sửa
            </button>

            <button
              type="button"
              className={`td-btn ${
                currentTask.status === "Hoàn thành"
                  ? "td-btn-dark"
                  : "td-btn-primary"
              }`}
              onClick={handleToggleCompleteMain}
            >
              <CheckCircle2 size={17} />
              {currentTask.status === "Hoàn thành"
                ? "Mở lại hạng mục"
                : "Nghiệm thu hoàn thành"}
            </button>
          </div>
        </header>

        {/* Top Summary Grid: Conic Progress Card + Deep Forest-Teal Crew Command Card */}
        <div className="td-top-summary">
          {/* Card 1: Conic Progress Ring + 3 Mini Stats + Quick Stepper */}
          <div className="td-progress-card">
            <div>
              <div className="td-card-head">
                <h2>
                  <span className="td-icon-chip">
                    <TrendingUp size={18} />
                  </span>
                  Tiến độ & Khối lượng nghiệm thu
                </h2>
                <span className="td-section-pill">
                  {metrics.doneSteps}/{metrics.totalSteps} bước đạt
                </span>
              </div>

              <div className="td-progress-body">
                <div
                  className="td-ring"
                  aria-label={`Tiến độ hoàn thành ${currentTask.progress}%`}
                >
                  <svg viewBox="0 0 104 104" aria-hidden="true">
                    <circle
                      cx="52"
                      cy="52"
                      r="44"
                      fill="none"
                      stroke="#ece8f3"
                      strokeWidth="9"
                    />
                    <circle
                      cx="52"
                      cy="52"
                      r="44"
                      fill="none"
                      stroke="#00786e"
                      strokeWidth="9"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 44}
                      strokeDashoffset={
                        2 * Math.PI * 44 * (1 - currentTask.progress / 100)
                      }
                    />
                  </svg>
                  <div className="td-ring-inner">
                    <strong>{currentTask.progress}%</strong>
                    <span>Khối lượng</span>
                  </div>
                </div>

                <div className="td-progress-metrics">
                  <div className="td-mini-stat">
                    <span>Bước kiểm tra</span>
                    <strong>
                      {metrics.doneSteps} / {metrics.totalSteps}
                    </strong>
                  </div>

                  <div className="td-mini-stat">
                    <span>Vật tư sẵn sàng</span>
                    <strong>
                      {metrics.readyMaterials} / {metrics.totalMaterials}
                    </strong>
                  </div>

                  <div className="td-mini-stat">
                    <span>Tiến độ thời gian</span>
                    <strong>
                      {currentTask.status === "Hoàn thành"
                        ? "Đúng hạn"
                        : metrics.diffDays >= 0
                          ? `Còn ${metrics.diffDays} ngày`
                          : `Trễ ${Math.abs(metrics.diffDays)} ngày`}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="td-step-bar">
              <span>Cập nhật nhanh tỷ lệ hoàn thành:</span>
              <div className="td-step-pills">
                {PROGRESS_STEPS.map((step) => (
                  <button
                    key={step}
                    type="button"
                    className={`td-step-pill ${
                      currentTask.progress === step ? "is-active" : ""
                    }`}
                    onClick={() => handleProgressStepClick(step)}
                  >
                    {step}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Deep Forest-Teal Crew & Accountability Card */}
          <div className="td-crew-card">
            <div>
              <div className="td-crew-head">
                <h2>
                  <UsersRound size={19} />
                  Ban chỉ huy & Tổ đội phụ trách
                </h2>
                <span className="td-crew-tag">{activeProjectCode}</span>
              </div>

              <div className="td-crew-lead">
                <div className="td-crew-avatar">
                  {getInitials(currentTask.assignee)}
                </div>
                <div className="td-crew-info">
                  <strong>{currentTask.assignee}</strong>
                  <span>Kỹ sư chủ trì nghiệm thu & Giám sát trực tiếp</span>
                </div>
              </div>
            </div>

            <div className="td-crew-grid">
              <div className="td-crew-stat is-roster">
                <div className="td-crew-stat-head">
                  <span>Quân số thi công trực tiếp</span>
                  <span className="td-crew-total-pill">
                    {visibleCrew.length + restCrew.length} nhân sự
                  </span>
                </div>

                <div className="td-crew-inline-list">
                  {visibleCrew.map((member) => (
                    <div key={member.id} className="td-crew-person-pill">
                      <span className="td-crew-mini-avatar">
                        {getInitials(member.fullName)}
                      </span>
                      <span className="td-crew-person-name">
                        {member.fullName}
                      </span>
                    </div>
                  ))}

                  {restCrew.length > 0 && (
                    <div className="td-crew-more-wrap" tabIndex={0}>
                      <span
                        className="td-crew-more-badge"
                        aria-label={`Xem thêm ${restCrew.length} nhân sự trong tổ đội`}
                      >
                        +{restCrew.length}
                      </span>

                      <div
                        className="td-crew-popup"
                        data-ui="crew-popup"
                        role="tooltip"
                      >
                        <div className="td-crew-popup-head">
                          <strong>Nhân sự tham gia hạng mục</strong>
                          <span>+{restCrew.length} thành viên khác</span>
                        </div>

                        <div className="td-crew-popup-list">
                          {restCrew.map((member) => (
                            <div
                              key={member.id}
                              className="td-crew-popup-item"
                            >
                              <span className="td-crew-popup-avatar">
                                {getInitials(member.fullName)}
                              </span>
                              <div className="td-crew-popup-info">
                                <div className="td-crew-popup-row">
                                  <strong>{member.fullName}</strong>
                                  <code>{member.code}</code>
                                </div>
                                <span>
                                  {member.role} · {member.shift}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="td-crew-stat">
                <span>Ca trực hiện trường</span>
                <strong>07:00 – 17:30</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Main 2-Column Content Layout */}
        <div className="td-main-grid">
          {/* Left Column Stack */}
          <div className="td-stack">
            {/* 1. Hero Visual Inspection Dossier Card */}
            <article className="td-card">
              <div className="td-hero-banner">
                <img
                  src={extra.heroImage}
                  alt={currentTask.title}
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=80";
                  }}
                />
                <div className="td-hero-overlay">
                  <div className="td-hero-top">
                    <span className="td-hero-chip">
                      <span className="td-hero-dot" />
                      Giám sát hiện trường · {currentTask.status}
                    </span>
                    <span className="td-hero-chip">{currentTask.category}</span>
                  </div>

                  <div className="td-hero-bottom">
                    <h3>Hồ sơ kỹ thuật & Phạm vi nghiệm thu</h3>
                    <p>{extra.locationZone}</p>
                  </div>
                </div>
              </div>

              <div className="td-dossier-body">
                <p className="td-description">{currentTask.description}</p>

                <div className="td-spec-grid">
                  <div className="td-spec-box">
                    <span>Tiêu chuẩn kỹ thuật áp dụng</span>
                    <strong>{extra.standardCode}</strong>
                  </div>
                  <div className="td-spec-box">
                    <span>Đơn vị Tư vấn giám sát</span>
                    <strong>{extra.supervisorUnit}</strong>
                  </div>
                  <div className="td-spec-box">
                    <span>Thiết bị đo kiểm tại chỗ</span>
                    <strong>{extra.equipmentUsed}</strong>
                  </div>
                  <div className="td-spec-box">
                    <span>Thời gian ca thi công</span>
                    <strong>{extra.shiftHours}</strong>
                  </div>
                </div>
              </div>
            </article>

            {/* 2. Interactive Technical Inspection Checklist */}
            <article className="td-card">
              <div className="td-section-head">
                <h3>
                  <ClipboardCheck size={19} />
                  Quy trình & Checklist nghiệm thu kỹ thuật
                </h3>
                <span className="td-section-pill">
                  Hoàn tất {metrics.doneSteps}/{metrics.totalSteps} mục
                </span>
              </div>

              <div className="td-checklist-wrap">
                {extra.checklist.map((step, index) => (
                  <div
                    key={step.id}
                    className={`td-step-card ${
                      step.completed ? "is-completed" : ""
                    }`}
                  >
                    <button
                      type="button"
                      className={`td-check-btn ${
                        step.completed ? "is-done" : ""
                      }`}
                      onClick={() => handleToggleChecklistStep(step.id)}
                      aria-label={
                        step.completed
                          ? `Bỏ đánh dấu ${step.title}`
                          : `Đánh dấu hoàn thành ${step.title}`
                      }
                    >
                      {step.completed ? (
                        <Check size={16} strokeWidth={3} />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </button>

                    <div className="td-step-main">
                      <strong>{step.title}</strong>
                      <p>{step.standardRef}</p>
                      <div className="td-step-meta">
                        <span>Người kiểm: {step.inspector}</span>
                        {step.completedAt && (
                          <span>· Nghiệm thu lúc {step.completedAt}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`td-badge ${
                          step.completed ? "is-done" : "is-todo"
                        }`}
                      >
                        {step.completed ? "Đạt yêu cầu" : "Chờ kiểm"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteChecklistStep(step.id)}
                        aria-label={`Xóa bước ${step.title}`}
                        className="rounded-lg p-1.5 text-[#6e6b75] transition-colors hover:bg-[#fdece6] hover:text-[#b95f3d]"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddChecklistStep} className="td-add-form">
                <input
                  type="text"
                  className="td-input"
                  value={newStepTitle}
                  onChange={(event) => setNewStepTitle(event.target.value)}
                  placeholder="Thêm bước kiểm tra nghiệm thu mới (VD: Kiểm tra độ sụt bê tông thương phẩm)..."
                  aria-label="Thêm bước kiểm tra mới"
                />
                <button type="submit" className="td-btn td-btn-outline">
                  <Plus size={16} />
                  Thêm bước
                </button>
              </form>
            </article>

            {/* 3. Material & Equipment Allocation Progress */}
            <article className="td-card">
              <div className="td-section-head">
                <h3>
                  <Package size={19} />
                  Định mức vật tư & Thiết bị tại vị trí thi công
                </h3>
                <span className="td-section-pill">
                  {metrics.readyMaterials}/{metrics.totalMaterials} sẵn sàng
                </span>
              </div>

              <div className="td-materials-list">
                {extra.materials.map((mat) => {
                  const ratio =
                    mat.plannedQty > 0
                      ? Math.min(
                          100,
                          Math.round((mat.issuedQty / mat.plannedQty) * 100),
                        )
                      : 0;
                  return (
                    <div key={mat.id} className="td-mat-item">
                      <div className="td-mat-top">
                        <div className="td-mat-title">
                          <strong>{mat.name}</strong>
                          <code>{mat.code}</code>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleMaterialReady(mat.id)}
                          className={`td-badge cursor-pointer border-0 ${
                            mat.ready ? "is-done" : "is-review"
                          }`}
                        >
                          {mat.ready ? "Đã cấp phát đủ" : "Chờ xuất bổ sung"}
                        </button>
                      </div>

                      <div className="td-mat-bar">
                        <span
                          className={mat.ready ? "" : "is-partial"}
                          style={{ width: `${ratio}%` }}
                        />
                      </div>

                      <div className="td-mat-sub">
                        <span>
                          Thực xuất:{" "}
                          <strong>
                            {new Intl.NumberFormat("vi-VN").format(
                              mat.issuedQty,
                            )}{" "}
                            {mat.unit}
                          </strong>
                        </span>
                        <span>
                          Định mức phê duyệt:{" "}
                          {new Intl.NumberFormat("vi-VN").format(
                            mat.plannedQty,
                          )}{" "}
                          {mat.unit} ({ratio}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>

            {/* 4. Site Photo Evidence Gallery */}
            <article className="td-card">
              <div className="td-section-head">
                <h3>
                  <Camera size={19} />
                  Hình ảnh nghiệm thu thực tế tại hiện trường
                </h3>
                <div className="td-photo-head-actions">
                  <span className="td-section-pill">
                    {extra.photos.length} ảnh đối chứng
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleUploadPhotos}
                    className="hidden"
                    aria-label="Tải ảnh nghiệm thu hiện trường"
                  />
                  <button
                    type="button"
                    className="td-upload-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus size={15} />
                    Tải ảnh lên
                  </button>
                </div>
              </div>

              <div className="td-photo-grid">
                {extra.photos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className="td-photo-card"
                    role="button"
                    tabIndex={0}
                    onClick={() => setPreviewIndex(index)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setPreviewIndex(index);
                      }
                    }}
                    aria-label={`Xem phóng to ảnh: ${photo.title}`}
                  >
                    <div className="td-photo-thumb">
                      <img src={photo.imageUrl} alt={photo.title} />
                      <div className="td-photo-overlay">
                        <span className="td-photo-zoom-badge">
                          <ZoomIn size={13} />
                          Xem ảnh
                        </span>
                        <button
                          type="button"
                          className="td-photo-del-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePhoto(photo.id);
                          }}
                          aria-label={`Xóa ảnh ${photo.title}`}
                          title="Xóa ảnh"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <div className="td-photo-caption">
                      <strong>{photo.title}</strong>
                      <span>{photo.caption}</span>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className="td-photo-dropcard"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className="td-photo-drop-icon">
                    <ImagePlus size={20} />
                  </span>
                  <strong>Thêm ảnh hiện trường</strong>
                  <span>JPG, PNG, WEBP · Chọn nhiều ảnh</span>
                </button>
              </div>
            </article>
          </div>

          {/* Right Column Stack */}
          <aside className="td-stack">
            {/* Panel A: Quick Dispatch & Status Controls */}
            <article className="td-card">
              <div className="td-section-head">
                <h3>
                  <HardHat size={19} />
                  Điều phối & Cập nhật nhanh
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    persistExtraChange(buildDefaultExtra(currentTask));
                    toast.success("Đã khôi phục dữ liệu mẫu của hạng mục");
                  }}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-[#6e6b75] hover:bg-[#f2eff7] hover:text-[#1e1c22]"
                >
                  <RotateCcw size={12} />
                  Khôi phục mẫu
                </button>
              </div>

              <div className="td-control-list">
                <div className="td-control-row">
                  <span>Trạng thái nghiệm thu</span>
                  <select
                    className="td-select-inline"
                    value={currentTask.status}
                    onChange={(event) => {
                      const nextStatus = event.target.value as TaskStatus;
                      const nextProg =
                        nextStatus === "Hoàn thành"
                          ? 100
                          : nextStatus === "Cần làm"
                            ? 0
                            : currentTask.progress === 0 ||
                                currentTask.progress === 100
                              ? 60
                              : currentTask.progress;
                      persistTaskChange({
                        ...currentTask,
                        status: nextStatus,
                        progress: nextProg,
                      });
                      toast.success(`Đã chuyển trạng thái sang "${nextStatus}"`);
                    }}
                    aria-label="Trạng thái nghiệm thu"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="td-control-row">
                  <span>Mức độ ưu tiên</span>
                  <select
                    className="td-select-inline"
                    value={currentTask.priority}
                    onChange={(event) => {
                      const nextPriority = event.target.value as TaskPriority;
                      persistTaskChange({
                        ...currentTask,
                        priority: nextPriority,
                      });
                      toast.success(
                        `Đã đổi mức ưu tiên sang "${nextPriority}"`,
                      );
                    }}
                    aria-label="Mức độ ưu tiên"
                  >
                    {PRIORITY_OPTIONS.map((pr) => (
                      <option key={pr} value={pr}>
                        {pr}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="td-control-row">
                  <span>Kỹ sư / Tổ đội chủ trì</span>
                  <select
                    className="td-select-inline"
                    value={currentTask.assignee}
                    onChange={(event) => {
                      persistTaskChange({
                        ...currentTask,
                        assignee: event.target.value,
                      });
                      toast.success(
                        `Đã phân công cho "${event.target.value}"`,
                      );
                    }}
                    aria-label="Kỹ sư phụ trách"
                  >
                    {Array.from(
                      new Set([currentTask.assignee, ...ASSIGNEE_OPTIONS]),
                    ).map((person) => (
                      <option key={person} value={person}>
                        {person}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="td-control-row">
                  <span>Hạn bàn giao</span>
                  <input
                    type="date"
                    className="td-date-inline"
                    value={currentTask.dueDate}
                    onChange={(event) => {
                      persistTaskChange({
                        ...currentTask,
                        dueDate: event.target.value,
                      });
                      toast.success("Đã cập nhật hạn bàn giao hạng mục");
                    }}
                    aria-label="Hạn bàn giao"
                  />
                </div>
              </div>
            </article>

            {/* Panel B: Field Activity & Comment Feed */}
            <article className="td-card">
              <div className="td-section-head">
                <h3>
                  <Clock size={19} />
                  Nhật ký hiện trường & Giám sát
                </h3>
                <span className="td-section-pill">
                  {extra.logs.length} phản hồi
                </span>
              </div>

              <div className="td-feed-list">
                {extra.logs.map((log) => (
                  <div key={log.id} className="td-feed-card">
                    <div className="td-feed-avatar">
                      {getInitials(log.author)}
                    </div>
                    <div className="td-feed-content">
                      <div className="td-feed-top">
                        <strong>{log.author}</strong>
                        <span>{log.timestamp}</span>
                      </div>
                      <span className="td-feed-role">{log.role}</span>
                      <p>{log.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddFieldLog} className="td-add-form">
                <input
                  type="text"
                  className="td-input"
                  value={newComment}
                  onChange={(event) => setNewComment(event.target.value)}
                  placeholder="Ghi nhận kết quả kiểm tra hoặc ý kiến giám sát..."
                  aria-label="Nội dung nhật ký hiện trường"
                />
                <button type="submit" className="td-btn td-btn-primary">
                  <Send size={15} />
                  Gửi
                </button>
              </form>
            </article>

            {/* Panel C: Attached Blueprints & QA/QC Documents */}
            <article className="td-card">
              <div className="td-section-head">
                <h3>
                  <Layers size={19} />
                  Bản vẽ Shopdrawing & Hồ sơ
                </h3>
                <span className="td-section-pill">
                  {extra.attachments.length} tài liệu
                </span>
              </div>

              <div className="td-docs-wrap">
                {extra.attachments.map((doc) => (
                  <div key={doc.id} className="td-doc-card">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="td-doc-icon">
                        <FileText size={17} />
                      </span>
                      <div className="td-doc-info">
                        <strong>{doc.fileName}</strong>
                        <span>
                          {doc.version} · {doc.size} · {doc.updatedAt}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        toast.success(`Đang tải xuống "${doc.fileName}"`)
                      }
                      className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[#d5d1dc] bg-white text-[#1e1c22] hover:border-[#00786e] hover:text-[#00786e]"
                      aria-label={`Tải xuống ${doc.fileName}`}
                      title="Tải xuống"
                    >
                      <Download size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </article>
          </aside>
        </div>
      </div>

      {/* Edit Task Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-h-[calc(100vh-2rem)] max-w-[580px] overflow-y-auto rounded-2xl border border-[#ece8f0] bg-white p-0">
          <DialogHeader className="border-b border-[#f0edf5] px-6 py-5 text-left">
            <DialogTitle className="text-lg font-bold text-[#1e1c22]">
              Chỉnh sửa hạng mục · {currentTask.code}
            </DialogTitle>
            <DialogDescription className="mt-1 text-xs text-[#6e6b75]">
              Cập nhật nội dung kỹ thuật, vị trí cao trình và kỹ sư chủ trì hạng
              mục công việc.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSaveTaskModal}
            className="flex flex-col gap-4 p-6 text-left"
          >
            <div>
              <label
                htmlFor="td-edit-title"
                className="mb-1.5 block text-xs font-semibold text-[#1e1c22]"
              >
                Tên hạng mục công việc
              </label>
              <input
                id="td-edit-title"
                className="td-input w-full"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="td-edit-category"
                  className="mb-1.5 block text-xs font-semibold text-[#1e1c22]"
                >
                  Phân loại kỹ thuật
                </label>
                <select
                  id="td-edit-category"
                  className="td-select-inline h-10 w-full"
                  value={editCategory}
                  onChange={(e) =>
                    setEditCategory(e.target.value as TaskCategory)
                  }
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="td-edit-priority"
                  className="mb-1.5 block text-xs font-semibold text-[#1e1c22]"
                >
                  Mức độ ưu tiên
                </label>
                <select
                  id="td-edit-priority"
                  className="td-select-inline h-10 w-full"
                  value={editPriority}
                  onChange={(e) =>
                    setEditPriority(e.target.value as TaskPriority)
                  }
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="td-edit-assignee"
                  className="mb-1.5 block text-xs font-semibold text-[#1e1c22]"
                >
                  Kỹ sư / Tổ đội phụ trách
                </label>
                <select
                  id="td-edit-assignee"
                  className="td-select-inline h-10 w-full"
                  value={editAssignee}
                  onChange={(e) => setEditAssignee(e.target.value)}
                >
                  {Array.from(
                    new Set([editAssignee, ...ASSIGNEE_OPTIONS]),
                  ).map((person) => (
                    <option key={person} value={person}>
                      {person}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="td-edit-duedate"
                  className="mb-1.5 block text-xs font-semibold text-[#1e1c22]"
                >
                  Hạn bàn giao nghiệm thu
                </label>
                <input
                  id="td-edit-duedate"
                  type="date"
                  className="td-date-inline h-10 w-full"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="td-edit-zone"
                className="mb-1.5 block text-xs font-semibold text-[#1e1c22]"
              >
                Vị trí phân khu & Cao trình
              </label>
              <input
                id="td-edit-zone"
                className="td-input w-full"
                value={editLocationZone}
                onChange={(e) => setEditLocationZone(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="td-edit-desc"
                className="mb-1.5 block text-xs font-semibold text-[#1e1c22]"
              >
                Mô tả chi tiết yêu cầu kỹ thuật
              </label>
              <textarea
                id="td-edit-desc"
                rows={3}
                className="w-full rounded-[10px] border border-[#dad6e2] bg-[#fcfbfe] p-3 text-sm text-[#1e1c22] outline-none focus:border-[#00786e] focus:bg-white"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
              />
            </div>

            <div className="mt-2 flex items-center justify-end gap-2 border-t border-[#f0edf5] pt-4">
              <button
                type="button"
                className="td-btn td-btn-outline h-10"
                onClick={() => setIsEditOpen(false)}
              >
                Hủy
              </button>
              <button type="submit" className="td-btn td-btn-primary h-10">
                Lưu thay đổi
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Site Photo Gallery Lightbox Modal */}
      {activePreviewPhoto && previewIndex !== null && (
        <div
          className="td-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Trình xem ảnh nghiệm thu hiện trường"
          onClick={() => setPreviewIndex(null)}
        >
          <div
            className="td-lightbox-shell"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <header className="td-lightbox-top">
              <div className="td-lightbox-meta">
                <span className="td-lightbox-counter">
                  {previewIndex + 1} / {extra.photos.length}
                </span>
                <div className="td-lightbox-titles">
                  <strong>{activePreviewPhoto.title}</strong>
                  <span>
                    {activePreviewPhoto.caption} · {currentTask.code}
                  </span>
                </div>
              </div>

              <div className="td-lightbox-actions">
                <button
                  type="button"
                  className="td-lightbox-icon-btn"
                  onClick={() => fileInputRef.current?.click()}
                  title="Tải thêm ảnh"
                  aria-label="Tải thêm ảnh"
                >
                  <ImagePlus size={17} />
                </button>
                <button
                  type="button"
                  className="td-lightbox-icon-btn is-danger"
                  onClick={() => handleDeletePhoto(activePreviewPhoto.id)}
                  title="Xóa ảnh này"
                  aria-label="Xóa ảnh này"
                >
                  <Trash2 size={17} />
                </button>
                <button
                  type="button"
                  className="td-lightbox-icon-btn"
                  onClick={() => setPreviewIndex(null)}
                  title="Đóng (Esc)"
                  aria-label="Đóng trình xem ảnh"
                >
                  <X size={19} />
                </button>
              </div>
            </header>

            {/* Main Stage with Left & Right Arrow Navigation */}
            <div className="td-lightbox-stage">
              <button
                type="button"
                className="td-lightbox-nav is-prev"
                onClick={handlePrevPhoto}
                disabled={extra.photos.length <= 1}
                aria-label="Ảnh trước (Mũi tên trái)"
                title="Ảnh trước (←)"
              >
                <ChevronLeft size={24} />
              </button>

              <figure className="td-lightbox-figure">
                <img
                  src={activePreviewPhoto.imageUrl}
                  alt={activePreviewPhoto.title}
                />
              </figure>

              <button
                type="button"
                className="td-lightbox-nav is-next"
                onClick={handleNextPhoto}
                disabled={extra.photos.length <= 1}
                aria-label="Ảnh tiếp theo (Mũi tên phải)"
                title="Ảnh tiếp theo (→)"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Bottom Filmstrip Thumbnails */}
            <footer className="td-lightbox-strip">
              {extra.photos.map((photo, idx) => (
                <button
                  key={photo.id}
                  type="button"
                  className={`td-lightbox-thumb ${
                    idx === previewIndex ? "is-active" : ""
                  }`}
                  onClick={() => setPreviewIndex(idx)}
                  aria-label={`Chuyển tới ảnh ${idx + 1}: ${photo.title}`}
                >
                  <img src={photo.imageUrl} alt={photo.title} />
                </button>
              ))}
            </footer>
          </div>
        </div>
      )}
    </section>
  );
}

export default DetailTask;
