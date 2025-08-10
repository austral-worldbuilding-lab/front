import { useCallback, useEffect, useState } from "react";
import { Invitation } from "@/types/invitation";
import {
  getMyInvitationsPaginated,
  acceptInvitation as acceptInvitationService,
  rejectInvitation as rejectInvitationService,
} from "@/services/invitationService";
import { useNavigate } from "react-router-dom";

export function useMyInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const navigate = useNavigate();

  const fetchInvitations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const paged = await getMyInvitationsPaginated(page, limit, "PENDING");
      setInvitations(paged.data);
      setTotalPages(paged.meta.totalPages);
    } catch (e: any) {
      setError(e?.message ?? "Error al cargar las invitaciones");
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const accept = useCallback(
    async (invitationId: string) => {
      setActionLoadingId(invitationId);
      try {
        const { projectId } = await acceptInvitationService(invitationId);
        setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
        navigate(`/app/project/${projectId}`);
      } catch (e: any) {
        setError(e?.message ?? "Error al aceptar la invitación");
      } finally {
        setActionLoadingId(null);
      }
    },
    [navigate]
  );

  const reject = useCallback(async (invitationId: string) => {
    setActionLoadingId(invitationId);
    try {
      await rejectInvitationService(invitationId);
      setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
    } catch (e: any) {
      setError(e?.message ?? "Error al rechazar la invitación");
    } finally {
      setActionLoadingId(null);
    }
  }, []);

  return {
    invitations,
    loading,
    error,
    accept,
    reject,
    actionLoadingId,
    refetch: fetchInvitations,
    page,
    setPage,
    limit,
    setLimit,
    totalPages,
  };
}

export default useMyInvitations; 