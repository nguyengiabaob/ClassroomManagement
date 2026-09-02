import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  BarChart3,
  Building2,
  CloudSun,
  MapPin,
  MoreHorizontal,
  Plus,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { useSelector } from "react-redux";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { RootState } from "../../redux/store";

type Project = {
  name: string;
  location: string;
  status: string;
  statusTone: "green" | "amber";
  progress: number;
  workers: string;
  extra: number;
  image: "tower" | "mall";
};

type UpcomingTask = {
  month: string;
  day: string;
  title: string;
  detail: string;
  label: string;
  tone: "amber" | "green" | "rust";
};

const projects: Project[] = [
  {
    name: "Chung cư Horizon Tower",
    location: "Quận 2, TP. Hồ Chí Minh",
    status: "Đang thi công",
    statusTone: "green",
    progress: 82,
    workers: "12 kỹ sư đang có mặt",
    extra: 5,
    image: "tower",
  },
  {
    name: "Trung tâm Thương mại Green Plaza",
    location: "Quận 1, TP. Hồ Chí Minh",
    status: "Đang nghiệm thu",
    statusTone: "amber",
    progress: 95,
    workers: "8 chuyên gia nghiệm thu",
    extra: 2,
    image: "mall",
  },
];

const upcomingTasks: UpcomingTask[] = [
  {
    month: "T5",
    day: "25",
    title: "Họp điều phối thầu phụ",
    detail: "09:00 · Văn phòng điều hành",
    label: "Ưu tiên cao",
    tone: "amber",
  },
  {
    month: "T5",
    day: "25",
    title: "Kiểm tra an toàn Block A",
    detail: "14:30 · Hiện trường",
    label: "Thường kỳ",
    tone: "green",
  },
  {
    month: "T6",
    day: "26",
    title: "Báo cáo tuần cho CĐT",
    detail: "16:00 · Trực tuyến",
    label: "Quan trọng",
    tone: "rust",
  },
];

const ProjectArtwork = ({ variant }: { variant: Project["image"] }) => (
  <div
    aria-hidden="true"
    className={`relative h-28 w-full shrink-0 overflow-hidden rounded-xl bg-gradient-to-br sm:h-24 sm:w-32 ${
      variant === "tower"
        ? "from-emerald-950 to-teal-700"
        : "from-slate-900 to-teal-800"
    }`}
  >
    <div className="absolute inset-x-0 bottom-0 h-[28%] bg-black/25" />
    {variant === "tower" ? (
      <>
        <div className="absolute bottom-3 left-5 h-16 w-5 -skew-x-6 border-x border-emerald-200/25 bg-emerald-400/10" />
        <div className="absolute bottom-2 left-12 h-[72px] w-9 skew-x-3 border-x border-emerald-200/20 bg-emerald-300/10" />
        <div className="absolute bottom-4 right-4 h-12 w-7 -skew-x-6 border-x border-emerald-200/20 bg-teal-300/10" />
      </>
    ) : (
      <>
        <div className="absolute bottom-3 left-2 h-14 w-10 -skew-x-12 border-r border-teal-100/30 bg-teal-400/15" />
        <div className="absolute bottom-3 left-11 h-[68px] w-12 border-x border-teal-100/30 bg-cyan-300/15" />
        <div className="absolute bottom-3 right-1 h-16 w-9 skew-x-12 border-l border-teal-100/30 bg-teal-400/15" />
      </>
    )}
    <div className="absolute inset-x-0 bottom-3 h-px bg-white/20" />
    <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_35%,rgba(255,255,255,.13)_48%,transparent_62%)]" />
  </div>
);

const MetricCard = ({
  icon,
  value,
  title,
  description,
  percent,
  tone,
}: {
  icon: ReactNode;
  value: string;
  title: string;
  description: string;
  percent: number;
  tone: "green" | "amber";
}) => {
  const green = tone === "green";

  return (
    <Card className="gap-0 rounded-2xl border-slate-200/80 py-0 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
      <CardContent className="p-6">
        <div className="mb-5 flex items-start justify-between">
          <div
            className={`grid size-12 place-items-center rounded-xl ${green ? "bg-emerald-50 text-[#087669]" : "bg-amber-50 text-[#936000]"}`}
          >
            {icon}
          </div>
          <span
            className={`text-2xl font-bold ${green ? "text-[#087669]" : "text-[#815600]"}`}
          >
            {value}
          </span>
        </div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <p className="mt-2 min-h-10 text-sm leading-5 text-slate-500">
          {description}
        </p>
        <Progress
          value={percent}
          className="mt-4 h-2.5 bg-slate-100"
          indicatorClassName={green ? "bg-[#087669]" : "bg-[#966100]"}
        />
      </CardContent>
    </Card>
  );
};

