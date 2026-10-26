import { isAxiosError } from "axios";
import { AxiosClient } from "@/shared/axios.client";
import type { NewProjectValues } from "./AddProjectModal";

export interface CreateProjectData {
  name: string;
  projectCode: string;
  location: string;
  status?: string;
  progress?: number;
  budget?: number;
  expectedPersonnel?: number;
  imageUrl?: string;
}

export interface ListProjects {
  data: ProjectItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ProjectItem {
  id: number;
  projectCode: string;
  name: string;
  location: string;
  status: string;
  progress: number;
  budget: number;
  expectedPersonnel: number;
  image?: string;
  imageUrl?: string;
  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
}

const basePath = "/api/project";
const fallbackImage =
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=85";

function unwrap(value: unknown): unknown {
  if (
    value &&
    typeof value === "object" &&
    "success" in value &&
    value.success === false
  ) {
    throw new Error("Yêu cầu dự án không thành công.");
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if ("data" in record && record.data !== undefined) {
      return record.data;
    }
    if ("project" in record && record.project !== undefined) {
      return record.project;
    }
  }
  return value;
}

export function toProject(value: unknown): ProjectItem {
  if (!value || typeof value !== "object")
    throw new Error("Dữ liệu dự án không hợp lệ.");
  const raw = value as Record<string, unknown>;
  const row =
    raw.project && typeof raw.project === "object"
      ? (raw.project as Record<string, unknown>)
      : raw.data && typeof raw.data === "object" && !Array.isArray(raw.data)
        ? (raw.data as Record<string, unknown>)
        : raw;

  const id = Number(row.id ?? 0);
  const numberValue = (val: unknown) => {
    const number = Number(val ?? 0);
    return Number.isFinite(number) && number >= 0 ? number : 0;
  };
  const budget = numberValue(row.budget);
  const expectedPersonnel = numberValue(
    row.expectedPersonnel ?? row.teamSize ?? row.personnel,
  );
  const progress = Math.min(100, numberValue(row.progress));
  const rawImage =
    typeof row.image === "string" && row.image.trim()
      ? row.image.trim()
      : typeof row.imageUrl === "string" && row.imageUrl.trim()
        ? row.imageUrl.trim()
        : fallbackImage;

  return {
    id,
    projectCode:
      typeof row.projectCode === "string" && row.projectCode.trim()
        ? row.projectCode
        : typeof row.code === "string" && row.code.trim()
          ? row.code
          : `PRJ-${id || "001"}`,
    name:
      typeof row.name === "string" && row.name.trim()
        ? row.name
        : "Dự án chưa đặt tên",
    location:
      typeof row.location === "string" && row.location.trim()
        ? row.location
        : "Chưa cập nhật địa điểm",
    status:
      typeof row.status === "string" && row.status.trim()
        ? row.status
        : "Lập kế hoạch",
    progress,
    budget,
    expectedPersonnel,
    image: rawImage,
    imageUrl: rawImage,
    leftLabel:
      typeof row.leftLabel === "string" && row.leftLabel.trim()
        ? row.leftLabel
        : "Ngân sách dự kiến",
    leftValue:
      typeof row.leftValue === "string" && row.leftValue.trim()
        ? row.leftValue
        : `${new Intl.NumberFormat("vi-VN").format(budget)} VNĐ`,
    rightLabel:
      typeof row.rightLabel === "string" && row.rightLabel.trim()
        ? row.rightLabel
        : "Nhân lực dự kiến",
    rightValue:
      typeof row.rightValue === "string" && row.rightValue.trim()
        ? row.rightValue
        : `${expectedPersonnel} người`,
  };
}

export function toProjectData(values: NewProjectValues): CreateProjectData {
  return {
    name: values.name.trim(),
    projectCode: values.id.trim().toUpperCase(),
    location: values.location.trim(),
    status: values.status,
    progress: values.progress,
    budget: values.budget,
    expectedPersonnel: values.teamSize,
    imageUrl: values.image?.trim() ?? "",
  };
}

export async function getProjects(signal?: AbortSignal): Promise<ListProjects> {
  const data = await AxiosClient.get<ListProjects>(`${basePath}/getProjects`, {
    signal,
  });

  if (!Array.isArray(data.data?.data))
    throw new Error("Danh sách dự án không hợp lệ.");
  return {
    ...data.data,
    data: data.data.data.map(toProject),
  };
}

export async function getProjectById(
  id: string | number,
  signal?: AbortSignal,
): Promise<ProjectItem | undefined> {
  const normalizedId = String(id).trim();
  if (!normalizedId) return undefined;

  try {
    const { data } = await AxiosClient.get<unknown>(
      `${basePath}/getProject/${normalizedId}`,
      { signal },
    );
    const row = unwrap(data);
    if (Array.isArray(row)) {
      const match = row.find(
        (item) =>
          item &&
          typeof item === "object" &&
          (String((item as Record<string, unknown>).id) === normalizedId ||
            String((item as Record<string, unknown>).projectCode ?? "").toLowerCase() ===
              normalizedId.toLowerCase()),
      );
      if (match) return toProject(match);
    } else if (row && typeof row === "object") {
      return toProject(row);
    }
  } catch (error) {
    if (signal?.aborted) throw error;
  }

  try {
    const list = await getProjects(signal);
    return list.data.find(
      (item) =>
        String(item.id) === normalizedId ||
        item.projectCode.toLowerCase() === normalizedId.toLowerCase(),
    );
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return undefined;
    throw error;
  }
}

export async function createProject(data: CreateProjectData): Promise<void> {
  const response = await AxiosClient.post<unknown>(
    `${basePath}/createProject`,
    data,
  );
  unwrap(response.data);
}

export async function updateProject(
  id: number,
  data: CreateProjectData,
): Promise<void> {
  // Assumes the POST update body contains the database ID and editable fields.
  const response = await AxiosClient.post<unknown>(
    `${basePath}/updateProject`,
    { id, ...data },
  );
  unwrap(response.data);
}

export function getProjectError(error: unknown): string {
  if (isAxiosError(error)) {
    const message: unknown = error.response?.data?.message;
    if (typeof message === "string") return message;
    if (
      Array.isArray(message) &&
      message.every((item) => typeof item === "string")
    )
      return message.join(". ");
    return "Không thể kết nối API dự án. Vui lòng thử lại.";
  }
  return error instanceof Error
    ? error.message
    : "Không thể tải dữ liệu dự án.";
}
