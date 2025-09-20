import { useControls } from "react-zoom-pan-pinch";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useState } from "react";

interface ZoomControlsProps {
  scale?: number;
}

const ZoomControls = ({ scale = 1 }: ZoomControlsProps) => {
  const { zoomIn, zoomOut } = useControls();
  const [zoomPercentage, setZoomPercentage] = useState(0);

  useEffect(() => {
    setZoomPercentage(Math.round(scale * 100));
  }, [scale]);

  const handleZoomIn = () => {
    zoomIn(0.25); // Incremento del 25%
  };

  const handleZoomOut = () => {
    zoomOut(0.25); // Decremento del 25%
  };

  return (
    <div className="absolute bottom-42 left-4 flex flex-col gap-2 z-10 bg-white rounded-lg p-2 shadow">
      <Button
        onClick={handleZoomIn}
        variant="ghost"
        color="primary"
        icon={<ZoomIn size={16} />}
        width="w-10"
      />
      <div className="text-center font-medium text-xs py-1">
        {zoomPercentage}%
      </div>
      <Button
        onClick={handleZoomOut}
        variant="ghost"
        color="primary"
        icon={<ZoomOut size={16} />}
        width="w-10"
      />
    </div>
  );
};

export default ZoomControls;
