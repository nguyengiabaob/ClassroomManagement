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
import { login, register, type userRegister } from "./loginService";
const { Title, Text } = Typography;
const LoginPage = () => {
  const [loading, setLoading] = useState(false);

  const [authMode, setAuthMode] = useState("login");
  //const [user, setUser] = useState<userDataModel | null>(null);
  useEffect(() => {
    const savedUser = localStorage.getItem("user_session");
    if (savedUser) {
      //setUser(JSON.parse(savedUser));
    }
  }, []);
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

  const resetPassword = async (email: string) => {
    if (email) {
    }
  };

  const onLogin = async (userName: string, password: string) => {
    const result = await login(userName, password);

    if (!result.data) {
      message.error("Error can't login");
      return false;
    }
    return true;
  };

  const handleSendCode = async (values: userDataRegister) => {
    if (values.userName && values.password) {
      setLoading(true);
      const result = await onLogin(values.userName, values.password);
      if (result) {
        setTimeout(() => {
          setLoading(false);
          setAuthMode("verify");
          message.success("Login successful!");
        }, 1000);
      }
    } else {
      message.error("username and password are required");
    }
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
            Login
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
                name="username"
                rules={[
                  {
                    required: true,
                    message: "Please enter your phone number or username",
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
                name="password "
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
                onClick={() => setAuthMode("register")}
                className="p-0"
              >
                forgot password
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
            <Form layout="vertical" onFinish={handleRegisterSubmit}>
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
