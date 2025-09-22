import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { auth } from "../config/firebase";
import { signOut } from "firebase/auth";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        if (window.location.pathname === "/app/organization") {
          await signOut(auth); // Cerrar sesión en firebase
          localStorage.clear();
          window.location.href = "/login";
        } else {
          window.location.href = "/app/organization";
        }
      } catch (e) {
        console.error("Error during sign out:", e);
      }
    }
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export async function get<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
  return axiosInstance.get<T>(url, config);
}

export async function post<T, U>(
  url: string,
  data: U,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
  return axiosInstance.post<T>(url, data, config);
}

export async function put<T, U>(
  url: string,
  data: U,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
  return axiosInstance.put<T>(url, data, config);
}

export async function del<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
  return axiosInstance.delete<T>(url, config);
}

export default axiosInstance;
