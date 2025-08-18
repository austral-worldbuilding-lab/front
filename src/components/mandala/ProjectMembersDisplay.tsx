import useProjectUsers from "@/hooks/useProjectUsers";

interface ProjectMembersDisplayProps {
  projectId: string;
}

const ProjectMembersDisplay = ({ projectId }: ProjectMembersDisplayProps) => {
  const { users, loading, error } = useProjectUsers(projectId);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Cargando miembros...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-600">Error al cargar miembros</div>;
  }

  if (users.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No hay miembros en este proyecto.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-900">Miembros del proyecto</h4>
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between text-sm py-1"
          >
            <span className="font-medium">
              {user.name ?? user.username ?? user.email}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
              {user.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectMembersDisplay; 