/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link, useParams } from "react-router-dom";
import {ArrowLeftIcon, Edit, Plus} from "lucide-react";
import useProject from "@/hooks/useProject.ts";
import UnifiedInvitationDialog from "@/components/project/UnifiedInvitationDialog";
import { useProjectPermissions } from "@/hooks/usePermissionsLoader";
import { ProvocationsSection } from "@/components/project/ProvocationsSection";
import FileListContainer from "@/components/files/FileListContainer";
import ProjectUserCircles from "@/components/project/ProjectUserCircles";
import MandalaListPage from "./mandala/MandalaListPage";
import AppLayout from "@/components/layout/AppLayout";
import CreateEntityModal from "@/components/project/CreateEntityModal";
import useUpdateProject from "@/hooks/useUpdateProject";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { getOrganizationById } from "@/services/organizationService";
import { ProjectBreadcrumb } from "@/components/project/ProjectBreadcrumb";
import { useOrganization } from "@/hooks/useOrganization";
import * as Icons from "lucide-react";
import {useCreateChildProject} from "@/hooks/useCreateChildProject.ts";

const ProjectPage = () => {
  const { projectId, organizationId } = useParams<{
    organizationId: string;
    projectId: string;
  }>();
  const { canManageUsers, canEdit } = useProjectPermissions(projectId);
  const { project, fetchProject } = useProject(projectId!);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCreateChildOpen, setIsCreateChildOpen] = useState(false);

  const {
    update: updateProject,
    loading: updating,
    error: updateError,
  } = useUpdateProject(() => {
    fetchProject();
  });
  const { organization } = useOrganization(organizationId);
  const { handleCreateChildProject, loading: creatingChild, error: childError } =
      useCreateChildProject(organizationId, projectId, () => setIsCreateChildOpen(false));


  const handleEditProject = async (data: {
    name: string;
    description?: string;
    icon: string;
    iconColor?: string;
  }) => {
    try {
      await updateProject(projectId!, data);
      setIsEditModalOpen(false);
      setErrorMessage(null);
    } catch {
      setErrorMessage(
        "No se pudo actualizar el proyecto. Intentalo de nuevo más tarde."
      );
    }
  };
  const [orgName, setOrgName] = useState<string>("");

  useEffect(() => {
    if (organizationId) {
      getOrganizationById(organizationId)
        .then((org) => setOrgName(org.name))
        .catch(() => setOrgName("Organización desconocida"));
    }
  }, [organizationId]);

  const IconComp = project?.icon ? (Icons as any)[project?.icon] : undefined

  return (
    <AppLayout>
      <div className="min-h-screen flex flex-col pb-8 pt-2 px-[150px] relative bg-[#F8FAFF]">
        <ProjectBreadcrumb
          organizationName={organization?.name}
          projectName={project?.name}
          projectId={projectId}
        />
        <div className="absolute top-10 left-10">
          <Link to={`/app/organization/${organizationId}/projects`}>
            <ArrowLeftIcon size={20} />
          </Link>
        </div>

        <div className="w-full flex flex-col gap-6 flex-1">
          <div className="flex justify-between">
            <div className="flex flex-col gap-2 flex-1">
              {IconComp && (
                <IconComp size={40} style={{ color: project?.iconColor }} />
              )}
              <h1 className="text-3xl font-bold h-8">{project?.name || " "}</h1>
              <div className="mt-2">
                {project?.description &&
                project.description.trim().length > 0 ? (
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {project.description}
                  </p>
                ) : (
                  <p className="text-gray-500 text-sm italic">
                    Este mundo no tiene descripción
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <div className="flex gap-2">
                {canEdit && (
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
                  projectName={project?.name ?? "Proyecto"}
                  projectId={projectId ?? ""}
                  organizationId={organizationId ?? ""}
                  defaultRole="worldbuilder"
                />
                <Button
                    icon={<Plus/>}
                    size="md"
                    onClick={() => setIsCreateChildOpen(true)}
                >
                  Crear subproyecto
                </Button>

              </div>
              <ProjectUserCircles
                projectId={projectId ?? ""}
                canManageUsers={canManageUsers}
              />
            </div>
          </div>
          <div className="mt-4 flex flex-row gap-6 justify-between w-full h-[600px]">
            <MandalaListPage />
            <FileListContainer
              scope="project"
              id={projectId ?? ""}
              organizationName={orgName}
              projectName={project?.name}
            />
          </div>
          <ProvocationsSection
            organizationId={organizationId ?? ""}
            projectId={projectId ?? ""}
          />
        </div>

        <CreateEntityModal
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onCreate={handleEditProject}
          loading={updating}
          error={updateError}
          title="Editar mundo"
          placeholder="Nombre del mundo"
          showQuestions={true}
          initialName={project?.name || ""}
          initialDescription={project?.description || ""}
          initialIcon={project?.icon || ""}
          initialIconColor={project?.iconColor || ""}
          mode="edit"
        />
        <CreateEntityModal
            open={isCreateChildOpen}
            onClose={() => setIsCreateChildOpen(false)}
            onCreate={handleCreateChildProject}
            loading={creatingChild}
            error={childError}
            title="Crear subproyecto"
            placeholder="Nombre del subproyecto"
            showQuestions={true}
            allowProvocationMode={false}
            showConfiguration={true}
        />

        {errorMessage && (
          <p className="text-red-500 mt-4 text-sm text-center">
            {errorMessage}
          </p>
        )}
      </div>
    </AppLayout>
  );
};

export default ProjectPage;
