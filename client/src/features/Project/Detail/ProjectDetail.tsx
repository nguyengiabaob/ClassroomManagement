import { useState } from "react";
import {
  CalendarDays,
  ChevronRight,
  MapPin,
  Pencil,
  Share2,
  TrendingUp,
  UsersRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import "./ProjectDetail.css";

const tabs = ["Tổng quan", "Công việc", "Vật tư", "Nhân sự", "Tài liệu"];

export default function ProjectDetail() {
  const [activeTab, setActiveTab] = useState("Tổng quan");

  const handleExport = () => {
    const report = [
      "BÁO CÁO DỰ ÁN SKYLINE TOWER - QUẬN 1",
      "Mã dự án: BF-2024-001",
      "Trạng thái: Đang thi công",
      "Tiến độ: 68%",
      "Thời gian: 428 / 630 ngày",
      "Ngân sách: VND 12.5 tỷ",
      "Nhân sự: 12 kỹ sư, 148 công nhân",
    ].join("\n");
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "skyline-tower-report.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="project-detail-app">
      <main className="project-detail-main">
        <section className="project-detail-content">
          <div className="project-detail-title-row">
            <div className="project-detail-title-copy">
              <div className="project-detail-badges">
                <Badge variant="secondary">BF-2024-001</Badge>
                <Badge variant="outline">Đang thi công</Badge>
              </div>
              <h1>Skyline Tower - Quận 1</h1>
              <div className="project-detail-meta">
                <span>
                  <MapPin size={17} />
                  22 Lê Duẩn, Quận 1, TP.HCM
                </span>
                <span>
                  <CalendarDays size={17} />
                  15/05/2024 - 20/12/2025
                </span>
              </div>
            </div>

            <div className="project-detail-title-actions">
              <Button type="button" variant="outline" className="project-detail-edit-button">
                <Pencil size={18} />
                Chỉnh sửa
              </Button>
              <Button type="button" className="project-detail-export-button" onClick={handleExport}>
                <Share2 size={18} />
                Xuất báo cáo
              </Button>
            </div>
          </div>

          <div className="project-detail-summary-grid">
            <Card className="project-detail-progress-card block gap-0 py-0">
              <div className="project-detail-card-title">
                <h2>Tiến độ tổng thể</h2>
                <span>
                  <TrendingUp size={21} />
                </span>
              </div>

              <div className="project-detail-progress-body">
                <div className="project-detail-progress-ring" aria-label="Tiến độ hoàn thành 68%">
                  <div>
                    <strong>68%</strong>
                    <span>Hoàn thành</span>
                  </div>
                </div>

                <div className="project-detail-progress-info">
                  <div>
                    <span>Thời gian đã trôi qua</span>
                    <strong>428 / 630 ngày</strong>
                    <Progress value={68} className="project-detail-time-track" indicatorClassName="project-detail-time-indicator" />
                  </div>
                  <div className="project-detail-budget">
                    <span>Ngân sách</span>
                    <strong>VND 12.5 tỷ</strong>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="project-detail-workforce-card block gap-0 border-0 py-0 text-white">
              <div className="project-detail-workforce-title">
                <h2>
                  <UsersRound size={21} />
                  Nhân sự hiện tại
                </h2>
                <ChevronRight size={30} />
              </div>

              <div className="project-detail-workforce-stats">
                <div>
                  <span>Kỹ sư</span>
                  <strong>12 <small>người</small></strong>
                </div>
                <div>
                  <span>Công nhân</span>
                  <strong>148 <small>người</small></strong>
                </div>
              </div>

              <Button type="button" variant="secondary">Quản lý chấm công</Button>
            </Card>
          </div>

          <nav className="project-detail-tabs" aria-label="Nội dung dự án">
            {tabs.map((tab) => (
              <Button
                key={tab}
                type="button"
                variant="ghost"
                className={activeTab === tab ? "active" : ""}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </Button>
            ))}
          </nav>

          <section className="project-detail-tab-panel" aria-live="polite">
            <span className="sr-only">Đang xem mục {activeTab}</span>
          </section>
        </section>
      </main>
    </div>
  );
}
