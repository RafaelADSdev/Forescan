import type { CaseRecord } from "./types";

export interface ChartDatum {
  label: string;
  value: number;
}

export interface CaseFilters {
  dataInicio?: string;
  dataFim?: string;
  tipoCrime?: string;
  perito?: string;
  nomeCaso?: string;
}

export function formatDate(value?: string) {
  if (!value) return "N/A";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("pt-BR");
}

export function formatDateTime(value?: string) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleString("pt-BR");
}

export function filterCases(cases: CaseRecord[], filters: CaseFilters) {
  const name = filters.nomeCaso?.trim().toLowerCase() || "";
  const start = filters.dataInicio ? new Date(`${filters.dataInicio}T00:00:00`) : null;
  const end = filters.dataFim ? new Date(`${filters.dataFim}T23:59:59`) : null;

  return cases.filter((item) => {
    const itemDate = item.data ? new Date(`${item.data}T00:00:00`) : null;
    return (
      (!start || (itemDate && itemDate >= start)) &&
      (!end || (itemDate && itemDate <= end)) &&
      (!filters.tipoCrime || item.tipoCrime === filters.tipoCrime) &&
      (!filters.perito || item.perito === filters.perito) &&
      (!name || item.nomeCaso.toLowerCase().includes(name))
    );
  });
}

function countBy(cases: CaseRecord[], accessor: (item: CaseRecord) => string | null | undefined) {
  return cases.reduce<Record<string, number>>((acc, item) => {
    const key = accessor(item)?.trim() || "Nao informado";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

export function toChartData(counts: Record<string, number>): ChartDatum[] {
  return Object.entries(counts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

export function getDashboardSummary(cases: CaseRecord[]) {
  const today = new Date().toISOString().slice(0, 10);
  const byExpert = countBy(cases, (item) => item.perito);
  const topExpert = Object.entries(byExpert).sort((a, b) => b[1] - a[1])[0]?.[0] || "Nenhum";

  return {
    total: cases.length,
    today: cases.filter((item) => item.data === today).length,
    topExpert
  };
}

export function getChartSeries(cases: CaseRecord[], chart: string): ChartDatum[] {
  if (chart === "status") return toChartData(countBy(cases, (item) => item.status));
  if (chart === "tipoCrime") return toChartData(countBy(cases, (item) => item.tipoCrime));
  if (chart === "etnia") return toChartData(countBy(cases, (item) => item.etniaVitima));
  if (chart === "faixaEtaria") {
    const ranges = cases.reduce<Record<string, number>>(
      (acc, item) => {
        const age = item.idadeVitima;
        if (age === null || Number.isNaN(age)) acc["Nao informada"] += 1;
        else if (age <= 17) acc["0-17"] += 1;
        else if (age <= 29) acc["18-29"] += 1;
        else if (age <= 45) acc["30-45"] += 1;
        else if (age <= 59) acc["46-59"] += 1;
        else acc["60+"] += 1;
        return acc;
      },
      { "0-17": 0, "18-29": 0, "30-45": 0, "46-59": 0, "60+": 0, "Nao informada": 0 }
    );
    return toChartData(ranges);
  }
  if (chart === "evolucao") {
    return toChartData(countBy(cases, (item) => (item.data ? item.data.slice(0, 7) : "Nao informado"))).sort((a, b) => a.label.localeCompare(b.label));
  }
  return toChartData(countBy(cases, (item) => item.perito));
}
