import { useParams, Link, useNavigate } from "react-router-dom";
import useMandalas from "@/hooks/useMandalas";
import Loader from "@/components/common/Loader";
import { ArrowLeftIcon, GlobeIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateModal from "@/components/mandala/characters/modal/CreateModal";
import {useState} from "react";
import {useCreateMandala} from "@/hooks/useCreateMandala.ts";

const MandalaListPage = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const { mandalas, loading: mandalasLoading } = useMandalas(projectId || "");
    const navigate = useNavigate();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!projectId) {
        return <div className="p-6 text-red-500">Error: Project ID not found</div>;
    }

    const { createMandala } = useCreateMandala(projectId);

    const handleCreateMandala = async (character: {
        name: string;
        description: string;
        useAIMandala: boolean;
        color: string;
        dimensions: { name: string; color?: string }[],
        scales: string[];
    }) => {
        const { name, description, color, useAIMandala, dimensions, scales } = character;

        if (!name.trim()) {
            setError("The name cannot be empty.");
            return;
        }

        setError(null);

        try {
            const id = await createMandala(name, description, color, useAIMandala, dimensions, scales);
            setIsCreateModalOpen(false);
            navigate(`/app/project/${projectId}/mandala/${id}`);
        } catch {
            setError("An error occurred while creating the mandala.");
        }
    };


    return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-12">
      <div className="absolute top-10 left-10">
        <Link to={`/app/project/${projectId}`}>
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
      </div>
      <div className="w-full max-w-2xl px-4">
        <h1 className="text-2xl font-bold mb-6 text-center">Mandalas</h1>
          <Button
              color="primary"
              className="mb-10"
              onClick={() => setIsCreateModalOpen(true)}
              icon={<PlusIcon size={16} />}
          >
              Create Mandala
          </Button>
        <div className="bg-white rounded-lg shadow-sm border">
            {mandalasLoading && <Loader size="medium" text="Loading mandalas..." />}
            {mandalas.length === 0 && !mandalasLoading ? (
                <p className="p-4 text-gray-600 text-center">
                    No mandalas created yet.
                </p>
            ) : (
            <ul className="divide-y divide-gray-100">
              {mandalas.map((mandala) => (
                <li
                  key={mandala.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <Link
                    to={`/app/project/${projectId}/mandala/${mandala.id}`}
                    className="flex items-center gap-3 p-4 text-gray-800 hover:text-blue-600 transition-colors"
                  >
                    <GlobeIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <span className="flex-1">
                      {mandala.name || "Mandala without name"}
                    </span>
                  </Link>
                </li> 
              ))}
            </ul>
          )}
        </div>
      </div>
        <CreateModal
            isOpen={isCreateModalOpen}
            onOpenChange={setIsCreateModalOpen}
            onCreateCharacter={handleCreateMandala}
            title="Create Mandala"
            createButtonText="Create Mandala"
        />
        {error && (
            <p className="text-red-500 text-sm mt-4 text-center max-w-md">{error}</p>
        )}
    </div>
  );
};

export default MandalaListPage;
