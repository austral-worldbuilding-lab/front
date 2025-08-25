import React from "react";
import { Button } from "@/components/ui/button";
import { MergeIcon, PlusIcon, XIcon } from "lucide-react";

interface MandalaActionButtonsProps {
  selectionMode: boolean;
  selectedCount: number;
  isUnifying: boolean;
  onCreateClick: () => void;
  onToggleSelectionMode: () => void;
  onUnifyClick: () => void;
}

/**
 * Componente que muestra los botones de acción para la página de mandalas
 * Maneja la lógica de mostrar diferentes botones según el modo de selección
 */
const MandalaActionButtons: React.FC<MandalaActionButtonsProps> = ({
  selectionMode,
  selectedCount,
  isUnifying,
  onCreateClick,
  onToggleSelectionMode,
  onUnifyClick,
}) => {
  return (
    <div className="flex flex-row w-full justify-between items-center">
      {/* Botón de crear mandala - Solo visible cuando no está en modo selección */}
      {!selectionMode && (
        <Button
          color="primary"
          className="mb-4"
          onClick={onCreateClick}
          icon={<PlusIcon size={16} />}
        >
          Crear Mandala
        </Button>
      )}

      <div className="flex gap-2">
        {/* Botón para activar/desactivar modo selección */}
        {!selectionMode ? (
          <Button
            color="primary"
            variant="outline"
            className="mb-4"
            onClick={onToggleSelectionMode}
            icon={<MergeIcon size={16} />}
          >
            Unificar Mandalas
          </Button>
        ) : (
          <>
            {/* Botón para cancelar selección */}
            <Button
              color="danger"
              variant="outline"
              className="mb-4"
              onClick={onToggleSelectionMode}
              icon={<XIcon size={16} />}
            >
              Cancelar
            </Button>

            {/* Botón para unificar mandalas seleccionadas */}
            {selectedCount >= 2 && (
              <Button
                color="primary"
                className="mb-4"
                onClick={onUnifyClick}
                icon={<MergeIcon size={16} />}
                disabled={isUnifying}
              >
                {isUnifying
                  ? "Unificando..."
                  : `Unificar Mandalas (${selectedCount})`}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MandalaActionButtons;
