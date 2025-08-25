import React from "react";
import { CompleteApiMandala } from "@/types/mandala";
import { Link } from "react-router-dom";

interface AllMandalasViewProps {
    mandalas: CompleteApiMandala[];
    projectId: string;
    organizationId: string;
}

const AllMandalasView: React.FC<AllMandalasViewProps> = ({
    mandalas,
    projectId,
    organizationId
}) => {
    if (!mandalas || mandalas.length === 0) {
        return (
            <div className="flex items-center justify-center w-full h-full">
                <div className="text-center">
                    <p className="text-gray-500 text-lg">No hay mandalas disponibles</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full p-8 overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {mandalas.map((mandala) => (
                    <Link
                        key={mandala.id}
                        to={`/app/organization/${organizationId}/projects/${projectId}/mandala/${mandala.id}`}
                        className="block"
                    >
                        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                    {mandala.type === 'unified' ? (
                                        <div className="text-blue-600 font-bold text-sm">U</div>
                                    ) : (
                                        <div className="text-gray-600 font-bold text-sm">P</div>
                                    )}
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${mandala.type === 'unified'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {mandala.type === 'unified' ? 'Unificada' : 'Personaje'}
                                </span>
                            </div>

                            <h3 className="font-semibold text-gray-900 mb-2 truncate">
                                {mandala.name}
                            </h3>

                            <div className="text-sm text-gray-500">
                                <p>Dimensiones: {mandala.configuration.dimensions.length}</p>
                                <p>Escalas: {mandala.configuration.scales.length}</p>
                                <p className="text-xs mt-2">
                                    {new Date(mandala.updatedAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default AllMandalasView;
