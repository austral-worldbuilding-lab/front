import { Link, useNavigate, useParams } from "react-router-dom";
import FileList from "@/components/project/FileList";
import FileLoader from "@/components/project/FileLoader";
import Loader from "@/components/common/Loader.tsx";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, Eye, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { getProjectFiles, ProjectFile } from "@/services/filesService.ts";
import logo from "@/assets/logo.png";
import useProject from "@/hooks/useProject.ts";
import ProjectUserList from "@/components/project/ProjectUserList";

const ProjectPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { project, loading: projectLoading } = useProject(projectId);

  const fetchFiles = () => {
    if (!projectId) return;
    setLoading(true);
    getProjectFiles(projectId)
      .then((result) => setFiles(result || []))
      .catch(() => setError("Error getting files"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFiles();
  }, [projectId]);

  if (projectLoading) {
    return (
        <div className="flex items-center justify-center h-screen">
          <Loader size="large" text="Cargando proyecto..."/>
        </div>
    );
  }

  if (!projectId) {
    return <div>Error: Project ID not found</div>;
  }

  return (
      <div className="p-6 min-h-screen flex flex-col justify-center items-center relative">
      <div className="absolute top-10 left-10">
        <Link to={`/app/project/`}>
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
      </div>
      <div className="flex flex-col items-center justify-center w-full max-w-lg gap-4 mb-10">
        <img src={logo} alt="logo" className="w-50 h-auto" />
        <h1 className="text-xl sm:text-2xl font-bold text-center break-words">
          Proyecto: {project?.name}
        </h1>
      </div>
      <div className="flex flex-col items-start justify-start max-w-lg w-full">
        <div className="flex gap-3 mb-10">
          <Button
            color="primary"
            onClick={() => navigate(`/app/project/${projectId}/mandalas`)}
            icon={<Eye size={16} />}
          >
            Ver Mandalas
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/app/project/${projectId}/invite`)}
            icon={<UserPlus size={16} />}
            aria-label="Invitar miembros al proyecto"
          >
            Invitar
          </Button>
        </div>
        <div className="w-full overflow-y-auto border rounded-lg p-4 shadow bg-white">
          <div className="flex justify-between items-start">
            <h2 className="text-lg font-bold mb-4">Archivos del proyecto</h2>
            <FileLoader onUploadComplete={fetchFiles} projectId={projectId} />
          </div>
          <FileList files={files} loading={loading} error={error} />
        </div>

        <div className="w-full overflow-y-auto border rounded-lg p-4 shadow bg-white mt-6">
          <h2 className="text-lg font-bold mb-4">Usuarios del proyecto</h2>
          <ProjectUserList projectId={projectId} isAdmin />
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;
