import axiosInstance from "@/lib/axios";
import { Invitation } from "@/types/invitation";
import { PaginatedResponse } from "@/types/api";

export async function getMyInvitationsPaginated(
  page = 1,
  limit = 10,
  status: "PENDING" | "ACCEPTED" | "REJECTED" | undefined = "PENDING"
): Promise<PaginatedResponse<Invitation>> {
  const statusQuery = status ? `&status=${status}` : "";
  const response = await axiosInstance.get<PaginatedResponse<Invitation>>(
    `/invitation?page=${page}&limit=${limit}${statusQuery}`
  );
  return response.data;
}

export type CreateInvitationDto = {
  email: string;
  projectId: string; // UUID
  invitedById: string; // UUID
  role: Role;
};

export type InvitationResponse = {
  id: string;
  email: string;
  projectId: string;
  invitedById: string;
  role?: Role;
  status: "pending" | "sent" | "accepted" | "rejected";
  createdAt: string;
};

export const ROLES = ["owner", "admin", "member", "viewer"] as const;
export type Role = (typeof ROLES)[number];

export async function createInvitation(
  payload: CreateInvitationDto
): Promise<InvitationResponse> {
  const res = await axiosInstance.post("/invitation", payload);
  return res.data;
}

export async function acceptInvitation(
  invitationId: string
): Promise<{ projectId: string; invitation: Invitation }> {
  const response = await axiosInstance.post(
    `/invitation/${invitationId}/accept`,
    {}
  );
  const invitation = (response.data &&
    (response.data.data ?? response.data)) as any;

  const projectId: string | undefined = invitation?.projectId;

  if (!projectId) {
    throw new Error("No se pudo obtener el proyecto de la invitación aceptada");
  }

  return { projectId, invitation };
}

export async function rejectInvitation(invitationId: string): Promise<void> {
  await axiosInstance.post(`/invitation/${invitationId}/reject`, {});
}

export async function acceptInvitationByToken(token: string): Promise<{ projectId: string; organizationId?: string }> {
  const response = await axiosInstance.get(`/invitation/join/${token}`);
  const data = response.data.data;
  return { 
    projectId: data.projectId,
    organizationId: data.organizationId 
  };
}

export async function createInviteLink(
  projectId: string, 
  role: string,
  organizationId: string,
  expiresAt?: string,
  email?: string,
  sendEmail?: boolean
): Promise<{ inviteUrl: string; token: string }> {
  const response = await axiosInstance.post('/invitation/create-link', {
    projectId,
    role,
    organizationId,
    expiresAt,
    email,
    sendEmail
  });
  return response.data.data;
}
