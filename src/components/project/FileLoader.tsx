import { Button } from "@/components/ui/button";
import { useUploadFiles, ACCEPTED_TYPES } from "@/hooks/useUploadFiles";
import { CloudUpload, Upload } from "lucide-react";

interface FileUploaderProps {
  projectId: string;
  onUploadComplete: () => void;
}

const FileLoader = ({ projectId, onUploadComplete }: FileUploaderProps) => {
  const {
    fileInputRef,
    selectedFiles,
    status,
    loading,
    handleFileChange,
    uploadFiles,
  } = useUploadFiles(projectId, onUploadComplete);

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

      <div className="flex items-start gap-2">
        <Button
          type="button"
          variant="outline"
          color="tertiary"
          onClick={handleTriggerFileSelect}
          icon={<Upload size={16} />}
        >
          Choose Files
        </Button>

        <Button
          onClick={uploadFiles}
          loading={loading}
          color="primary"
          disabled={selectedFiles.length === 0}
          icon={<CloudUpload size={16} />}
        >
          Upload Files
        </Button>
      </div>

      {selectedFiles.length > 0 && (
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
      )}

      {status && <p className="text-sm text-gray-700">{status}</p>}
    </div>
  );
};

export default FileLoader;
