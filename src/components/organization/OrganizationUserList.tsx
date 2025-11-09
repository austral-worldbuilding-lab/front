import { useState } from "react";
import useOrganizationUsers from "@/hooks/useOrganizationUsers";
import { Button } from "@/components/ui/button";
import ConfirmationDialog from "@/components/common/ConfirmationDialog";
import {
  removeOrganizationUser,
  updateOrganizationUserRole,
} from "@/services/userService";
import OrganizationUserRow from "./OrganizationUserRow";
import { Role } from "@/services/invitationService";
import { useAuthContext } from "@/context/AuthContext";
import { Trash2 } from "lucide-react";

interface OrganizationUserListProps {
  organizationId: string;
  canManage: boolean;
}

const OrganizationUserList = ({
  organizationId,
  canManage,
}: OrganizationUserListProps) => {
  const { users, loading, error, hasPermission, refetch } =
    useOrganizationUsers(organizationId);
  const { user } = useAuthContext();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const currentUserId = user?.uid;

  const onUpdateRole = async (userId: string, newRole: Role) => {
    setActionError(null);

    const targetUser = users.find((u) => u.id === userId);
    const isCurrentUser = currentUserId === userId;

    if (
      isCurrentUser &&
      targetUser &&
      ((targetUser.role === "dueño" && newRole !== "dueño") ||
        (targetUser.role === "facilitador" &&
          (newRole === "worldbuilder" || newRole === "lector")))
    ) {
      setActionError(
        "No puedes reducir tu propio rol de administrador. Solicita a otro administrador que cambie tu rol."
      );
      return;
    }

    try {
      setActionLoading(true);
      await updateOrganizationUserRole(organizationId, userId, newRole);
      await refetch();
    } catch (e: unknown) {
      const error = e as {
        response?: {
          status?: number;
          data?: { statusCode?: number; message?: string };
        };
        message?: string;
      };
      if (error.response?.status === 409) {
        setActionError(
          "Debe haber al menos un propietario en la organización."
        );
        return;
      }
      setActionError(
        error?.response?.data?.message ||
          error?.message ||
          "Error al actualizar el rol"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const onRemoveClick = (userId: string) => {
    if (currentUserId === userId) {
      setActionError("No puedes eliminarte a ti mismo de la organización.");
      return;
    }
    setSelectedUserId(userId);
    setConfirmOpen(true);
  };

  const onRemoveConfirm = async () => {
    if (!selectedUserId) return;

    setActionError(null);
    try {
      setActionLoading(true);
      await removeOrganizationUser(organizationId, selectedUserId);
      await refetch();
      setConfirmOpen(false);
      setSelectedUserId(null);
    } catch (e: unknown) {
      const error = e as {
        response?: {
          status?: number;
          data?: { statusCode?: number; message?: string };
        };
        message?: string;
      };
      if (error.response?.status === 409) {
        setActionError(
          "No se puede eliminar al último propietario de la organización."
        );
        return;
      }
      setActionError(
        error?.response?.data?.message ||
          error?.message ||
          "Error al eliminar el usuario"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const selectedUserName =
    users.find((u) => u.id === selectedUserId)?.username || "usuario";

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    if (!hasPermission) {
      return (
        <div className="text-center py-4">
          <p className="text-gray-600">
            Error al cargar usuarios de la organización
          </p>
        </div>
      );
    }

    return (
      <div className="text-center py-4">
        <p className="text-gray-600">Error al cargar usuarios</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {users.length} usuario{users.length !== 1 ? "s" : ""}
        </span>
      </div>

      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md">
          {actionError}
        </div>
      )}

      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
          >
            <OrganizationUserRow
              userId={user.id}
              name={user.username}
              email={user.email}
              initialRole={user.role as Role}
              isAdmin={canManage}
              isCurrentUser={currentUserId === user.id}
              onConfirm={onUpdateRole}
            />

            {canManage && currentUserId !== user.id && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveClick(user.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
                disabled={actionLoading}
                title="Eliminar usuario"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}

        {users.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No hay usuarios en esta organización.
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={onRemoveConfirm}
        title="Eliminar usuario"
        description={`¿Estás seguro de que deseas eliminar a ${selectedUserName} de la organización? Esta acción no se puede deshacer.`}
        isDanger={true}
      />
    </div>
  );
};

export default OrganizationUserList;
