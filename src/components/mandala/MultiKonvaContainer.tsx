import React, { useMemo, useRef, useEffect, useState } from "react";
import { Stage, Layer } from "react-konva";
import { Character, Mandala as MandalaData, Postit, Tag } from "@/types/mandala";
import PostIt from "./postits/PostIt";
import CharacterIcon from "./characters/CharacterIcon";
import { useKonvaUtils } from "@/hooks/useKonvaUtils";
import { shouldShowCharacter, shouldShowPostIt } from "@/utils/filterUtils";
import { ReactZoomPanPinchState } from "react-zoom-pan-pinch";
import useMandala from "@/hooks/useMandala";
import MandalaConcentric from "./MandalaConcentric";
import MandalaSectors from "./MandalaSectors";
import MandalaPerson from "./MandalaPerson";
import { Levels, Sectors } from "@/constants/mandala";
import { useContextMenu } from "@/hooks/useContextMenu";
import { useEditPostIt } from "@/hooks/useEditPostit";
import EditPostItModal from "./postits/EditPostitModal";
import NewPostItModal from "./postits/NewPostItModal";
import MandalaMenu from "./MandalaMenu";
import { useParams } from "react-router-dom";
import { useProjectAccess } from "../../hooks/useProjectAccess";


interface MultiKonvaContainerProps {
    unified: MandalaData;
    sourceMandalaIds: string[];
    appliedFilters: Record<string, string[]>;
    onPostItUpdate: (id: string, updates: Partial<Postit>) => Promise<boolean>;
    onCharacterUpdate: (index: number, updates: Partial<Character>) => Promise<boolean | void>;
    onPostItDelete: (id: string) => Promise<boolean>;
    onCharacterDelete: (id: string) => Promise<boolean>;
    onPostItChildCreate: (content: string, tags: Tag[], postitFatherId?: string) => void;
    state: ReactZoomPanPinchState | null;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    onDragStart: (postitId: string) => void;
    onDragEnd: (postitId: string) => void;
    tags: Tag[];
    onNewTag: (tag: Tag) => void;
    onDblClick?: (postitId: string) => void;
    onBlur?: (postitId: string) => void;
    onContextMenu?: (postitId: string) => void;
}

const GAP = 400; // Gap between mandalas - increased significantly
const PREVIEW_SCALE = 0.4; // Scale for preview mandalas - reduced for better spacing
const PREVIEW_Y_NUDGE = -355; // Manual vertical nudge (in px) for left column alignment

