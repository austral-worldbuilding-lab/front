import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export type ProjectBreadcrumbItem = {
  title: string;
  url: string;
};

export const useProjectBreadcrumb = () => {
  const KEY = `project-breadcrumb-store`;

  const location = useLocation();

  const [stack, setStack] = useState<ProjectBreadcrumbItem[]>(() => {
    const store = sessionStorage.getItem(KEY);
    return store ? JSON.parse(store) : [];
  });

  useEffect(() => {
    sessionStorage.setItem(KEY, JSON.stringify(stack));
  }, [KEY, stack]);

  useEffect(() => {
    const store = sessionStorage.getItem(KEY);
    setStack(store ? JSON.parse(store) : []);
  }, [KEY, location]);

  const clear = () => setStack([]);

  const pop = (amount: number = 1) => {
    setStack((prev) => prev.slice(0, Math.max(prev.length - amount, 0)));
  };

  const push = (item: ProjectBreadcrumbItem) => {
    setStack((prev) => [...prev, item]);
  };

  return {
    stack,
    clear,
    pop,
    push,
  };
};
