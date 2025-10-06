import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { CustomInput } from "../ui/CustomInput";
import { DimensionDto } from "@/types/mandala";

interface CreateEntityModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; description?: string }) => Promise<void>;
  onCreateFromProvocation?: (data: {
    question: string;
    name?: string;
    dimensions?: DimensionDto[];
    scales?: string[];
  }) => Promise<void>;
  loading: boolean;
  error?: string | null;
  title: string;
  placeholder: string;
  showQuestions?: boolean;
  initialName?: string;
  initialDescription?: string;
  mode?: "create" | "edit";
  allowProvocationMode?: boolean;
}

const CreateEntityModal = ({
  open,
  onClose,
  onCreate,
  onCreateFromProvocation,
  loading,
  error,
  title,
  placeholder,
  showQuestions = false,
  initialName,
  initialDescription,
  mode,
  allowProvocationMode = false,
}: CreateEntityModalProps) => {
  const [name, setName] = useState(initialName ?? "");
  const [description, setDescription] = useState(initialDescription ?? "");
  const [isProvocationMode, setIsProvocationMode] = useState(false);
  const [question, setQuestion] = useState("");

  if (!open) return null;

  const handleSubmit = () => {
    if (isProvocationMode && onCreateFromProvocation) {
      onCreateFromProvocation({
        question,
        name: name.trim() || undefined,
      });
    } else if (showQuestions) {
      onCreate({ name, description });
    } else {
      onCreate({ name });
    }
  };

  const questionText = `• ¿Qué mundo o contexto estás creando?\n
• ¿Qué problemas aparecen en este mundo?\n
• ¿Qué personajes o situaciones ilustran esos problemas?\n
• ¿Cuáles son los deseos de esos personajes?\n
• ¿Qué impacto tienen estos problemas?`;

  const isFormValid = () => {
    if (isProvocationMode) {
      return question.trim().length > 0;
    }
    return name.trim().length > 0 && (!showQuestions || description.trim().length > 0);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {allowProvocationMode && mode !== "edit" && (
            <div className="flex gap-3 mb-6 p-1 bg-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() => setIsProvocationMode(false)}
                className={`flex-1 px-4 py-2.5 rounded-md font-medium transition-all ${
                  !isProvocationMode
                    ? "bg-white text-primary shadow-sm border border-primary"
                    : "bg-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Proyecto Normal
              </button>
              <button
                type="button"
                onClick={() => setIsProvocationMode(true)}
                className={`flex-1 px-4 py-2.5 rounded-md font-medium transition-all ${
                  isProvocationMode
                    ? "bg-white text-primary shadow-sm border border-primary"
                    : "bg-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Desde Provocación
              </button>
            </div>
          )}

          {isProvocationMode ? (
            <>
              <div className="mb-4">
                <CustomInput
                  as="textarea"
                  id="provocation-question"
                  className="w-full min-h-[120px]"
                  label="Pregunta provocadora"
                  placeholder="¿Qué pasaría si...?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="mb-4">
                <CustomInput
                  id="project-name"
                  className="w-full"
                  label="Nombre del proyecto (opcional)"
                  placeholder="Si no se especifica, se usará la pregunta como nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </>
          ) : (
            <>
              <div className="mb-4">
                <CustomInput
                  id="entity-name"
                  className="w-full"
                  label="Nombre"
                  placeholder={placeholder}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>

              {showQuestions && (
                <div className="mb-4 relative">
                  <CustomInput
                    as="textarea"
                    id="entity-description"
                    className="w-full min-h-[150px]"
                    label="Descripción"
                    about={questionText}
                    placeholder="Escribí aquí la descripción..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={loading}
                  />
                </div>
              )}
            </>
          )}

          {error && <div className="text-red-500 mb-2">{error}</div>}

          <div className="flex justify-end gap-3 mt-6">
            <Button
              color="primary"
              onClick={handleSubmit}
              disabled={loading || !isFormValid()}
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
      </DialogContent>
    </Dialog>
  );
};

export default CreateEntityModal;
