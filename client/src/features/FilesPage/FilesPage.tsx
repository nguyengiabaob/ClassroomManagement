import {
  Bell,
  ChevronRight,
  Database,
  File,
  FileText,
  Folder,
  FolderPlus,
  Grid2X2,
  List,
  UploadCloud,
} from "lucide-react";
import { useRef, useState } from "react";

type ViewMode = "list" | "grid";
type FileKind = "drawing" | "pdf" | "folder";

type FileItem = {
  id: number;
  name: string;
  kind: FileKind;
  owner: string;
  initials: string;
  ownerTone: "teal" | "amber" | "slate";
  modified: string;
  size: string;
};

const initialFiles: FileItem[] = [
  {
    id: 1,
    name: "MB_Tang1_Arc_V2.dwg",
    kind: "drawing",
    owner: "Tôi",
    initials: "NH",
    ownerTone: "teal",
    modified: "24 thg 5, 2024",
    size: "45.2 MB",
  },
  {
    id: 2,
    name: "Thuyet-minh-dien-nuoc.pdf",
    kind: "pdf",
    owner: "Anh Lê",
    initials: "AL",
    ownerTone: "amber",
    modified: "23 thg 5, 2024",
    size: "2.8 MB",
  },
];

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );

  return `${(bytes / 1024 ** unitIndex).toFixed(unitIndex > 1 ? 1 : 0)} ${units[unitIndex]}`;
};

const FileIcon = ({ kind, size = 24 }: { kind: FileKind; size?: number }) => {
  if (kind === "folder") {
    return <Folder size={size} className="text-[#a56605]" strokeWidth={1.8} />;
  }

  if (kind === "pdf") {
    return <FileText size={size} className="text-[#d51c1c]" strokeWidth={1.8} />;
  }

  return <File size={size} className="text-[#00766b]" strokeWidth={1.8} />;
};

const OwnerBadge = ({ item }: { item: FileItem }) => {
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
      <span className="text-[15px] text-[#2c2a2f]">{item.owner}</span>
    </div>
  );
};

