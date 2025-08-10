import MandalaContainer from "@/components/mandala/MandalaContainer";
import { useParams, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useMandalaHistory } from "@/hooks/useMandalaHistory";
import useMandala from "@/hooks/useMandala.ts";

const MandalaPage = () => {
  const { mandalaId } = useParams();
  const { mandala } = useMandala(mandalaId!);
  const location = useLocation();
  const { addMandala, resetHistory } = useMandalaHistory();

  useEffect(() => {
    if (!mandalaId) return;
    if (location.state?.fromMandala) {
      if (mandala && mandala.mandala) {
        addMandala(mandala.mandala.id, mandala.mandala.name);
      }
    } else {
      if (mandala && mandala.mandala) {
        resetHistory(mandala.mandala.id, mandala.mandala.name);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mandalaId, location.key, mandala?.mandala?.id]);

  return <MandalaContainer mandalaId={mandalaId!} />;
};

export default MandalaPage;