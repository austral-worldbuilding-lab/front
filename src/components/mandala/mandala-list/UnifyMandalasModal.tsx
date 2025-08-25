import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface UnifyMandalasModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUnify: (name: string) => Promise<void>;
  selectedCount: number;
  isLoading: boolean;
}

/**
 * Modal para configurar la unificación de mandalas
 * Permite al usuario ingresar un nombre para la mandala unificada
 */
const UnifyMandalasModal: React.FC<UnifyMandalasModalProps> = ({
  isOpen,
  onOpenChange,
  onUnify,
  selectedCount,
  isLoading,
}) => {
  const [name, setName] = useState("Mandala unificado");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación básica
    if (!name.trim()) {
      setError("El nombre no puede estar vacío");
      return;
    }

    setError(null);

    try {
      await onUnify(name);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al unificar las mandalas"
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mb-4">
            Unificar {selectedCount} Mandalas
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="mandala-name" className="text-sm font-medium">
              Nombre
            </label>
            <Input
              id="mandala-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ingresa un nombre para la nueva mandala"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Unificando..." : "Unificar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UnifyMandalasModal;
