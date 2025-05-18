import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Group, Rect } from "react-konva";
import { Html } from "react-konva-utils";
import { Postit } from "@/types/mandala";
import useMandala from "@/hooks/useMandala";

interface KonvaContainerProps {
    mandalaId: string;
    onPostItUpdate: (id: string, updates: Partial<Postit>) => Promise<boolean>;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onDragStart: () => void;
    onDragEnd: () => void;
    width: number;
    height: number;
}

const KonvaContainer: React.FC<KonvaContainerProps> = ({
    mandalaId,
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
    const { mandala, loading, error, updatePostit } = useMandala(mandalaId);

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

    const calculateLevel = (x: number, y: number): number => {
        const centerX = 930;
        const centerY = 610;
        const radius = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));

        if (radius <= 150) return 0;      // 0 to 460
        if (radius <= 300) return 1;      // 460 to 310
        if (radius <= 450) return 2;      // 310 to 160
        if (radius <= 600) return 3;      // 160 to 10
        return 3; // Default to outermost level if beyond all ranges
    };

    const calculateSection = (x: number, y: number): string => {
        const centerX = 930;
        const centerY = 610;
        // Calculate angle in degrees (0 is right, 90 is up)
        let angle = Math.atan2(centerY - y, x - centerX) * (180 / Math.PI);
        // Convert to 0-360 range
        angle = (angle + 360) % 360;

        // Each section is 60 degrees
        if (angle >= 0 && angle < 60) return "resources";
        if (angle >= 60 && angle < 120) return "culture";
        if (angle >= 120 && angle < 180) return "infrastructure";
        if (angle >= 180 && angle < 240) return "economy";
        if (angle >= 240 && angle < 300) return "governance";
        return "ecology"; // 300-360 degrees
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    if (!mandala) {
        return <div>No mandala found</div>;
    }

    // Combine all postits from different categories into a single array
    const allPostits = [
        ...mandala.ecology.map(postit => ({ ...postit, category: "ecology" })),
        ...mandala.economy.map(postit => ({ ...postit, category: "economy" })),
        ...mandala.governance.map(postit => ({ ...postit, category: "governance" })),
        ...mandala.culture.map(postit => ({ ...postit, category: "culture" })),
        ...mandala.resources.map(postit => ({ ...postit, category: "resources" })),
        ...mandala.infrastructure.map(postit => ({ ...postit, category: "infrastructure" }))
    ];

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            <Stage width={width} height={height}>
                <Layer>
                    {allPostits.map((postit) => (
                        <Group
                            key={`post-it-${postit.id}`}
                            x={postit.position.x}
                            y={postit.position.y}
                            draggable
                            onDragStart={onDragStart}
                            onDragMove={handleDragMove}
                            onDragEnd={(e) => {
                                onDragEnd();
                                const newX = e.target.x();
                                const newY = e.target.y();
                                const newLevel = calculateLevel(newX, newY);
                                const newSection = calculateSection(newX, newY);
                                updatePostit(postit.id, {
                                    position: {
                                        x: newX,
                                        y: newY,
                                    },
                                    category: newSection,
                                    level: newLevel
                                });
                            }}
                            onDblClick={() => setEditablePostItId(postit.id)}
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
                                    value={postit.content}
                                    ref={editablePostItId === postit.id ? textArea : null}
                                    disabled={editablePostItId !== postit.id}
                                    onChange={(e) =>
                                        updatePostit(postit.id, {
                                            content: e.target.value,
                                            category: postit.category,
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