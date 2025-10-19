import { createContext, useEffect, useState, ReactNode } from "react";
import { useLocation } from "react-router-dom";

export type ProjectBreadcrumbItem = {
  title: string;
  url: string;
};

type BreadcrumbContextType = {
  stack: ProjectBreadcrumbItem[];
  push: (item: ProjectBreadcrumbItem) => void;
  pop: (amount?: number) => void;
  clear: () => void;
};

const ProjectBreadcrumbContext = createContext<BreadcrumbContextType | null>(
  null
);

export const ProjectBreadcrumbProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const KEY = "project-breadcrumb-store";
  const location = useLocation();

  const [stack, setStack] = useState<ProjectBreadcrumbItem[]>(() => {
    const store = sessionStorage.getItem(KEY);
    return store ? JSON.parse(store) : [];
  });

  useEffect(() => {
    sessionStorage.setItem(KEY, JSON.stringify(stack));
  }, [stack]);

  useEffect(() => {
    const projectPathRegex =
      /^\/app\/organization\/[^/]+\/projects\/[^/]+(\/.*)?$/;
    if (!projectPathRegex.test(location.pathname)) {
      setStack([]);
    }
  }, [location.pathname]);

  const clear = () => setStack([]);

  const pop = (amount: number = 1) => {
    setStack((prev) => prev.slice(0, Math.max(prev.length - amount, 0)));
  };

  const push = (item: ProjectBreadcrumbItem) => {
    setStack((prev) => {
      const filtered = prev.filter((i) => i.url !== item.url);
      return [...filtered, item];
    });
  };

  return (
    <ProjectBreadcrumbContext.Provider value={{ stack, push, pop, clear }}>
      {children}
    </ProjectBreadcrumbContext.Provider>
  );
};

export { ProjectBreadcrumbContext };
