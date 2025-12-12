import { Role, ROLES, isAdminRole } from "@/constants/roles";

export function isRoleDemotion(fromRole: Role, toRole: Role): boolean {
  return isAdminRole(fromRole) && !isAdminRole(toRole);
}

export function getAvailableRoles(
  targetUserRole: Role, 
  isCurrentUser: boolean
): Role[] {
  const allRoles: Role[] = [...ROLES];
  
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

export { isAdminRole };
