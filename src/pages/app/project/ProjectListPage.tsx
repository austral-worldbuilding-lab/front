/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link, useNavigate, useParams } from "react-router-dom";
import useProjects from "@/hooks/useProjects";
import Loader from "@/components/common/Loader";
import {
  PlusIcon,
  FolderIcon,
  ChevronRight,
  ChevronLeft,
  ArrowLeftIcon,
  FileText,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { createProject } from "@/services/projectService.ts";
import { useAuthContext } from "@/context/AuthContext.tsx";
import CreateEntityModal from "@/components/project/CreateEntityModal.tsx";
import { getOrganizationById } from "@/services/organizationService.ts";
import FilesDrawer from "@/components/project/FilesDrawer.tsx";
import ShareLinkDialog from "@/components/project/ShareLinkDialog";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  createOrganizationInviteLink,
} from "@/services/organizationInvitationService";
import { Role, ROLES } from "@/services/invitationService";

const ProjectListPage = () => {
  const { organizationId } = useParams();
  const { projects, loading, page, setPage, error } = useProjects(
    organizationId!
  );
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [orgName, setOrgName] = useState<string>("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("member");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [conflictMsg, setConflictMsg] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (organizationId) {
      getOrganizationById(organizationId)
        .then((org) => setOrgName(org.name))
        .catch(() => setOrgName("Organización desconocida"));
    }
  }, [organizationId]);

  const handleCreateProject = async (name: string) => {
    setCreating(true);
    try {
      if (!user) throw new Error("Usuario no autenticado");
      const project = await createProject({
        name: name,
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

  const handleInviteSubmit = async () => {
    if (!organizationId) {
      setInviteError("Falta el ID de la organización.");
      return;
    }
    if (!inviteEmail) {
      setInviteError("Ingresá un email.");
      return;
    }
    setInviteLoading(true);
    setInviteError(null);
    try {
      await createOrganizationInviteLink(
        organizationId,
        inviteRole,
        undefined,
        inviteEmail,
        true
      );
      setInviteOpen(false);
      setInviteSuccess(true);
      setInviteEmail("");
      setInviteRole("member");
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setInviteOpen(false);
        setConflictMsg("Ya existe una invitación pendiente para ese usuario.");
        setConflictOpen(true);
      } else if (err?.response?.status === 403) {
        setInviteError("No tenés permisos para invitar en esta organización.");
      } else {
        setInviteError(
          err?.response?.data?.message ||
            err?.message ||
            "Error al enviar invitación"
        );
      }
    } finally {
      setInviteLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-start pt-12">
        <div className="absolute top-10 left-10">
          <Link to={`/app/organization/`}>
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
        </div>

        <div className="w-full max-w-2xl px-4">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Proyectos de: {orgName || ""}
          </h1>
          {!error?.message?.includes("403") &&
            !error?.message?.includes(
              "Request failed with status code 403"
            ) && (
              <>
                <Button
                  color="primary"
                  className="mb-2"
                  onClick={() => setModalOpen(true)}
                  icon={<PlusIcon size={16} />}
                >
                  Crear Proyecto
                </Button>
                <Button
                  className="ml-2"
                  variant="outline"
                  onClick={() => setDrawerOpen(true)}
                  icon={<FileText size={16} />}
                >
                  Archivos de la organización
                </Button>
                <Button
                  className="ml-2 mr-2"
                  variant="outline"
                  icon={<UserPlus size={16} />}
                  aria-label="Invitar miembros a la organización"
                  onClick={() => {
                    setInviteError(null);
                    setInviteOpen(true);
                  }}
                >
                  Invitar
                </Button>
                <ShareLinkDialog
                  className="mb-4"
                  projectName={orgName ?? "Organización"}
                  projectId={projects[0]?.id ?? ""}
                  organizationId={organizationId ?? ""}
                  defaultRole="member"
                  isOrganization
                />
              </>
            )}
          <div className="bg-white rounded-lg shadow-sm border">
            {loading && <Loader size="medium" text="Cargando proyectos..." />}
            {error && (
              <div className="flex flex-col items-center justify-center p-8">
                <div className="text-center max-w-md">
                  <h2 className="text-lg font-semibold text-red-600 mb-3">
                    Error al cargar proyectos
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {error.message?.includes("403") ||
                    error.message === "Request failed with status code 403"
                      ? "No tienes permisos para ver todos los proyectos de esta organización. Solo puedes acceder a los proyectos donde has sido invitado específicamente."
                      : error.message || "Error al cargar los proyectos"}
                  </p>
                  <div className="flex gap-2 justify-center flex-wrap">
                    <Button
                      variant="outline"
                      onClick={() => window.history.back()}
                    >
                      Volver atrás
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/app/organization/")}
                    >
                      Mis organizaciones
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {!error && !loading && projects.length === 0 && (
              <p className="p-4 text-gray-600 text-center">
                No hay proyectos creados aún.
              </p>
            )}
            {!error && !loading && projects.length > 0 && (
              <ul className="divide-y divide-gray-100">
                {projects.map((project) => (
                  <li
                    key={project.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <Link
                      to={`/app/organization/${organizationId}/projects/${project.id}`}
                      className="flex items-center gap-3 p-4 text-gray-800 hover:text-blue-600 transition-colors"
                    >
                      <FolderIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <span className="flex-1">
                        {project.name || "Proyecto sin nombre"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="flex justify-center items-center gap-4 mt-6">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            icon={<ChevronLeft size={16} />}
          />
          <span>Página {page}</span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={projects.length < 10}
            icon={<ChevronRight size={16} />}
          />
        </div>
        <CreateEntityModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onCreate={handleCreateProject}
          loading={creating}
          error={errorMsg}
          title={"Crear Proyecto"}
          placeholder={"Nombre del proyecto"}
        />
      </div>
      <FilesDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Archivos de la organización"
        scope="organization"
        id={organizationId!}
      />

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invitar a la organización</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="usuario@ejemplo.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                disabled={inviteLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label>Rol</Label>
              <Select
                value={inviteRole}
                onValueChange={(v) => setInviteRole(v as Role)}
                disabled={inviteLoading}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Rol" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {inviteError && (
              <div className="text-sm text-red-600">{inviteError}</div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setInviteOpen(false)}
              disabled={inviteLoading}
            >
              Cancelar
            </Button>
            <Button onClick={handleInviteSubmit} disabled={inviteLoading}>
              {inviteLoading ? "Enviando..." : "Enviar invitación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={inviteSuccess} onOpenChange={setInviteSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invitación creada</DialogTitle>
          </DialogHeader>
          <div>
            Se envió la invitación por email. La persona podrá unirse a la
            organización desde el enlace recibido.
          </div>
          <DialogFooter>
            <Button onClick={() => setInviteSuccess(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={conflictOpen} onOpenChange={setConflictOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invitación existente</DialogTitle>
          </DialogHeader>
          <div>
            {conflictMsg ||
              "Ya existe una invitación para ese usuario en esta organización."}
          </div>
          <DialogFooter>
            <Button onClick={() => setConflictOpen(false)}>Entendido</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectListPage;
