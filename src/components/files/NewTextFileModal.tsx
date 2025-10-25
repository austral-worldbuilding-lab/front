import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";

interface NewTextFileModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (filename: string, content: string) => Promise<void>;
}

const NewTextFileModal = ({
  isOpen,
  onOpenChange,
  onSave,
}: NewTextFileModalProps) => {
  const [filename, setFilename] = useState("");
  const [content, setContent] = useState("");
  const [filenameError, setFilenameError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateFilename = (
    name: string
  ): { valid: boolean; error: string | null } => {
    if (!name.trim()) {
      return { valid: true, error: null }; // No mostramos error si está vacío
    }

    // Disallow path traversal and path separators
    if (name.includes(".")) {
      return { valid: false, error: "No se permite '.' en el nombre" };
    }
    if (name.includes("/")) {
      return { valid: false, error: "No se permite '/' en el nombre" };
    }
    if (name.includes("\\")) {
      return { valid: false, error: "No se permite '\\' en el nombre" };
    }

    return { valid: true, error: null };
  };

  const handleFilenameChange = (value: string) => {
    setFilename(value);
    const validation = validateFilename(value);
    setFilenameError(validation.error);
  };

  const handleSave = async () => {
    setError(null);

    if (!filename.trim()) {
      setError("El nombre del archivo no puede estar vacío");
      return;
    }

    const validation = validateFilename(filename);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    if (content.trim() === "") {
      setError("El contenido de la nota no puede estar vacío");
      return;
    }

    try {
      setLoading(true);
      await onSave(filename + ".txt", content);
      // Reset form
      setFilename("");
      setContent("");
      setFilenameError(null);
      setError(null);
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al guardar el archivo de texto"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFilename("");
    setContent("");
    setFilenameError(null);
    setError(null);
    onOpenChange(false);
  };

  const isValid =
    filename.trim() !== "" &&
    validateFilename(filename).valid &&
    content.trim() !== "";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Nueva nota</DialogTitle>
          <DialogDescription>
            Esta nota será usada por la Inteligencia Artificial
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label
              htmlFor="filename"
              className="block text-sm font-medium text-gray-700"
            >
              Nombre
            </label>
            <Input
              id="filename"
              value={filename}
              onChange={(e) => handleFilenameChange(e.target.value)}
              placeholder="Nueva nota"
              disabled={loading}
            />
            {filenameError && (
              <p className="text-red-500 text-sm mt-1">{filenameError}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700"
            >
              Contenido
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe el contenido de tu nota aquí..."
              rows={10}
              disabled={loading}
              className="resize-none"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        <DialogFooter className="flex sm:justify-end gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="filled"
            color="primary"
            onClick={handleSave}
            disabled={!isValid || loading}
          >
            {loading ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewTextFileModal;
