import { useParams, Link, useNavigate } from "react-router-dom";
import useGetMandalas from "@/hooks/useGetMandalas.ts";
import Loader from "@/components/common/Loader";
import {ArrowLeftIcon, ChevronLeft, ChevronRight, GlobeIcon, PlusIcon} from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateModal from "@/components/mandala/characters/modal/CreateModal";
import {useEffect, useState} from "react";
import {useCreateMandala} from "@/hooks/useCreateMandala.ts";
import {useDeleteMandala} from "@/hooks/useDeleteMandala.ts";
import MandalaMenu from "@/components/mandala/MandalaMenu.tsx";
import ConfirmationDialog from "../../../../components/common/ConfirmationDialog";


const MandalaListPage = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const [page, setPage] = useState(1);
    const limit = 10;

    const { mandalas: fetchedMandalas, loading: mandalasLoading } = useGetMandalas(projectId || "", page, limit);
    const [mandalas, setMandalas] = useState(fetchedMandalas);

    const navigate = useNavigate();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { deleteMandala } = useDeleteMandala();
    const { createMandala } = useCreateMandala(projectId || "");

    const [dialogOpen, setDialogOpen] = useState(false);
    const [mandalaToDelete, setMandalaToDelete] = useState<string | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

    const confirmDeleteMandala = (id: string) => {
        setMandalaToDelete(id);
        setDialogOpen(true);
        setDropdownOpen(null);
    };

    useEffect(() => {
        setMandalas(fetchedMandalas);
    }, [fetchedMandalas]);

    if (!projectId) {
        return <div className="p-6 text-red-500">Error: Project ID not found</div>;
    }

    const handleCreateMandala = async (character: {
        name: string;
        description: string;
        useAIMandala: boolean;
        color: string;
        dimensions: { name: string; color?: string }[],
        scales: string[];
    }) => {
        const { name, description, color, useAIMandala, dimensions, scales } = character;

        if (!name.trim()) {
            setError("El nombre no puede estar vacío");
            return;
        }

        setError(null);

        try {
            const id = await createMandala(name, description, color, useAIMandala, dimensions, scales);
            setIsCreateModalOpen(false);
            navigate(`/app/project/${projectId}/mandala/${id}`);
        } catch {
            setError("Ocurrió un error al crear la mandala");
        }
    };

    const handleDeleteMandala = async (id: string) => {
        try {
            await deleteMandala(id);
            setMandalas((prev) => prev.filter((m) => m.id !== id));
        } catch (err) {
            console.error("Error deleting mandala", err);
        }
    };

    const { mandalas: nextPageMandalas = [] } = useGetMandalas(projectId || "", page + 1, limit);

    return (
        <>
            <div className="min-h-screen flex flex-col items-center pt-12 relative">
                <div className="absolute top-10 left-10">
                    <Link to={`/app/project/${projectId}`}>
                        <ArrowLeftIcon className="w-5 h-5"/>
                    </Link>
                </div>
                <div className="w-full max-w-2xl px-4">
                    <h1 className="text-2xl font-bold mb-2 text-center">Mandalas</h1>
                    <Button
                        color="primary"
                        className="mb-4"
                        onClick={() => setIsCreateModalOpen(true)}
                        icon={<PlusIcon size={16}/>}
                    >
                        Crear Mandala
                    </Button>
                    <div className="bg-white rounded-lg shadow-sm border ">
                        {mandalasLoading ? (
                            <div className="flex justify-center items-center min-h-[100px]">
                                <Loader size="medium" text="Cargando mandalas..."/>
                            </div>) : mandalas.length === 0 ? (
                            <p className="p-4 text-gray-600 text-center">
                                No hay mandalas creadas aún
                            </p>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {mandalas.map((mandala) => (
                                    <li
                                        key={mandala.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <div
                                            className="flex items-center gap-3 p-4 text-gray-800 hover:bg-gray-50 transition-colors">
                                            <Link
                                                to={`/app/project/${projectId}/mandala/${mandala.id}`}
                                                className="flex-1 flex items-center gap-3 hover:text-blue-600 transition-colors"
                                            >
                                                <GlobeIcon
                                                    className="w-5 h-5 flex-shrink-0"
                                                    style={{color: mandala.configuration.center.color || '#6b7280'}}/>
                                                <span>{mandala.name || "Mandala sin nombre"}</span>
                                            </Link>
                                            <MandalaMenu 
                                                open={dropdownOpen === mandala.id}
                                                onOpenChange={(open) => setDropdownOpen(open ? mandala.id : null)}
                                                onDelete={() => confirmDeleteMandala(mandala.id)}
                                            />
                                        </div>

                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
                <div className="flex justify-center items-center gap-4 mt-6 mb-10">
                    <Button
                        variant="outline"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        icon={<ChevronLeft size={16}/>}/>
                    <span>Página {page}</span>
                    <Button
                        variant="outline"
                        onClick={() => setPage(page + 1)}
                        disabled={nextPageMandalas.length === 0}
                        icon={<ChevronRight size={16}/>}/>
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
                            handleDeleteMandala(mandalaToDelete);
                            setMandalaToDelete(null);
                        }
                    }}
                />
                <CreateModal
                    isOpen={isCreateModalOpen}
                    onOpenChange={setIsCreateModalOpen}
                    onCreateCharacter={handleCreateMandala}
                    title="Crear Mandala"
                    createButtonText="Crear Mandala"/>
                {error && (
                    <p className="text-red-500 text-sm mt-4 text-center max-w-md">{error}</p>
                )}
            </div>
        </>
    );
};

export default MandalaListPage;
