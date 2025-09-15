import {Pencil, Sparkles, X} from "lucide-react";
import { Button } from "@/components/ui/button";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {Provocation} from "@/types/mandala";

interface ProvocationBoxProps {
    open: boolean;
    onClose: () => void;
    provocations: Provocation[];
    onSelect: (p: Provocation) => void;
    onGenerateAI: () => void;
    onCreateManual: () => void;
}

export default function ProvocationBox({
                                           open,
                                           onClose,
                                           provocations,
                                           onSelect,
                                           onGenerateAI,
                                           onCreateManual,
                                       }: ProvocationBoxProps) {
    if (!open) return null;

    return (
        <div className="fixed bottom-4 left-4 w-80 bg-white border rounded-lg shadow-lg z-40">
            <div className="flex items-center justify-between px-4 py-3 border-b">
                <h2 className="text-lg font-bold">Provocaciones</h2>
                <div className="flex gap-2 items-center">
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                            <Button variant="outline">+</Button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content
                            side="bottom"
                            align="start"
                            sideOffset={4}
                            className="z-50 min-w-[12rem] rounded-md border bg-white p-1 text-sm shadow-md"
                        >
                            <DropdownMenu.Item
                                className="cursor-pointer px-2 py-1.5 hover:bg-gray-100 flex items-center gap-2"
                                onSelect={onGenerateAI}
                            >
                                Generada con IA <Sparkles className="w-4 h-4" />
                            </DropdownMenu.Item>

                            <DropdownMenu.Item
                                className="cursor-pointer px-2 py-1.5 hover:bg-gray-100 flex items-center gap-2"
                                onSelect={onCreateManual}
                            >
                                Crear manualmente <Pencil className="w-4 h-4" />
                            </DropdownMenu.Item>

                        </DropdownMenu.Content>
                    </DropdownMenu.Root>

                    <X className="cursor-pointer w-5 h-5 text-gray-600" onClick={onClose} />
                </div>
            </div>

            <div className="p-4 max-h-64 overflow-y-auto">
                {provocations.length === 0 ? (
                    <p className="text-gray-500 text-sm">No hay provocaciones generadas.</p>
                ) : (
                    <ul className="space-y-2">
                        {provocations.map((p) => (
                            <li
                                key={p.id}
                                className="p-2 border rounded cursor-pointer hover:bg-gray-50"
                                onClick={() => onSelect(p)}
                            >
                                {p.question}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
