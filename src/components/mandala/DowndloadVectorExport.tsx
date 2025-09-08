import React, { useRef } from "react";
import type { Mandala as MandalaData } from "@/types/mandala";
import {MandalaSVG} from "@/components/mandala/MandalaSVG.tsx";
import {useSvgExport} from "@/hooks/useSvgExport.ts";

type Props = { mandala: MandalaData };

const DownloadVectorExport: React.FC<Props> = ({ mandala }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const { downloadSVG } = useSvgExport(svgRef);

    return (
        <div className="flex items-center gap-8">
            <div style={{ width: 600, height: 600, border: "1px solid #e5e7eb" }}>
                <MandalaSVG
                    ref={svgRef}
                    mandala={mandala}
                />
            </div>

            <div className="flex flex-col gap-3">
                <button onClick={() => downloadSVG(`${mandala.mandala.name || "mandala"}.svg`)}>
                    Descargar SVG
                </button>
                <button onClick={() => downloadPDF(`${mandala.mandala.name || "mandala"}.pdf`)}>
                    Descargar PDF (vectorial)
                </button>
            </div>
        </div>
    );
};

export default DownloadVectorExport;
