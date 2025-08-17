import { useEffect, useState } from "react";
import { Organization, getOrganizations } from "@/services/organizationService.ts";

const useOrganizations = () => {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                setLoading(true);
                const data = await getOrganizations();
                setOrganizations(data);
            } catch (err) {
                setError(err instanceof Error ? err : new Error("Error al cargar organizaciones"));
            } finally {
                setLoading(false);
            }
        };

        fetchOrganizations();
    }, []);

    return { organizations, loading, error };
};

export default useOrganizations;
