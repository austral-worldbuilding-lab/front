import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Loader from "@/components/common/Loader";
import { CompleteApiMandala } from "@/types/mandala";
import MandalaListItem from "./MandalaListItem";
import ConfirmationDialog from "@/components/common/ConfirmationDialog";

interface MandalasPaginatedListProps {
  mandalas: CompleteApiMandala[];
  loading: boolean;
  organizationId: string;
  projectId: string;
  onDeleteMandala: (id: string) => Promise<void>;
  nextPageMandalas: CompleteApiMandala[];
  page: number;
  onPageChange: (page: number) => void;
  selectionMode?: boolean;
  selectedMandalas?: string[];
  onToggleSelection?: (id: string) => void;
}

const MandalasPaginatedList = ({
  mandalas,
  loading,
  organizationId,
  projectId,
  onDeleteMandala,
  nextPageMandalas,
  page,
  onPageChange,
  selectionMode = false,
  selectedMandalas = [],
  onToggleSelection,
}: MandalasPaginatedListProps) => {
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mandalaToDelete, setMandalaToDelete] = useState<string | null>(null);

  const confirmDeleteMandala = (id: string) => {
    setMandalaToDelete(id);
    setDialogOpen(true);
    setDropdownOpen(null);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border">
        {loading ? (
          <div className="flex justify-center items-center min-h-[100px]">
            <Loader size="medium" text="Cargando mandalas..." />
          </div>
        ) : mandalas.length === 0 ? (
          <p className="p-4 text-gray-600 text-center">
            No hay mandalas creadas aún
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {mandalas.map((mandala) => (
              <MandalaListItem
                key={mandala.id}
                mandala={mandala}
                organizationId={organizationId}
                projectId={projectId}
                dropdownOpen={dropdownOpen}
                onOpenChange={(open) =>
                  setDropdownOpen(open ? mandala.id : null)
                }
                onDelete={() => confirmDeleteMandala(mandala.id)}
                selectionMode={selectionMode}
                isSelected={selectedMandalas.includes(mandala.id)}
                onToggleSelection={() => onToggleSelection?.(mandala.id)}
              />
            ))}
          </ul>
        )}
      </div>

      <div className="flex justify-center items-center gap-4 mt-6 mb-10">
        <Button
          variant="outline"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          icon={<ChevronLeft size={16} />}
        />
        <span>Página {page}</span>
        <Button
          variant="outline"
          onClick={() => onPageChange(page + 1)}
          disabled={nextPageMandalas.length === 0}
          icon={<ChevronRight size={16} />}
        />
      </div>

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
        onConfirm={() => {
          if (mandalaToDelete) {
            onDeleteMandala(mandalaToDelete);
            setMandalaToDelete(null);
          }
        }}
      />
    </>
  );
};

export default MandalasPaginatedList;
