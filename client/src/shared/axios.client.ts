import axios from "axios";
import type { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { refreshToken } from "./auth.api";
let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((p) => {
    if (token) {
      p.resolve(token);
    } else {
      p.reject(error);
    }
  });
  failedQueue = [];
};
export class AxiosClient {
  private static instance: AxiosInstance;

  static init() {
    if (!AxiosClient.instance) {
      AxiosClient.instance = axios.create({
        baseURL: "http://localhost:3000",
        headers: {
          "Content-Type": "application/json",
        },
      });

      AxiosClient.setupInterceptors();
    }
    return AxiosClient.instance;
  }

  private static setupInterceptors() {
    // Request: gắn JWT
    AxiosClient.instance.interceptors.request.use((config) => {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    AxiosClient.instance.interceptors.response.use(
      (res) => res,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({
                resolve: (token: string) => {
                  originalRequest.headers!.Authorization = `Bearer ${token}`;
                  resolve(AxiosClient.instance(originalRequest));
                },
                reject,
              });
            });
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            const { accessToken } = await refreshToken();

            localStorage.setItem("access_token", accessToken);
            AxiosClient.instance.defaults.headers.Authorization = `Bearer ${accessToken}`;

            processQueue(null, accessToken);

            return AxiosClient.instance(originalRequest);
          } catch (err) {
            // processQueue(err, null);
            // localStorage.clear();
            // window.location.href = "/login";
            // return Promise.reject(err);
          } finally {
            isRefreshing = false;
          }
        }

        return Promise.reject(error);
      },
    );
  }

  static get<T>(url: string, config?: AxiosRequestConfig) {
    return AxiosClient.init().get<T>(url, config);
  }

  static post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return AxiosClient.init().post<T>(url, data, config);
  }

  static put<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return AxiosClient.init().put<T>(url, data, config);
  }

  static delete<T>(url: string, config?: AxiosRequestConfig) {
    return AxiosClient.init().delete<T>(url, config);
  }
}
