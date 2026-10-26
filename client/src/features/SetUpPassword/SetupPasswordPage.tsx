import { type FormEvent, useState } from "react";
import { ArrowLeft, ArrowRight, Building2, Check, Eye, EyeOff, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { setPassword } from "../login/loginService";
import "../login/LoginPage.css";
import "./SetupPasswordPage.css";

export default function SetupPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [password, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const token = searchParams.get("token")?.trim() ?? "";
  const passwordsMatch = confirmation.length > 0 && password === confirmation;

  const handleSetupPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading || !token) return;
    if (password !== confirmation) {
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }
    setLoading(true);
    try {
      const result = await setPassword(token, password);
      if (result.status !== 200) {
        toast.error(result.data?.message || "Không thể thiết lập mật khẩu.");
        return;
      }
      toast.success("Đã lưu mật khẩu. Bạn có thể đăng nhập ngay.");
      navigate("/login", { replace: true });
    } catch {
      toast.error("Không thể thiết lập mật khẩu. Vui lòng thử lại hoặc yêu cầu liên kết mới.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page setup-password-page" lang="vi">
      <div className="login-page__shade" />
      <header className="login-header">
        <Link className="brand" to="/login" aria-label="ConstructFriendly — Đăng nhập">
          <span className="brand__mark"><Building2 size={27} strokeWidth={2.2} /></span>
          <span><strong>ConstructFriendly</strong><small>Enterprise Construction Cloud</small></span>
        </Link>
        <div className="security-pill"><ShieldCheck size={17} /> Bảo vệ tài khoản của bạn</div>
      </header>

      <div className="login-content">
        <section className="auth-card" aria-labelledby="setup-title">
          <div className="auth-card__accent" />
          <div className="setup-password-icon"><KeyRound size={28} /></div>
          <div className="auth-card__heading">
            <p className="auth-eyebrow"><span />THIẾT LẬP BẢO MẬT</p>
            <h1 id="setup-title">Tạo mật khẩu mới</h1>
            <p>Thiết lập mật khẩu để truy cập không gian làm việc của bạn.</p>
          </div>

          {!token ? (
            <div className="setup-password-alert" role="alert">
              Liên kết không hợp lệ hoặc thiếu mã xác thực. Vui lòng quay lại trang đăng nhập để yêu cầu liên kết khôi phục mới.
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleSetupPassword} aria-busy={loading}>
              <div className="auth-field">
                <Label htmlFor="new-password">Mật khẩu mới</Label>
                <div className="auth-input">
                  <LockKeyhole size={18} />
                  <Input id="new-password" name="password" type={showPassword ? "text" : "password"} minLength={6} autoComplete="new-password" placeholder="Nhập mật khẩu mới" value={password} onChange={(event) => setNewPassword(event.target.value)} aria-describedby="password-hint" disabled={loading} required />
                  <button className="setup-password-toggle" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"} aria-pressed={showPassword}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p id="password-hint" className={`setup-password-hint${password.length >= 6 ? " is-valid" : ""}`}><Check size={14} /> Sử dụng ít nhất 6 ký tự</p>
              </div>
              <div className="auth-field">
                <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
                <div className="auth-input">
                  <LockKeyhole size={18} />
                  <Input id="confirm-password" name="confirm" type={showPassword ? "text" : "password"} minLength={6} autoComplete="new-password" placeholder="Nhập lại mật khẩu mới" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} aria-invalid={confirmation.length > 0 && !passwordsMatch} aria-describedby={confirmation ? "password-match" : undefined} disabled={loading} required />
                </div>
                {confirmation && <p id="password-match" className={`setup-password-hint${passwordsMatch ? " is-valid" : " is-error"}`} aria-live="polite">{passwordsMatch ? "Mật khẩu xác nhận đã khớp." : "Mật khẩu xác nhận chưa khớp."}</p>}
              </div>
              <Button className="login-submit" type="submit" disabled={loading || password.length < 6 || !passwordsMatch}>
                {loading ? <><Spinner />Đang lưu mật khẩu…</> : <>Lưu mật khẩu mới<ArrowRight size={19} /></>}
              </Button>
            </form>
          )}
          <Link className="back-button" to="/login"><ArrowLeft size={17} />Quay lại đăng nhập</Link>
          <div className="support-box"><ShieldCheck size={22} /><p>Chọn mật khẩu riêng cho tài khoản này và không chia sẻ với người khác.</p></div>
        </section>

        <section className="hero-panel" aria-labelledby="setup-hero-title">
          <p className="hero-kicker"><ShieldCheck size={16} /> Sẵn sàng kết nối công việc</p>
          <h2 id="setup-hero-title">Một bước bảo mật.<br />Kết nối mọi công trình.</h2>
          <p className="hero-description">Truy cập dự án, hồ sơ và đội ngũ của bạn trên cùng một nền tảng. Bắt đầu bằng một mật khẩu dành riêng cho bạn.</p>
          <div className="setup-password-steps">
            <div><span>01</span><p><strong>Tạo mật khẩu</strong>Chọn mật khẩu dễ nhớ với bạn, khó đoán với người khác.</p></div>
            <div><span>02</span><p><strong>Xác nhận và lưu</strong>Nhập lại mật khẩu để đảm bảo thông tin chính xác.</p></div>
            <div><span>03</span><p><strong>Trở lại công việc</strong>Đăng nhập và tiếp tục quản lý dự án của bạn.</p></div>
          </div>
        </section>
      </div>
      <footer className="login-footer"><p>© 2026 ConstructFriendly Corp. Nền tảng quản lý dự án & công trường.</p><span>Enterprise Construction Cloud</span></footer>
    </main>
  );
}
