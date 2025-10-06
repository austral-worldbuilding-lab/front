import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import ProvocationCard from "./ProvocationCard";
import type { Provocation } from "@/types/mandala";

export type ProvocationDialogProps = {
  onSave: (data: Omit<Provocation, "id">) => void;
};

export const ProvocationDialog = ({ onSave }: ProvocationDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} icon={<Plus />} iconPosition="left">
        Nueva provocación
      </Button>

      {open && (
        <ProvocationCard
          open={open}
          provocation={null}
          onClose={() => setOpen(false)}
          onNavigate={() => null}
          onSave={(data) => {
            onSave(data);
            setOpen(false);
          }}
        />
      )}
    </>
  );
};
