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

export async function acceptInvitation(
  invitationId: string
): Promise<{ projectId: string; invitation: Invitation }> {
  const response = await axiosInstance.post(`/invitation/${invitationId}/accept`, {});
  const invitation = (response.data && (response.data.data ?? response.data)) as any;

  const projectId: string | undefined = invitation?.projectId;

  if (!projectId) {
    throw new Error("No se pudo obtener el proyecto de la invitación aceptada");
  }

  return { projectId, invitation };
}

export async function rejectInvitation(invitationId: string): Promise<void> {
  await axiosInstance.post(`/invitation/${invitationId}/reject`, {});
} 