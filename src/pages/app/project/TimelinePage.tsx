import { Link, useParams } from "react-router-dom";
import { ArrowLeftIcon, Folder } from "lucide-react";
import Loader from "@/components/common/Loader";
import TimelineTree from "@/components/project/TimelineTree";
import useTimeline from "@/hooks/useTimeline.ts";
import useProject from "@/hooks/useProject.ts";
import AppLayout from "@/components/layout/AppLayout";

export default function TimelinePage() {
    const { projectId, organizationId } = useParams<{ projectId: string; organizationId: string }>();
    const { project, loading: loadingProject } = useProject(projectId!);
    const { data, loading: loadingTimeline } = useTimeline(projectId);

    const loadingPage = loadingProject || loadingTimeline;

    return (
        <AppLayout>
            {loadingPage ? (
                <div className="flex items-center justify-center min-h-screen">
                    <Loader text="Cargando línea de tiempo..." size="large" />
                </div>
            ) : (
                <div className="min-h-screen flex flex-col py-8 px-[150px] relative bg-[#F8FAFF]">
                    <div className="absolute top-10 left-10">
                        <Link to={`/app/organization/${organizationId}/projects/${projectId}`}>
                            <ArrowLeftIcon size={20} />
                        </Link>
                    </div>

                    <div className="w-full flex flex-col gap-2 flex-1">
                        <div className="flex justify-between">
                            <div className="flex flex-col gap-2">
                                <Folder size={40} className="text-primary" />
                                <h1 className="text-3xl font-bold">{project?.name || "Proyecto sin nombre"}</h1>
                                <p className="text-gray-600 text-sm">Línea de tiempo del proyecto</p>
                            </div>
                        </div>

                        <div
                            className="
                mt-2
                bg-white
                rounded-3xl
                shadow-lg
                w-full
                max-w-[1600px]
                mx-auto
                h-[calc(100vh-180px)]
                flex
                items-center
                justify-center
              "
                        >
                            {data ? (
                                <div className="w-full h-full overflow-auto">
                                    <TimelineTree className="rounded-3xl" data={data} />
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center mt-10">
                                    No hay datos disponibles para esta línea de tiempo.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
