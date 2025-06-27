import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreVertical, Plus } from "lucide-react";

interface MandalaMenuProps {
  onDelete: () => void;
  onCreateChild?: () => void;
  isContextMenu?: boolean;
}

const MandalaMenu = ({
  onDelete,
  onCreateChild,
  isContextMenu = false,
}: MandalaMenuProps) => {
  if (isContextMenu) {
    return (
      <div className="z-50 min-w-[8rem] rounded-md border bg-white p-1 text-sm shadow-md">
        {onCreateChild && (
          <button
            className="w-full cursor-pointer px-2 py-1.5 hover:bg-gray-100 text-primary text-left flex items-center gap-2"
            onClick={onCreateChild}
          >
            <Plus size={14} />
            Crear Hijo
          </button>
        )}
        <button
          className="w-full cursor-pointer px-2 py-1.5 hover:bg-gray-100 text-red-600 text-left"
          onClick={onDelete}
        >
          Eliminar
        </button>
      </div>
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-200 active:bg-gray-300">
          <MoreVertical className="w-4 h-4" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        className="z-50 min-w-[8rem] rounded-md border bg-white p-1 text-sm shadow-md"
        sideOffset={4}
      >
        {onCreateChild && (
          <DropdownMenu.Item
            className="cursor-pointer px-2 py-1.5 hover:bg-gray-100 text-blue-600"
            onSelect={onCreateChild}
          >
            <Plus size={14} className="mr-2" />
            Crear Hijo
          </DropdownMenu.Item>
        )}
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
