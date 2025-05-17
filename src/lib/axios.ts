import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { auth } from '../config/firebase';

// Log the API URL to verify it's being loaded correctly
console.log('API URL:', import.meta.env.VITE_API_URL);

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
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

// Generic GET request
export async function get<T>(
    url: string,
    config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
    return axiosInstance.get<T>(url, config);
}

// Generic POST request
export async function post<T, U>(
    url: string,
    data: U,
    config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
    return axiosInstance.post<T>(url, data, config);
}

// Generic PUT request
export async function put<T, U>(
    url: string,
    data: U,
    config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
    return axiosInstance.put<T>(url, data, config);
}

// Generic DELETE request
export async function del<T>(
    url: string,
    config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
    return axiosInstance.delete<T>(url, config);
}

export default axiosInstance; 