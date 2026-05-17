import React, { useState } from "react";
import { Input, Button, Progress, Avatar } from "antd";
import { Search, Plus, LayoutGrid, List as ListIcon } from "lucide-react";

const Project = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const projects = [
    {
      id: 1,
      name: "SkyLine Tower",
      code: "SKL-2024",
      location: "QUẬN 1, HCM",
      budget: "$2.4M",
      budgetStatus: "Dưới ngân sách",
      budgetColor: "text-emerald-500",
      progress: 75,
      progressColor: "#2563eb",
      personnel: 124,
      machinery: 12,
      risk: "Thấp",
      riskColor: "text-amber-500",
      pm: "Nguyễn Văn Hùng",
      status: "ĐANG THI CÔNG",
      statusColor: "bg-emerald-500 text-white",
      tags: ["HẠNG A"],
      image:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop",
      alerts: 3,
      avatars: [
        "https://randomuser.me/api/portraits/men/32.jpg",
        "https://randomuser.me/api/portraits/women/44.jpg",
      ],
      extraAvatars: "+8",
    },
    {
      id: 2,
      name: "The Grand Central",
      code: "TGC-2025",
      location: "QUẬN 7, HCM",
      budget: "$15.8M",
      budgetStatus: "Đang thẩm định",
      budgetColor: "text-gray-400",
      progress: 12,
      progressColor: "#3b82f6",
      personnel: 45,
      machinery: 4,
      risk: "Cao",
      riskColor: "text-red-500",
      pm: "Trần Thanh Tâm",
      status: "KHỞI ĐỘNG",
      statusColor: "bg-blue-500 text-white",
      tags: [],
      // For empty image representation
      image:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
      alerts: 0,
      avatars: ["https://randomuser.me/api/portraits/men/45.jpg"],
    },
    {
      id: 3,
      name: "Ocean View Resort",
      code: "OVR-2023",
      location: "PHAN THIẾT",
      budget: "$8.2M",
      budgetStatus: "Vượt ngân sách",
      budgetColor: "text-red-600",
      progress: 92,
      progressColor: "#f59e0b",
      personnel: 0,
      machinery: 0,
      risk: "Trung bình",
      riskColor: "text-gray-800",
      pm: "Lê Quang Trình",
      status: "TẠM DỪNG",
      statusColor: "bg-amber-500 text-white",
      tags: [],
      image:
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop",
      alerts: 0,
      avatars: ["https://randomuser.me/api/portraits/men/62.jpg"],
    },
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      {/* Top Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="w-full md:w-96">
          <Input
            size="large"
            placeholder="Tìm kiếm tên dự án, chủ đầu tư..."
            prefix={<Search className="text-gray-400" size={18} />}
            className="rounded-xl border-gray-200 bg-slate-50 hover:bg-slate-100 focus:bg-white transition-colors py-2"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="primary"
            size="large"
            icon={<Plus size={18} />}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 shadow-sm flex items-center font-semibold"
          >
            Dự án mới
          </Button>

          <div className="flex items-center bg-slate-50 border border-gray-200 rounded-xl p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg flex items-center justify-center transition-colors ${
                viewMode === "grid"
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg flex items-center justify-center transition-colors ${
                viewMode === "list"
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <ListIcon size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full"
          >
            {/* Image Section */}
            <div className="h-[200px] relative bg-slate-50">
              <img
                src={project.image}
                alt={project.name}
                className="w-full h-full object-cover"
              />

              {/* Tags */}
              <div className="absolute top-4 left-4 flex gap-2">
                <span
                  className={`${project.statusColor} text-[10px] font-bold px-3 py-1.5 rounded-md uppercase tracking-wide`}
                >
                  {project.status}
                </span>
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-white text-gray-800 text-[10px] font-bold px-3 py-1.5 rounded-md uppercase tracking-wide"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Alert Badge */}
              {project.alerts > 0 && (
                <div className="absolute bottom-4 right-4 bg-red-600 text-white font-bold text-sm w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {project.alerts}
                </div>
              )}
            </div>

            {/* Card Body */}
            <div className="p-6 flex-1 flex flex-col">
              {/* Title & Budget */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1 leading-tight">
                    {project.name}
                  </h3>
                  <p className="text-xs text-gray-400 font-bold tracking-wide uppercase">
                    {project.code} • {project.location}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-[17px] font-bold text-gray-800 leading-tight">
                    {project.budget}
                  </div>
                  <div
                    className={`text-[10px] font-bold uppercase mt-1 ${project.budgetColor}`}
                  >
                    {project.budgetStatus}
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-8">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-bold text-gray-500">
                    Tiến độ tổng thể
                  </span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: project.progressColor }}
                  >
                    {project.progress}%
                  </span>
                </div>
                <Progress
                  percent={project.progress}
                  showInfo={false}
                  strokeColor={project.progressColor}
                  trailColor="#f1f5f9"
                  strokeWidth={10}
                  className="m-0"
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-0 mb-6 border-b border-gray-50 pb-6">
                <div className="text-center px-2">
                  <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-2">
                    Nhân sự
                  </div>
                  <div className="text-[17px] font-bold text-gray-800">
                    {project.personnel}
                  </div>
                </div>
                <div className="text-center px-2 border-x border-gray-100">
                  <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-2">
                    Máy móc
                  </div>
                  <div className="text-[17px] font-bold text-gray-800">
                    {project.machinery < 10 && project.machinery > 0
                      ? `0${project.machinery}`
                      : project.machinery}
                  </div>
                </div>
                <div className="text-center px-2">
                  <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-2">
                    Rủi ro
                  </div>
                  <div className={`text-sm font-bold mt-1 ${project.riskColor}`}>
                    {project.risk}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-auto flex items-center justify-start gap-3">
                <Avatar.Group size="small" maxCount={2}>
                  {project.avatars.map((url, index) => (
                    <Avatar
                      key={index}
                      src={url}
                      className="border-[1.5px] border-white"
                    />
                  ))}
                  {project.extraAvatars && (
                    <Avatar className="bg-gray-100 text-gray-600 border-[1.5px] border-white text-[10px] font-bold">
                      {project.extraAvatars}
                    </Avatar>
                  )}
                </Avatar.Group>
                <span className="text-xs text-gray-400 font-medium">
                  PM: {project.pm}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Project;
