"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BarChart } from "@/components/ui/BarChart";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CRIME_TYPES, PERITOS } from "@/lib/constants";
import { filterCases, formatDate, getChartSeries, getDashboardSummary, type CaseFilters } from "@/lib/analytics";
import { deleteCase, getCases } from "@/lib/storage";
import { useAuthGuard } from "@/lib/use-auth-guard";

const LeafletMap = dynamic(() => import("@/components/ui/LeafletMap").then((mod) => mod.LeafletMap), {
  ssr: false,
  loading: () => <div className="leaflet-map-shell map-loading-placeholder" style={{ height: 320 }} aria-busy="true" />
});

const chartOptions = [
  { value: "perito", label: "Casos por perito" },
  { value: "status", label: "Status dos casos" },
  { value: "tipoCrime", label: "Tipos de crime" },
  { value: "etnia", label: "Etnia da vitima" },
  { value: "faixaEtaria", label: "Faixa etaria" },
  { value: "evolucao", label: "Evolucao mensal" }
];

export default function DashboardPage() {
  const { loading } = useAuthGuard();
  const [cases, setCases] = useState(() => getCases());
  const [chart, setChart] = useState(chartOptions[0].value);
  const [filters, setFilters] = useState<CaseFilters>({});

  const filteredCases = useMemo(() => filterCases(cases, filters), [cases, filters]);
  const summary = useMemo(() => getDashboardSummary(cases), [cases]);
  const chartData = useMemo(() => getChartSeries(filteredCases, chart), [filteredCases, chart]);

  if (loading) return <LoadingState />;

  function updateFilter(name: keyof CaseFilters, value: string) {
    setFilters((current) => ({ ...current, [name]: value || undefined }));
  }

  function handleDelete(id: string) {
    const shouldDelete = window.confirm("Tem certeza que deseja excluir este caso e suas evidencias?");
    if (!shouldDelete) return;
    deleteCase(id);
    setCases(getCases());
  }

  return (
    <>
      <header className="page-header">
        <div className="page-title">
          <span className="page-kicker">Operacao</span>
          <h1>Dashboard</h1>
          <p>Visao consolidada dos casos, filtros operacionais, distribuicao estatistica e localizacoes cadastradas.</p>
        </div>
        <div className="actions-row">
          <Link href="/casos/novo" className="primary-button">
            Novo caso
          </Link>
        </div>
      </header>

      <section className="metrics-grid" aria-label="Indicadores principais">
        <MetricCard
          label="Total de casos"
          value={summary.total}
          detail="Registros no sistema"
          variant="brand"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          }
        />
        <MetricCard
          label="Registrados hoje"
          value={summary.today}
          detail="Com base na data atual"
          variant="success"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          }
        />
        <MetricCard
          label="Perito mais ativo"
          value={summary.topExpert}
          detail="Maior volume de casos"
          variant="warning"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          }
        />
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Filtros</h2>
          <button className="secondary-button" type="button" onClick={() => setFilters({})}>
            Limpar filtros
          </button>
        </div>
        <div className="form-grid">
          <label className="form-field">
            <span>Inicio</span>
            <input type="date" value={filters.dataInicio || ""} onChange={(event) => updateFilter("dataInicio", event.target.value)} />
          </label>
          <label className="form-field">
            <span>Fim</span>
            <input type="date" value={filters.dataFim || ""} onChange={(event) => updateFilter("dataFim", event.target.value)} />
          </label>
          <label className="form-field">
            <span>Tipo de crime</span>
            <select value={filters.tipoCrime || ""} onChange={(event) => updateFilter("tipoCrime", event.target.value)}>
              <option value="">Todos</option>
              {CRIME_TYPES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Perito</span>
            <select value={filters.perito || ""} onChange={(event) => updateFilter("perito", event.target.value)}>
              <option value="">Todos</option>
              {PERITOS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field full">
            <span>Nome do caso</span>
            <input value={filters.nomeCaso || ""} onChange={(event) => updateFilter("nomeCaso", event.target.value)} placeholder="Digite parte do nome" />
          </label>
        </div>
      </section>

      <div className="two-column section-gap">
        <section className="panel">
          <div className="panel-header">
            <h2>Graficos</h2>
            <select value={chart} onChange={(event) => setChart(event.target.value)}>
              {chartOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <BarChart data={chartData} />
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Localizacoes</h2>
            <span className="muted-text">{filteredCases.length} caso(s)</span>
          </div>
          <LeafletMap cases={filteredCases} height={320} />
        </section>
      </div>

      <section className="panel section-gap">
        <div className="panel-header">
          <h2>Casos registrados</h2>
          <span className="muted-text">{filteredCases.length} resultado(s)</span>
        </div>

        {filteredCases.length === 0 ? (
          <EmptyState title="Nenhum caso encontrado" description="Ajuste os filtros ou cadastre um novo caso." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Perito</th>
                  <th>Status</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map((item) => (
                  <tr key={item.id}>
                    <td>{item.nomeCaso}</td>
                    <td>{formatDate(item.data)}</td>
                    <td>{item.tipoCrime}</td>
                    <td>{item.perito}</td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td>
                      <div className="toolbar">
                        <Link className="secondary-button" href={`/casos/${item.id}`}>
                          Ver
                        </Link>
                        <Link className="secondary-button" href={`/casos/${item.id}/editar`}>
                          Editar
                        </Link>
                        <Link className="secondary-button" href={`/casos/${item.id}/evidencias`}>
                          Evidencias
                        </Link>
                        <button className="danger-button" type="button" onClick={() => handleDelete(item.id)}>
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
