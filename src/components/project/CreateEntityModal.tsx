import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { CustomInput } from "../ui/CustomInput";
import { DimensionDto } from "@/types/mandala";
import TagInput, { Item } from "@/components/common/TagInput.tsx";
import { Sectors, Levels } from "@/constants/mandala";
import { IconSelector } from "../common/IconSelector";
import { ICON_OPTIONS } from "@/constants/icon-options";
import { ImageSelector } from "../common/ImageSelector";

const getInitialDimensions = (): Item[] => {
  return Sectors.map((sector) => ({
    id: sector.id,
    value: sector.name,
    color: sector.color,
  }));
};

const getInitialScales = (): Item[] => {
  return Levels.map((level) => ({
    id: level.id,
    value: level.name,
    color: "rgba(180, 210, 255, 0.7)",
  }));
};

interface CreateEntityModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: {
    name: string;
    description?: string;
    dimensions?: DimensionDto[];
    scales?: string[];
    icon: string;
    image?: File;
    bannerImage?: File;
    iconColor?: string;
  }) => Promise<void>;
  onCreateFromProvocation?: (data: {
    question: string;
    name?: string;
    dimensions?: DimensionDto[];
    scales?: string[];
    icon: string;
    iconColor?: string;
  }) => Promise<void>;
  loading: boolean;
  error?: string | null;
  title: string;
  placeholder: string;
  showQuestions?: boolean;
  initialName?: string;
  initialDescription?: string;
  initialImageUrl?: string | null;
  mode?: "create" | "edit";
  allowProvocationMode?: boolean;
  showConfiguration?: boolean;
  isOrganization?: boolean;
  icon?: string;
  iconColor?: string;
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
  initialImageUrl,
  mode,
  allowProvocationMode = false,
  showConfiguration = false,
  isOrganization = false,
  icon: initialIcon,
  iconColor: initialColor,
}: CreateEntityModalProps) => {
  const [name, setName] = useState(initialName ?? "");
  const [description, setDescription] = useState(initialDescription ?? "");
  const [isProvocationMode, setIsProvocationMode] = useState(false);
  const [question, setQuestion] = useState("");
  const [dimensions, setDimensions] = useState<Item[]>(getInitialDimensions());
  const [scales, setScales] = useState<Item[]>(getInitialScales());
  const [icon, setIcon] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [iconColor, setIconColor] = useState<string | null>(null);

  useEffect(() => {
    setName(initialName ?? "");
    setDescription(initialDescription ?? "");
    setIcon(initialIcon ?? null);
    setIconColor(initialColor ?? null);
    console.log(initialName, initialDescription, initialIcon, initialColor);
  }, [initialName, initialDescription, open, initialColor, initialIcon]);

  if (!open) return null;

  const handleSubmit = () => {
    const dimensionsData: DimensionDto[] = dimensions.map((dim) => ({
      name: dim.value,
      color: dim.color || "#cccccc",
    }));

    const scalesData: string[] = scales.map((scale) => scale.value);

    if (isProvocationMode && onCreateFromProvocation) {
      onCreateFromProvocation({
        question,
        name: name.trim() || undefined,
        dimensions: showConfiguration ? dimensionsData : undefined,
        scales: showConfiguration ? scalesData : undefined,
        icon: icon ?? ICON_OPTIONS[0],
        iconColor: iconColor ?? undefined,
      });
    } else if (showQuestions) {
      const data: any = {
        name,
        description,
        dimensions: showConfiguration ? dimensionsData : undefined,
        scales: showConfiguration ? scalesData : undefined,
        icon: icon ?? ICON_OPTIONS[0],
        image: image ?? undefined,
        bannerImage: bannerImage ?? undefined,
        iconColor: iconColor ?? undefined,
      });
      };

      if (isOrganization) {
        data.image = image ?? undefined;
      } else {
        data.icon = icon ?? ICON_OPTIONS[0];
      }

      onCreate(data);
    } else {
      const data: any = {
        name,
        dimensions: showConfiguration ? dimensionsData : undefined,
        scales: showConfiguration ? scalesData : undefined,
        icon: icon ?? ICON_OPTIONS[0],
        image: image ?? undefined,
        bannerImage: bannerImage ?? undefined,
        iconColor: iconColor ?? undefined,
      });
      };

      if (isOrganization) {
        data.image = image ?? undefined;
      } else {
        data.icon = icon ?? ICON_OPTIONS[0];
      }

      onCreate(data);
    }
  };

  const questionText = `• ¿Qué mundo o contexto estás creando?
• ¿Qué problemas aparecen en este mundo?
• ¿Qué personajes o situaciones ilustran esos problemas?
• ¿Cuáles son los deseos de esos personajes?
• ¿Qué impacto tienen estos problemas?`;

  const isFormValid = () => {
    const baseValidation = (() => {
      if (isProvocationMode) {
        return question.trim().length > 0;
      }
      return (
        name.trim().length > 0 &&
        (!showQuestions || description.trim().length > 0)
      );
    })();

    if (showConfiguration) {
      return baseValidation && dimensions.length > 0 && scales.length > 0;
    }

    if (isOrganization && !image) {
      return false;
    }

    return baseValidation;
  };

  const handleModalChange = () => {
    if (!open) {
      setName(initialName ?? "");
      setDescription(initialDescription ?? "");
      setIsProvocationMode(false);
      setQuestion("");
      setDimensions(getInitialDimensions());
      setScales(getInitialScales());
      setIcon(null);
      setImage(null);
      setBannerImage(null);
      setIconColor(null);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(openState) => {
        if (!openState) {
          handleModalChange();
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col ">
        <DialogHeader>
          <DialogTitle className="font-bold">{title}</DialogTitle>
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
                    : "bg-transparent text-gray-600 hover:text-gray-900 cursor-pointer"
                }`}
              >
                Mundo nuevo
              </button>
              <button
                type="button"
                onClick={() => setIsProvocationMode(true)}
                className={`flex-1 px-4 py-2.5 rounded-md font-medium transition-all ${
                  isProvocationMode
                    ? "bg-white text-primary shadow-sm border border-primary"
                    : "bg-transparent text-gray-600 hover:text-gray-900 cursor-pointer"
                }`}
              >
                Desde Provocación
              </button>
            </div>
          )}

          {isOrganization ? (
            <ImageSelector onChange={setImage} initialImageUrl={initialImageUrl} />
            <>
              <ImageSelector
                onChange={setImage}
                label="Imagen de perfil"
              />
              <ImageSelector
                onChange={setBannerImage}
                label="Imagen de banner"
                aspectRatio="banner"
                optional
              />
            </>
          ) : (
            <IconSelector
            value={icon}
            onChange={(icon, color) => {
              setIcon(icon);
              setIconColor(color ?? null);
            }}
            disabled={loading}
            displayColorSelector
            initialColor={initialColor}
            initialIcon={initialIcon}
          />
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

          {showConfiguration && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-bold">Configuración del Mundo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TagInput
                  label="Dimensiones"
                  initialItems={getInitialDimensions()}
                  onChange={setDimensions}
                  tooltip="Las dimensiones representan los sectores de la mandala. Se pueden agregar, eliminar o editar."
                  disabled={loading}
                />

                <TagInput
                  label="Escalas"
                  initialItems={getInitialScales()}
                  onChange={setScales}
                  colorPicker={false}
                  tooltip="Las escalas representan los niveles de la mandala. Se pueden agregar, eliminar o editar."
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {error && <div className="text-red-500 mb-2">{error}</div>}

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
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
