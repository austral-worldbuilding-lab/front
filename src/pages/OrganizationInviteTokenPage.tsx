/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { acceptOrganizationInvitationByToken } from "@/services/organizationInvitationService";
import { useAuthContext } from "@/context/AuthContext";
import Loader from "@/components/common/Loader";

const OrganizationInviteTokenPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoading: authLoading } = useAuthContext();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setError("Token de invitación inválido");
      setLoading(false);
      return;
    }

    if (authLoading) {
      return;
    }

    if (!user) {
      const qs = searchParams.toString();
      const extra = qs ? `&${qs}` : "";
      navigate(`/login?orgInvite=${token}${extra}`);
      return;
    }

    const handleInvite = async () => {
      try {
        setLoading(true);

        const { organizationId } = await acceptOrganizationInvitationByToken(
          token
        );
        const orgId = organizationId || searchParams.get("org");

        if (orgId) {
          navigate(`/app/organization/${orgId}/projects`);
        } else {
          setError("No se pudo obtener la información de la organización");
        }
      } catch (error: any) {
        if (error.response?.status === 401) {
          const qs = searchParams.toString();
          const extra = qs ? `&${qs}` : "";
          navigate(`/login?orgInvite=${token}${extra}`);
        } else if (error.response?.status === 404) {
          setError("La invitación no existe o ha expirado");
        } else if (error.response?.status === 409) {
          setError(
            "Ya eres miembro de esta organización. Puedes acceder directamente desde tus organizaciones."
          );
        } else if (error.response?.status === 403) {
          setError("No tienes permisos para acceder a esta invitación.");
        } else {
          setError(
            error.response?.data?.message || "Error al procesar la invitación"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    handleInvite();
  }, [token, navigate, user, authLoading, searchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader size="large" text="Procesando invitación..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <div className="text-center max-w-md">
          <h1 className="text-xl font-semibold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/app/organization/")}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover"
          >
            Ir a mis organizaciones
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default OrganizationInviteTokenPage;
