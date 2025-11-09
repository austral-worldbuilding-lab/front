import MandalaContainer from "@/components/mandala/MandalaContainer";
import { useParams, useLocation } from "react-router-dom";
import useMandala from "@/hooks/useMandala.ts";
import { parseMandalaHistory } from "@/utils/mandalaHistory";
import { useProjectAccess } from "@/hooks/useProjectAccess";
import MandalaNotFoundPage from "./MandalaNotFoundPage";
import Loader from "@/components/common/Loader";
import React from "react";
import { useMandalaBreadcrumb } from "@/hooks/useMandalaBreadcrumb";

const MandalaPage = () => {
  const { mandalaId, organizationId, projectId } = useParams();
  const location = useLocation();

  const { hasAccess, loading: accessLoading, isUnauthorized } = useProjectAccess(projectId || "");

  const { mandala, loading: mandalaLoading } = useMandala(hasAccess ? mandalaId! : "");

  // Parsear historial actual de la URL
  const { ids } = parseMandalaHistory(location.search);
  const { goToMandala } = useMandalaBreadcrumb();

  // Si el mandala actual no está al final del historial, agregarlo
  React.useEffect(() => {
    if (!mandalaId || !mandala?.mandala) return;
    if (ids[ids.length - 1] !== mandalaId) {
      goToMandala(mandalaId, mandala.mandala.name);
    }
    // eslint-disable-next-line
  }, [mandalaId, mandala?.mandala?.id]);

  if (accessLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="large" text="Verificando permisos..." />
      </div>
    );
  }

  if (isUnauthorized) {
    return <MandalaNotFoundPage />;
  }

  if (hasAccess && !mandalaLoading && !mandala) {
    return <MandalaNotFoundPage />;
  }

  if (mandalaLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="large" text="Cargando mandala..." />
      </div>
    );
  }

  return (
      <MandalaContainer
          mandalaId={mandalaId!}
          organizationId={organizationId!}
      />
  );
};

export default MandalaPage;