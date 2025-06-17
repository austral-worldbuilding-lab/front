import { deleteMandala as deleteMandalaService } from '../services/createMandalaService.ts';

export const useDeleteMandala = () => {
    const deleteMandala = async (mandalaId: string) => {
        await deleteMandalaService(mandalaId);
    };

    return { deleteMandala };
};
