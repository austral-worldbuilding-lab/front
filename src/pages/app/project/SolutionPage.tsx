import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import SolutionCard from "@/components/project/SolutionCard";
import { Plus, ArrowLeftIcon, Folder } from "lucide-react";
import { CreateSolutionModal } from "@/components/project/CreateSolutionModal";
import useSolutions from "@/hooks/useSolutions";
import {Solution} from "@/types/mandala";


export default function SolutionsPage() {
    const { projectId, organizationId } = useParams<{ projectId: string; organizationId: string }>();
    const [modalOpen, setModalOpen] = useState(false);
    const { solutions, loading, reload, create } = useSolutions(projectId!);

    const handleCreateSolution = async (solution: Omit<Solution, "id">) => {
        try {
            await create(solution);
            setModalOpen(false);
            reload();
        } catch (err) {
            console.error("Error creating solution:", err);
        }
    };

    useEffect(() => {
        reload();
    }, [projectId]);

    return (
        <div className="min-h-screen flex flex-col py-8 px-[150px] relative bg-[#F8FAFF]">
            <div className="absolute top-10 left-10">
                <Link to={`/app/organization/${organizationId}/projects/${projectId}`}>
                    <ArrowLeftIcon size={20} className="text-gray-700 hover:text-gray-900 transition-colors" />
                </Link>
            </div>

            <div className="flex items-center gap-4 mb-6">
                <Folder size={40} className="text-primary" />
                <h1 className="text-3xl font-bold text-gray-900">Soluciones</h1>
            </div>

            <div className="bg-white border border-gray-200 rounded-[12px] shadow-sm p-8 mx-auto flex flex-col gap-8 w-full max-w-[1200px]">
                <div className="flex justify-end items-center">
                    <button
                        onClick={() => setModalOpen(true)}
                        className="flex items-center gap-2 bg-primary text-white font-medium text-sm px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        <Plus size={18} />
                        Crear solución
                    </button>
                </div>

                {loading ? (
                    <p className="text-gray-500 text-center">Cargando soluciones...</p>
                ) : solutions.length === 0 ? (
                    <div className="border border-dashed border-gray-300 rounded-lg p-10 text-center text-gray-500 w-full h-[350px] flex flex-col items-center justify-center">
                        <p className="text-lg font-medium mb-2">Aún no hay soluciones creadas</p>
                        <p className="text-sm">Usá el botón “Crear solución” para agregar una nueva.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {solutions.map((solution) => (
                            <SolutionCard key={solution.id} solution={solution} />
                        ))}
                    </div>
                )}
            </div>

            <CreateSolutionModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                onCreateSolution={handleCreateSolution}
                projectId={projectId!}
            />
        </div>
    );
}
