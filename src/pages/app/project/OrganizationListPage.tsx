import Loader from "@/components/common/Loader.tsx";
import useOrganizations from "@/hooks/useOrganizations.ts";
import { Button } from "@/components/ui/button.tsx";
import { useState, useEffect } from "react";
import CreateEntityModal from "@/components/project/CreateEntityModal.tsx";
import { useCreateOrganization } from "@/hooks/useCreateOrganization.ts";
import ConfirmationDialog from "@/components/common/ConfirmationDialog";
import { useDeleteOrganization } from "@/hooks/useDeleteOrganizations.ts";
import AppLayout from "@/components/layout/AppLayout";
import UsefulFiles from "@/components/home/usefulfiles/UsefulFiles";
import AccountStadistics from "@/components/home/stadistics/AccountStadistics";
import OrganizationsSection from "@/components/home/organizationsList/OrganizationsSection";

const OrganizationListPage = () => {
  const {
    organizations: fetchedOrgs,
    nextPageOrgs,
    loading,
    error,
    page,
    setPage,
  } = useOrganizations();

  const [organizations, setOrganizations] = useState(fetchedOrgs);
  useEffect(() => {
    setOrganizations(fetchedOrgs);
  }, [fetchedOrgs]);

  const [searchQuery, setSearchQuery] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const {
    createOrganization,
    loading: creating,
    error: errorMsg,
  } = useCreateOrganization();

  const { deleteOrganization } = useDeleteOrganization();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setSelectedOrgId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedOrgId) return;
    try {
      await deleteOrganization(selectedOrgId);
      setOrganizations((prev) => prev.filter((o) => o.id !== selectedOrgId));
    } catch (err) {
      console.error("Error deleting organization", err);
    } finally {
      setSelectedOrgId(null);
    }
  };

  if (loading)
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader size="large" text="Cargando organizaciones..." />
        </div>
      </AppLayout>
    );

  if (error) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-screen p-4">
          <div className="text-center max-w-md">
            <h1 className="text-xl font-semibold text-red-600 mb-4">Error</h1>
            <p className="text-gray-600 mb-6">
              {error.message === "403" || error.message?.includes("403")
                ? "No tienes permisos para acceder a las organizaciones."
                : error.message || "Error al cargar las organizaciones"}
            </p>
            <Button onClick={() => window.location.reload()}>Reintentar</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen flex flex-col items-center pt-12">
        <OrganizationsSection
          organizations={organizations}
          page={page}
          setPage={setPage}
          nextPageOrgs={nextPageOrgs}
          onDeleteClick={handleDeleteClick}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onCreateClick={() => setModalOpen(true)}
        />
        <div className="w-full max-w-6xl mt-6 flex flex-col gap-4 px-4">
          <UsefulFiles />
          <AccountStadistics />
        </div>
        <CreateEntityModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onCreate={({ name, image }) => createOrganization(name, image!)}
          loading={creating}
          error={errorMsg}
          title="Crear Organización"
          placeholder="Nombre de la organización"
          isOrganization
        />

        <ConfirmationDialog
          isOpen={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Eliminar organización"
          description="¿Seguro que deseas eliminar esta organización? Esta acción no se puede deshacer."
          confirmText="Eliminar"
          isDanger
          onConfirm={handleConfirmDelete}
        />
      </div>
    </AppLayout>
  );
};

export default OrganizationListPage;