// Component for mandala background using original components
const MandalaBackground: React.FC<{
    mandala: MandalaData;
    offsetX: number;
    offsetY: number;
    scale: number;
}> = ({ mandala, offsetX, offsetY, scale }) => {
    const config = mandala.mandala.configuration;
    const scaleCount = config?.scales?.length || 1;
    const maxRadius = 150 * scaleCount;

    function getInterpolatedLevelColor(index: number, total: number): string {
        const from = [200, 220, 255, 0.9];
        const to = [140, 190, 255, 0.3];
        const t = index / (total - 1);
        const interpolated = from.map((start, i) => start + (to[i] - start) * t);
        const [r, g, b, a] = interpolated;
        return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a.toFixed(2)})`;
    }

    const levels = config?.scales?.map((name, index) => {
        return {
            id: `level-${index}`,
            name,
            radius: 150 * (index + 1),
            color: getInterpolatedLevelColor(index, scaleCount),
        };
    }) ?? Levels;

    const sectors = config?.dimensions?.map((dimension, index) => ({
        id: `sector-${index}`,
        name: dimension.name,
        question: `¿Qué pasa en ${dimension.name}?`,
        color: dimension.color,
    })) ?? Sectors;

    return (
        <div
            className="absolute"
            style={{
                left: offsetX,
                top: offsetY,
                width: maxRadius * 2,
                height: maxRadius * 2,
                transform: `scale(${scale})`,
                transformOrigin: 'center',
            }}
        >
            <div className="relative w-full h-full flex items-center justify-center">
                {/* Center of the mandala */}
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    {/* Concentric circles */}
                    <MandalaConcentric levels={levels} />

                    {/* Person in the center */}
                    <MandalaPerson type={mandala.mandala.type} />

                    {/* Sectors, lines, points, names, and questions */}
                    <MandalaSectors
                        sectors={sectors}
                        maxRadius={maxRadius}
                        levels={levels}
                    />
                </div>
            </div>
        </div>
    );
};

// Individual mandala canvas component
const MandalaCanvas: React.FC<{
    mandala: MandalaData;
    offsetX: number;
    offsetY: number;
    scale: number;
    readOnly: boolean;
    appliedFilters: Record<string, string[]>;
    onPostItUpdate?: (id: string, updates: Partial<Postit>) => Promise<boolean>;
    onCharacterUpdate?: (index: number, updates: Partial<Character>) => Promise<boolean | void>;
    onPostItDelete?: (id: string) => Promise<boolean>;
    onCharacterDelete?: (id: string) => Promise<boolean>;
    onPostItChildCreate?: (content: string, tags: Tag[], postitFatherId?: string) => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    onDragStart: (postitId: string) => void;
    onDragEnd: (postitId: string) => void;
    tags?: Tag[];
    onNewTag?: (tag: Tag) => void;
    state?: ReactZoomPanPinchState | null;
    onDblClick?: (postitId: string) => void;
    onBlur?: (postitId: string) => void;
    onContextMenu?: (postitId: string) => void;
}> = ({ mandala, offsetX, offsetY, scale, readOnly, appliedFilters, onPostItUpdate, onCharacterUpdate, onPostItDelete, onCharacterDelete, onPostItChildCreate, onMouseEnter, onMouseLeave, onDragStart, onDragEnd, tags, onNewTag, state, onContextMenu, onBlur, onDblClick }) => {
    const { projectId } = useParams<{ projectId: string }>();
    const { hasAccess, userRole } = useProjectAccess(projectId || "");
    const canEdit = !!hasAccess && (userRole === null || ['owner', 'admin', 'member'].includes(userRole));
    const [, setEditableIndex] = useState<number | null>(null);
    const [, setEditingContent] = useState<string | null>(null);
    const [isChildPostItModalOpen, setIsChildPostItModalOpen] = useState(false);
    const [selectedPostItId, setSelectedPostItId] = useState<string | undefined>(undefined);

    const maxRadius = 150 * (mandala.mandala.configuration?.scales.length || 1);
    const canvasSize = maxRadius * 2;

    const { toAbsolutePostit, toRelativePostit } = useKonvaUtils(mandala.postits, maxRadius);
    const { toAbsolute, toRelative, getDimensionAndSectionFromCoordinates, zOrder, bringToFront } =
        useKonvaUtils(mandala.postits, maxRadius);

    const {
        contextMenu,
        showContextMenu,
        hideContextMenu,
        handleDelete,
        handleCreateChild,
        handleEditPostIt,
    } = useContextMenu(
        onPostItDelete || (() => Promise.resolve(false)),
        onCharacterDelete || (() => Promise.resolve(false)),
        setEditableIndex,
        setEditingContent,
        (id) => {
            setSelectedPostItId(id);
            setIsChildPostItModalOpen(true);
        },
        (id) => {
            const postit = mandala.postits.find((p) => p.id === id);
            if (postit) {
                openEditModal(mandala.id, postit);
            }
        }
    );

    // Ensure we call onBlur (to remove editing user) when context menu closes
    const lastPostItIdRef = useRef<string | null>(null);
    useEffect(() => {
        if (contextMenu.visible && contextMenu.type === "postit" && contextMenu.postItId) {
            lastPostItIdRef.current = contextMenu.postItId;
        }
    }, [contextMenu.visible, contextMenu.type, contextMenu.postItId]);
    useEffect(() => {
        if (!contextMenu.visible && lastPostItIdRef.current) {
            onBlur?.(lastPostItIdRef.current);
            lastPostItIdRef.current = null;
        }
    }, [contextMenu.visible, onBlur]);

    const {
        isOpen: isEditModalOpen,
        postit: editingPostit,
        open: openEditModal,
        close: closeEditModal,
        handleUpdate,
    } = useEditPostIt();

    const dimensionColors = useMemo(() => {
        return (
            mandala.mandala.configuration?.dimensions?.reduce((acc, d) => {
                acc[d.name] = d.color;
                return acc;
            }, {} as Record<string, string>) ?? {}
        );
    }, [mandala.mandala.configuration?.dimensions]);

    return (
        <div
            className="absolute"
            style={{
                left: offsetX,
                top: offsetY,
                width: canvasSize,
                height: canvasSize,
                transform: `scale(${scale})`,
                transformOrigin: 'center',
            }}
        >
            <Stage width={canvasSize} height={canvasSize} listening={!readOnly}>
                <Layer>
                    {/* Post-its */}
                    {zOrder.map((i) => {
                        const p = mandala.postits[i];
                        if (!shouldShowPostIt(p, appliedFilters)) return null;
                        const { x, y } = toAbsolutePostit(p.coordinates.x, p.coordinates.y);
                        return (
                            <PostIt
                                key={`p-${mandala.id}-${p.id}`}
                                postit={p}
                                color={dimensionColors[p.dimension] || "#cccccc"}
                                position={{ x, y }}
                                onDragStart={() => {
                                    if (!readOnly) {
                                        onDragStart?.(p.id!);
                                        bringToFront(i);
                                    }
                                }}
                                onDragEnd={async (e) => {
                                    if (readOnly || !onPostItUpdate) return;
                                    onDragEnd?.(p.id!);
                                    const rel = toRelativePostit(e.target.x(), e.target.y());
                                    const { dimension, section } = getDimensionAndSectionFromCoordinates(
                                        rel.x,
                                        rel.y,
                                        mandala.mandala.configuration?.dimensions.map((d) => d.name) || [],
                                        mandala.mandala.configuration?.scales || []
                                    );
                                    await onPostItUpdate(p.id!, {
                                        coordinates: { ...p.coordinates, x: rel.x, y: rel.y },
                                        dimension,
                                        section,
                                    });
                                }}
                                onMouseEnter={onMouseEnter || (() => { })}
                                onMouseLeave={onMouseLeave || (() => { })}
                                onDblClick={() => {
                                    setEditableIndex(i);
                                    bringToFront(i);
                                    onDblClick?.(p.id!);
                                }}
                                onContentChange={(newValue, id) => {
                                    if (onPostItUpdate) {
                                        onPostItUpdate(id, { content: newValue });
                                    }
                                }}
                                onBlur={() => {
                                    window.getSelection()?.removeAllRanges();
                                    setEditableIndex(null);
                                    onBlur?.(p.id!);
                                }}
                                onContextMenu={(e, i) => {
                                    showContextMenu(e, i, "postit");
                                    onContextMenu?.(p.id!);
                                }}
                                mandalaRadius={maxRadius}
                            />
                        );
                    })}

                    {/* Characters */}
                    {mandala.characters?.map((character) => {
                        if (!shouldShowCharacter(character, appliedFilters)) return null;
                        const { x, y } = toAbsolute(character.position.x, character.position.y);
                        return (
                            <CharacterIcon
                                key={`c-${mandala.id}-${character.id}`}
                                mandalaRadius={maxRadius}
                                character={character}
                                position={{ x, y }}
                                onDragStart={() => {
                                    if (!readOnly) {
                                        onDragStart?.(character.id!);
                                    }
                                }}
                                onDragEnd={async (e) => {
                                    if (readOnly || !onCharacterUpdate) return;
                                    onDragEnd?.(character.id!);
                                    const rel = toRelative(e.target.x(), e.target.y());
                                    const { dimension, section } = getDimensionAndSectionFromCoordinates(
                                        rel.x,
                                        rel.y,
                                        mandala.mandala.configuration?.dimensions.map((d) => d.name) || [],
                                        mandala.mandala.configuration?.scales || []
                                    );
                                    const idx = mandala.characters?.findIndex((c) => c.id === character.id) ?? -1;
                                    if (idx >= 0) await onCharacterUpdate(idx, { position: { x: rel.x, y: rel.y }, dimension, section });
                                }}
                                onMouseEnter={onMouseEnter || (() => { })}
                                onMouseLeave={onMouseLeave || (() => { })}
                                onContextMenu={(e) => showContextMenu(e, character.id, "character")}
                            />
                        );
                    })}
                </Layer>
            </Stage>

            {contextMenu.visible && (
                <div
                    style={{
                        position: "absolute",
                        top: contextMenu.y,
                        left: contextMenu.x,
                        zIndex: 1000,
                        transform: state ? `scale(${1 / state.scale})` : "none",
                        transformOrigin: "top left",
                    }}
                    onClick={hideContextMenu}
                >
                    <MandalaMenu
                        onDelete={handleDelete}
                        onCreateChild={
                            contextMenu.type === "postit" ? handleCreateChild : undefined
                        }
                        onEdit={contextMenu.type === "postit" ? handleEditPostIt : undefined}
                        isContextMenu={true}
                        canEdit={canEdit}
                    />
                </div>
            )}

            <NewPostItModal
                isOpen={isChildPostItModalOpen}
                onOpenChange={setIsChildPostItModalOpen}
                tags={tags || []}
                onNewTag={onNewTag || (() => { })}
                postItFatherId={selectedPostItId}
                onCreate={(content, tags, postItFatherId) => {
                    if (onPostItChildCreate) {
                        onPostItChildCreate(content, tags, postItFatherId);
                    }
                    setIsChildPostItModalOpen(false);
                    setSelectedPostItId(undefined);
                }}
            />
            {editingPostit && (
                <EditPostItModal
                    isOpen={isEditModalOpen}
                    onOpenChange={(open) => {
                        if (!open) closeEditModal();
                    }}
                    tags={tags || []}
                    onUpdate={handleUpdate}
                    initialContent={editingPostit.content}
                    initialTags={editingPostit.tags}
                    onNewTag={onNewTag || (() => { })}
                />
            )}
        </div>
    );
};

const MultiKonvaContainer: React.FC<MultiKonvaContainerProps> = ({
    unified,
    sourceMandalaIds,
    appliedFilters,
    onPostItUpdate,
    onCharacterUpdate,
    state,
    onMouseEnter,
    onMouseLeave,
    onDragStart,
    onDragEnd,
    onDblClick,
    onBlur,
    onContextMenu,
}) => {
    // Call hooks at the top level for each source mandala (max 5 for now)
    const source1 = useMandala(sourceMandalaIds[0] || '');
    const source2 = useMandala(sourceMandalaIds[1] || '');
    const source3 = useMandala(sourceMandalaIds[2] || '');
    const source4 = useMandala(sourceMandalaIds[3] || '');
    const source5 = useMandala(sourceMandalaIds[4] || '');

    const sourceMandalas = [
        { id: sourceMandalaIds[0], mandala: source1?.mandala },
        { id: sourceMandalaIds[1], mandala: source2?.mandala },
        { id: sourceMandalaIds[2], mandala: source3?.mandala },
        { id: sourceMandalaIds[3], mandala: source4?.mandala },
        { id: sourceMandalaIds[4], mandala: source5?.mandala },
    ].filter(item => item.id && item.mandala);

    // Calculate unified mandala size
    const unifiedMaxRadius = 150 * (unified.mandala.configuration?.scales.length || 1);
    const unifiedSize = unifiedMaxRadius * 2;

    // Layout configuration - desktop only
    const gap = GAP;
    const previewScale = PREVIEW_SCALE;
    const previewSize = unifiedSize * previewScale;

    // Calculate total layout dimensions - horizontal layout
    const leftColumnWidth = previewSize;
    const rightColumnWidth = unifiedSize;
    const totalGap = gap * 2; // Extra padding on both sides

    const totalWidth = leftColumnWidth + totalGap + rightColumnWidth;
    // Compute per-source sizes (unscaled and scaled) to align precisely
    const sourceComputed = sourceMandalas.map((s) => {
        const scalesLen = s.mandala!.mandala.configuration?.scales?.length || 1;
        const unscaledSize = 2 * 150 * scalesLen; // canvasSize for that mandala
        const scaledSize = unscaledSize * previewScale;
        return { id: s.id!, mandala: s.mandala!, unscaledSize, scaledSize };
    });
    const totalLeftHeight =
        (sourceComputed.reduce((acc, it) => acc + it.scaledSize, 0)) + (sourceComputed.length > 0 ? (sourceComputed.length - 1) * gap : 0);
    const totalHeight = Math.max(unifiedSize, totalLeftHeight);

    // Position unified mandala on the right
    const unifiedX = leftColumnWidth + totalGap + rightColumnWidth / 2;
    const unifiedY = totalHeight / 2;

    // Position preview mandalas on the left
    const previewX = leftColumnWidth / 2;
    // Center the preview mandalas vertically with the unified mandala using per-mandala scaled heights
    const previewStartY = unifiedY - totalLeftHeight / 2 + PREVIEW_Y_NUDGE;

    if (!unified || !state) return <div />;

    return (
        <div
            id="multi-konva"
            style={{
                position: "relative",
                width: totalWidth,
                height: totalHeight
            }}
        >
            {/* Background mandalas (DOM elements) */}
            {/* Source mandalas backgrounds */}
            {sourceMandalas.map((s, index) => {
                if (!s.mandala) return null;
                const offsetY = previewStartY + index * (previewSize + gap);
                return (
                    <MandalaBackground
                        key={`bg-src-${s.id}`}
                        mandala={s.mandala}
                        offsetX={previewX - previewSize / 2}
                        offsetY={offsetY}
                        scale={previewScale}
                    />
                );
            })}

            {/* Unified mandala background */}
            <MandalaBackground
                mandala={unified}
                offsetX={unifiedX - unifiedSize / 2}
                offsetY={unifiedY - unifiedSize / 2}
                scale={1}
            />

            {/* Interactive elements (Konva Stages) */}
            {/* Source mandalas canvases */}
            {sourceMandalas.map((s, index) => {
                if (!s.mandala) return null;
                const offsetY = previewStartY + index * (previewSize + gap);
                return (
                    <MandalaCanvas
                        key={`canvas-src-${s.id}`}
                        mandala={s.mandala}
                        offsetX={previewX - previewSize / 2}
                        offsetY={offsetY}
                        scale={previewScale}
                        readOnly
                        appliedFilters={appliedFilters}
                        state={state}
                        onDblClick={onDblClick}
                        onBlur={onBlur}
                        onContextMenu={onContextMenu}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                    />
                );
            })}

            {/* Unified mandala canvas */}
            <MandalaCanvas
                mandala={unified}
                offsetX={unifiedX - unifiedSize / 2}
                offsetY={unifiedY - unifiedSize / 2}
                scale={1}
                readOnly={false}
                appliedFilters={appliedFilters}
                onPostItUpdate={onPostItUpdate}
                onCharacterUpdate={onCharacterUpdate}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
            />
        </div>
    );
};

export default MultiKonvaContainer;


