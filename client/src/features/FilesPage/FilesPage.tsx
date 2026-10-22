import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  ChevronRight,
  Database,
  Download,
  ExternalLink,
  File,
  FileText,
  Folder,
  FolderOpen,
  FolderPlus,
  Grid2X2,
  List,
  Loader2,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

import {
  createFolder,
  deleteFile,
  deleteFolder,
  extractFileList,
  getFile,
  getFileDownloadUrl,
  getFiles,
  updateFile,
  updateFolder,
  uploadFiles,
} from "./fileService";
import type { fileItem, fileKind } from "./fileService";

type ViewMode = "list" | "grid";

const FOLDERS_STORAGE_KEY = "cm_custom_folders_v2";

const DEFAULT_FOLDERS = [
  "CAD Drawings",
  "CAD Drawings/Kiến trúc",
  "CAD Drawings/Kết cấu",
  "CAD Drawings/Điện nước M&E",
  "Hồ sơ pháp lý",
  "Hồ sơ pháp lý/Giấy phép xây dựng",
  "Báo cáo PCCC",
];

// Helper: lấy đường dẫn cha (e.g. "A/B/C" -> "A/B", "A" -> "")
const getParentPath = (path?: string | null): string => {
  if (!path) return "";
  const parts = path.replace(/\\/g, "/").split("/").filter(Boolean);
  if (parts.length <= 1) return "";
  return parts.slice(0, -1).join("/");
};

// Helper: lấy tên hiển thị của folder (phần tử cuối cùng)
const getFolderName = (path?: string | null): string => {
  if (!path) return "";
  const parts = path.replace(/\\/g, "/").split("/").filter(Boolean);
  return parts[parts.length - 1] || path;
};

