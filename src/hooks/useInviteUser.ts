import { useCallback, useState } from "react";
import {
  createInviteLink,
  Role,
} from "@/services/invitationService";

type Result = {
  invite: (email: string, role: Role) => Promise<{ inviteUrl: string; token: string } | void>;
  loading: boolean;
  error: string | null;
  success: boolean;
  reset: () => void;
};

export default function useInviteUser(projectId?: string, organizationId?: string): Result {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const invite = useCallback(
    async (email: string, role: Role) => {
      if (!projectId) {
        setError("Falta projectId");
        return;
      }
      
      if (!organizationId) {
        setError("Falta organizationId");
        return;
      }

      setLoading(true);
      setError(null);
      setSuccess(false);
      try {
        const result = await createInviteLink(
          projectId, 
          role, 
          organizationId, 
          undefined,
          email,
          true
        );
        
        console.log("Invitation sent by email to:", email, "with link:", result.inviteUrl);
        
        setSuccess(true);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al crear la invitación");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [projectId, organizationId]
  );

  const reset = () => {
    setError(null);
    setSuccess(false);
  };

  return { invite, loading, error, success, reset };
}
