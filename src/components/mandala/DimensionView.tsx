import React from "react";
import { FilterOption } from "@/types/mandala";

interface MandalaDimensionProps {
    dimensionName: string;
    scales: FilterOption[];
}

const DimensionView: React.FC<MandalaDimensionProps> = ({ dimensionName, scales }) => {
    return (
        <div className="flex w-[70vw] h-[60vh]">
            {/* Nombre de la dimensión (vertical) */}
            <div className="flex items-center justify-center w-12">
                <span className="text-blue-900 font-bold text-sm transform -rotate-90 whitespace-nowrap">
                    {dimensionName.toUpperCase()}
                </span>
            </div>

            {/* Contenedor de columnas */}
            <div className="flex flex-col bg-blue-50 w-full">
                {/* Área scrolleable de post-its */}
                <div className="flex flex-row overflow-y-scroll items-stretch h-full w-full">
                    {scales.map((_, index) => (
                        <div
                            key={index}
                            className="flex flex-col flex-1 items-center"
                            style={{minWidth: 0}}
                        >
                            <div className="flex flex-wrap gap-2 border-l border-blue-300 bg-blue-200 p-3 min-w-full min-h-full">
                                {/* Aquí van los post-its. Post-its MOCKEADOS: */}
                                {[...Array(10)].map((_, i) => (
                                    <div key={i} className="w-20 h-20 bg-yellow-400 shadow-md p-1 text-sm">
                                        Hola, <br /> ¿todo bien?
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                {/* Labels fijos abajo */}
                <div className="flex flex-row w-[98.4%]">
                    {scales.map((scale, index) => (
                        <div key={index} className="flex-1 flex justify-center items-center p-2">
                            <span className="text-blue-900 font-bold text-xs text-center">
                                {scale.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DimensionView;