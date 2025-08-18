export interface Level {
  id: string;
  name: string;
  radius: number;
  color: string;
}

export interface Sector {
  color: string;
  id: string;
  name: string;
  question: string;
}

export interface PostitCoordinates {
  x: number;
  y: number;
  angle: number;
  percentileDistance: number;
}

export interface Postit {
  id?: string;
  content: string;
  coordinates: PostitCoordinates;
  dimension: string;
  section: string;
  tags: Tag[];
  childrens: Postit[];
}

export interface Tag {
  id: string;
  name: string;
  value?: string;
  color: string;
}

export interface Character {
  id: string;
  name: string;
  color: string;
  position: { x: number; y: number };
  dimension?: string;
  section?: string;
}

export interface Mandala {
  id: string;
  mandala: MandalData;
  updatedAt: Date;
  postits: Postit[];
  characters: Character[];
}

export interface MandalData {
  id: string;
  name: string;
  configuration: {
    dimensions: { name: string; color: string }[];
    scales: string[];
  };
  parentId: string;
}

export interface MandalaCenter {
  name: string;
  description: string;
  color: string;
}

export interface MandalaDimension {
  name: string;
  color: string;
}

export interface MandalaConfiguration {
  center: MandalaCenter;
  dimensions: MandalaDimension[];
  scales: string[];
}

export interface CompleteApiMandala {
  id: string;
  name: string;
  projectId: string;
  configuration: MandalaConfiguration;
  childrenIds: string[];
  parentIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
}

export interface CreateProject {
  name: string;
  userId: string;
  organizationId: string;
}

export interface FilterOption {
  label: string;
  color?: string;
}

export interface FilterSection {
  sectionName: string;
  type: "multiple" | "single";
  options: FilterOption[];
}

export interface BackendTag {
  id: string;
  name: string;
  color: string;
  projectId: string;
}

export interface MessageDTO {
  id: string;
  content: string;
  isUser: boolean;
  createdAt: Date;
}

export interface Organization {
  id: string;
  name: string;
}