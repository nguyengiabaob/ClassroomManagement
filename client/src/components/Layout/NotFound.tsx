import { ArrowLeft, Compass, Home } from "lucide-react";
import { Link, useNavigate } from "react-router";
import "./NotFound.css";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <section
      aria-labelledby="notfound-title"
      className="nf-page flex min-h-[calc(100vh-10rem)] w-full flex-col items-center justify-center px-4 py-12 text-center"
    >
      <div className="mx-auto flex max-w-md flex-col items-center">
        {/* Classic Centered 404 Display with Floating Digits & Pulse Badge */}
        <div className="nf-reveal-1 relative select-none">
          <p
            aria-label="404"
            className="flex items-center justify-center gap-1 text-[120px] font-black leading-none tracking-tighter text-slate-200 sm:text-[156px]"
          >
            <span className="nf-digit-left">4</span>
            <span className="nf-digit-zero text-[#00796f]/20">0</span>
            <span className="nf-digit-right">4</span>
          </p>

          <div className="absolute inset-0 flex items-center justify-center">
            <span className="relative inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-[#00796f]">
              <span className="nf-pulse" aria-hidden="true" />
              <Compass className="nf-compass-icon size-4" />
              <span>Không tìm thấy trang</span>
            </span>
          </div>
        </div>

        {/* Title & Short Description */}
        <h1
          id="notfound-title"
          className="nf-reveal-2 mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
        >
          Rất tiếc, trang này không tồn tại
        </h1>

        <p className="nf-reveal-3 mt-3 text-sm leading-6 text-slate-500 sm:text-base">
          Đường dẫn bạn truy cập có thể bị sai, đã bị xóa hoặc tạm thời không
          khả dụng.
        </p>

        {/* Primary & Secondary Centered Actions */}
        <div className="nf-reveal-4 mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="nf-btn nf-btn-back inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900"
          >
            <ArrowLeft className="size-4" />
            Quay lại
          </button>

          <Link
            to="/dashboard"
            className="nf-btn inline-flex h-11 items-center gap-2 rounded-xl bg-[#00796f] px-6 text-sm font-semibold text-white hover:bg-[#00635b]"
          >
            <Home className="size-4" />
            Về trang chủ
          </Link>
        </div>
      </div>
    </section>
  );
}

export default NotFound;
