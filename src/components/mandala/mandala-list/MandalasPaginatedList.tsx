import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Loader from "@/components/common/Loader";
import { CompleteApiMandala } from "@/types/mandala";
import MandalaListItem from "./MandalaListItem";
import ConfirmationDialog from "@/components/common/ConfirmationDialog";
import CreateEntityModal from "@/components/project/CreateEntityModal";
import useUpdateMandala from "@/hooks/useUpdateMandala";

interface MandalasPaginatedListProps {
  mandalas: CompleteApiMandala[];
  loading: boolean;
  organizationId: string;
  projectId: string;
  onDeleteMandala: (id: string) => Promise<void>;
  onEditMandala?: (id: string, data: { name: string; description?: string }) => Promise<void>;
  onRefreshMandalas?: () => void;
  nextPageMandalas: CompleteApiMandala[];
  page: number;
  onPageChange: (page: number) => void;
  selectionMode?: boolean;
  selectedMandalas?: string[];
  onToggleSelection?: (id: string) => void;
}

/**
 * Componente que muestra una lista paginada de mandalas
 * Incluye la funcionalidad de paginación y eliminación de mandalas
 */
const MandalasPaginatedList = ({
  mandalas,
  loading,
  organizationId,
  projectId,
  onDeleteMandala,
  onEditMandala,
  onRefreshMandalas,
  nextPageMandalas,
  page,
  onPageChange,
  selectionMode = false,
  selectedMandalas = [],
  onToggleSelection,
}: MandalasPaginatedListProps) => {
  // Estados para manejar el diálogo de confirmación y el dropdown
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mandalaToDelete, setMandalaToDelete] = useState<string | null>(null);
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [mandalaToEdit, setMandalaToEdit] = useState<CompleteApiMandala | null>(null);
  
  const { update: updateMandala, loading: updating, error: updateError } = useUpdateMandala();

  // Abre el diálogo de confirmación para eliminar una mandala
  const confirmDeleteMandala = (id: string) => {
    setMandalaToDelete(id);
    setDialogOpen(true);
    setDropdownOpen(null);
  };

  const openEditMandala = (mandala: CompleteApiMandala) => {
    setMandalaToEdit(mandala);
    setEditModalOpen(true);
    setDropdownOpen(null);
  };

  const handleEditMandala = async (data: { name: string; description?: string }) => {
    if (!mandalaToEdit) return;
    
    try {
      if (onEditMandala) {
        await onEditMandala(mandalaToEdit.id, data);
      } else {
        await updateMandala(projectId, mandalaToEdit.id, data);
      }
      setEditModalOpen(false);
      setMandalaToEdit(null);
      
      if (onRefreshMandalas) {
        onRefreshMandalas();
      }
    } catch (error) {
      console.error("Error editing mandala:", error);
    }
  };

  // Manejador para cambiar de página
  const handlePageChange = (newPage: number) => {
    onPageChange(newPage);
  };

  // Manejador para confirmar eliminación
  const handleConfirmDelete = () => {
    if (mandalaToDelete) {
      onDeleteMandala(mandalaToDelete);
      setMandalaToDelete(null);
    }
  };

  return (
    <>
      {/* Contenedor de la lista */}
      <div className="w-full flex bg-white rounded-lg border flex-1 overflow-hidden">
        {/* Estado de carga */}
        {loading ? (
          <div className="w-full flex justify-center items-center h-full">
            <Loader size="medium" text="Cargando mandalas..." />
          </div>
        ) : mandalas.length === 0 ? (
          // Mensaje cuando no hay mandalas
          <p className="p-4 text-gray-600 text-center w-full h-full flex items-center justify-center">
            No hay mandalas creadas aún
          </p>
        ) : (
          // Lista de mandalas
          <ul className="divide-y divide-gray-100 min-h-0 overflow-y-auto w-full">
            {mandalas.map((mandala) => (
              <MandalaListItem
                key={mandala.id}
                mandala={mandala}
                organizationId={organizationId}
                projectId={projectId}
                dropdownOpen={dropdownOpen}
                onOpenChange={(open: boolean) =>
                  setDropdownOpen(open ? mandala.id : null)
                }
                onDelete={() => confirmDeleteMandala(mandala.id)}
                onEdit={() => openEditMandala(mandala)}
                selectionMode={selectionMode}
                isSelected={selectedMandalas.includes(mandala.id)}
                onToggleSelection={() => onToggleSelection?.(mandala.id)}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Controles de paginación */}
      <div className="flex justify-center items-center gap-4">
        <Button
          variant="outline"
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          icon={<ChevronLeft size={16} />}
        />
        <span>Página {page}</span>
        <Button
          variant="outline"
          onClick={() => handlePageChange(page + 1)}
          disabled={nextPageMandalas.length === 0}
          icon={<ChevronRight size={16} />}
        />
      </div>

      {/* Diálogo de confirmación para eliminar */}
      <ConfirmationDialog
        isOpen={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setDropdownOpen(null);
          }
        }}
        title="Confirmar eliminación"
        description="¿Estás seguro que querés eliminar esta mandala? Esta acción no se puede deshacer."
        cancelText="Cancelar"
        confirmText="Eliminar Mandala"
        isDanger={true}
        onConfirm={handleConfirmDelete}
      />

      <CreateEntityModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onCreate={handleEditMandala}
        loading={updating}
        error={updateError}
        title="Editar Mandala"
        placeholder="Nombre de la mandala"
        showQuestions={true}
        mode="edit"
        initialName={mandalaToEdit?.name}
        initialDescription={mandalaToEdit?.configuration.center?.description}
      />
    </>
  );
};

export default MandalasPaginatedList;
