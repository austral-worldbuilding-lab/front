import { PlusIcon, Building2, Search } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Organization } from "@/types/mandala";
import OrganizationsList from "./OrganizationsList";

interface OrganizationsSectionProps {
  organizations: Organization[];
  page: number;
  setPage: (page: number) => void;
  nextPageOrgs: Organization[];
  onDeleteClick: (id: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onCreateClick: () => void;
}

const OrganizationsSection = ({
  organizations,
  page,
  setPage,
  nextPageOrgs,
  onDeleteClick,
  searchQuery,
  onSearchChange,
  onCreateClick,
}: OrganizationsSectionProps) => {
  return (
    <div className="w-full max-w-6xl px-4 flex flex-col border-gray-200 p-4 rounded-[12px] border bg-white">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-6 h-6 text-gray-700" />
          <h1 className="text-2xl font-bold text-gray-900">Organizaciones</h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Buscar por nombre"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <Button
            color="primary"
            onClick={onCreateClick}
            icon={<PlusIcon size={16} />}
          >
            Nueva Organización
          </Button>
        </div>
      </div>

      <OrganizationsList
        organizations={organizations}
        page={page}
        setPage={setPage}
        nextPageOrgs={nextPageOrgs}
        onDeleteClick={onDeleteClick}
        searchQuery={searchQuery}
      />
    </div>
  );
};

export default OrganizationsSection;

