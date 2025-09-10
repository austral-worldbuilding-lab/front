import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Info } from "lucide-react";

interface CreateEntityModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; description?: string }) => Promise<void>;
  loading: boolean;
  error?: string | null;
  title: string;
  placeholder: string;
  showQuestions?: boolean; // true para proyectos, false para organizaciones
}

const CreateEntityModal = ({
                             open,
                             onClose,
                             onCreate,
                             loading,
                             error,
                             title,
                             placeholder,
                             showQuestions = false,
                           }: CreateEntityModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  if (!open) return null;

  const handleOnClose = () => {
    setName("");
    setDescription("");
    onClose();
  };

  const handleSubmit = () => {
    if (showQuestions) {
      onCreate({ name, description });
    } else {
      onCreate({ name });
    }
  };

  const questionText = `• ¿Qué mundo o contexto estás creando?
• ¿Qué problemas aparecen en este mundo?
• ¿Qué personajes o situaciones ilustran esos problemas?
• ¿Cuáles son los deseos de esos personajes?
• ¿Qué impacto tienen estos problemas?`;

  return (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-lg">
          <h2 className="text-xl font-semibold mb-6">{title}</h2>

          <div className="mb-4">
            <Label htmlFor="entity-name">Nombre</Label>
            <Input
                id="entity-name"
                className="border rounded p-2 w-full mt-1"
                placeholder={placeholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
            />
          </div>

          {showQuestions && (
              <div className="mb-4 relative">
                <Label htmlFor="entity-description" className="flex items-center gap-1">
                  Descripción
                  <span className="group relative cursor-pointer text-gray-400 hover:text-gray-600">
                <Info className="w-4 h-4" />
                <span className="absolute bottom-full mb-2 left-0 w-64 p-2 text-xs text-white bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-pre-line z-50">
                  {questionText}
                </span>
              </span>
                </Label>
                <Textarea
                    id="entity-description"
                    className="border rounded p-2 w-full mt-1 min-h-[150px]"
                    placeholder="Escribí aquí la descripción..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={loading}
                />
              </div>
          )}

          {error && <div className="text-red-500 mb-2">{error}</div>}

          <div className="flex justify-end gap-3 mt-6">
            <Button
                variant="outline"
                color="tertiary"
                onClick={handleOnClose}
                disabled={loading}
            >
              Cancelar
            </Button>
            <Button
                color="primary"
                onClick={handleSubmit}
                disabled={loading || !name.trim() || (showQuestions && !description.trim())}
                loading={loading}
            >
              {loading ? "Creando..." : "Crear"}
            </Button>
          </div>
        </div>
      </div>
  );
};

export default CreateEntityModal;
