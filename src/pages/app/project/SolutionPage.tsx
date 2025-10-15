import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeftIcon, Folder, Plus } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import useProject from "@/hooks/useProject";
import useSolutions from "@/hooks/useSolutions";
import SolutionCard from "@/components/project/SolutionCard";
import { CreateSolutionModal } from "@/components/project/CreateSolutionModal";
import Loader from "@/components/common/Loader.tsx";
import { Button } from "@/components/ui/button.tsx";

export default function SolutionsPage() {
    const { organizationId, projectId } = useParams<{
        organizationId: string;
        projectId: string;
    }>();

    const { project } = useProject(projectId!);
    const { solutions, loadingPage, creating, createSolution } = useSolutions(projectId!);
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <AppLayout>
            {loadingPage ? (
                <div className="flex items-center justify-center min-h-screen">
                    <Loader text="Cargando soluciones" />
                </div>
            ) : (
                <div className="min-h-screen flex flex-col py-8 px-[150px] relative bg-[#F8FAFF]">
                    <div className="absolute top-10 left-10">
                        <Link to={`/app/organization/${organizationId}/projects/${projectId}`}>
                            <ArrowLeftIcon size={20} />
                        </Link>
                    </div>

                    <div className="flex justify-between mb-8">
                        <div className="flex flex-col gap-2">
                            <Folder size={40} className="text-primary" />
                            <h1 className="text-3xl font-bold">{project?.name || "Proyecto"}</h1>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-[12px] shadow-sm p-8 flex flex-col gap-8 w-full">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-semibold text-gray-800">Soluciones</h2>

                            <Button
                                onClick={() => setModalOpen(true)}
                                loading={creating}
                                color="primary"
                                icon={<Plus />}
                            >
                                Crear solución
                            </Button>
                        </div>

                        {solutions.length === 0 ? (
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
                        onCreateSolution={async (solution) => {
                            await createSolution(solution);
                            setModalOpen(false);
                        }}
                        projectId={projectId!}
                    />
                </div>
            )}
        </AppLayout>
    );
}
