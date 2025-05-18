import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { auth } from '../config/firebase';


const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

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