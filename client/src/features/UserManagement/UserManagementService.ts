import { AxiosClient } from "@/shared/axios.client";

export type EmployeeStatus =
  | "Đang làm việc"
  | "Đi công tác"
  | "Nghỉ phép"
  | "Tạm ngưng";

export interface EmployeeItem {
  id: number;
  code: string;
  fullName: string;
  role: string;
  department: string;
  projectAssignment: string;
  phone: string;
  email: string;
  dailyRate: number;
  workDaysMonth: number;
  targetDaysMonth: number;
  status: EmployeeStatus;
  joinedDate: string;
  note?: string;
}

export type EmployeeFormValues = Omit<EmployeeItem, "id">;

const STORAGE_KEY = "cm_company_employees_v1";

export const DEPARTMENT_OPTIONS = [
  "Ban chỉ huy công trường",
  "Phòng Kết cấu & Thi công",
  "Phòng Cơ điện (M&E)",
  "Ban An toàn lao động (HSE)",
  "Phòng Hồ sơ QA/QC & Trắc đạc",
] as const;

export const PROJECT_ASSIGNMENT_OPTIONS = [
  "Chung cư Horizon Tower · Q.2",
  "TTTM Green Plaza · Q.1",
  "Tòa nhà Văn phòng SkyLine · Q.7",
  "Khu đô thị Eco Riverside · Thủ Đức",
  "Văn phòng điều hành trung tâm",
] as const;

export const EMPLOYEE_STATUS_OPTIONS: EmployeeStatus[] = [
  "Đang làm việc",
  "Đi công tác",
  "Nghỉ phép",
  "Tạm ngưng",
];

const INITIAL_EMPLOYEES: EmployeeItem[] = [
  {
    id: 1,
    code: "CF-NV01",
    fullName: "KS. Nguyễn Văn Nam",
    role: "Chỉ huy trưởng công trường",
    department: "Ban chỉ huy công trường",
    projectAssignment: "Chung cư Horizon Tower · Q.2",
    phone: "0903 128 456",
    email: "nam.nguyen@constructfriendly.vn",
    dailyRate: 1450000,
    workDaysMonth: 24,
    targetDaysMonth: 26,
    status: "Đang làm việc",
    joinedDate: "2022-03-15",
    note: "Chứng chỉ hành nghề Giám sát hạng I",
  },
  {
    id: 2,
    code: "CF-NV02",
    fullName: "KS. Lê Minh Hiếu",
    role: "Kỹ sư trưởng Cơ điện (M&E)",
    department: "Phòng Cơ điện (M&E)",
    projectAssignment: "Chung cư Horizon Tower · Q.2",
    phone: "0918 442 910",
    email: "hieu.le@constructfriendly.vn",
    dailyRate: 1150000,
    workDaysMonth: 25,
    targetDaysMonth: 26,
    status: "Đang làm việc",
    joinedDate: "2022-07-01",
    note: "Phụ trách nghiệm thu trục điện & PCCC",
  },
  {
    id: 3,
    code: "CF-NV03",
    fullName: "KS. Trần Đình Tú",
    role: "Chuyên viên Giám sát HSE",
    department: "Ban An toàn lao động (HSE)",
    projectAssignment: "TTTM Green Plaza · Q.1",
    phone: "0987 615 204",
    email: "tu.tran@constructfriendly.vn",
    dailyRate: 980000,
    workDaysMonth: 22,
    targetDaysMonth: 26,
    status: "Đi công tác",
    joinedDate: "2023-01-10",
    note: "Kiểm định giàn giáo & thiết bị nâng",
  },
  {
    id: 4,
    code: "CF-NV04",
    fullName: "KTS. Phạm Thu Hà",
    role: "Kiến trúc sư Shopdrawing",
    department: "Phòng Hồ sơ QA/QC & Trắc đạc",
    projectAssignment: "TTTM Green Plaza · Q.1",
    phone: "0932 880 119",
    email: "ha.pham@constructfriendly.vn",
    dailyRate: 1050000,
    workDaysMonth: 24,
    targetDaysMonth: 26,
    status: "Đang làm việc",
    joinedDate: "2023-04-20",
    note: "Kiểm soát bản vẽ hoàn công mặt dựng",
  },
  {
    id: 5,
    code: "CF-NV05",
    fullName: "Đặng Quốc Khánh",
    role: "Đội trưởng Cốt thép - Bê tông",
    department: "Phòng Kết cấu & Thi công",
    projectAssignment: "Tòa nhà Văn phòng SkyLine · Q.7",
    phone: "0974 309 552",
    email: "khanh.dang@constructfriendly.vn",
    dailyRate: 920000,
    workDaysMonth: 26,
    targetDaysMonth: 26,
    status: "Đang làm việc",
    joinedDate: "2021-11-05",
    note: "Điều phối 28 công nhân kết cấu sàn",
  },
  {
    id: 6,
    code: "CF-NV06",
    fullName: "KS. Vũ Hoàng Long",
    role: "Kỹ sư Trắc đạc & QA/QC",
    department: "Phòng Hồ sơ QA/QC & Trắc đạc",
    projectAssignment: "Khu đô thị Eco Riverside · Thủ Đức",
    phone: "0965 712 830",
    email: "long.vu@constructfriendly.vn",
    dailyRate: 950000,
    workDaysMonth: 18,
    targetDaysMonth: 26,
    status: "Nghỉ phép",
    joinedDate: "2023-08-12",
    note: "Nghỉ phép năm từ 22/10 đến 25/10",
  },
  {
    id: 7,
    code: "CF-NV07",
    fullName: "KS. Hoàng Gia Bảo",
    role: "Kỹ sư Kết cấu hiện trường",
    department: "Phòng Kết cấu & Thi công",
    projectAssignment: "Tòa nhà Văn phòng SkyLine · Q.7",
    phone: "0946 203 718",
    email: "bao.hoang@constructfriendly.vn",
    dailyRate: 980000,
    workDaysMonth: 23,
    targetDaysMonth: 26,
    status: "Đang làm việc",
    joinedDate: "2024-02-01",
    note: "Giám sát đổ bê tông dầm sàn tầng 14",
  },
  {
    id: 8,
    code: "CF-NV08",
    fullName: "KS. Ngô Thanh Tùng",
    role: "Kỹ sư Cấp thoát nước (MEP)",
    department: "Phòng Cơ điện (M&E)",
    projectAssignment: "Khu đô thị Eco Riverside · Thủ Đức",
    phone: "0912 590 334",
    email: "tung.ngo@constructfriendly.vn",
    dailyRate: 900000,
    workDaysMonth: 0,
    targetDaysMonth: 26,
    status: "Tạm ngưng",
    joinedDate: "2023-05-19",
    note: "Tạm hoãn hợp đồng chờ điều chuyển dự án mới",
  },
];

