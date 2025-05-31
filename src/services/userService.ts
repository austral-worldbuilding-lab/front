import axiosInstance from '@/lib/axios';

export interface CreateUserData {
    firebaseUid: string;
    email: string;
    username: string;
}

export interface User {
    firebaseUid: string;
    email: string;
    username: string;
}

export const createUser = async (userData: CreateUserData): Promise<User> => {
    const response = await axiosInstance.post<User>('/user', userData);
    return response.data;
};
