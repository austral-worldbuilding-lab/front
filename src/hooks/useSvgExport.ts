import { useCallback } from "react";
import {downloadSvgString, serializeSvg} from "@/lib/mandala/svg-utils.ts";

export function useSvgExport(svgRef: React.RefObject<SVGSVGElement | null>) {

    const downloadSVG = useCallback((filename = "mandala.svg") => {
        if (!svgRef.current) return;
        const xml = serializeSvg(svgRef.current);
        downloadSvgString(xml, filename);
    }, [svgRef]);

    return { downloadSVG };
}
