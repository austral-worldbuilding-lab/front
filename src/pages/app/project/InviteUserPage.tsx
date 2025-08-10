// pages/InviteUserPage.tsx
import { ArrowLeftIcon } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import InviteUserForm from "@/components/project/InviteUserForm";
import useProject from "@/hooks/useProject";
import Loader from "@/components/common/Loader";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const InviteUserPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { project, loading } = useProject(projectId);

  const [successOpen, setSuccessOpen] = useState(false);
  const [conflictOpen, setConflictOpen] = useState(false); // 👈 409
  const [conflictMsg, setConflictMsg] = useState<string | undefined>(undefined);

  if (!projectId) return <div>Error: Project ID not found</div>;
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader size="large" text="Cargando proyecto..." />
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen flex flex-col items-center relative">
      <div className="absolute top-10 left-10">
        <Link to={`/app/project/${projectId}`}>
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
      </div>

      <div className="w-full max-w-lg space-y-6">
        <h1 className="text-xl sm:text-2xl font-bold text-center">
          Invitar miembros — {project?.name}
        </h1>

        <div className="border rounded-lg p-4 shadow bg-white">
          <InviteUserForm
            projectId={projectId}
            onSuccess={() => setSuccessOpen(true)}
            onError={(status, message) => {
              if (status === 409) {
                setConflictMsg(
                  message ||
                    "Ya existe una invitación pendiente para ese usuario."
                );
                setConflictOpen(true);
              }
            }}
          />
        </div>
      </div>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invitación enviada</DialogTitle>
            <DialogDescription>
              Se envió la invitación correctamente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => {
                setSuccessOpen(false);
                navigate(`/app/project/${projectId}`);
              }}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={conflictOpen} onOpenChange={setConflictOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invitación existente</DialogTitle>
            <DialogDescription>
              {conflictMsg ||
                "Ya existe una invitación para ese usuario en este proyecto."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setConflictOpen(false)}>Entendido</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InviteUserPage;
