export type InvitationStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface Invitation {
  id: string;
  projectId: string;
  projectName?: string;
  invitedBy?: string;
  status?: InvitationStatus;
  createdAt?: string;
} 