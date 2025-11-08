import { Globe, X, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import useProvocationToProject from "@/hooks/useProvocationToProject";
import { Provocation } from "@/types/mandala";
import ConfirmationDialog from "@/components/common/ConfirmationDialog";
import { useProjectPermissions } from "@/hooks/usePermissionsLoader";

interface ProvocationCardProps {
    provocation: Provocation | null;
    open?: boolean;
    onClose: () => void;
    onSave?: (data: Omit<Provocation, "id">) => void;
    onOpenWorlds?: () => void;
    onNavigate?: () => void;
    projectId?: string;
    onDelete?: () => Promise<void>;
    deleting?: boolean;
}

export default function ProvocationCard({
                                            provocation,
                                            open = true,
                                            onClose,
                                            onSave,
                                            onOpenWorlds,
                                            onNavigate,
                                            projectId,
                                            onDelete,
                                            deleting = false,
                                        }: ProvocationCardProps) {
    const isCreate = !provocation;
    const [title, setTitle] = useState("");
    const [question, setQuestion] = useState("");
    const [description, setDescription] = useState("");
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const { provocationToProject } = useProvocationToProject();
    const { canEdit } = useProjectPermissions(projectId);

    if (!open) return null;

    const handleSave = () => {
        if (onSave) {
            onSave({
                projectsOrigin: provocation?.projectsOrigin ?? [],
                title,
                question,
                description,
            });
            onClose();
        }
    };

    const handleDeleteClick = () => {
        setDeleteError(null);
        setConfirmDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (onDelete && provocation?.id) {
            setDeleteError(null);
            try {
                await onDelete();
                setConfirmDeleteOpen(false);
                onClose();
            } catch (err: any) {
                console.error("Error al eliminar provocación:", err);
                setDeleteError(err.message ?? "Error al eliminar la provocación");
                setConfirmDeleteOpen(false);
            }
        }
    };

    const isCached = provocation?.isCached || !provocation?.id;
    const hasWorlds = (provocation?.projectsOrigin?.length ?? 0) > 0;
    const canDelete = !isCreate && canEdit && provocation?.id && !isCached && onDelete;
    return (
        <>
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[100]">
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg w-[500px] max-w-full p-6 relative">
                <button
                    className="absolute top-3 right-3 text-gray-500 hover:text-black"
                    onClick={onClose}
                >
                    <X size={20} />
                </button>

                {isCreate ? (
                    <>
                        <h3 className="text-xl font-bold mb-4">Crear Provocación</h3>
                        <Input
                            placeholder="Título"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="mb-3"
                        />
                        <Input
                            placeholder="Pregunta: ¿Qué pasaría si...?"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            className="mb-3"
                        />
                        <Textarea
                            placeholder="Descripción"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mb-4"
                        />
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button onClick={handleSave} disabled={!title || !question}>
                                Guardar
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-bold text-gray-900">
                                {provocation!.title}
                            </h3>
                            {canDelete && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    color="danger"
                                    loading={deleting}
                                    onClick={handleDeleteClick}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        <p className="font-medium italic mb-4 text-gray-800">
                            {provocation!.question}
                        </p>
                        <p className="mb-4 text-gray-700">{provocation!.description}</p>

                        {deleteError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                                {deleteError}
                            </div>
                        )}


                        <div className="flex flex-col gap-3">
                            {!hasWorlds && (
                                <Button
                                    onClick={() =>
                                        provocation && provocationToProject(provocation, onNavigate)
                                    }
                                >
                                    {isCached ? "Explorar y guardar mundo" : "Explorar nuevo mundo"}
                                    <Globe className="w-4 h-4 ml-1" />
                                </Button>
                            )}

                            {hasWorlds && (
                                <Button variant="outline" onClick={onOpenWorlds}>
                                    Explorar mundo creado
                                    <Globe className="w-4 h-4 ml-1 text-blue-900" />
                                </Button>
                            )}
                        </div>

                    </>
                )}
            </div>
        </div>

        <ConfirmationDialog
            isOpen={confirmDeleteOpen}
            onOpenChange={setConfirmDeleteOpen}
            title="Eliminar provocación"
            description={`¿Estás seguro de que querés eliminar la provocación "${provocation?.title}"? Esta acción no se puede deshacer.`}
            isDanger
            confirmText="Eliminar"
            cancelText="Cancelar"
            onConfirm={handleConfirmDelete}
        />
        </>
    );
}
