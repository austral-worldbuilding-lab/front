import MandalaContainer from "@/components/mandala/MandalaContainer";
import { useParams } from "react-router-dom";

const MandalaPage = () => {
  const { mandalaId } = useParams();
  return <MandalaContainer mandalaId={mandalaId!} />;
};

export default MandalaPage;
