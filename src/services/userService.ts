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

export interface OrganizationUser {
    id: string;
    username: string;
    email: string;
    role: string;
    isActive: boolean;
}

export const createUser = async (userData: CreateUserData): Promise<User> => {
    const response = await axiosInstance.post<User>('/user', userData);
    return response.data;
};

export async function getProjectUsers(projectId: string): Promise<ProjectUser[]> {
    const response = await axiosInstance.get(`/project/${projectId}/users`);
    const raw = response.data as { data?: ProjectUser[] } | ProjectUser[];
    const list = Array.isArray(raw) ? raw : raw?.data ?? [];
    return list as ProjectUser[];
}

export async function removeProjectUser(projectId: string, userId: string): Promise<void> {
    await axiosInstance.delete(`/project/${projectId}/users/${userId}`);
}

export async function getOrganizationUsers(organizationId: string): Promise<OrganizationUser[]> {
    const response = await axiosInstance.get(`/organization/${organizationId}/users`);
    const raw = response.data as { data?: OrganizationUser[] } | OrganizationUser[];
    const list = Array.isArray(raw) ? raw : raw?.data ?? [];
    return list as OrganizationUser[];
}

export async function updateOrganizationUserRole(organizationId: string, userId: string, role: string): Promise<void> {
    await axiosInstance.put(`/organization/${organizationId}/users/${userId}/role`, { role });
}

export async function removeOrganizationUser(organizationId: string, userId: string): Promise<void> {
    await axiosInstance.delete(`/organization/${organizationId}/users/${userId}`);
}
