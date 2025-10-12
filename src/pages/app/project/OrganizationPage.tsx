import { Link, useNavigate, useParams } from "react-router-dom";
import useProjects from "@/hooks/useProjects";
import { ArrowLeftIcon, Folder } from "lucide-react";
import { useEffect, useState } from "react";
import {
  createProject,
  createProjectFromQuestion,
} from "@/services/projectService.ts";
import { useAuthContext } from "@/context/AuthContext.tsx";
import CreateEntityModal from "@/components/project/CreateEntityModal.tsx";
import { getOrganizationById } from "@/services/organizationService.ts";
import UnifiedInvitationDialog from "@/components/project/UnifiedInvitationDialog";
import { useOrganizationPermissions } from "@/hooks/usePermissionsLoader";
import OrganizationUserCircles from "@/components/organization/OrganizationUserCircles";
import OrganizationProjectsList from "@/components/project/OrganizationProjectsList";
import FileListContainer from "@/components/files/FileListContainer";
import { DimensionDto } from "@/types/mandala";
import AppLayout from "@/components/layout/AppLayout";

const OrganizationPage = () => {
  const { organizationId } = useParams();
  const { projects, loading, page, setPage, error } = useProjects(
    organizationId!,
    1,
    10,
    true
  );
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { canCreateProject, canManageUsers } =
    useOrganizationPermissions(organizationId);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [orgName, setOrgName] = useState<string>("");

  useEffect(() => {
    if (organizationId) {
      getOrganizationById(organizationId)
        .then((org) => setOrgName(org.name))
        .catch(() => setOrgName("Organización desconocida"));
    }
  }, [organizationId]);

  const handleCreateProject = async (data: {
    name: string;
    description?: string;
  }) => {
    const { name, description } = data;
    setCreating(true);
    try {
      if (!user) {
        setErrorMsg("Usuario no autenticado");
        return;
      }
      const project = await createProject({
        name: name,
        description: description || "",
        userId: user.uid,
        organizationId: organizationId!,
      });
      setModalOpen(false);
      navigate(`/app/organization/${organizationId}/projects/${project.id}`);
    } catch (error) {
      setErrorMsg(
        error instanceof Error ? error.message : "Error al crear proyecto"
      );
    } finally {
      setCreating(false);
    }
  };

  const handleCreateProjectFromProvocation = async (data: {
    question: string;
    name?: string;
    dimensions?: DimensionDto[];
    scales?: string[];
  }) => {
    setCreating(true);
    try {
      if (!organizationId) {
        setErrorMsg("ID de organización no disponible");
        return;
      }

      const project = await createProjectFromQuestion({
        question: data.question,
        organizationId: organizationId,
        name: data.name,
        dimensions: data.dimensions,
        scales: data.scales,
      });

      setModalOpen(false);
      navigate(`/app/organization/${organizationId}/projects/${project.id}`);
    } catch (error) {
      setErrorMsg(
        error instanceof Error
          ? error.message
          : "Error al crear proyecto desde provocación"
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen flex flex-col py-8 px-[150px] relative bg-[#F8FAFF]">
        <div className="absolute top-10 left-10">
          <Link to={`/app/organization/`}>
            <ArrowLeftIcon size={20} />
          </Link>
        </div>

        <div className="w-full flex flex-col gap-2 flex-1">
          <div className="flex justify-between">
            <div className="flex flex-col gap-2">
              <Folder size={40} className="text-primary" />
              <h1 className="text-3xl font-bold">{orgName || ""}</h1>
            </div>
            <div className="flex flex-col gap-2 items-end flex-1">
              <UnifiedInvitationDialog
                projectName={orgName ?? "Organización"}
                projectId={projects[0]?.id ?? ""}
                organizationId={organizationId ?? ""}
                defaultRole="member"
                isOrganization
              />
              <OrganizationUserCircles
                organizationId={organizationId!}
                canManageUsers={canManageUsers}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-6 mt-6 flex-1">
            <OrganizationProjectsList
              projects={projects}
              loading={loading}
              error={error}
              organizationId={organizationId!}
              canCreateProject={canCreateProject}
              onCreateProject={() => setModalOpen(true)}
              page={page}
              setPage={setPage}
            />
            <FileListContainer 
              scope="organization" 
              id={organizationId!} 
              organizationName={orgName}
            />
          </div>
        </div>

        <CreateEntityModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setErrorMsg(null);
          }}
          onCreate={handleCreateProject}
          onCreateFromProvocation={handleCreateProjectFromProvocation}
          loading={creating}
          error={errorMsg}
          title="Crear nuevo proyecto"
          placeholder="Nombre del proyecto"
          showQuestions={true}
          allowProvocationMode={true}
        />
      </div>
    </AppLayout>
  );
};

export default OrganizationPage;
