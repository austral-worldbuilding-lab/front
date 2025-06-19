import React from "react";
import useMandala from "@/hooks/useMandala.ts";
import Loader from "@/components/common/Loader.tsx";
import { cn } from "@/lib/utils";

interface MandalaDimensionProps {
  dimensionName: string;
  mandalaId: string;
}

const DimensionView: React.FC<MandalaDimensionProps> = ({
  dimensionName,
  mandalaId,
}) => {
  const { mandala, loading, error } = useMandala(mandalaId);
  const config = mandala?.mandala.configuration;

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="flex flex-col justify-center items-center w-[90vw] h-[80vh]">
      <div className="flex items-center justify-center absolute top-5 left-1/2 -translate-x-1/2">
        <span className="text-blue-900 font-bold text-lg transform whitespace-nowrap">
          {dimensionName.toUpperCase()}
        </span>
      </div>

      {/* Contenedor de columnas */}
      <div className="flex flex-col h-full w-full">
        <div className="flex flex-row items-stretch h-full w-full">
          {config?.scales.map((scaleName, index) => (
            <div key={index} className="flex flex-col w-full h-full">
              <div
                className={cn(
                  "flex flex-col w-full items-center overflow-y-scroll custom-scrollbar p-3 h-[95%] border-l-2 border-white bg-blue-200",
                  index === 0 && "border-l-0 rounded-bl-xl rounded-tl-xl",
                  index === config?.scales.length - 1 &&
                    "rounded-br-xl rounded-tr-xl"
                )}
                style={{ minWidth: 0 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 md:gap-2 lg:gap-3 w-fit">
                  {mandala?.postits
                    .filter(
                      (p) =>
                        p.dimension.toLowerCase() ===
                          dimensionName.toLowerCase() &&
                        p.section.toLowerCase() === scaleName.toLowerCase()
                    )
                    .map((postit, i) => (
                      <div
                        key={i}
                        className="w-16 h-16 md:w-20 md:h-20 lg:w-23 lg:h-23 bg-yellow-400 shadow-md p-2 text-sm break-words overflow-hidden whitespace-pre-line text-ellipsis"
                        style={{ wordBreak: "break-word" }}
                      >
                        {postit.content}
                      </div>
                    ))}
                </div>
              </div>
              <div
                key={index}
                className="flex-1 flex justify-center items-center p-2"
              >
                <span className="text-blue-900 font-bold text-xs text-center">
                  {scaleName}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DimensionView;
