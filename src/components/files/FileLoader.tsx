import { Button } from "@/components/ui/button";
import { useUploadFiles, ACCEPTED_TYPES } from "@/hooks/useUploadFiles";
import { Upload } from "lucide-react";
import { useState } from "react";
import ConfirmationDialog from "@/components/common/ConfirmationDialog.tsx";
import SelectedFilesDropdown from "./SelectedFilesDropdown";

interface FileUploaderProps {
  scope: "organization" | "project" | "mandala";
  id: string;
  onUploadComplete?: () => void;
}

const FileLoader = ({ scope, id, onUploadComplete }: FileUploaderProps) => {
  const {
    fileInputRef,
    selectedFiles,
    loading,
    handleFileChange,
    uploadFiles,
    videoWarning,
    setVideoWarning,
    clearSelectedFiles,
  } = useUploadFiles(scope, id, onUploadComplete);

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleTriggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleConfirmUpload = () => {
    uploadFiles();
    setVideoWarning(null);
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        multiple
        accept={ACCEPTED_TYPES.join(",")}
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="relative">
        <Button
          type="button"
          variant="filled"
          color="primary"
          onClick={handleTriggerFileSelect}
          icon={<Upload size={16} />}
        >
          Cargar archivos
        </Button>

        {selectedFiles.length > 0 && (
          <SelectedFilesDropdown
            selectedFiles={selectedFiles}
            loading={loading}
            videoWarning={videoWarning}
            onUpload={uploadFiles}
            onOpenDialog={() => setDialogOpen(true)}
            onClear={clearSelectedFiles}
          />
        )}
      </div>

      <ConfirmationDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Advertencia"
        description={
          videoWarning ||
          "Del video seleccionado se utilizará únicamente el audio, el cual será extraido como base de contexto para la IA."
        }
        confirmText="Entendido"
        cancelText="Cancelar"
        onConfirm={handleConfirmUpload}
      />
    </div>
  );
};

export default FileLoader;
