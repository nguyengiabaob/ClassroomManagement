import { useEffect, useState } from "react";
import { Button, Divider, Form, Input, message } from "antd";
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
import type { userDataRegister } from "../../models/userData.model";
import {
  forgetPassword,
  getCurrentUser,
  login,
  loginWithGoogle,
  register,
  type userRegister,
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
            message.success(isVi ? "Đăng nhập Google thành công!" : "Google login successful!");
            navigation("/", { replace: true });
          } catch {
            message.error(isVi ? "Đăng nhập Google thất bại." : "Google login failed. Please try again.");
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

  const handleRegisterSubmit = async (values: userRegister) => {
    setLoading(true);
    try {
      const result = await register(values);
      if (result.status !== 200) {
        message.error(result.data?.message || "Unable to create account.");
        return;
      }
      message.success(
        isVi
          ? "Đã tạo tài khoản. Vui lòng kiểm tra email xác thực."
          : "Account created. Please check your verification email.",
      );
      setAuthMode("login");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (values: userRegister) => {
    if (!values.email) return;
    setLoading(true);
    try {
      const result = await forgetPassword(values.email);
      if (result.status === 200) message.success(result.data?.message);
      else message.error(result.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async (values: userDataRegister) => {
    if (!values.userName || !values.password) return;
    setLoading(true);
    try {
      const result = await login(values.userName, values.password);
      if (!result.data || result.status !== 200) {
        message.error(isVi ? "Không thể đăng nhập. Vui lòng kiểm tra lại thông tin." : "Unable to login. Please check your details.");
        return;
      }
      navigation("/dashboard", { replace: true });
    } catch {
      message.error(isVi ? "Không thể đăng nhập. Vui lòng thử lại." : "Unable to login. Please try again.");
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
            <Form layout="vertical" onFinish={handleSendCode} requiredMark={false}>
              <Form.Item label={isVi ? "Mã tổ chức / Workspace" : "Organization / Workspace"} name="workspace">
                <Input prefix={<Building2 size={18} />} placeholder={isVi ? "VD: CONSTRUCT-SGN hoặc tên công ty" : "e.g. CONSTRUCT-SGN or company name"} size="large" />
              </Form.Item>
              <Form.Item label={isVi ? "Email công vụ" : "Work email"} name="userName" rules={[{ required: true, message: isVi ? "Vui lòng nhập email" : "Please enter your email" }]}>
                <Input prefix={<Mail size={18} />} placeholder="ten.nhanvien@congty.com" size="large" autoComplete="username" />
              </Form.Item>
              <Form.Item label={isVi ? "Mật khẩu" : "Password"} name="password" rules={[{ required: true, message: isVi ? "Vui lòng nhập mật khẩu" : "Please enter your password" }]}>
                <Input.Password prefix={<LockKeyhole size={18} />} placeholder="••••••••" size="large" autoComplete="current-password" />
              </Form.Item>
              <div className="form-options">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <label className="remember"><input type="checkbox" /> {isVi ? "Ghi nhớ phiên đăng nhập" : "Remember this session"}</label>
                </Form.Item>
                <button type="button" className="text-button" onClick={() => setAuthMode("forgotpassword")}>{isVi ? "Quên mật khẩu?" : "Forgot password?"}</button>
              </div>
              <Button className="login-submit" type="primary" htmlType="submit" block loading={loading}>
                {isVi ? "Đăng nhập hệ thống" : "Sign in to system"}<LogIn size={19} />
              </Button>
              <Divider plain>{isVi ? "Hoặc đăng nhập doanh nghiệp bằng" : "Or continue with"}</Divider>
              {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
                <div id="google-login-button" className={`google-login${googleLoading ? " is-loading" : ""}`} aria-busy={googleLoading} />
              ) : (
                <div className="google-placeholder">Google Workspace <span>{isVi ? "chưa được cấu hình" : "is not configured"}</span></div>
              )}
              <p className="create-account">
                {isVi ? "Chưa có tài khoản doanh nghiệp?" : "Need an enterprise account?"}{" "}
                <button type="button" onClick={() => setAuthMode("register")}>{isVi ? "Đăng ký ngay" : "Create one"}</button>
              </p>
            </Form>
          )}

          {authMode === "register" && (
            <Form layout="vertical" onFinish={handleRegisterSubmit} requiredMark={false}>
              <Form.Item label={isVi ? "Họ và tên" : "Full name"} name="name" rules={[{ required: true }]}>
                <Input prefix={<User size={18} />} placeholder="Nguyen Gia Bao" size="large" />
              </Form.Item>
              <Form.Item label="Email" name="email" rules={[{ required: true, type: "email" }]}>
                <Input prefix={<Mail size={18} />} placeholder="email@example.com" size="large" />
              </Form.Item>
              <Form.Item label={isVi ? "Số điện thoại" : "Phone number"} name="phone" rules={[{ required: true }]}>
                <Input prefix={<Phone size={18} />} placeholder="+84 123 456 789" size="large" />
              </Form.Item>
              <Button className="login-submit" type="primary" htmlType="submit" block loading={loading}>{isVi ? "Tạo tài khoản" : "Create account"}<ArrowRight size={19} /></Button>
              <button type="button" className="back-button" onClick={() => setAuthMode("login")}><ArrowLeft size={17} />{isVi ? "Quay lại đăng nhập" : "Back to login"}</button>
            </Form>
          )}

          {authMode === "forgotpassword" && (
            <Form layout="vertical" onFinish={resetPassword} requiredMark={false}>
              <Form.Item label="Email" name="email" rules={[{ required: true, type: "email" }]}>
                <Input prefix={<Mail size={18} />} placeholder="email@example.com" size="large" />
              </Form.Item>
              <Button className="login-submit" type="primary" htmlType="submit" block loading={loading}>{isVi ? "Gửi liên kết đặt lại" : "Send reset link"}<ArrowRight size={19} /></Button>
              <button type="button" className="back-button" onClick={() => setAuthMode("login")}><ArrowLeft size={17} />{isVi ? "Quay lại đăng nhập" : "Back to login"}</button>
            </Form>
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
