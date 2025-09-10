import { useState } from "react";
import useProjectUsers from "@/hooks/useProjectUsers";
import { Button } from "@/components/ui/button";
import ConfirmationDialog from "@/components/common/ConfirmationDialog";
import { removeProjectUser } from "@/services/userService";
import axiosInstance from "@/lib/axios";
import ProjectUserRow from "./ProjectUserRow";
import { Role } from "@/services/invitationService";
import { useAuthContext } from "@/context/AuthContext";
import { isRoleDemotion } from "@/utils/roleUtils";

interface ProjectUserListProps {
  projectId: string;
  canManage: boolean;
}

const ProjectUserList = ({ projectId, canManage }: ProjectUserListProps) => {
  const { users, loading, error, refetch } = useProjectUsers(projectId);
  const { user } = useAuthContext();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  
  const currentUserId = user?.uid;

  const onUpdateRole = async (userId: string, newRole: Role) => {
    setActionError(null);
    
    const targetUser = users.find(u => u.id === userId);
    const isCurrentUser = currentUserId === userId;
    
    if (isCurrentUser && targetUser && isRoleDemotion(targetUser.role as Role, newRole)) {
      setActionError("No puedes reducir tu propio rol de administrador. Solicita a otro administrador que cambie tu rol.");
      return;
    }
    
    try {
      await axiosInstance.put(`/project/${projectId}/users/${userId}/role`, {
        role: newRole,
      });
      await refetch();
    } catch (e: unknown) {
      const error = e as { response?: { status?: number; data?: { statusCode?: number; message?: string } }; message?: string };
      console.log(error.response?.data?.statusCode);
      if (error.response?.status === 409) {
        setActionError("Debe haber al menos un dueño en un proyecto.");
        return;
      }
      setActionError(error?.response?.data?.message || error?.message || "Error al actualizar el rol");
    }
  };

  const onDelete = async () => {
    if (!selectedUserId) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await removeProjectUser(projectId, selectedUserId);
      await refetch();
    } catch (e: unknown) {
      const error = e as { message?: string };
      setActionError(error?.message ?? "Error al eliminar el usuario");
    } finally {
      setActionLoading(false);
      setSelectedUserId(null);
    }
  };

  if (loading) return <div className="p-3">Cargando usuarios...</div>;
  if (error && error.includes("404")) {
    return (
      <div className="p-3 text-muted-foreground">
        No hay otros usuarios en este proyecto.
      </div>
    );
  }
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
            isCurrentUser={currentUserId === u.id}
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
