import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Group, Rect } from "react-konva";
import { Html } from "react-konva-utils";
import { Mandala, Postit } from "@/types/mandala";
import { KonvaEventObject } from "konva/lib/Node";

interface KonvaContainerProps {
    mandala: Mandala;
    onPostItUpdate: (index: number, updates: Partial<Postit>) => Promise<boolean>;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onDragStart: () => void;
    onDragEnd: () => void;
}

const KonvaContainer: React.FC<KonvaContainerProps> = ({
    mandala,
    onPostItUpdate,
    onMouseEnter,
    onMouseLeave,
    onDragStart,
    onDragEnd,
}) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [size, setSize] = useState({ width: 100, height: 100 });
    const [editableIndex, setEditableIndex] = useState<number | null>(null);
    const [editableContent, setEditableContent] = useState<string>("");
    const textArea = useRef<HTMLTextAreaElement | null>(null);
    const [postItWidth, postItHeight, padding] = [64, 64, 5];

    // Observe container size
    useEffect(() => {
        const observer = new ResizeObserver(entries => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                setSize({ width, height });
            }
        });
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // Helpers to convert between relative [-1,1] and absolute px
    const toAbsolute = (relX: number, relY: number) => {
        return {
            x: ((relX + 1) / 2) * size.width,
            y: ((1 - relY) / 2) * size.height,
        };
    };

    const toRelative = (absX: number, absY: number) => {
        return {
            x: (absX / size.width) * 2 - 1,
            y: 1 - (absY / size.height) * 2,
        };
    };

    // Clamp drag within bounds
    const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
        const node = e.target;
        let newX = node.x();
        let newY = node.y();
        newX = Math.max(0, Math.min(size.width - postItWidth, newX));
        newY = Math.max(0, Math.min(size.height - postItHeight, newY));
        node.position({ x: newX, y: newY });
    };

    const toPolar = (x: number, y: number) => {
        // Compute angle and percentileDistance if needed
        const cx = size.width / 2;
        const cy = size.height / 2;
        const dx = x - cx;
        const dy = cy - y;
        const angle = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxR = Math.min(size.width, size.height) / 2;
        return { angle, percentileDistance: Math.min(dist / maxR, 1) };
    };

    const handleContentChange = async (index: number, content: string) => {
        setEditableContent(content);
        await onPostItUpdate(index, { content });
    };

    if (!mandala) return <div>No mandala found</div>;

    return (
        <div ref={containerRef} className="w-full h-full relative">
            <Stage
                width={size.width}
                height={size.height}
                style={{ position: "absolute", top: 0, left: 0 }}
            >
                <Layer>
                    {mandala.postits.map((postit, index) => {
                        const { x, y } = toAbsolute(postit.coordinates.x, postit.coordinates.y);
                        return (
                            <Group
                                key={`post-it-${index}`}
                                x={x}
                                y={y}
                                draggable
                                onDragStart={onDragStart}
                                onDragMove={handleDragMove}
                                onDragEnd={e => {
                                    onDragEnd();
                                    const nx = e.target.x();
                                    const ny = e.target.y();
                                    const rel = toRelative(nx, ny);
                                    const polar = toPolar(nx, ny);
                                    onPostItUpdate(index, {
                                        coordinates: { x: rel.x, y: rel.y, angle: polar.angle, percentileDistance: polar.percentileDistance }
                                    });
                                }}
                                onDblClick={() => {
                                    setEditableIndex(index);
                                    setEditableContent(postit.content);
                                }}
                                onMouseEnter={onMouseEnter}
                                onMouseLeave={onMouseLeave}
                            >
                                <Rect
                                    width={postItWidth}
                                    height={postItHeight}
                                    fill="yellow"
                                    cornerRadius={4}
                                />
                                <Html divProps={{ style: { pointerEvents: "none" } }}>
                                    <textarea
                                        style={{ width: postItWidth, height: postItHeight, padding, resize: "none", backgroundColor: "transparent", boxSizing: "border-box", fontSize: "11px", lineHeight: "1.1" }}
                                        value={editableIndex === index ? editableContent : postit.content}
                                        ref={editableIndex === index ? textArea : null}
                                        disabled={editableIndex !== index}
                                        onChange={e => handleContentChange(index, e.target.value)}
                                    />
                                </Html>
                            </Group>
                        );
                    })}
                </Layer>
            </Stage>
        </div>
    );
};

export default KonvaContainer;