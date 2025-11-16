/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link, useParams, useNavigate } from "react-router-dom";
import {ArrowLeftIcon, Edit, Plus, Trash2} from "lucide-react";
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
import ConfirmationDialog from "@/components/common/ConfirmationDialog";
import { useDeleteProject } from "@/hooks/useDeleteProject";

const ProjectPage = () => {
  const navigate = useNavigate();
  const { projectId, organizationId } = useParams<{
    organizationId: string;
    projectId: string;
  }>();
  const { canManageUsers, canEdit, canDelete } = useProjectPermissions(projectId);
  const { project, fetchProject } = useProject(projectId!);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCreateChildOpen, setIsCreateChildOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  const { deleteProjectById, loading: deletingProject, error: deleteProjectError } =
    useDeleteProject(() => {
      navigate(`/app/organization/${organizationId}/projects`);
    });


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

  const handleDeleteProject = async () => {
    if (!projectId) return;
    
    setDeleteError(null);
    const success = await deleteProjectById(projectId);
    
    if (!success && deleteProjectError) {
      setDeleteError(deleteProjectError);
      setIsDeleteDialogOpen(false);
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
              <div className="flex gap-2 items-start">
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
                  {canDelete && (
                    <Button
                      variant="outline"
                      size="md"
                      color="danger"
                      onClick={() => setIsDeleteDialogOpen(true)}
                      aria-label="Eliminar"
                      icon={<Trash2 size={16} />}
                      disabled={deletingProject}
                    >
                      Eliminar
                    </Button>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <UnifiedInvitationDialog
                    projectName={project?.name ?? "Proyecto"}
                    projectId={projectId ?? ""}
                    organizationId={organizationId ?? ""}
                    defaultRole="worldbuilder"
                  />
                  <ProjectUserCircles
                    projectId={projectId ?? ""}
                    canManageUsers={canManageUsers}
                  />
                </div>
                <Button
                    icon={<Plus/>}
                    size="md"
                    onClick={() => setIsCreateChildOpen(true)}
                >
                  Crear subproyecto
                </Button>
              </div>
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
          mode="edit"
          icon={project?.icon}
          iconColor={project?.iconColor}
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

        {deleteError && (
          <div className="fixed bottom-4 right-4 max-w-md bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg z-50">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800">Error al eliminar proyecto</h3>
                <p className="text-sm text-red-700 mt-1">{deleteError}</p>
              </div>
              <button
                onClick={() => setDeleteError(null)}
                className="flex-shrink-0 text-red-500 hover:text-red-700"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <ConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          title="Eliminar proyecto y subproyectos"
          description={`¿Estás seguro de que querés eliminar "${project?.name}"? Esta acción eliminará permanentemente este proyecto y todos sus subproyectos, mandalas, provocaciones, soluciones y archivos asociados. Esta acción no se puede deshacer.`}
          isDanger
          confirmText="Eliminar permanentemente"
          cancelText="Cancelar"
          onConfirm={handleDeleteProject}
          loading={deletingProject}
        />
      </div>
    </AppLayout>
  );
};

export default ProjectPage;
