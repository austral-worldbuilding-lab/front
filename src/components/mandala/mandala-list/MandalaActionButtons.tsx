import React from "react";
import { Button } from "@/components/ui/button";
import { MergeIcon, PlusIcon, SquaresIntersect, XIcon } from "lucide-react";
import { useProjectPermissions } from "@/hooks/usePermissionsLoader";
import { useParams } from "react-router-dom";

interface MandalaActionButtonsProps {
  selectionMode: boolean;
  selectedCount: number;
  isUnifying: boolean;
  isComparing: boolean;
  mandalasExists: boolean;
  projectId: string;
  onCreateClick: () => void;
  onToggleSelectionMode: () => void;
  onUnifyClick: () => void;
  onCompareClick: () => void;
}

/**
 * Componente que muestra los botones de acción para la página de mandalas
 * Maneja la lógica de mostrar diferentes botones según el modo de selección
 */
const MandalaActionButtons: React.FC<MandalaActionButtonsProps> = ({
  selectionMode,
  selectedCount,
  isUnifying,
  isComparing,
  mandalasExists,
  projectId,
  onCreateClick,
  onToggleSelectionMode,
  onUnifyClick,
  onCompareClick,
}) => {
  const { canEdit } = useProjectPermissions(projectId);
  return (
    <div className="flex flex-row w-full justify-between items-center">
      {/* Botón de crear mandala - Solo visible cuando no está en modo selección y puede editar */}
      {!selectionMode && canEdit && (
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
        {mandalasExists && (
          <>
            {!selectionMode ? (
              <Button
                color="primary"
                variant="ghost"
                className="mb-4 text-gray-500 hover:text-gray-700"
                onClick={onToggleSelectionMode}
              >
                Seleccionar
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
                  <div className="flex gap-2">
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
                    <Button
                      color="secondary"
                      className="mb-4"
                      onClick={onCompareClick}
                      icon={<SquaresIntersect size={16} />}
                      disabled={isComparing}
                    >
                      {isComparing
                        ? "Comparando mandalas..."
                        : `Comparar Mandalas (${selectedCount})`}
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MandalaActionButtons;
