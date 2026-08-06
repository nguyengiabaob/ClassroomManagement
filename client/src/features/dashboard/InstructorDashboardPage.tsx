import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  BarChart3,
  CloudSun,
  MapPin,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import type { ReactNode } from "react";
import { useSelector } from "react-redux";
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
    workers: "12 Kỹ sư đang có mặt",
    extra: 5,
    image: "tower",
  },
  {
    name: "Trung tâm Thương mại Green Plaza",
    location: "Quận 1, TP. Hồ Chí Minh",
    status: "Đang nghiệm thu",
    statusTone: "amber",
    progress: 95,
    workers: "8 Chuyên gia nghiệm thu",
    extra: 2,
    image: "mall",
  },
];

const upcomingTasks: UpcomingTask[] = [
  {
    month: "T5",
    day: "25",
    title: "Họp điều phối thầu phụ",
    detail: "09:00 - Văn phòng điều hành",
    label: "Ưu tiên cao",
    tone: "amber",
  },
  {
    month: "T5",
    day: "25",
    title: "Kiểm tra an toàn Block A",
    detail: "14:30 - Hiện trường",
    label: "Thường kỳ",
    tone: "green",
  },
  {
    month: "T6",
    day: "26",
    title: "Báo cáo tuần cho CĐT",
    detail: "16:00 - Trực tuyến",
    label: "Quan trọng",
    tone: "rust",
  },
];

