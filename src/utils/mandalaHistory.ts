// src/utils/mandalaHistory.ts

// Parsea los query params y devuelve arrays de ids y names
export function parseMandalaHistory(search: string): { ids: string[]; names: string[] } {
    const params = new URLSearchParams(search);
    const ids = params.get("history")?.split(",").filter(Boolean) ?? [];
    const names = params.get("names")?.split(",").map(decodeURIComponent).filter(Boolean) ?? [];
    return { ids, names };
}

// Construye el string de query params a partir de arrays de ids y names
export function buildMandalaHistoryQuery(ids: string[], names: string[]): string {
    const encodedNames = names.map(encodeURIComponent);
    return `history=${ids.join(",")}&names=${encodedNames.join(",")}`;
}