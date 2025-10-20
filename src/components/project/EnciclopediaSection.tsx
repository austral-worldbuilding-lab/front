import { Button } from "@/components/ui/button";
import { BookOpen, Info, Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useEncyclopediaJob } from "@/hooks/useEnciclopediaJob";
import { useFiles } from "@/hooks/useFiles";
import ProgressBar from "@/components/common/ProgressBar.tsx";

function translateStatus(status: string | null) {
    switch (status) {
        case "waiting":
            return "Esperando...";
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

export default function EncyclopediaSection({
                                                projectId,
                                                projectName,
                                            }: {
    projectId: string;
    projectName: string;
}) {
    const { startJob, status, progress, storageUrl, encyclopedia, error } =
        useEncyclopediaJob(projectId, projectName);
    const { files } = useFiles("project", projectId, true);

    const handleStart = async () => {
        const selectedFiles = files.filter((f) => f.selected).map((f) => f.file_name);
        if (selectedFiles.length === 0) {
            alert("Seleccioná al menos un archivo antes de generar la enciclopedia.");
            return;
        }
        await startJob(selectedFiles);
    };

    const showProgress =
        status === "waiting" || status === "delayed" || status === "active";
    const showCompleted = status === "completed";
    const showError = !!error;

    return (
        <div className="bg-white border border-gray-200 rounded-[12px] shadow-sm p-8 flex flex-col gap-4 w-full mb-12">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <BookOpen size={28} className="text-primary" />
                    <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                        Enciclopedia del proyecto
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
                                        La enciclopedia es un resumen generado con IA que recopila la información de las mandalas, archivos y elementos del mundo.
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </h2>
                </div>

                {(!status || status === "none" || status === "failed" || status === "completed") && (
                    <Button onClick={handleStart} color="primary" icon={<Sparkles size={16} />}>
                        Generar enciclopedia
                    </Button>
                )}
            </div>

            {showProgress && (
                <div className="mt-4">
                    <p className="text-gray-700 mb-2">
                        Estado:{" "}
                        <span className="font-medium text-gray-900">
              {translateStatus(status)}
            </span>
                    </p>
                    <ProgressBar value={progress} />
                </div>
            )}

            {showError && <p className="text-red-500 mt-2">{error}</p>}

            {showCompleted && (
                <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="font-medium text-gray-800 mb-2">
                        Enciclopedia generada correctamente
                    </p>
                    {storageUrl ? (
                        <a
                            href={storageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline hover:text-blue-800"
                        >
                            Abrir enciclopedia
                        </a>
                    ) : (
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto max-h-[400px]">
              {encyclopedia}
            </pre>
                    )}
                </div>
            )}
        </div>
    );
}
