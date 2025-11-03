import { useState } from "react";
import { BarChart2, Loader2 } from "lucide-react";
import { Solution } from "@/types/mandala";
import { Button } from "@/components/ui/button";
import ActionItemsSection from "./ActionItemSection";
import useActionItems from "@/hooks/useActionItems";
import {useParams} from "react-router-dom";


interface SolutionCardProps {
    solution: Solution;
}

export default function SolutionCard({ solution }: SolutionCardProps) {
    const { projectId } = useParams<{ projectId: string }>();
    const { actionItems, loading, generateActionItems } = useActionItems(projectId!, solution.id);
    const [hasGenerated, setHasGenerated] = useState(false);

    const impactLevel =
        solution.impact?.level?.toLowerCase?.() ||
        (solution as any).impactLevel?.toLowerCase?.() ||
        "medium";

    const impactDescription =
        solution.impact?.description ||
        (solution as any).impactDescription ||
        "Sin descripción de impacto";

    const impactColors: Record<"low" | "medium" | "high", string> = {
        low: "text-green-500",
        medium: "text-yellow-500",
        high: "text-red-500",
    };

    const iconColor = impactColors[impactLevel as "low" | "medium" | "high"];

    const handleGenerate = async () => {
        await generateActionItems();
        setHasGenerated(true);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-[8px] p-6 w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{solution.title}</h3>

            {solution.description && (
                <p className="text-gray-700 text-base mb-5">{solution.description}</p>
            )}

            {solution.problem && (
                <div className="mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">Problema</h4>
                    <p className="text-gray-700 text-base leading-relaxed">
                        {solution.problem}
                    </p>
                </div>
            )}

            {impactDescription && (
                <div className="mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">Impacto</h4>
                    <div className="flex items-start gap-2">
                        <BarChart2 className={`h-5 w-5 mt-1 flex-shrink-0 ${iconColor}`} />
                        <div>
                            <p className="text-gray-700 text-base leading-relaxed">
                                {impactDescription}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {solution.provocations?.length > 0 && (
                <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        Provocaciones relacionadas
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {solution.provocations.slice(0, 4).map((prov, i) => (
                            <div
                                key={i}
                                className="bg-gray-200 text-gray-800 text-sm italic px-3 py-1 rounded-full"
                            >
                                {prov}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-6">
                <Button
                    onClick={handleGenerate}
                    disabled={loading}
                    variant="outline"
                    className="text-sm"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin mr-2 h-4 w-4" /> Generando...
                        </>
                    ) : hasGenerated ? (
                        "Regenerar Plan de Acción"
                    ) : (
                        "Generar Plan de Acción"
                    )}
                </Button>
            </div>

            {actionItems.length > 0 && (
                <ActionItemsSection actionItems={actionItems} />
            )}
        </div>
    );
}
