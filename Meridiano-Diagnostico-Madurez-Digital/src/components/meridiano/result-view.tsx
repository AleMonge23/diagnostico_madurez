import { lazy, Suspense, useEffect, useState } from "react";
import { Printer, RotateCcw } from "lucide-react";
import {
  BLOCKS,
  LEVELS,
  PRESETS,
  formatPct,
  heroPct,
  scoreDiagnosis,
  sizeLabel,
  type BlockScore,
  type DiagnosticState,
  type PresetId,
} from "@/lib/maturity/model";
import type { ChartRow } from "@/components/meridiano/charts";

const ResultCharts = lazy(() => import("@/components/meridiano/charts").then((mod) => ({ default: mod.ResultCharts })));

function useCount(target: number) {
  const [value, setValue] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setValue(target);
      setDone(true);
      return;
    }
    setDone(false);
    const started = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - started) / 900);
      const eased = 1 - (1 - t) ** 3;
      if (t < 1) {
        setValue(target * eased);
        frame = requestAnimationFrame(tick);
      } else {
        setValue(target);
        setDone(true);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return { value, done };
}

function Skyline({ rows, grown, compare }: { rows: ChartRow[]; grown: boolean; compare: boolean }) {
  return (
    <div className="flex h-52 gap-1 sm:gap-2" role="img" aria-label="Porcentaje de cada bloque">
      {rows.map((row) => (
        <div key={row.name} className="flex min-w-0 flex-1 flex-col">
          <div className="relative min-h-0 flex-1">
            <div
              className="sky-bar absolute inset-x-0 bottom-0 rounded-t bg-copper"
              style={{ height: grown ? `${row.score}%` : "0%" }}
            />
            {compare && row.baseline !== null ? (
              <span className="absolute inset-x-0 h-0.5 bg-ink" style={{ bottom: `${row.baseline}%` }} />
            ) : null}
          </div>
          <p className="h-10 truncate pt-2 text-center text-xs text-muted" title={row.name}>
            {row.short}
          </p>
        </div>
      ))}
    </div>
  );
}

