import { Role } from "@/services/invitationService";

export function isAdminRole(role: Role): boolean {
  return role === "dueño" || role === "facilitador";
}

export function isRoleDemotion(fromRole: Role, toRole: Role): boolean {
  return isAdminRole(fromRole) && !isAdminRole(toRole);
}

export function getAvailableRoles(
  targetUserRole: Role, 
  isCurrentUser: boolean
): Role[] {
  const allRoles: Role[] = ["dueño", "facilitador", "worldbuilder", "lector"];
  
  if (!isCurrentUser) {
    return allRoles;
  }
  
  if (isAdminRole(targetUserRole)) {
    return allRoles.filter(role => 
      !isRoleDemotion(targetUserRole, role)
    );
  }
  return allRoles;
}
