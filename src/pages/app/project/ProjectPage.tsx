import { useParams } from "react-router-dom";

const ProjectPage = () => {
  const { projectId } = useParams();
  return (
    <div>
      <h1>ProjectPage</h1>
      <p>Project ID: {projectId}</p>
    </div>
  );
};

export default ProjectPage;
