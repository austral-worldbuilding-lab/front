import { useState } from "react";
import useOrganizationUsers from "@/hooks/useOrganizationUsers";
import { Button } from "@/components/ui/button";
import OrganizationUserModal from "./OrganizationUserModal";

interface OrganizationUserCirclesProps {
  organizationId: string;
  canManageUsers: boolean;
}

const OrganizationUserCircles = ({
  organizationId,
  canManageUsers,
}: OrganizationUserCirclesProps) => {
  const { users, loading } = useOrganizationUsers(organizationId);
  const [modalOpen, setModalOpen] = useState(false);

  // Function to generate a color based on user email
  const generateColor = (email: string): string => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-red-500",
      "bg-orange-500",
      "bg-teal-500",
    ];

    // Use a simple hash function to get a consistent color for each email
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  // Get user initials from email
  const getInitials = (email: string): string => {
    // For now, just get the first letter of the email
    return email.charAt(0).toUpperCase();
  };

  // Only display the first 3 users
  const displayedUsers = users.slice(0, 3);
  const remainingCount = users.length > 3 ? users.length - 3 : 0;

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-start gap-2 py-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        <span className="text-sm text-primary">Cargando usuarios...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {displayedUsers.map((user) => (
              <div
                key={user.id}
                className={`${generateColor(
                  user.email
                )} w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-[#F8FAFF]`}
                title={user.username || user.email}
              >
                {getInitials(user.email)}
              </div>
            ))}

            {remainingCount > 0 && (
              <div className="bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-[#F8FAFF]">
                +{remainingCount}
              </div>
            )}
          </div>

          <Button
            variant="text"
            color="primary"
            className="p-0 underline h-fit"
            onClick={() => setModalOpen(true)}
          >
            Ver todos
          </Button>
        </div>
      </div>

      <OrganizationUserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        organizationId={organizationId}
        canManage={canManageUsers}
      />
    </div>
  );
};

export default OrganizationUserCircles;
