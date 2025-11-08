import { Download, SquareArrowOutUpRight } from "lucide-react";
import { UsefulResource } from "@/types/mandala";
import UsefulResourceIcon from "./UsefulResourceIcon";
import { downloadFile, openLink } from "./utils/resourceUtils";

interface UsefulResourceItemProps {
  resource: UsefulResource;
}

const UsefulResourceItem = ({ resource }: UsefulResourceItemProps) => {
  const isLink = resource.file_type === "link";

  const handleAction = () => {
    if (isLink) {
      openLink(resource.url);
    } else {
      downloadFile(resource);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 py-3 px-4 transition-colors border-b border-gray-100 ">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="h-8 w-8 flex items-center justify-center flex-shrink-0">
          <UsefulResourceIcon
            fileType={resource.file_type}
            url={resource.url}
            fileName={resource.file_name}
          />
        </div>
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-foreground hover:underline line-clamp-2"
        >
          {resource.file_name}
        </a>
      </div>
      <button
        onClick={handleAction}
        className="flex-shrink-0 p-1 hover:bg-gray-50 rounded transition-colors cursor-pointer"
        aria-label={isLink ? "Abrir enlace" : "Descargar archivo"}
      >
        {isLink ? (
          <SquareArrowOutUpRight size={16} className="text-gray-600" />
        ) : (
          <Download size={16} className="text-gray-600" />
        )}
      </button>
    </div>
  );
};

export default UsefulResourceItem;
