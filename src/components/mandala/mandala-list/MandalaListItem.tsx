import { Link } from "react-router-dom";
import {
  SquaresIntersect,
  SquaresIntersectIcon,
  User,
  Users,
} from "lucide-react";
import MandalaMenu from "../MandalaMenu";
import { CompleteApiMandala } from "@/types/mandala";
import { Checkbox } from "@/components/ui/checkbox";

interface MandalaListItemProps {
  mandala: CompleteApiMandala;
  organizationId: string;
  projectId: string;
  dropdownOpen: string | null;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: () => void;
}

/**
 * Componente que representa un ítem en la lista de mandalas
 * Maneja la visualización y las interacciones con cada mandala individual
 */
const MandalaListItem = ({
  mandala,
  organizationId,
  projectId,
  dropdownOpen,
  onOpenChange,
  onDelete,
  selectionMode = false,
  isSelected = false,
  onToggleSelection,
}: MandalaListItemProps) => {
  // Manejador del click en el ítem cuando está en modo selección
  const handleItemClick = (e: React.MouseEvent) => {
    if (selectionMode) {
      e.preventDefault();
      onToggleSelection?.();
    }
  };

  return (
    <li className="hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3 p-4 text-gray-800 hover:bg-gray-50 transition-colors">
        {/* Checkbox visible solo en modo selección para las mandalas de tipo personaje */}
        {selectionMode && mandala.type === "CHARACTER" && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggleSelection}
            className="mr-1"
          />
        )}

        {/* Link a la mandala o área seleccionable en modo selección */}
        <Link
          to={`/app/organization/${organizationId}/projects/${projectId}/mandala/${mandala.id}`}
          className="flex-1 flex items-center gap-3 hover:text-primary transition-colors"
          onClick={(e) => {
            if (mandala.type === "CHARACTER") {
              handleItemClick(e);
            }
            if (selectionMode) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        >
          {mandala.type === "CHARACTER" ? (
            <User
              className="w-5 h-5 flex-shrink-0"
              style={{ color: mandala.configuration.center.color || "#6b7280" }}
            />
          ) : mandala.type === "OVERLAP_SUMMARY" ? (
            <SquaresIntersect
              className="w-5 h-5 flex-shrink-0"
              style={{ color: mandala.configuration.center.color || "#6b7280" }}
            />
          ) : (
            <Users
              className="w-5 h-5 flex-shrink-0"
              style={{ color: mandala.configuration.center.color || "#6b7280" }}
            />
          )}
          <span>{mandala.name || "Mandala sin nombre"}</span>
        </Link>

        {/* Menú de opciones - visible solo cuando no está en modo selección */}
        {!selectionMode && (
          <MandalaMenu
            open={dropdownOpen === mandala.id}
            onOpenChange={onOpenChange}
            onDelete={onDelete}
          />
        )}
      </div>
    </li>
  );
};

export default MandalaListItem;
