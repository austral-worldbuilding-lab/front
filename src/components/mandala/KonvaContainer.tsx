import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Group, Rect } from "react-konva";
import { Html } from "react-konva-utils";
import { PostIt } from "@/types/post-it";

interface KonvaContainerProps {
    mandalaId: string;
    postIts: Map<string, PostIt>;
    onPostItUpdate: (id: string, updates: Partial<PostIt>) => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onDragStart: () => void;
    onDragEnd: () => void;
    width: number;
    height: number;
}

const KonvaContainer: React.FC<KonvaContainerProps> = ({
    mandalaId,
    postIts,
    onPostItUpdate,
    onMouseEnter,
    onMouseLeave,
    onDragStart,
    onDragEnd,
    width,
    height,
}) => {
    const [editablePostItId, setEditablePostItId] = useState<string | null>(null);
    const textArea = useRef<HTMLTextAreaElement | null>(null);
    const [postItWidth, postItHeight, padding] = [64, 64, 5];

    // Textarea editing
    useEffect(() => {
        setTimeout(() => {
            if (editablePostItId && textArea.current) {
                textArea.current.focus();
                const length = textArea.current.value.length;
                textArea.current.setSelectionRange(length, length);
            }
        }, 0);
    }, [editablePostItId]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (textArea.current && !textArea.current.contains(e.target as Node)) {
                setEditablePostItId(null);
            }
        };
        window.addEventListener("mousedown", handleClickOutside);
        return () => window.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDragMove = (e: any) => {
        const node = e.target;
        // Use passed width/height for boundaries
        const stageWidth = width;
        const stageHeight = height;

        // Calculate boundaries
        const minX = 0;
        const maxX = stageWidth - postItWidth;
        const minY = 0;
        const maxY = stageHeight - postItHeight;

        // Constrain position
        const newX = Math.max(minX, Math.min(maxX, node.x()));
        const newY = Math.max(minY, Math.min(maxY, node.y()));

        // Update position if it changed
        if (newX !== node.x() || newY !== node.y()) {
            node.position({
                x: newX,
                y: newY
            });
        }
    };

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            <Stage width={width} height={height}>
                <Layer>
                    {[...postIts.entries()].map(([id, postIt]) => (
                        <Group
                            key={`post-it-${id}`}
                            x={postIt.position.x}
                            y={postIt.position.y}
                            draggable
                            onDragStart={onDragStart}
                            onDragMove={handleDragMove}
                            onDragEnd={(e) => {
                                onDragEnd();
                                onPostItUpdate(id, {
                                    position: {
                                        x: e.target.x(),
                                        y: e.target.y(),
                                    },
                                    category: postIt.category,
                                });
                            }}
                            onDblClick={() => setEditablePostItId(id)}
                            onMouseEnter={onMouseEnter}
                            onMouseLeave={onMouseLeave}
                        >
                            <Rect
                                width={postItWidth}
                                height={postItHeight}
                                fill="yellow"
                                cornerRadius={4}
                            />
                            <Html
                                divProps={{
                                    style: {
                                        pointerEvents: "none",
                                    },
                                }}
                            >
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
                                    value={postIt.content}
                                    ref={editablePostItId === id ? textArea : null}
                                    disabled={editablePostItId !== id}
                                    onChange={(e) =>
                                        onPostItUpdate(id, {
                                            content: e.target.value,
                                            category: postIt.category,
                                        })
                                    }
                                />
                            </Html>
                        </Group>
                    ))}
                </Layer>
            </Stage>
        </div>
    );
};

export default KonvaContainer;