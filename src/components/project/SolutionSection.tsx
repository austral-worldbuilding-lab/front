import { useState } from "react";
import { Loader2, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProgressBar from "@/components/common/ProgressBar";
import SolutionCard from "@/components/project/SolutionCard";
import { CreateSolutionModal } from "@/components/project/CreateSolutionModal";
import { useSolutionJob } from "@/hooks/useSolutionJob";
import useSolutions from "@/hooks/useSolutions";
import { useSolutionValidation } from "@/hooks/useSolutionValidation";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export default function SolutionsSection({ projectId }: { projectId: string }) {
    const { status, progress, startJob } = useSolutionJob(projectId);
    const { solutions, creating, createSolution } = useSolutions(projectId);
    const [modalOpen, setModalOpen] = useState(false);

    const { canGenerate, reason, loading: validationLoading } = useSolutionValidation(projectId);

    const disabledGenerate =
        validationLoading || status === "active" || status === "waiting" || !canGenerate;

    const handleGenerateSolutions = () => {
        if (!disabledGenerate) startJob();
    };

    return (
        <div className="mt-6 bg-white border border-gray-200 rounded-[12px] shadow-sm p-8 flex flex-col gap-8 w-full">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-800">Soluciones</h2>
                <div className="flex gap-3 items-center">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span>
                                    <Button
                                        variant="outline"
                                        onClick={handleGenerateSolutions}
                                        disabled={disabledGenerate}
                                        className="flex items-center gap-2"
                                    >
                                        {validationLoading ? (
                                            <>
                                                <Loader2 className="animate-spin" size={16} /> Validando...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={16} /> Generar
                                            </>
                                        )}
                                    </Button>
                                </span>
                            </TooltipTrigger>

                            {!canGenerate && !validationLoading && (
                                <TooltipContent side="top" className="max-w-xs text-sm">
                                    <p>
                                        Para generar soluciones, el proyecto debe tener suficiente progreso y contenido previo.
                                    </p>
                                    {reason && (
                                        <p className="mt-2">
                                            {reason}
                                        </p>
                                    )}
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </TooltipProvider>

                    <Button
                        onClick={() => setModalOpen(true)}
                        disabled={creating}
                        className="flex items-center gap-2"
                    >
                        <Plus size={16} /> Crear manualmente
                    </Button>
                </div>
            </div>

            <div className="text-sm text-gray-600 border-l-4 border-blue-200 bg-blue-50 p-4 rounded-md">
                <p className="font-medium text-gray-800">
                    Para generar soluciones, el proyecto debe tener suficiente progreso y contenido previo.
                </p>
                {validationLoading ? (
                    <p className="italic text-gray-500 mt-1">Validando requisitos...</p>
                ) : reason ? (
                    <p className="mt-1 text-gray-700">{reason}</p>
                ) : (
                    <p className="mt-1 text-gray-500 italic">
                        (Aún no hay información adicional sobre el estado del proyecto)
                    </p>
                )}
            </div>

            {(status === "active" || status === "waiting") && (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <span>
                            {status === "waiting"
                                ? "Esperando turno en la cola..."
                                : "Generando soluciones..."}
                        </span>
                    </div>
                    <ProgressBar value={progress} />
                </div>
            )}

            {status === "completed" && (
                <p className=" text-sm">Soluciones generadas correctamente</p>
            )}

            {solutions.length === 0 ? (
                <div className="border border-dashed border-gray-300 rounded-lg p-10 text-center text-gray-500 w-full h-[350px] flex flex-col items-center justify-center">
                    <p className="text-lg font-medium mb-2">Aún no hay soluciones creadas</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {solutions.map((solution) => (
                        <SolutionCard key={solution.id} solution={solution} />
                    ))}
                </div>
            )}

            <CreateSolutionModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                onCreateSolution={async (solution) => {
                    await createSolution(solution);
                    setModalOpen(false);
                }}
                projectId={projectId}
            />
        </div>
    );
}
