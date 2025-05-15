import { useControls } from "react-zoom-pan-pinch";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

const ZoomControls = () => {
  const { zoomIn, zoomOut, resetTransform } = useControls();

  const handleReset = () => {
    resetTransform();
  };

  return (
    <div className="absolute top-4 right-4 flex space-x-2 z-10">
      <Button
        onClick={() => zoomIn()}
        variant="filled"
        color="primary"
        icon={<ZoomIn size={16} />}
      />
      <Button
        onClick={() => zoomOut()}
        variant="filled"
        color="primary"
        icon={<ZoomOut size={16} />}
      />
      <Button
        onClick={handleReset}
        variant="filled"
        color="secondary"
        icon={<RotateCcw size={16} />}
      />
    </div>
  );
};

export default ZoomControls;
