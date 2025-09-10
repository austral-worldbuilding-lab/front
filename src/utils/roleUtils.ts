import { Role } from "@/services/invitationService";

export function isAdminRole(role: Role): boolean {
  return role === "owner" || role === "admin";
}

export function isRoleDemotion(fromRole: Role, toRole: Role): boolean {
  return isAdminRole(fromRole) && !isAdminRole(toRole);
}

export function getAvailableRoles(
  targetUserRole: Role, 
  isCurrentUser: boolean
): Role[] {
  const allRoles: Role[] = ["owner", "admin", "member", "viewer"];
  
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
