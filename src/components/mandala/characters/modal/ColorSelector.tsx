import { cn } from "@/lib/utils";

interface ColorSelectorProps {
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  colors: string[];
  className?: string;
}

const ColorSelector = ({
  selectedColor,
  setSelectedColor,
  colors,
  className,
}: ColorSelectorProps) => {
  return (
    <div className={cn("flex flex-wrap gap-3 items-center", className)}>
      {colors.map((color) => (
        <div
          key={color}
          onClick={() => setSelectedColor(color)}
          className={`w-7 h-7 rounded-full cursor-pointer ${
            selectedColor === color
              ? "ring-2 ring-offset-2 ring-indigo-700"
              : ""
          }`}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
};

export default ColorSelector;
