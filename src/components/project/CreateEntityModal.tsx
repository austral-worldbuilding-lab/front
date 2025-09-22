import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Info } from "lucide-react";
import {Tooltip, TooltipContent, TooltipTrigger} from "@radix-ui/react-tooltip";

interface CreateEntityModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; description?: string }) => Promise<void>;
  loading: boolean;
  error?: string | null;
  title: string;
  placeholder: string;
  showQuestions?: boolean;
  initialName?: string;
  initialDescription?: string;
  mode?: "create" | "edit";
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
                             initialName,
                             initialDescription,
                             mode
                           }: CreateEntityModalProps) => {
    const [name, setName] = useState(initialName ?? "");
    const [description, setDescription] = useState(initialDescription ?? "");

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
                      <Tooltip>
                          <TooltipTrigger asChild>
                              <Info className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                          </TooltipTrigger>
                          <TooltipContent side="top"   className="bg-gray-700 text-white p-2 rounded max-w-xs whitespace-pre-line"
                          >
                              {questionText}
                          </TooltipContent>
                      </Tooltip>
                  </Label>
                  <Textarea
                      id="entity-description"
                      className="border rounded p-2 w-full mt-1 min-h-[150px] font-normal"
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
                  {loading
                      ? mode === "edit"
                          ? "Guardando..."
                          : "Creando..."
                      : mode === "edit"
                          ? "Guardar"
                          : "Crear"}
              </Button>
          </div>
        </div>
      </div>
  );
};

export default CreateEntityModal;
