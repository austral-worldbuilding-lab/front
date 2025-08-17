import { Link } from "react-router-dom";
import {Building2, ChevronLeft, ChevronRight, PlusIcon} from "lucide-react";
import Loader from "@/components/common/Loader.tsx";
import useOrganizations from "@/hooks/useOrganizations.ts";
import {Button} from "@/components/ui/button.tsx";
import {useState} from "react";
import CreateEntityModal from "@/components/project/CreateEntityModal.tsx";
import {useCreateOrganization} from "@/hooks/useCreateOrganization.ts";

const OrganizationListPage = () => {
    const { organizations, loading, error, page, setPage } = useOrganizations();

    const [modalOpen, setModalOpen] = useState(false);
    const { createOrganization, loading: creating, error: errorMsg } = useCreateOrganization();

    if (loading)
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader size="large" text="Cargando organizaciones..." />
            </div>
        );

    if (error) return <div className="text-red-500 p-4">{error.message}</div>;

    return (
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
                            {organizations.map((org) => (
                                <li
                                    key={org.id}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <Link
                                        to={`/app/organization/${org.id}/projects`}
                                        className="flex items-center gap-3 p-4 text-gray-800 hover:text-blue-600 transition-colors"
                                    >
                                        <Building2 className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                        <span className="flex-1">{org.name}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="flex justify-center items-center gap-4 mt-6">
                    <Button
                        variant="outline"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        icon={<ChevronLeft size={16}/>}
                    />
                    <span>Página {page}</span>
                    <Button
                        variant="outline"
                        onClick={() => setPage(page + 1)}
                        disabled={organizations.length < 10}
                        icon={<ChevronRight size={16}/>}
                    />
                </div>
            </div>
            <CreateEntityModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onCreate={createOrganization}
                loading={creating}
                error={errorMsg}
                title="Crear Organización"
                placeholder="Nombre de la organización"
            />
        </div>
    );
};

export default OrganizationListPage;
