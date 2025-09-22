import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthContext } from './AuthContext';
import { getOrganizationUsers } from '@/services/userService';
import { getProjectUsers } from '@/services/userService';

type Role = 'owner' | 'admin' | 'member' | 'viewer';

interface UserPermissions {
  organizationRoles: Map<string, Role>;
  projectRoles: Map<string, Role>;
  loading: boolean;
  error: string | null;
}

interface PermissionsContextType extends UserPermissions {
  getOrganizationRole: (orgId: string) => Role | null;
  getProjectRole: (projectId: string) => Role | null;
  canCreateProject: (orgId: string) => boolean;
  canManageUsers: (orgId: string) => boolean;
  canEditProject: (projectId: string) => boolean;
  canViewProject: (projectId: string) => boolean;
  canManageProjectUsers: (projectId: string) => boolean;
  refreshOrganizationRoles: (orgId: string) => Promise<void>;
  refreshProjectRoles: (projectId: string) => Promise<void>;
  clearCache: () => void;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

interface PermissionsProviderProps {
  children: ReactNode;
}

export const PermissionsProvider: React.FC<PermissionsProviderProps> = ({ children }) => {
  const { user } = useAuthContext();
  const [organizationRoles, setOrganizationRoles] = useState<Map<string, Role>>(new Map());
  const [projectRoles, setProjectRoles] = useState<Map<string, Role>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearCache = () => {
    setOrganizationRoles(new Map());
    setProjectRoles(new Map());
    setError(null);
  };

  useEffect(() => {
    if (!user) {
      clearCache();
    }
  }, [user]);

  const getOrganizationRole = (orgId: string): Role | null => {
    return organizationRoles.get(orgId) || null;
  };

  const getProjectRole = (projectId: string): Role | null => {
    return projectRoles.get(projectId) || null;
  };

  const canCreateProject = (orgId: string): boolean => {
    const role = getOrganizationRole(orgId);
    return role === 'owner' || role === 'admin';
  };

  const canManageUsers = (orgId: string): boolean => {
    const role = getOrganizationRole(orgId);
    return role === 'owner' || role === 'admin';
  };

  const canManageProjectUsers = (projectId: string): boolean => {
    const role = getProjectRole(projectId);
    return role === 'owner' || role === 'admin';
  };

  const canEditProject = (projectId: string): boolean => {
    const role = getProjectRole(projectId);
    return role === 'owner' || role === 'admin' || role === 'member';
  };

  const canViewProject = (projectId: string): boolean => {
    const role = getProjectRole(projectId);
    return role !== null; // Any role can view
  };

  const refreshOrganizationRoles = async (orgId: string): Promise<void> => {
    if (!user || !orgId) return;

    try {
      setLoading(true);
      setError(null);
      
      const users = await getOrganizationUsers(orgId);
      const currentUser = users.find(u => u.id === user.uid);
      
      if (currentUser) {
        setOrganizationRoles(prev => new Map(prev.set(orgId, currentUser.role as Role)));
      } else {
        setOrganizationRoles(prev => {
          const newMap = new Map(prev);
          newMap.delete(orgId);
          return newMap;
        });
      }
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setOrganizationRoles(prev => {
          const newMap = new Map(prev);
          newMap.delete(orgId);
          return newMap;
        });
      } else {
        setError(err?.message || 'Error loading organization permissions');
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshProjectRoles = async (projectId: string): Promise<void> => {
    if (!user || !projectId) return;

    try {
      setLoading(true);
      setError(null);
      
      const users = await getProjectUsers(projectId);
      const currentUser = users.find(u => u.id === user.uid);
      
      if (currentUser) {
        setProjectRoles(prev => new Map(prev.set(projectId, currentUser.role as Role)));
      } else {
        // User is not in project, remove from cache
        setProjectRoles(prev => {
          const newMap = new Map(prev);
          newMap.delete(projectId);
          return newMap;
        });
      }
    } catch (err: any) {
      if (err?.response?.status === 403) {
        // User doesn't have permission, remove from cache
        setProjectRoles(prev => {
          const newMap = new Map(prev);
          newMap.delete(projectId);
          return newMap;
        });
      } else {
        setError(err?.message || 'Error loading project permissions');
      }
    } finally {
      setLoading(false);
    }
  };

  const value: PermissionsContextType = {
    organizationRoles,
    projectRoles,
    loading,
    error,
    getOrganizationRole,
    getProjectRole,
    canCreateProject,
    canManageUsers,
    canEditProject,
    canViewProject,
    canManageProjectUsers,
    refreshOrganizationRoles,
    refreshProjectRoles,
    clearCache,
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = (): PermissionsContextType => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};
