/* eslint-disable @typescript-eslint/no-unused-vars */
import { getOrganizationById } from "@/services/organizationService";
import { Organization } from "@/types/mandala";
import { useCallback, useEffect, useState } from "react";

export const useOrganization = (organizationId?: string) => {
  const [organization, setOrganization] = useState<Organization | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganization = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getOrganizationById(organizationId);
      setOrganization(data);
    } catch (e) {
      setError("Error cargando el proyecto");
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchOrganization();
  }, [organizationId, fetchOrganization]);

  return {
    organization,
    loading,
    error,
  };
};
