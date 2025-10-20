import { useState, useEffect } from 'react';
import * as mandalaService from '../services/mandalaService';
import {fetchAvailableCharacters} from "../services/mandalaService";

export function useProjectCharacters(mandalaId: string) {
    const [characters, setCharacters] = useState<{ id: string; name: string; color: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadCharacters = async () => {
        try {
            setLoading(true);
            const chars = await fetchAvailableCharacters(mandalaId);
            setCharacters(chars);
        } catch (error) {
            setError("Error loading characters");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCharacters();
    }, [mandalaId]);

    const linkCharacter = async (characterId: string) => {
        try {
            await mandalaService.linkMandalaToParent(mandalaId, characterId);
            setCharacters((prev) => prev.filter((c) => c.id !== characterId));
        } catch (error) {
            setError('Error linking character');
        }
    };

    const refetch = async () => {
        await loadCharacters();
    };

    return { characters, loading, error, linkCharacter, refetch };
}
