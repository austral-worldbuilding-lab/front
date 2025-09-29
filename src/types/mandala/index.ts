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
  // Optional provenance info when a postit comes from another mandala
  from?: { id: string; name: string };
  fromSummary?: string[];
  type?: "SIMILITUD" | "DIFERENCIA" | "UNICO";
  editingUsers?: EditingUser[]
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
  description: string;
  position: { x: number; y: number };
  dimension?: string;
  section?: string;
}

export interface MandalaImage {
  id: string;
  url: string;
  coordinates: { x: number; y: number };
  dimension: string;
  section: string;
}

export interface Mandala {
  id: string;
  mandala: MandalData;
  updatedAt: Date;
  postits: Postit[];
  characters: Character[];
  images?: MandalaImage[];
}

export interface MandalData {
  id: string;
  name: string;
  type?: "CHARACTER" | "OVERLAP" | "OVERLAP_SUMMARY";
  configuration: MandalaConfiguration;
  parentId: string;
}

export interface MandalaCenter {
  name: string;
  description: string;
  color: string;
  characters?: Character[];
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
  type: "CHARACTER" | "OVERLAP" | "OVERLAP_SUMMARY";
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
  description?: string;
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
  accessType?: 'full' | 'limited';
}
export interface FileItem {
  id: string;
  file_name: string;
  file_type: string;
  source_scope: string;
  full_path: string;
  url: string;
  selected: boolean;
}


export interface Provocation {
  projectsOrigin: ProvocationProject[];
  id: string;
  title: string;
  question: string;
  description?: string;
  isCached?: boolean;
}

export interface ProvocationProject{
    "id": string,
    "name": string,
    "description": string,
    "organizationId": string,
}

export interface EditingUser {
  id: string;
  displayName: string;
}
