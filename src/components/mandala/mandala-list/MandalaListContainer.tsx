import React, { useState } from "react";
import { useMandalaUnification } from "@/hooks/useMandalaUnification";
import MandalaActionButtons from "./MandalaActionButtons";
import MandalaSelectionBanner from "./MandalaSelectionBanner";
import ErrorMessage from "@/components/common/ErrorMessage";
import UnifyMandalasModal from "./UnifyMandalasModal";

interface MandalaListContainerProps {
  organizationId?: string;
  projectId: string;
  children: React.ReactNode;
  onCreateClick: () => void;
}

/**
 * Contenedor que maneja la lógica del modo de selección y unificación de mandalas
 * Este componente mantiene el estado y la lógica compartida por varios componentes
 * relacionados con la selección y unificación de mandalas
 */
const MandalaListContainer: React.FC<MandalaListContainerProps> = ({
  organizationId,
  projectId,
  children,
  onCreateClick,
}) => {
  // Estado de selección
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMandalas, setSelectedMandalas] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUnifyModalOpen, setIsUnifyModalOpen] = useState(false);

  // Hook para unificación
  const {
    unifyMandalas,
    loading: unifyingMandalas,
    error: unifyError,
  } = useMandalaUnification();

  // Activa o desactiva el modo de selección
  const toggleSelectionMode = () => {
    if (selectionMode) {
      setSelectedMandalas([]);
      setError(null);
    }
    setSelectionMode(!selectionMode);
  };

  // Maneja la selección/deselección de una mandala
  const toggleMandalaSelection = (id: string) => {
    setSelectedMandalas((prev) => {
      if (prev.includes(id)) {
        return prev.filter((mandalaId) => mandalaId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Abre el modal de unificación
  const handleOpenUnifyModal = () => {
    if (selectedMandalas.length < 2) {
      setError("Debes seleccionar al menos 2 mandalas para unificar");
      return;
    }

    setError(null);
    setIsUnifyModalOpen(true);
  };

  // Procesa la unificación de las mandalas seleccionadas con el nombre proporcionado
  const handleUnifyMandalas = async (name: string) => {
    try {
      await unifyMandalas(
        selectedMandalas,
        organizationId || "",
        projectId,
        name
      );
      setIsUnifyModalOpen(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al unificar las mandalas"
      );
      throw err;
    }
  };

  return (
    <>
      {/* Banner de selección */}
      {selectionMode && <MandalaSelectionBanner />}

      {/* Botones de acción */}
      <MandalaActionButtons
        selectionMode={selectionMode}
        selectedCount={selectedMandalas.length}
        isUnifying={unifyingMandalas}
        onCreateClick={onCreateClick}
        onToggleSelectionMode={toggleSelectionMode}
        onUnifyClick={handleOpenUnifyModal}
      />

      {/* Contenido principal (inyectado como children) */}
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          // Pasamos las propiedades relacionadas con la selección
          // Usamos type assertion para evitar errores de tipo
          return React.cloneElement(child, {
            // @ts-expect-error - Props dinámicos para MandalasPaginatedList
            selectionMode,
            selectedMandalas,
            onToggleSelection: toggleMandalaSelection,
          });
        }
        return child;
      })}

      {/* Mensajes de error */}
      {selectionMode && <ErrorMessage message={error || unifyError} />}

      {/* Modal de unificación */}
      <UnifyMandalasModal
        isOpen={isUnifyModalOpen}
        onOpenChange={setIsUnifyModalOpen}
        onUnify={handleUnifyMandalas}
        selectedCount={selectedMandalas.length}
        isLoading={unifyingMandalas}
      />
    </>
  );
};

export default MandalaListContainer;
