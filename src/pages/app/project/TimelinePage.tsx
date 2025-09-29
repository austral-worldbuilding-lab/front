import { useParams, Link } from "react-router-dom";
import TimelineTree from "@/components/project/TimelineTree";
import { ArrowLeftIcon } from "lucide-react";
import Loader from "@/components/common/Loader";
import useTimeline from "@/hooks/useTimeline.ts";

export default function TimelinePage() {
    const { projectId, organizationId } = useParams<{ projectId: string; organizationId: string }>();
    const { data, loading } = useTimeline(projectId);


    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex items-center gap-3 p-4 border-b bg-white shadow-sm">
                <Link
                    to={`/app/organization/${organizationId}/projects/${projectId}`}
                    className="flex items-center text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                </Link>
                <h2 className="text-xl sm:text-2xl font-bold">
                    Línea de tiempo
                </h2>
            </div>

            <div className="flex-1 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader size="large" text="Cargando línea de tiempo..." />
                    </div>
                ) : data ? (
                    <TimelineTree data={data} />
                ) : (
                    <p className="text-gray-500 text-center mt-10">
                        No hay datos disponibles para esta línea de tiempo.
                    </p>
                )}
            </div>
        </div>
    );

}
