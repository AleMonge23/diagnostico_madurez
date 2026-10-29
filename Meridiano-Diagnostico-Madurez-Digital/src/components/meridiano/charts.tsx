import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type ChartRow = {
  short: string;
  name: string;
  score: number;
  /** Percentage of the comparison preset; named baseline to avoid React's reserved `ref` prop. */
  baseline: number | null;
};

type TipRow = {
  name?: string;
  value?: number;
  dataKey?: string;
  payload?: { name?: string };
};

function Tip({ active, payload }: { active?: boolean; payload?: TipRow[] }) {
  if (!active || !payload?.length) return null;
  const title = payload[0]?.payload?.name ?? "";
  return (
    <div className="rounded-xl border border-line bg-card px-3 py-2 text-sm text-ink shadow-sm">
      <p className="font-medium">{title}</p>
      {payload.map((item) => (
        <p key={String(item.dataKey)} className="tabular-nums text-muted">
          {item.dataKey === "baseline" ? "Referencia" : "Este diagnóstico"}: {item.value} %
        </p>
      ))}
    </div>
  );
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  return reduced;
}

export function ResultCharts({ rows, compareLabel }: { rows: ChartRow[]; compareLabel: string | null }) {
  const reduced = useReducedMotion();
  const compare = Boolean(compareLabel) && rows.some((row) => row.baseline !== null);
  const radarCompare = compare && rows.every((row) => row.baseline !== null);
  const tick = { fill: "var(--color-muted)", fontSize: 12 };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <figure className="rounded-2xl border border-line bg-card p-4">
        <figcaption className="mb-2 text-sm font-medium">Radar por bloques</figcaption>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={rows} cx="50%" cy="50%" outerRadius="68%">
              <PolarGrid stroke="var(--color-line)" />
              <PolarAngleAxis dataKey="short" tick={tick} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              {radarCompare ? (
                <Radar
                  name={compareLabel ?? "Referencia"}
                  dataKey="baseline"
                  stroke="var(--color-ink)"
                  fill="var(--color-ink)"
                  fillOpacity={0.08}
                  isAnimationActive={!reduced}
                />
              ) : null}
              <Radar
                name="Este diagnóstico"
                dataKey="score"
                stroke="var(--color-copper)"
                fill="var(--color-copper)"
                fillOpacity={0.28}
                isAnimationActive={!reduced}
              />
              <Tooltip content={<Tip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </figure>
      <figure className="rounded-2xl border border-line bg-card p-4">
        <figcaption className="mb-2 text-sm font-medium">Comparativa en porcentaje</figcaption>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 8, left: 4, bottom: 4 }}>
              <CartesianGrid stroke="var(--color-line)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={tick} />
              <YAxis type="category" dataKey="short" width={78} tick={tick} />
              {compare ? (
                <Bar
                  dataKey="baseline"
                  fill="var(--color-ink)"
                  fillOpacity={0.28}
                  radius={3}
                  isAnimationActive={!reduced}
                  name={compareLabel ?? "Referencia"}
                />
              ) : null}
              <Bar dataKey="score" fill="var(--color-copper)" radius={3} isAnimationActive={!reduced} name="Este diagnóstico" />
              <Tooltip content={<Tip />} cursor={{ fill: "var(--color-paper)" }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </figure>
    </div>
  );
}
