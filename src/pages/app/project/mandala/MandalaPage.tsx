import MandalaContainer from "@/components/mandala/MandalaContainer";
import { useParams } from "react-router-dom";

const MandalaPage = () => {
  const { mandalaId } = useParams();
  return (
    <div>
      <MandalaContainer mandalaId={mandalaId!} />
    </div>
  );
};

export default MandalaPage;
