import { useParams } from "react-router-dom";
import FileList from "../../../components/project/FileList";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const ProjectPage = () => {
  const { projectId } = useParams();
  const [showFiles, setShowFiles] = useState(false);

  if (!projectId) {
    return <div>Error: Project ID not found</div>;
  }

  return (
    <div>
      <h1>ProjectPage</h1>
      <p>Project ID: {projectId}</p>
        <div className="flex gap-2">
            <Button
                onClick={() => setShowFiles(!showFiles)}
                variant="filled"
                color="primary"
            >
                {showFiles ? "Ocultar archivos" : "Ver archivos"}
            </Button>
            {showFiles && projectId && (
                <div className=" max-w-sm bg-white p-4 rounded shadow overflow-y-auto max-h-[400px]">
                    <FileList projectId={projectId} />
                </div>
            )}
        </div>
    </div>
  );
};

export default ProjectPage;
