import { useState } from "react";
import useProjectUsers from "@/hooks/useProjectUsers";
import { Button } from "@/components/ui/button";
import ConfirmationDialog from "@/components/common/ConfirmationDialog";
import { removeProjectUser } from "@/services/userService";
import axiosInstance from "@/lib/axios";
import ProjectUserRow from "./ProjectUserRow";
import { Role } from "@/services/invitationService";

interface ProjectUserListProps {
  projectId: string;
  canManage: boolean;
}

const ProjectUserList = ({ projectId, canManage }: ProjectUserListProps) => {
  const { users, loading, error, refetch } = useProjectUsers(projectId);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const onUpdateRole = async (userId: string, newRole: Role) => {
    setActionError(null);
    try {
      await axiosInstance.patch(`/projects/${projectId}/users/${userId}`, {
        role: newRole,
      });
      await refetch();
    } catch (e: any) {
      setActionError(e?.message ?? "Error al actualizar el rol");
    }
  };

  const onDelete = async () => {
    if (!selectedUserId) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await removeProjectUser(projectId, selectedUserId);
      await refetch();
    } catch (e: any) {
      setActionError(e?.message ?? "Error al eliminar el usuario");
    } finally {
      setActionLoading(false);
      setSelectedUserId(null);
    }
  };

  if (loading) return <div className="p-3">Cargando usuarios...</div>;
  if (error) return <div className="p-3 text-red-600">{error}</div>;
  if (users.length === 0) {
    return (
      <div className="p-3 text-muted-foreground">
        No hay usuarios en este proyecto.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {actionError && <div className="text-red-600 text-sm">{actionError}</div>}

      {users.map((u) => (
        <div
          key={u.id}
          className="flex items-center justify-between border rounded-md p-3"
        >
          <ProjectUserRow
            userId={u.id}
            name={u.name ?? u.username ?? u.email}
            email={u.email}
            initialRole={u.role as Role}
            isAdmin={canManage}
            onConfirm={onUpdateRole}
          />

          {canManage && (
            <Button
              variant="outline"
              color="danger"
              loading={actionLoading && selectedUserId === u.id}
              onClick={() => {
                setSelectedUserId(u.id);
                setConfirmOpen(true);
              }}
            >
              Eliminar
            </Button>
          )}
        </div>
      ))}

      <ConfirmationDialog
        isOpen={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Eliminar usuario"
        description="Esta acción eliminará al usuario del proyecto. ¿Continuar?"
        confirmText="Eliminar"
        isDanger
        onConfirm={onDelete}
      />
    </div>
  );
};

export default ProjectUserList;
