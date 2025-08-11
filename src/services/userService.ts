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

export interface ProjectUser {
    id: string;
    name?: string;
    username?: string;
    email: string;
    role: string;
}

export const createUser = async (userData: CreateUserData): Promise<User> => {
    const response = await axiosInstance.post<User>('/user', userData);
    return response.data;
};

export async function getProjectUsers(projectId: string): Promise<ProjectUser[]> {
    const response = await axiosInstance.get(`/project/${projectId}/users`);
    const raw = response.data as any;
    const list = Array.isArray(raw) ? raw : raw?.data ?? raw?.users;
    return (list ?? []) as ProjectUser[];
}

export async function removeProjectUser(projectId: string, userId: string): Promise<void> {
    await axiosInstance.delete(`/project/${projectId}/users/${userId}`);
}
