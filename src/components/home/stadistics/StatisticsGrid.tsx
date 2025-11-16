import StatCard from "./StatCard";
import { UserStats } from "@/services/userService";

interface StatisticsGridProps {
  stats: UserStats | null;
  isLoading: boolean;
  error: Error | null;
}

const StatisticsGrid = ({ stats, isLoading, error }: StatisticsGridProps) => {
  const statsConfig = [
    {
      value: stats?.organizationsCount ?? null,
      label: stats?.organizationsCount == 1 ? "Organización" : "Organizaciones",
    },
    {
      value: stats?.projectsCount ?? null,
      label: stats?.projectsCount == 1 ? "Mundo" : "Mundos",
    },
    {
      value: stats?.mandalasCount ?? null,
      label: stats?.mandalasCount == 1 ? "Mandala" : "Mandalas",
    },
    {
      value: stats?.solutionsCount ?? null,
      label: stats?.solutionsCount == 1 ? "Solución" : "Soluciones",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {statsConfig.map((stat, index) => (
        <StatCard
          key={index}
          value={stat.value}
          label={stat.label}
          isLoading={isLoading}
          error={error}
        />
      ))}
    </div>
  );
};

export default StatisticsGrid;
