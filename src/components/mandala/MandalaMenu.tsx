import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreVertical } from "lucide-react";

const MandalaMenu = ({onDelete}: { onDelete: () => void; }) => {
    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button
                    className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-200 active:bg-gray-300"
                >
                    <MoreVertical className="w-4 h-4" />
                </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content
                className="z-50 min-w-[8rem] rounded-md border bg-white p-1 text-sm shadow-md"
                sideOffset={4}
            >
                <DropdownMenu.Item
                    className="cursor-pointer px-2 py-1.5 hover:bg-gray-100 text-red-600"
                    onSelect={onDelete}
                >
                    Eliminar
                </DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    );
};

export default MandalaMenu;
