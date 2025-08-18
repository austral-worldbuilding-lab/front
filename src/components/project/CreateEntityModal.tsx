import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";

interface CreateEntityModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
  loading: boolean;
  error?: string | null;
  title: string;
  placeholder: string;
}

const CreateEntityModal = ({
  open,
  onClose,
  onCreate,
  loading,
  error,
  title,
  placeholder,
}: CreateEntityModalProps) => {
  const [name, setName] = useState("");

  if (!open) return null;

  const handleOnClose = () => {
    setName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        <Input
            className="border rounded p-2 w-full mb-4"
          placeholder={placeholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            color="tertiary"
            onClick={handleOnClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            color="primary"
            onClick={() => onCreate(name)}
            disabled={loading || !name.trim()}
            loading={loading}
          >
            {loading ? "Creando" : "Crear"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateEntityModal;
