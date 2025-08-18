import {MessageDTO} from "@/types/mandala";

const CHAT_SEED_URL = "/mocks/chat.seed.json";

type MessageRaw = Omit<MessageDTO, "createdAt"> & { createdAt: string };

export async function getMessages(mandalaId: string): Promise<MessageDTO[]> {
    const res = await fetch(CHAT_SEED_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("No se pudo cargar el chat");
    const raw: MessageRaw[] = await res.json();
    return raw.map((m) => ({
        ...m,
        createdAt: new Date(m.createdAt),
    }));
}
