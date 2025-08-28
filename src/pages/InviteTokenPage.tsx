import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { acceptInvitationByToken } from "@/services/invitationService";
import { useAuthContext } from "@/context/AuthContext";
import Loader from "@/components/common/Loader";

const InviteTokenPage = () => {
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
      navigate(`/login?invite=${token}${extra}`);
      return;
    }

    const handleInvite = async () => {
      try {
        setLoading(true);
        
        const { projectId, organizationId } = await acceptInvitationByToken(token);
        
        const orgId = organizationId || searchParams.get('org');
        
        if (orgId && projectId) {
          navigate(`/app/organization/${orgId}/projects/${projectId}`);
        } else if (projectId) {
          navigate(`/app/project/${projectId}`);
        } else {
          setError("No se pudo obtener la información del proyecto");
        }
        
      } catch (error: any) {
        if (error.response?.status === 401) {
          const qs = searchParams.toString();
          const extra = qs ? `&${qs}` : "";
          navigate(`/login?invite=${token}${extra}`);
        } else if (error.response?.status === 404) {
          setError("La invitación no existe o ha expirado");
        } else if (error.response?.status === 409) {
          setError("Ya eres miembro de este proyecto");
        } else {
          setError(error.response?.data?.message || "Error al procesar la invitación");
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
            onClick={() => navigate("/app/project")}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover"
          >
            Ir a mis proyectos
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default InviteTokenPage;
