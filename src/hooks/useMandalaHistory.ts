import { useState } from "react";

export interface MandalaHistoryItem {
    id: string;
    name: string;
}

export function useMandalaHistory() {
    const [history, setHistory] = useState<MandalaHistoryItem[]>(() => {
        return JSON.parse(sessionStorage.getItem("mandalaHistory") || "[]");
    });

    // Agrega un id al historial
    const addMandala = (id: string, name: string) => {
        setHistory((prev) => {
            const idx = prev.findIndex((item) => item.id === id);
            let newHistory;
            if (idx !== -1) {
                newHistory = prev.slice(0, idx + 1);
            } else {
                newHistory = [...prev, { id, name }];
            }
            sessionStorage.setItem("mandalaHistory", JSON.stringify(newHistory));
            return newHistory;
        });
    }

    // Resetea el historial (opcionalmente con un id inicial)
    const resetHistory = (id?: string, name?: string) => {
        const newHistory = id && name ? [{ id, name }] : [];
        setHistory(newHistory);
        sessionStorage.setItem("mandalaHistory", JSON.stringify(newHistory));
    };

    return {
        history,
        addMandala,
        resetHistory,
    };
}