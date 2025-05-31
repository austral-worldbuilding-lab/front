import { Level, Sector } from "@/types/mandala";

export const Levels: Level[] = [
  {
    id: "mi-esquina",
    name: "MI ESQUINA",
    radius: 150,
    color: "rgba(200, 220, 255, 0.9)",
  },
  {
    id: "ciudad-barrio",
    name: "CIUDAD / BARRIO",
    radius: 300,
    color: "rgba(180, 210, 255, 0.7)",
  },
  {
    id: "provincia",
    name: "PROVINCIA",
    radius: 450,
    color: "rgba(160, 200, 255, 0.5)",
  },
  {
    id: "pais",
    name: "PAÍS",
    radius: 600,
    color: "rgba(140, 190, 255, 0.3)",
  },
];

const baseSectors = [
  {
    id: "ecologia",
    name: "ECOLOGÍA",
    question: "¿Qué tipo de terreno y vida hay en este lugar?",
  },
  {
    id: "gobierno",
    name: "GOBIERNO",
    question: "¿Cómo se gobierna este lugar?",
  },
  {
    id: "economia",
    name: "ECONOMÍA",
    question: "¿Cómo funciona la economía de este lugar?",
  },
  {
    id: "infraestructura",
    name: "INFRAESTRUCTURA",
    question: "¿Cómo está construido este lugar?",
  },
  {
    id: "cultura",
    name: "CULTURA",
    question: "¿Cuáles son las tradiciones y valores de este lugar?",
  },
  {
    id: "recursos",
    name: "RECURSOS",
    question: "¿Qué abunda y qué falta en este lugar?",
  },
];

export const Sectors: Sector[] = baseSectors;
