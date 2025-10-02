import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import OrganizationUserList from "./OrganizationUserList";

interface OrganizationUserModalProps {
  open: boolean;
  onClose: () => void;
  organizationId: string;
  canManage: boolean;
}

const OrganizationUserModal = ({
  open,
  onClose,
  organizationId,
  canManage,
}: OrganizationUserModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl min-w-xl max-h-[80vh] overflow-y-auto w-fit">
        <DialogHeader>
          <DialogTitle>Usuarios de la organización</DialogTitle>
        </DialogHeader>
        <OrganizationUserList
          organizationId={organizationId}
          canManage={canManage}
        />
      </DialogContent>
    </Dialog>
  );
};

export default OrganizationUserModal;
