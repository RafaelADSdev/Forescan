import type { ReactNode } from "react";

type MetricVariant = "brand" | "success" | "warning";

interface MetricCardProps {
  label: string;
  value: string | number;
  detail?: string;
  variant?: MetricVariant;
  icon?: ReactNode;
}

export function MetricCard({ label, value, detail, variant = "brand", icon }: MetricCardProps) {
  return (
    <section className={`metric-card accent-${variant}`} aria-label={label}>
      <div className="metric-card-header">
        <span>{label}</span>
        {icon ? <div className="metric-card-icon">{icon}</div> : null}
      </div>
      <strong>{value}</strong>
      {detail ? <p>{detail}</p> : null}
    </section>
  );
}
