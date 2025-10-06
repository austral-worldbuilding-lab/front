import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProjectUserList from "./ProjectUserList";

interface ProjectUserModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  canManage: boolean;
}

const ProjectUserModal = ({
  open,
  onClose,
  projectId,
}: ProjectUserModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl min-w-xl max-h-[80vh] overflow-y-auto w-fit">
        <DialogHeader>
          <DialogTitle>Usuarios del proyecto</DialogTitle>
        </DialogHeader>
        <ProjectUserList projectId={projectId} />
      </DialogContent>
    </Dialog>
  );
};

export default ProjectUserModal;
