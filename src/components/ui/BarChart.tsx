"use client";

import { useMemo } from "react";
import type { CSSProperties } from "react";
import type { ChartDatum } from "@/lib/analytics";

export function BarChart({ data }: { data: ChartDatum[] }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  const animationKey = useMemo(() => data.map((item) => `${item.label}:${item.value}`).join("|"), [data]);

  if (data.length === 0) {
    return <p className="muted-text">Nenhum dado disponível.</p>;
  }

  return (
    <div className="bar-chart" key={animationKey} aria-label="Gráfico de barras">
      {data.map((item, index) => {
        const widthPercent = Math.max((item.value / max) * 100, 4);
        const rowStyle = { "--bar-delay": index * 75 } as CSSProperties;
        const fillStyle = { "--bar-scale": (widthPercent / 100).toFixed(4) } as CSSProperties;

        return (
          <div className="bar-row" key={item.label} style={rowStyle}>
            <span className="bar-label">{item.label}</span>
            <div className="bar-track" aria-hidden="true">
              <span className="bar-fill" style={fillStyle} />
            </div>
            <strong className="bar-value">{item.value}</strong>
          </div>
        );
      })}
    </div>
  );
}
