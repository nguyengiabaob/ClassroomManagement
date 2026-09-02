import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  message,
  Row,
  Typography,
} from "antd";
import {
  ArrowLeftOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
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
const { Title, Text } = Typography;

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

const LoginPage = () => {
  const navigation = useNavigate();
  const [loading, setLoading] = useState(false);

  const [authMode, setAuthMode] = useState("login");
  const [googleLoading, setGoogleLoading] = useState(false);
  const dispatch = useDispatch();
  //const [user, setUser] = useState<userDataModel | null>(null);
  useEffect(() => {
    const savedUser = localStorage.getItem("user_session");
    if (savedUser) {
      //setUser(JSON.parse(savedUser));
    }
  }, []);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  console.log(clientId);
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

            message.success("Login with Google successful!");
            navigation("/", { replace: true });
          } catch {
            message.error("Google login failed. Please try again.");
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
        width: container.clientWidth || 400,
      });
    };

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]',
    );
    if (existingScript) {
      if (window.google) renderGoogleButton();
      else
        existingScript.addEventListener("load", renderGoogleButton, {
          once: true,
        });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    document.head.appendChild(script);
  }, [authMode, navigation]);

  const handleRegisterSubmit = async (values: userRegister) => {
    setLoading(true);
    const result = await register(values);
    if (result.data) {
      if (result.status === 200) {
        message.success({
          content: result?.data?.message,
          duration: 2,
        });
      } else {
        message.error({
          content: result?.data?.message,
          duration: 2,
        });
      }
    }

    setTimeout(() => {
      setLoading(false);
      message.success(
        "Account created! A verification link has been sent to your email.",
      );
      setAuthMode("login");
    }, 1500);
  };

  const resetPassword = async (values: userRegister) => {
    if (values.email) {
      setLoading(true);
      const result = await forgetPassword(values.email);

      if (result.status == 200) {
        message.success({
          content: result.data?.message,
        });
      } else {
        message.error({
          content: result.data?.message,
        });
      }
      setLoading(false);
      return;
    }
    message.error({
      content: "user invalid",
    });
    return;
  };

  const onLogin = async (userName: string, password: string) => {
    try {
      const result = await login(userName, password);

      console.log("1215456", result);

      if (!result.data || result.status != 200) {
        message.error("Error can't login");
        return false;
      }
      return true;
    } catch (error) {
      console.log("dasdasd", error);
      return false;
    }
  };

  const handleSendCode = async (values: userDataRegister) => {
    if (values.userName && values.password) {
      setLoading(true);
      console.log("4556", values);
      const result = await onLogin(values.userName, values.password);

      if (result === true) {
        setTimeout(() => {
          setAuthMode("verify");
          //message.success("Login successful!");
          navigation("/dashboard", {
            replace: true,
          });
        }, 1000);
      } else {
        setLoading(false);
      }
    } else {
      message.error("username and password are required");
    }
    setLoading(false);
  };

  // const handleVerifyCode = async (values: userDataAcccessModel) => {
  //   setLoading(true);
  //   const userLogin = await verifyAccessCode(phoneNumber, values.code);
  //   if (userLogin.data) {
  //     const isInstructor = values.code === "123456";
  //     const userData = {
  //       phone: phoneNumber,
  //       role: isInstructor ? "instructor" : "student",
  //       name: userLogin?.data?.name,
  //       accessToken: userLogin?.data?.accessToken,
  //       refreshToken: userLogin?.data?.refreshToken,
  //     };
  //     //setUser(userData);

  //     localStorage.setItem("user_session", JSON.stringify(userData));
  //     dispatch(saveUserlogined(userData));
  //     setLoading(false);
  //     message.success("Login successful!");

  //     setTimeout(() => {
  //       if (isInstructor === true) navigate("/dashboard/instructor");
  //       else {
  //         navigate("/dashboard/student");
  //       }
  //     }, 500);
  //   }
  // };
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <Card className="w-full max-w-lg shadow-2xl rounded-2xl border-0 overflow-hidden">
        <div className="bg-blue-600 p-8 text-center text-white">
          <Title level={2} style={{ color: "white", margin: 0 }}>
            Constructor Office
          </Title>
          <Text style={{ color: "rgba(255,255,255,0.8)" }}>
            {authMode === "login" && "Welcome back! Please login."}
            {authMode === "register" && "Create your account to get started."}
            {authMode === "verify" && "Verify your identity."}

            {authMode === "forgotpassword" && "Forgot Pasword."}
          </Text>
        </div>

        <div className="p-8">
          {authMode === "login" && (
            <Form layout="vertical" onFinish={handleSendCode}>
              <Form.Item
                label="Username"
                name="userName"
                rules={[
                  {
                    required: true,
                    message: "Please enter your username",
                  },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="+1 123 456 7890"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Please enter your password",
                  },
                ]}
              >
                <Input
                  prefix={<LockOutlined />}
                  placeholder="Enter your password"
                  size="large"
                  type="password"
                />
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
                className="h-12 rounded-lg font-bold"
              >
                Login
              </Button>
              <Divider>Or</Divider>
              {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
                <div
                  id="google-login-button"
                  className={
                    googleLoading ? "pointer-events-none opacity-60" : ""
                  }
                  aria-busy={googleLoading}
                />
              ) : (
                <Text type="danger" className="block text-center">
                  Google login is not configured.
                </Text>
              )}
              <Divider />
              <div className="text-center">
                <Text type="secondary">Don't have an account? </Text>
                <Button
                  type="link"
                  onClick={() => setAuthMode("register")}
                  className="p-0"
                >
                  Sign Up Now
                </Button>
              </div>

              <Button
                type="link"
                onClick={() => setAuthMode("forgotpassword")}
                className="p-0"
              >
                Forgot password
              </Button>
            </Form>
          )}

          {authMode === "register" && (
            <Form layout="vertical" onFinish={handleRegisterSubmit}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Full Name"
                    name="name"
                    rules={[{ required: true }]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="Nguyen Gia Bao"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Email Address"
                name="email"
                rules={[{ required: true, type: "email" }]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="email@example.com"
                />
              </Form.Item>

              <Form.Item
                label="Phone Number"
                name="phone"
                rules={[{ required: true }]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="+1 123..." />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
                className="h-12 rounded-lg font-bold"
              >
                Create Account
              </Button>

              <Button
                type="link"
                block
                icon={<ArrowLeftOutlined />}
                onClick={() => setAuthMode("login")}
                className="mt-2"
              >
                Back to Login
              </Button>
            </Form>
          )}

          {authMode === "forgotpassword" && (
            <Form layout="vertical" onFinish={resetPassword}>
              <Form.Item
                label="Email Address"
                name="email"
                rules={[{ required: true, type: "email" }]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="email@example.com"
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
                className="h-12 rounded-lg font-bold"
              >
                Reset Password
              </Button>

              <Button
                type="link"
                block
                icon={<ArrowLeftOutlined />}
                onClick={() => setAuthMode("login")}
                className="mt-2"
              >
                Back to Login
              </Button>
            </Form>
          )}
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
