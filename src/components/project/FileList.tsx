import { useEffect, useState } from 'react';
import { getProjectFiles, ProjectFile } from '../../services/filesService';
import { FileText } from 'lucide-react';

interface ProjectFilesListProps {
    projectId: string;
}

export default function ProjectFilesList({ projectId }: ProjectFilesListProps) {
    const [files, setFiles] = useState<ProjectFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        getProjectFiles(projectId)
            .then((result) => setFiles(result || []))
            .catch(() => setError('Error al cargar los archivos.'))
            .finally(() => setLoading(false));
    }, [projectId]);

    if (loading) return <p>Cargando archivos...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            {files.length === 0 ? (
                <p>No hay archivos cargados aún.</p>
            ) : (
                <ul className="list-disc ml-6 space-y-1">
                    {files.map((file, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-800">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span>{`${file.file_name}.${file.file_type}`}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
