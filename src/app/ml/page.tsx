"use client";

import { FormEvent, useEffect, useState } from "react";
import { BarChart } from "@/components/ui/BarChart";
import { LoadingState } from "@/components/ui/LoadingState";
import { LOCAL_CRIME_OPTIONS } from "@/lib/constants";
import { getFeatureImportance, getMlApiBaseUrl, getMlStats, predictCrime } from "@/lib/ml-api";
import type { FeatureImportanceResponse, MlStatsResponse, PredictionResult } from "@/lib/types";
import { useAuthGuard } from "@/lib/use-auth-guard";

export default function MlPage() {
  const { loading } = useAuthGuard();
  const [idade, setIdade] = useState("30");
  const [genero, setGenero] = useState<"Masculino" | "Feminino">("Feminino");
  const [localCrime, setLocalCrime] = useState("2");
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [features, setFeatures] = useState<FeatureImportanceResponse | null>(null);
  const [stats, setStats] = useState<MlStatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    Promise.allSettled([getFeatureImportance(), getMlStats()]).then(([featuresResult, statsResult]) => {
      if (featuresResult.status === "fulfilled") setFeatures(featuresResult.value);
      if (statsResult.status === "fulfilled") setStats(statsResult.value);
      if (featuresResult.status === "rejected" || statsResult.status === "rejected") {
        setError(`Backend Flask indisponivel em ${getMlApiBaseUrl()}. Inicie o backend para ver os dados de ML.`);
      }
    });
  }, [loading]);

  if (loading) return <LoadingState />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPrediction(null);
    try {
      const result = await predictCrime({
        idade_vitima: Number.parseInt(idade, 10),
        genero_vitima: genero,
        local_crime: Number.parseInt(localCrime, 10)
      });
      setPrediction(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao consultar o modelo.");
    }
  }

  const featureData =
    features?.feature_importance.map((item) => ({
      label: item.feature,
      value: Number(item.importance.toFixed(3))
    })) || [];

  const statsData = stats?.por_tipo ? Object.entries(stats.por_tipo).map(([label, value]) => ({ label, value })) : [];
  const confidence = prediction ? Number(prediction.probabilidade?.[prediction.prediction] || 0) * 100 : 0;

  return (
    <>
      <header className="page-header">
        <div className="page-title">
          <span className="page-kicker">Inteligencia</span>
          <h1>Analise de ML</h1>
          <p>Predicao de tipo de crime e leitura dos indicadores expostos pela API Flask.</p>
        </div>
      </header>

      {error ? <div className="alert error">{error}</div> : null}

      <div className="two-column">
        <form className="panel" onSubmit={handleSubmit}>
          <div className="panel-header">
            <h2>Predicao</h2>
          </div>

          <div className="grid">
            <label className="form-field">
              <span>Idade da vitima</span>
              <input min="0" max="120" type="number" value={idade} onChange={(event) => setIdade(event.target.value)} required />
            </label>
            <label className="form-field">
              <span>Genero da vitima</span>
              <select value={genero} onChange={(event) => setGenero(event.target.value as "Masculino" | "Feminino")}>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
              </select>
            </label>
            <label className="form-field">
              <span>Local do crime</span>
              <select value={localCrime} onChange={(event) => setLocalCrime(event.target.value)}>
                {LOCAL_CRIME_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-actions">
            <button className="primary-button" type="submit">
              Fazer predicao
            </button>
          </div>

          {prediction ? (
            <div className="alert success">
              <strong>Resultado: {prediction.tipo_crime}</strong>
              <p>Confianca aproximada: {confidence.toFixed(2)}%</p>
            </div>
          ) : null}
        </form>

        <section className="panel">
          <div className="panel-header">
            <h2>Backend conectado</h2>
          </div>
          <p className="muted-text">API configurada: {getMlApiBaseUrl()}</p>
          <p className="muted-text">
            O modelo Python continua no Flask para preservar pandas, scikit-learn e o arquivo <code>model.pkl</code>.
          </p>
        </section>
      </div>

      <div className="two-column section-gap">
        <section className="panel">
          <div className="panel-header">
            <h2>Importancia das features</h2>
          </div>
          <BarChart data={featureData} />
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Estatisticas da API</h2>
          </div>
          <BarChart data={statsData} />
        </section>
      </div>
    </>
  );
}
