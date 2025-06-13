import { Checkbox } from "./checkbox";
import { cn } from "@/lib/utils";

interface ToggleBadgeProps {
  isActive: boolean;
  onToggle: () => void;
  label: string;
  color?: string;
}

const ToggleBadge = ({
  label,
  isActive,
  onToggle,
  color,
}: ToggleBadgeProps) => {
  return (
    <div
      className={cn(
        "flex items-center gap-2 cursor-pointer border rounded-full p-2 bg-white hover:bg-gray-100 w-fit px-4",
        isActive ? "border-primary" : "border-gray-300"
      )}
      onClick={onToggle}
      style={
        color && isActive
          ? {
              borderColor: `${color}`,
              borderLeftWidth: "4px",
            }
          : color
          ? { borderLeftWidth: "4px", borderLeftColor: color }
          : {}
      }
    >
      <Checkbox checked={isActive} />
      <p className="text-sm font-medium select-none">{label}</p>
    </div>
  );
};

export default ToggleBadge;
