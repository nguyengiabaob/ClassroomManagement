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

export interface userRegister {
  name: string;
  email: boolean;
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
  await AxiosClient.post<resultApiString>("/api/auth/registerUser", {
    phone: data.phone,
    email: data.email,
    fullName: data.name,
  });

export const setPassword = async (token: string, password: string) =>
  await AxiosClient.post<resultApiString>("/api/auth/setupPassword", {
    token: token,
    password: password,
  });
