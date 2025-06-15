import axiosInstance from "@/lib/axios.ts";

export const useDeleteMandala = () => {
    const deleteMandala = async (mandalaId: string) => {
        await axiosInstance.delete(`/mandala/${mandalaId}`);
    };

    return { deleteMandala };
};
