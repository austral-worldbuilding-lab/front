import { Link, useNavigate, useParams } from "react-router-dom";
import useProjects from "@/hooks/useProjects";
import { ArrowLeftIcon } from "lucide-react";
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
import { getOrganizationIcon } from "@/utils/iconUtils";

const OrganizationPage = () => {
  const { organizationId } = useParams();
  const { projects, loading, error } = useProjects(organizationId!, 1, 100);
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { canCreateProject, canManageUsers } =
    useOrganizationPermissions(organizationId);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [orgName, setOrgName] = useState<string>("");
  const [orgImageUrl, setOrgImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (organizationId) {
      getOrganizationById(organizationId)
        .then((org) => {
          setOrgName(org.name);
          setOrgImageUrl(org.imageUrl ?? null);
        })
        .catch(() => setOrgName("Organización desconocida"));
    }
  }, [organizationId]);

  const handleCreateProject = async (data: {
    name: string;
    description?: string;
    dimensions?: DimensionDto[];
    scales?: string[];
    icon: string;
    iconColor?: string;
  }) => {
    const { name, description, dimensions, scales, icon, iconColor } = data;
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
        dimensions,
        scales,
        icon,
        iconColor,
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
    icon: string;
    iconColor?: string;
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
        icon: data.icon,
        iconColor: data.iconColor
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

  const IconComp = getOrganizationIcon("");

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
              {orgImageUrl ? (
                <img className="h-[40px] w-fit" src={orgImageUrl}></img>
              ) : (
                <IconComp size={40} className="text-primary" />
              )}
              <h1 className="text-3xl font-bold">{orgName || ""}</h1>
            </div>
            <div className="flex flex-col gap-2 items-end flex-1">
              <UnifiedInvitationDialog
                projectName={orgName ?? "Organización"}
                projectId={projects[0]?.id ?? ""}
                organizationId={organizationId ?? ""}
                defaultRole="worldbuilder"
                isOrganization
              />
              <OrganizationUserCircles
                organizationId={organizationId!}
                canManageUsers={canManageUsers}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-6 mt-6 flex-1 h-[600px]">
            <OrganizationProjectsList
              projects={projects}
              loading={loading}
              error={error}
              organizationId={organizationId!}
              canCreateProject={canCreateProject}
              onCreateProject={() => setModalOpen(true)}
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
          title="Crear nuevo mundo"
          placeholder="Nombre del mundo"
          showQuestions={true}
          allowProvocationMode={true}
          showConfiguration={true}
        />
      </div>
    </AppLayout>
  );
};

export default OrganizationPage;
