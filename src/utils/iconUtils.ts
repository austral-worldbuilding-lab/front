import * as Icons from "lucide-react";

export const getOrganizationIcon = (name: string) => {
  const record = Icons as unknown as Record<string, Icons.LucideIcon>;
  return name && record[name] ? record[name] : Icons.Building2;
};

export const getProjectIcon = (name: string) => {
  const record = Icons as unknown as Record<string, Icons.LucideIcon>;
  return name && record[name] ? record[name] : Icons.Folder;
};
