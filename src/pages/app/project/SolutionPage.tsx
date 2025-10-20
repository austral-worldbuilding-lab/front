import { Link, useParams } from "react-router-dom";
import { ArrowLeftIcon, Folder } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import useProject from "@/hooks/useProject";
import useSolutions from "@/hooks/useSolutions";
import Loader from "@/components/common/Loader.tsx";
import EncyclopediaSection from "@/components/project/EnciclopediaSection.tsx";
import SolutionsSection from "@/components/project/SolutionSection.tsx";

export default function SolutionsPage() {
    const { organizationId, projectId } = useParams<{
        organizationId: string;
        projectId: string;
    }>();

    const { project } = useProject(projectId!);
    const { loadingPage } = useSolutions(projectId!);

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
                    <EncyclopediaSection projectId={projectId!} projectName={project?.name || "Proyecto"} />
                    <SolutionsSection projectId={projectId!} />
                </div>
            )}
        </AppLayout>
    );
}
