import { useEffect, useState } from "react";
import FileList from "@/components/project/FileList";
import FileLoader from "@/components/project/FileLoader";
import Loader from "@/components/common/Loader";
import { X } from "lucide-react";

interface OrganizationFile {
    id: string;
    name: string;
    size: number;
    uploadedAt: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    organizationId: string;
}

const OrganizationFilesSidebar = ({ open, onClose, organizationId }: Props) => {
    const [files, setFiles] = useState<OrganizationFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchFiles = async () => {
        setLoading(true);
        setError("");

        try {
            // 🔹 TODO: reemplazar esto por llamada real al backend


            setFiles([]);
        } catch (err) {
            setError("Error al cargar archivos de la organización");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) fetchFiles();
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed top-0 right-0 h-full w-[32rem] bg-white shadow-xl border-l p-6 z-50 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Archivos de la organización</h2>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                    <X size={20}/>
                </button>
            </div>

            <div className="mb-4">
                <FileLoader onUploadComplete={fetchFiles} projectId={organizationId}/>
            </div>

            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <Loader size="small" text="Cargando archivos..."/>
                ) : (
                    <FileList
                        files={files.map((f) => ({
                            id: f.id,
                            file_name: f.name,
                            file_type: f.name.split(".").pop() || "unknown",
                            size: f.size,
                            uploadedAt: f.uploadedAt,
                        }))}
                        loading={loading}
                        error={error}
                    />
                )}
            </div>
        </div>
    );
};

export default OrganizationFilesSidebar;
