import { useState } from "react";
import { updateMandala } from "@/services/mandalaService";

const useUpdateMandala = (onSuccess?: () => void) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const update = async (
        projectId: string, 
        mandalaId: string, 
        data: { name?: string; description?: string }
    ) => {
        setLoading(true);
        setError(null);
        try {
            await updateMandala(projectId, mandalaId, data);
            if (onSuccess) onSuccess();
            return true;
        } catch (e) {
            setError("Error al actualizar la mandala");
            throw e;
        } finally {
            setLoading(false);
        }
    };

    return { update, loading, error };
};

export default useUpdateMandala;
