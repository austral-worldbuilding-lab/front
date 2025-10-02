import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Globe,
  PlusIcon,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProjectRow from "./ProjectRow";
import Loader from "@/components/common/Loader";

interface Project {
  id: string;
  name: string;
}

interface OrganizationProjectsListProps {
  projects: Project[];
  loading: boolean;
  error: Error | null;
  organizationId: string;
  canCreateProject: boolean;
  onCreateProject: () => void;
  page: number;
  setPage: (page: number) => void;
}

const OrganizationProjectsList = ({
  projects,
  loading,
  error,
  organizationId,
  canCreateProject,
  onCreateProject,
  page,
  setPage,
}: OrganizationProjectsListProps) => {
  const [searchText, setSearchText] = useState("");

  return (
    <div className="flex flex-col gap-4 bg-white rounded-[12px] border border-gray-200 overflow-hidden px-5 py-4 flex-1 lg:min-w-[450px] min-w-[300px]">
      <div className="flex items-center justify-between flex-wrap w-full gap-2">
        <div className="flex items-center gap-2">
          <Globe size={20} className="text-foreground" />
          <span className="font-semibold text-xl text-foreground">Mundos</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap w-full">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Buscar por nombre"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          {canCreateProject && (
            <Button
              color="primary"
              onClick={onCreateProject}
              icon={<PlusIcon size={16} />}
            >
              Crear Proyecto
            </Button>
          )}
        </div>
      </div>

      <div className="border border-gray-200 rounded-md flex-1">
        {loading && (
          <div className="p-8">
            <Loader size="medium" text="Cargando proyectos..." />
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="text-center max-w-md">
              <h2 className="text-lg font-semibold text-red-600 mb-3">
                Error al cargar proyectos
              </h2>
              <p className="text-gray-600 mb-4">
                {error.message || "Error al cargar los proyectos"}
              </p>
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
              <ProjectRow
                key={project.id}
                project={project}
                organizationId={organizationId}
              />
            ))}
          </ul>
        )}
      </div>

      {projects.length > 0 && (
        <div className="flex justify-center items-center gap-4 p-4">
          <Button
            variant="outline"
            color="white"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            icon={<ChevronLeft size={16} />}
          />
          <span>Página {page}</span>
          <Button
            variant="outline"
            color="white"
            onClick={() => setPage(page + 1)}
            disabled={projects.length < 10}
            icon={<ChevronRight size={16} />}
          />
        </div>
      )}
    </div>
  );
};

export default OrganizationProjectsList;
