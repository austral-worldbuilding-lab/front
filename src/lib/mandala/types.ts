// src/lib/mandala/types.ts
export type Ring = {
    inner: number;      // radio interno
    outer: number;      // radio externo
    color: string;
    opacity?: number;
};

export type PostIt = {
    x: number;          // coord. en el sistema de la mandala (centro = 0,0)
    y: number;
    r: number;          // radio del post-it (si son circulares)
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    text: string;
    textColor?: string;
    fontSize?: number;  // en px "lógicos" del viewBox
    fontFamily?: string;
    maxTextWidthFactor?: number; // p.ej. 0.8 => 80% del diámetro
};

export type Character = {
    x: number;
    y: number;
    r: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    initials: string;   // texto breve a mostrar
    textColor?: string;
    fontSize?: number;
    fontFamily?: string;
};

export type MandalaScene = {
    R: number;              // radio total de la mandala
    rings: Ring[];
    sectorCount: number;    // cantidad de sectores radiales
    sectorStroke?: string;
    sectorWidth?: number;
    background?: string;    // color de fondo opcional
    posts: PostIt[];
    characters: Character[];
    // Tipografías
    defaultFontFamily?: string; // fallback si no se define en items
    defaultFontSize?: number;
};