function BlockList({ items, empty }: { items: BlockScore[]; empty: string }) {
  if (items.length === 0) return <p className="text-sm text-muted">{empty}</p>;
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-medium">{item.name}</span>
            <span className="tabular-nums">{formatPct(item.pct)} %</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-line">
            <div className="h-1.5 rounded-full bg-copper" style={{ width: `${item.pct}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ResultView({
  state,
  onQuiz,
  onRestart,
}: {
  state: DiagnosticState;
  onQuiz: () => void;
  onRestart: () => void;
}) {
  const diagnosis = scoreDiagnosis(state.profile, state.answers);
  const [compare, setCompare] = useState<PresetId | "none">("none");
  const [grown, setGrown] = useState(false);
  const count = useCount(diagnosis.global ?? 0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!diagnosis.complete || diagnosis.global === null || !diagnosis.level) {
    return (
      <section className="mx-auto max-w-xl py-16 text-center">
        <h2 className="font-serif text-3xl">Aún no hay diagnóstico</h2>
        <p className="mt-3 text-muted">
          {diagnosis.missing > 0
            ? `Faltan ${diagnosis.missing} respuestas. Una casilla vacía no cuenta como cero.`
            : "Todas las respuestas son «No aplica». No hay bloques que promediar: revisa si de verdad ninguna pregunta encaja."}
        </p>
        <button type="button" onClick={onQuiz} className="mt-6 inline-flex min-h-12 items-center rounded-full bg-ink px-5 font-medium text-paper">
          Volver al cuestionario
        </button>
      </section>
    );
  }

  const hero = heroPct(diagnosis.global);
  const shown = count.done ? hero.text : formatPct(count.value);
  const refDiagnosis = compare === "none" ? null : scoreDiagnosis(PRESETS[compare].profile, PRESETS[compare].answers);
  const refById = new Map(refDiagnosis?.blocks.map((block) => [block.id, block]) ?? []);
  const rows: ChartRow[] = diagnosis.blocks
    .filter((block) => block.status === "scored")
    .map((block) => {
      const baselineBlock = refById.get(block.id);
      return {
        short: block.short,
        name: block.name,
        score: block.pct,
        baseline: baselineBlock && baselineBlock.status === "scored" ? baselineBlock.pct : null,
      };
    });
  const excluded = diagnosis.blocks.filter((block) => block.status === "excluded");
  const when = state.completedAt
    ? new Intl.DateTimeFormat("es-ES", { dateStyle: "long" }).format(new Date(state.completedAt))
    : null;
  const origin = state.origin ? PRESETS[state.origin] : null;
  const edited =
    origin !== null &&
    BLOCKS.some((block) => block.questions.some((q) => state.answers[q.id] !== origin.answers[q.id]));

  return (
    <div className="reveal space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Informe de madurez digital{when ? ` · ${when}` : ""}</p>
          <h2 className="mt-1 font-serif text-4xl md:text-5xl">{state.profile.alias}</h2>
          <p className="mt-2 text-muted">
            {state.profile.sector} · {sizeLabel(state.profile.size)} ·{" "}
            {state.profile.caseType === "real" ? "caso real anonimizado" : "caso simulado"}
            {state.profile.industrial ? " · con planta" : ""}
          </p>
          {origin ? (
            <p className="mt-1 text-sm text-muted">
              {edited ? `Editado a partir de ${origin.profile.alias}.` : origin.badge + "."}
            </p>
          ) : null}
        </div>
        <div className="no-print flex flex-wrap gap-2">
          <button type="button" onClick={onQuiz} className="inline-flex min-h-11 items-center rounded-full border border-ink px-4 text-sm font-medium">
            Revisar respuestas
          </button>
          <button type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ink px-4 text-sm font-medium">
            <Printer className="size-4" aria-hidden="true" />
            Guardar PDF
          </button>
          <button type="button" onClick={onRestart} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-4 text-sm font-medium text-paper">
            <RotateCcw className="size-4" aria-hidden="true" />
            Nuevo
          </button>
        </div>
      </header>

      <section className="grid items-center gap-6 rounded-3xl border border-line bg-card p-5 md:grid-cols-[minmax(0,16rem)_1fr] md:p-8">
        <div>
          <Gauge value={count.value} label={`${shown} por ciento, nivel ${diagnosis.level.id}`} />
          <p className="text-center font-serif text-5xl tabular-nums text-copper">{shown} %</p>
          <p className="text-center text-sm text-muted">Nota global</p>
        </div>
        <div>
          <p className="text-sm font-medium text-copper">Nivel {diagnosis.level.id}</p>
          <h3 className="font-serif text-4xl">{diagnosis.level.name}</h3>
          <p className="mt-3 max-w-xl text-lg leading-relaxed">{diagnosis.level.reading}</p>
          <p className="mt-3 max-w-xl text-sm text-muted">
            Media de {diagnosis.blocks.filter((block) => block.status === "scored").length} bloques aplicables. Cada
            bloque pesa igual. {hero.caution ? "El nivel usa el porcentaje exacto: el redondeo a un decimal cambiaría de tramo." : "El nivel usa el porcentaje exacto, no el número ya redondeado."}
          </p>
          <Ruler score={diagnosis.global} />
        </div>
      </section>

      {state.profile.context ? (
        <p className="max-w-3xl text-pretty leading-relaxed">{state.profile.context}</p>
      ) : null}

      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <h3 className="font-serif text-2xl">Mapa por bloques</h3>
          <div className="no-print flex flex-wrap gap-2" role="group" aria-label="Comparar con un perfil de prueba">
            {(
              [
                ["none", "Solo este"],
                ["baja", "Poca digitalización"],
                ["alta", "Avanzada"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={compare === id}
                onClick={() => setCompare(id)}
                className={
                  "min-h-11 rounded-full px-3 text-sm " +
                  (compare === id ? "bg-ink text-paper" : "border border-line bg-card")
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <Skyline rows={rows} grown={grown || count.done} compare={compare !== "none"} />
        <p className="text-sm text-muted">
          La altura es el porcentaje del bloque, de 0 a 100, no los puntos brutos.
          {compare !== "none" ? " La raya negra es el perfil de referencia." : ""}
          {excluded.length > 0 ? " Los bloques con todo «No aplica» no se dibujan ni entran en la media." : ""}
        </p>
      </section>

      <Suspense fallback={<p className="rounded-2xl border border-line bg-card p-5 text-sm text-muted">Cargando gráficos…</p>}>
        <ResultCharts rows={rows} compareLabel={compare === "none" ? null : PRESETS[compare].profile.alias} />
      </Suspense>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-line bg-card p-5">
          <h3 className="font-serif text-2xl">Donde más sostiene</h3>
          <p className="mt-1 mb-4 text-sm text-muted">
            {diagnosis.strengthMode === "firmes"
              ? "Bloques en el 60 % o más, fuera de los tres más bajos."
              : diagnosis.strengthMode === "relativas"
                ? "Todavía no hay un bloque medido y mejorado (60 % o más). Esto es solo lo menos flojo."
                : "No hay un apoyo claro separado de los huecos."}
          </p>
          <BlockList items={diagnosis.strengths} empty="Sin bloque que destacar." />
        </article>
        <article className="rounded-2xl border border-line bg-card p-5">
          <h3 className="font-serif text-2xl">Donde más frena</h3>
          <p className="mt-1 mb-4 text-sm text-muted">Los tres porcentajes más bajos. El plan de abajo no sigue este orden a ciegas.</p>
          <BlockList items={diagnosis.gaps} empty="Sin huecos calculados." />
        </article>
      </section>

      <section>
        <h3 className="font-serif text-2xl">Plan en 90 días</h3>
        <p className="mt-1 mb-4 max-w-3xl text-sm text-muted">
          Primero lo que sostiene la operación. Si la ciberseguridad está en el 40 % o menos, entra aunque otro bloque
          tenga menos puntos. La innovación no adelanta a un básico aún flojo. Una acción por bloque.
        </p>
        <ol className="space-y-3">
          {diagnosis.plan.map((item, index) => (
            <li key={item.id} className="grid gap-3 rounded-2xl border border-line bg-card p-4 sm:grid-cols-[auto_1fr]">
              <div className="flex items-center gap-3 sm:flex-col sm:items-start">
                <span className="font-serif text-2xl tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                <span
                  className={
                    "rounded-full px-2 py-1 text-xs font-medium " +
                    (item.priority === "Alta"
                      ? "bg-ink text-paper"
                      : item.priority === "Media"
                        ? "border border-ink"
                        : "border border-line text-muted")
                  }
                >
                  {item.priority}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted">
                  {item.name} · {formatPct(item.pct)} %
                </p>
                <h4 className="font-serif text-xl">{item.title}</h4>
                <p className="mt-1 leading-relaxed">{item.action}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {diagnosis.ai ? (
        <section className="rounded-3xl border border-line bg-card p-5 md:p-8">
          <p className="text-sm font-medium text-copper">Oportunidad de IA</p>
          <h3 className="mt-1 font-serif text-3xl">{diagnosis.ai.title}</h3>
          <p className="mt-2 text-sm text-muted">
            Anclada a {diagnosis.ai.blockName} ({formatPct(diagnosis.ai.pct)} %), no a una moda general.
          </p>
          {diagnosis.ai.gateText ? <p className="mt-4 max-w-3xl leading-relaxed font-medium">{diagnosis.ai.gateText}</p> : null}
          <p className="mt-3 max-w-3xl leading-relaxed">{diagnosis.ai.body}</p>
          <ul className="mt-4 max-w-3xl list-disc space-y-1 pl-5 text-sm text-muted">
            <li>Una persona revisa antes de que el resultado llegue al cliente o cambie una decisión.</li>
            <li>No se pegan datos de clientes, pacientes, empleados ni fiscales en una herramienta pública.</li>
            <li>El número de éxito se escribe antes y se mira a las seis semanas. Si no mejora, se cierra.</li>
          </ul>
        </section>
      ) : null}

      {state.profile.evidence ? (
        <section>
          <h3 className="font-serif text-2xl">Evidencias</h3>
          <p className="mt-2 max-w-3xl leading-relaxed">{state.profile.evidence}</p>
        </section>
      ) : null}

      <section>
        <h3 className="font-serif text-2xl">Cómo se ha calculado</h3>
        <p className="mt-1 mb-4 max-w-3xl text-sm text-muted">
          Nota de bloque = puntos ÷ (preguntas aplicables × 4) × 100. «No aplica» no suma puntos ni máximo. Si un bloque
          entero no aplica, sale de la media. La nota global es la media de los porcentajes, no de las preguntas.
        </p>
        <ul className="divide-y divide-line rounded-2xl border border-line bg-card">
          {diagnosis.blocks.map((block) => (
            <li key={block.id} className="grid gap-1 px-4 py-3 sm:grid-cols-[1fr_auto] sm:items-baseline">
              <span>{block.name}</span>
              {block.status === "excluded" ? (
                <span className="text-sm text-muted">No evaluado · todo «No aplica»</span>
              ) : (
                <span className="tabular-nums text-sm">
                  {block.points} / {block.max} · {block.applicable} aplicables · {formatPct(block.pct, 2)} %
                </span>
              )}
            </li>
          ))}
          <li className="flex items-baseline justify-between gap-3 px-4 py-3 font-medium">
            <span>Global</span>
            <span className="tabular-nums">
              {formatPct(diagnosis.global, 2)} % · nivel {diagnosis.level.id}
            </span>
          </li>
        </ul>
      </section>

      <footer className="border-t border-line pt-4 text-sm text-muted">
        <p>
          Escala de esta práctica, no un estándar oficial. Tramos: {LEVELS.map((level) => `${level.id} ${level.range}`).join(" · ")}.
          20 %, 40 %, 60 % y 80 % exactos cierran el nivel anterior.
        </p>
        <p className="mt-2">Unidad 1 · Sistemas de IA y mejora de la eficiencia operativa · RA1, CE d.</p>
      </footer>
    </div>
  );
}

function Gauge({ value, label }: { value: number; label: string }) {
  const r = 86;
  const cx = 120;
  const cy = 108;
  const d = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const len = Math.PI * r;
  const offset = len * (1 - Math.min(100, Math.max(0, value)) / 100);
  return (
    <svg viewBox="0 0 240 120" className="mx-auto w-full max-w-64" role="img" aria-label={label}>
      <path d={d} fill="none" stroke="var(--color-line)" strokeWidth="12" strokeLinecap="round" />
      <path
        d={d}
        fill="none"
        stroke="var(--color-copper)"
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={len}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

function Ruler({ score }: { score: number }) {
  return (
    <div className="mt-6 max-w-xl">
      <div className="relative h-2 rounded-full bg-line">
        <div className="absolute inset-y-0 left-0 rounded-full bg-copper" style={{ width: `${score}%` }} />
        {[20, 40, 60, 80].map((mark) => (
          <span key={mark} className="absolute top-0 h-2 w-px bg-ink" style={{ left: `${mark}%` }} />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted tabular-nums">
        <span>0</span>
        <span>20</span>
        <span>40</span>
        <span>60</span>
        <span>80</span>
        <span>100</span>
      </div>
    </div>
  );
}
