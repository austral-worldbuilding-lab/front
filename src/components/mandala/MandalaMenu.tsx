import { useState } from "react";
import { MoreVertical } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";

export const MandalaMenu = ({ onDelete }: { onDelete: () => void }) => {
    const [open, setOpen] = useState(false);

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <button
                    className={`p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500
            hover:bg-gray-200 active:bg-gray-300
            ${open ? "bg-gray-300" : ""}`}
                >
                    <MoreVertical className="w-4 h-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={onDelete} className="text-red-600">
                    Eliminar Mandala
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
