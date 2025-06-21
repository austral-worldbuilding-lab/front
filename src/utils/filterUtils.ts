import {Character, Postit} from "@/types/mandala";

export const shouldShowPostIt = (postit: Postit, appliedFilters: Record<string, string[]>): boolean => {
    if (!postit) return false;
    const { dimension, section } = postit;

    const dimensionFilter = appliedFilters["Dimensiones"] || [];
    const scaleFilter = appliedFilters["Escalas"] || [];
    const tagFilter = appliedFilters["Tags"] || [];

    return (
        (dimensionFilter.length === 0 || dimensionFilter.includes(dimension)) &&
        (scaleFilter.length === 0 || scaleFilter.includes(section)) &&
        (tagFilter.length === 0 || tagFilter.includes(postit.tag?.label || ""))
    );
};

export const shouldShowCharacter = (character: Character, appliedFilters: Record<string, string[]>): boolean => {
    if (!character) return false;
    const { dimension, section } = character;
    if (!dimension || !section) return true;

    const dimensionFilter = appliedFilters["Dimensiones"] || [];
    const scaleFilter = appliedFilters["Escalas"] || [];

    return (
        (dimensionFilter.length === 0 || dimensionFilter.includes(dimension)) &&
        (scaleFilter.length === 0 || scaleFilter.includes(section))
    );
};
