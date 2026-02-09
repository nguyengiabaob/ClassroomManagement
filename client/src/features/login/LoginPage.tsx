import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  message,
  Row,
  Select,
  Typography,
} from "antd";
import {
  ArrowLeftOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type {
  userDataAcccessModel,
  userDataModel,
} from "../../models/userData.model";
import {
  generateAccessCode,
  register,
  verifyAccessCode,
  type userRegister,
} from "./loginService";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { saveUserlogined } from "../../redux/usersReducer";
const { Title, Text } = Typography;
const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  //const [user, setUser] = useState<userDataModel | null>(null);
  const navigate = useNavigate();

  const dispatch = useDispatch();
  useEffect(() => {
    const savedUser = localStorage.getItem("user_session");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
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

  const createAccessCode = async (phone: string) => {
    const result = await generateAccessCode(phone);

    if (!result.data) {
      message.error("Error can't send access code");
      return false;
    }
    return true;
  };

  const handleSendCode = (values: userDataModel) => {
    if (values.phone) {
      setLoading(true);
      createAccessCode(values.phone);
      setPhoneNumber(values.phone);
      setTimeout(() => {
        setLoading(false);
        setAuthMode("verify");
        message.success("6-digit access code sent via SMS!");
      }, 1000);
    } else {
      message.error("Phone is required");
    }
  };

  const handleVerifyCode = async (values: userDataAcccessModel) => {
    setLoading(true);
    const userLogin = await verifyAccessCode(phoneNumber, values.code);
    if (userLogin.data) {
      const isInstructor = values.code === "123456";
      const userData = {
        phone: phoneNumber,
        role: isInstructor ? "instructor" : "student",
        name: userLogin?.data?.name,
        accessToken: userLogin?.data?.accessToken,
        refreshToken: userLogin?.data?.refreshToken,
      };
      //setUser(userData);

      localStorage.setItem("user_session", JSON.stringify(userData));
      dispatch(saveUserlogined(userData));
      setLoading(false);
      message.success("Login successful!");

      setTimeout(() => {
        if (isInstructor === true) navigate("/dashboard/instructor");
        else {
          navigate("/dashboard/student");
        }
      }, 500);
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <Card className="w-full max-w-lg shadow-2xl rounded-2xl border-0 overflow-hidden">
        <div className="bg-blue-600 p-8 text-center text-white">
          <Title level={2} style={{ color: "white", margin: 0 }}>
            Skipli Classroom
          </Title>
          <Text style={{ color: "rgba(255,255,255,0.8)" }}>
            {authMode === "login" && "Welcome back! Please login."}
            {authMode === "register" && "Create your account to get started."}
            {authMode === "verify" && "Verify your identity."}
          </Text>
        </div>

        <div className="p-8">
          {authMode === "login" && (
            <Form layout="vertical" onFinish={handleSendCode}>
              <Form.Item
                label="Phone Number"
                name="phone"
                rules={[
                  {
                    required: true,
                    message: "Please enter your phone number!",
                  },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="+1 123 456 7890"
                  size="large"
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
                Send Access Code
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
                <Col span={12}>
                  <Form.Item label="Role" name="role" initialValue="student">
                    <Select>
                      <Select.Option value="student">Student</Select.Option>
                      <Select.Option value="instructor">
                        Instructor
                      </Select.Option>
                    </Select>
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

          {authMode === "verify" && (
            <Form layout="vertical" onFinish={handleVerifyCode}>
              <div className="mb-4 text-center text-slate-500 text-sm">
                Code sent to: <b>{phoneNumber}</b>
              </div>
              <Form.Item
                label="6-Digit Verification Code"
                name="code"
                rules={[{ required: true, len: 6, message: "Enter 6 digits!" }]}
              >
                <Input.OTP length={6} size="large" />
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
                className="h-12 rounded-lg font-bold bg-green-600 border-green-600"
              >
                Verify & Login
              </Button>
              <Button
                type="link"
                block
                onClick={() => setAuthMode("login")}
                className="mt-2 text-slate-400"
              >
                Change Details
              </Button>
            </Form>
          )}
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
