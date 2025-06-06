import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProject } from "@/hooks/useProject";
import Loader from "@/components/common/Loader";
import { ArrowLeftIcon, FilePlus, Sparkles } from "lucide-react";


export default function CreateMandalaPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const { createMandala, loading, projectId } = useProject();

  const handleCreate = async (type: "blank" | "ai") => {
    if (!name.trim()) {
      setError("The name cannot be empty.");
      return;
    }

    setError(null);

    try {
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
