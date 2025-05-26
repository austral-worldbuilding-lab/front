import { useNavigate, useParams } from "react-router-dom";
import FileList from "@/components/project/FileList";
import FileLoader from "@/components/project/FileLoader";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { getProjectFiles, ProjectFile } from "@/services/filesService.ts";

const ProjectPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFiles = () => {
    if (!projectId) return;
    setLoading(true);
    getProjectFiles(projectId)
      .then((result) => setFiles(result || []))
      .catch(() => setError("Error al cargar los archivos"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFiles();
  }, [projectId]);

  if (!projectId) {
    return <div>Error: Project ID not found</div>;
  }

  return (
    <div className="p-6 min-h-screen flex flex-col justify-center items-center">
      <h1 className="text-2xl font-bold mb-10">Project {projectId}</h1>
      <Button
        color="primary"
        className="mb-10"
        onClick={() => {
          navigate(`/app/project/${projectId}/mandalas`);
        }}
        icon={<Eye size={16} />}
      >
        View Mandalas
      </Button>
      <div className="max-w-md w-full overflow-y-auto border rounded-lg p-4 shadow bg-white">
        <div className="flex justify-between items-start">
          <h2 className="text-lg font-bold mb-4">Files</h2>
          <FileLoader onUploadComplete={fetchFiles} projectId={projectId} />
        </div>
        <FileList files={files} loading={loading} error={error} />
      </div>
    </div>
  );
};

export default ProjectPage;
