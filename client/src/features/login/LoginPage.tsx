import { type FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Building2,
  ClipboardCheck,
  FolderOpen,
  Headphones,
  LockKeyhole,
  LogIn,
  Mail,
  Network,
  Phone,
  ShieldCheck,
  User,
  WalletCards,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
  forgetPassword,
  getCurrentUser,
  login,
  loginWithGoogle,
  register,
} from "./loginService";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { saveUserlogined } from "@/redux/usersReducer";
import "./LoginPage.css";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: Record<string, string | number>,
          ) => void;
        };
      };
    };
  }
}

const features = [
  {
    icon: ClipboardCheck,
    title: "Quản lý hiện trường Real-time",
    titleEn: "Real-time site management",
    description: "Nhật ký thi công điện tử, điểm danh GPS, QA/QC & HSE.",
    descriptionEn: "Digital site logs, GPS attendance, QA/QC and HSE.",
    link: "Cập nhật trực tiếp",
    linkEn: "Live updates",
  },
  {
    icon: WalletCards,
    title: "Quản trị Tài chính & Dòng tiền",
    titleEn: "Finance & cash-flow control",
    description: "BOQ, ngân sách, thanh toán nhà thầu phụ & phát sinh VO.",
    descriptionEn: "BOQ, budgets, subcontractor payments and variations.",
    link: "Chính xác ngân sách",
    linkEn: "Budget accuracy",
  },
  {
    icon: FolderOpen,
    title: "Hồ sơ số & Bản vẽ",
    titleEn: "Digital records & drawings",
    description: "Bản vẽ thiết kế, hồ sơ nghiệm thu, tra cứu nhanh tại công trường.",
    descriptionEn: "Drawings and handover records, ready on every job site.",
    link: "Đồng bộ BIM/CAD",
    linkEn: "BIM/CAD sync",
  },
];

