import { useParams } from "react-router-dom";
import FilePopOver from '@/components/file/FilePopOver';

const ProjectPage = () => {
  const { projectId } = useParams();

  if (!projectId) {
    return <div>Error: Project ID not found</div>;
  }

  return (
    <div>
      <h1>ProjectPage</h1>
      <p>Project ID: {projectId}</p>
        {projectId && <FilePopOver projectId={projectId} />}
    </div>
  );
};

export default ProjectPage;
