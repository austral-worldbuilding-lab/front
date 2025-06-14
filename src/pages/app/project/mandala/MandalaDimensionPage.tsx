import React from "react";
import { useParams } from "react-router-dom";

const MandalaDimensionPage: React.FC = () => {
    const { mandalaId, dimensionName } = useParams();

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-blue-900">Dimensión: {dimensionName}</h1>
            <p className="mt-4">Mandala ID: {mandalaId}</p>

        </div>
    );
};

export default MandalaDimensionPage;
