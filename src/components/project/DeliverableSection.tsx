import { Download, FileImage, BookOpen, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useDeliverables } from "@/hooks/useDeliverable";
import { useEncyclopediaJob } from "@/hooks/useEnciclopediaJob";
import { useFiles } from "@/hooks/useFiles";
import ProgressBar from "@/components/common/ProgressBar";
import GenerarButton from "../ui/GenerarButton";

function translateStatus(status: string | null) {
    switch (status) {
        case "waiting":
        case "delayed":
            return "Esperando...";
        case "active":
            return "Generando enciclopedia...";
        case "completed":
            return "Completada";
        case "failed":
            return "Error en la generación";
        default:
            return "";
    }
}

export default function DeliverablesSection({
                                                projectId}: {
    projectId: string;
    projectName: string;
}) {
    const { deliverables, loading, error } = useDeliverables(projectId);
    const { startJob, status, progress, error: encError } =
        useEncyclopediaJob(projectId);
    const { files } = useFiles("project", projectId, true);


    const handleStart = async () => {
        const selectedFiles = files.filter((f) => f.selected).map((f) => f.file_name);
        if (selectedFiles.length === 0) {
            alert("Seleccioná al menos un archivo antes de generar la enciclopedia.");
            return;
        }
        await startJob(selectedFiles);
    };

    if (loading) return <p>Cargando entregables...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="bg-white border border-gray-200 rounded-[12px] shadow-sm p-8 flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                    Entregables del proyecto
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info
                                    size={18}
                                    className="text-gray-400 hover:text-gray-600 cursor-pointer translate-y-[2px]"
                                />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs text-sm text-center">
                                <p>
                                    Incluye los recursos generados del proyecto: enciclopedia, imágenes y otros
                                    documentos.
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </h2>

                {(!status || ["none", "failed", "completed"].includes(status)) && (
                    <GenerarButton
                        text="Generar enciclopedia"
                        loading={false}
                        disabled={false}
                        onClick={handleStart}
                    />
                )}
            </div>

            {(status === "waiting" || status === "delayed" || status === "active") && (
                <div className="mt-2">
                    <p className="text-gray-700 mb-2">
                        Estado: <span className="font-medium text-gray-900">{translateStatus(status)}</span>
                    </p>
                    <ProgressBar value={progress} />
                </div>
            )}

            {encError && <p className="text-red-500 mt-2">{encError}</p>}

            {(!Array.isArray(deliverables) || deliverables.length === 0) ? (
                <div className="border border-dashed border-gray-300 rounded-lg p-10 text-center text-gray-500">
                    <p className="text-lg font-medium mb-2">No hay entregables disponibles aún</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {deliverables.map((item) => (
                        <div
                            key={item.id}
                            className="p-4 border rounded-lg flex items-center justify-between hover:shadow-md"
                        >
                            <div className="flex items-center gap-3">
                                {item.type === "encyclopedia" && <BookOpen className="text-primary" />}
                                {item.type === "ai_image" && <FileImage className="text-primary" />}
                                <span className="font-medium text-gray-800">{item.fileName}</span>
                            </div>
                            <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-blue-600 hover:underline"
                            >
                                <Download size={16} /> Descargar
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
