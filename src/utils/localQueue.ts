// src/utils/localQueue.ts

// Guarda un nuevo item en una cola (FIFO) en localStorage, con un máximo de elementos
export function pushToLocalQueue<T>(key: string, item: T, max: number) {
    const prev = JSON.parse(localStorage.getItem(key) ?? "[]") as T[];
    const next = [...prev, item].slice(-max);
    localStorage.setItem(key, JSON.stringify(next));
}

// Obtiene la cola de localStorage
export function getLocalQueue<T>(key: string): T[] {
    return JSON.parse(localStorage.getItem(key) ?? "[]");
}