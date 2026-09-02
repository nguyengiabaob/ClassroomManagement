import axios from "axios";

export const refreshToken = async () => {
  const refreshToken = localStorage.getItem("refresh_token");

  const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
    refreshToken,
  });

  return res.data as { accessToken: string };
};

export const logout = async () => {
  const refreshToken = localStorage.getItem("refresh_token");

  return axios.post<{ message: string }>(
    `${import.meta.env.VITE_API_URL}/auth/logout`,
    { refreshToken },
  );
};
