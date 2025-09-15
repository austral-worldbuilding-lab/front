import MandalaContainer from "@/components/mandala/MandalaContainer";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import useMandala from "@/hooks/useMandala.ts";
import { parseMandalaHistory, buildMandalaHistoryQuery } from "@/utils/mandalaHistory";
import { useProjectAccess } from "@/hooks/useProjectAccess";
import MandalaNotFoundPage from "./MandalaNotFoundPage";
import Loader from "@/components/common/Loader";
import React from "react";

const MandalaPage = () => {
  const { mandalaId, organizationId, projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { hasAccess, loading: accessLoading, isUnauthorized } = useProjectAccess(projectId || "");

  const { mandala, loading: mandalaLoading } = useMandala(hasAccess ? mandalaId! : "");

  // Parsear historial actual de la URL
  const { ids, names } = parseMandalaHistory(location.search);

  // Si el mandala actual no está al final del historial, agregarlo
  React.useEffect(() => {
    if (!mandalaId || !mandala?.mandala) return;
    if (ids[ids.length - 1] !== mandalaId) {
      const newIds = [...ids, mandalaId];
      const newNames = [...names, mandala.mandala.name];
      const search = buildMandalaHistoryQuery(newIds, newNames);
      navigate(
          `/app/organization/${organizationId}/projects/${projectId}/mandala/${mandalaId}?${search}`,
          { replace: true }
      );
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