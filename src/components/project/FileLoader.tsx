import { Button } from "@/components/ui/button";
import { useUploadFiles, ACCEPTED_TYPES } from "@/hooks/useUploadFiles";
import { CloudUpload, Upload } from "lucide-react";

interface FileUploaderProps {
    scope: 'organization' | 'project' | 'mandala';
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
  } = useUploadFiles(scope, id, onUploadComplete);

  const handleTriggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mb-4 space-y-4">
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
          variant="outline"
          color="tertiary"
          onClick={handleTriggerFileSelect}
          icon={<Upload size={16} />}
        >
          Elegir archivos
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
                  onClick={uploadFiles}
                  loading={loading}
                  color="primary"
                  icon={<CloudUpload size={16} />}
              >
                Subir archivos
              </Button>
            </>
        )}

        {status && <p className="text-sm text-gray-700">{status}</p>}
      </div>
  );
};

export default FileLoader;
