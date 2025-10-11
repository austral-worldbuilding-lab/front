import React from "react";

// Este componente no requiere props
type MandalaSelectionBannerProps = Record<string, never>;

/**
 * Banner informativo que se muestra durante el modo de selección
 * Muestra información sobre el proceso de unificación de mandalas
 */
const MandalaSelectionBanner: React.FC<MandalaSelectionBannerProps> = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-left">
      <p className="text-primary text-sm">
        <span className="font-medium">
          <b>Unificar Mandalas:</b>
        </span>{" "}
        Selecciona 2 o más mandalas que desees unificar
      </p>
      <p className="text-primary text-sm">
        <span className="font-medium">
          <b>Comparar Mandalas:</b>
        </span>{" "}
        Selecciona 2 o más mandalas que desees comparar
      </p>
    </div>
  );
};

export default MandalaSelectionBanner;
