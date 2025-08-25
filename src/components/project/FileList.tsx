import {FileText, Trash2} from "lucide-react";
import {useState} from "react";
import ConfirmationDialog from "../common/ConfirmationDialog";
import {useParams} from "react-router-dom";
import {useFiles} from "../../hooks/useFiles.ts";
import {FileItem} from "@/types/mandala";
import {FileScope} from "@/services/filesService.ts";

interface ProjectFilesListProps {
    scope: FileScope;
    id: string,
    files?: FileItem[],
    loading?: boolean,
    error?: Error
}

export default function ProjectFilesList({scope, id: propProjectId, files, loading, error}: ProjectFilesListProps) {
    const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const {projectId: paramProjectId} = useParams<{ projectId: string }>();

    const projectId = propProjectId || paramProjectId;
    const {removeFile, isDeleting} = useFiles(scope, projectId!);

    const handleDeleteClick = (file: FileItem) => {
        setFileToDelete(file);
        setIsDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!fileToDelete) return;

        try {
            await removeFile(fileToDelete.file_name);
            setIsDialogOpen(false);
            setFileToDelete(null);
        } catch (err) {
            console.error("Error deleting file:", err);
        }
    };

    const groupedFiles: Record<string, FileItem[]> = {};
    files?.forEach(file => {
        const key = file.source_scope || "unknown";
        if (!groupedFiles[key]) groupedFiles[key] = [];
        groupedFiles[key].push(file);
    });

    const scopeOrder = ["organization", "project", "mandala"];


    return (
        <div>
            {loading && <p>Loading files...</p>}
            {error && <p className="text-red-500">{typeof error === "string" ? error : "Error loading files"}</p>}
            {!files || files.length === 0 ? (
                <p>No hay archivos cargados aún</p>
            ) : (
                <>
                    {scopeOrder.map(scopeKey => (
                        groupedFiles[scopeKey] ? (
                            <div key={scopeKey} className="mb-4">
                                <h3 className="font-semibold text-gray-700 mb-1 capitalize">
                                    {scopeKey === "organization" ? "Archivos de la organización" :
                                        scopeKey === "project" ? "Archivos del proyecto" :
                                            scopeKey === "mandala" ? "Archivos de la mandala" :
                                                scopeKey}
                                </h3>
                                <ul className="space-y-1">
                                    {groupedFiles[scopeKey].map((file, index) => (
                                        <li
                                            key={index}
                                            className="flex items-center justify-between gap-2 text-sm text-gray-800"
                                        >
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-gray-500"/>
                                                <span>{file.file_name}</span>
                                            </div>

                                            <button
                                                onClick={() => handleDeleteClick(file)}
                                                className="text-red-500 hover:text-red-700"
                                                disabled={isDeleting}
                                            >
                                                <Trash2 className="w-4 h-4"/>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : null
                    ))}
                </>
            )}

            <ConfirmationDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                title="Eliminar archivo"
                description={`¿Estás seguro de que querés eliminar el archivo "${fileToDelete?.file_name}"?`}
                isDanger
                confirmText="Eliminar"
                cancelText="Cancelar"
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
}