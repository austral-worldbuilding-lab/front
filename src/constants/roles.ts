export const ROLES = ["dueño", "facilitador", "worldbuilder", "lector"] as const;
export type Role = (typeof ROLES)[number];

export function isAdminRole(role: Role): boolean {
  return role === "dueño" || role === "facilitador";
}

export function isEditorRole(role: Role): boolean {
  return role === "dueño" || role === "facilitador" || role === "worldbuilder";
}

export function isViewerRole(role: Role): boolean {
  return role === "lector";
}

