import { Link, useNavigate, useParams } from "react-router-dom";
import Loader from "@/components/common/Loader.tsx";
import { Button } from "@/components/ui/button";
import {ArrowLeftIcon, Eye, FileText, Pencil, Sparkles} from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png";
import useProject from "@/hooks/useProject.ts";
import ProjectUserList from "@/components/project/ProjectUserList";
import UnifiedInvitationDialog from "@/components/project/UnifiedInvitationDialog";
import FilesDrawer from "@/components/project/FilesDrawer";
import ProvocationBox from "@/components/project/ProvocationBox.tsx";
import ProvocationCard from "@/components/project/ProvocationCard.tsx";
import {Provocation} from "@/types/mandala";
import useProvocations from "@/hooks/useProvocations.ts";
import CreateEntityModal from "@/components/project/CreateEntityModal.tsx";
import useUpdateProject from "@/hooks/useUpdateProject.ts";


const ProjectPage = () => {
  const { projectId, organizationId } = useParams<{
    organizationId: string;
    projectId: string;
  }>();
  const navigate = useNavigate();

  const { project, loading: projectLoading } = useProject(projectId);
  const { provocations, generateAI, createManual } = useProvocations(projectId!);
  const { update, loading: updating, error: updateError } = useUpdateProject()

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [provBoxOpen, setProvBoxOpen] = useState(false);
  const [selectedProvocation, setSelectedProvocation] = useState<Provocation | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);




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
              <img src={logo} alt="logo" className="w-50 h-auto"/>
              <h1 className="text-xl sm:text-2xl font-bold text-center break-words">
                  Proyecto: {project?.name}
              </h1>

              <div className="w-full flex flex-col gap-2">
                  <h2 className="text-base font-semibold mb-1">Descripción</h2>

                  <div className="relative">
                      <div className="text-sm leading-6 whitespace-pre-wrap break-words italic pr-8">
                          {project?.description && project?.description.trim().length > 0
                              ? project.description
                              : "No hay detalles agregados."}
                      </div>

                      <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 bottom-0 translate-y-1"
                          onClick={() => setEditing(true)}
                      >
                          <Pencil size={14}/>
                      </Button>
                  </div>

                  <Button
                      variant="outline"
                      onClick={() => setDrawerOpen(true)}
                      icon={<FileText size={16}/>}
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
                      icon={<Eye size={16}/>}
                  >
                      Ver Mandalas
                  </Button>

                  <Button color="secondary" onClick={() => setProvBoxOpen(true)}>
                      Generar provocaciones <Sparkles className="w-4 h-4"/>
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

            {selectedProvocation && (
                <ProvocationCard
                    provocation={selectedProvocation}
                    onClose={() => setSelectedProvocation(null)}
                />
            )}

            <ProvocationBox
                open={provBoxOpen}
                onClose={() => setProvBoxOpen(false)}
                provocations={provocations}
                onSelect={setSelectedProvocation}
                onGenerateAI={generateAI}
                onCreateManual={() => setCreating(true)}
            />

            {creating && (
                <ProvocationCard
                    provocation={null}
                    onClose={() => setCreating(false)}
                    onSave={createManual}
                />
            )}

          {editing && (
              <CreateEntityModal
                  open={editing}
                  onClose={() => setEditing(false)}
                  onCreate={(data) => update(projectId!, data).then(() => {})}
                  loading={updating}
                  error={updateError}
                  title="Editar proyecto"
                  placeholder="Nombre del proyecto"
                  showQuestions={true}
                  mode="edit"
                  initialName={project?.name ?? ""}
                  initialDescription={project?.description ?? ""}
              />
          )}


      </div>
    );
};

export default ProjectPage;
