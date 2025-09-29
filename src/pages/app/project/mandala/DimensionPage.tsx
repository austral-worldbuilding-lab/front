import {useNavigate, useParams} from "react-router-dom";
import DimensionView from "@/components/mandala/DimensionView.tsx";
import {ArrowLeftIcon} from "lucide-react";

const DimensionPage = () => {
    const { mandalaId } = useParams<{ mandalaId: string }>();
    const { projectId } = useParams<{ projectId: string }>();
    const { organizationId } = useParams<{ organizationId: string }>();
    const { dimensionName } = useParams<{ dimensionName: string }>();
    const navigate = useNavigate();

    if (!dimensionName) {
        return <div className="text-red-500">Dimension name is required</div>;
    }

    if (!mandalaId) {
        return <div className="text-red-500">Mandala ID is required</div>;
    }

    if (!projectId) {
        return <div className="text-red-500">Project ID is required</div>;
    }

    return (
        <div className={"flex flex-col items-center justify-center w-screen h-screen p-4 bg-gray-100"}>
            <div className="absolute top-4 left-4 flex gap-10 z-20 flex-col">
                <button
                    onClick={() => {
                        if (organizationId && projectId) {
                            navigate(`/app/organization/${organizationId}/projects/${projectId}/mandala/${mandalaId}`);
                        } else {
                            navigate(-1);
                        }
                    }}
                    className="flex items-center gap-2 cursor-pointer"
                >
                    <ArrowLeftIcon className="w-5 h-5"/>
                    Back
                </button>
            </div>
            {dimensionName && <DimensionView
                dimensionName={dimensionName}
                mandalaId={mandalaId}
            />}
        </div>
    );
};

export default DimensionPage;
