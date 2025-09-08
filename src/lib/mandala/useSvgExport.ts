// src/lib/mandala/useSvgExport.ts
import { useCallback } from "react";
import { serializeSvg, downloadSvgString } from "./svg-utils";

type JsPDFModule = typeof import("jspdf");
type Svg2PdfModule = typeof import("svg2pdf.js");

export function useSvgExport(svgRef: React.RefObject<SVGSVGElement>) {
    // Descarga el SVG como está en el DOM.
    const downloadSVG = useCallback((filename = "mandala.svg") => {
        if (!svgRef.current) return;
        const xml = serializeSvg(svgRef.current);
        downloadSvgString(xml, filename);
    }, [svgRef]);

    // Exporta PDF vectorial a partir del <svg> actual usando svg2pdf.js + jsPDF.
    // El tamaño del PDF se calcula desde el viewBox actual (1 unidad SVG = 1 pt por defecto).
    const downloadPDF = useCallback(async (filename = "mandala.pdf") => {
        if (!svgRef.current) return;

        // Carga on-demand para reducir bundle (opcional)
        const [{ jsPDF }, svg2pdf] = await Promise.all([
            import("jspdf") as Promise<JsPDFModule>,
            import("svg2pdf.js") as Promise<Svg2PdfModule>
        ]);

        const svg = svgRef.current;
        const vb = svg.viewBox.baseVal; // MDN: SVGSVGElement.viewBox :contentReference[oaicite:8]{index=8}
        const widthPt = vb.width;
        const heightPt = vb.height;

        const doc = new jsPDF({
            unit: "pt",
            // formato del PDF igual al viewBox (vector 1:1)
            format: [widthPt, heightPt]
        });

        // Convierte SVG → PDF en el doc (yWorks svg2pdf.js)
        // Docs/Repo oficial: https://github.com/yWorks/svg2pdf.js
        (svg2pdf as any).default(svg, doc, { x: 0, y: 0, width: widthPt, height: heightPt });
        doc.save(filename);
    }, [svgRef]);

    return { downloadSVG, downloadPDF };
}
