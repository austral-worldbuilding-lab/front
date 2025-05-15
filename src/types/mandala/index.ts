export interface Level {
  id: string;
  name: string;
  radius: number;
  color: string;
}

export interface Sector {
  id: string;
  name: string;
  angle: number;
  question: string;
}

export interface Postit {
  id: string;
  content: string;
  levelId: string;
  sectorId: string;
  color?: string;
  position?: {
    x: number;
    y: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Mandala {
  id: string;
  title: string;
  levels: Level[];
  sectors: Sector[];
  postits: Postit[];
  createdAt: Date;
  updatedAt: Date;
}
