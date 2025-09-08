export function wrapTextByWidth(
    text: string,
    maxWidthPx: number,
    fontSizePx: number,
    charWidthFactor = 0.6
): string[] {
    const approx = Math.max(1, Math.floor(maxWidthPx / (fontSizePx * charWidthFactor)));
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let line = "";

    for (const w of words) {
        const test = line ? line + " " + w : w;
        if (test.length <= approx) line = test;
        else {
            if (line) lines.push(line);
            if (w.length > approx) {
                for (let i = 0; i < w.length; i += approx) lines.push(w.slice(i, i + approx));
                line = "";
            } else line = w;
        }
    }
    if (line) lines.push(line);
    return lines;
}

export function serializeSvg(svgEl: SVGSVGElement): string {
    const clone = svgEl.cloneNode(true) as SVGSVGElement;
    if (!clone.getAttribute("xmlns")) clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    if (!clone.getAttribute("xmlns:xlink")) clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    const xml = new XMLSerializer().serializeToString(clone);
    return `<?xml version="1.0" encoding="UTF-8"?>\n${xml}`;
}

export function downloadSvgString(svgString: string, filename = "mandala.svg") {
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
}
