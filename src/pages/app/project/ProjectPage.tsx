import { Link, useNavigate, useParams } from "react-router-dom";
import Loader from "@/components/common/Loader.tsx";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, Eye, FileText } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png";
import useProject from "@/hooks/useProject.ts";
import ProjectUserList from "@/components/project/ProjectUserList";
import UnifiedInvitationDialog from "@/components/project/UnifiedInvitationDialog";
import FilesDrawer from "@/components/project/FilesDrawer";

const ProjectPage = () => {
  const { projectId, organizationId } = useParams<{
    organizationId: string;
    projectId: string;
  }>();
  const navigate = useNavigate();

  const { project, loading: projectLoading } = useProject(projectId);
  const [drawerOpen, setDrawerOpen] = useState(false);


  if (projectLoading) {
    return (
        <div className="flex items-center justify-center h-screen">
          <Loader size="large" text="Cargando proyecto..." />
        </div>
    );
  }


  return (
      <div className="p-6 min-h-screen flex flex-col justify-center items-center relative">
        <div className="absolute top-10 left-10">
          <Link to={`/app/organization/${organizationId}/projects`}>
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
        </div>

        <div className="flex flex-col items-center justify-center w-full max-w-lg gap-4 mb-10">
          <img src={logo} alt="logo" className="w-50 h-auto" />
          <h1 className="text-xl sm:text-2xl font-bold text-center break-words">
            Proyecto: {project?.name}
          </h1>

          <div className="w-full flex flex-col gap-2">
            <h2 className="text-base font-semibold mb-1">Descripción</h2>

            <div className="text-sm leading-6 whitespace-pre-wrap break-words italic">
              {project?.description && project?.description.trim().length > 0
                  ? project.description
                  : "No hay detalles agregados."}
            </div>

            <Button
                variant="outline"
                onClick={() => setDrawerOpen(true)}
                icon={<FileText size={16} />}
                className="self-end mt-2"
            >
              Archivos del proyecto
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-start justify-start max-w-lg w-full">
          <div className="flex gap-3 mb-10">
            <Button
                color="primary"
                onClick={() =>
                    navigate(
                        `/app/organization/${organizationId}/projects/${projectId}/mandalas`
                    )
                }
                icon={<Eye size={16} />}
            >
              Ver Mandalas
            </Button>

          {projectId && organizationId && (
            <UnifiedInvitationDialog
                projectId={projectId}
                organizationId={organizationId}
                projectName={project?.name ?? "Proyecto"}
                defaultRole="member"
            />
          )}
        </div>

          <div className="w-full overflow-y-auto border rounded-lg p-4 shadow bg-white mt-6">
            <h2 className="text-lg font-bold mb-4">Usuarios del proyecto</h2>
            <ProjectUserList projectId={projectId!} canManage={true} />
          </div>
        </div>

      <FilesDrawer
          id={projectId!}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="Archivos del proyecto"
          scope="project"
      />
    </div>
  );
};

export default ProjectPage;
