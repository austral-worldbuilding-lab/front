import { Button } from "@/components/ui/button";
import { useUploadFiles, ACCEPTED_TYPES } from "@/hooks/useUploadFiles";
import { CloudUpload, Upload } from "lucide-react";
import { useState } from "react";
import ConfirmationDialog from "@/components/common/ConfirmationDialog.tsx";

interface FileUploaderProps {
  scope: "organization" | "project" | "mandala";
  id: string;
  onUploadComplete?: () => void;
}

const FileLoader = ({ scope, id, onUploadComplete }: FileUploaderProps) => {
  const {
    fileInputRef,
    selectedFiles,
    status,
    loading,
    handleFileChange,
    uploadFiles,
    videoWarning,
    setVideoWarning,
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
        <>
          <div className="text-sm text-gray-600">
            {selectedFiles.length <= 5 ? (
              <ul className="list-disc pl-5">
                {selectedFiles.map((file, idx) => (
                  <li key={idx}>{file.name}</li>
                ))}
              </ul>
            ) : (
              <p>{selectedFiles.length} files selected</p>
            )}
          </div>

          <Button
            onClick={() => {
              if (videoWarning) {
                setDialogOpen(true);
              } else {
                uploadFiles();
              }
            }}
            loading={loading}
            color="primary"
            icon={<CloudUpload size={16} />}
          >
            Subir archivos
          </Button>
        </>
      )}

      {status && <p className="text-sm text-gray-700">{status}</p>}
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
