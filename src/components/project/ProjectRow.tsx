import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderIcon, MoreHorizontal } from "lucide-react";
import { Button } from "../ui/button";

interface ProjectRowProps {
  project: {
    id: string;
    name: string;
  };
  organizationId: string;
}

const ProjectRow = ({ project, organizationId }: ProjectRowProps) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/app/organization/${organizationId}/projects/${project.id}`);
  };

  return (
    <li
      className="hover:bg-gray-50 transition-colors relative cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3 text-gray-800 transition-colors flex-grow">
          <FolderIcon className="w-5 h-5 text-primary flex-shrink-0" />
          <span className="flex-1 text-sm">
            {project.name || "Proyecto sin nombre"}
          </span>
        </div>
        <Button
          onClick={toggleDropdown}
          aria-label="Opciones"
          variant="ghost"
          icon={<MoreHorizontal size={16} className="text-gray-500" />}
        ></Button>
      </div>
    </li>
  );
};

export default ProjectRow;
