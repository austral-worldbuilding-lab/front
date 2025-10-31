import { Link } from "react-router-dom";
import {ChevronLeft, ChevronRight, PlusIcon} from "lucide-react";
import Loader from "@/components/common/Loader.tsx";
import useOrganizations from "@/hooks/useOrganizations.ts";
import {Button} from "@/components/ui/button.tsx";
import {useState, useEffect } from "react";
import CreateEntityModal from "@/components/project/CreateEntityModal.tsx";
import {useCreateOrganization} from "@/hooks/useCreateOrganization.ts";
import MandalaMenu from "@/components/mandala/MandalaMenu";
import ConfirmationDialog from "@/components/common/ConfirmationDialog";
import { useDeleteOrganization } from "@/hooks/useDeleteOrganizations.ts";
import AppLayout from "@/components/layout/AppLayout";
import { getOrganizationIcon } from "@/utils/iconUtils";

const OrganizationListPage = () => {
    const { organizations: fetchedOrgs, nextPageOrgs, loading, error, page, setPage } = useOrganizations();

    const [organizations, setOrganizations] = useState(fetchedOrgs);
    useEffect(() => {
        setOrganizations(fetchedOrgs);
    }, [fetchedOrgs]);

    const [modalOpen, setModalOpen] = useState(false);
    const { createOrganization, loading: creating, error: errorMsg } = useCreateOrganization();

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
            <div className="flex items-center justify-center h-screen">
                <Loader size="large" text="Cargando organizaciones..." />
            </div>
        );

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen p-4">
                <div className="text-center max-w-md">
                    <h1 className="text-xl font-semibold text-red-600 mb-4">Error</h1>
                    <p className="text-gray-600 mb-6">
                        {error.message === "403" || error.message?.includes("403") 
                            ? "No tienes permisos para acceder a las organizaciones." 
                            : error.message || "Error al cargar las organizaciones"}
                    </p>
                    <Button onClick={() => window.location.reload()}>
                        Reintentar
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <AppLayout>
            <div className="min-h-screen flex flex-col items-center pt-12">
            <div className="w-full max-w-2xl px-4">
                <h1 className="text-2xl font-bold mb-6 text-center">Organizaciones</h1>
                <Button
                    color="primary"
                    className="mb-6"
                    onClick={() => setModalOpen(true)}
                    icon={<PlusIcon size={16} />}
                >
                    Crear Organización
                </Button>

                <div className="bg-white rounded-lg shadow-sm border">
                    {organizations.length === 0 ? (
                        <p className="p-4 text-gray-600 text-center">No hay organizaciones</p>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {organizations.map((org) => {
                                const IconComp = getOrganizationIcon("");
                                return (
                                  <li
                                    key={org.id}
                                    className="hover:bg-gray-50 transition-colors"
                                  >
                                    <div className="flex items-center gap-3 p-4 text-gray-800">
                                      <Link
                                        to={`/app/organization/${org.id}/projects`}
                                        className="flex-1 flex items-center gap-3 hover:text-blue-600 transition-colors"
                                      >
                                        {org.imageUrl ? (
                                                    <img className="h-5" src={org.imageUrl}></img>
                                        ) : (
                                          <IconComp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                        )}
                                        <div className="flex items-center gap-2">
                                          <span>{org.name}</span>
                                          {org.accessType === "limited" && (
                                            <span className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full border border-primary-300">
                                              Acceso limitado
                                            </span>
                                          )}
                                        </div>
                                      </Link>
                                      {org.accessType === "full" && (
                                        <MandalaMenu
                                          onDelete={() =>
                                            handleDeleteClick(org.id)
                                          }
                                        />
                                      )}
                                    </div>
                                  </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
                <div className="flex justify-center items-center gap-4 mt-6">
                    <Button
                        variant="outline"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        icon={<ChevronLeft size={16} />}
                    />
                    <span>Página {page}</span>
                    <Button
                        variant="outline"
                        onClick={() => setPage(page + 1)}
                        disabled={nextPageOrgs.length === 0}
                        icon={<ChevronRight size={16} />}
                    />
                </div>
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
