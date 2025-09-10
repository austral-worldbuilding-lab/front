import { useState } from "react";
import { deleteOrganization as deleteOrgService } from "@/services/organizationService";

export const useDeleteOrganization = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteOrganization = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            await deleteOrgService(id);
        } catch (err: any) {
            const msg = err?.message ?? "Error al eliminar organización";
            setError(msg);
            throw new Error(msg);
        } finally {
            setLoading(false);
        }
    };

    return { deleteOrganization, loading, error };
};
