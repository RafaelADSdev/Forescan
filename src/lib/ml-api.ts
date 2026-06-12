import type { FeatureImportanceResponse, MlStatsResponse, PredictionPayload, PredictionResult } from "./types";

const DEFAULT_API_BASE_URL = "http://localhost:5000";

export function getMlApiBaseUrl() {
  return process.env.NEXT_PUBLIC_FORESCAN_API_BASE_URL || DEFAULT_API_BASE_URL;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getMlApiBaseUrl()}${path}`, init);
  if (!response.ok) {
    throw new Error(`API Flask respondeu com status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function predictCrime(payload: PredictionPayload) {
  return requestJson<PredictionResult>("/api/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

export function getFeatureImportance() {
  return requestJson<FeatureImportanceResponse>("/api/model/features");
}

export function getMlStats() {
  return requestJson<MlStatsResponse>("/api/estatisticas");
}
