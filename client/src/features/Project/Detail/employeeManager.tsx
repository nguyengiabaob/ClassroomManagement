import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCheck,
  Clock,
  HardHat,
  Hash,
  Layers,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UserPlus,
  UsersRound,
} from "lucide-react";
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

export type AttendanceStatus =
  | "Đúng giờ"
  | "Đi muộn"
  | "Vắng mặt"
  | "Nghỉ phép";

export type AvatarTone = "teal" | "amber" | "terracotta";

export interface ProjectEmployee {
  id: number;
  code: string;
  name: string;
  role: string;
  team: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  status: AttendanceStatus;
  avatarTone: AvatarTone;
  note?: string;
}

const ATTENDANCE_FILTERS: Array<"Tất cả" | AttendanceStatus> = [
  "Tất cả",
  "Đúng giờ",
  "Đi muộn",
  "Vắng mặt",
  "Nghỉ phép",
];

const ATTENDANCE_STATUSES: AttendanceStatus[] = [
  "Đúng giờ",
  "Đi muộn",
  "Vắng mặt",
  "Nghỉ phép",
];

const TEAM_OPTIONS = [
  "Ban chỉ huy công trường",
  "Tổ Kết cấu - Bê tông",
  "Tổ Cơ điện M&E",
  "Tổ Hoàn thiện - Kiến trúc",
  "Ban An toàn HSE",
];

export function getEmployeesStorageKey(projectId: number) {
  return `cm_project_employees_v1_${projectId}`;
}

