import React from "react";
import { Button } from "@/components/ui/button";
import {
  MergeIcon,
  PlusIcon,
  Search,
  SquaresIntersect,
  XIcon,
} from "lucide-react";
import { useProjectPermissions } from "@/hooks/usePermissionsLoader";
import { Input } from "@/components/ui/input";

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
  onSearchChange?: (value: string) => void;
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
  onSearchChange,
}) => {
  const { canEdit } = useProjectPermissions(projectId);
  return (
    <div className="relative flex flex-col">
      {/* Botón de crear mandala - Solo visible cuando no está en modo selección y puede editar */}

      <div className="relative flex flex-row w-full justify-between overflow-x-auto gap-2">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-5 transform -translate-y-1/2 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="Buscar por nombre"
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>
        {!selectionMode && canEdit && (
          <Button
            color="primary"
            onClick={onCreateClick}
            icon={<PlusIcon size={16} />}
          >
            Crear Mandala
          </Button>
        )}
      </div>
      {mandalasExists && (
        <div className="flex gap-2 items-end flex-1">
          {/* Botón para activar/desactivar modo selección */}
          <div className="flex flex-row gap-2 items-end flex-1">
            {!selectionMode ? (
              <Button
                variant="ghost"
                size="sm"
                className="p-2"
                onClick={onToggleSelectionMode}
              >
                Seleccionar
              </Button>
            ) : (
              <div className="flex flex-row justify-between gap-4 items-end flex-1">
                {/* Botón para cancelar selección */}
                <Button
                  variant="ghost"
                  color="danger"
                  size="sm"
                  className="p-2"
                  onClick={onToggleSelectionMode}
                  icon={<XIcon size={16} />}
                >
                  Cancelar
                </Button>

                {/* Botón para unificar mandalas seleccionadas */}
                {selectedCount >= 2 && (
                  <div className="flex flex-wrap gap-2 flex-1 justify-end">
                    <Button
                      color="primary"
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
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MandalaActionButtons;
