import { FileText, Clapperboard, Link as LinkIcon, File } from "lucide-react";

interface UsefulResourceIconProps {
  fileType: string;
  url?: string;
  fileName?: string;
  size?: number;
}

const UsefulResourceIcon = ({
  fileType,
  url,
  fileName,
  size = 20,
}: UsefulResourceIconProps) => {
  const iconColor = "text-gray-500";
  const strokeWidth = 1.5;

  // Si es una imagen, mostrar la miniatura
  if (fileType.includes("image") && url) {
    return (
      <img
        src={url}
        alt={fileName || "Image"}
        className="h-8 w-8 object-cover rounded-sm"
      />
    );
  }

  // Iconos según el tipo de archivo
  if (fileType === "link") {
    return (
      <LinkIcon size={size} className={iconColor} strokeWidth={strokeWidth} />
    );
  }
  if (fileType.includes("video")) {
    return (
      <Clapperboard
        size={size}
        className={iconColor}
        strokeWidth={strokeWidth}
      />
    );
  }
  if (fileType === "application/pdf") {
    return (
      <FileText size={size} className={iconColor} strokeWidth={strokeWidth} />
    );
  }

  return <File size={size} className={iconColor} strokeWidth={strokeWidth} />;
};

export default UsefulResourceIcon;
