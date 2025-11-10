import {Plus, Sparkles, Download} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useImageGenerator } from "@/hooks/useImageGenerator.ts";
import { useRef, useState } from "react";
import NewImageModal from "@/components/mandala/postits/NewImageModal.tsx";
import { Tag } from "@/types/mandala";
import { downloadImage, generateImageFilename } from "@/utils/downloadImage";

interface ImagesPanelProps {
    mandalaId: string;
    mandalaName?: string;
    organizationId: string;
    projectId: string;
    selected: { dimensions: string[]; scales: string[] };
    dimensions: { name: string; color: string }[];
    allTags: Tag[];
    onNewTag: (tag: Tag) => void;
    children?: React.ReactNode;
}

export default function ImagesPanel({
                                        mandalaId,
                                        mandalaName,
                                        projectId,
                                        selected,
                                        allTags,
                                        onNewTag,
                                        children,
                                    }: ImagesPanelProps) {
    const { images, loading, error, generate } = useImageGenerator(mandalaId, projectId);
    const scrollRef = useRef<HTMLDivElement>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

    const isEmpty = !loading && !error && images.length === 0;

    return (
        <div className="flex-1 min-h-0 flex flex-col gap-3">
            <div className="flex-1 min-h-0">
                <div
                    ref={scrollRef}
                    className="h-full border rounded-lg p-4 overflow-y-auto custom-scrollbar"
                >
                    {loading && (
                        <p className="animate-pulse text-gray-500">Generando imágenes...</p>
                    )}

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    {isEmpty && (
                        <p className="text-gray-600 font-medium">
                            No hay imágenes para mostrar
                        </p>
                    )}

                    {!loading && !error && images.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                            {images.map((url, i) => (
                                <div key={i} className="relative group">
                                    <img
                                        src={url}
                                        alt={`Imagen generada ${i}`}
                                        className="rounded-lg shadow-md object-cover w-full h-48 border border-black/10"
                                    />
                                    <div className="absolute -top-2 -right-2 flex gap-1">
                                        <button
                                            type="button"
                                            onClick={() => downloadImage(url, generateImageFilename(mandalaName || "mandala"))}
                                            className="h-7 w-7 rounded-full border border-black/20 bg-white shadow flex items-center justify-center hover:bg-gray-50 transition-colors"
                                            aria-label="Descargar imagen"
                                            title="Descargar imagen"
                                        >
                                            <Download className="h-4 w-4"/>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedImageUrl(url);
                                                setIsModalOpen(true);
                                            }}
                                            className="h-7 w-7 rounded-full border border-black/20 bg-white shadow flex items-center justify-center hover:bg-gray-50 transition-colors"
                                            aria-label="Agregar imagen"
                                            title="Agregar imagen"
                                        >
                                            <Plus className="h-4 w-4"/>
                                        </button>
                                    </div>

                                </div>
                            ))}
                        </div>
                    )}

                    <NewImageModal
                        isOpen={isModalOpen}
                        onOpenChange={setIsModalOpen}
                        tags={allTags ?? []}
                        onNewTag={onNewTag}
                        initialImageUrl={selectedImageUrl ?? undefined}
                    />
                </div>
            </div>

            <div className="mt-2">
                {children}
                <div className="sticky bottom-0 bg-background pt-3 pb-4 flex flex-col sm:flex-row gap-2">
                    <Button
                        className="flex-1 h-11 text-base"
                        onClick={() => generate(selected.dimensions, selected.scales)}
                        disabled={loading}
                    >
                        <Sparkles size={16} />
                        {loading ? "Generando..." : "Generar imágenes"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
