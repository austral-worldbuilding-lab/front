import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Globe,
  PlusIcon,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Loader from "@/components/common/Loader";
import { ProjectRow } from "@/components/project/ProjectRow.tsx";
import { buildProjectTree, filterProjectTree } from "@/utils/projectTree.ts";

export interface Project {
  id: string;
  name: string;
  rootProjectId?: string;
  parentId?: string;
  children?: Project[];
  icon: string;
}

interface OrganizationProjectsListProps {
  projects: Project[];
  loading: boolean;
  error: Error | null;
  organizationId: string;
  canCreateProject: boolean;
  onCreateProject: () => void;
}

const OrganizationProjectsList = ({
  projects,
  loading,
  error,
  organizationId,
  canCreateProject,
  onCreateProject,
}: OrganizationProjectsListProps) => {
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const limit = 10;

  const projectTree = buildProjectTree(projects);
  const filteredTree = filterProjectTree(projectTree, searchText);

  const totalPages = Math.max(1, Math.ceil(filteredTree.length / limit));
  const start = (page - 1) * limit;
  const end = start + limit;
  const rootsToShow = filteredTree.slice(start, end);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [page, totalPages]);

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
              onChange={(e) => {
                setSearchText(e.target.value);
                setPage(1);
              }}
            />
          </div>
          {canCreateProject && (
            <Button
              color="primary"
              onClick={onCreateProject}
              icon={<PlusIcon size={16} />}
            >
              Crear Mundo
            </Button>
          )}
        </div>
      </div>

      <div className="border border-gray-200 rounded-md flex-1 overflow-auto">
        {loading && (
          <div className="h-full flex items-center justify-center">
            <Loader size="medium" text="Cargando proyectos..." />
          </div>
        )}
        {error && <p className="p-4 text-red-600">{error.message}</p>}
        {!loading && !error && rootsToShow.length === 0 && (
          <p className="p-4 text-gray-600 text-center w-full h-full flex items-center justify-center">
            {searchText
              ? "No se encontraron proyectos"
              : "No hay proyectos creados aún."}
          </p>
        )}
        {!loading && !error && rootsToShow.length > 0 && (
          <ul className="divide-y divide-gray-100">
            {rootsToShow.map((p) => (
              <ProjectRow
                key={p.id}
                project={p}
                organizationId={organizationId}
              />
            ))}
          </ul>
        )}
      </div>

      <div className="flex justify-center items-center gap-4">
        <Button
          variant="outline"
          color="white"
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          icon={<ChevronLeft size={16} />}
        />
        <span>
          Página {page} de {totalPages}
        </span>
        <Button
          variant="outline"
          color="white"
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
          icon={<ChevronRight size={16} />}
        />
      </div>
    </div>
  );
};

export default OrganizationProjectsList;
