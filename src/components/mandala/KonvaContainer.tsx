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
    width: number;
    height: number;
}

const KonvaContainer: React.FC<KonvaContainerProps> = ({
    mandala,
    onPostItUpdate,
    onMouseEnter,
    onMouseLeave,
    onDragStart,
    onDragEnd,
    width,
    height,
}) => {
    const [editableIndex, setEditableIndex] = useState<number | null>(null);
    const [editableContent, setEditableContent] = useState<string>("");
    const textArea = useRef<HTMLTextAreaElement | null>(null);
    const [postItWidth, postItHeight, padding] = [64, 64, 5];

    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) / 2;

    useEffect(() => {
        setTimeout(() => {
            if (editableIndex !== null && textArea.current) {
                textArea.current.focus();
                const length = textArea.current.value.length;
                textArea.current.setSelectionRange(length, length);
            }
        }, 0);
    }, [editableIndex]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (textArea.current && !textArea.current.contains(e.target as Node)) {
                setEditableIndex(null);
            }
        };
        window.addEventListener("mousedown", handleClickOutside);
        return () => window.removeEventListener("mousedown", handleClickOutside);
    }, [editableIndex]);

    const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
        const node = e.target;
        const minX = 0;
        const maxX = width - postItWidth;
        const minY = 0;
        const maxY = height - postItHeight;

        const newX = Math.max(minX, Math.min(maxX, node.x()));
        const newY = Math.max(minY, Math.min(maxY, node.y()));

        if (newX !== node.x() || newY !== node.y()) {
            node.position({ x: newX, y: newY });
        }
    };

    const toPolar = (x: number, y: number) => {
        const dx = x - centerX;
        const dy = centerY - y;
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        const adjustedAngle = (angle + 360) % 360;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const percentileDistance = Math.min(distance / maxRadius, 1);
        return { angle: adjustedAngle, percentileDistance };
    };

    const handleContentChange = async (index: number, content: string) => {
        try {
            setEditableContent(content);
            await onPostItUpdate(index, { content });
        } catch (error) {
            console.error("Error updating postit content:", error);
        }
    };

    if (!mandala) {
        return <div>No mandala found</div>;
    }

    return (
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
            <Stage width={width} height={height}>
                <Layer>
                    {mandala.postits.map((postit, index) => {
                        const { x, y } = postit.coordinates;
                        return (
                            <Group
                                key={`post-it-${index}`}
                                x={x}
                                y={y}
                                draggable
                                onDragStart={onDragStart}
                                onDragMove={handleDragMove}
                                onDragEnd={(e) => {
                                    onDragEnd();
                                    const newX = e.target.x();
                                    const newY = e.target.y();
                                    const { angle, percentileDistance } = toPolar(newX, newY);
                                    onPostItUpdate(index, {
                                        coordinates: {
                                            x: newX,
                                            y: newY,
                                            angle,
                                            percentileDistance,
                                        },
                                    });
                                }}
                                onDblClick={() => {
                                    setEditableIndex(index);
                                    setEditableContent(postit.content);
                                }}
                                onMouseEnter={onMouseEnter}
                                onMouseLeave={onMouseLeave}
                            >
                                <Rect width={postItWidth} height={postItHeight} fill="yellow" cornerRadius={4} />
                                <Html divProps={{ style: { pointerEvents: "none" } }}>
                                    <textarea
                                        style={{
                                            width: postItWidth,
                                            height: postItHeight,
                                            margin: 0,
                                            padding: padding,
                                            resize: "none",
                                            backgroundColor: "transparent",
                                            boxSizing: "border-box",
                                            fontSize: "11px",
                                            lineHeight: "1.1",
                                        }}
                                        value={editableIndex === index ? editableContent : postit.content}
                                        ref={editableIndex === index ? textArea : null}
                                        disabled={editableIndex !== index}
                                        onChange={(e) => handleContentChange(index, e.target.value)}
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
