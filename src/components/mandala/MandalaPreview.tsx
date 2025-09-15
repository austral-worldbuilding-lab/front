import React, { useState } from "react";
import { ReactZoomPanPinchState, TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import useMandala from "@/hooks/useMandala";
import Mandala from "./Mandala";
import KonvaContainer from "./KonvaContainer";

interface MandalaPreviewProps {
    mandalaId: string;
}

const MandalaPreview: React.FC<MandalaPreviewProps> = ({ mandalaId }) => {
    const { mandala, updateCharacter, updatePostit, deletePostit, updateImage, deleteImage } = useMandala(mandalaId);
    const [state, setState] = useState<ReactZoomPanPinchState | null>(null);
    const [isDraggingPostIt, setIsDraggingPostIt] = useState(false);
    const [isHoveringPostIt, setIsHoveringPostIt] = useState(false);

    if (!mandala) return null;

    return (
        <div className="w-full flex items-center justify-center">
            <div className="relative w-[480px] h-[480px] border rounded-lg bg-white">
                <TransformWrapper
                    initialScale={0.5}
                    minScale={0.2}
                    maxScale={3}
                    centerOnInit
                    limitToBounds={false}
                    wheel={{ disabled: isDraggingPostIt }}
                    pinch={{ disabled: isDraggingPostIt }}
                    doubleClick={{ disabled: true }}
                    panning={{ disabled: isDraggingPostIt || isHoveringPostIt }}
                    onTransformed={(ref) => setState({ ...ref.state })}
                >
                    <TransformComponent
                        wrapperStyle={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
                        contentStyle={{ width: "100%", height: "100%", position: "relative" }}
                    >
                        <div className="relative w-full h-full flex items-center justify-center">
                            <Mandala mandala={mandala} scale={1} position={{ x: 0, y: 0 }} />
                            <KonvaContainer
                                mandala={mandala}
                                onCharacterUpdate={updateCharacter}
                                onPostItUpdate={updatePostit}
                                onPostItChildCreate={() => { }}
                                onPostItDelete={deletePostit}
                                onCharacterDelete={async () => false}
                                onImageUpdate={updateImage}
                                onImageDelete={deleteImage}
                                onMouseEnter={() => setIsHoveringPostIt(true)}
                                onMouseLeave={() => setIsHoveringPostIt(false)}
                                onDragStart={() => setIsDraggingPostIt(true)}
                                onDragEnd={() => setIsDraggingPostIt(false)}
                                appliedFilters={{}}
                                tags={[]}
                                onNewTag={() => { }}
                                state={state}
                            />
                        </div>
                    </TransformComponent>
                </TransformWrapper>
            </div>
        </div>
    );
};

export default MandalaPreview;


