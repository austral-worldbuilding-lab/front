import { ProjectBreadcrumbContext } from "@/context/ProjectBreadcrumbContext";
import { useContext } from "react";

export const useProjectBreadcrumb = () => {
  const context = useContext(ProjectBreadcrumbContext);
  if (!context) {
    throw new Error(
      "useProjectBreadcrumb must be used within a ProjectBreadcrumbProvider"
    );
  }
  return context;
};
