import { LockOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { Button, Form, Input, message, Typography } from "antd";
import React, { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { setPassword } from "../login/loginService";
const { Text } = Typography;
const SetupPasswordPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSetupPassword = async (values: { password: string }) => {
    setLoading(true);
    console.log("Setup Credentials:", values);
    const token = searchParams.get("token") ?? "";
    // Simulate API: Secure account setup with JWT/Token
    const result = await setPassword(token ?? "", values.password);
    if (result.data) {
      if (result.status === 200) {
        message.success({
          content: result?.data?.message,
          duration: 2,
        });
        setTimeout(() => {
          setLoading(false);
          message.success(
            "Account setup successful! You can now log in with your credentials.",
          );
          navigate("/login");
        }, 500);
      } else {
        message.error({
          content: result?.data?.message,
          duration: 2,
        });
      }
    }
  };

  return (
    <Form layout="vertical" onFinish={handleSetupPassword}>
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <Text type="secondary" size="small">
          <SafetyCertificateOutlined className="mr-2" />
          This is a secure page to set up your account credentials after email
          verification.
        </Text>
      </div>

      <Form.Item
        label="New Password"
        name="password"
        rules={[
          {
            required: true,
            min: 6,
            message: "Password must be at least 6 characters",
          },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Min 6 characters"
          size="large"
        />
      </Form.Item>

      <Form.Item
        label="Confirm Password"
        name="confirm"
        dependencies={["password"]}
        rules={[
          { required: true },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("password") === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error("Passwords do not match!"));
            },
          }),
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Repeat password"
          size="large"
        />
      </Form.Item>

      <Button
        type="primary"
        htmlType="submit"
        block
        size="large"
        loading={loading}
        className="h-12 rounded-lg font-bold bg-indigo-600 border-indigo-600"
      >
        Complete Setup & Save
      </Button>
    </Form>
  );
};

export default SetupPasswordPage;
