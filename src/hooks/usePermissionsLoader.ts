import { useEffect } from 'react';
import { usePermissions } from '@/context/PermissionsContext';

export function useOrganizationPermissions(organizationId: string | undefined) {
  const { 
    getOrganizationRole, 
    refreshOrganizationRoles, 
    canCreateProject, 
    canManageUsers,
    loading 
  } = usePermissions();

  useEffect(() => {
    if (organizationId && getOrganizationRole(organizationId) === null && !loading) {
      refreshOrganizationRoles(organizationId);
    }
  }, [organizationId, getOrganizationRole, refreshOrganizationRoles, loading]);

  return {
    role: organizationId ? getOrganizationRole(organizationId) : null,
    canCreateProject: organizationId ? canCreateProject(organizationId) : false,
    canManageUsers: organizationId ? canManageUsers(organizationId) : false,
    loading,
  };
}

export function useProjectPermissions(projectId: string | undefined) {
  const { 
    getProjectRole, 
    refreshProjectRoles, 
    canEditProject, 
    canViewProject,
    canManageProjectUsers,
    canDeleteProject,
    loading 
  } = usePermissions();

  useEffect(() => {
    if (projectId && getProjectRole(projectId) === null && !loading) {
      refreshProjectRoles(projectId);
    }
  }, [projectId, getProjectRole, refreshProjectRoles, loading]);

  return {
    userRole: projectId ? getProjectRole(projectId) : null,
    canEdit: projectId ? canEditProject(projectId) : false,
    canView: projectId ? canViewProject(projectId) : false,
    canManageUsers: projectId ? canManageProjectUsers(projectId) : false,
    canDelete: projectId ? canDeleteProject(projectId) : false,
    loading,
  };
}