const InstructorDashboardPage = () => {
  const user = useSelector((state: RootState) => state.users);
  const firstName = user?.name?.trim().split(/\s+/).at(-1) || "Quân";

  return (
    <main className="min-h-screen w-full bg-[#f7f7f4] text-slate-900">
      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#087669]">
              Tổng quan công trường
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Chào buổi sáng, {firstName}!
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Theo dõi tiến độ và quản lý công việc hôm nay.
            </p>
          </div>
          <Card className="w-full gap-0 rounded-2xl border-slate-200/80 py-0 shadow-none md:w-auto md:min-w-72">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="grid size-11 place-items-center rounded-xl bg-amber-50 text-amber-600">
                <CloudSun size={23} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-500">
                  TP. Hồ Chí Minh
                </p>
                <p className="font-bold text-slate-900">32°C · Nắng nhẹ</p>
              </div>
              <div className="border-l border-slate-200 pl-4 text-right">
                <p className="text-xs text-slate-500">Độ ẩm</p>
                <p className="font-semibold">65%</p>
              </div>
            </CardContent>
          </Card>
        </header>

        <section
          aria-label="Chỉ số tổng quan"
          className="grid gap-4 lg:grid-cols-3"
        >
          <MetricCard
            icon={<BarChart3 size={22} />}
            value="75%"
            title="Tiến độ tổng thể"
            description="Dự kiến hoàn thành đúng hạn vào T9/2024"
            percent={75}
            tone="green"
          />
          <MetricCard
            icon={<Banknote size={23} />}
            value="60%"
            title="Ngân sách sử dụng"
            description="Đã giải ngân: 4.2 tỷ / 7 tỷ VND"
            percent={60}
            tone="amber"
          />
          <Card className="relative gap-0 overflow-hidden rounded-2xl border-0 bg-[#b95f3d] py-0 text-white shadow-[0_10px_30px_rgba(150,72,42,0.18)]">
            <CardContent className="relative z-10 p-6">
              <div className="mb-5 flex items-start justify-between">
                <div className="grid size-12 place-items-center rounded-xl bg-white/15">
                  <AlertTriangle size={22} />
                </div>
                <span className="text-2xl font-bold">03</span>
              </div>
              <h2 className="text-lg font-bold">Cảnh báo an toàn</h2>
              <p className="mt-2 text-sm text-white/80">
                Cần kiểm tra ngay tại khu vực Block B
              </p>
              <Button className="mt-5 h-9 w-full bg-white text-[#9b4e32] hover:bg-orange-50">
                Xem chi tiết
              </Button>
            </CardContent>
            <AlertTriangle
              className="absolute -bottom-4 right-3 size-28 text-white/[0.06]"
              strokeWidth={1.3}
            />
          </Card>
        </section>

        <section className="mt-8 grid items-start gap-8 xl:grid-cols-[minmax(0,2fr)_340px]">
          <div>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">
                  Công trường đang hoạt động
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Các dự án cần theo dõi trong hôm nay
                </p>
              </div>
              <Button
                variant="ghost"
                className="text-[#087669] hover:bg-emerald-50 hover:text-[#087669]"
              >
                Xem tất cả <ArrowRight data-icon="inline-end" />
              </Button>
            </div>

            <div className="space-y-4">
              {projects.map((project) => (
                <Card
                  key={project.name}
                  className="gap-0 rounded-2xl border-slate-200/80 py-0 shadow-[0_8px_30px_rgba(15,23,42,0.04)]"
                >
                  <CardContent className="grid gap-4 p-4 sm:grid-cols-[128px_minmax(0,1fr)] lg:grid-cols-[128px_minmax(0,1fr)_96px] lg:items-center">
                    <ProjectArtwork variant={project.image} />
                    <div className="min-w-0 py-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold leading-5 text-slate-900">
                            {project.name}
                          </h3>
                          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                            <MapPin size={14} /> {project.location}
                          </p>
                        </div>
                        <Badge
                          className={
                            project.statusTone === "green"
                              ? "border-transparent bg-emerald-50 text-[#087669]"
                              : "border-transparent bg-amber-50 text-[#936000]"
                          }
                        >
                          {project.status}
                        </Badge>
                      </div>
                      <div className="mt-5 flex items-center gap-3 text-xs text-slate-500">
                        <div className="flex -space-x-2">
                          <Avatar className="size-7 border-2 border-white">
                            <AvatarFallback className="bg-slate-200 text-[9px] font-semibold">
                              NK
                            </AvatarFallback>
                          </Avatar>
                          <Avatar className="size-7 border-2 border-white">
                            <AvatarFallback className="bg-slate-300 text-[9px] font-semibold">
                              TA
                            </AvatarFallback>
                          </Avatar>
                          <Avatar className="size-7 border-2 border-white">
                            <AvatarFallback className="bg-[#087669] text-[9px] font-bold text-white">
                              +{project.extra}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <span>{project.workers}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-4 lg:h-20 lg:flex-col lg:justify-center lg:border-l lg:border-t-0 lg:pt-0">
                      <span className="text-xs text-slate-500">Hoàn thành</span>
                      <strong
                        className={
                          project.statusTone === "green"
                            ? "text-lg text-[#087669]"
                            : "text-lg text-[#875b00]"
                        }
                      >
                        {project.progress}%
                      </strong>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mt-4 gap-0 rounded-2xl border-dashed border-slate-300 bg-transparent py-0 shadow-none">
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-white text-[#087669] shadow-sm">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <p className="font-semibold">12 dự án đang quản lý</p>
                    <p className="text-xs text-slate-500">
                      4 dự án cần cập nhật tiến độ tuần này
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="border-slate-200 bg-white">
                  Quản lý dự án
                </Button>
              </CardContent>
            </Card>
          </div>

          <aside>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Công việc sắp tới</h2>
                <p className="mt-1 text-sm text-slate-500">
                  3 công việc hôm nay
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Tùy chọn công việc"
              >
                <MoreHorizontal />
              </Button>
            </div>

            <Card className="gap-0 overflow-hidden rounded-2xl border-slate-200/80 py-0 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
              {upcomingTasks.map((task, index) => (
                <div
                  key={`${task.title}-${task.day}`}
                  className={`flex gap-4 p-4 ${index !== upcomingTasks.length - 1 ? "border-b border-slate-100" : ""}`}
                >
                  <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-emerald-50 text-center text-[#087669]">
                    <div className="leading-none">
                      <span className="block text-[10px] font-semibold uppercase">
                        {task.month}
                      </span>
                      <strong className="mt-1 block text-base">
                        {task.day}
                      </strong>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-bold">{task.title}</h3>
                    <p className="mt-1 text-xs text-slate-500">{task.detail}</p>
                    <div className="mt-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      <span
                        className={`size-2 rounded-full ${task.tone === "amber" ? "bg-amber-600" : task.tone === "green" ? "bg-[#087669]" : "bg-[#9b4e32]"}`}
                      />
                      {task.label}
                    </div>
                  </div>
                </div>
              ))}
            </Card>

            <Button
              type="button"
              variant="outline"
              className="mt-4 h-14 w-full border-2 border-dashed border-slate-300 bg-transparent text-slate-600 hover:border-[#087669] hover:bg-white hover:text-[#087669]"
            >
              <Plus /> Thêm công việc
            </Button>

            <Card className="mt-4 gap-0 rounded-2xl border-emerald-100 bg-emerald-50/60 py-0 shadow-none">
              <CardHeader className="flex-row items-center gap-3 p-4 pb-2">
                <div className="grid size-9 place-items-center rounded-lg bg-white text-[#087669]">
                  <Users size={18} />
                </div>
                <div>
                  <CardTitle className="text-sm">Nhân sự hôm nay</CardTitle>
                  <CardDescription className="mt-1 text-xs">
                    Tỷ lệ có mặt tại công trường
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="mb-2 flex items-end justify-between">
                  <strong className="text-2xl text-[#087669]">92%</strong>
                  <span className="text-xs text-slate-500">46 / 50 người</span>
                </div>
                <Progress value={92} indicatorClassName="bg-[#087669]" />
              </CardContent>
            </Card>
          </aside>
        </section>
      </div>
    </main>
  );
};

export default InstructorDashboardPage;
