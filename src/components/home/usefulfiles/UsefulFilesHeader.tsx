import { BookMarked } from "lucide-react";

interface UsefulFilesHeaderProps {
  title?: string;
}

const UsefulFilesHeader = ({ title = "Recursos Útiles" }: UsefulFilesHeaderProps) => {
  return (
    <div className="flex items-center gap-2">
      <BookMarked size={20} />
      <span className="text-xl font-semibold text-foreground">{title}</span>
    </div>
  );
};

export default UsefulFilesHeader;

