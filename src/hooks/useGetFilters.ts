import { useState, useEffect } from "react";

export interface FilterOption {
  label: string;
  color?: string;
}

export interface FilterSection {
  sectionName: string;
  type: "multiple" | "single";
  options: FilterOption[];
}

export function useGetFilters() {
  const [filters, setFilters] = useState<FilterSection[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Mock API call, the data is hardcoded for now
    // TODO: get the data from the backend in a service file
    const fetchFilters = () => {
      setIsLoading(true);

      // Mock data
      const mockFilters: FilterSection[] = [
        {
          sectionName: "Dimensiones",
          type: "multiple",
          options: [
            { label: "Cultura", color: "#FFD700" },
            { label: "Gobierno", color: "#1E90FF" },
            { label: "Economía", color: "#32CD32" },
            { label: "Infraestructura", color: "#FF69B4" },
            { label: "Ecología", color: "#FF4500" },
            { label: "Recursos", color: "#00CED1" },
          ],
        },
        {
          sectionName: "Escalas",
          type: "multiple",
          options: [
            { label: "Global" },
            { label: "Campus" },
            { label: "Persona" },
            { label: "Comunidad" },
          ],
        },
        {
          sectionName: "Tags",
          type: "multiple",
          options: [
            { label: "comedor", color: "#FF4500" },
            { label: "aula", color: "#00CED1" },
            { label: "residencia", color: "#9370DB" },
            { label: "internacional", color: "#20B2AA" },
          ],
        },
      ];

      setFilters(mockFilters);
      setIsLoading(false);
    };

    // Simulate API delay
    setTimeout(fetchFilters, 500);
  }, []);

  return { filters, isLoading };
}
