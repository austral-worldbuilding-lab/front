import { Button } from "@/components/ui/button";

interface SelectAllFilesButtonProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: (selected: boolean) => Promise<void>;
  isUpdating: boolean;
}

export default function SelectAllFilesButton({
  selectedCount,
  totalCount,
  onSelectAll,
  isUpdating,
}: SelectAllFilesButtonProps) {
  if (totalCount === 0) return null;

  const hasSelected = selectedCount > 0;

  return (
    <Button
      variant="ghost"
      size="sm"
      className="p-2"
      onClick={() => onSelectAll(!hasSelected)}
      disabled={isUpdating}
    >
      {hasSelected ? "Deseleccionar todos" : "Seleccionar todos"}
    </Button>
  );
}
