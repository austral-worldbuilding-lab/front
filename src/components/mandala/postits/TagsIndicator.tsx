import { Tag } from "@/types/mandala";
import { isDarkColor } from "@/utils/colorUtils";
import { Html } from "react-konva-utils";

export type TagsIndicatorProps = {
  width: number;
  height: number;
  tags: Tag[];
  zindex: number;
};

export const TagsIndicator = ({
  tags,
  width,
  height,
  zindex,
}: TagsIndicatorProps) => {
  return (
    <Html
      divProps={{
        style: {
          pointerEvents: "none",
          zIndex: zindex,
        },
      }}
    >
      <div
        style={{
          position: "relative",
          transform: "translateX(-20%)",
          width: `${width}px`,
          left: `${width}px`,
          height: `${height}px`,
          display: "flex",
          flexDirection: "column",
          alignItems: "end",
          overflow: "hidden",
        }}
      >
        <div className="w-full flex flex-col gap-1">
          {tags.slice(0, 2).map((tag) => {
            const isDark = isDarkColor(tag.color);
            return (
              <div
                className="flex rounded-full px-1 text-[8px] w-fit"
                style={{
                  backgroundColor: tag.color,
                  color: isDark ? "white" : "black",
                  maxWidth: `${width - width / 3}px`,
                }}
              >
                <span className="truncate">{tag.name}</span>
              </div>
            );
          })}
          {tags.length > 2 && (
            <div
              className="flex rounded-full px-1 text-[8px] italic w-fit bg-gray-400"
              style={{
                color: "black",
              }}
            >
              <span>{tags.length - 2} Tags más ...</span>
            </div>
          )}
        </div>
      </div>
    </Html>
  );
};
