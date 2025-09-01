import { Link } from "react-router-dom";
import { SquaresIntersect, User, Users } from "lucide-react";
import MandalaMenu from "../MandalaMenu";
import { CompleteApiMandala } from "@/types/mandala";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

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

  // Función para renderizar badges de personajes para mandalas OVERLAP
  const renderCharacterBadges = () => {
    if (
      mandala.type !== "OVERLAP" ||
      !mandala.configuration.center.characters
    ) {
      return null;
    }

    const characters = mandala.configuration.center.characters;
    if (!characters.length) {
      return null;
    }

    return (
      <>
        {characters.map((character, index) => (
          <Badge
            key={`${character.id}-${index}`}
            variant="outline"
            className="text-xs px-2 py-1 border-2 font-medium rounded-full"
            style={{
              borderColor: character.color,
              color: character.color,
              backgroundColor: `${character.color}08`, // Fondo muy sutil del color
            }}
            title={`Personaje de: ${character.name}`} // Tooltip informativo
          >
            {character.name}
          </Badge>
        ))}
      </>
    );
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
          <div className="flex flex-1 items-center gap-3 flex-wrap">
            <span className="flex-shrink-0">
              {mandala.name || "Mandala sin nombre"}
            </span>
            {renderCharacterBadges()}
          </div>
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
