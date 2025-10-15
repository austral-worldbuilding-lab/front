import React, { useState, useEffect } from "react";
import { ChevronDown, Filter, Sliders, Tags } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useGetFilters } from "@/hooks/useGetFilters";
import { FilterSection } from "@/types/mandala";

interface FiltersDropdownsProps {
  mandalaId: string;
  projectId: string;
  onApplyFilters: (selectedFilters: Record<string, string[]>) => void;
  className?: string;
}


const FiltersDropdowns: React.FC<FiltersDropdownsProps> = ({
  mandalaId,
  projectId,
  onApplyFilters,
  className = "",
}) => {
  const { filters = [], isLoading } = useGetFilters(mandalaId, projectId);
  const filtersList = Array.isArray(filters) ? filters : [];
  
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});

  useEffect(() => {
    onApplyFilters(selectedFilters);
  }, [selectedFilters, onApplyFilters]);

  const handleToggle = (sectionName: string, optionLabel: string) => {
    setSelectedFilters((prev) => {
      const sectionFilters = prev[sectionName] || [];
      const updatedFilters = sectionFilters.includes(optionLabel)
        ? sectionFilters.filter((label) => label !== optionLabel)
        : [...sectionFilters, optionLabel];

      if (updatedFilters.length === 0) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [sectionName]: _, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [sectionName]: updatedFilters,
      };
    });
  };

  const isFilterActive = (sectionName: string, optionLabel: string) => {
    return (selectedFilters[sectionName] || []).includes(optionLabel);
  };


  const getDropdownIcon = (sectionName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'Dimensión': <Sliders className="w-4 h-4" />,
      'Dimensiones': <Sliders className="w-4 h-4" />,
      'Escala': <Filter className="w-4 h-4" />,
      'Escalas': <Filter className="w-4 h-4" />,
      'Tags': <Tags className="w-4 h-4" />,
      'tags': <Tags className="w-4 h-4" />,
      'Personajes': <Tags className="w-4 h-4" />,
    };
    
    return iconMap[sectionName] || <Filter className="w-4 h-4" />;
  };

  const getSelectedCount = (sectionName: string) => {
    return selectedFilters[sectionName]?.length || 0;
  };

  const hasActiveFilters = Object.values(selectedFilters).some(filters => filters.length > 0);

  const clearAllFilters = () => {
    setSelectedFilters({});
  };

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="text-sm text-gray-500">Cargando filtros...</div>
      </div>
    );
  }

  if (filtersList.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Clear all filters button when there are active filters - positioned first */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="text-gray-500 hover:text-gray-700 text-xs"
        >
          Limpiar filtros
        </Button>
      )}
      
      {filtersList.map((section: FilterSection) => {
        const selectedCount = getSelectedCount(section.sectionName);
        
        return (
          <Popover key={section.sectionName}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 h-9 px-3 py-2 text-sm border-gray-300 hover:border-gray-400 bg-white"
              >
                {getDropdownIcon(section.sectionName)}
                <span>{section.sectionName}</span>
                {selectedCount > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-full">
                    {selectedCount}
                  </span>
                )}
                <ChevronDown className="w-4 h-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-64 p-0" 
              align="start"
              side="bottom"
              sideOffset={4}
            >
              <div className="p-3">
                <div className="text-sm font-medium text-gray-900 mb-3 border-b pb-2">
                  {section.sectionName}
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {section.options.map((option) => {
                    const isActive = isFilterActive(section.sectionName, option.label);
                    
                    return (
                      <div
                        key={option.label}
                        className="flex items-center space-x-2 hover:bg-gray-50 p-1 rounded cursor-pointer"
                        onClick={() => handleToggle(section.sectionName, option.label)}
                      >
                        <Checkbox
                          id={`${section.sectionName}-${option.label}`}
                          checked={isActive}
                          onCheckedChange={() => handleToggle(section.sectionName, option.label)}
                        />
                        <label
                          htmlFor={`${section.sectionName}-${option.label}`}
                          className="text-sm flex-1 cursor-pointer"
                        >
                          {option.label}
                        </label>
                        {option.color && (
                          <div
                            className="w-3 h-3 rounded-full border border-gray-300"
                            style={{ backgroundColor: option.color }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        );
      })}
    </div>
  );
};

export default FiltersDropdowns;