const FilesPage = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [files, setFiles] = useState<FileItem[]>(initialFiles);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openFilePicker = () => fileInputRef.current?.click();

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (!selectedFiles.length) return;

    const uploadedFiles: FileItem[] = selectedFiles.map((selectedFile, index) => ({
      id: Date.now() + index,
      name: selectedFile.name,
      kind: selectedFile.name.toLowerCase().endsWith(".pdf") ? "pdf" : "drawing",
      owner: "Tôi",
      initials: "NH",
      ownerTone: "teal",
      modified: new Intl.DateTimeFormat("vi-VN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date()),
      size: formatFileSize(selectedFile.size),
    }));

    setFiles((currentFiles) => [...uploadedFiles, ...currentFiles]);
    event.target.value = "";
  };

  const handleCreateFolder = () => {
    const folderName = window.prompt("Tên thư mục mới");
    if (!folderName?.trim()) return;

    setFiles((currentFiles) => [
      {
        id: Date.now(),
        name: folderName.trim(),
        kind: "folder",
        owner: "Tôi",
        initials: "NH",
        ownerTone: "teal",
        modified: new Intl.DateTimeFormat("vi-VN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(new Date()),
        size: "—",
      },
      ...currentFiles,
    ]);
  };

  return (
    <main className="min-h-full bg-[#faf8ff] pb-10 text-left text-[#242229]">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleUpload}
      />

      <section className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-[30px] font-bold leading-tight tracking-[-0.7px] text-[#1d1b22] md:text-[36px]">
            Quản lý Hồ sơ &amp; Bản vẽ
          </h1>
          <p className="mt-1 text-[15px] text-[#55515a] md:text-[17px]">
            Hệ thống lưu trữ và kiểm soát tài liệu kỹ thuật tập trung.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={openFilePicker}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-transparent px-4 text-[15px] font-medium text-[#00766b] transition hover:bg-[#e8f3f1] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00766b]/30"
          >
            <UploadCloud size={22} />
            Tải lên tệp
          </button>
          <button
            type="button"
            onClick={handleCreateFolder}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#00766b] px-5 text-[15px] font-medium text-white shadow-[0_4px_8px_rgba(0,79,70,0.18)] transition hover:bg-[#00665c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00766b]/35"
          >
            <FolderPlus size={22} />
            Thư mục mới
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-[16px] border border-[#b9cbc8] bg-white shadow-[0_8px_24px_rgba(35,52,49,0.035)]">
        <div className="flex min-h-[78px] flex-col justify-between gap-4 px-5 py-4 sm:flex-row sm:items-center">
          <nav aria-label="Đường dẫn thư mục" className="flex min-w-0 items-center gap-2 text-[14px]">
            <button type="button" className="shrink-0 bg-transparent p-0 text-[#3d3a41] hover:text-[#00766b] focus:outline-none">
              Projects
            </button>
            <ChevronRight size={15} className="shrink-0 text-slate-400" />
            <button type="button" className="shrink-0 bg-transparent p-0 text-[#3d3a41] hover:text-[#00766b] focus:outline-none">
              Aqua City
            </button>
            <ChevronRight size={15} className="shrink-0 text-slate-400" />
            <span className="truncate font-semibold text-[#201e24]">CAD Drawings</span>
          </nav>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="flex overflow-hidden rounded-xl border border-[#b9cbc8] bg-white">
              <button
                type="button"
                aria-label="Xem dạng danh sách"
                aria-pressed={viewMode === "list"}
                onClick={() => setViewMode("list")}
                className={`grid h-11 w-12 place-items-center rounded-none p-0 transition focus:outline-none ${
                  viewMode === "list"
                    ? "bg-[#e3f0ee] text-[#006f65]"
                    : "bg-white text-[#242229] hover:bg-slate-50"
                }`}
              >
                <List size={22} />
              </button>
              <button
                type="button"
                aria-label="Xem dạng lưới"
                aria-pressed={viewMode === "grid"}
                onClick={() => setViewMode("grid")}
                className={`grid h-11 w-12 place-items-center rounded-none border-l border-[#d5dfdd] p-0 transition focus:outline-none ${
                  viewMode === "grid"
                    ? "bg-[#e3f0ee] text-[#006f65]"
                    : "bg-white text-[#242229] hover:bg-slate-50"
                }`}
              >
                <Grid2X2 size={20} />
              </button>
            </div>

            <button
              type="button"
              onClick={openFilePicker}
              className="hidden h-11 items-center gap-2 rounded-xl bg-transparent px-3 text-[15px] font-medium text-[#00766b] transition hover:bg-[#e8f3f1] focus:outline-none md:inline-flex"
            >
              <UploadCloud size={21} /> Tải lên
            </button>
            <button
              type="button"
              onClick={handleCreateFolder}
              className="hidden h-11 items-center gap-2 rounded-xl bg-[#00766b] px-4 text-[15px] font-medium text-white shadow-[0_4px_8px_rgba(0,79,70,0.18)] transition hover:bg-[#00665c] focus:outline-none md:inline-flex"
            >
              <FolderPlus size={21} /> Thư mục mới
            </button>
          </div>
        </div>

        {viewMode === "list" ? (
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[minmax(290px,1.8fr)_minmax(150px,.85fr)_minmax(170px,.95fr)_minmax(120px,.7fr)] bg-[#f1effc] px-5 py-3 text-[12px] font-medium uppercase tracking-[0.04em] text-[#35323a]">
                <span>Tên</span>
                <span>Chủ sở hữu</span>
                <span>Sửa đổi cuối</span>
                <span>Kích thước tệp</span>
              </div>

              {files.map((item) => (
                <div
                  key={item.id}
                  className="grid min-h-[72px] grid-cols-[minmax(290px,1.8fr)_minmax(150px,.85fr)_minmax(170px,.95fr)_minmax(120px,.7fr)] items-center border-t border-[#c5d2d0] px-5 text-[15px] first:border-t-0 hover:bg-[#fbfdfd]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <FileIcon kind={item.kind} size={25} />
                    <span className="truncate font-medium text-[#26242a]">{item.name}</span>
                  </div>
                  <OwnerBadge item={item} />
                  <span className="text-[#3f3c43]">{item.modified}</span>
                  <span className="text-[#3f3c43]">{item.size}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 border-t border-[#c5d2d0] p-5 sm:grid-cols-2 xl:grid-cols-3">
            {files.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-[#d6e0de] bg-white p-4 transition hover:border-[#9fbab6] hover:shadow-[0_8px_22px_rgba(31,57,53,0.08)]"
              >
                <div className="mb-6 flex items-start justify-between gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#eef5f4]">
                    <FileIcon kind={item.kind} size={28} />
                  </div>
                  <span className="text-[12px] text-slate-500">{item.size}</span>
                </div>
                <h3 className="truncate text-[15px] font-semibold text-[#26242a]">{item.name}</h3>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <OwnerBadge item={item} />
                  <span className="text-right text-[11px] text-slate-500">{item.modified}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

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
            <span className="text-[11px] tracking-[0.08em] text-[#a34c37]">75% đã dùng</span>
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
    </main>
  );
};

export default FilesPage;
