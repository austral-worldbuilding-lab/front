import {Clock, SquareCheckBig} from "lucide-react";
import {ActionItem} from "@/types/mandala";

interface Props {
    actionItems: ActionItem[];
}

export default function ActionItemsSection({ actionItems }: Props) {
    if (!actionItems?.length) return null;

    return (
        <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-primary"> <SquareCheckBig className="w-5 h-5" /></span> Plan de Acción
            </h4>

            <div className="space-y-4">
                {actionItems
                    .sort((a, b) => a.order - b.order)
                    .map((item) => (
                        <div
                            key={item.order}
                            className="flex items-start gap-3 border border-gray-100 rounded-lg p-4 bg-gray-50"
                        >
                            <div className="w-6 h-6 flex items-center justify-center bg-primary text-white rounded-full text-sm font-semibold">
                                {item.order}
                            </div>

                            <div className="flex-1">
                                <h5 className="font-semibold text-gray-900">
                                    {item.title}
                                </h5>
                                <p className="text-gray-700 text-sm mt-1">
                                    {item.description}
                                </p>

                                {item.duration && (
                                    <div className="flex items-center gap-1 text-gray-500 text-xs mt-2">
                                        <Clock size={14} />
                                        {item.duration}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
}
