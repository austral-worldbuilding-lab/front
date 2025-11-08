import { useUserStats } from "@/hooks/useUserStats";
import StatisticsGrid from "./StatisticsGrid";

const AccountStadistics = () => {
  const { data: stats, isLoading, error } = useUserStats();

  return (
    <div className="flex flex-col gap-6 border-gray-200 p-4 rounded-[12px] border bg-white">
      <span className="text-xl font-semibold text-foreground">
        ¡Wow! Mirá todo lo que estás generando
      </span>
      <StatisticsGrid
        stats={stats ?? null}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};

export default AccountStadistics;
