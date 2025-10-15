import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import ProvocationCard from "./ProvocationCard";
import type { Provocation } from "@/types/mandala";
import {useNavigate, useParams} from "react-router-dom";

export type ProvocationDialogProps = {
  onSave: (data: Omit<Provocation, "id">) => void;
};

export const ProvocationDialog = ({ onSave }: ProvocationDialogProps) => {
  const [open, setOpen] = useState(false);
  const { projectId, organizationId } = useParams<{
    organizationId: string;
    projectId: string;
  }>();
  const navigate = useNavigate();

    return (
        <div className="flex gap-2">
          <Button onClick={() => setOpen(true)} icon={<Plus/>} iconPosition="left">
            Nueva provocación
          </Button>
          <Button
              onClick={() =>
                  navigate(`/app/organization/${organizationId}/projects/${projectId}/solutions`)
              }
              color="secondary"
          >
            Soluciones
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
        </div>
    );
};
