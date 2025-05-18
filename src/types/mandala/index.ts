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
  position: {
    x: number;
    y: number;
  };
  category: string;
  level: number;
}

export interface Mandala {
  id: string;
  name: string;
  resources: Postit[];
  culture: Postit[];
  infrastructure: Postit[];
  economy: Postit[];
  governance: Postit[];
  ecology: Postit[];
}
