import {Globe, X} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {Provocation} from "@/types/mandala";

interface ProvocationCardProps {
    provocation: Provocation | null;
    onClose: () => void;
    onSave?: (data: Omit<Provocation, "id">) => void;
}

export default function ProvocationCard({ provocation, onClose, onSave }: ProvocationCardProps) {
    const isCreate = !provocation;

    const [title, setTitle] = useState("");
    const [question, setQuestion] = useState("");
    const [description, setDescription] = useState("");

    const handleSave = () => {
        if (onSave) {
            onSave({ title, question, description });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-[500px] max-w-full p-6 relative">
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
                            <Button color="primary" onClick={handleSave} disabled={!title || !question}>
                                Guardar
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <h3 className="text-xl font-bold mb-2">{provocation!.title}</h3>
                        <p className="text-gray-700 font-medium mb-4 italic">{provocation!.question}</p>
                        <p className="text-gray-600 mb-4">{provocation!.description}</p>
                        <Button color="secondary"    >
                            Explorar mundo <Globe className="w-4 h-4" />
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
