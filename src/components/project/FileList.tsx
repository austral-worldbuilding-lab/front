import {Download, Trash2} from "lucide-react";
import {useEffect, useState} from "react";
import ConfirmationDialog from "../common/ConfirmationDialog";
import {useParams} from "react-router-dom";
import {useFiles} from "../../hooks/useFiles.ts";
import {FileItem, SelectedFile} from "@/types/mandala";
import {FileScope} from "@/services/filesService.ts";

interface FilesListProps {
    scope: FileScope;
    id: string,
    files?: FileItem[],
    loading?: boolean,
    error?: Error,
    open: boolean
}

export default function FilesList({scope, id, files, loading, error, open}: FilesListProps) {
    const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);


    const {projectId: paramProjectId} = useParams<{ projectId: string }>();
    const projectId = scope === "project" ? id || paramProjectId : undefined;
    const {removeFile, isDeleting} = useFiles(scope, projectId!);

    const handleDeleteClick = (file: FileItem) => {
        setFileToDelete(file);
        setIsDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!fileToDelete) return;

        try {
            await removeFile(fileToDelete.file_name);

            setSelectedFiles(prev => prev.filter(f => f !== fileToDelete.file_name));

            const stored = JSON.parse(localStorage.getItem("selectedFiles") || "[]");
            const updated = stored.filter((f: string) => f !== fileToDelete.file_name);
            localStorage.setItem("selectedFiles", JSON.stringify(updated));

            setIsDialogOpen(false);
            setFileToDelete(null);
        } catch (err) {
            console.error("Error deleting file:", err);
        }
    };

    const handleDownload = async (file: FileItem) => {
        const response = await fetch(file.url);
        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = file.file_name;
        link.click();
    };


    useEffect(() => {
        if (open) {
            const stored: SelectedFile[] = JSON.parse(localStorage.getItem("selectedFiles") || "[]");
            const contextFiles = stored.filter(f => f.parentId === id && f.scope === scope);
            setSelectedFiles(contextFiles.map(f => f.fileName));
        }
    }, [open, id, scope]);

    const toggleFile = (file: FileItem) => {
        setSelectedFiles(prev => {
            const stored: SelectedFile[] = JSON.parse(localStorage.getItem("selectedFiles") || "[]");

            const exists = stored.some(f =>
                f.fileName === file.file_name &&
                f.scope === scope &&
                f.parentId === id
            );

            let updated: SelectedFile[];
            if (prev.includes(file.file_name)) {
                updated = stored.filter(f =>
                    !(f.fileName === file.file_name && f.scope === scope && f.parentId === id)
                );
            } else {
                updated = exists ? stored : [...stored, { fileName: file.file_name, scope, parentId: id }];
            }

            localStorage.setItem("selectedFiles", JSON.stringify(updated));

            return updated.filter(f => f.scope === scope && f.parentId === id).map(f => f.fileName);
        });
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
                                        <li key={index} className="flex items-center justify-between gap-2 text-sm text-gray-800
             bg-gray-50 hover:bg-blue-50 rounded-md px-2 py-1 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFiles.includes(file.file_name)}
                                                    onChange={() => toggleFile(file)}
                                                />
                                                <a
                                                    href={file.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    {file.file_name}
                                                </a>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleDownload(file)}
                                                    className="text-gray-600 hover:text-blue-600"
                                                    title="Descargar"
                                                >
                                                    <Download className="w-4 h-4"/>
                                                </button>

                                                {scopeKey === scope && (
                                                    <button
                                                        onClick={() => handleDeleteClick(file)}
                                                        className="text-red-500 hover:text-red-700"
                                                        disabled={isDeleting}
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="w-4 h-4"/>
                                                    </button>
                                                )}
                                            </div>
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