import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldOff, ArrowLeft } from "lucide-react";

const MandalaNotFoundPage = () => {
  const navigate = useNavigate();
  const { organizationId, projectId } = useParams();

  const handleGoToOrganizations = () => {
    navigate("/app/organization");
  };

  const handleGoBack = () => {
    if (organizationId && projectId) {
      navigate(`/app/organization/${organizationId}/projects/${projectId}`);
    } else {
      navigate("/app/organization");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          <ShieldOff className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Mandala no encontrada
          </h1>
          <p className="text-gray-600">
            No tienes permisos para acceder a esta mandala o no existe.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="w-full"
            icon={<ArrowLeft size={16} />}
          >
            Volver al proyecto
          </Button>
          
          <Button
            onClick={handleGoToOrganizations}
            className="w-full"
          >
            Ir a mis organizaciones
          </Button>
        </div>

        <p className="text-sm text-gray-500 mt-6">
          Si crees que deberías tener acceso a esta mandala, contacta al administrador del proyecto.
        </p>
      </div>
    </div>
  );
};

export default MandalaNotFoundPage;
