import React, {useEffect} from "react";
import useMandala from "@/hooks/useMandala.ts";
import Loader from "@/components/common/Loader.tsx";

interface MandalaDimensionProps {
    dimensionName: string;
    mandalaId: string;
}

const DimensionView: React.FC<MandalaDimensionProps> = ({ dimensionName, mandalaId }) => {

    const {
        mandala,
        loading,
        error,
    } = useMandala(mandalaId);
    const config = mandala?.mandala.configuration

    if (loading) {
        return <Loader/>;
    }

    if (error) {
        return <div className="text-red-500">Error: {error.message}</div>;
    }

    return (
        <div className="flex w-[70vw] h-[60vh]">
            {/* Nombre de la dimensión (vertical) */}
            <div className="flex items-center justify-center w-12">
                <span className="text-blue-900 font-bold text-sm transform -rotate-90 whitespace-nowrap">
                    {dimensionName.toUpperCase()}
                </span>
            </div>

            {/* Contenedor de columnas */}
            <div className="flex flex-col bg-blue-50 h-full w-full">
                <div className="flex flex-row items-stretch h-full w-full">
                    {config?.scales.map((scaleName, index) => (
                        <div
                            key={index}
                            className="flex flex-col justify-between items-center bg-blue-200 w-full h-full border-l"
                            style={{ minWidth: 0 }}
                        >
                            <div className="flex flex-wrap justify-center gap-2 p-3 w-full overflow-y-scroll grow custom-scrollbar">
                                {mandala?.postits
                                    .filter(
                                        (p) =>
                                            p.dimension.toLowerCase() === dimensionName.toLowerCase() &&
                                            p.section.toLowerCase() === scaleName.toLowerCase()
                                    )
                                    .map((postit, i) => (
                                        <div
                                            key={i}
                                            className="w-20 h-20 bg-yellow-400 shadow-md p-1 text-sm break-words overflow-hidden whitespace-pre-line text-ellipsis"
                                            style={{ wordBreak: "break-word" }}
                                        >
                                            {postit.content}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
                {/* Labels fijos abajo */}
                <div className="flex flex-row w-[98.4%]">
                    {config?.scales.map((scale, index) => (
                        <div key={index} className="flex-1 flex justify-center items-center p-2">
                            <span className="text-blue-900 font-bold text-xs text-center">
                                {scale}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DimensionView;