import type { CaseStatus } from "@/lib/types";

export function StatusBadge({ status }: { status?: CaseStatus | string }) {
  const normalized = status || "Em andamento";
  const className =
    normalized === "Finalizado"
      ? "status-badge success"
      : normalized === "Arquivado"
        ? "status-badge muted"
        : "status-badge warning";

  return <span className={className}>{normalized}</span>;
}
