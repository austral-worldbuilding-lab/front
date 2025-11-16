import { getOrganizationIcon } from "@/utils/iconUtils";
import { Organization } from "@/types/mandala";

interface OrganizationProfileProps {
  organization: Organization;
}

const OrganizationProfile = ({ organization }: OrganizationProfileProps) => {
  const IconComp = getOrganizationIcon("");

  return (
    <div className="p-4">
      <div className="flex items-start gap-3">
        {/* Circular Profile Image */}
        <div className="flex-shrink-0">
          {organization.imageUrl ? (
            <img
              src={organization.imageUrl}
              alt={organization.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
              <IconComp className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {organization.name}
          </h3>
          {/* Participant Count - Comentado hasta que el backend lo envíe */}
          {/* {organization.participantCount !== undefined && (
            <p className="text-sm text-gray-500 mt-1">
              {organization.participantCount} participante
              {organization.participantCount !== 1 ? "s" : ""}
            </p>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default OrganizationProfile;

