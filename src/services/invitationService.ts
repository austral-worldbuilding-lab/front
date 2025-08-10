import axiosInstance from "@/lib/axios";

export type CreateInvitationDto = {
  email: string;
  projectId: string; // UUID
  invitedById: string; // UUID
};

export type InvitationResponse = {
  id: string;
  email: string;
  projectId: string;
  invitedById: string;
  status: "pending" | "sent" | "accepted" | "rejected";
  createdAt: string;
};

export async function createInvitation(
  payload: CreateInvitationDto
): Promise<InvitationResponse> {
  const res = await axiosInstance.post("/invitation", payload);
  return res.data;
}
