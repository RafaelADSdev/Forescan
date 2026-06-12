"use client";

import type { CaseRecord, CaseStatus, EvidenceRecord, User, UserRole } from "./types";

const USERS_KEY = "users";
const CURRENT_USER_KEY = "usuarioLogado";
const CASES_KEY = "forescanCases";
const EVIDENCES_KEY = "forescanEvidences";
const SEEDED_CASES_KEY = "forescanSeededCases";

const defaultUsers: User[] = [
  {
    id: "admin@forescan.com",
    nome: "Administrador",
    email: "admin@forescan.com",
    senha: "admin123",
    tipo: "Administrador"
  }
];

const defaultCases: CaseRecord[] = [
  {
    id: "case-001",
    nomeCaso: "Furto em residencia",
    perito: "Rafael Arcanjo",
    status: "Em andamento",
    data: "2026-06-11",
    tipoCrime: "Furto",
    etniaVitima: "Nao informada",
    idadeVitima: 35,
    latitude: "-8.054280",
    longitude: "-34.881300",
    descricao: "Furto de eletronicos em residencia com coleta de vestigios no local.",
    observacoes: "Registro migrado como exemplo inicial da aplicacao React.",
    createdAt: "2026-06-11T12:00:00.000Z",
    updatedAt: "2026-06-11T12:00:00.000Z"
  },
  {
    id: "case-002",
    nomeCaso: "Roubo de celular",
    perito: "Nicolas Gomes",
    status: "Finalizado",
    data: "2026-06-10",
    tipoCrime: "Roubo",
    etniaVitima: "Parda",
    idadeVitima: 25,
    latitude: "-8.063149",
    longitude: "-34.871139",
    descricao: "Roubo de aparelho celular em via publica com indicios de ameaca.",
    observacoes: "Caso usado para validar dashboard, filtros e laudo.",
    createdAt: "2026-06-10T12:00:00.000Z",
    updatedAt: "2026-06-10T12:00:00.000Z"
  }
];

function isBrowser() {
  return typeof window !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function createId(prefix: string) {
  if (isBrowser() && "crypto" in window && "randomUUID" in window.crypto) {
    return `${prefix}-${window.crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ensureSeedData() {
  if (!isBrowser()) return;

  const users = readJson<User[]>(USERS_KEY, []);
  if (!Array.isArray(users) || users.length === 0) {
    writeJson(USERS_KEY, defaultUsers);
  }

  const seededCases = window.localStorage.getItem(SEEDED_CASES_KEY);
  const cases = readJson<CaseRecord[]>(CASES_KEY, []);
  if (!seededCases && (!Array.isArray(cases) || cases.length === 0)) {
    writeJson(CASES_KEY, defaultCases);
    window.localStorage.setItem(SEEDED_CASES_KEY, "1");
  }
}

export function getCurrentUser(): User | null {
  return readJson<User | null>(CURRENT_USER_KEY, null);
}

export function setCurrentUser(user: User) {
  writeJson(CURRENT_USER_KEY, {
    id: user.id || user.email,
    nome: user.nome,
    email: user.email,
    tipo: user.tipo
  });
}

export function logout() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(CURRENT_USER_KEY);
}

export function getUsers(): User[] {
  ensureSeedData();
  const users = readJson<User[]>(USERS_KEY, []);
  return Array.isArray(users) ? users : [];
}

export function validateLogin(email: string, senha: string): User | null {
  const user = getUsers().find((item) => item.email === email && item.senha === senha);
  if (!user) return null;
  setCurrentUser(user);
  return user;
}

export function saveUser(input: Omit<User, "id"> & { id?: string }) {
  const users = getUsers();
  const id = input.id || input.email;
  const nextUser: User = { ...input, id };
  const index = users.findIndex((item) => item.email === input.email || item.id === id);
  const nextUsers = index >= 0 ? users.map((item, itemIndex) => (itemIndex === index ? nextUser : item)) : [...users, nextUser];
  writeJson(USERS_KEY, nextUsers);
  return nextUser;
}

export function deleteUser(email: string) {
  const nextUsers = getUsers().filter((item) => item.email !== email);
  writeJson(USERS_KEY, nextUsers);
}

export function getCases(): CaseRecord[] {
  ensureSeedData();
  const cases = readJson<CaseRecord[]>(CASES_KEY, []);
  return Array.isArray(cases) ? cases.sort((a, b) => (b.data || "").localeCompare(a.data || "")) : [];
}

export function getCase(id: string) {
  return getCases().find((item) => item.id === id) || null;
}

export function saveCase(input: Partial<CaseRecord> & Pick<CaseRecord, "nomeCaso" | "perito" | "status" | "data" | "tipoCrime" | "descricao">) {
  const cases = getCases();
  const now = new Date().toISOString();
  const existing = input.id ? cases.find((item) => item.id === input.id) : null;
  const nextCase: CaseRecord = {
    id: input.id || createId("case"),
    nomeCaso: input.nomeCaso,
    perito: input.perito,
    status: input.status as CaseStatus,
    data: input.data,
    tipoCrime: input.tipoCrime,
    etniaVitima: input.etniaVitima || "Nao informada",
    idadeVitima: input.idadeVitima ?? null,
    latitude: input.latitude || "",
    longitude: input.longitude || "",
    descricao: input.descricao,
    observacoes: input.observacoes || "",
    createdAt: existing?.createdAt || now,
    updatedAt: now
  };

  const nextCases = existing ? cases.map((item) => (item.id === nextCase.id ? nextCase : item)) : [nextCase, ...cases];
  writeJson(CASES_KEY, nextCases);
  return nextCase;
}

export function deleteCase(id: string) {
  writeJson(CASES_KEY, getCases().filter((item) => item.id !== id));
  writeJson(EVIDENCES_KEY, getEvidences().filter((item) => item.casoId !== id));
}

export function getEvidences() {
  const evidences = readJson<EvidenceRecord[]>(EVIDENCES_KEY, []);
  return Array.isArray(evidences) ? evidences : [];
}

export function getEvidencesByCase(casoId: string) {
  return getEvidences()
    .filter((item) => item.casoId === casoId)
    .sort((a, b) => b.dataCriacao.localeCompare(a.dataCriacao));
}

export function saveEvidence(input: Omit<EvidenceRecord, "id" | "dataCriacao"> & Partial<Pick<EvidenceRecord, "id" | "dataCriacao">>) {
  const evidences = getEvidences();
  const nextEvidence: EvidenceRecord = {
    ...input,
    id: input.id || createId("evidence"),
    dataCriacao: input.dataCriacao || new Date().toISOString()
  };
  const exists = evidences.some((item) => item.id === nextEvidence.id);
  writeJson(EVIDENCES_KEY, exists ? evidences.map((item) => (item.id === nextEvidence.id ? nextEvidence : item)) : [nextEvidence, ...evidences]);
  return nextEvidence;
}

export function deleteEvidence(id: string) {
  writeJson(EVIDENCES_KEY, getEvidences().filter((item) => item.id !== id));
}

export function roleCanManageStatus(role?: UserRole) {
  return role === "Administrador" || role === "Perito";
}
