import { BarChart2 } from "lucide-react"; // ícono de métrica
import { Solution } from "@/pages/app/project/SolutionPage.tsx";

interface SolutionCardProps {
    solution: Solution;
}

export default function SolutionCard({ solution }: SolutionCardProps) {
    const impactColors: Record<"low" | "medium" | "high", string> = {
        low: "text-green-500",
        medium: "text-yellow-500",
        high: "text-red-500",
    };

    const iconColor = impactColors[solution.impact?.level || "medium"];

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

            {solution.impact && (
                <div className="mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">Impacto</h4>
                    <div className="flex items-start gap-2">
                        <BarChart2 className={`h-5 w-5 mt-1 flex-shrink-0 ${iconColor}`} />
                        <p className="text-gray-700 text-base leading-relaxed">
                            {solution.impact.description}
                        </p>
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
                        {solution.provocations.length > 4 && (
                            <div className="text-xs text-gray-500 mt-1 ml-1">
                                +{solution.provocations.length - 4} más
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
