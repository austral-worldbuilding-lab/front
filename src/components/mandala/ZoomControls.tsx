import { useControls } from "react-zoom-pan-pinch";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut } from "lucide-react";

const ZoomControls = () => {
  const { zoomIn, zoomOut } = useControls();

  return (
    <div className="absolute top-1/2 -translate-y-1/2 left-4 flex flex-col gap-2 z-10 bg-white rounded-lg p-2 shadow">
      <Button
        onClick={() => zoomIn()}
        variant="ghost"
        color="primary"
        icon={<ZoomIn size={16} />}
        width="w-10"
      />
      <Button
        onClick={() => zoomOut()}
        variant="ghost"
        color="primary"
        icon={<ZoomOut size={16} />}
        width="w-10"
      />
    </div>
  );
};

export default ZoomControls;
