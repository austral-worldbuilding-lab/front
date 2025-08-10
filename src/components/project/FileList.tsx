import { ProjectFile } from "../../services/filesService";
import { FileText, Trash2 } from "lucide-react";
import { useState } from "react";
import ConfirmationDialog from "../common/ConfirmationDialog";
import { useParams } from "react-router-dom";
import { useProjectFiles } from "../../hooks/useProjectFiles";

interface ProjectFilesListProps {
  projectId?: string;
}

export default function ProjectFilesList({ projectId: propProjectId }: ProjectFilesListProps) {
  const [fileToDelete, setFileToDelete] = useState<ProjectFile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { projectId: paramProjectId } = useParams<{ projectId: string }>();
  
  const projectId = propProjectId || paramProjectId;
  const { files, isLoading: loading, error, removeFile, isDeleting } = useProjectFiles(projectId!);

  const handleDeleteClick = (file: ProjectFile) => {
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

  return (
      <div>
        {loading && <p>Loading files...</p>}
        {error && <p className="text-red-500">{error instanceof Error ? error.message : 'Error loading files'}</p>}
        {files.length === 0 ? (
            <p>No hay archivos cargados aún</p>
        ) : (
            <ul className="space-y-1">
              {files.map((file, index) => (
                  <li
                      key={index}
                      className="flex items-center justify-between gap-2 text-sm text-gray-800"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span>{file.file_name}</span>
                    </div>

                    <button
                        onClick={() => handleDeleteClick(file)}
                        className="text-red-500 hover:text-red-700"
                        disabled={isDeleting}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
              ))}
            </ul>
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
