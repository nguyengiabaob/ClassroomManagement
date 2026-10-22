import { AxiosClient } from "../../shared/axios.client";

// ==================== MODELS & DTOs (from IFileService & NestJS FileService) ====================

/**
 * Kiểu đối tượng File trả về từ máy chủ (Prisma File model)
 */
export interface FileData {
  id: number;
  key?: string;
  fileName: string;
  originalName?: string | null;
  mimeType?: string | null;
  size?: number | null;
  url?: string | null;
  description?: string | null;
  projectId: number;
  taskId?: number | null;
  uploadedBy: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Cấu trúc phân trang danh sách tệp trả về từ API getFiles
 */
export interface FileListData {
  data: FileData[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * Query parameters cho API getFiles
 */
export interface FileListQuery {
  projectId?: number;
  taskId?: number;
  search?: string;
  mimeType?: string;
  uploadedBy?: number;
  page?: number;
  pageSize?: number;
}

/**
 * Alias cho FileListQuery
 */
export type GetFilesParams = FileListQuery;

/**
 * Dữ liệu payload tạo file (Dùng cho createFile)
 */
export interface CreateFileData {
  projectId: number;
  taskId?: number;
  folder?: string;
  fileName?: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
  url?: string;
  description?: string;
}

/**
 * Payload mở rộng cho client khi tải file lên (kèm đối tượng File từ input)
 */
export interface CreateFilePayload {
  file?: File;
  projectId?: number;
  taskId?: number;
  folder?: string;
  fileName?: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
  url?: string;
  description?: string;
}

/**
 * Dữ liệu cập nhật file (Dùng cho updateFile)
 */
export interface UpdateFileData {
  fileName?: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
  url?: string;
  description?: string;
  taskId?: number;
  folder?: string;
  projectId?: number;
}

/**
 * Dữ liệu trả về khi tạo / cập nhật thư mục
 */
export interface FolderData {
  path: string;
}

// ==================== UI VIEW MODELS ====================

export type fileKind = "drawing" | "pdf" | "folder";

export interface fileItem {
  id: number;
  name: string;
  kind: fileKind;
  owner: string;
  initials: string;
  ownerTone: "teal" | "amber" | "slate";
  modified: string;
  size: string;
  url?: string | null;
  description?: string | null;
  projectId?: number;
  taskId?: number | null;
  folder?: string;
  path?: string;
  mimeType?: string | null;
  originalName?: string | null;
}

// ==================== UTILITY HELPERS ====================

export const formatFileSize = (bytes?: number | null): string => {
  if (bytes === undefined || bytes === null || isNaN(bytes)) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const getFileKind = (name?: string | null, mimeType?: string | null): fileKind => {
  const ext = name?.split(".").pop()?.toLowerCase() || "";
  const mime = mimeType?.toLowerCase() || "";
  if (mime.includes("pdf") || ext === "pdf") return "pdf";
  if (
    ext === "dwg" ||
    ext === "dxf" ||
    ext === "cad" ||
    mime.includes("cad") ||
    mime.includes("dwg")
  ) {
    return "drawing";
  }
  return "drawing";
};

export const getFileDownloadUrl = (url?: string | null): string => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const baseUrl = "https://techserver.longdainam.com";
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
};

export const normalizeFileItem = (
  raw: FileData | fileItem | Record<string, unknown>,
): fileItem => {
  if (!raw) {
    return {
      id: 0,
      name: "Không tên",
      kind: "drawing",
      owner: "Hệ thống",
      initials: "HT",
      ownerTone: "teal",
      modified: "Hôm nay",
      size: "-",
    };
  }

  const item = raw as Partial<FileData & fileItem>;
  const name =
    item.fileName || item.originalName || item.name || "Tài liệu";

  const owner =
    item.owner ||
    (item.uploadedBy ? `Người dùng #${item.uploadedBy}` : "Ban Quản Lý");

  const initials =
    item.initials ||
    owner
      .split(" ")
      .filter(Boolean)
      .map((w: string) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    "QL";

  const rawDate = item.modified || item.updatedAt || item.createdAt;
  const modified = rawDate
    ? new Date(rawDate).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Hôm nay";

  const size =
    typeof item.size === "number"
      ? formatFileSize(item.size)
      : typeof item.size === "string"
        ? item.size
        : "-";

  const isFolder =
    item.kind === "folder" ||
    (!item.mimeType && !item.size && !item.url && name.startsWith("Thư mục"));

  const kind: fileKind = isFolder
    ? "folder"
    : item.kind || getFileKind(name, item.mimeType);

  return {
    id: item.id ?? Math.floor(Math.random() * 100000),
    name,
    kind,
    owner,
    initials,
    ownerTone: item.ownerTone || (kind === "folder" ? "amber" : "teal"),
    modified,
    size: kind === "folder" ? "-" : size,
    url: item.url,
    description: item.description,
    projectId: item.projectId,
    taskId: item.taskId,
    folder: item.folder,
    mimeType: item.mimeType,
    originalName: item.originalName,
  };
};

export const extractFileList = (
  resData?: FileListData | FileData[] | fileItem[] | null,
): fileItem[] => {
  if (!resData) return [];
  if (Array.isArray(resData)) {
    return resData.map(normalizeFileItem);
  }
  if (resData && Array.isArray(resData.data)) {
    return resData.data.map(normalizeFileItem);
  }
  return [];
};

// ==================== STRONGLY TYPED APIS ====================

/**
 * GET /api/file/getFiles
 * Lấy danh sách files theo query: projectId, taskId, search, mimeType, uploadedBy, page, pageSize
 * @returns Promise<AxiosResponse<FileListData>>
 */
export const getFiles = async (params?: FileListQuery) => {
  return await AxiosClient.get<FileListData>("/api/file/getFiles", { params });
};

/**
 * GET /api/file/getFile/:id
 * Lấy chi tiết một file theo ID
 * @returns Promise<AxiosResponse<FileData>>
 */
export const getFile = async (id: number) => {
  return await AxiosClient.get<FileData>(`/api/file/getFile/${id}`);
};

/**
 * POST /api/file/createFile
 * Tải lên một file với multipart/form-data
 * @returns Promise<AxiosResponse<FileData>>
 */
export const createFile = async (payload: CreateFilePayload) => {
  const formData = new FormData();
  if (payload.file) {
    formData.append("file", payload.file);
  }
  if (payload.projectId !== undefined && payload.projectId !== null) {
    formData.append("projectId", String(payload.projectId));
  }
  if (payload.taskId !== undefined && payload.taskId !== null) {
    formData.append("taskId", String(payload.taskId));
  }
  if (payload.folder) {
    formData.append("folder", payload.folder);
  }
  if (payload.fileName) {
    formData.append("fileName", payload.fileName);
  }
  if (payload.originalName) {
    formData.append("originalName", payload.originalName);
  }
  if (payload.mimeType) {
    formData.append("mimeType", payload.mimeType);
  }
  if (payload.size !== undefined && payload.size !== null) {
    formData.append("size", String(payload.size));
  }
  if (payload.url) {
    formData.append("url", payload.url);
  }
  if (payload.description) {
    formData.append("description", payload.description);
  }

  return await AxiosClient.post<FileData>("/api/file/createFile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/**
 * POST /api/file/updateFile/:id
 * Cập nhật thông tin file
 * @returns Promise<AxiosResponse<FileData>>
 */
export const updateFile = async (id: number, data: UpdateFileData) => {
  return await AxiosClient.post<FileData>(`/api/file/updateFile/${id}`, data);
};

/**
 * POST /api/file/createFolder
 * Tạo thư mục mới
 * @returns Promise<AxiosResponse<FolderData>>
 */
export const createFolder = async (name: string) => {
  return await AxiosClient.post<FolderData>("/api/file/createFolder", { name });
};

/**
 * POST /api/file/updateFolder
 * Cập nhật / đổi tên thư mục
 * @returns Promise<AxiosResponse<FolderData>>
 */
export const updateFolder = async (oldName: string, newName: string) => {
  return await AxiosClient.post<FolderData>("/api/file/updateFolder", {
    oldName,
    newName,
  });
};

/**
 * POST /api/file/deleteFolder
 * Xóa thư mục
 * @returns Promise<AxiosResponse<void>>
 */
export const deleteFolder = async (name: string) => {
  return await AxiosClient.post<void>("/api/file/deleteFolder", { name });
};

/**
 * POST /api/file/deleteFile/:id
 * Xóa file theo ID
 * @returns Promise<AxiosResponse<void>>
 */
export const deleteFile = async (id: number) => {
  return await AxiosClient.post<void>(`/api/file/deleteFile/${id}`);
};

/**
 * Helper: upload nhiều file cùng lúc
 * @returns Promise<AxiosResponse<FileData>[]>
 */
export const uploadFiles = async (
  files: File[],
  options?: { projectId?: number; folder?: string; taskId?: number },
) => {
  const uploads = files.map((file) =>
    createFile({
      file,
      projectId: options?.projectId ?? 1,
      folder: options?.folder,
      fileName: file.name,
      originalName: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
    }),
  );
  return await Promise.all(uploads);
};
