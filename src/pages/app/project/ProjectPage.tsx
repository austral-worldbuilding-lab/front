import { Link, useParams } from "react-router-dom";
import { ArrowLeftIcon, Folder } from "lucide-react";
import useProject from "@/hooks/useProject.ts";
import UnifiedInvitationDialog from "@/components/project/UnifiedInvitationDialog";
import { useProjectPermissions } from "@/hooks/usePermissionsLoader";
import { ProvocationsSection } from "@/components/project/ProvocationsSection";
import ProjectFileListContainer from "@/components/project/ProjectFileListContainer";
import ProjectUserCircles from "@/components/project/ProjectUserCircles";
import MandalaListPage from "./mandala/MandalaListPage";
import AppLayout from "@/components/layout/AppLayout";

const ProjectPage = () => {
  const { projectId, organizationId } = useParams<{
    organizationId: string;
    projectId: string;
  }>();
  const { canManageUsers } = useProjectPermissions(projectId);
  const { project } = useProject(projectId!);

  return (
      <AppLayout>
      <div className="min-h-screen flex flex-col py-8 px-[150px] relative bg-[#F8FAFF]">
      <div className="absolute top-10 left-10">
        <Link to={`/app/organization/${organizationId}/projects`}>
          <ArrowLeftIcon size={20} />
        </Link>
      </div>

      <div className="w-full flex flex-col gap-6 flex-1">
        <div className="flex justify-between">
          <div className="flex flex-col gap-2">
            <Folder size={40} className="text-primary" />
            <h1 className="text-3xl font-bold">{project?.name || ""}</h1>
          </div>
          <div className="flex flex-col gap-2 items-end flex-1">
            <UnifiedInvitationDialog
              projectName={project?.name ?? "Proyecto"}
              projectId={projectId ?? ""}
              organizationId={organizationId ?? ""}
              defaultRole="member"
            />
            <ProjectUserCircles
              projectId={projectId ?? ""}
              canManageUsers={canManageUsers}
            />
          </div>
        </div>
        <div className="mt-4 flex flex-1 flex-row gap-6 justify-between w-full">
          <MandalaListPage />
          <ProjectFileListContainer projectId={projectId ?? ""} />
        </div>
        <ProvocationsSection
          organizationId={organizationId ?? ""}
          projectId={projectId ?? ""}
        />
      </div>
    </div>
      </AppLayout>
  );
};

export default ProjectPage;
