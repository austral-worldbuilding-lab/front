import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProject } from "@/hooks/useProject";
import Loader from "@/components/common/Loader";
import { ArrowLeftIcon, FilePlus, Sparkles } from "lucide-react";
import TagInput, { Item } from "@/components/common/TagInput.tsx";
import { Sectors, Levels } from "@/constants/mandala";


const initialDimensions: Item[] = Sectors.map(sector => ({
  id: sector.id,
  value: sector.name,
  color: "rgba(180, 210, 255, 0.7)",
}));

const initialScales: Item[] = Levels.map(level => ({
  id: level.id,
  value: level.name,
  color: "rgba(180, 210, 255, 0.7)",
}));

export default function CreateMandalaPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [dimensions, setDimensions] = useState<Item[]>(initialDimensions);
  const [scales, setScales] = useState<Item[]>(initialScales);
  const { createMandala, loading, projectId } = useProject();

  const handleCreate = async (type: "blank" | "ai") => {
    if (!name.trim()) {
      setError("The name cannot be empty.");
      return;
    }

    setError(null);

    try {
      // TODO: Enviar `dimensions` y `scales` al backend cuando esté soportado
      void dimensions;
      void scales;
      
      const id = await createMandala(type, name);
      navigate(`/app/project/${projectId}/mandala/${id}`);
    } catch {
      setError("An error occurred while creating the mandala.");
    }
  };

  // Mostrar el loader de forma global si está cargando
  if (loading) {
    return (
      <div className="flex items-center justify-center w-screen h-screen">
        <Loader size="large" text="Creating mandala, please wait..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 items-center justify-center h-screen">
      <div className="absolute top-10 left-10">
        <Link to={`/app/project/${projectId}/mandalas`}>
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
      </div>
      
      <div className="flex flex-col gap-6 w-full max-w-2xl px-4">
        <h1 className="text-2xl font-semibold text-center">Create new mandala</h1>
        
        <div className="flex flex-col gap-4">
          <Input
            placeholder="Mandala's name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            className="text-lg px-4 py-2"
          />

          <div className="grid gap-6">
            <TagInput
              label="Dimensions"
              initialItems={initialDimensions}
              onChange={setDimensions}
            />

            <TagInput
              label="Scales"
              initialItems={initialScales}
              onChange={setScales}
            />
          </div>

          <div className="flex gap-4 justify-center items-center mt-4">
            <Button
              color="primary"
              onClick={() => handleCreate("blank")}
              disabled={loading || !name.trim()}
              icon={<FilePlus size={16} />}
              className="w-full"
            >
              Empty
            </Button>

            <Button
              color="secondary"
              onClick={() => handleCreate("ai")}
              disabled={loading || !name.trim()}
              icon={<Sparkles size={16} />}
              className="w-full"
            >
              AI Generated
            </Button>
          </div>

          {error && <p className="text-red-500 text-center">{error}</p>}
        </div>
      </div>
    </div>
  );
}
