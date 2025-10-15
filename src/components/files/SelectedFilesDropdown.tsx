import { Button } from "@/components/ui/button";
import { CloudUpload, X } from "lucide-react";

interface SelectedFilesDropdownProps {
  selectedFiles: File[];
  loading: boolean;
  videoWarning: string | null;
  onUpload: () => void;
  onOpenDialog: () => void;
  onClear: () => void;
}

const SelectedFilesDropdown = ({
  selectedFiles,
  loading,
  videoWarning,
  onUpload,
  onOpenDialog,
  onClear,
}: SelectedFilesDropdownProps) => {
  const handleUploadClick = () => {
    if (videoWarning) {
      onOpenDialog();
    } else {
      onUpload();
    }
  };

  return (
    <div className="absolute top-full mt-2 right-0 w-96 border border-gray-300 rounded-lg bg-white shadow-lg z-50">
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-900">
            {selectedFiles.length}{" "}
            {selectedFiles.length === 1
              ? "archivo seleccionado"
              : "archivos seleccionados"}
          </div>
          <button
            onClick={onClear}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Cancelar y eliminar archivos seleccionados"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-60 overflow-y-auto">
          <ul className="space-y-1 text-sm text-gray-600">
            {selectedFiles.map((file, idx) => (
              <li key={idx} className="line-clamp-1 px-2 py-1 rounded">
                {file.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-2 border-t">
          <Button
            onClick={handleUploadClick}
            loading={loading}
            color="secondary"
            icon={<CloudUpload size={16} />}
            className="w-full"
          >
            Subir archivos
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectedFilesDropdown;