export function getEmployeeInitials(name: string): string {
  const clean = name
    .replace(/^(KS\.|KTS\.|TS\.|Tổ trưởng|Đội)\s*/i, "")
    .trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "NS";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function createInitialEmployees(project: ProjectItem): ProjectEmployee[] {
  const prefix = project.projectCode.split("-")[0] || "NS";
  const totalWorkforce = Math.max(1, project.expectedPersonnel || 24);
  const teamWorkers = Math.max(4, Math.round(totalWorkforce * 0.45));

  return [
    {
      id: 1,
      code: `${prefix}-NV01`,
      name: "KS. Nguyễn Văn Nam",
      role: "Chỉ huy trưởng công trường",
      team: "Ban chỉ huy công trường",
      phone: "0903 128 456",
      checkIn: "06:55",
      checkOut: "17:45",
      status: "Đúng giờ",
      avatarTone: "teal",
      note: "Điều phối tổng thể & nghiệm thu cốt thép",
    },
    {
      id: 2,
      code: `${prefix}-NV02`,
      name: "KS. Lê Minh Hiếu",
      role: "Kỹ sư trưởng Cơ điện (M&E)",
      team: "Tổ Cơ điện M&E",
      phone: "0918 442 910",
      checkIn: "07:05",
      checkOut: "17:30",
      status: "Đúng giờ",
      avatarTone: "teal",
      note: "Giám sát lắp đặt trục điện - cấp thoát nước",
    },
    {
      id: 3,
      code: `${prefix}-NV03`,
      name: "KS. Trần Đình Tú",
      role: "Giám sát An toàn lao động (HSE)",
      team: "Ban An toàn HSE",
      phone: "0987 615 204",
      checkIn: "07:28",
      checkOut: "17:30",
      status: "Đi muộn",
      avatarTone: "amber",
      note: "Kiểm tra giàn giáo mặt ngoài & thiết bị nâng",
    },
    {
      id: 4,
      code: `${prefix}-NV04`,
      name: "KTS. Phạm Thu Hà",
      role: "Kiến trúc sư hiện trường",
      team: "Tổ Hoàn thiện - Kiến trúc",
      phone: "0932 880 119",
      checkIn: "07:10",
      checkOut: "17:30",
      status: "Đúng giờ",
      avatarTone: "teal",
      note: "Kiểm soát vật liệu hoàn thiện & bản vẽ shopdrawing",
    },
    {
      id: 5,
      code: `${prefix}-TD05`,
      name: `Tổ trưởng Đặng Quốc Khánh (${teamWorkers} công nhân)`,
      role: "Tổ trưởng Cốt thép - Bê tông",
      team: "Tổ Kết cấu - Bê tông",
      phone: "0974 309 552",
      checkIn: "07:00",
      checkOut: "17:30",
      status: "Đúng giờ",
      avatarTone: "amber",
      note: `Quản lý trực tiếp ${teamWorkers}/${totalWorkforce} nhân lực dự kiến`,
    },
    {
      id: 6,
      code: `${prefix}-NV06`,
      name: "KS. Vũ Hoàng Long",
      role: "Kỹ sư Trắc đạc & Hồ sơ QA/QC",
      team: "Ban chỉ huy công trường",
      phone: "0965 712 830",
      checkIn: "--:--",
      checkOut: "--:--",
      status: "Nghỉ phép",
      avatarTone: "terracotta",
      note: "Nghỉ phép có đơn đã duyệt",
    },
  ];
}

export function loadProjectEmployees(project: ProjectItem): ProjectEmployee[] {
  try {
    const raw = localStorage.getItem(getEmployeesStorageKey(project.id));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Fallback to seeded employees
  }
  const seeded = createInitialEmployees(project);
  saveProjectEmployees(project.id, seeded);
  return seeded;
}

export function saveProjectEmployees(
  projectId: number,
  employees: ProjectEmployee[],
) {
  try {
    localStorage.setItem(
      getEmployeesStorageKey(projectId),
      JSON.stringify(employees),
    );
    window.dispatchEvent(
      new CustomEvent("cm-project-employees-updated", {
        detail: { projectId },
      }),
    );
  } catch {
    // Ignore storage errors
  }
}

function getStatusChipClass(status: AttendanceStatus): string {
  switch (status) {
    case "Đúng giờ":
      return "is-ontime";
    case "Đi muộn":
      return "is-late";
    case "Vắng mặt":
      return "is-absent";
    default:
      return "is-leave";
  }
}

export default function EmployeeManager({ project }: { project: ProjectItem }) {
  const [employees, setEmployees] = useState<ProjectEmployee[]>(() =>
    loadProjectEmployees(project),
  );
  const [attendanceDate, setAttendanceDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Tất cả" | AttendanceStatus>(
    "Tất cả",
  );

  // Create / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] =
    useState<ProjectEmployee | null>(null);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [role, setRole] = useState("");
  const [team, setTeam] = useState(TEAM_OPTIONS[0]);
  const [phone, setPhone] = useState("");
  const [checkIn, setCheckIn] = useState("07:00");
  const [checkOut, setCheckOut] = useState("17:30");
  const [status, setStatus] = useState<AttendanceStatus>("Đúng giờ");
  const [note, setNote] = useState("");

  // Delete confirmation state
  const [deletingEmployee, setDeletingEmployee] =
    useState<ProjectEmployee | null>(null);

  useEffect(() => {
    setEmployees(loadProjectEmployees(project));
  }, [project]);

  const updateEmployees = (next: ProjectEmployee[]) => {
    setEmployees(next);
    saveProjectEmployees(project.id, next);
  };

  const stats = useMemo(() => {
    const total = employees.length;
    const onTime = employees.filter((e) => e.status === "Đúng giờ").length;
    const late = employees.filter((e) => e.status === "Đi muộn").length;
    const absent = employees.filter(
      (e) => e.status === "Vắng mặt" || e.status === "Nghỉ phép",
    ).length;
    const presentCount = onTime + late;
    const attendanceRate =
      total > 0 ? Math.round((presentCount / total) * 100) : 0;

    return { total, onTime, late, absent, presentCount, attendanceRate };
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    const q = searchQuery.trim().toLocaleLowerCase("vi");
    return employees.filter((emp) => {
      const matchesStatus =
        statusFilter === "Tất cả" || emp.status === statusFilter;
      const matchesQuery =
        !q ||
        `${emp.code} ${emp.name} ${emp.role} ${emp.team} ${emp.phone}`
          .toLocaleLowerCase("vi")
          .includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [employees, searchQuery, statusFilter]);

  const handleQuickAttendanceChange = (
    emp: ProjectEmployee,
    nextStatus: AttendanceStatus,
  ) => {
    if (emp.status === nextStatus) return;
    const nextCheckIn =
      nextStatus === "Vắng mặt" || nextStatus === "Nghỉ phép"
        ? "--:--"
        : emp.checkIn === "--:--"
          ? nextStatus === "Đi muộn"
            ? "07:35"
            : "07:00"
          : emp.checkIn;
    const nextCheckOut =
      nextStatus === "Vắng mặt" || nextStatus === "Nghỉ phép"
        ? "--:--"
        : emp.checkOut === "--:--"
          ? "17:30"
          : emp.checkOut;

    const updated = employees.map((item) =>
      item.id === emp.id
        ? {
            ...item,
            status: nextStatus,
            checkIn: nextCheckIn,
            checkOut: nextCheckOut,
          }
        : item,
    );
    updateEmployees(updated);
    toast.success(`Đã cập nhật chấm công "${emp.name}": ${nextStatus}`);
  };

  const handleMarkAllPresent = () => {
    const updated = employees.map((emp) => ({
      ...emp,
      status: "Đúng giờ" as AttendanceStatus,
      checkIn: emp.checkIn === "--:--" ? "07:00" : emp.checkIn,
      checkOut: emp.checkOut === "--:--" ? "17:30" : emp.checkOut,
    }));
    updateEmployees(updated);
    toast.success("Đã chấm công có mặt đúng giờ cho toàn bộ nhân sự");
  };

  const openCreateModal = () => {
    const prefix = project.projectCode.split("-")[0] || "NS";
    const existingCodes = new Set(employees.map((e) => e.code.toUpperCase()));
    let num = employees.length + 1;
    let suggested = `${prefix}-NV${String(num).padStart(2, "0")}`;
    while (existingCodes.has(suggested.toUpperCase())) {
      num += 1;
      suggested = `${prefix}-NV${String(num).padStart(2, "0")}`;
    }

    setEditingEmployee(null);
    setCode(suggested);
    setCodeError("");
    setName("");
    setRole("Kỹ sư hiện trường");
    setTeam(TEAM_OPTIONS[0]);
    setPhone("");
    setCheckIn("07:00");
    setCheckOut("17:30");
    setStatus("Đúng giờ");
    setNote("");
    setIsModalOpen(true);
  };

  const openEditModal = (emp: ProjectEmployee) => {
    setEditingEmployee(emp);
    setCode(emp.code);
    setCodeError("");
    setName(emp.name);
    setRole(emp.role);
    setTeam(emp.team);
    setPhone(emp.phone);
    setCheckIn(emp.checkIn === "--:--" ? "07:00" : emp.checkIn);
    setCheckOut(emp.checkOut === "--:--" ? "17:30" : emp.checkOut);
    setStatus(emp.status);
    setNote(emp.note ?? "");
    setIsModalOpen(true);
  };

  const handleSaveEmployee = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const normalizedCode = code.trim().toUpperCase();

    if (!trimmedName) {
      toast.error("Vui lòng nhập họ tên nhân sự hoặc tên tổ đội");
      return;
    }

    const duplicate = employees.some(
      (item) =>
        item.code.toUpperCase() === normalizedCode &&
        item.id !== editingEmployee?.id,
    );
    if (duplicate) {
      setCodeError("Mã nhân sự này đã tồn tại");
      return;
    }

    const isOff = status === "Vắng mặt" || status === "Nghỉ phép";
    const avatarTone: AvatarTone =
      status === "Đi muộn"
        ? "amber"
        : isOff
          ? "terracotta"
          : "teal";

    if (editingEmployee) {
      const updated = employees.map((item) =>
        item.id === editingEmployee.id
          ? {
              ...item,
              code: normalizedCode || item.code,
              name: trimmedName,
              role: role.trim() || "Kỹ sư hiện trường",
              team,
              phone: phone.trim() || "Chưa cập nhật",
              checkIn: isOff ? "--:--" : checkIn || "07:00",
              checkOut: isOff ? "--:--" : checkOut || "17:30",
              status,
              avatarTone,
              note: note.trim(),
            }
          : item,
      );
      updateEmployees(updated);
      toast.success(`Đã cập nhật nhân sự "${trimmedName}"`);
    } else {
      const nextId =
        employees.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;
      const newEmp: ProjectEmployee = {
        id: nextId,
        code: normalizedCode || `NV-${String(nextId).padStart(2, "0")}`,
        name: trimmedName,
        role: role.trim() || "Kỹ sư hiện trường",
        team,
        phone: phone.trim() || "Chưa cập nhật",
        checkIn: isOff ? "--:--" : checkIn || "07:00",
        checkOut: isOff ? "--:--" : checkOut || "17:30",
        status,
        avatarTone,
        note: note.trim(),
      };
      updateEmployees([newEmp, ...employees]);
      toast.success(
        `Đã thêm "${trimmedName}" vào danh sách nhân lực dự kiến`,
      );
    }

    setIsModalOpen(false);
    setEditingEmployee(null);
  };

  const confirmDeleteEmployee = () => {
    if (!deletingEmployee) return;
    const updated = employees.filter((item) => item.id !== deletingEmployee.id);
    updateEmployees(updated);
    toast.success(`Đã xóa nhân sự "${deletingEmployee.name}"`);
    setDeletingEmployee(null);
  };

  return (
    <div className="emp-manager">
      {/* 4-Card Attendance KPI Strip */}
      <div className="emp-manager__kpis">
        <div className="emp-manager__kpi-card">
          <div className="emp-manager__kpi-copy">
            <span>Nhân lực dự kiến & Tổ đội</span>
            <strong>{stats.total}</strong>
            <small>Quy mô định biên: {project.expectedPersonnel} người</small>
          </div>
          <div className="project-tasks-kpi-icon is-teal">
            <UsersRound size={21} />
          </div>
        </div>

        <div className="emp-manager__kpi-card">
          <div className="emp-manager__kpi-copy">
            <span>Có mặt đúng giờ</span>
            <strong>
              {stats.onTime} / {stats.total}
            </strong>
            <small>Tỷ lệ hiện diện ca sáng: {stats.attendanceRate}%</small>
          </div>
          <div className="project-tasks-kpi-icon is-teal">
            <UserCheck size={21} />
          </div>
        </div>

        <div className="emp-manager__kpi-card">
          <div className="emp-manager__kpi-copy">
            <span>Check-in muộn</span>
            <strong>{stats.late}</strong>
            <small>Sau 07:15 AM tại cổng công trường</small>
          </div>
          <div className="project-tasks-kpi-icon is-amber">
            <Clock size={21} />
          </div>
        </div>

        <div className="emp-manager__kpi-card">
          <div className="emp-manager__kpi-copy">
            <span>Vắng mặt / Nghỉ phép</span>
            <strong>{stats.absent}</strong>
            <small>Đã bố trí nhân sự thay thế ca</small>
          </div>
          <div className="project-tasks-kpi-icon is-terracotta">
            <AlertTriangle size={21} />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="emp-manager__toolbar">
        <div className="emp-manager__toolbar-top">
          <div className="flex flex-wrap items-center gap-3">
            <label className="emp-manager__date-box">
              <CalendarDays size={16} />
              <span>Ngày chấm công:</span>
              <input
                type="date"
                value={attendanceDate}
                onChange={(event) => setAttendanceDate(event.target.value)}
                aria-label="Chọn ngày chấm công"
              />
            </label>

            <label className="project-tasks-search">
              <Search size={17} />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Tìm tên kỹ sư, tổ đội, mã NV, số điện thoại..."
                aria-label="Tìm kiếm nhân sự"
              />
            </label>
          </div>

          <div className="emp-manager__toolbar-actions">
            <button
              type="button"
              className="emp-manager__quick-check-btn"
              onClick={handleMarkAllPresent}
            >
              <CheckCheck size={17} />
              Chấm công tất cả đúng giờ
            </button>
            <button
              type="button"
              className="project-tasks-add-btn"
              onClick={openCreateModal}
            >
              <UserPlus size={18} />
              Thêm nhân sự / tổ đội
            </button>
          </div>
        </div>

        <div
          className="project-tasks-filter-pills"
          role="group"
          aria-label="Lọc theo trạng thái chấm công"
        >
          {ATTENDANCE_FILTERS.map((filterName) => {
            const count =
              filterName === "Tất cả"
                ? employees.length
                : employees.filter((e) => e.status === filterName).length;
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

      {/* Attendance Table */}
      <div className="emp-manager__table-card">
        {filteredEmployees.length === 0 ? (
          <div className="project-tasks-empty border-0">
            <UsersRound size={34} className="mx-auto text-[#00786e]" />
            <h3>Không tìm thấy nhân sự phù hợp</h3>
            <p>
              Hãy thử từ khóa khác hoặc thêm kỹ sư / tổ đội mới vào danh sách
              nhân lực dự kiến của công trình.
            </p>
            <Button
              type="button"
              onClick={openCreateModal}
              className="bg-[#087f74] text-white hover:bg-[#006b61]"
            >
              <Plus size={17} />
              Thêm nhân sự mới
            </Button>
          </div>
        ) : (
          <div className="emp-manager__table-wrap">
            <table className="emp-manager__table">
              <thead>
                <tr>
                  <th>Nhân sự / Tổ đội</th>
                  <th>Chức vụ & Bộ phận</th>
                  <th>Giờ Check-in / Out</th>
                  <th>Trạng thái chấm công (1-Click)</th>
                  <th className="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <div className="emp-manager__person">
                        <span
                          className={`emp-manager__avatar is-${emp.avatarTone}`}
                        >
                          {getEmployeeInitials(emp.name)}
                        </span>
                        <div className="emp-manager__person-copy">
                          <strong>{emp.name}</strong>
                          <span>
                            <b>{emp.code}</b> · <Phone size={11} /> {emp.phone}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="emp-manager__role-badge">
                        {emp.role}
                      </span>
                      <span className="emp-manager__team-sub">{emp.team}</span>
                    </td>

                    <td>
                      <span className="emp-manager__time-pill">
                        <Clock size={13} />
                        {emp.checkIn} → {emp.checkOut}
                      </span>
                      {emp.note && (
                        <span className="emp-manager__team-sub">
                          {emp.note}
                        </span>
                      )}
                    </td>

                    <td>
                      <div
                        className="emp-manager__status-group"
                        role="radiogroup"
                        aria-label={`Chấm công cho ${emp.name}`}
                      >
                        {ATTENDANCE_STATUSES.map((st) => (
                          <button
                            key={st}
                            type="button"
                            role="radio"
                            aria-checked={emp.status === st}
                            className={`emp-manager__status-chip ${getStatusChipClass(
                              st,
                            )} ${emp.status === st ? "is-active" : ""}`}
                            onClick={() => handleQuickAttendanceChange(emp, st)}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </td>

                    <td>
                      <div className="project-task-actions justify-end">
                        <button
                          type="button"
                          className="project-task-icon-btn"
                          onClick={() => openEditModal(emp)}
                          aria-label={`Chỉnh sửa ${emp.name}`}
                          title="Chỉnh sửa thông tin"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          className="project-task-icon-btn is-danger"
                          onClick={() => setDeletingEmployee(emp)}
                          aria-label={`Xóa ${emp.name}`}
                          title="Xóa khỏi danh sách"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Employee Modal */}
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsModalOpen(false);
            setEditingEmployee(null);
            setCodeError("");
          }
        }}
      >
        <DialogContent className="task-modal max-h-[calc(100vh-2rem)] max-w-[660px] overflow-y-auto p-0">
          <DialogHeader className="task-modal__header">
            <div className="task-modal__icon-badge">
              <HardHat size={23} />
            </div>
            <div className="task-modal__header-copy">
              <span className="task-modal__eyebrow">
                Nhân lực dự kiến · {project.projectCode}
              </span>
              <DialogTitle className="task-modal__title">
                {editingEmployee
                  ? "Cập nhật thông tin & Chấm công"
                  : "Thêm Kỹ sư / Tổ đội phụ trách"}
              </DialogTitle>
              <DialogDescription className="task-modal__subtitle">
                Nhân sự được thêm tại đây sẽ đồng bộ trực tiếp vào danh sách lựa
                chọn Kỹ sư / Tổ đội phụ trách ở tab Công việc.
              </DialogDescription>
            </div>
          </DialogHeader>

          <form onSubmit={handleSaveEmployee} className="task-modal__form">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="task-modal__field sm:col-span-2">
                <div className="task-modal__label-row">
                  <label htmlFor="emp-name" className="task-modal__label">
                    Họ tên Kỹ sư / Tên tổ đội
                  </label>
                  <span className="task-modal__hint">Bắt buộc</span>
                </div>
                <div className="task-modal__input-box">
                  <UserCheck size={17} />
                  <Input
                    id="emp-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="VD: KS. Nguyễn Văn Nam hoặc Tổ cốp pha 1"
                    required
                  />
                </div>
              </div>

              <div className="task-modal__field">
                <div className="task-modal__label-row">
                  <label htmlFor="emp-code" className="task-modal__label">
                    Mã định danh
                  </label>
                </div>
                <div
                  className={`task-modal__input-box ${
                    codeError ? "is-error" : ""
                  }`}
                >
                  <Hash size={16} />
                  <Input
                    id="emp-code"
                    className="is-mono"
                    value={code}
                    onChange={(event) => {
                      setCode(event.target.value.toUpperCase());
                      setCodeError("");
                    }}
                    placeholder="NV-01"
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="task-modal__field">
                <div className="task-modal__label-row">
                  <label htmlFor="emp-role" className="task-modal__label">
                    Chức vụ / Vai trò chuyên môn
                  </label>
                </div>
                <div className="task-modal__input-box">
                  <HardHat size={17} />
                  <Input
                    id="emp-role"
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                    placeholder="VD: Kỹ sư giám sát kết cấu"
                    required
                  />
                </div>
              </div>

              <div className="task-modal__field">
                <div className="task-modal__label-row">
                  <label htmlFor="emp-phone" className="task-modal__label">
                    Số điện thoại liên hệ
                  </label>
                </div>
                <div className="task-modal__input-box">
                  <Phone size={16} />
                  <Input
                    id="emp-phone"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="0903 xxx xxx"
                  />
                </div>
              </div>
            </div>

            <div className="task-modal__field">
              <div className="task-modal__label-row">
                <span className="task-modal__label">Bộ phận / Tổ đội</span>
              </div>
              <div className="task-modal__chips">
                {TEAM_OPTIONS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`task-modal__chip ${
                      team === t ? "is-selected" : ""
                    }`}
                    onClick={() => setTeam(t)}
                  >
                    <Layers size={13} />
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="task-modal__field">
              <div className="task-modal__label-row">
                <span className="task-modal__label">
                  Trạng thái chấm công & Khung giờ ca
                </span>
              </div>
              <div className="task-modal__progress-panel">
                <div className="task-modal__status-pills">
                  {ATTENDANCE_STATUSES.map((st) => (
                    <button
                      key={st}
                      type="button"
                      className={`task-modal__status-btn ${
                        status === st ? "is-selected" : ""
                      }`}
                      onClick={() => setStatus(st)}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="task-modal__field">
                    <label htmlFor="emp-checkin" className="task-modal__label">
                      Giờ Check-in
                    </label>
                    <div className="task-modal__input-box">
                      <Clock size={16} />
                      <Input
                        id="emp-checkin"
                        type="time"
                        value={checkIn}
                        onChange={(event) => setCheckIn(event.target.value)}
                      />
                    </div>
                  </div>
                  <div className="task-modal__field">
                    <label htmlFor="emp-checkout" className="task-modal__label">
                      Giờ Check-out dự kiến
                    </label>
                    <div className="task-modal__input-box">
                      <Clock size={16} />
                      <Input
                        id="emp-checkout"
                        type="time"
                        value={checkOut}
                        onChange={(event) => setCheckOut(event.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="task-modal__field">
              <div className="task-modal__label-row">
                <label htmlFor="emp-note" className="task-modal__label">
                  Ghi chú phân công ca
                </label>
              </div>
              <Textarea
                id="emp-note"
                rows={2}
                className="task-modal__textarea"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Khu vực trực ca, nhiệm vụ trọng tâm trong ngày..."
              />
            </div>

            <DialogFooter className="task-modal__footer">
              <Button
                type="button"
                variant="outline"
                className="task-modal__cancel-btn"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingEmployee(null);
                  setCodeError("");
                }}
              >
                Hủy bỏ
              </Button>
              <Button type="submit" className="task-modal__submit-btn">
                {editingEmployee ? "Lưu cập nhật" : "Thêm vào nhân lực dự án"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deletingEmployee)}
        onOpenChange={(open) => !open && setDeletingEmployee(null)}
      >
        <DialogContent className="max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Xóa nhân sự khỏi dự án</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa{" "}
              <strong>{deletingEmployee?.name}</strong> (
              {deletingEmployee?.code}) khỏi danh sách nhân lực của dự án{" "}
              <strong>{project.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingEmployee(null)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDeleteEmployee}
            >
              Xóa nhân sự
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

