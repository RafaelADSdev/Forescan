export type UserRole = "Administrador" | "Perito" | "Assistente";

export type CaseStatus = "Em andamento" | "Finalizado" | "Arquivado";

export interface User {
  id: string;
  nome: string;
  email: string;
  senha?: string;
  tipo: UserRole;
}

export interface CaseRecord {
  id: string;
  nomeCaso: string;
  perito: string;
  status: CaseStatus;
  data: string;
  tipoCrime: string;
  etniaVitima: string;
  idadeVitima: number | null;
  latitude: string;
  longitude: string;
  descricao: string;
  observacoes: string;
  createdAt: string;
  updatedAt: string;
}

export interface EvidenceRecord {
  id: string;
  casoId: string;
  title: string;
  description: string;
  photoDataUrl?: string;
  fileName?: string;
  dataCriacao: string;
}

export interface PredictionPayload {
  idade_vitima: number;
  genero_vitima: "Masculino" | "Feminino";
  local_crime: number;
}

export interface PredictionResult {
  prediction: number;
  tipo_crime: string;
  probabilidade: number[];
}

export interface FeatureImportanceResponse {
  feature_importance: Array<{
    feature: string;
    importance: number;
  }>;
}

export interface MlStatsResponse {
  total_casos: number;
  por_tipo: Record<string, number>;
  por_local: Record<string, number>;
  por_genero: Record<string, number>;
}
