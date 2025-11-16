import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreVertical, Pencil, Plus, Trash2, Download } from "lucide-react";

interface MandalaMenuProps {
  onDelete: () => void;
  onCreateChild?: () => void;
  onEdit?: () => void;
  onDownloadSummary?: () => void;
  isContextMenu?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  canEdit?: boolean;
}

const MandalaMenu = ({
  onDelete,
  onCreateChild,
  onEdit,
  onDownloadSummary,
  isContextMenu = false,
  open,
  onOpenChange,
  canEdit = true,
}: MandalaMenuProps) => {
  if (isContextMenu) {
    return (
      <div className="z-50 min-w-[8rem] rounded-md border bg-white p-1 text-sm shadow-md">
        {canEdit && onCreateChild && (
          <div
            className="w-full cursor-pointer px-2 py-1.5 hover:bg-gray-100 text-primary text-left flex items-center gap-2"
            onClick={onCreateChild}
          >
            <Plus size={14} />
            Crear Hijo
          </div>
        )}
        {canEdit && onEdit && (
          <div
            className="w-full cursor-pointer px-2 py-1.5 hover:bg-gray-100 text-primary text-left flex items-center gap-2"
            onClick={onEdit}
          >
            <Pencil size={14} />
            Editar
          </div>
        )}
        {onDownloadSummary && (
          <div
            className="w-full cursor-pointer px-2 py-1.5 hover:bg-gray-100 text-primary text-left flex items-center gap-2"
            onClick={onDownloadSummary}
          >
            <Download size={14} />
            Descargar Resumen
          </div>
        )}
        {canEdit && (
          <div
            className="w-full cursor-pointer px-2 py-1.5 hover:bg-gray-100 text-red-600 text-left flex items-center gap-2"
            onClick={onDelete}
          >
            <Trash2 size={14} />
            Eliminar
          </div>
        )}
      </div>
    );
  }

  return (
    <DropdownMenu.Root open={open} onOpenChange={onOpenChange}>
      <DropdownMenu.Trigger asChild>
        <button className="p-2 rounded focus:outline-none hover:bg-gray-200 active:bg-gray-300 cursor-pointer">
          <MoreVertical className="w-4 h-4" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        className="z-50 min-w-[8rem] rounded-md border bg-white p-1 text-sm shadow-md"
        sideOffset={4}
      >
        {canEdit && onCreateChild && (
          <DropdownMenu.Item
            className="cursor-pointer px-2 py-1.5 hover:bg-gray-100 text-blue-600"
            onSelect={onCreateChild}
          >
            <Plus size={14} className="mr-2" />
            Crear Hijo
          </DropdownMenu.Item>
        )}
        {canEdit && onEdit && (
          <DropdownMenu.Item
            className="cursor-pointer px-2 py-1.5 hover:bg-gray-100 text-primary flex items-center gap-2"
            onSelect={onEdit}
          >
            <Pencil size={14} />
            Editar
          </DropdownMenu.Item>
        )}
        {onDownloadSummary && (
          <DropdownMenu.Item
            className="cursor-pointer px-2 py-1.5 hover:bg-gray-100 text-primary flex items-center gap-2"
            onSelect={onDownloadSummary}
          >
            <Download size={14} />
            Descargar Resumen
          </DropdownMenu.Item>
        )}
        {canEdit && (
          <DropdownMenu.Item
            className="w-full cursor-pointer px-2 py-1.5 hover:bg-gray-100 hover:border-none text-red-600 text-left flex items-center gap-2 focus:outline-none focus:ring-0 focus:border-none border-none"
            onSelect={onDelete}
          >
            <Trash2 size={14} />
            Eliminar
          </DropdownMenu.Item>
        )}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

export default MandalaMenu;
