export interface Level {
  id: string;
  name: string;
  radius: number;
  color: string;
}

export interface Sector {
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
  content: string;
  coordinates: PostitCoordinates;
  dimension: string;
  section: string;
}

export interface Mandala {
  id: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
  postits: Postit[];
  name: string;
}

export interface SimpleMandala {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
}

export interface CreateProject {
  name: string;
  userId: string;
}