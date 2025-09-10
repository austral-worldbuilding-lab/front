import MandalaContainer from "@/components/mandala/MandalaContainer";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import useMandala from "@/hooks/useMandala.ts";
import { parseMandalaHistory, buildMandalaHistoryQuery } from "@/utils/mandalaHistory";
import React from "react";

const MandalaPage = () => {
  const { mandalaId, organizationId, projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { mandala } = useMandala(mandalaId!);

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

  return (
      <MandalaContainer
          mandalaId={mandalaId!}
          organizationId={organizationId!}
      />
  );
};

export default MandalaPage;