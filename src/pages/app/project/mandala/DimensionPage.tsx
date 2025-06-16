import { useParams } from "react-router-dom";
import DimensionView from "@/components/mandala/DimensionView.tsx";
import {useEffect, useState} from "react";
import {getFilters} from "@/services/mandalaService.ts";
import {FilterOption, FilterSection} from "@/types/mandala";

const DimensionPage = () => {
    const { mandalaId } = useParams<{ mandalaId: string }>();
    const { dimensionName } = useParams<{ dimensionName: string }>();
    const [ scales, setScales ] = useState<FilterOption[]>([]);

    useEffect(() => {
        const fetchScales = async () => {
            try {
                if (!mandalaId) {
                    console.error("Mandala ID is required to fetch scales");
                    return;
                }
                const response : FilterSection[] = await getFilters(mandalaId);
                const scalesFound = response.find(filter => filter.sectionName === "Escalas");
                if (!scalesFound) {
                    console.error("No scales found in the response");
                    return;
                }
                setScales(scalesFound.options);
            } catch (error) {
                console.error("Error fetching scales:", error);
            }
        };

        fetchScales();
    }, [mandalaId]);

    if (!dimensionName) {
        return <div className="text-red-500">Dimension name is required</div>;
    }

    return (
        <div className={"flex flex-col items-center justify-center w-screen h-screen p-4 bg-gray-100"}>
            {dimensionName && <DimensionView
                dimensionName={dimensionName}
                scales={scales}
            />}
        </div>
    );
};

export default DimensionPage;
