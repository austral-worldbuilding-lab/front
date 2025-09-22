import {  Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Provocation } from "@/types/mandala";

interface ProvocationBoxProps {
    open: boolean;
    onClose: () => void;
    provocations: Provocation[];
    onSelect: (p: Provocation) => void;
    onGenerateAI: () => void;
    onCreateManual: () => void;
    loading?: boolean;
    error?: string | null;
}

export default function ProvocationBox({
                                           open,
                                           onClose,
                                           provocations,
                                           onSelect,
                                           onGenerateAI,
                                           onCreateManual,
                                           loading = false,
                                           error = null,
                                       }: ProvocationBoxProps) {
    if (!open) return null;

    return (
        <div className="fixed bottom-4 left-4 w-[400px] max-h-[600px] bg-white border rounded-xl shadow-2xl z-50 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Provocaciones</h2>
                <X
                    className="cursor-pointer w-6 h-6 text-gray-600 hover:text-gray-900 transition-colors"
                    onClick={onClose}
                />
            </div>

            <div className="px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                        <Button color="primary" className="flex items-center gap-2">
                            Crear provocaciones
                        </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content
                        side="bottom"
                        align="start"
                        sideOffset={6}
                        className="min-w-[14rem] rounded-md border bg-white p-2 text-sm shadow-lg"
                    >
                        <DropdownMenu.Item
                            className="cursor-pointer px-3 py-2 hover:bg-gray-100 flex items-center gap-2 rounded-md"
                            onSelect={onGenerateAI}
                        >
                            Generar con IA <Sparkles className="w-4 h-4" />
                        </DropdownMenu.Item>

                        <DropdownMenu.Item
                            className="cursor-pointer px-3 py-2 hover:bg-gray-100 flex items-center gap-2 rounded-md"
                            onSelect={onCreateManual}
                        >
                            Crear manualmente
                        </DropdownMenu.Item>
                    </DropdownMenu.Content>
                </DropdownMenu.Root>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {loading ? (
                    <p className="animate-pulse text-gray-500 text-center">
                        Cargando provocaciones…
                    </p>
                ) : error ? (
                    <p className="text-red-600 text-center">{error}</p>
                ) : provocations.length === 0 ? (
                    <p className="text-gray-500 text-center">No hay provocaciones generadas.</p>
                ) : (
                    <ul className="space-y-2">
                        {provocations.map((p) => (
                            <li
                                key={p.id}
                                className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => onSelect(p)}
                            >
                                <p className="font-medium">{p.question}</p>

                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
