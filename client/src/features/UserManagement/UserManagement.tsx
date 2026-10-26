import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DEPARTMENT_OPTIONS,
  EMPLOYEE_STATUS_OPTIONS,
  type EmployeeItem,
  type EmployeeStatus,
  fetchEmployees,
  getInitials,
  loadEmployeesFromStorage,
  PROJECT_ASSIGNMENT_OPTIONS,
  saveEmployeesToStorage,
  suggestNextEmployeeCode,
} from "./UserManagementService";
import "./UserManagement.css";

const DEPT_COLORS = [
  "#00796f", // Main data hue (ConstructFriendly teal)
  "#1d1f20", // Ink
  "#575a5e", // Stone slate
  "#8c8f94", // Mid grey
  "#b8b7b2", // Warm grey
];

function formatVnd(amount: number): string {
  return `${new Intl.NumberFormat("vi-VN").format(Math.round(amount))} ₫`;
}

function getStatusPillClass(status: EmployeeStatus): string {
  switch (status) {
    case "Đang làm việc":
      return "is-active";
    case "Đi công tác":
      return "is-trip";
    case "Nghỉ phép":
      return "is-leave";
    default:
      return "is-paused";
  }
}

export default function UserManagement() {
  const [employees, setEmployees] = useState<EmployeeItem[]>(() =>
    loadEmployeesFromStorage(),
  );
  const [lastUpdated, setLastUpdated] = useState("Hôm nay, 14:25");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Tất cả" | EmployeeStatus>(
    "Tất cả",
  );
  const [departmentFilter, setDepartmentFilter] = useState<string>("Tất cả");
  const [sortBy, setSortBy] = useState<"code" | "dailyRate" | "workDays">(
    "code",
  );

  // Create / Edit Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeItem | null>(
    null,
  );
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState<string>(DEPARTMENT_OPTIONS[0]);
  const [projectAssignment, setProjectAssignment] = useState<string>(
    PROJECT_ASSIGNMENT_OPTIONS[0],
  );
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dailyRate, setDailyRate] = useState("980000");
  const [workDaysMonth, setWorkDaysMonth] = useState("24");
  const [targetDaysMonth, setTargetDaysMonth] = useState("26");
  const [status, setStatus] = useState<EmployeeStatus>("Đang làm việc");
  const [joinedDate, setJoinedDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [note, setNote] = useState("");

  // Delete Confirmation Modal state
  const [deletingEmployee, setDeletingEmployee] = useState<EmployeeItem | null>(
    null,
  );

  useEffect(() => {
    void fetchEmployees().then((list) => {
      setEmployees(list);
    });
  }, []);

  const persistEmployees = (next: EmployeeItem[]) => {
    setEmployees(next);
    saveEmployeesToStorage(next);
    const now = new Date();
    setLastUpdated(
      `Hôm nay, ${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes(),
      ).padStart(2, "0")}`,
    );
  };

  // Reconciled metrics computed directly from rows (§2.1 Data that tells the truth)
  const metrics = useMemo(() => {
    const total = employees.length;
    const active = employees.filter((e) => e.status === "Đang làm việc").length;
    const fieldTrip = employees.filter(
      (e) => e.status === "Đi công tác",
    ).length;
    const onLeave = employees.filter((e) => e.status === "Nghỉ phép").length;
    const paused = employees.filter((e) => e.status === "Tạm ngưng").length;

    console.assert(
      active + fieldTrip + onLeave + paused === total,
      "Employee status counts must sum to total headcount",
    );

    const totalWorkDays = employees.reduce(
      (sum, e) => sum + e.workDaysMonth,
      0,
    );
    const totalTargetDays = employees.reduce(
      (sum, e) => sum + e.targetDaysMonth,
      0,
    );
    const totalMonthlyPayroll = employees.reduce(
      (sum, e) => sum + e.dailyRate * e.workDaysMonth,
      0,
    );
    const activeProjectsCount = new Set(
      employees
        .filter((e) => e.status !== "Tạm ngưng")
        .map((e) => e.projectAssignment),
    ).size;

    const deptBreakdown = DEPARTMENT_OPTIONS.map((dept, index) => {
      const count = employees.filter((e) => e.department === dept).length;
      const share = total > 0 ? Math.round((count / total) * 1000) / 10 : 0;
      return {
        department: dept,
        count,
        share,
        color: DEPT_COLORS[index % DEPT_COLORS.length],
      };
    }).filter((item) => item.count > 0);

    return {
      total,
      active,
      fieldTrip,
      onLeave,
      paused,
      workingTotal: active + fieldTrip,
      totalWorkDays,
      totalTargetDays,
      totalMonthlyPayroll,
      activeProjectsCount,
      deptBreakdown,
    };
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    const q = searchQuery.trim().toLocaleLowerCase("vi");
    const filtered = employees.filter((emp) => {
      const matchesStatus =
        statusFilter === "Tất cả" || emp.status === statusFilter;
      const matchesDept =
        departmentFilter === "Tất cả" || emp.department === departmentFilter;
      const matchesQuery =
        !q ||
        `${emp.code} ${emp.fullName} ${emp.role} ${emp.department} ${emp.projectAssignment} ${emp.phone} ${emp.email}`
          .toLocaleLowerCase("vi")
          .includes(q);
      return matchesStatus && matchesDept && matchesQuery;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "dailyRate") return b.dailyRate - a.dailyRate;
      if (sortBy === "workDays") return b.workDaysMonth - a.workDaysMonth;
      return a.code.localeCompare(b.code);
    });
  }, [employees, searchQuery, statusFilter, departmentFilter, sortBy]);

  const filteredPayrollSum = useMemo(
    () =>
      filteredEmployees.reduce(
        (sum, emp) => sum + emp.dailyRate * emp.workDaysMonth,
        0,
      ),
    [filteredEmployees],
  );

  const openCreateModal = () => {
    setEditingEmployee(null);
    setCode(suggestNextEmployeeCode(employees));
    setCodeError("");
    setFullName("");
    setRole("Kỹ sư hiện trường");
    setDepartment(DEPARTMENT_OPTIONS[0]);
    setProjectAssignment(PROJECT_ASSIGNMENT_OPTIONS[0]);
    setPhone("");
    setEmail("");
    setDailyRate("980000");
    setWorkDaysMonth("24");
    setTargetDaysMonth("26");
    setStatus("Đang làm việc");
    setJoinedDate(new Date().toISOString().slice(0, 10));
    setNote("");
    setIsFormOpen(true);
  };

  const openEditModal = (emp: EmployeeItem) => {
    setEditingEmployee(emp);
    setCode(emp.code);
    setCodeError("");
    setFullName(emp.fullName);
    setRole(emp.role);
    setDepartment(emp.department);
    setProjectAssignment(emp.projectAssignment);
    setPhone(emp.phone);
    setEmail(emp.email);
    setDailyRate(String(emp.dailyRate));
    setWorkDaysMonth(String(emp.workDaysMonth));
    setTargetDaysMonth(String(emp.targetDaysMonth));
    setStatus(emp.status);
    setJoinedDate(emp.joinedDate);
    setNote(emp.note ?? "");
    setIsFormOpen(true);
  };

  const handleSaveEmployee = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = fullName.trim();
    const normalizedCode = code.trim().toUpperCase();

    if (!trimmedName) {
      toast.error("Vui lòng nhập họ và tên nhân sự.");
      return;
    }

    const isDuplicateCode = employees.some(
      (item) =>
        item.code.toUpperCase() === normalizedCode &&
        item.id !== editingEmployee?.id,
    );
    if (isDuplicateCode) {
      setCodeError("Mã nhân sự đã tồn tại trong sổ định biên.");
      return;
    }

    const parsedRate = Math.max(0, Number(dailyRate) || 0);
    const parsedTargetDays = Math.max(1, Math.min(31, Number(targetDaysMonth) || 26));
    const parsedWorkDays =
      status === "Tạm ngưng"
        ? 0
        : Math.max(0, Math.min(parsedTargetDays, Number(workDaysMonth) || 0));

    const payload: Omit<EmployeeItem, "id"> = {
      code: normalizedCode || suggestNextEmployeeCode(employees),
      fullName: trimmedName,
      role: role.trim() || "Kỹ sư hiện trường",
      department,
      projectAssignment,
      phone: phone.trim() || "Chưa cập nhật",
      email:
        email.trim().toLowerCase() ||
        `${normalizedCode.toLowerCase()}@constructfriendly.vn`,
      dailyRate: parsedRate,
      workDaysMonth: parsedWorkDays,
      targetDaysMonth: parsedTargetDays,
      status,
      joinedDate: joinedDate || new Date().toISOString().slice(0, 10),
      note: note.trim() || undefined,
    };

    if (editingEmployee) {
      const next = employees.map((item) =>
        item.id === editingEmployee.id ? { ...payload, id: item.id } : item,
      );
      persistEmployees(next);
      toast.success(`Đã cập nhật hồ sơ nhân sự "${trimmedName}"`);
    } else {
      const nextId =
        employees.reduce((max, item) => Math.max(max, item.id), 0) + 1;
      persistEmployees([{ id: nextId, ...payload }, ...employees]);
      toast.success(`Đã thêm "${trimmedName}" vào danh sách nhân sự`);
    }

    setIsFormOpen(false);
    setEditingEmployee(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingEmployee) return;
    const targetName = deletingEmployee.fullName;
    const next = employees.filter((item) => item.id !== deletingEmployee.id);
    persistEmployees(next);
    setDeletingEmployee(null);
    toast.success(`Đã xóa nhân sự "${targetName}" khỏi danh sách`);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("Tất cả");
    setDepartmentFilter("Tất cả");
    setSortBy("code");
  };

  return (
    <section className="um-ledger" aria-label="Quản lý danh bạ nhân sự">
      {/* Page Title & One Finding (§2.2, §4.3) */}
      <header className="um-header">
        <div className="um-title-group">
          <h1>Danh bạ & Định biên Nhân sự</h1>
          <p className="um-finding">
            <strong>
              {metrics.workingTotal}/{metrics.total} kỹ sư & đội trưởng
            </strong>{" "}
            đang điều phối tại {metrics.activeProjectsCount} dự án ·{" "}
            {metrics.onLeave} người nghỉ phép có đơn và {metrics.paused} hồ sơ
            tạm ngưng.
          </p>
        </div>

        <div className="um-header-actions">
          <span className="um-stamp">Cập nhật {lastUpdated}</span>
          <button
            type="button"
            className="um-btn-primary"
            onClick={openCreateModal}
          >
            <Plus size={15} />
            Thêm nhân sự
          </button>
        </div>
      </header>

      {/* Divided 4-Cell KPI Strip (§5: one container split by 1px hairlines, no icons, no sparklines) */}
      <div
        className="um-kpi-strip"
        role="region"
        aria-label="Chỉ số định biên nhân sự"
      >
        <button
          type="button"
          className={`um-kpi-cell ${statusFilter === "Tất cả" ? "is-selected" : ""}`}
          onClick={() => setStatusFilter("Tất cả")}
        >
          <span className="um-kpi-label">Tổng nhân sự định biên</span>
          <span className="um-kpi-value is-lead">
            {metrics.total}
            <span className="um-kpi-unit">người</span>
          </span>
          <span className="um-kpi-delta">
            Phân bổ tại {DEPARTMENT_OPTIONS.length} phòng ban chuyên môn
          </span>
        </button>

        <button
          type="button"
          className={`um-kpi-cell ${statusFilter === "Đang làm việc" ? "is-selected" : ""}`}
          onClick={() =>
            setStatusFilter(
              statusFilter === "Đang làm việc" ? "Tất cả" : "Đang làm việc",
            )
          }
        >
          <span className="um-kpi-label">Đang trực tại công trường</span>
          <span className="um-kpi-value">
            {metrics.active}
            <span className="um-kpi-unit">/ {metrics.total}</span>
          </span>
          <span className="um-kpi-delta">
            <span className="is-good">+{metrics.fieldTrip} đi công tác</span>{" "}
            ngoài hiện trường
          </span>
        </button>

        <button
          type="button"
          className={`um-kpi-cell ${statusFilter === "Nghỉ phép" ? "is-selected" : ""}`}
          onClick={() =>
            setStatusFilter(
              statusFilter === "Nghỉ phép" ? "Tất cả" : "Nghỉ phép",
            )
          }
        >
          <span className="um-kpi-label">Ngày công tích lũy tháng 10</span>
          <span className="um-kpi-value">
            {metrics.totalWorkDays}
            <span className="um-kpi-unit">/ {metrics.totalTargetDays} công</span>
          </span>
          <span className="um-kpi-delta">
            Đạt{" "}
            {metrics.totalTargetDays > 0
              ? Math.round(
                  (metrics.totalWorkDays / metrics.totalTargetDays) * 100,
                )
              : 0}
            % kế hoạch định biên tháng
          </span>
        </button>

        <div className="um-kpi-cell" style={{ cursor: "default" }}>
          <span className="um-kpi-label">Quỹ lương công trường tạm tính</span>
          <span className="um-kpi-value">
            {formatVnd(metrics.totalMonthlyPayroll)}
          </span>
          <span className="um-kpi-delta">
            Tổng hợp trực tiếp từ {metrics.totalWorkDays} ngày công thực tế
          </span>
        </div>
      </div>

      {/* Signature Element: 100% Stacked Bar of Department Allocation (§2.3, §6.1) */}
      <div className="um-allocation-card">
        <div className="um-allocation-head">
          <h2 className="um-allocation-title">
            Cơ cấu nhân lực theo phòng ban & ban chỉ huy
          </h2>
          <span className="um-allocation-meta">
            Nhấn vào bộ phận để lọc danh sách ({metrics.total} nhân sự)
          </span>
        </div>

        <div className="um-stacked-bar" role="img" aria-label="Tỷ trọng nhân sự theo bộ phận">
          {metrics.deptBreakdown.map((item) => (
            <div
              key={item.department}
              className="um-stacked-segment"
              style={{
                width: `${item.share}%`,
                backgroundColor: item.color,
              }}
              title={`${item.department}: ${item.count} người (${item.share}%)`}
            />
          ))}
        </div>

        <div className="um-dept-legend">
          {metrics.deptBreakdown.map((item) => {
            const active = departmentFilter === item.department;
            return (
              <button
                key={item.department}
                type="button"
                className={`um-dept-chip ${active ? "is-active" : ""}`}
                onClick={() =>
                  setDepartmentFilter(active ? "Tất cả" : item.department)
                }
              >
                <span
                  className="um-dept-dot"
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.department}</span>
                <strong>{item.count}</strong>
                <span>({item.share}%)</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Ledger Table Panel (§7) */}
      <div className="um-panel">
        <div className="um-toolbar">
          <div className="um-toolbar-left">
            <label className="um-search">
              <Search size={14} />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Tìm tên, mã NV, dự án, SĐT, email..."
                aria-label="Tìm kiếm nhân sự"
              />
            </label>

            <select
              className="um-select"
              value={departmentFilter}
              onChange={(event) => setDepartmentFilter(event.target.value)}
              aria-label="Lọc theo phòng ban"
            >
              <option value="Tất cả">Tất cả phòng ban</option>
              {DEPARTMENT_OPTIONS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            <select
              className="um-select"
              value={sortBy}
              onChange={(event) =>
                setSortBy(
                  event.target.value as "code" | "dailyRate" | "workDays",
                )
              }
              aria-label="Sắp xếp theo"
            >
              <option value="code">Sắp xếp: Mã nhân sự</option>
              <option value="workDays">Sắp xếp: Ngày công cao nhất</option>
              <option value="dailyRate">Sắp xếp: Đơn giá / ngày</option>
            </select>
          </div>

          <div className="um-status-tabs" role="tablist" aria-label="Lọc trạng thái">
            {(["Tất cả", ...EMPLOYEE_STATUS_OPTIONS] as const).map((st) => {
              const count =
                st === "Tất cả"
                  ? employees.length
                  : employees.filter((e) => e.status === st).length;
              return (
                <button
                  key={st}
                  type="button"
                  role="tab"
                  aria-selected={statusFilter === st}
                  className={`um-status-tab ${statusFilter === st ? "is-active" : ""}`}
                  onClick={() => setStatusFilter(st)}
                >
                  {st} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Honest Empty State Inside Frame (§11) */}
        {filteredEmployees.length === 0 ? (
          <div className="um-empty-box">
            <span>
              Không có nhân sự nào khớp bộ lọc hiện tại (
              {searchQuery || departmentFilter !== "Tất cả" || statusFilter !== "Tất cả"
                ? "đang áp dụng bộ lọc tìm kiếm"
                : "danh sách trống"}
              ).
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="um-btn-secondary"
                onClick={resetFilters}
              >
                <RotateCcw size={13} />
                Đặt lại bộ lọc
              </button>
              <button
                type="button"
                className="um-btn-primary"
                onClick={openCreateModal}
              >
                <Plus size={14} />
                Thêm nhân sự mới
              </button>
            </div>
          </div>
        ) : (
          <div className="um-table-wrap">
            <table className="um-table">
              <thead>
                <tr>
                  <th>Nhân sự & Liên hệ</th>
                  <th>Chức vụ & Phòng ban</th>
                  <th>Dự án điều phối</th>
                  <th className="is-num">Ngày công tháng</th>
                  <th className="is-num">Đơn giá / ngày</th>
                  <th className="is-num">Lương tạm tính</th>
                  <th>Trạng thái</th>
                  <th className="is-num">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp, idx) => {
                  const ratio =
                    emp.targetDaysMonth > 0
                      ? Math.min(
                          100,
                          Math.round(
                            (emp.workDaysMonth / emp.targetDaysMonth) * 100,
                          ),
                        )
                      : 0;
                  const monthlyTotal = emp.dailyRate * emp.workDaysMonth;

                  return (
                    <tr key={emp.id}>
                      <td>
                        <div className="um-identity">
                          <span className={`um-avatar hue-${idx % 5}`}>
                            {getInitials(emp.fullName)}
                          </span>
                          <div className="um-identity-text">
                            <div className="um-name-line">
                              <span className="um-name">{emp.fullName}</span>
                              <span className="um-code">{emp.code}</span>
                            </div>
                            <span className="um-subline">
                              {emp.phone} · {emp.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="um-name">{emp.role}</div>
                        <span className="um-subline">{emp.department}</span>
                      </td>

                      <td>
                        <div className="um-name">{emp.projectAssignment}</div>
                        <span className="um-subline">
                          {emp.note ? emp.note : `Gia nhập ${emp.joinedDate}`}
                        </span>
                      </td>

                      <td className="is-num">
                        <div className="um-workdays-cell">
                          <span>
                            <strong>{emp.workDaysMonth}</strong>
                            <span style={{ color: "var(--muted)" }}>
                              {" "}
                              / {emp.targetDaysMonth} công
                            </span>
                          </span>
                          <div className="um-workdays-track">
                            <div
                              className={`um-workdays-fill ${
                                emp.workDaysMonth === 0 ? "is-zero" : ""
                              }`}
                              style={{ width: `${ratio}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="is-num">{formatVnd(emp.dailyRate)}</td>

                      <td className="is-num">
                        {monthlyTotal > 0 ? (
                          <strong>{formatVnd(monthlyTotal)}</strong>
                        ) : (
                          <span style={{ color: "var(--muted)" }}>0 ₫</span>
                        )}
                      </td>

                      <td>
                        <span
                          className={`um-pill ${getStatusPillClass(emp.status)}`}
                        >
                          {emp.status}
                        </span>
                      </td>

                      <td className="is-num">
                        <div className="um-row-actions">
                          <button
                            type="button"
                            className="um-action-btn"
                            onClick={() => openEditModal(emp)}
                            aria-label={`Sửa thông tin ${emp.fullName}`}
                          >
                            <Pencil size={13} />
                            Sửa
                          </button>
                          <button
                            type="button"
                            className="um-action-btn is-danger"
                            onClick={() => setDeletingEmployee(emp)}
                            aria-label={`Xóa ${emp.fullName}`}
                          >
                            <Trash2 size={13} />
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <footer className="um-table-footer">
          <span>
            Hiển thị <strong>1–{filteredEmployees.length}</strong> trên tổng số{" "}
            <strong>{employees.length}</strong> hồ sơ nhân sự
          </span>
          <span>
            Tổng lương tạm tính theo danh sách hiển thị:{" "}
            <strong>{formatVnd(filteredPayrollSum)}</strong>
          </span>
        </footer>
      </div>

      {/* Create / Edit Employee Modal (§8.1) */}
      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsFormOpen(false);
            setEditingEmployee(null);
            setCodeError("");
          }
        }}
      >
        <DialogContent className="max-h-[calc(100vh-2rem)] max-w-[620px] overflow-y-auto rounded-[8px] border border-[#e4e3df] bg-white p-0 shadow-lg">
          <DialogHeader className="border-b border-[#efeeea] px-6 py-4 text-left">
            <DialogTitle className="text-[18px] font-semibold text-[#111111]">
              {editingEmployee
                ? `Cập nhật hồ sơ · ${editingEmployee.code}`
                : "Thêm nhân sự công trường mới"}
            </DialogTitle>
            <DialogDescription className="mt-1 text-[13px] text-[#575a5e]">
              Điền thông tin định biên, dự án điều phối và đơn giá ngày công để
              đồng bộ trực tiếp vào bảng lương tạm tính.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEmployee} className="um-modal-form">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="um-field sm:col-span-2">
                <label htmlFor="um-fullname">Họ và tên nhân sự</label>
                <input
                  id="um-fullname"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="VD: KS. Nguyễn Văn Nam"
                  required
                />
              </div>

              <div className="um-field">
                <label htmlFor="um-code">Mã định danh</label>
                <input
                  id="um-code"
                  value={code}
                  onChange={(event) => {
                    setCode(event.target.value.toUpperCase());
                    setCodeError("");
                  }}
                  placeholder="CF-NV09"
                  required
                />
                {codeError && (
                  <p className="um-field-error" role="alert">
                    {codeError}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="um-field">
                <label htmlFor="um-role">Chức vụ chuyên môn</label>
                <input
                  id="um-role"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  placeholder="VD: Kỹ sư Giám sát Kết cấu"
                  required
                />
              </div>

              <div className="um-field">
                <label htmlFor="um-department">Phòng ban / Bộ phận</label>
                <select
                  id="um-department"
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                >
                  {DEPARTMENT_OPTIONS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="um-field">
                <label htmlFor="um-project">Dự án điều phối hiện tại</label>
                <select
                  id="um-project"
                  value={projectAssignment}
                  onChange={(event) => setProjectAssignment(event.target.value)}
                >
                  {PROJECT_ASSIGNMENT_OPTIONS.map((proj) => (
                    <option key={proj} value={proj}>
                      {proj}
                    </option>
                  ))}
                </select>
              </div>

              <div className="um-field">
                <label htmlFor="um-status">Trạng thái công tác</label>
                <select
                  id="um-status"
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as EmployeeStatus)
                  }
                >
                  {EMPLOYEE_STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="um-field">
                <label htmlFor="um-phone">Số điện thoại liên hệ</label>
                <input
                  id="um-phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="0903 128 456"
                  required
                />
              </div>

              <div className="um-field">
                <label htmlFor="um-email">Email công việc</label>
                <input
                  id="um-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="ten.ho@constructfriendly.vn"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="um-field">
                <label htmlFor="um-rate">Đơn giá / ngày (VNĐ)</label>
                <input
                  id="um-rate"
                  type="number"
                  min={0}
                  step={10000}
                  value={dailyRate}
                  onChange={(event) => setDailyRate(event.target.value)}
                  required
                />
              </div>

              <div className="um-field">
                <label htmlFor="um-workdays">Ngày công thực tế</label>
                <input
                  id="um-workdays"
                  type="number"
                  min={0}
                  max={31}
                  value={workDaysMonth}
                  onChange={(event) => setWorkDaysMonth(event.target.value)}
                  required
                />
              </div>

              <div className="um-field">
                <label htmlFor="um-targetdays">Định biên công / tháng</label>
                <input
                  id="um-targetdays"
                  type="number"
                  min={1}
                  max={31}
                  value={targetDaysMonth}
                  onChange={(event) => setTargetDaysMonth(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="um-field">
              <label htmlFor="um-note">
                Ghi chú chứng chỉ / Nhiệm vụ cụ thể
              </label>
              <textarea
                id="um-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="VD: Chứng chỉ giám sát hạng I, phụ trách nghiệm thu cốt thép Block A..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[#efeeea] pt-4">
              <button
                type="button"
                className="um-btn-secondary"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingEmployee(null);
                }}
              >
                Hủy bỏ
              </button>
              <button type="submit" className="um-btn-primary">
                {editingEmployee ? "Lưu thay đổi" : "Thêm vào danh bạ"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Destructive Action Confirmation Dialog (§8.2) */}
      <Dialog
        open={Boolean(deletingEmployee)}
        onOpenChange={(open) => {
          if (!open) setDeletingEmployee(null);
        }}
      >
        <DialogContent className="max-w-[440px] rounded-[8px] border border-[#e4e3df] bg-white p-6 shadow-lg">
          <DialogHeader className="text-left">
            <DialogTitle className="text-[17px] font-semibold text-[#111111]">
              Xác nhận xóa hồ sơ nhân sự
            </DialogTitle>
            <DialogDescription className="mt-2 text-[13px] leading-5 text-[#575a5e]">
              Bạn sắp xóa hồ sơ của{" "}
              <strong className="text-[#111111]">
                {deletingEmployee?.fullName} ({deletingEmployee?.code})
              </strong>{" "}
              khỏi sổ định biên công trường. Quỹ lương tạm tính ({formatVnd(
                (deletingEmployee?.dailyRate ?? 0) *
                  (deletingEmployee?.workDaysMonth ?? 0),
              )}
              ) sẽ được khấu trừ tương ứng.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 flex items-center justify-end gap-2">
            <button
              type="button"
              className="um-btn-secondary"
              onClick={() => setDeletingEmployee(null)}
            >
              Giữ lại hồ sơ
            </button>
            <button
              type="button"
              className="um-btn-primary"
              style={{
                backgroundColor: "#c4242a",
                borderColor: "#c4242a",
              }}
              onClick={handleConfirmDelete}
            >
              Xóa vĩnh viễn
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

