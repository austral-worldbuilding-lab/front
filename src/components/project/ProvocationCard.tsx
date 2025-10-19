import { Globe, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import useProvocationToProject from "@/hooks/useProvocationToProject";
import { Provocation } from "@/types/mandala";

interface ProvocationCardProps {
    provocation: Provocation | null;
    open?: boolean;
    onClose: () => void;
    onSave?: (data: Omit<Provocation, "id">) => void;
    onOpenWorlds?: () => void;
    onNavigate?: () => void;
}

export default function ProvocationCard({
                                            provocation,
                                            open = true,
                                            onClose,
                                            onSave,
                                            onOpenWorlds,
                                            onNavigate,
                                        }: ProvocationCardProps) {
    const isCreate = !provocation;
    const [title, setTitle] = useState("");
    const [question, setQuestion] = useState("");
    const [description, setDescription] = useState("");
    const { provocationToProject } = useProvocationToProject();

    if (!open) return null;

    const handleSave = () => {
        if (onSave) {
            onSave({
                projectsOrigin: provocation?.projectsOrigin ?? [],
                title,
                question,
                description,
            });
            onClose();
        }
    };

    const isCached = provocation?.isCached || !provocation?.id;
    const hasWorlds = (provocation?.projectsOrigin?.length ?? 0) > 0;
    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-100">
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg w-[500px] max-w-full p-6 relative">
                <button
                    className="absolute top-3 right-3 text-gray-500 hover:text-black"
                    onClick={onClose}
                >
                    <X size={20} />
                </button>

                {isCreate ? (
                    <>
                        <h3 className="text-xl font-bold mb-4">Crear Provocación</h3>
                        <Input
                            placeholder="Título"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="mb-3"
                        />
                        <Input
                            placeholder="Pregunta: ¿Qué pasaría si...?"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            className="mb-3"
                        />
                        <Textarea
                            placeholder="Descripción"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mb-4"
                        />
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button onClick={handleSave} disabled={!title || !question}>
                                Guardar
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-bold text-gray-900">
                                {provocation!.title}
                            </h3>

                        </div>

                        <p className="font-medium italic mb-4 text-gray-800">
                            {provocation!.question}
                        </p>
                        <p className="mb-4 text-gray-700">{provocation!.description}</p>


                        <div className="flex flex-col gap-3">
                            {!hasWorlds && (
                                <Button
                                    onClick={() =>
                                        provocation && provocationToProject(provocation, onNavigate)
                                    }
                                >
                                    {isCached ? "Explorar y guardar mundo" : "Explorar nuevo mundo"}
                                    <Globe className="w-4 h-4 ml-1" />
                                </Button>
                            )}

                            {hasWorlds && (
                                <Button variant="outline" onClick={onOpenWorlds}>
                                    Explorar mundo creado
                                    <Globe className="w-4 h-4 ml-1 text-blue-900" />
                                </Button>
                            )}
                        </div>

                    </>
                )}
            </div>
        </div>
    );
}