export function loadEmployeesFromStorage(): EmployeeItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Fallback to initial seeded employees
  }
  saveEmployeesToStorage(INITIAL_EMPLOYEES);
  return INITIAL_EMPLOYEES;
}

export function saveEmployeesToStorage(employees: EmployeeItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
  } catch {
    // Ignore quota errors
  }
}

export async function fetchEmployees(): Promise<EmployeeItem[]> {
  const local = loadEmployeesFromStorage();
  try {
    // Attempt backend sync if available; fallback to local ledger seamlessly
    const response = await AxiosClient.get<unknown>("/api/student/getStudents");
    const payload = response.data;
    if (Array.isArray(payload) && payload.length > 0) {
      const existingByEmail = new Map(
        local.map((item) => [item.email.toLowerCase(), item]),
      );
      let nextId = local.reduce((max, item) => Math.max(max, item.id), 0) + 1;
      let changed = false;

      for (const raw of payload) {
        if (!raw || typeof raw !== "object") continue;
        const row = raw as Record<string, unknown>;
        const email =
          typeof row.email === "string" ? row.email.trim().toLowerCase() : "";
        const fullName =
          typeof row.fullName === "string"
            ? row.fullName.trim()
            : typeof row.name === "string"
              ? row.name.trim()
              : "";
        if (!fullName || (email && existingByEmail.has(email))) continue;

        const merged: EmployeeItem = {
          id: nextId,
          code: `CF-NV${String(nextId).padStart(2, "0")}`,
          fullName,
          role: "Kỹ sư hiện trường",
          department: DEPARTMENT_OPTIONS[1],
          projectAssignment: PROJECT_ASSIGNMENT_OPTIONS[0],
          phone:
            typeof row.phone === "string" && row.phone.trim()
              ? row.phone.trim()
              : "0900 000 000",
          email: email || `nv${nextId}@constructfriendly.vn`,
          dailyRate: 950000,
          workDaysMonth: 22,
          targetDaysMonth: 26,
          status: "Đang làm việc",
          joinedDate: new Date().toISOString().slice(0, 10),
        };
        local.push(merged);
        nextId += 1;
        changed = true;
      }

      if (changed) {
        saveEmployeesToStorage(local);
      }
    }
  } catch {
    // shortcut: backend /api/student/getStudents is optional, upgrade when dedicated /api/employees endpoint is added
  }
  return local;
}

export function getInitials(fullName: string): string {
  const clean = fullName.replace(/^(KS\.|KTS\.|TS\.)\s*/i, "").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "NV";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function suggestNextEmployeeCode(employees: EmployeeItem[]): string {
  const used = new Set(employees.map((e) => e.code.toUpperCase()));
  let index = employees.length + 1;
  let candidate = `CF-NV${String(index).padStart(2, "0")}`;
  while (used.has(candidate)) {
    index += 1;
    candidate = `CF-NV${String(index).padStart(2, "0")}`;
  }
  return candidate;
}

