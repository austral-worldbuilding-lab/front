import MandalaContainer from "@/components/mandala/MandalaContainer";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import useMandala from "@/hooks/useMandala.ts";
import { useMandalaHistory } from "@/hooks/useMandalaHistory";

const MandalaPage = () => {
  const { mandalaId } = useParams();
  const { mandala } = useMandala(mandalaId!);
  const { syncCurrent } = useMandalaHistory();

  useEffect(() => {
    if (!mandalaId) return;
    const name = mandala?.mandala?.name;
    if (name) {
      // Actualiza el último ítem del trail con el nombre real.
      syncCurrent({ id: mandalaId, name });
    }
  }, [mandalaId, mandala?.mandala?.name, syncCurrent]);

  return <MandalaContainer mandalaId={mandalaId!} />;
};

export default MandalaPage;
