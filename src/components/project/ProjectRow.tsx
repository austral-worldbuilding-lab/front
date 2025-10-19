/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChevronDown, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import * as Icons from "lucide-react";

interface Project {
  id: string;
  name: string;
  children?: Project[];
  icon: string;
}

interface ProjectRowProps {
  project: Project;
  organizationId: string;
  level?: number;
}

export const ProjectRow = ({
  project,
  organizationId,
  level = 0,
}: ProjectRowProps) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const hasChildren = project.children && project.children.length > 0;

  // Debug: ver qué está recibiendo cada proyecto
  if (level === 0) {
    console.log(`🔹 Proyecto "${project.name}":`, {
      id: project.id,
      childrenCount: project.children?.length || 0,
      hasChildren,
    });
  }

  const handleClick = () => {
    navigate(`/app/organization/${organizationId}/projects/${project.id}`);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const IconComp = (Icons as any)[project.icon]

  return (
    <li>
      <div
        className="hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between p-3"
        style={{ paddingLeft: `${level * 20 + 12}px` }}
        onClick={handleClick}
      >
        <div className="flex items-center gap-3 flex-1 text-gray-800">
          {hasChildren ? (
            <button
              onClick={handleToggle}
              className="flex-shrink-0 hover:bg-gray-200 rounded p-0.5"
            >
              {expanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
          ) : (
            <span className="w-5" />
          )}
          <IconComp className="w-5 h-5 text-primary flex-shrink-0" />
          <span className="flex-1 text-sm font-medium">
            {project.name || "Proyecto sin nombre"}
          </span>
        </div>
      </div>

      {expanded && hasChildren && (
        <ul>
          {project.children!.map((child) => (
            <ProjectRow
              key={child.id}
              project={child}
              organizationId={organizationId}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
};
