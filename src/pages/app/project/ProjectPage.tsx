import { Link, useNavigate, useParams } from "react-router-dom";
import Loader from "@/components/common/Loader.tsx";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftIcon,
  ExternalLink,
  Eye,
  FileText,
  Folder,
  Pencil,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import logo from "@/assets/logo.png";
import useProject from "@/hooks/useProject.ts";
import ProjectUserList from "@/components/project/ProjectUserList";
import UnifiedInvitationDialog from "@/components/project/UnifiedInvitationDialog";
import FilesDrawer from "@/components/project/FilesDrawer";
import ProvocationBox from "@/components/project/ProvocationBox.tsx";
import ProvocationCard from "@/components/project/ProvocationCard.tsx";
import { Provocation } from "@/types/mandala";
import { useProjectPermissions } from "@/hooks/usePermissionsLoader";
import useProvocations from "@/hooks/useProvocations.ts";
import CreateEntityModal from "@/components/project/CreateEntityModal.tsx";
import useUpdateProject from "@/hooks/useUpdateProject.ts";
import TimelineTree from "@/components/project/TimelineTree.tsx";
import useTimeline from "@/hooks/useTimeline.ts";
import CreatedWorldsModal from "@/components/project/CreatedWorldsModal.tsx";
import OrganizationUserCircles from "@/components/organization/OrganizationUserCircles";
import { ProvocationsSection } from "@/components/project/ProvocationsSection";

const ProjectPage = () => {
  const { projectId, organizationId } = useParams<{
    organizationId: string;
    projectId: string;
  }>();
  const navigate = useNavigate();
  const { canManageUsers } = useProjectPermissions(projectId);

  const {
    project,
    setProject,
    loading: projectLoading,
  } = useProject(projectId!);

  const {
    update,
    loading: updating,
    error: updateError,
  } = useUpdateProject((updated) => {
    setProject(updated);
    setEditing(false);
  });
  const { data: timelineData, loading: timelineLoading } = useTimeline(
    projectId!
  );

  const {
    provocations,
    loading: provLoading,
    error: provError,
    generateAI,
    createManual,
    reload,
  } = useProvocations(projectId!);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [provBoxOpen, setProvBoxOpen] = useState(false);
  const [selectedProvocation, setSelectedProvocation] =
    useState<Provocation | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  // Estados de modales
  const [provocationOpen, setProvocationOpen] = useState(false);
  const [worldsOpen, setWorldsOpen] = useState(false);

  useEffect(() => {
    reload();
  }, [projectId]);

  const handleCloseAll = () => {
    // Cerrar todos los modales y resetear provocación
    setSelectedProvocation(null);
    setProvocationOpen(false);
    setWorldsOpen(false);
  };

  const handleBackToProvocation = () => {
    // Cerrar CreatedWorlds y volver a ProvocationCard
    setWorldsOpen(false);
    setProvocationOpen(true);
  };

  const handleNavigate = () => {
    // Cerrar todos los modales y resetear al navegar a otro mundo
    setSelectedProvocation(null);
    setProvocationOpen(false);
    setWorldsOpen(false);
    setProvBoxOpen(false);
  };

  return (
    <div className="h-screen flex flex-col py-8 px-[150px] relative bg-[#F8FAFF] overflow-hidden">
      <div className="absolute top-10 left-10">
        <Link to={`/app/organization/${organizationId}/projects`}>
          <ArrowLeftIcon size={20} />
        </Link>
      </div>

      <div className="w-full flex flex-col gap-2 flex-1 overflow-hidden">
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
            <OrganizationUserCircles
              organizationId={organizationId ?? ""}
              canManageUsers={canManageUsers}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-6 flex-1">hola</div>
        <div className="flex flex-wrap gap-6 flex-1 overflow-hidden min-h-0">
          <ProvocationsSection
            organizationId={organizationId ?? ""}
            projectId={projectId ?? ""}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;
