import useProjectUsers from "@/hooks/useProjectUsers";

interface ProjectUserListProps {
  projectId: string;
}

const ProjectUserList = ({ projectId }: ProjectUserListProps) => {
  const { users, loading, error } = useProjectUsers(projectId);

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
        <div
          key={u.id}
          className="flex items-center justify-between border rounded-md p-3"
        >
          <div>
            <div className="font-medium">{u.name ?? u.username ?? u.email}</div>
            <div className="text-sm text-muted-foreground">{u.email}</div>
          </div>
          <div>
            <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
              {u.role}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectUserList; 