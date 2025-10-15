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
import Loader from "@/components/common/Loader";
import posthog from "posthog-js";
import { useProjectConfiguration } from "@/hooks/useProjectConfiguration";
import { useParams } from "react-router-dom";

const MESSAGE_ROTATION_INTERVAL = 5000; // 5 segundos

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
    mandalaType: "CHARACTER" | "CONTEXT";
  }) => void | Promise<void>;
  title?: string;
  createButtonText?: string;
  loading?: boolean;
}

const CreateModal = ({
  isOpen,
  onOpenChange,
  onCreateCharacter,
  title = "Crear Mandala",
  createButtonText = "Crear Mandala",
  loading = false,
}: CreateModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [mandalaType, setMandalaType] = useState("empty");
  const [selectedMandalaType, setSelectedMandalaType] = useState<"CHARACTER" | "CONTEXT">("CHARACTER");
  const [dimensions, setDimensions] = useState<Item[]>([]);
  const [scales, setScales] = useState<Item[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const { projectId } = useParams<{ projectId: string }>();
  const { configuration, isLoading: configLoading } = useProjectConfiguration(projectId!);

  useEffect(() => {
    if (configuration && !configLoading) {
      
      const projectDimensions: Item[] = configuration.dimensions.map((dim) => ({
        id: dim.name.toLowerCase().replace(/\s+/g, '-'),
        value: dim.name,
        color: dim.color,
      }));

      const projectScales: Item[] = configuration.scales.map((scale) => ({
        id: scale.toLowerCase().replace(/\s+/g, '-'),
        value: scale,
        color: "rgba(180, 210, 255, 0.7)",
      }));

      setDimensions(projectDimensions);
      setScales(projectScales);
    }
  }, [configuration, configLoading]);

  // Mensajes para mandala con IA
  const aiMessages = [
    `Generando mandala ${selectedMandalaType === 'CONTEXT' ? 'de contexto' : 'de personaje'} con IA...`,
    "Analizando contenido de los archivos...",
    "Procesando información con inteligencia artificial...",
    "Creando estructura de la mandala...",
    selectedMandalaType === 'CONTEXT' ? "Generando observaciones del contexto..." : "Generando personajes y dimensiones...",
    "Finalizando la mandala personalizada...",
  ];

  // Mensajes para mandala normal
  const normalMessages = [
    `Creando mandala ${selectedMandalaType === 'CONTEXT' ? 'de contexto' : 'de personaje'}...`,
    "Configurando estructura inicial...",
    "Preparando dimensiones y escalas...",
    selectedMandalaType === 'CONTEXT' ? "Guardando información del contexto..." : "Guardando información del personaje...",
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
      setSelectedMandalaType("CHARACTER");
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
      mandalaType: selectedMandalaType,
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
        className="max-w-lg"
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
          <div className="space-y-4 py-2">
            <CustomInput
              id="name"
              label="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
            />

            <CustomInput
              id="description"
              label="Descripción"
              about={mandalaType === "ai" 
                ? "Esta descripción será útil para que la IA genere la mandala con más precisión" 
                : selectedMandalaType === "CONTEXT" 
                  ? "Describe el contexto general del mundo o ambiente que vas a explorar"
                  : "Describe el personaje o entidad que estará en el centro de esta mandala"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              as="textarea"
              style={{ maxHeight: 160 }}
              required
            />

            <div className="grid  sm:grid-cols-2 gap-4">
              <TagInput
                label="Dimensiones"
                initialItems={configuration?.dimensions.map((dim) => ({
                  id: dim.name.toLowerCase().replace(/\s+/g, '-'),
                  value: dim.name,
                  color: dim.color,
                })) || []}
                onChange={setDimensions}
                tooltip="Las dimensiones representan los sectores de la mandala. Se pueden agregar, eliminar o editar."
              />

              <TagInput
                label="Escalas"
                initialItems={configuration?.scales.map((scale) => ({
                  id: scale.toLowerCase().replace(/\s+/g, '-'),
                  value: scale,
                  color: "rgba(180, 210, 255, 0.7)",
                })) || []}
                onChange={setScales}
                colorPicker={false}
                tooltip="Las escalas representan los niveles de la mandala. Se pueden agergar, eliminar o editar."
              />
            </div>

            <div className="space-y-4">
              {/* Tipo de Mandala */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Tipo de Mandala
                </label>
                <RadioGroup
                  value={selectedMandalaType}
                  onValueChange={(value) => setSelectedMandalaType(value as "CHARACTER" | "CONTEXT")}
                  className="flex flex-col gap-2"
                >
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="CHARACTER" />
                    <div className="flex-1">
                      <span className="text-black font-medium text-sm">Mandala de Personaje</span>
                      <p className="text-xs text-gray-500">Para explorar un personaje o entidad específica</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="CONTEXT" />
                    <div className="flex-1">
                      <span className="text-black font-medium text-sm">Mandala de Contexto</span>
                      <p className="text-xs text-gray-500">Para observaciones generales del mundo o ambiente</p>
                    </div>
                  </label>
                </RadioGroup>
              </div>

              {/* Método de creación y Color */}
              <div className="flex justify-between gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Método de creación
                  </label>
                  <RadioGroup
                    value={mandalaType}
                    onValueChange={setMandalaType}
                    className="flex flex-col gap-2"
                  >
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-gray-50">
                      <RadioGroupItem value="empty" />
                      <span className="text-black text-sm">Mandala vacía</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-gray-50">
                      <RadioGroupItem value="ai" />
                      <span className="text-black text-sm flex items-center gap-2">
                        Generada con IA <Sparkles className="w-3 h-3" />
                      </span>
                    </label>
                  </RadioGroup>
                </div>

                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Color
                  </label>
                  <ColorSelector
                    selectedColor={selectedColor}
                    setSelectedColor={setSelectedColor}
                    colors={colors}
                  />
                </div>
              </div>
            </div>
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
              disabled={!name || !description || dimensions.length === 0 || scales.length === 0}
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
