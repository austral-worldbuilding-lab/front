/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { createOrganization as createOrgService } from "@/services/organizationService";
import { useNavigate } from "react-router-dom";

export const useCreateOrganization = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const createOrganization = async (name: string, icon: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await createOrgService({ name, icon });
            navigate(`/app/organization/${response.data.id}/projects`);
            return response;
        } catch (err: any) {
            const msg = err?.message ?? "Error al crear organización";
            setError(msg);
            throw new Error(msg);
        } finally {
            setLoading(false);
        }
    };

    return { createOrganization, loading, error };
};
