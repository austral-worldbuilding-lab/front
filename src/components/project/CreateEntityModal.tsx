import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { CustomInput } from "../ui/CustomInput";

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
  mode,
}: CreateEntityModalProps) => {
  const [name, setName] = useState(initialName ?? "");
  const [description, setDescription] = useState(initialDescription ?? "");

  if (!open) return null;

  const handleSubmit = () => {
    if (showQuestions) {
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
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

          {error && <div className="text-red-500 mb-2">{error}</div>}

          <div className="flex justify-end gap-3 mt-6">
            <Button
              color="primary"
              onClick={handleSubmit}
              disabled={
                loading ||
                !name.trim() ||
                (showQuestions && !description.trim())
              }
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
