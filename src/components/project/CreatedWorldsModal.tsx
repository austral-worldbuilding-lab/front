import {ArrowLeft, ArrowRight, X} from "lucide-react";
import { Button } from "@/components/ui/button";
import {Provocation, ProvocationProject} from "@/types/mandala";
import {useNavigate} from "react-router-dom";

interface CreatedWorldsModalProps {
    provocation: Provocation;
    open: boolean;
    onClose: () => void;
    onBack: () => void;
    onNavigate: () => void;
}

export default function CreatedWorldsModal({provocation, open, onClose, onBack, onNavigate}: CreatedWorldsModalProps,) {
    const navigate = useNavigate();
    if (!open) return null;

    const worlds = provocation.projectsOrigin || [];

    const handleNavigate = (world: ProvocationProject) => {
        onNavigate();
        navigate(`/app/organization/${world.organizationId}/projects/${world.id}`);
    };

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-100">
            <div className="bg-white rounded-lg shadow-lg w-[500px] max-w-full p-6 relative max-h-[60vh] flex flex-col">
                {/* Volver */}
                <button
                    className="absolute top-3 left-3 text-gray-500 hover:text-black"
                    onClick={onBack}
                >
                    <ArrowLeft size={20} />
                </button>

                {/* Cerrar */}
                <button
                    className="absolute top-3 right-3 text-gray-500 hover:text-black"
                    onClick={onClose}
                >
                    <X size={20} />
                </button>

                <h3 className="text-xl font-bold mb-4 mt-4">
                    Mundos creados para: {provocation.title}
                </h3>

                {worlds.length > 0 ? (
                    <div className="
                    space-y-3 overflow-y-auto pr-2 space-y-3
                    [&::-webkit-scrollbar]:w-2
                    [&::-webkit-scrollbar-track]:bg-transparent
                    [&::-webkit-scrollbar-thumb]:bg-primary
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    ">
                        {worlds.map((world) => (
                            <div
                                key={world.id}
                                className="group border rounded-md p-3 hover:bg-gray-50 transition cursor-pointer flex justify-between items-center"                                onClick={() => handleNavigate(world)}
                            >
                                <div>
                                    <h4 className="font-semibold">{world.name}</h4>
                                    <p className="text-sm text-gray-600">{world.description}</p>
                                </div>
                                {/* Flecha aparece solo en hover */}
                                <ArrowRight
                                    size={18}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 group-hover:text-gray-600"
                                />
                            </div>

                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No hay mundos creados aún.</p>
                )}

                <div className="mt-6 flex justify-end">
                    <Button variant="outline" onClick={onClose}>
                        Cerrar
                    </Button>
                </div>
            </div>
        </div>
    );
}
