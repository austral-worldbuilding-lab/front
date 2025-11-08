import { useState } from "react";
import { updateOrganization, OrganizationWithPresignedUrl } from "@/services/organizationService";

const useUpdateOrganization = (onSuccess?: (updated: OrganizationWithPresignedUrl) => void) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const update = async (id: string, data: { name: string }) => {
        setLoading(true);
        setError(null);
        try {
            const updated = await updateOrganization(id, data);
            if (onSuccess) onSuccess(updated);
            return updated;
        } catch (e) {
            setError("Error al actualizar la organización");
            throw e;
        } finally {
            setLoading(false);
        }
    };

    return { update, loading, error };
};

export default useUpdateOrganization;

