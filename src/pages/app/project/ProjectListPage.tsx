import {Link, useNavigate, useParams} from "react-router-dom";
import useProjects from "@/hooks/useProjects";
import Loader from "@/components/common/Loader";
import {PlusIcon, FolderIcon, ChevronRight, ChevronLeft, ArrowLeftIcon, Files} from "lucide-react";
import { Button } from "@/components/ui/button";
import {useEffect, useState} from "react";
import { createProject } from "@/services/projectService.ts";
import { useAuthContext } from "@/context/AuthContext.tsx";
import CreateEntityModal from "@/components/project/CreateEntityModal.tsx";
import {getOrganizationById} from "@/services/organizationService.ts";
import OrganizationFilesDrawer from "@/components/project/OrganizationFilesDrawer.tsx";

const ProjectListPage = () => {
  const {organizationId} = useParams()
  const { projects, loading, page, setPage, error } = useProjects(organizationId!);
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [orgName, setOrgName] = useState<string>("");
    const [drawerOpen, setDrawerOpen] = useState(false);


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
      const project = await createProject({ name: name, userId: user.uid, organizationId: organizationId! });
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

  return (
      <>
          <div className="min-h-screen flex flex-col items-center justify-start pt-12">
              <div className="absolute top-10 left-10">
                  <Link to={`/app/organization/`}>
                      <ArrowLeftIcon className="w-5 h-5"/>
                  </Link>
              </div>

              <div className="w-full max-w-2xl px-4">
                  <h1 className="text-2xl font-bold mb-6 text-center">Proyectos de: {orgName || ""}</h1>
                  <Button
                      color="primary"
                      className="mb-10"
                      onClick={() => setModalOpen(true)}
                      icon={<PlusIcon size={16}/>}
                  >
                      Crear Proyecto
                  </Button>
                  <Button
                      variant="outline"
                      onClick={() => setDrawerOpen(true)}
                      icon={<Files size={16}/>}
                  >
                      Archivos de la organización
                  </Button>
                  <div className="bg-white rounded-lg shadow-sm border">
                      {loading && <Loader size="medium" text="Cargando proyectos..."/>}
                      {error && (
                          <div className="p-4 text-red-500">
                              Error al cargar los proyectos: {error.message}
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
                                          <FolderIcon className="w-5 h-5 text-gray-400 flex-shrink-0"/>
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
                      icon={<ChevronLeft size={16}/>}/>
                  <span>Página {page}</span>
                  <Button
                      variant="outline"
                      onClick={() => setPage(page + 1)}
                      disabled={projects.length < 10}
                      icon={<ChevronRight size={16}/>}/>
              </div>
              <CreateEntityModal
                  open={modalOpen}
                  onClose={() => setModalOpen(false)}
                  onCreate={handleCreateProject}
                  loading={creating}
                  error={errorMsg}
                  title={"Crear Proyecto"}
                  placeholder={"Nombre del proyecto"}/>
          </div>
          <OrganizationFilesDrawer
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              organizationId={organizationId!}/></>
  );
};

export default ProjectListPage;
