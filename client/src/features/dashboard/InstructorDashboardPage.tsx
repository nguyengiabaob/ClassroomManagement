import React from "react";
import { Card, Progress, Row, Col } from "antd";
import {
  Clock,
  AlertTriangle,
  ChevronRight,
  ArrowUp,
  Flame,
  Check,
} from "lucide-react";

const InstructorDashboardPage = () => {
  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      {/* Top Alerts */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={12}>
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-red-100 transition-colors">
            <div className="flex items-center gap-4">
              <div className="bg-red-500 rounded-full w-10 h-10 flex items-center justify-center shadow-sm">
                <Clock className="text-white" size={20} />
              </div>
              <div>
                <div className="text-red-600 font-bold text-sm uppercase mb-0.5">
                  Chậm trễ nghiêm trọng
                </div>
                <div className="text-red-900/70 text-sm">
                  Thép cho SkyLine Tower trễ 48h
                </div>
              </div>
            </div>
            <ChevronRight className="text-red-400" />
          </div>
        </Col>
        <Col xs={24} md={12}>
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-amber-100 transition-colors">
            <div className="flex items-center gap-4">
              <div className="bg-amber-500 rounded-full w-10 h-10 flex items-center justify-center shadow-sm">
                <AlertTriangle className="text-white" size={20} />
              </div>
              <div>
                <div className="text-amber-700 font-bold text-sm uppercase mb-0.5">
                  Cảnh báo vật tư
                </div>
                <div className="text-amber-900/70 text-sm">
                  Xi măng sắp hết tại dự án Ocean View
                </div>
              </div>
            </div>
            <ChevronRight className="text-amber-500" />
          </div>
        </Col>
      </Row>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card
            className="rounded-2xl border-gray-100 shadow-sm h-full"
            styles={{ body: { padding: "20px" } }}
          >
            <div className="text-gray-400 text-xs font-bold uppercase mb-2">
              Dự án
            </div>
            <div className="text-4xl font-bold text-gray-800 mb-3">12</div>
            <div className="text-emerald-500 text-xs flex items-center font-semibold">
              <ArrowUp size={14} className="mr-1" /> 2 dự án mới
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            className="rounded-2xl border-gray-100 shadow-sm h-full"
            styles={{ body: { padding: "20px" } }}
          >
            <div className="text-gray-400 text-xs font-bold uppercase mb-2">
              Tiến độ TB
            </div>
            <div className="text-4xl font-bold text-gray-800 mb-3">64.8%</div>
            <Progress
              percent={64.8}
              showInfo={false}
              strokeColor="#2563eb"
              size="small"
              className="m-0"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            className="rounded-2xl border-gray-100 shadow-sm h-full"
            styles={{ body: { padding: "20px" } }}
          >
            <div className="text-gray-400 text-xs font-bold uppercase mb-2">
              Lỗi tồn đọng
            </div>
            <div className="text-4xl font-bold text-red-500 mb-3">24</div>
            <div className="text-gray-400 text-xs font-medium">
              Cần xử lý ngay
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            className="rounded-2xl border-gray-100 shadow-sm h-full"
            styles={{ body: { padding: "20px" } }}
          >
            <div className="text-gray-400 text-xs font-bold uppercase mb-2">
              Việc trễ hạn
            </div>
            <div className="text-4xl font-bold text-amber-500 mb-3">08</div>
            <div className="text-amber-500 text-xs font-medium">
              Tăng 2% so với tuần trước
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        {/* Project Progress */}
        <Col xs={24} lg={16}>
          <Card
            className="rounded-2xl border-gray-100 shadow-sm h-full"
            title={
              <span className="text-gray-700 font-bold uppercase text-sm">
                Tiến độ dự án trọng điểm
              </span>
            }
            extra={
              <a
                href="#"
                className="text-blue-600 text-xs font-bold uppercase"
              >
                Xem báo cáo
              </a>
            }
            styles={{ body: { padding: "24px" } }}
          >
            <div className="mb-8 mt-2">
              <div className="flex justify-between mb-2">
                <span className="font-bold text-gray-800">
                  SkyLine Tower (Giai đoạn 2)
                </span>
                <span className="font-bold text-emerald-500">75%</span>
              </div>
              <Progress
                percent={75}
                showInfo={false}
                strokeColor="#10b981"
                strokeWidth={12}
                className="m-0"
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-bold text-gray-800">
                  The Grand Central
                </span>
                <span className="font-bold text-blue-600">45%</span>
              </div>
              <Progress
                percent={45}
                showInfo={false}
                strokeColor="#2563eb"
                strokeWidth={12}
                className="m-0"
              />
            </div>
          </Card>
        </Col>

        {/* Open Issues Analysis */}
        <Col xs={24} lg={8}>
          <Card
            className="rounded-2xl border-gray-100 shadow-sm h-full flex flex-col"
            title={
              <span className="text-gray-700 font-bold uppercase text-sm text-center w-full block">
                Phân tích lỗi mở
              </span>
            }
            styles={{
              header: { borderBottom: "none", paddingTop: "20px" },
              body: { padding: "0 24px 24px", flex: 1, display: "flex" },
            }}
          >
            <div className="flex flex-col items-center justify-between w-full h-full">
              <div className="relative w-36 h-36 mb-6 mt-4">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    className="text-gray-50 stroke-current"
                    strokeWidth="10"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                  ></circle>
                  <circle
                    className="text-red-500 stroke-current"
                    strokeWidth="10"
                    strokeLinecap="round"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    strokeDasharray="251.2"
                    strokeDashoffset="188.4"
                    transform="rotate(-90 50 50)"
                  ></circle>
                </svg>
                <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-gray-800 leading-none">
                    24
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                    Tổng lỗi
                  </span>
                </div>
              </div>

              <div className="w-full space-y-4 mb-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-gray-700 font-semibold text-sm">
                      Nghiêm trọng
                    </span>
                  </div>
                  <span className="text-red-500 font-bold">12</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-gray-700 font-semibold text-sm">
                      Trung bình
                    </span>
                  </div>
                  <span className="text-amber-500 font-bold">8</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-gray-700 font-semibold text-sm">
                      Thấp
                    </span>
                  </div>
                  <span className="text-blue-500 font-bold">4</span>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Todo List */}
        <Col xs={24} lg={15}>
          <Card
            className="rounded-2xl border-gray-100 shadow-sm h-full"
            styles={{ body: { padding: "24px" } }}
          >
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-gray-800 font-bold uppercase text-sm mb-1">
                  Việc cần làm hôm nay
                </h3>
                <p className="text-gray-400 text-xs font-medium italic">
                  Thứ Bảy, 18 tháng 4, 2026
                </p>
              </div>
              <div className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold">
                4 việc ưu tiên
              </div>
            </div>

            <div className="border border-gray-100 rounded-xl p-5 flex items-center justify-between hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="bg-red-50 w-12 h-12 rounded-xl flex items-center justify-center">
                  <Flame className="text-red-500" size={24} />
                </div>
                <div>
                  <div className="font-bold text-gray-800 text-base mb-1.5">
                    Đổ bê tông sàn C4, Khu A
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded uppercase text-[10px]">
                      Ưu tiên cao
                    </span>
                    <span className="text-gray-400 font-medium">
                      • SkyLine Tower
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <span className="text-sm font-bold text-gray-800">
                  08:00 AM
                </span>
                <div className="w-6 h-6 rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-colors">
                  <Check size={12} className="text-gray-300" />
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Activity Log */}
        <Col xs={24} lg={9}>
          <Card
            className="rounded-2xl border-gray-100 shadow-sm h-full"
            title={
              <span className="text-gray-800 font-bold uppercase text-sm">
                Nhật ký hoạt động
              </span>
            }
            styles={{ body: { padding: "24px" } }}
          >
            <div className="relative pl-5 space-y-8 mt-2">
              <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-gray-100"></div>

              <div className="relative">
                <div className="absolute -left-[27px] top-1.5 w-2 h-2 rounded-full bg-blue-500 ring-4 ring-white"></div>
                <div>
                  <p className="text-sm text-gray-800 mb-1.5 leading-relaxed">
                    <span className="font-bold">Tuấn M.</span> đã hoàn thành{" "}
                    <span className="font-bold">Kiểm tra sắt thép</span>
                  </p>
                  <p className="text-xs text-gray-400 font-medium">
                    2 phút trước • SkyLine
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-[27px] top-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-white"></div>
                <div>
                  <p className="text-sm text-gray-800 mb-1.5 leading-relaxed">
                    <span className="font-bold">Giám sát Hùng</span> cập nhật
                    tiến độ sàn T14
                  </p>
                  <p className="text-xs text-gray-400 font-medium">
                    15 phút trước
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-[27px] top-1.5 w-2 h-2 rounded-full bg-amber-500 ring-4 ring-white"></div>
                <div>
                  <p className="text-sm text-gray-800 mb-1.5 leading-relaxed">
                    <span className="font-bold">Cảnh báo:</span> Thiếu xi măng
                    tại Ocean View
                  </p>
                  <p className="text-xs text-gray-400 font-medium">
                    1 giờ trước
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default InstructorDashboardPage;
