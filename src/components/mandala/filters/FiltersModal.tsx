import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import ToggleBadge from "@/components/ui/toggle-badge";
import { useGetFilters } from "@/hooks/useGetFilters";
import { useState } from "react";
import { FilterSection } from "@/types/mandala";

interface CreateModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (selectedFilters: Record<string, string[]>) => void;
  mandalaId: string;
  projectId: string;
}

const FiltersModal = ({
  isOpen,
  onOpenChange,
  onApplyFilters,
  mandalaId,
  projectId,
}: CreateModalProps) => {
  const { filters, isLoading } = useGetFilters(mandalaId, projectId);
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >({});

  const handleToggle = (sectionName: string, optionLabel: string) => {
    setSelectedFilters((prev) => {
      const sectionFilters = prev[sectionName] || [];
      const updatedFilters = sectionFilters.includes(optionLabel)
        ? sectionFilters.filter((label) => label !== optionLabel)
        : [...sectionFilters, optionLabel];

      return {
        ...prev,
        [sectionName]: updatedFilters,
      };
    });
  };

  const isFilterActive = (sectionName: string, optionLabel: string) => {
    return (selectedFilters[sectionName] || []).includes(optionLabel);
  };

  const handleApplyFilters = () => {
    onApplyFilters(selectedFilters);
    console.log("selectedFilters", selectedFilters);
    onOpenChange(false);
  };

  const handleResetFilters = () => {
    setSelectedFilters({});
    onApplyFilters({});
    onOpenChange(false);
  };

  const renderFilterSection = (section: FilterSection) => (
    <div key={section.sectionName} className="mb-6">
      <h3 className="text-lg font-medium mb-2">{section.sectionName}</h3>
      <div className="flex flex-wrap gap-2">
        {section.options.map((option) => (
          <ToggleBadge
            key={option.label}
            label={option.label}
            isActive={isFilterActive(section.sectionName, option.label)}
            onToggle={() => handleToggle(section.sectionName, option.label)}
            color={option.color}
          />
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Filtros
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-4">Loading filters...</div>
          ) : (
            filters.map(renderFilterSection)
          )}
        </div>

        <DialogFooter className="flex sm:justify-between">
          <Button
            variant="outline"
            color="tertiary"
            onClick={handleResetFilters}
            icon={<Trash size={16} />}
          >
            Eliminar Filtros
          </Button>
          <Button variant="filled" color="primary" onClick={handleApplyFilters}>
            Aplicar Filtros
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FiltersModal;
