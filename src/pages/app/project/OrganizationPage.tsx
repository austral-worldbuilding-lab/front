import { Link, useNavigate, useParams } from "react-router-dom";
import useProjects from "@/hooks/useProjects";
import { ArrowLeftIcon, Edit } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import useUpdateOrganization from "@/hooks/useUpdateOrganization";
import { useUpdateOrganizationImage } from "@/hooks/useUpdateOrganizationImage";

const OrganizationPage = () => {
  const { organizationId } = useParams();
  const { projects, loading, error } = useProjects(organizationId!, 1, 100);
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { canCreateProject, canManageUsers } =
    useOrganizationPermissions(organizationId);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [orgName, setOrgName] = useState<string>("");
  const [orgImageUrl, setOrgImageUrl] = useState<string | null>(null);

  const {
    update: updateOrganization,
    loading: updating,
    error: updateError,
  } = useUpdateOrganization(() => {
    fetchOrganization();
  });

  const {
    updateImage: updateOrganizationImage,
    loading: updatingImage,
  } = useUpdateOrganizationImage();

  const fetchOrganization = () => {
    if (organizationId) {
      getOrganizationById(organizationId)
        .then((org) => {
          setOrgName(org.name);
          setOrgImageUrl(org.imageUrl ?? null);
        })
        .catch(() => setOrgName("Organización desconocida"));
    }
  };

  useEffect(() => {
    fetchOrganization();
  }, [organizationId]);

  const handleCreateProject = async (data: {
    name: string;
    description?: string;
    dimensions?: DimensionDto[];
    scales?: string[];
    icon: string;
  }) => {
    const { name, description, dimensions, scales, icon } = data;
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

  const handleEditOrganization = async (data: { name: string; image?: File }) => {
    try {
      // 1. Actualizar nombre (esto devuelve presignedUrl e imageId)
      const updatedOrg = await updateOrganization(organizationId!, { name: data.name });
      
      // 2. Si hay nueva imagen, subirla usando el presignedUrl devuelto
      if (data.image && updatedOrg.presignedUrl && updatedOrg.imageId) {
        const success = await updateOrganizationImage(
          organizationId!,
          data.image,
          updatedOrg.presignedUrl,
          updatedOrg.imageId
        );
        if (!success) {
          setErrorMsg("El nombre se actualizó, pero hubo un error al actualizar la imagen.");
          return;
        }
      }
      
      setIsEditModalOpen(false);
      setErrorMsg(null);
      fetchOrganization();
    } catch {
      setErrorMsg(
        "No se pudo actualizar la organización. Intentalo de nuevo más tarde."
      );
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
              <div className="flex gap-2">
                {canManageUsers && (
                  <Button
                    variant="outline"
                    size="md"
                    color="white"
                    onClick={() => setIsEditModalOpen(true)}
                    aria-label="Editar"
                    icon={<Edit size={16} />}
                  >
                    Editar
                  </Button>
                )}
                <UnifiedInvitationDialog
                  projectName={orgName ?? "Organización"}
                  projectId={projects[0]?.id ?? ""}
                  organizationId={organizationId ?? ""}
                  defaultRole="worldbuilder"
                  isOrganization
                />
              </div>
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

        <CreateEntityModal
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onCreate={handleEditOrganization}
          loading={updating || updatingImage}
          error={updateError}
          title="Editar organización"
          placeholder="Nombre de la organización"
          showQuestions={false}
          initialName={orgName || ""}
          initialImageUrl={orgImageUrl}
          mode="edit"
          isOrganization
        />

        {errorMsg && (
          <p className="text-red-500 mt-4 text-sm text-center">
            {errorMsg}
          </p>
        )}
      </div>
    </AppLayout>
  );
};

export default OrganizationPage;
