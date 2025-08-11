import useProjectUsers from "@/hooks/useProjectUsers";
import ProjectUserRow from "./ProjectUserRow";
import axiosInstance from "@/lib/axios";

export type Role = "admin" | "member";

interface ProjectUserListProps {
  projectId: string;
  isAdmin?: boolean;
}

export default function ProjectUserList({
  projectId,
  isAdmin,
}: ProjectUserListProps) {
  const { users, loading, error } = useProjectUsers(projectId);

  const onUpdateRole = async (userId: string, newRole: Role) => {
    await axiosInstance.patch(`/projects/${projectId}/users/${userId}`, {
      role: newRole,
    });
  };

  if (loading) {
    return <div className="p-3">Cargando usuarios...</div>;
  }

  if (error) {
    return <div className="p-3 text-red-600">{error}</div>;
  }

  if (users.length === 0) {
    return (
      <div className="p-3 text-muted-foreground">
        No hay usuarios en este proyecto.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {users.map((u) => (
        <ProjectUserRow
          key={u.id}
          userId={u.id}
          name={u.name ?? u.username ?? u.email}
          email={u.email}
          initialRole={u.role as Role}
          isAdmin={isAdmin}
          onConfirm={onUpdateRole}
        />
      ))}
    </div>
  );
}
