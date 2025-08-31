import {Character, Postit} from "@/types/mandala";

export const shouldShowPostIt = (postit: Postit, appliedFilters: Record<string, string[]>): boolean => {
    if (!postit) return false;
    const { dimension, section, tags, from } = postit;

    const dimensionFilter = appliedFilters["Dimensiones"] || [];
    const scaleFilter = appliedFilters["Escalas"] || [];
    const tagFilter = appliedFilters["Tags"] || [];
    const characterFilter = appliedFilters["Personajes"] || [];

    const tagNames = Array.isArray(tags)
        ? tags.map((tag) => tag.value || tag.name)
        : [];

    return (
        (dimensionFilter.length === 0 || dimensionFilter.includes(dimension)) &&
        (scaleFilter.length === 0 || scaleFilter.includes(section)) &&
        (tagFilter.length === 0 || tagNames.some((t) => tagFilter.includes(t))) &&
        (characterFilter.length === 0 || !from || characterFilter.includes(from.name))
    );
};

export const shouldShowCharacter = (character: Character, appliedFilters: Record<string, string[]>): boolean => {
    if (!character) return false;
    const { dimension, section } = character;
    if (!dimension || !section) return true;

    const dimensionFilter = appliedFilters["Dimensiones"] || [];
    const scaleFilter = appliedFilters["Escalas"] || [];
    const tagFilter = appliedFilters["Tags"];
    if (tagFilter && tagFilter.length > 0) {
        return false;
    }

    return (
        (dimensionFilter.length === 0 || dimensionFilter.includes(dimension)) &&
        (scaleFilter.length === 0 || scaleFilter.includes(section))
    );
};
