import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevenir navegación si el clic viene del menú o del botón del menú
    const target = e.target as HTMLElement;
    if (
      target.closest('[data-menu-container="true"]') ||
      target.closest("button") ||
      target.closest('[role="menuitem"]')
    ) {
      return;
    }
    navigate(`/app/organization/${organization.id}/projects`);
  };

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow relative cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative">
        <OrganizationBanner
          organization={organization}
          onDeleteClick={onDeleteClick}
        />

        <OrganizationProfile organization={organization} />
      </div>
    </div>
  );
};

export default OrganizationCard;
