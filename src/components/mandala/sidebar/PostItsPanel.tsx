import { PropsWithChildren } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {usePostItsGenerator} from "@/components/mandala/sidebar/usePostItsGenerator.tsx";

export interface PostItsPanelProps extends PropsWithChildren {
    mandalaId: string;
    selected: { dimensions: string[]; scales: string[] };
}

export default function PostItsPanel({ mandalaId, selected, children }: PostItsPanelProps) {
    const { items, loading, error, generate } = usePostItsGenerator(mandalaId);

    return (
        <div className="flex-1 min-h-0 flex flex-col gap-3">
            {/* grid scrollable */}
            <div className="flex-1 min-h-0">
                <div className="h-full border rounded-lg p-4 overflow-y-auto custom-scrollbar">
                    {loading && <p>Generando…</p>}
                    {error && <p className="text-red-600">Error: {error}</p>}
                    {!loading && items.length === 0 && <p>No hay Post-Its para mostrar.</p>}

                    {!loading && items.length > 0 && (
                        <div className="grid grid-cols-2 gap-4">
                            {items.map((text, idx) => (
                                <div key={idx} className="aspect-square rounded-full bg-yellow-300/80 flex items-center justify-center text-center font-medium">
                                    <span className="px-4">{text}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* filtros + botón acción (sticky) */}
            <div className="mt-2">
                {children}
                <div className="sticky bottom-0 bg-background pt-3 pb-4">
                    <Button
                        className="w-full h-11 text-base"
                        onClick={() => generate(selected.dimensions, selected.scales)}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Generar Post-Its
                    </Button>
                </div>
            </div>
        </div>
    );
}
