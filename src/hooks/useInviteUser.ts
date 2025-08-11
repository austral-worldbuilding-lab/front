import { useCallback, useState } from "react";
import {
  createInvitation,
  CreateInvitationDto,
  InvitationResponse,
} from "@/services/invitationService";
import { useAuth } from "./useAuth";

type Result = {
  invite: (email: string) => Promise<InvitationResponse | void>;
  loading: boolean;
  error: string | null;
  success: boolean;
  reset: () => void;
};

/** useInviteUser(projectId, invitedById) -> POST /invitation */
export default function useInviteUser(projectId?: string): Result {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();

  const invite = useCallback(
    async (email: string) => {
      if (!projectId) {
        setError("Falta projectId");
        return;
      }

      const invitedById = user!.uid;
      setLoading(true);
      setError(null);
      setSuccess(false);
      try {
        const payload: CreateInvitationDto = {
          email: email.trim(),
          projectId,
          invitedById,
        };
        const resp = await createInvitation(payload);
        setSuccess(true);
        return resp;
      } finally {
        setLoading(false);
      }
    },
    [projectId, user]
  );

  const reset = () => {
    setError(null);
    setSuccess(false);
  };

  return { invite, loading, error, success, reset };
}
