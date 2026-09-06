import axios from "axios";
import { AxiosClient } from "../../shared/axios.client";
export interface resultApiString {
  message: string;
}
export interface userLoginData {
  name: string;
  authenticated: boolean;
  accessToken: string;
  refreshToken: string;
  role: string;
}

export interface googleLoginData {
  authenticated: boolean;
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface currentUserData {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role?: string;
}

export interface checkTokenData {
  accessToken: string;
  refreshToken: string;
  authenticated?: boolean;
  success?: boolean;
}

export interface userRegister {
  name: string;
  email: string;
  phone: string;
}

export const generateAccessCode = async (phone: string) =>
  await AxiosClient.post<userLoginData[]>("/api/auth/createAccessCode", {
    phoneNumber: phone,
  });

export const verifyAccessCode = async (phone: string, accessCode: string) =>
  await AxiosClient.post<userLoginData>("/api/auth/validateAccessCode", {
    phoneNumber: phone,
    accessCode: accessCode,
  });

export const register = async (data: userRegister) =>
  await AxiosClient.post<resultApiString>("/api/auth/resgisterUser", {
    phone: data.phone,
    email: data.email,
    fullName: data.name,
  });

export const setPassword = async (token: string, password: string) =>
  await AxiosClient.post<resultApiString>("/api/auth/setupPassword", {
    token: token,
    password: password,
  });

export const login = async (userName: string, password: string) =>
  await AxiosClient.post<resultApiString>("/api/auth/login", {
    userName: userName,
    password: password,
  });

export const loginWithGoogle = async (credential: string) =>
  await AxiosClient.post<googleLoginData>("/api/auth/google", {
    token: credential,
  });

export const getCurrentUser = async () =>
  await AxiosClient.get<currentUserData>("/api/auth/currentuser");

export const checkToken = async () => {
  const accessToken = localStorage.getItem("access_token");
  const refreshToken = localStorage.getItem("refresh_token");

  const { data } = await AxiosClient.post<checkTokenData>(
    `api/auth/check-token`,
    {
      accessToken,
      refreshToken,
    },
  );

  return data;
};

export const forgetPassword = async (email: string) =>
  await AxiosClient.post<resultApiString>("/api/auth/forgetPassword", {
    email: email,
  });
