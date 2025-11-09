import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Loader from "@/components/common/Loader";

const MESSAGE_ROTATION_INTERVAL = 5000; // 5 segundos

interface CompareMandalasModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCompare: (name: string) => Promise<void>;
  selectedCount: number;
  isLoading: boolean;
  externalError?: string | null;
}

/**
 * Modal para configurar la comparación de mandalas
 * Permite al usuario ingresar un nombre para la mandala comparada
 */
const CompareMandalasModal: React.FC<CompareMandalasModalProps> = ({
  isOpen,
  onOpenChange,
  onCompare,
  selectedCount,
  isLoading,
  externalError,
}) => {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const displayError = externalError || error;

  const aiMessages = [
    "Generando mandala comparada con IA...",
    "Analizando contenido de las mandalas seleccionadas...",
    "Procesando información con inteligencia artificial...",
    "Identificando patrones y coincidencias...",
    "Generando insights y tensiones...",
    "Creando estructura de la mandala comparada...",
    "Finalizando la mandala personalizada...",
  ];

  useEffect(() => {
    if (!isLoading) {
      setCurrentMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % aiMessages.length);
    }, MESSAGE_ROTATION_INTERVAL);

    return () => clearInterval(interval);
  }, [isLoading, aiMessages.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación básica
    if (!name.trim()) {
      setError("El nombre no puede estar vacío");
      return;
    }

    setError(null);

    try {
      await onCompare(name);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al comparar las mandalas"
      );
    }
  };

  const handleOpenChange = isLoading ? () => {} : onOpenChange;
  const handlePointerDownOutside = isLoading
    ? (e: Event) => e.preventDefault()
    : undefined;
  const handleEscapeKeyDown = isLoading
    ? (e: KeyboardEvent) => e.preventDefault()
    : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-lg"
        showCloseButton={!isLoading}
        onPointerDownOutside={handlePointerDownOutside}
        onEscapeKeyDown={handleEscapeKeyDown}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {isLoading ? "Generando Mandala Comparada" : `Comparar ${selectedCount} Mandalas`}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8 space-y-6">
            <Loader size="large" showText={false} />
            <div className="text-center">
              <p className="text-sm font-medium text-primary animate-pulse">
                {aiMessages[currentMessageIndex]}
              </p>
            </div>
          </div>
        ) : displayError ? (
          <div className="py-4">
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 text-sm">
              <p className="font-medium mb-2">Error al comparar mandalas</p>
              <p>{displayError}</p>
            </div>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setError(null);
                  onOpenChange(false);
                }}
              >
                Cerrar
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
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
              {displayError && <p className="text-red-500 text-sm">{displayError}</p>}
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
                Comparar Mandalas
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CompareMandalasModal;
