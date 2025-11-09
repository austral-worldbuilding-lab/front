import { Link } from "react-router-dom";
import { Organization } from "@/types/mandala";
import OrganizationBanner from "./OrganizationBanner";
import OrganizationProfile from "./OrganizationProfile";

interface OrganizationCardProps {
  organization: Organization;
  onDeleteClick: (id: string) => void;
}

const OrganizationCard = ({
  organization,
  onDeleteClick,
}: OrganizationCardProps) => {
  return (
    <Link to={`/app/organization/${organization.id}/projects`}>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative">
          <OrganizationBanner
            organization={organization}
            onDeleteClick={onDeleteClick}
          />

          <OrganizationProfile organization={organization} />
        </div>
      </div>
    </Link>
  );
};

export default OrganizationCard;
