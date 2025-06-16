import { ProjectFile } from "../../services/filesService";
import { FileText } from "lucide-react";

interface ProjectFilesListProps {
  files: ProjectFile[];
  loading: boolean;
  error: string;
}

export default function ProjectFilesList({
  files,
  loading,
  error,
}: ProjectFilesListProps) {
  if (loading) return <p>Loading files...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      {files.length === 0 ? (
        <p>No hay archivos cargados aún</p>
      ) : (
        <ul className="list-disc space-y-1">
          {files.map((file, index) => (
            <li
              key={index}
              className="flex items-center gap-2 text-sm text-gray-800"
            >
              <FileText className="w-4 h-4 text-gray-500" />
              <span>{`${file.file_name}`}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
