import { useParams } from "react-router-dom";
import FileList from '@/components/project/FileList';
import FileLoader from "@/components/project/FileLoader";

const ProjectPage = () => {
  const { projectId } = useParams();


  if (!projectId) {
    return <div>Error: Project ID not found</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Project Page</h1>
      <p className="mb-4 text-gray-600">Project ID: {projectId}</p>
      <div className="max-w-md w-full overflow-y-auto border rounded-lg p-4 shadow bg-white">
        <FileList projectId={projectId} />
        <FileLoader projectId={projectId} onUploadComplete={() => { }} />
      </div>
    </div>
  );
};

export default ProjectPage;
