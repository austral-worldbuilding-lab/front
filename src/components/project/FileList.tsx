import { useEffect, useState } from 'react';
import { getProjectFiles } from '../../services/filesService';

type FileData = {
    file_name: string;
    file_type: string;
};

interface ProjectFilesListProps {
    projectId: string; // obligatorio
}

export default function ProjectFilesList({ projectId }: ProjectFilesListProps) {
    const [files, setFiles] = useState<FileData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        getProjectFiles(projectId)
            .then(setFiles)
            .catch(() => setError('Error al cargar los archivos.'))
            .finally(() => setLoading(false));
    }, [projectId]);

    if (loading) return <p>Cargando archivos...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="mt-4">
            {files.length === 0 ? (
                <p>No hay archivos cargados aún.</p>
            ) : (
                <ul className="list-disc ml-6 space-y-1">
                    {files.map((file, index) => (
                        <li key={index}>
                            {file.file_name}{' '}
                            <span className="text-gray-500 text-sm">({file.file_type})</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
