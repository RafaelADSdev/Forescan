import type { CaseStatus, UserRole } from "./types";

export const PERITOS = [
  "Nicolas Gomes",
  "Manoel Gomes",
  "Joao Pedro",
  "Rafael Arcanjo",
  "Maisa Leticia"
];

export const CASE_STATUSES: CaseStatus[] = ["Em andamento", "Finalizado", "Arquivado"];

export const USER_ROLES: UserRole[] = ["Administrador", "Perito", "Assistente"];

export const CRIME_TYPES = [
  "Furto",
  "Roubo",
  "Homicidio",
  "Estelionato",
  "Dano ao patrimonio",
  "Outro"
];

export const ETHNICITIES = [
  "Nao informada",
  "Branca",
  "Preta",
  "Parda",
  "Amarela",
  "Indigena"
];

export const LOCAL_CRIME_OPTIONS = [
  { label: "Residencia", value: 1 },
  { label: "Via publica", value: 2 },
  { label: "Comercio", value: 3 }
];
