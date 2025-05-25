import { useNavigate, useParams } from "react-router-dom";
import FileList from "@/components/project/FileList";
import FileLoader from "@/components/project/FileLoader";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

const ProjectPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

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
      >
        <Eye className="mr-2" />
        Ver mandalas
      </Button>
      <div className="max-w-md w-full overflow-y-auto border rounded-lg p-4 shadow bg-white">
        <h2 className="text-lg font-bold mb-4">Files</h2>
        <FileLoader projectId={projectId} onUploadComplete={() => {}} />
        <FileList projectId={projectId} />
      </div>
    </div>
  );
};

export default ProjectPage;
