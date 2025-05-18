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
  content: string;
  position: {
    x: number;
    y: number;
  };
  category: string;
  level: number;
}

export interface PostitDocument extends Postit {
  id: string;
}

export interface Mandala {
  id: string;
  name: string;
  resources: PostitDocument[];
  culture: PostitDocument[];
  infrastructure: PostitDocument[];
  economy: PostitDocument[];
  governance: PostitDocument[];
  ecology: PostitDocument[];
}
