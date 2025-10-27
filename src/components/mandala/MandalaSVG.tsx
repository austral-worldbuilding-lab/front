import { forwardRef } from "react";
import type { Mandala as MandalaData } from "@/types/mandala";
import { wrapTextByWidth } from "@/lib/mandala/svg-utils";

// Constantes visuales alineadas a UI
const BASE = 150;                 // 150px por escala
const POSTIT_R = 50;              // 100px de diámetro
const POSTIT_FONT = 10;           // como en PostIt (postItW / 10)
const DOT_R = 4;                  // puntitos de intersección ~8px -> r=4
const SECTOR_BORDER = "rgba(200,210,255,0.8)";
const GUIDE_COLOR = "rgba(100,150,255,0.5)";
const PRIMARY_TEXT = "#0b3ea7";
const LABEL_PAD = 110; // margen para que no se corten rótulos superior/inferior

// Colores para post-its de mandalas comparadas (OVERLAP_SUMMARY)
const COMPARISON_COLORS = {
    SIMILITUD: "#33f25f",
    DIFERENCIA: "#9f2d2d",
    UNICO: "#c2c2c2",
};

// Misma interpolación de niveles que en el fondo
function getInterpolatedLevelColor(index: number, total: number): string {
    const from = [200, 220, 255, 0.9];
    const to   = [140, 190, 255, 0.3];
    const t = total > 1 ? index / (total - 1) : 0;
    const v = from.map((s, i) => s + (to[i] - s) * t);
    const [r, g, b, a] = v;
    return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a.toFixed(2)})`;
}

export type MandalaSVGProps = {
    mandala: MandalaData;
    embeddedFontCss?: string;
    // Posiciones absolutas (idénticas a Konva)
    postsAbs?: Array<{
        id?: string;
        content: string;
        dimension: string;
        ax: number;
        ay: number;
        scale?: number;  // Escala del post-it (1 es normal)
        type?: "SIMILITUD" | "DIFERENCIA" | "UNICO";  // Tipo para mandalas comparadas
    }>;
    charsAbs?: Array<{ id?: string; name: string; color?: string; ax: number; ay: number }>;
    imagesAbs?: Array<{ id?: string; url: string; ax: number; ay: number }>;
};

export const MandalaSVG = forwardRef<SVGSVGElement, MandalaSVGProps>(
    ({ mandala, embeddedFontCss, postsAbs, charsAbs, imagesAbs }, ref) => {
        // Datos base iguales a la UI
        const scales = mandala.mandala.configuration?.scales ?? [];
        const dimensions = mandala.mandala.configuration?.dimensions ?? [];
        const dimensionColors = dimensions.reduce((acc, d) => {
            acc[d.name] = d.color || "#FFF3B0";
            return acc;
        }, {} as Record<string, string>);
        const levelCount = scales.length || 1;
        const maxRadius = BASE * levelCount;
        const canvasSize = maxRadius * 2;
        const R = maxRadius;

        // Niveles
        const levels = Array.from({ length: levelCount }, (_, i) => ({
            id: i,
            radius: BASE * (i + 1),
            color: getInterpolatedLevelColor(i, levelCount),
        }));

        // Dimensiones (nombres)
        const sectors = dimensions.map(d => ({ id: d.name, name: d.name }));

        // Ángulos de dimensiones
        const computedAngles = sectors.map((s, index) => ({
            ...s,
            angle: (360 / sectors.length) * (sectors.length - index), // igual que tu MandalaSectors
        }));

        // Ángulos medios para rótulos exteriores
        const midAngles = computedAngles.map((sector, index) => {
            const next = computedAngles[(index + 1) % computedAngles.length];
            let mid = (sector.angle + next.angle) / 2;
            if (index === computedAngles.length - 1) {
                mid = (sector.angle + (next.angle + 360)) / 2;
                if (mid >= 360) mid -= 360;
            }
            return mid;
        });

        // Coordenadas absolutas desde normalizadas (-1..1) -> canvas centrado [0..2R]
        const relToAbs = (rx: number, ry: number) => ({ x: R + rx * R, y: R + ry * R });

        // Post-its absolutos (si vienen por props, usarlos)
        const posts =
            postsAbs ??
            (mandala.postits || []).map(p => {
                const { x, y } = relToAbs(p.coordinates.x, p.coordinates.y);
                return {
                    id: p.id,
                    content: p.content,
                    dimension: p.dimension,
                    ax: x,
                    ay: y,
                    scale: p.scale,
                    type: p.type,
                };
            });

        // Personajes absolutos (si vienen por props, usarlos)
        const characters =
            charsAbs ??
            (mandala.characters || []).map(c => {
                const { x, y } = relToAbs(c.position.x, c.position.y);
                return { id: c.id, name: c.name, color: c.color, ax: x, ay: y };
            });


        const rad = (deg: number) => (deg * Math.PI) / 180;

        return (
            <svg
                ref={ref}
                viewBox={`${-LABEL_PAD} ${-LABEL_PAD} ${canvasSize + 2 * LABEL_PAD} ${canvasSize + 2 * LABEL_PAD}`}
                width="100%"
                height="100%"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-label={`Mandala ${mandala.mandala.name}`}
                textRendering="geometricPrecision"
            >
                <title>{mandala.mandala.name}</title>
                <style>{`
          text { font-family: system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial, sans-serif; fill:#111 }
          ${embeddedFontCss ?? ""}
        `}</style>

                {/* Niveles (pintados del mayor al menor) */}
                {levels
                    .slice()
                    .sort((a, b) => b.radius - a.radius)
                    .map((lvl) => (
                        <g key={lvl.id}>
                            <circle cx={R} cy={R} r={lvl.radius} fill={lvl.color} />
                            <circle cx={R} cy={R} r={lvl.radius} fill="none" stroke={SECTOR_BORDER} strokeWidth={1} />
                        </g>
                    ))} {/* :contentReference[oaicite:5]{index=5} */}

                {/* Líneas radiales “dotted” (opcional, como en la UI) */}
                <g stroke={GUIDE_COLOR} strokeWidth={2} strokeDasharray="2 6">
                    {computedAngles.map((s, i) => (
                        <line
                            key={`rad-${i}`}
                            x1={R} y1={R}
                            x2={R + R * Math.cos(rad(s.angle))}
                            y2={R + R * Math.sin(rad(s.angle))}
                        />
                    ))}
                </g>

                {/* Puntos azules en cada intersección radio × nivel */}
                <g fill="#0b2063">
                    {computedAngles.flatMap((s, i) =>
                        levels.map((lvl, j) => {
                            const x = R + Math.cos(rad(s.angle)) * lvl.radius;
                            const y = R + Math.sin(rad(s.angle)) * lvl.radius;
                            return <circle key={`dot-${i}-${j}`} cx={x} cy={y} r={DOT_R} />;
                        })
                    )}
                </g>

                {/* Rótulos de dimensiones alrededor */}
                {midAngles.map((mid, i) => {
                    const x = R + Math.cos(rad(mid)) * (R + 60);
                    const y = R + Math.sin(rad(mid)) * (R + 60);
                    const textRotation = mid + 90;
                    return (
                        <g key={`label-${i}`} transform={`translate(${x} ${y}) rotate(${textRotation})`}>
                            <text
                                fontSize={19}
                                fontWeight={700}
                                fill={PRIMARY_TEXT}
                                textAnchor="middle"
                                style={{ letterSpacing: "0.06em", whiteSpace: "pre" }}
                            >
                                {computedAngles[i].name}
                            </text>
                        </g>
                    );
                })}

                {/* Post-its */}
                {posts.map((p, i) => {
                    const postItScale = p.scale ?? 1;
                    const radius = POSTIT_R * postItScale;
                    const fillColor = p.type
                        ? COMPARISON_COLORS[p.type]
                        : (dimensionColors[p.dimension] ?? "white");

                    // Padding
                    const paddingRatio = 5 / 100; // 0.05
                    const padding = radius * 2 * paddingRatio;

                    // Ancho disponible para texto (diámetro - padding horizontal)
                    const availableWidth = (radius * 2) - (padding * 2);
                    const maxTextW = availableWidth * 0.95;

                    // FontSize escala con el post-it
                    const scaledFontSize = POSTIT_FONT * postItScale;

                    const lines = wrapTextByWidth(p.content ?? "", maxTextW, scaledFontSize);
                    const lh = Math.round(scaledFontSize * 1.1);

                    // Posición Y inicial: arriba del círculo + padding (centro - radio + padding)
                    const startY = p.ay - radius + padding * 2 + (scaledFontSize / 2);

                    return (
                        <g key={p.id ?? `p-${i}`}>
                            <circle
                                cx={p.ax}
                                cy={p.ay}
                                r={radius}
                                fill={fillColor}
                                stroke="rgba(0,0,0,0.25)"
                            />
                            {lines.map((line, j) => (
                                <text
                                    key={j}
                                    x={p.ax}
                                    y={startY + j * lh}
                                    fontSize={scaledFontSize}
                                    textAnchor="middle"
                                    dominantBaseline="hanging"
                                >
                                    {line}
                                </text>
                            ))}
                        </g>
                    );
                })}

                {/* Personajes */}
                {characters.map((c, i) => (
                    <g key={c.id ?? `c-${i}`}>
                        <circle cx={c.ax} cy={c.ay} r={12} fill={c.color || "#E6F0FF"} stroke="#8CB4FF"/>
                        <text x={c.ax} y={c.ay - 35} fontSize={14} fontWeight={700} textAnchor="middle">{c.name}</text>
                    </g>
                ))}

                {/* Imágenes */}
                {(imagesAbs ?? []).map((img, i) => (
                    <g key={img.id ?? `img-${i}`}>
                        <image
                            href={img.url}
                            x={img.ax - 40}
                            y={img.ay - 40}
                            width={80}
                            height={80}
                            preserveAspectRatio="xMidYMid meet"
                            style={{ filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.3))" }}
                        />
                    </g>
                ))}
            </svg>
        );
    }
);

MandalaSVG.displayName = "MandalaSVG";
