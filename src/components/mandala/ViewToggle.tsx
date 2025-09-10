import React from "react";
import { Button } from "../ui/button";

interface ViewToggleProps {
  viewMode: "overlap" | "all";
  onViewModeChange: (mode: "overlap" | "all") => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
      <Button
        variant={viewMode === "overlap" ? "filled" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange("overlap")}
        className={`text-xs px-3 py-1 ${
          viewMode === "overlap"
            ? "bg-primary text-white shadow-sm"
            : "text-gray-600 hover:text-gray-800"
        }`}
      >
        Mandala Unificada
      </Button>
      <Button
        variant={viewMode === "all" ? "filled" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange("all")}
        className={`text-xs px-3 py-1 ${
          viewMode === "all"
            ? "bg-primary text-white shadow-sm"
            : "text-gray-600 hover:text-gray-800"
        }`}
      >
        Todas las Mandalas
      </Button>
    </div>
  );
};

export default ViewToggle;
