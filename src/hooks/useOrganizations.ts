import { useEffect, useState } from "react";
import { getOrganizations } from "@/services/organizationService.ts";
import {Organization} from "@/types/mandala";

const useOrganizations = (initialPage = 1, initialLimit = 10) => {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [nextPageOrgs, setNextPageOrgs] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [page, setPage] = useState(initialPage);
    const [limit, setLimit] = useState(initialLimit);

    useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                setLoading(true);
                const data = await getOrganizations(page, limit);
                setOrganizations(data);

                const nextData = await getOrganizations(page + 1, limit);
                setNextPageOrgs(nextData);

            } catch (err) {
                setError(err instanceof Error ? err : new Error("Error al cargar organizaciones"));
            } finally {
                setLoading(false);
            }
        };

        fetchOrganizations();
    }, [page, limit]);

    return { organizations, nextPageOrgs, loading, error, page, setPage, limit, setLimit };
};

export default useOrganizations;
