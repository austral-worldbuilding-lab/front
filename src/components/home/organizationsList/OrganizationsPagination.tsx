import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Organization } from "@/types/mandala";

interface OrganizationsPaginationProps {
  page: number;
  setPage: (page: number) => void;
  nextPageOrgs: Organization[];
}

const OrganizationsPagination = ({
  page,
  setPage,
  nextPageOrgs,
}: OrganizationsPaginationProps) => {
  return (
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
        disabled={nextPageOrgs.length === 0}
        icon={<ChevronRight size={16} />}
      />
    </div>
  );
};

export default OrganizationsPagination;

