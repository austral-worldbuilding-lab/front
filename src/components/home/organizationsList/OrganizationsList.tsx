import { Organization } from "@/types/mandala";
import { useMemo } from "react";
import OrganizationCard from "./OrganizationCard";
import OrganizationsEmptyState from "./OrganizationsEmptyState";
import OrganizationsPagination from "./OrganizationsPagination";

interface OrganizationsListProps {
  organizations: Organization[];
  page: number;
  setPage: (page: number) => void;
  nextPageOrgs: Organization[];
  onDeleteClick: (id: string) => void;
  searchQuery: string;
}

const OrganizationsList = ({
  organizations,
  page,
  setPage,
  nextPageOrgs,
  onDeleteClick,
  searchQuery,
}: OrganizationsListProps) => {
  const filteredOrganizations = useMemo(() => {
    if (!searchQuery.trim()) return organizations;
    return organizations.filter((org) =>
      org.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [organizations, searchQuery]);

  return (
    <div>
      {filteredOrganizations.length === 0 ? (
        <OrganizationsEmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOrganizations.map((org) => (
            <OrganizationCard
              key={org.id}
              organization={org}
              onDeleteClick={onDeleteClick}
            />
          ))}
        </div>
      )}

      <OrganizationsPagination
        page={page}
        setPage={setPage}
        nextPageOrgs={nextPageOrgs}
      />
    </div>
  );
};

export default OrganizationsList;
