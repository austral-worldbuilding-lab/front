// PostItsPanel.tsx
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { usePostItsGenerator } from "./usePostItsGenerator";
import type { Tag } from "@/types/mandala";
import { PropsWithChildren, useState } from "react";
import NewPostItModal from "@/components/mandala/postits/NewPostItModal.tsx";
import {Link} from "react-router-dom";

export interface PostItsPanelProps extends PropsWithChildren {
    mandalaId: string;
    organizationId: string;
    projectId: string;
    selected: { dimensions: string[]; scales: string[] };
    tags?: Tag[];
    onCreate: (content: string, tags: Tag[], postItFatherId?: string) => void;
    onNewTag?: (tag: Tag) => void;
}

export default function PostItsPanel({
                                         mandalaId,
                                         organizationId,
                                         projectId,
                                         selected,
                                         children,
                                         tags = [],
                                         onCreate = () => {},
                                         onNewTag = () => {},
                                     }: PostItsPanelProps) {
    const { items, loading, error, generate } = usePostItsGenerator(mandalaId);

    // modal de creación real
    const [open, setOpen] = useState(false);
    const [prefill, setPrefill] = useState("");

    const openCreateWith = (text: string) => {
        setPrefill(text);
        setOpen(true);
    };

    const isEmpty = !loading && !error && items.length === 0;

    return (
        <div className="flex-1 min-h-0 flex flex-col gap-3">
            <div className="flex-1 min-h-0">
                <div
                    className={`h-full border rounded-lg p-4 overflow-y-auto custom-scrollbar ${
                        isEmpty ? "grid" : ""
                    }`}
                >
                    {loading && <p>Generando…</p>}
                    {error && error.includes("500") ? (
                        <>
                            <p className="text-muted-foreground">
                                No hay archivos subidos para este proyecto, por favor sube archivos para generar preguntas.
                            </p>
                            <Link
                                to={`/app/organization/${organizationId}/projects/${projectId}`}
                                className="mt-4 text-primary inline-block underline"
                            >
                                Subir archivos
                            </Link>
                        </>
                    ) : error ? (
                        <p className="text-red-600">Error: {error}</p>
                    ) : null}
                    {isEmpty && <p>No hay Post-Its para mostrar.</p>}

                    {!loading && !error && items.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {items.map((text, i) => (
                                <div key={i} className="relative">
                                    {/* Post-it redondo */}
                                    <div className="aspect-square rounded-full bg-yellow-300 text-black border border-black/20 shadow-sm flex items-center justify-center text-center p-4">
                    <span className="text-sm">
                      {text}
                    </span>
                                    </div>

                                    {/* Botón + arriba a la derecha */}
                                    <button
                                        type="button"
                                        onClick={() => openCreateWith(text)}
                                        className="absolute -top-2 -right-2 h-7 w-7 rounded-full border border-black/20 bg-white shadow flex items-center justify-center"
                                        aria-label="Agregar post-it"
                                        title="Agregar post-it"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Filtros + botón Generar*/}
            <div className="mt-2">
                {children}
                <div className="sticky bottom-0 bg-background pt-3 pb-4">
                    <Button
                        className="w-full h-11 text-base"
                        onClick={() => generate(selected.dimensions, selected.scales)}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Generar Post-Its
                    </Button>
                </div>
            </div>

            {/* Modal real con texto precargado */}
            <NewPostItModal
                isOpen={open}
                onOpenChange={setOpen}
                tags={tags}
                onCreate={onCreate}
                onNewTag={onNewTag}
                defaultContent={prefill}
            />
        </div>
    );
}
