import { Link, useNavigate, useParams } from "react-router-dom";
import Loader from "@/components/common/Loader.tsx";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, Eye, UserPlus, FileText } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png";
import useProject from "@/hooks/useProject.ts";
import ProjectUserList from "@/components/project/ProjectUserList";
import ShareLinkDialog from "@/components/project/ShareLinkDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import InviteUserForm from "@/components/project/InviteUserForm.tsx";
import FilesDrawer from "@/components/project/FilesDrawer";

const ProjectPage = () => {
  const { projectId, organizationId } = useParams<{
    organizationId: string;
    projectId: string;
  }>();
  console.log("ProjectPage params:", { projectId, organizationId });
  const navigate = useNavigate();

  const { project, loading: projectLoading } = useProject(projectId);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [conflictMsg, setConflictMsg] = useState<string | undefined>(undefined);

  if (!projectId) {
    return <div>Error: Project ID not found</div>;
  }


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

          <div className="w-full flex justify-between items-start gap-4">
            <div className="flex-1">
              <h2 className="text-base font-semibold mb-1">Descripción</h2>
              {project?.description && project.description.trim().length > 0 ? (
                  <p className="text-sm leading-6 break-words whitespace-pre-wrap">
                    {project.description}
                  </p>
              ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Este proyecto no tiene descripción.
                  </p>
              )}
            </div>

            <Button
                variant="outline"
                onClick={() => setDrawerOpen(true)}
                icon={<FileText size={16} />}
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

          <Button
              variant="outline"
              onClick={() => setInviteOpen(true)}
              icon={<UserPlus size={16} />}
              aria-label="Invitar miembros al proyecto"
          >
            Invitar
          </Button>
          {projectId && organizationId && (
            <ShareLinkDialog
                projectId={projectId}
                organizationId={organizationId}
                projectName={project?.name ?? "Proyecto"}
                defaultRole="member"
            />
          )}
        </div>

          <div className="w-full overflow-y-auto border rounded-lg p-4 shadow bg-white mt-6">
            <h2 className="text-lg font-bold mb-4">Usuarios del proyecto</h2>
            <ProjectUserList projectId={projectId} canManage={true} />
          </div>
        </div>

      <FilesDrawer
          id={projectId!}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="Archivos del proyecto"
          scope="project"
      />
  {/* MODAL INVITAR USUARIO */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invitar miembros</DialogTitle>
          </DialogHeader>
          <InviteUserForm
              projectId={projectId}
              onSuccess={() => {
                setInviteOpen(false);
                setInviteSuccess(true);
              }}
              onError={(status) => {
                if (status === 409) {
                  setInviteOpen(false);
                  setConflictMsg("Ya existe una invitación pendiente para ese usuario.");
                  setConflictOpen(true);
                }
              }}
          />
        </DialogContent>
      </Dialog>

      {/* MODAL ÉXITO */}
      <Dialog open={inviteSuccess} onOpenChange={setInviteSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invitación enviada</DialogTitle>
          </DialogHeader>
          <div>Se envió la invitación correctamente.</div>
          <DialogFooter>
            <Button onClick={() => setInviteSuccess(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL CONFLICTO */}
      <Dialog open={conflictOpen} onOpenChange={setConflictOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invitación existente</DialogTitle>
          </DialogHeader>
          <div>
            {conflictMsg || "Ya existe una invitación para ese usuario en este proyecto."}
          </div>
          <DialogFooter>
            <Button onClick={() => setConflictOpen(false)}>Entendido</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectPage;
