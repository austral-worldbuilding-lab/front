import { Link, useNavigate, useParams } from "react-router-dom";
import Loader from "@/components/common/Loader.tsx";
import { Button } from "@/components/ui/button";
import {ArrowLeftIcon, ExternalLink, Eye, FileText, Pencil, Sparkles} from "lucide-react";
import {useEffect, useState} from "react";
import logo from "@/assets/logo.png";
import useProject from "@/hooks/useProject.ts";
import ProjectUserList from "@/components/project/ProjectUserList";
import UnifiedInvitationDialog from "@/components/project/UnifiedInvitationDialog";
import FilesDrawer from "@/components/project/FilesDrawer";
import ProvocationBox from "@/components/project/ProvocationBox.tsx";
import ProvocationCard from "@/components/project/ProvocationCard.tsx";
import {Provocation} from "@/types/mandala";
import { useProjectPermissions } from "@/hooks/usePermissionsLoader";
import useProvocations from "@/hooks/useProvocations.ts";
import CreateEntityModal from "@/components/project/CreateEntityModal.tsx";
import useUpdateProject from "@/hooks/useUpdateProject.ts";
import TimelineTree from "@/components/project/TimelineTree.tsx";
import useTimeline from "@/hooks/useTimeline.ts";
import CreatedWorldsModal from "@/components/project/CreatedWorldsModal.tsx";
import AppLayout from "@/components/layout/AppLayout";


const ProjectPage = () => {
    const { projectId, organizationId } = useParams<{
        organizationId: string;
        projectId: string;
    }>();
    const navigate = useNavigate();
    const { canManageUsers } = useProjectPermissions(projectId);

  const { project, setProject, loading: projectLoading } = useProject(projectId!);

    const { update, loading: updating, error: updateError } = useUpdateProject((updated) => {
        setProject(updated);
        setEditing(false);
    });
    const { data: timelineData, loading: timelineLoading } = useTimeline(projectId!);

    const {
        provocations,
        loading: provLoading,
        error: provError,
        generateAI,
        createManual,
        reload
    } = useProvocations(projectId!);


  const [drawerOpen, setDrawerOpen] = useState(false);
  const [provBoxOpen, setProvBoxOpen] = useState(false);
  const [selectedProvocation, setSelectedProvocation] = useState<Provocation | null>(null);
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

    if (projectLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader size="large" text="Cargando proyecto..." />
            </div>
        );
    }

    return (
        <AppLayout>
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

                <div className="w-full flex flex-col gap-2">
                    <h2 className="text-base font-semibold mb-1">Descripción</h2>
                    <div className="relative">
                        <div className="text-sm leading-6 whitespace-pre-wrap break-words italic pr-8">
                            {project?.description?.trim().length
                                ? project.description
                                : "No hay detalles agregados."}
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 bottom-0 translate-y-1"
                            onClick={() => setEditing(true)}
                        >
                            <Pencil size={14} />
                        </Button>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setDrawerOpen(true)}
                        icon={<FileText size={16} />}
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
                            navigate(`/app/organization/${organizationId}/projects/${projectId}/mandalas`)
                        }
                        icon={<Eye size={16} />}
                    >
                        Ver Mandalas
                    </Button>

                    <Button color="secondary" onClick={() => setProvBoxOpen(true)}>
                        Provocaciones <Sparkles className="w-4 h-4" />
                    </Button>

                    {projectId && organizationId && canManageUsers && (
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
                    <ProjectUserList projectId={projectId!} />
                </div>
            </div>

            <div className="absolute bottom-6 right-6 w-80 h-60 border rounded-lg shadow bg-white p-2 flex flex-col overflow-hidden">
                <div className="flex justify-between items-center mb-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                            navigate(`/app/organization/${organizationId}/projects/${projectId}/timeline`)
                        }
                    >
                        <ExternalLink className="w-4 h-4 mr-1" />
                    </Button>
                </div>
                <div className="flex-1 relative overflow-hidden">
                    {timelineLoading ? (
                        <Loader size="small" text="Cargando..." />
                    ) : timelineData ? (
                        <div className="flex-1 flex items-center justify-center overflow-hidden">
                            <div className="scale-[0.99] origin-center">
                                <TimelineTree data={timelineData}/>
                            </div>
                        </div>

                    ) : (
                        <p className="text-xs text-gray-500 text-center mt-5">Sin datos</p>
                    )}
                </div>
            </div>

            <FilesDrawer
                id={projectId!}
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                title="Archivos del proyecto"
                scope="project"
            />

            {/* ProvocationCard */}
            {selectedProvocation && (
                <ProvocationCard
                    provocation={selectedProvocation}
                    open={provocationOpen}
                    onClose={handleCloseAll}
                    onOpenWorlds={() => {
                        setProvocationOpen(false);
                        setWorldsOpen(true);
                    }}
                    onNavigate={handleNavigate}
                />
            )}

            {/* CreatedWorldsModal */}
            {selectedProvocation && (
                <CreatedWorldsModal
                    provocation={selectedProvocation}
                    open={worldsOpen}
                    onClose={handleCloseAll}
                    onBack={handleBackToProvocation}
                    onNavigate={handleNavigate}
                />
            )}

            <ProvocationBox
                open={provBoxOpen}
                onClose={() => setProvBoxOpen(false)}
                provocations={provocations}
                onSelect={(prov) => {
                    setSelectedProvocation(prov);
                    setProvocationOpen(true);
                }}
                onGenerateAI={generateAI}
                onCreateManual={() => setCreating(true)}
                loading={provLoading}
                error={provError}
            />

            {creating && (
                <ProvocationCard
                    provocation={null}
                    open={true}
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
        </AppLayout>
    );
};

export default ProjectPage;
