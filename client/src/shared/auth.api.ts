import axios from "axios";
import { AxiosClient } from "./axios.client";

export const refreshToken = async () => {
  const refreshToken = localStorage.getItem("refresh_token");

  const res = await AxiosClient.post(`/api/auth/refresh`, {
    refreshToken,
  });

  return res.data as { accessToken: string };
};

export const logout = async () => {
  const refreshToken = localStorage.getItem("refresh_token");

  return AxiosClient.post(`/api/auth/logout`, {
    refreshToken,
  });
};
