import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getMessages } from "@/services/chatService";
import Message from "@/components/mandala/sidebar/Message.tsx";
import {MessageDTO} from "@/types/mandala";

interface ChatPanelProps {
    mandalaId: string;
}

export default function ChatPanel({ mandalaId }: ChatPanelProps) {
    const [messages, setMessages] = useState<MessageDTO[]>([]);
    const [input, setInput] = useState("");

    useEffect(() => {
        getMessages().then(setMessages).catch((e) => console.error(e));
    }, [mandalaId]);

    return (
        <div className="flex-1 min-h-0 flex flex-col gap-3 p-4">
            <div className="flex-1 min-h-0">
                <div className="h-full border rounded-lg p-4 overflow-y-auto custom-scrollbar space-y-3">
                    {messages.map((m, i) => (
                        <Message key={i} message={m.content} isUser={m.isUser}/>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribe un mensaje…"
                    className="flex-1 border rounded-md px-3 py-2"
                />
                <Button onClick={() => {/* TODO: integrar sendMessage */}}>Enviar</Button>
            </div>
        </div>
    );
}
