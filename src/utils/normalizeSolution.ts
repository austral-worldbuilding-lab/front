import type { Solution } from "@/types/mandala";

export function normalizeSolution(raw: any): Solution {
    return {
        id: raw.id || crypto.randomUUID(),
        title: raw.title,
        description: raw.description || "",
        problem: raw.problem || "",
        impact: {
            level:
                raw.impact?.level?.toLowerCase?.() ||
                raw.impactLevel?.toLowerCase?.() ||
                "medium",
            description:
                raw.impact?.description ||
                raw.impactDescription ||
                "Sin descripción de impacto",
        },
        provocations:
            raw.provocations?.map((p: any) => (typeof p === "string" ? p : p.title || p.name)) ||
            raw.provocationIds ||
            [],
    };
}
