import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CustomInput } from "@/components/ui/CustomInput";
import { colors } from "@/constants/character";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ColorSelector from "./ColorSelector";
import { Sparkles } from "lucide-react";
import TagInput, { Item } from "@/components/common/TagInput.tsx";
import { Sectors, Levels } from "@/constants/mandala";
import Loader from "@/components/common/Loader";
import posthog from "posthog-js";

const MESSAGE_ROTATION_INTERVAL = 5000; // 5 segundos

const initialDimensions: Item[] = Sectors.map((sector) => {
  return {
    id: sector.id,
    value: sector.name,
    color: sector.color,
  };
});

const initialScales: Item[] = Levels.map((level) => ({
  id: level.id,
  value: level.name,
  color: "rgba(180, 210, 255, 0.7)",
}));

interface CreateModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateCharacter: (character: {
    name: string;
    description: string;
    useAIMandala: boolean;
    color: string;
    dimensions: { name: string; color?: string }[];
    scales: string[];
    parentId?: string;
  }) => void | Promise<void>;
  title?: string;
  createButtonText?: string;
  loading?: boolean;
}

const CreateModal = ({
  isOpen,
  onOpenChange,
  onCreateCharacter,
  title = "New Character",
  createButtonText = "Create Character",
  loading = false,
}: CreateModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [mandalaType, setMandalaType] = useState("empty");
  const [dimensions, setDimensions] = useState<Item[]>(initialDimensions);
  const [scales, setScales] = useState<Item[]>(initialScales);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // Mensajes para mandala con IA
  const aiMessages = [
    "Generando mandala con IA en base a los archivos subidos...",
    "Analizando contenido de los archivos...",
    "Procesando información con inteligencia artificial...",
    "Creando estructura de la mandala...",
    "Generando personajes y dimensiones...",
    "Finalizando la mandala personalizada...",
  ];

  // Mensajes para mandala normal
  const normalMessages = [
    "Creando nueva mandala...",
    "Configurando estructura inicial...",
    "Preparando dimensiones y escalas...",
    "Guardando información del personaje...",
    "Finalizando configuración...",
  ];

  const messages = mandalaType === "ai" ? aiMessages : normalMessages;

  // Cambio de mensaje cada 5 segundos
  useEffect(() => {
    if (!loading) {
      setCurrentMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, MESSAGE_ROTATION_INTERVAL);

    return () => clearInterval(interval);
  }, [loading, messages.length]);

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setDescription("");
      setSelectedColor(colors[0]);
      setMandalaType("empty");
      setDimensions(initialDimensions);
      setScales(initialScales);
      setCurrentMessageIndex(0);
    }
  }, [isOpen]);

  const handleCreateCharacter = () => {
    const processedDimensions = dimensions.map((d) => ({
      name: d.value,
      color: d.color,
    }));

    if (mandalaType === "ai") {
      posthog.capture("mandala_generada_con_ai_clickeada");
    }

    onCreateCharacter({
      name,
      description,
      useAIMandala: mandalaType === "ai",
      color: selectedColor,
      dimensions: processedDimensions,
      scales: scales.map((s) => s.value),
    });
  };

  // Handlers para eventos del modal durante loading
  const handleOpenChange = loading ? () => {} : onOpenChange;
  const handlePointerDownOutside = loading
    ? (e: Event) => e.preventDefault()
    : undefined;
  const handleEscapeKeyDown = loading
    ? (e: KeyboardEvent) => e.preventDefault()
    : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-md"
        showCloseButton={!loading}
        onPointerDownOutside={handlePointerDownOutside}
        onEscapeKeyDown={handleEscapeKeyDown}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {loading ? "Creando Mandala" : title}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-8 space-y-6">
            <Loader size="large" showText={false} />
            <div className="text-center">
              <p className="text-sm font-medium text-primary animate-pulse">
                {messages[currentMessageIndex]}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <CustomInput
              id="name"
              label="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
            />
            <div className="grid  sm:grid-cols-2 gap-4">
              <TagInput
                label="Dimensiones"
                initialItems={initialDimensions}
                onChange={setDimensions}
                tooltip="Las dimensiones representan los sectores de la mandala. Se pueden agregar, eliminar o editar."
              />

              <TagInput
                label="Escalas"
                initialItems={initialScales}
                onChange={setScales}
                colorPicker={false}
                tooltip="Las escalas representan los niveles de la mandala. Se pueden agergar, eliminar o editar."
              />
            </div>

            <div className="flex justify-between gap-2">
              <RadioGroup
                value={mandalaType}
                onValueChange={setMandalaType}
                className="flex flex-col gap-2"
              >
                <label className="flex items-center gap-3 cursor-pointer">
                  <RadioGroupItem value="empty" />
                  <span className="text-black">Mandala vacía</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <RadioGroupItem value="ai" />
                  <span className="text-black flex items-center gap-2">
                    Generada con IA <Sparkles className="w-4 h-4" />
                  </span>
                </label>
              </RadioGroup>

              <ColorSelector
                className="w-1/2"
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
                colors={colors}
              />
            </div>

            {mandalaType === "ai" && (
              <div className="space-y-2">
                <CustomInput
                  id="description"
                  label="Descripcion (opcional)"
                  about="Esta descripción será útil para que la IA genere la mandala con más precisión"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  as="textarea"
                  style={{ maxHeight: 160 }}
                />
              </div>
            )}
          </div>
        )}

        {!loading && (
          <DialogFooter className="flex sm:justify-between">
            <Button
              variant="outline"
              color="tertiary"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="filled"
              color="primary"
              onClick={handleCreateCharacter}
              disabled={!name || dimensions.length === 0 || scales.length === 0}
              loading={loading}
            >
              {createButtonText}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateModal;
