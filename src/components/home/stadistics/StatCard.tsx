import Loader from "@/components/common/Loader";

interface StatCardProps {
  value: number | null;
  label: string;
  isLoading?: boolean;
  error?: Error | null;
}

const StatCard = ({
  value,
  label,
  isLoading = false,
  error = null,
}: StatCardProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 p-6 rounded-[12px] border-2 border-primary bg-white min-h-[120px]">
      {isLoading ? (
        <>
          <Loader size="small" showText={false} />
          <span className="text-sm font-medium text-primary">{label}</span>
        </>
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-2">
          <span className="text-sm text-red-500">Error</span>
          <span className="text-xs text-gray-500 text-center">
            {error.message}
          </span>
        </div>
      ) : (
        <>
          <span className="text-4xl font-bold text-primary">{value ?? 0}</span>
          <span className="text-sm font-medium text-primary">{label}</span>
        </>
      )}
    </div>
  );
};

export default StatCard;