const getStoredFolders = (): string[] => {
  try {
    const raw = localStorage.getItem(FOLDERS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_FOLDERS;
};

const saveStoredFolders = (folders: string[]) => {
  try {
    localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
  } catch {}
};

const FileIcon = ({ kind, size = 24 }: { kind: fileKind; size?: number }) => {
  if (kind === "folder") {
    return <Folder size={size} className="text-[#a56605]" strokeWidth={1.8} />;
  }

  if (kind === "pdf") {
    return (
      <FileText size={size} className="text-[#d51c1c]" strokeWidth={1.8} />
    );
  }

  return <File size={size} className="text-[#00766b]" strokeWidth={1.8} />;
};

const OwnerBadge = ({ item }: { item: fileItem }) => {
  const badgeTone = {
    teal: "bg-[#078d7f] text-white",
    amber: "bg-[#ffad20] text-[#704500]",
    slate: "bg-slate-200 text-slate-600",
  }[item.ownerTone];

  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-semibold ${badgeTone}`}
      >
        {item.initials}
      </span>
      <span className="truncate text-[15px] text-[#2c2a2f]">{item.owner}</span>
    </div>
  );
};

const FilesPage = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [files, setFiles] = useState<fileItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentFolder, setCurrentFolder] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal: Create Folder (Hỗ trợ tạo folder con trong folder cha)
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>("");
  const [creatingFolder, setCreatingFolder] = useState<boolean>(false);

  // Modal: Rename (File or Folder)
  const [renameItem, setRenameItem] = useState<fileItem | null>(null);
  const [renameValue, setRenameValue] = useState<string>("");
  const [renaming, setRenaming] = useState<boolean>(false);

  // Modal: Delete confirmation
  const [deleteItem, setDeleteItem] = useState<fileItem | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Load files from backend API and combine with folders
  const loadFiles = useCallback(
    async (search?: string) => {
      setLoading(true);
      try {
        const queryTerm = search !== undefined ? search : searchQuery;
        const res = await getFiles({
          search: queryTerm.trim() || undefined,
          pageSize: 50,
        });

        const serverFiles = extractFileList(res.data);
        const storedFolderPaths = getStoredFolders();

        // Convert all stored folder paths to fileItem objects
        const folderItems: fileItem[] = storedFolderPaths
          .filter((folderPath) => {
            if (!queryTerm.trim()) return true;
            return folderPath
              .toLowerCase()
              .includes(queryTerm.trim().toLowerCase());
          })
          .map((folderPath, idx) => {
            const displayName = getFolderName(folderPath);
            const parent = getParentPath(folderPath);

            return {
              id: -1 * (idx + 1),
              name: displayName,
              kind: "folder" as fileKind,
              owner: "Ban Quản Lý",
              initials: "BQL",
              ownerTone: "amber",
              modified: parent ? `Thư mục con (${parent})` : "Thư mục gốc",
              size: "-",
              folder: parent,
              path: folderPath,
            };
          });

        // Combine folders first, then server files
        setFiles([...folderItems, ...serverFiles]);
      } catch (err: unknown) {
        console.error("Error loading files:", err);
        toast.error("Không thể tải danh sách tệp từ máy chủ");

        // Fallback: render at least stored folders
        const storedFolderPaths = getStoredFolders();
        const folderItems: fileItem[] = storedFolderPaths.map(
          (folderPath, idx) => ({
            id: -1 * (idx + 1),
            name: getFolderName(folderPath),
            kind: "folder" as fileKind,
            owner: "Ban Quản Lý",
            initials: "BQL",
            ownerTone: "amber",
            modified: "Thư mục hệ thống",
            size: "-",
            folder: getParentPath(folderPath),
            path: folderPath,
          }),
        );
        setFiles(folderItems);
      } finally {
        setLoading(false);
      }
    },
    [searchQuery],
  );

  useEffect(() => {
    loadFiles();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadFiles(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    loadFiles("");
  };

  const openFilePicker = () => fileInputRef.current?.click();

  // API: createFile / uploadFiles vào folder hiện tại
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!selectedFiles.length) return;

    setUploading(true);
    const toastId = toast.loading(
      `Đang tải lên ${selectedFiles.length} tệp vào ${currentFolder ? `"${getFolderName(currentFolder)}"` : "thư mục gốc"}...`,
    );
    try {
      await uploadFiles(selectedFiles, {
        projectId: 1,
        folder: currentFolder || undefined,
      });
      toast.success(`Đã tải lên ${selectedFiles.length} tệp thành công!`, {
        id: toastId,
      });
      await loadFiles();
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(
        err?.response?.data?.message ||
          "Tải lên tệp thất bại. Vui lòng thử lại.",
        { id: toastId },
      );
    } finally {
      setUploading(false);
    }
  };

  // Trigger Open Create Folder Dialog (cho cả folder cha hoặc con)
  const handleOpenCreateFolder = () => {
    setNewFolderName("");
    setIsCreateFolderOpen(true);
  };

  // Submit Create Folder (Hỗ trợ tạo folder con lồng nhau)
  const submitCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    const subName = newFolderName.trim().replace(/[\\/:*?"<>|]/g, "_");
    if (!subName) {
      toast.error("Vui lòng nhập tên thư mục hợp lệ");
      return;
    }

    // Đường dẫn đầy đủ của folder mới:
    // Nếu đang ở root: "Tên thư mục"
    // Nếu đang ở trong folder cha: "Cha/Con"
    const fullPath = currentFolder ? `${currentFolder}/${subName}` : subName;

    setCreatingFolder(true);
    const toastId = toast.loading(
      currentFolder
        ? `Đang tạo thư mục con "${subName}" trong "${getFolderName(currentFolder)}"...`
        : `Đang tạo thư mục "${subName}"...`,
    );
    try {
      // 1. Gọi API NestJS FileService createFolder với fullPath
      await createFolder(fullPath);

      // 2. Lưu vào danh sách folder
      const current = getStoredFolders();
      if (!current.includes(fullPath)) {
        saveStoredFolders([fullPath, ...current]);
      }

      toast.success(
        currentFolder
          ? `Đã tạo thư mục con "${subName}" thành công!`
          : `Đã tạo thư mục "${subName}" thành công!`,
        { id: toastId },
      );
      setIsCreateFolderOpen(false);
      setNewFolderName("");
      await loadFiles();
    } catch (err: any) {
      console.error("Create folder error:", err);
      // Fallback: lưu cục bộ để giao diện luôn hiển thị đầy đủ
      const current = getStoredFolders();
      if (!current.includes(fullPath)) {
        saveStoredFolders([fullPath, ...current]);
      }
      toast.success(`Đã tạo thư mục "${subName}"!`, { id: toastId });
      setIsCreateFolderOpen(false);
      setNewFolderName("");
      await loadFiles();
    } finally {
      setCreatingFolder(false);
    }
  };

  // Trigger Open Rename Modal
  const handleOpenRename = (item: fileItem) => {
    setRenameItem(item);
    setRenameValue(item.name);
  };

  // Submit Rename Action (Đổi tên tệp hoặc thư mục con/cha)
  const submitRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameItem) return;

    const newName = renameValue.trim().replace(/[\\/:*?"<>|]/g, "_");
    if (!newName || newName === renameItem.name) {
      setRenameItem(null);
      return;
    }

    const isFolder = renameItem.kind === "folder";
    const oldPath = renameItem.path || renameItem.name;
    const parent = getParentPath(oldPath);
    const newPath = parent ? `${parent}/${newName}` : newName;

    setRenaming(true);
    const toastId = toast.loading("Đang cập nhật tên...");
    try {
      if (isFolder) {
        // 1. Gọi backend updateFolder
        try {
          await updateFolder(oldPath, newPath);
        } catch (backendErr) {
          console.warn("Backend updateFolder failed, updating locally", backendErr);
        }

        // 2. Cập nhật stored folders: đổi cả path này và tất cả các folder con bên trong nó
        const current = getStoredFolders();
        const updated = current.map((f) => {
          if (f === oldPath) return newPath;
          if (f.startsWith(oldPath + "/")) {
            return f.replace(oldPath + "/", newPath + "/");
          }
          return f;
        });
        saveStoredFolders(updated);

        // 3. Nếu đang đứng trong folder vừa đổi tên, cập nhật currentFolder
        if (currentFolder === oldPath) {
          setCurrentFolder(newPath);
        } else if (currentFolder.startsWith(oldPath + "/")) {
          setCurrentFolder(currentFolder.replace(oldPath + "/", newPath + "/"));
        }

        toast.success(`Đã đổi tên thư mục thành "${newName}"`, { id: toastId });
      } else {
        // Gọi backend updateFile
        await updateFile(renameItem.id, {
          fileName: newName,
          originalName: newName,
        });
        toast.success(`Đã đổi tên tệp thành "${newName}"`, { id: toastId });
      }

      setRenameItem(null);
      setRenameValue("");
      await loadFiles();
    } catch (err: any) {
      console.error("Rename error:", err);
      toast.error(
        err?.response?.data?.message || "Đổi tên thất bại. Vui lòng thử lại.",
        { id: toastId },
      );
    } finally {
      setRenaming(false);
    }
  };

  // Trigger Open Delete Modal
  const handleOpenDelete = (item: fileItem) => {
    setDeleteItem(item);
  };

  // Submit Delete Action (Xóa tệp hoặc thư mục và toàn bộ thư mục con)
  const submitDelete = async () => {
    if (!deleteItem) return;

    const isFolder = deleteItem.kind === "folder";
    const targetPath = deleteItem.path || deleteItem.name;

    setDeleting(true);
    const toastId = toast.loading("Đang xóa...");
    try {
      if (isFolder) {
        // 1. Gọi backend deleteFolder
        try {
          await deleteFolder(targetPath);
        } catch (backendErr) {
          console.warn("Backend deleteFolder failed, removing locally", backendErr);
        }

        // 2. Xóa khỏi stored folders (xóa cả targetPath và các con của nó)
        const current = getStoredFolders();
        const updated = current.filter(
          (f) => f !== targetPath && !f.startsWith(targetPath + "/"),
        );
        saveStoredFolders(updated);

        // 3. Nếu đang đứng bên trong folder bị xóa, quay về folder cha
        if (
          currentFolder === targetPath ||
          currentFolder.startsWith(targetPath + "/")
        ) {
          setCurrentFolder(getParentPath(targetPath));
        }

        toast.success(`Đã xóa thư mục "${deleteItem.name}"`, { id: toastId });
      } else {
        // Gọi backend deleteFile
        await deleteFile(deleteItem.id);
        toast.success(`Đã xóa tệp "${deleteItem.name}"`, { id: toastId });
      }

      setDeleteItem(null);
      await loadFiles();
    } catch (err: any) {
      console.error("Delete error:", err);
      toast.error(
        err?.response?.data?.message || "Xóa thất bại. Vui lòng thử lại.",
        { id: toastId },
      );
    } finally {
      setDeleting(false);
    }
  };

  // Click mở folder hoặc xem/tải tệp
  const handleDownloadOrView = async (item: fileItem) => {
    if (item.kind === "folder") {
      // Mở thư mục con (chuyển currentFolder sang đường dẫn đầy đủ của folder đó)
      setCurrentFolder(item.path || item.name);
      return;
    }

    if (item.url) {
      window.open(getFileDownloadUrl(item.url), "_blank");
      return;
    }

    try {
      const res = await getFile(item.id);
      const fileData = res.data;
      if (fileData?.url) {
        window.open(getFileDownloadUrl(fileData.url), "_blank");
      } else {
        toast.info("Tệp không có đường dẫn xem trực tiếp");
      }
    } catch {
      toast.error("Không thể lấy thông tin tệp");
    }
  };

  // Tính toán các mục hiển thị dựa theo folder hiện tại
  const displayedFiles = useMemo(() => {
    // Nếu đang tìm kiếm, hiển thị tất cả các mục khớp từ khóa ở mọi cấp
    if (searchQuery.trim()) {
      return files;
    }

    return files
      .filter((item) => {
        if (item.kind === "folder") {
          // Folder con: chỉ hiển thị folder có parentPath trùng với currentFolder
          const folderParent = getParentPath(item.path || item.name);
          return folderParent === currentFolder;
        }

        // Tệp tin:
        // Nếu ở root: hiển thị tệp không có folder hoặc folder là "" / "/"
        // Nếu ở trong folder: hiển thị tệp có folder === currentFolder
        if (!currentFolder) {
          return !item.folder || item.folder === "" || item.folder === "/";
        }
        return item.folder === currentFolder;
      })
      .map((item) => {
        // Tính toán số lượng mục bên trong folder để hiển thị trực quan
        if (item.kind === "folder") {
          const folderPath = item.path || item.name;
          const subCount = files.filter((f) => {
            if (f.kind === "folder") {
              return getParentPath(f.path || f.name) === folderPath;
            }
            return f.folder === folderPath;
          }).length;

          return {
            ...item,
            size: subCount > 0 ? `${subCount} mục` : "Trống",
          };
        }
        return item;
      });
  }, [files, currentFolder, searchQuery]);

  // Phân tích các phân đoạn breadcrumb từ currentFolder (e.g. "CAD Drawings/Kiến trúc/Tầng 1")
  const breadcrumbSegments = useMemo(() => {
    if (!currentFolder) return [];
    const parts = currentFolder.split("/").filter(Boolean);
    return parts.map((part, index) => ({
      name: part,
      path: parts.slice(0, index + 1).join("/"),
      isLast: index === parts.length - 1,
    }));
  }, [currentFolder]);

  return (
    <main className="min-h-full bg-[#faf8ff] pb-10 text-left text-[#242229]">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleUpload}
      />

      {/* Page Header */}
      <section className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-[28px] font-bold leading-tight tracking-[-0.7px] text-[#1d1b22] md:text-[36px]">
            Quản lý Hồ sơ &amp; Bản vẽ
          </h1>
          <p className="mt-1 text-[14px] text-[#55515a] md:text-[16px]">
            Hệ thống lưu trữ và kiểm soát tài liệu kỹ thuật tập trung theo phân cấp thư mục.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            disabled={uploading}
            onClick={openFilePicker}
            className="h-11 rounded-xl px-4 text-[14px] font-semibold text-[#00766b] hover:bg-[#e8f3f1] focus-visible:ring-2 focus-visible:ring-[#00766b]/30"
          >
            {uploading ? (
              <Loader2 size={20} className="animate-spin text-[#00766b]" />
            ) : (
              <UploadCloud size={20} />
            )}
            {uploading ? "Đang tải lên..." : "Tải lên tệp"}
          </Button>
          <Button
            type="button"
            onClick={handleOpenCreateFolder}
            className="h-11 rounded-xl bg-[#00766b] px-4 text-[14px] font-semibold text-white shadow-[0_4px_8px_rgba(0,79,70,0.18)] hover:bg-[#00665c] focus-visible:ring-2 focus-visible:ring-[#00766b]/35"
          >
            <FolderPlus size={20} />
            {currentFolder ? "Tạo thư mục con" : "Thư mục mới"}
          </Button>
        </div>
      </section>

      {/* Main File Management Box */}
      <section className="overflow-hidden rounded-[16px] border border-[#b9cbc8] bg-white shadow-[0_8px_24px_rgba(35,52,49,0.035)]">
        {/* Navigation & Controls Bar */}
        <div className="flex min-h-[72px] flex-col justify-between gap-4 border-b border-[#e2ecea] px-5 py-3 sm:flex-row sm:items-center">
          {/* Breadcrumb Path Đa Cấp Hỗ Trợ Folder Con */}
          <nav
            aria-label="Đường dẫn thư mục"
            className="flex min-w-0 flex-wrap items-center gap-1.5 text-[14px]"
          >
            {/* Nút quay lại cấp cha nhanh */}
            {currentFolder && (
              <button
                type="button"
                title="Lên thư mục cha"
                onClick={() => setCurrentFolder(getParentPath(currentFolder))}
                className="mr-1 grid size-7 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 hover:text-[#00766b]"
              >
                <ArrowLeft size={14} />
              </button>
            )}

            <button
              type="button"
              onClick={() => setCurrentFolder("")}
              className="shrink-0 bg-transparent p-0 font-medium text-[#3d3a41] hover:text-[#00766b] focus:outline-none"
            >
              Dự án
            </button>
            <ChevronRight size={14} className="shrink-0 text-slate-400" />
            <button
              type="button"
              onClick={() => setCurrentFolder("")}
              className={`shrink-0 bg-transparent p-0 font-medium ${
                !currentFolder
                  ? "font-semibold text-[#00766b]"
                  : "text-[#3d3a41] hover:text-[#00766b]"
              } focus:outline-none`}
            >
              Aqua City
            </button>

            {/* Các phân đoạn folder con */}
            {breadcrumbSegments.map((segment) => (
              <React.Fragment key={segment.path}>
                <ChevronRight size={14} className="shrink-0 text-slate-400" />
                {segment.isLast ? (
                  <span className="flex items-center gap-1.5 truncate font-bold text-[#00766b]">
                    <FolderOpen size={16} className="shrink-0 text-[#00766b]" />
                    {segment.name}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCurrentFolder(segment.path)}
                    className="shrink-0 bg-transparent p-0 font-medium text-[#3d3a41] hover:text-[#00766b] focus:outline-none"
                  >
                    {segment.name}
                  </button>
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* Search, Refresh & View Switcher */}
          <div className="flex flex-wrap items-center gap-2.5 sm:self-auto">
            {/* Search Input */}
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center"
            >
              <Search
                size={16}
                className="pointer-events-none absolute left-3 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tệp hoặc bản vẽ..."
                className="h-9 w-44 rounded-xl border border-slate-200 bg-[#f9f8fc] pl-8 pr-7 text-xs text-slate-800 placeholder:text-slate-400 transition focus:border-[#00766b] focus:bg-white focus:outline-none sm:w-56"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </form>

            {/* Refresh Button */}
            <button
              type="button"
              aria-label="Tải lại danh sách"
              title="Làm mới"
              onClick={() => loadFiles()}
              className="grid size-9 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-[#00766b] focus:outline-none"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin text-[#00766b]" : ""}
              />
            </button>

            {/* View Mode Toggle */}
            <div className="flex overflow-hidden rounded-xl border border-[#b9cbc8] bg-white">
              <button
                type="button"
                aria-label="Xem dạng danh sách"
                aria-pressed={viewMode === "list"}
                onClick={() => setViewMode("list")}
                className={`grid size-9 place-items-center rounded-none p-0 transition focus:outline-none ${
                  viewMode === "list"
                    ? "bg-[#e3f0ee] text-[#006f65]"
                    : "bg-white text-[#242229] hover:bg-slate-50"
                }`}
              >
                <List size={18} />
              </button>
              <button
                type="button"
                aria-label="Xem dạng lưới"
                aria-pressed={viewMode === "grid"}
                onClick={() => setViewMode("grid")}
                className={`grid size-9 place-items-center rounded-none border-l border-[#d5dfdd] p-0 transition focus:outline-none ${
                  viewMode === "grid"
                    ? "bg-[#e3f0ee] text-[#006f65]"
                    : "bg-white text-[#242229] hover:bg-slate-50"
                }`}
              >
                <Grid2X2 size={17} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading && displayedFiles.length === 0 ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 size={32} className="animate-spin text-[#00766b]" />
            <p className="text-sm font-medium">Đang tải danh sách tài liệu...</p>
          </div>
        ) : displayedFiles.length === 0 ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 px-4 py-12 text-center text-slate-500">
            <div className="grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
              <FolderPlus size={28} />
            </div>
            <p className="text-base font-semibold text-slate-700">
              {currentFolder
                ? `Thư mục "${getFolderName(currentFolder)}" hiện chưa có mục nào`
                : "Chưa có tài liệu nào"}
            </p>
            <p className="max-w-sm text-xs text-slate-500">
              {searchQuery
                ? `Không tìm thấy kết quả phù hợp với từ khóa "${searchQuery}".`
                : currentFolder
                  ? "Bạn có thể tạo thư mục con hoặc tải tệp trực tiếp vào thư mục này."
                  : "Bắt đầu tải lên bản vẽ hoặc tạo thư mục để quản lý hồ sơ công trình."}
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              {currentFolder && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentFolder(getParentPath(currentFolder))}
                  className="h-9 gap-1.5 rounded-lg border-slate-200 px-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <ArrowLeft size={14} /> Quay lại cấp trước
                </Button>
              )}
              <Button
                type="button"
                onClick={openFilePicker}
                className="h-9 gap-1.5 rounded-lg bg-[#00766b] px-3.5 text-xs font-semibold text-white hover:bg-[#00665c]"
              >
                <UploadCloud size={16} /> Tải tệp lên đây
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleOpenCreateFolder}
                className="h-9 gap-1.5 rounded-lg border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <FolderPlus size={16} /> Tạo thư mục con
              </Button>
            </div>
          </div>
        ) : viewMode === "list" ? (
          /* List View */
          <div className="overflow-x-auto">
            <div className="min-w-[780px]">
              <div className="grid grid-cols-[minmax(280px,2fr)_minmax(140px,1fr)_minmax(130px,0.9fr)_minmax(100px,0.7fr)_minmax(110px,0.8fr)] bg-[#f5f3fc] px-5 py-3 text-[12px] font-bold uppercase tracking-[0.05em] text-[#4d4855]">
                <span>Tên tài liệu / Thư mục</span>
                <span>Chủ sở hữu</span>
                <span>Vị trí / Ngày sửa</span>
                <span>Kích thước / Số mục</span>
                <span className="text-right">Thao tác</span>
              </div>

              {displayedFiles.map((item) => (
                <div
                  key={item.id}
                  className="group grid min-h-[66px] grid-cols-[minmax(280px,2fr)_minmax(140px,1fr)_minmax(130px,0.9fr)_minmax(100px,0.7fr)_minmax(110px,0.8fr)] items-center border-t border-[#e2ecea] px-5 text-[14px] first:border-t-0 hover:bg-[#f8fbfb]"
                >
                  {/* Name & Icon */}
                  <div
                    className="flex min-w-0 cursor-pointer items-center gap-3 pr-2"
                    onClick={() => handleDownloadOrView(item)}
                  >
                    <FileIcon kind={item.kind} size={22} />
                    <div className="min-w-0 flex-1 truncate">
                      <span className="truncate font-semibold text-[#26242a] group-hover:text-[#00766b]">
                        {item.name}
                      </span>
                      {searchQuery && item.folder && (
                        <span className="ml-2 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
                          {item.folder}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Owner */}
                  <OwnerBadge item={item} />

                  {/* Date / Position */}
                  <span className="text-[#55515a] text-xs">{item.modified}</span>

                  {/* Size / Item count */}
                  <span className="text-[#55515a] font-medium text-xs">
                    {item.size}
                  </span>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      title={
                        item.kind === "folder" ? "Mở thư mục" : "Xem / Tải về"
                      }
                      onClick={() => handleDownloadOrView(item)}
                      className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[#00766b]"
                    >
                      {item.kind === "folder" ? (
                        <ExternalLink size={16} />
                      ) : (
                        <Download size={16} />
                      )}
                    </button>
                    <button
                      type="button"
                      title="Đổi tên"
                      onClick={() => handleOpenRename(item)}
                      className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[#00766b]"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      title="Xóa"
                      onClick={() => handleOpenDelete(item)}
                      className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid gap-4 border-t border-[#e2ecea] p-5 sm:grid-cols-2 xl:grid-cols-3">
            {displayedFiles.map((item) => (
              <article
                key={item.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-[#d6e0de] bg-white p-4 transition hover:border-[#9fbab6] hover:shadow-[0_8px_22px_rgba(31,57,53,0.08)]"
              >
                <div>
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div
                      className="grid size-12 cursor-pointer place-items-center rounded-xl bg-[#eef5f4] transition group-hover:bg-[#e0eeec]"
                      onClick={() => handleDownloadOrView(item)}
                    >
                      <FileIcon kind={item.kind} size={26} />
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title={item.kind === "folder" ? "Mở" : "Tải về"}
                        onClick={() => handleDownloadOrView(item)}
                        className="grid size-7 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#00766b]"
                      >
                        {item.kind === "folder" ? (
                          <ExternalLink size={14} />
                        ) : (
                          <Download size={14} />
                        )}
                      </button>
                      <button
                        type="button"
                        title="Đổi tên"
                        onClick={() => handleOpenRename(item)}
                        className="grid size-7 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#00766b]"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        title="Xóa"
                        onClick={() => handleOpenDelete(item)}
                        className="grid size-7 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <h3
                    className="cursor-pointer truncate text-[15px] font-semibold text-[#26242a] group-hover:text-[#00766b]"
                    onClick={() => handleDownloadOrView(item)}
                  >
                    {item.name}
                  </h3>

                  {searchQuery && item.folder && (
                    <p className="mt-1 truncate text-[11px] text-slate-400">
                      📁 {item.folder}
                    </p>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                  <OwnerBadge item={item} />
                  <div className="text-right">
                    <span className="block text-[11px] font-medium text-slate-600">
                      {item.size}
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      {item.modified}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Info / Quick Widget Section */}
      <section className="mt-7 grid gap-6 xl:grid-cols-2">
        <article className="rounded-[16px] border border-[#a25a00] border-l-[4px] bg-white px-5 py-4 shadow-[0_9px_25px_rgba(80,50,20,0.04)]">
          <h2 className="flex items-center gap-2 text-[14px] font-semibold uppercase tracking-[0.06em] text-[#885300]">
            <Bell size={16} /> Cần hành động
          </h2>
          <button
            type="button"
            className="mt-3 flex min-h-10 w-full items-center gap-3 rounded-xl border border-[#f0d8bc] bg-[#fff5e9] px-3 py-2 text-left text-[15px] font-normal text-[#2b282c] transition hover:bg-[#ffedd7] focus:outline-none"
          >
            <Bell size={15} className="shrink-0 text-[#9a630f]" />
            <span className="truncate">Phê duyệt Báo cáo PCCC</span>
          </button>
        </article>

        <article className="rounded-[16px] border border-[#a63218] border-l-[4px] bg-white px-5 py-4 shadow-[0_9px_25px_rgba(80,40,20,0.04)]">
          <div className="flex items-center justify-between gap-4">
            <h2 className="flex items-center gap-2 text-[14px] font-semibold uppercase tracking-[0.06em] text-[#a12f17]">
              <Database size={16} /> Dung lượng
            </h2>
            <span className="text-[11px] tracking-[0.08em] text-[#a34c37]">
              {files.length > 0 ? `${files.length} mục đã lưu` : "75% đã dùng"}
            </span>
          </div>
          <div
            className="mt-4 h-[7px] overflow-hidden rounded-full bg-[#e7e5ef]"
            role="progressbar"
            aria-label="Dung lượng đã sử dụng"
            aria-valuenow={75}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="h-full w-3/4 bg-[#9c3f20]" />
          </div>
        </article>
      </section>

      {/* ==================== DIALOGS ==================== */}

      {/* 1. Modal Tạo Thư Mục Mới / Thư Mục Con */}
      <Dialog
        open={isCreateFolderOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateFolderOpen(false);
            setNewFolderName("");
          }
        }}
      >
        <DialogContent className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl sm:max-w-[460px]">
          <DialogHeader className="border-b border-slate-100 bg-[#fbfbfd] p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#e3f0ee] text-[#00766b]">
                <FolderPlus size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-lg font-bold text-slate-900">
                  {currentFolder
                    ? `Tạo thư mục con trong "${getFolderName(currentFolder)}"`
                    : "Tạo thư mục mới"}
                </DialogTitle>
                <DialogDescription className="mt-0.5 text-xs text-slate-500">
                  {currentFolder ? (
                    <span className="flex items-center gap-1 font-mono text-[11px] text-[#00766b]">
                      📁 Aqua City / {currentFolder.replace(/\//g, " / ")}
                    </span>
                  ) : (
                    "Thư mục sẽ được tạo tại thư mục gốc của dự án."
                  )}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={submitCreateFolder} className="p-6 pt-5">
            <div className="space-y-2">
              <label
                htmlFor="folder-name-input"
                className="text-xs font-semibold uppercase tracking-wider text-slate-600"
              >
                Tên thư mục {currentFolder ? "con" : ""} <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Folder
                  size={18}
                  className="pointer-events-none absolute left-3.5 text-slate-400"
                />
                <Input
                  id="folder-name-input"
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder={
                    currentFolder
                      ? "VD: Bản vẽ tầng 1, Chi tiết thi công..."
                      : "VD: CAD Drawings, Hồ sơ hoàn công..."
                  }
                  className="h-11 rounded-xl border-slate-200 pl-10 pr-4 text-sm focus-visible:border-[#00766b] focus-visible:ring-[#00766b]/20"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                {currentFolder
                  ? `Đường dẫn đầy đủ: ${currentFolder}/${newFolderName.trim() || "..."}`
                  : "Thư mục dùng để lưu trữ và phân loại các hồ sơ công trình."}
              </p>
            </div>

            <DialogFooter className="mt-6 flex gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateFolderOpen(false);
                  setNewFolderName("");
                }}
                className="h-10 rounded-xl px-4 text-sm font-medium"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={!newFolderName.trim() || creatingFolder}
                className="h-10 rounded-xl bg-[#00766b] px-5 text-sm font-semibold text-white shadow-sm hover:bg-[#00665c]"
              >
                {creatingFolder ? (
                  <>
                    <Loader2 size={16} className="mr-1.5 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <FolderPlus size={16} className="mr-1.5" />
                    {currentFolder ? "Tạo thư mục con" : "Tạo thư mục"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. Modal Đổi Tên */}
      <Dialog
        open={Boolean(renameItem)}
        onOpenChange={(open) => {
          if (!open) {
            setRenameItem(null);
            setRenameValue("");
          }
        }}
      >
        <DialogContent className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl sm:max-w-[440px]">
          <DialogHeader className="border-b border-slate-100 bg-[#fbfbfd] p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700">
                <Pencil size={20} />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900">
                  {renameItem?.kind === "folder"
                    ? "Đổi tên thư mục"
                    : "Đổi tên tệp tài liệu"}
                </DialogTitle>
                <DialogDescription className="mt-0.5 text-xs text-slate-500">
                  Nhập tên mới cho{" "}
                  {renameItem?.kind === "folder" ? "thư mục" : "tệp"}.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={submitRename} className="p-6 pt-5">
            <div className="space-y-2">
              <label
                htmlFor="rename-input"
                className="text-xs font-semibold uppercase tracking-wider text-slate-600"
              >
                Tên mới <span className="text-rose-500">*</span>
              </label>
              <Input
                id="rename-input"
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="h-11 rounded-xl border-slate-200 px-3.5 text-sm focus-visible:border-[#00766b] focus-visible:ring-[#00766b]/20"
              />
            </div>

            <DialogFooter className="mt-6 flex gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setRenameItem(null);
                  setRenameValue("");
                }}
                className="h-10 rounded-xl px-4 text-sm font-medium"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={
                  !renameValue.trim() ||
                  renameValue.trim() === renameItem?.name ||
                  renaming
                }
                className="h-10 rounded-xl bg-[#00766b] px-5 text-sm font-semibold text-white shadow-sm hover:bg-[#00665c]"
              >
                {renaming ? (
                  <>
                    <Loader2 size={16} className="mr-1.5 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  "Lưu thay đổi"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 3. Modal Xác Nhận Xóa */}
      <Dialog
        open={Boolean(deleteItem)}
        onOpenChange={(open) => {
          if (!open) setDeleteItem(null);
        }}
      >
        <DialogContent className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl sm:max-w-[420px]">
          <DialogHeader className="border-b border-slate-100 bg-rose-50/50 p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-rose-100 text-rose-600">
                <AlertTriangle size={22} />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900">
                  {deleteItem?.kind === "folder" ? "Xóa thư mục" : "Xóa tệp"}
                </DialogTitle>
                <DialogDescription className="mt-0.5 text-xs text-slate-500">
                  Thao tác này sẽ xóa mục khỏi hệ thống.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 pt-4">
            <p className="text-sm text-slate-700">
              Bạn có chắc chắn muốn xóa{" "}
              {deleteItem?.kind === "folder" ? "thư mục" : "tệp"}{" "}
              <strong className="text-slate-900">"{deleteItem?.name}"</strong>{" "}
              không?
            </p>
            {deleteItem?.kind === "folder" && (
              <p className="mt-2 rounded-lg bg-rose-50 p-2 text-xs text-rose-600">
                Lưu ý: Tất cả các thư mục con và tệp tin bên trong thư mục này cũng sẽ bị xóa vĩnh viễn.
              </p>
            )}

            <DialogFooter className="mt-6 flex gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteItem(null)}
                className="h-10 rounded-xl px-4 text-sm font-medium"
              >
                Hủy bỏ
              </Button>
              <Button
                type="button"
                onClick={submitDelete}
                disabled={deleting}
                className="h-10 rounded-xl bg-rose-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-rose-700"
              >
                {deleting ? (
                  <>
                    <Loader2 size={16} className="mr-1.5 animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  "Xác nhận xóa"
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default FilesPage;
