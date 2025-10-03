import { useState } from "react";
import {
  Download,
  Trash2,
  MoreHorizontal,
  FileText,
  File,
  FileSpreadsheet,
  FileJson,
  Image as ImageIcon,
  FileAudio,
  Clapperboard,
  Presentation,
} from "lucide-react";
import { AcceptedTypes } from "@/hooks/useUploadFiles";
import { FileItem } from "@/types/mandala";
import { useFiles } from "@/hooks/useFiles";
import { FileScope } from "@/services/filesService";
import ConfirmationDialog from "@/components/common/ConfirmationDialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "../ui/button";

interface FileRowMenuProps {
  handleDownload: () => void;
  canDelete: boolean;
  handleDeleteClick: () => void;
  isDeleting: boolean;
}

interface FileRowProps {
  file: FileItem;
  scope: FileScope;
  id: string;
}

const FileRowMenu = ({
  handleDownload,
  canDelete,
  handleDeleteClick,
  isDeleting,
}: FileRowMenuProps) => {
  return (
    <div className="flex items-center gap-3">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button
            aria-label="Opciones"
            variant="ghost"
            icon={<MoreHorizontal size={16} className="text-gray-500" />}
          ></Button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content
          className="z-50 min-w-[8rem] rounded-md border bg-white p-1 text-sm shadow-md"
          sideOffset={4}
        >
          <DropdownMenu.Item
            className="cursor-pointer px-2 py-1.5 hover:bg-gray-100 text-gray-600 flex items-center gap-2"
            onSelect={handleDownload}
          >
            <Download className="w-4 h-4" />
            Descargar
          </DropdownMenu.Item>

          {canDelete && (
            <DropdownMenu.Item
              className="cursor-pointer px-2 py-1.5 hover:bg-gray-100 text-red-600 flex items-center gap-2"
              onSelect={handleDeleteClick}
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  );
};

const HandleFileIcon = ({ filetype }: { filetype: AcceptedTypes }) => {
  const size = 20;
  const color = "text-gray-500";
  const strokeWidth = 1.5;
  switch (filetype) {
    case "application/pdf":
      return (
        <FileText size={size} className={color} strokeWidth={strokeWidth} />
      );
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return (
        <FileText size={size} className={color} strokeWidth={strokeWidth} />
      );
    case "text/plain":
      return (
        <FileText size={size} className={color} strokeWidth={strokeWidth} />
      );
    case "text/csv":
      return (
        <FileSpreadsheet
          size={size}
          className={color}
          strokeWidth={strokeWidth}
        />
      );
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return (
        <FileSpreadsheet
          size={size}
          className={color}
          strokeWidth={strokeWidth}
        />
      );
    case "application/json":
      return (
        <FileJson size={size} className={color} strokeWidth={strokeWidth} />
      );
    case "image/png":
      return (
        <ImageIcon size={size} className={color} strokeWidth={strokeWidth} />
      );
    case "image/jpeg":
      return (
        <ImageIcon size={size} className={color} strokeWidth={strokeWidth} />
      );
    case "image/webp":
      return (
        <ImageIcon size={size} className={color} strokeWidth={strokeWidth} />
      );
    case "audio/mp3":
      return (
        <FileAudio size={size} className={color} strokeWidth={strokeWidth} />
      );
    case "video/mp4":
      return (
        <Clapperboard size={size} className={color} strokeWidth={strokeWidth} />
      );
    case "video/mov":
      return (
        <Clapperboard size={size} className={color} strokeWidth={strokeWidth} />
      );
    case "audio/wav":
      return (
        <FileAudio size={size} className={color} strokeWidth={strokeWidth} />
      );
    case "audio/m4a":
      return (
        <FileAudio size={size} className={color} strokeWidth={strokeWidth} />
      );
    case "video/m4v":
      return (
        <Clapperboard size={size} className={color} strokeWidth={strokeWidth} />
      );
    case "video/m4a":
      return (
        <Clapperboard size={size} className={color} strokeWidth={strokeWidth} />
      );
    case "video/quicktime":
      return (
        <Clapperboard size={size} className={color} strokeWidth={strokeWidth} />
      );
    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      return (
        <Presentation size={size} className={color} strokeWidth={strokeWidth} />
      );
  }
  return <File size={size} className={color} strokeWidth={strokeWidth} />;
};

const FileRow = ({ file, scope, id }: FileRowProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { removeFile, updateSelections, isDeleting, isUpdatingSelections } =
    useFiles(scope, id, false);

  const handleDeleteClick = () => {
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await removeFile(file.file_name);
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Error deleting file:", err);
    }
  };

  const handleDownload = async () => {
    const response = await fetch(file.url);
    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = file.file_name;
    link.click();
  };

  const toggleFile = async () => {
    try {
      const newSelectedState = !file.selected;
      const sourceScope =
        file.source_scope === "organization" ? "org" : file.source_scope;
      await updateSelections([
        {
          fileName: file.file_name,
          selected: newSelectedState,
          sourceScope: sourceScope,
        },
      ]);
    } catch (err) {
      console.error("Error updating file selection:", err);
    }
  };

  const canDelete = file.source_scope === scope;

  return (
    <>
      <li className="flex items-center justify-between gap-2 p-3">
        <div className="flex items-center gap-3 flex-1 overflow-hidden">
          <Checkbox
            className="w-5 h-5"
            checked={file.selected}
            onCheckedChange={toggleFile}
            disabled={isUpdatingSelections}
          />
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="h-8 w-8 flex items-center justify-center">
              {file.file_type.includes("image") ? (
                <img
                  src={file.url}
                  alt={file.file_name}
                  className="h-8 w-8 object-cover rounded-sm"
                />
              ) : (
                <HandleFileIcon filetype={file.file_type} />
              )}
            </div>
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:underline text-sm line-clamp-2 flex-1 overflow-ellipsis"
            >
              {file.file_name}
            </a>
          </div>
        </div>

        <FileRowMenu
          handleDownload={handleDownload}
          canDelete={canDelete}
          handleDeleteClick={handleDeleteClick}
          isDeleting={isDeleting}
        />
      </li>

      <ConfirmationDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title="Eliminar archivo"
        description={`¿Estás seguro de que querés eliminar el archivo "${file.file_name}"?`}
        isDanger
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default FileRow;
