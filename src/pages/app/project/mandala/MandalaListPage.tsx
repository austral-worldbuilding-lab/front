import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useGetMandalas from "@/hooks/useGetMandalas.ts";
import { useCreateMandala } from "@/hooks/useCreateMandala.ts";
import { useDeleteMandala } from "@/hooks/useDeleteMandala.ts";
import CreateModal from "@/components/mandala/characters/modal/CreateModal";
import MandalaPageHeader from "@/components/mandala/mandala-list/MandalaPageHeader";
import MandalasPaginatedList from "@/components/mandala/mandala-list/MandalasPaginatedList";
import MandalaListContainer from "@/components/mandala/mandala-list/MandalaListContainer";


const MODAL_CLOSE_DELAY = 500; // 500 milisegundos

/**
 * Página principal que muestra el listado de mandalas con funcionalidades de:
 * - Creación de mandalas
 * - Eliminación de mandalas
 * - Selección y unificación de mandalas
 */
const MandalaListPage = () => {
  const { organizationId, projectId } = useParams<{
    organizationId: string;
    projectId: string;
  }>();
  const navigate = useNavigate();

  // Estado para paginación y datos
  const [page, setPage] = useState(1);
  const limit = 10;

  // Carga de datos
  const { mandalas: fetchedMandalas, loading: mandalasLoading } =
    useGetMandalas(projectId || "", page, limit);
  const [mandalas, setMandalas] = useState(fetchedMandalas);
  const { mandalas: nextPageMandalas = [] } = useGetMandalas(
    projectId || "",
    page + 1,
    limit
  );

  // Hooks para operaciones CRUD
  const { deleteMandala } = useDeleteMandala();
  const { createMandala, loading: isCreatingMandala } = useCreateMandala(projectId || "");

  // Estado para el modal de creación
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wasCreating, setWasCreating] = useState(false);

  // Sincronización de datos
  useEffect(() => {
    setMandalas(fetchedMandalas);
  }, [fetchedMandalas]);

  useEffect(() => {
    if (isCreatingMandala) {
      setWasCreating(true);
    } else if (wasCreating && !isCreatingMandala) {
      const timer = setTimeout(() => {
        setIsCreateModalOpen(false);
        setWasCreating(false);
      }, MODAL_CLOSE_DELAY);
      return () => clearTimeout(timer);
    }
  }, [isCreatingMandala, wasCreating]);

  if (!projectId) {
    return <div className="p-6 text-red-500">Error: Project ID not found</div>;
  }

  /**
   * Maneja la creación de una nueva mandala
   */
  const handleCreateMandala = async (character: {
    name: string;
    description: string;
    useAIMandala: boolean;
    color: string;
    dimensions: { name: string; color?: string }[];
    scales: string[];
  }) => {
    const { name, description, color, useAIMandala, dimensions, scales } =
      character;

    if (!name.trim()) {
      setError("El nombre no puede estar vacío");
      return;
    }

    setError(null);

    try {
      const id = await createMandala(
        name,
        description,
        color,
        useAIMandala,
        dimensions,
        scales
      );
      navigate(
        `/app/organization/${organizationId}/projects/${projectId}/mandala/${id}`
      );
    } catch (err: unknown) {
      const errorObj = err as {
        message?: string;
        response?: { data?: { message?: string } };
      };
      const msg = errorObj?.message ?? errorObj?.response?.data?.message ?? "";
      if (msg.includes("Este proyecto no tiene archivos")) {
        setError(
          "Este proyecto no tiene archivos. Por favor, subí archivos antes de generar una mandala con IA."
        );
      } else {
        setError("Ocurrió un error al crear la mandala");
      }
    }
  };

  /**
   * Maneja la eliminación de una mandala
   */
  const handleDeleteMandala = async (id: string) => {
    try {
      await deleteMandala(id);
      setMandalas((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Error deleting mandala", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-12 relative">
      <MandalaPageHeader
        title="Mandalas"
        organizationId={organizationId}
        projectId={projectId}
      >
        {/* Contenedor que maneja la lógica de selección */}
        <MandalaListContainer
          organizationId={organizationId}
          projectId={projectId || ""}
          onCreateClick={() => setIsCreateModalOpen(true)}
        >
          {/* Lista paginada de mandalas */}
          <MandalasPaginatedList
            mandalas={mandalas}
            loading={mandalasLoading}
            organizationId={organizationId || ""}
            projectId={projectId}
            onDeleteMandala={handleDeleteMandala}
            nextPageMandalas={nextPageMandalas}
            page={page}
            onPageChange={setPage}
          />
        </MandalaListContainer>
      </MandalaPageHeader>

      {/* Modal de creación */}
      <CreateModal
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onCreateCharacter={handleCreateMandala}
        title="Crear Mandala"
        createButtonText="Crear Mandala"
        loading={isCreatingMandala}
      />

      {/* Mensaje de error de creación */}
      {error && !isCreateModalOpen && !isCreatingMandala && (
        <p className="text-red-500 text-sm mt-4 text-center max-w-md">
          {error}
        </p>
      )}
    </div>
  );
};

export default MandalaListPage;
