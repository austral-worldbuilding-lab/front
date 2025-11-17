import { Badge } from "@/components/ui/badge.tsx";
import MandalaMenu from "@/components/mandala/MandalaMenu";
import { Organization } from "@/types/mandala";

interface OrganizationBannerProps {
  organization: Organization;
  onDeleteClick: (id: string) => void;
}

const OrganizationBanner = ({
  organization,
  onDeleteClick,
}: OrganizationBannerProps) => {
  return (
    <>
      {organization.bannerUrl ? (
        <div className="relative w-full h-32 overflow-hidden">
          <img
            src={organization.bannerUrl}
            alt={`${organization.name} banner`}
            className="w-full h-full object-cover"
          />
          {organization.accessType === "limited" && (
            <Badge
              className="absolute top-2 left-2 bg-purple-100 text-gray-700 border-purple-200"
              variant="outline"
            >
              Acceso Limitado
            </Badge>
          )}
          {organization.accessType === "full" && (
            <div
              className="absolute top-2 right-2 z-50"
              data-menu-container="true"
              onClick={(e) => e.stopPropagation()}
            >
              <MandalaMenu onDelete={() => onDeleteClick(organization.id)} />
            </div>
          )}
        </div>
      ) : (
        <div className="relative w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200">
          {organization.accessType === "limited" && (
            <Badge
              className="absolute top-2 left-2 bg-purple-100 text-gray-700 border-purple-200"
              variant="outline"
            >
              Acceso Limitado
            </Badge>
          )}
          {organization.accessType === "full" && (
            <div
              className="absolute top-2 right-2 z-50"
              data-menu-container="true"
              onClick={(e) => e.stopPropagation()}
            >
              <MandalaMenu onDelete={() => onDeleteClick(organization.id)} />
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default OrganizationBanner;
