import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProject } from "@/hooks/useProject";
import Loader from "@/components/common/Loader";

export default function CreateMandalaPage() {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [name, setName] = useState("");
    const { createMandala, loading, projectId } = useProject();

    const handleCreate = async (type: "blank" | "ai") => {
        if (!name.trim()) {
            setError("El nombre no puede estar vacío.");
            return;
        }

        setError(null);

        try {
            const id = await createMandala(type, name);
            navigate(`/app/project/${projectId}/mandala/${id}`);
        } catch {
            setError("Ocurrió un error al crear la mandala.");
        }
    };

    // Mostrar el loader de forma global si está cargando
    if (loading) {
        return (
            <div className="flex items-center justify-center w-screen h-screen">
                <Loader size="large" text="Creando mandala..." />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 items-center justify-center h-screen">
            <h1 className="text-2xl font-semibold">Crear nueva mandala</h1>
            <Input
                placeholder="Nombre de la mandala"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="w-96 text-lg px-4 py-2"
            />
            <div className="flex gap-4">
                <Button onClick={() => handleCreate("blank")} disabled={loading}>
                    Mandala en blanco
                </Button>

                <Button onClick={() => handleCreate("ai")} disabled={loading}>
                    Mandala con IA
                </Button>
            </div>

            {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
    );
}