const ProjectArtwork = ({ variant }: { variant: Project["image"] }) => (
  <div
    aria-hidden="true"
    className={`relative h-[96px] w-[128px] shrink-0 overflow-hidden rounded-[14px] bg-slate-900 ${
      variant === "tower" ? "from-emerald-950 to-teal-700" : "from-slate-900 to-teal-800"
    } bg-gradient-to-br`}
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
    <article className="relative min-h-[230px] overflow-hidden rounded-[18px] border border-slate-200/80 bg-white p-6 shadow-[0_9px_30px_rgba(30,41,59,0.045)]">
      <div className="mb-5 flex items-start justify-between">
        <div
          className={`grid h-12 w-12 place-items-center rounded-xl ${
            green ? "bg-[#e5f1ee] text-[#087669]" : "bg-[#f5eee6] text-[#936000]"
          }`}
        >
          {icon}
        </div>
        <span className={`text-[26px] font-bold ${green ? "text-[#087669]" : "text-[#815600]"}`}>
          {value}
        </span>
      </div>

      <h2 className="text-[20px] font-bold leading-tight text-[#222027]">{title}</h2>
      <p className="mt-2 min-h-10 text-[14px] leading-5 text-slate-500">{description}</p>
      <div className="mt-4 h-[10px] overflow-hidden rounded-full bg-[#ebedf3]">
        <div
          className={`h-full rounded-full ${green ? "bg-[#087669]" : "bg-[#966100]"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </article>
  );
};

const InstructorDashboardPage = () => {
  const user = useSelector((state: RootState) => state.users);
  const firstName = user?.name?.trim().split(/\s+/).at(-1) || "Quân";

  return (
    <main className="min-h-full bg-[#faf8ff] px-1 pb-8 text-left text-[#222027] md:px-0">
      <section className="mb-8 grid items-center gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div>
          <h1 className="text-[30px] font-bold tracking-[-0.7px] text-[#1f1d24] md:text-[34px]">
            Chào buổi sáng, {firstName}
          </h1>
          <p className="mt-1 text-[15px] text-slate-500 md:text-[16px]">
            Hôm nay là Thứ Tư, ngày 24 tháng 5 năm 2024. Mọi thứ đang trong tầm kiểm soát.
          </p>
        </div>

        <article className="flex min-h-[105px] items-center rounded-[18px] border border-slate-200/80 bg-white px-5 py-4 shadow-[0_9px_30px_rgba(30,41,59,0.04)]">
          <div className="flex min-w-[185px] items-center gap-3 border-r border-slate-200 pr-5">
            <CloudSun className="h-9 w-9 text-[#f5a300]" strokeWidth={1.8} />
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-wide text-slate-400">Thời tiết</p>
              <p className="mt-0.5 text-[20px] font-semibold text-[#26232a]">32°C, Nắng nhẹ</p>
            </div>
          </div>
          <div className="pl-5 text-[13px] leading-5 text-slate-500">
            <p>Độ ẩm: 65%</p>
            <p className="font-medium text-[#087669]">Điều kiện lý tưởng để đổ bê tông</p>
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <MetricCard
          icon={<BarChart3 size={22} />}
          value="75%"
          title="Tiến độ Tổng thể"
          description="Dự kiến hoàn thành đúng hạn vào T9/2024"
          percent={75}
          tone="green"
        />
        <MetricCard
          icon={<Banknote size={23} />}
          value="60%"
          title="Ngân sách Sử dụng"
          description="Đã giải ngân: 4.2 tỷ / 7 tỷ VND"
          percent={60}
          tone="amber"
        />
        <article className="relative min-h-[230px] overflow-hidden rounded-[18px] bg-[#b95f3d] p-6 text-white shadow-[0_10px_30px_rgba(150,72,42,0.18)]">
          <div className="mb-5 flex items-start justify-between">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/14">
              <AlertTriangle size={22} />
            </div>
            <span className="text-[26px] font-bold">03</span>
          </div>
          <h2 className="text-[20px] font-bold">Cảnh báo An toàn</h2>
          <p className="mt-2 text-[14px] text-white/80">Cần kiểm tra ngay tại khu vực Block B</p>
          <button
            type="button"
            className="mt-6 flex h-[34px] w-full items-center justify-center rounded-xl bg-white px-4 text-[14px] font-semibold text-[#9b4e32] transition hover:bg-orange-50"
          >
            Xem Chi Tiết
          </button>
          <AlertTriangle className="absolute -bottom-3 right-4 h-28 w-28 text-white/[0.055]" strokeWidth={1.3} />
        </article>
      </section>

      <section className="mt-8 grid items-start gap-8 xl:grid-cols-[minmax(0,2.1fr)_300px]">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[21px] font-bold">Công trường Đang Hoạt Động</h2>
            <button type="button" className="flex items-center gap-1 text-[14px] font-semibold text-[#087669]">
              Xem tất cả <ArrowRight size={15} />
            </button>
          </div>

          <div className="space-y-4">
            {projects.map((project) => (
              <article
                key={project.name}
                className="grid min-h-[130px] items-center gap-4 rounded-[18px] border border-slate-200/80 bg-white p-4 shadow-[0_9px_30px_rgba(30,41,59,0.04)] sm:grid-cols-[128px_minmax(0,1fr)_auto]"
              >
                <ProjectArtwork variant={project.image} />
                <div className="min-w-0 self-stretch py-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="text-[16px] font-bold leading-5">{project.name}</h3>
                      <p className="mt-1 flex items-center gap-1 text-[13px] text-slate-500">
                        <MapPin size={14} /> {project.location}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase leading-none ${
                        project.statusTone === "green"
                          ? "bg-[#e6f3f0] text-[#087669]"
                          : "bg-[#fff0d5] text-[#936000]"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <div className="mt-5 flex items-center gap-3 text-[12px] text-slate-500">
                    <div className="flex -space-x-2">
                      <span className="h-6 w-6 rounded-full border-2 border-white bg-slate-200" />
                      <span className="h-6 w-6 rounded-full border-2 border-white bg-slate-300" />
                      <span className="grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-[#0b8b7d] text-[9px] font-bold text-white">
                        +{project.extra}
                      </span>
                    </div>
                    <span>{project.workers}</span>
                  </div>
                </div>
                <div className="flex min-w-[82px] flex-col items-center justify-center border-l border-slate-200 px-2 py-3 text-center">
                  <span className="text-[11px] text-slate-500">Hoàn thành</span>
                  <strong className={`mt-1 text-[17px] ${project.statusTone === "green" ? "text-[#087669]" : "text-[#875b00]"}`}>
                    {project.progress}%
                  </strong>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[21px] font-bold">Công việc Sắp tới</h2>
            <button type="button" aria-label="Tùy chọn công việc" className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white">
              <MoreHorizontal size={21} />
            </button>
          </div>

          <div className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white shadow-[0_9px_30px_rgba(30,41,59,0.04)]">
            {upcomingTasks.map((task, index) => (
              <div
                key={`${task.title}-${task.day}`}
                className={`flex gap-4 p-4 ${index !== upcomingTasks.length - 1 ? "border-b border-slate-100" : ""}`}
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#e7f1ef] text-center text-[#087669]">
                  <div className="leading-none">
                    <span className="block text-[11px] font-semibold">{task.month}</span>
                    <strong className="mt-1 block text-[17px]">{task.day}</strong>
                  </div>
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-[15px] font-bold">{task.title}</h3>
                  <p className="mt-0.5 text-[12px] text-slate-500">{task.detail}</p>
                  <div className="mt-2 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[1px] text-slate-500">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        task.tone === "amber" ? "bg-[#a86b00]" : task.tone === "green" ? "bg-[#087669]" : "bg-[#9b4e32]"
                      }`}
                    />
                    {task.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="mt-4 flex h-[58px] w-full items-center justify-center gap-3 rounded-[18px] border-2 border-dashed border-slate-300 bg-transparent text-[15px] font-semibold text-slate-600 transition hover:border-[#087669] hover:bg-white hover:text-[#087669]"
          >
            <Plus size={20} /> Thêm công việc
          </button>
        </aside>
      </section>
    </main>
  );
};

export default InstructorDashboardPage;