const LoginPage = () => {
  const navigation = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [language, setLanguage] = useState<"vi" | "en">("vi");
  const isVi = language === "vi";

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (authMode !== "login") return;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const renderGoogleButton = () => {
      const container = document.getElementById("google-login-button");
      if (!container || !window.google) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          setGoogleLoading(true);
          try {
            const { data } = await loginWithGoogle(credential);
            localStorage.setItem("access_token", data.accessToken);
            localStorage.setItem("refresh_token", data.refreshToken);
            const { data: currentUser } = await getCurrentUser();
            localStorage.setItem(
              "user_session",
              JSON.stringify({
                ...currentUser,
                authentication: data.authenticated,
              }),
            );
            dispatch(saveUserlogined(currentUser));
            toast.success(isVi ? "Đăng nhập Google thành công!" : "Google login successful!");
            navigation("/", { replace: true });
          } catch {
            toast.error(isVi ? "Đăng nhập Google thất bại." : "Google login failed. Please try again.");
          } finally {
            setGoogleLoading(false);
          }
        },
      });

      container.replaceChildren();
      window.google.accounts.id.renderButton(container, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        width: container.clientWidth || 440,
      });
    };

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]',
    );
    if (existingScript) {
      if (window.google) renderGoogleButton();
      else existingScript.addEventListener("load", renderGoogleButton, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    document.head.appendChild(script);
  }, [authMode, dispatch, isVi, navigation]);

  const handleRegisterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    setLoading(true);
    try {
      const result = await register({
        name: String(values.get("name") ?? ""),
        email: String(values.get("email") ?? ""),
        phone: String(values.get("phone") ?? ""),
      });
      if (result.status !== 200) {
        toast.error(result.data?.message || "Unable to create account.");
        return;
      }
      toast.success(
        isVi
          ? "Đã tạo tài khoản. Vui lòng kiểm tra email xác thực."
          : "Account created. Please check your verification email.",
      );
      setAuthMode("login");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "");
    if (!email) return;
    setLoading(true);
    try {
      const result = await forgetPassword(email);
      if (result.status === 200) toast.success(result.data?.message);
      else toast.error(result.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const userName = String(data.get("userName") ?? "");
    const password = String(data.get("password") ?? "");
    if (!userName || !password) return;
    setLoading(true);
    try {
      const result = await login(userName, password);
      if (!result.data || result.status !== 200) {
        toast.error(isVi ? "Không thể đăng nhập. Vui lòng kiểm tra lại thông tin." : "Unable to login. Please check your details.");
        return;
      }
      navigation("/dashboard", { replace: true });
    } catch {
      toast.error(isVi ? "Không thể đăng nhập. Vui lòng thử lại." : "Unable to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const modeCopy =
    authMode === "register"
      ? {
          eyebrow: isVi ? "KHỞI TẠO TÀI KHOẢN" : "CREATE AN ACCOUNT",
          title: isVi ? "Đăng ký doanh nghiệp" : "Create your account",
          subtitle: isVi ? "Bắt đầu quản lý dự án trên một nền tảng." : "Start managing projects in one place.",
        }
      : authMode === "forgotpassword"
        ? {
            eyebrow: isVi ? "KHÔI PHỤC TRUY CẬP" : "RESTORE ACCESS",
            title: isVi ? "Quên mật khẩu?" : "Forgot your password?",
            subtitle: isVi ? "Nhập email để nhận liên kết đặt lại mật khẩu." : "Enter your email to receive a reset link.",
          }
        : {
            eyebrow: isVi ? "CỔNG XÁC THỰC AN TOÀN" : "SECURE AUTHENTICATION",
            title: isVi ? "Đăng nhập hệ thống" : "Sign in to your workspace",
            subtitle: isVi ? "Cổng thông tin quản trị & điều hành thi công trực tuyến" : "Your online construction operations portal",
          };

  return (
    <main className="login-page">
      <div className="login-page__shade" />
      <header className="login-header">
        <a className="brand" href="/login" aria-label="ConstructFriendly login">
          <span className="brand__mark"><Building2 size={27} strokeWidth={2.2} /></span>
          <span>
            <strong>ConstructFriendly</strong>
            <small>Enterprise Construction Cloud</small>
          </span>
        </a>
        <div className="login-header__actions">
          <div className="security-pill"><ShieldCheck size={17} /> {isVi ? "Hệ thống bảo mật TLS 1.3 Enterprise" : "TLS 1.3 Enterprise security"}</div>
          <div className="language-switch" aria-label="Language">
            <button type="button" className={isVi ? "active" : ""} onClick={() => setLanguage("vi")} aria-pressed={isVi}>VN</button>
            <button type="button" className={!isVi ? "active" : ""} onClick={() => setLanguage("en")} aria-pressed={!isVi}>EN</button>
          </div>
        </div>
      </header>

      <section className="login-content">
        <section className="auth-card" aria-labelledby="auth-title">
          <div className="auth-card__accent" />
          <div className="auth-card__heading">
            <p className="auth-eyebrow"><span />{modeCopy.eyebrow}</p>
            <h1 id="auth-title">{modeCopy.title}</h1>
            <p>{modeCopy.subtitle}</p>
          </div>

          {authMode === "login" && (
            <form className="auth-form" onSubmit={handleSendCode}>
              <div className="auth-field">
                <Label htmlFor="workspace">{isVi ? "Mã tổ chức / Workspace" : "Organization / Workspace"}</Label>
                <div className="auth-input"><Building2 size={18} /><Input id="workspace" name="workspace" placeholder={isVi ? "VD: CONSTRUCT-SGN hoặc tên công ty" : "e.g. CONSTRUCT-SGN or company name"} /></div>
              </div>
              <div className="auth-field">
                <Label htmlFor="userName">{isVi ? "Email công vụ" : "Work email"}</Label>
                <div className="auth-input"><Mail size={18} /><Input id="userName" name="userName" type="email" placeholder="ten.nhanvien@congty.com" autoComplete="username" required /></div>
              </div>
              <div className="auth-field">
                <Label htmlFor="password">{isVi ? "Mật khẩu" : "Password"}</Label>
                <div className="auth-input"><LockKeyhole size={18} /><Input id="password" name="password" type="password" placeholder="••••••••" autoComplete="current-password" required /></div>
              </div>
              <div className="form-options">
                <label className="remember"><Checkbox name="remember" /> {isVi ? "Ghi nhớ phiên đăng nhập" : "Remember this session"}</label>
                <button type="button" className="text-button" onClick={() => setAuthMode("forgotpassword")}>{isVi ? "Quên mật khẩu?" : "Forgot password?"}</button>
              </div>
              <Button className="login-submit" type="submit" disabled={loading}>
                {loading ? <Spinner /> : <>{isVi ? "Đăng nhập hệ thống" : "Sign in to system"}<LogIn size={19} /></>}
              </Button>
              <div className="auth-divider"><Separator /><span>{isVi ? "Hoặc đăng nhập doanh nghiệp bằng" : "Or continue with"}</span></div>
              {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
                <div id="google-login-button" className={`google-login${googleLoading ? " is-loading" : ""}`} aria-busy={googleLoading} />
              ) : (
                <div className="google-placeholder">Google Workspace <span>{isVi ? "chưa được cấu hình" : "is not configured"}</span></div>
              )}
              <p className="create-account">
                {isVi ? "Chưa có tài khoản doanh nghiệp?" : "Need an enterprise account?"}{" "}
                <button type="button" onClick={() => setAuthMode("register")}>{isVi ? "Đăng ký ngay" : "Create one"}</button>
              </p>
            </form>
          )}

          {authMode === "register" && (
            <form className="auth-form" onSubmit={handleRegisterSubmit}>
              <div className="auth-field"><Label htmlFor="register-name">{isVi ? "Họ và tên" : "Full name"}</Label><div className="auth-input"><User size={18} /><Input id="register-name" name="name" placeholder="Nguyen Gia Bao" required /></div></div>
              <div className="auth-field"><Label htmlFor="register-email">Email</Label><div className="auth-input"><Mail size={18} /><Input id="register-email" name="email" type="email" placeholder="email@example.com" required /></div></div>
              <div className="auth-field"><Label htmlFor="register-phone">{isVi ? "Số điện thoại" : "Phone number"}</Label><div className="auth-input"><Phone size={18} /><Input id="register-phone" name="phone" type="tel" placeholder="+84 123 456 789" required /></div></div>
              <Button className="login-submit" type="submit" disabled={loading}>{loading ? <Spinner /> : <>{isVi ? "Tạo tài khoản" : "Create account"}<ArrowRight size={19} /></>}</Button>
              <button type="button" className="back-button" onClick={() => setAuthMode("login")}><ArrowLeft size={17} />{isVi ? "Quay lại đăng nhập" : "Back to login"}</button>
            </form>
          )}

          {authMode === "forgotpassword" && (
            <form className="auth-form" onSubmit={resetPassword}>
              <div className="auth-field"><Label htmlFor="reset-email">Email</Label><div className="auth-input"><Mail size={18} /><Input id="reset-email" name="email" type="email" placeholder="email@example.com" required /></div></div>
              <Button className="login-submit" type="submit" disabled={loading}>{loading ? <Spinner /> : <>{isVi ? "Gửi liên kết đặt lại" : "Send reset link"}<ArrowRight size={19} /></>}</Button>
              <button type="button" className="back-button" onClick={() => setAuthMode("login")}><ArrowLeft size={17} />{isVi ? "Quay lại đăng nhập" : "Back to login"}</button>
            </form>
          )}

          <div className="support-box">
            <Headphones size={21} />
            <p><strong>{isVi ? "Hỗ trợ kỹ sư công trường:" : "Site engineer support:"}</strong> {isVi ? "Hotline kỹ thuật" : "Technical hotline"} <a href="tel:19006868">1900 6868</a> {isVi ? "hoặc liên hệ quản trị hệ thống." : "or contact your system administrator."}</p>
          </div>
        </section>

        <section className="hero-panel">
          <p className="hero-kicker"><Wrench size={16} />{isVi ? "Nền tảng số hóa ngành xây dựng" : "Construction digitalization platform"}</p>
          <h2>{isVi ? "ConstructFriendly Suite - Quản trị công trường & doanh nghiệp toàn diện" : "ConstructFriendly Suite - Complete site and enterprise control"}</h2>
          <p className="hero-description">{isVi ? "Giải pháp số hóa toàn diện từ văn phòng đến hiện trường thi công. Kết nối dữ liệu đa dự án, chuẩn hóa quy trình nghiệm thu và kiểm soát chi phí thời gian thực." : "A complete digital solution from head office to the job site. Connect every project, standardize quality control and track costs in real time."}</p>

          <div className="feature-grid">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article className="feature-card" key={feature.title}>
                  <span className="feature-card__icon"><Icon size={23} /></span>
                  <h3>{isVi ? feature.title : feature.titleEn}</h3>
                  <p>{isVi ? feature.description : feature.descriptionEn}</p>
                  <span className="feature-card__link">{isVi ? feature.link : feature.linkEn}<ArrowRight size={15} /></span>
                </article>
              );
            })}
          </div>

          <div className="trust-strip">
            <div><span><Network size={22} /></span><p>{isVi ? "Mạng lưới tin cậy" : "Trusted network"}<strong>{isVi ? "120+ Dự án & Nhà thầu đang tin dùng" : "Trusted by 120+ projects & contractors"}</strong></p></div>
            <div><span><Award size={22} /></span><p>{isVi ? "An toàn dữ liệu" : "Data protection"}<strong>{isVi ? "Tiêu chuẩn bảo mật ISO 27001" : "ISO 27001 security standard"}</strong></p></div>
          </div>
        </section>
      </section>

      <footer className="login-footer">
        <p>© 2026 ConstructFriendly Corp. {isVi ? "Nền tảng quản lý dự án & công trường số 1 Việt Nam." : "Enterprise construction management platform."}</p>
        <nav aria-label="Footer"><a href="#terms">{isVi ? "Điều khoản dịch vụ" : "Terms"}</a><a href="#privacy">{isVi ? "Bảo mật thông tin" : "Privacy"}</a><a href="#support">{isVi ? "Trung tâm hỗ trợ" : "Support"}</a></nav>
      </footer>
    </main>
  );
};

export default LoginPage;
