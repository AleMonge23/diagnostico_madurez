import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  PRESETS,
  SCALE,
  SECTORS,
  SIZES,
  activeBlocks,
  clearState,
  emptyProfile,
  formatPct,
  freshState,
  isAnswer,
  loadState,
  progressOf,
  saveState,
  scoreDiagnosis,
  type Answer,
  type DiagnosticState,
  type PresetId,
  type Profile,
} from "@/lib/maturity/model";
import { ResultView } from "@/components/meridiano/result-view";

const CORRECTIONS = [
  {
    title: "«No aplica» no es un cero",
    text: "Sale del numerador y del máximo. Contarlo como 0 castiga al negocio por una tecnología que no necesita.",
  },
  {
    title: "Un bloque vacío no se promedia",
    text: "Si todas las preguntas del bloque son «No aplica», no entra en la media. Así no hay división entre cero.",
  },
  {
    title: "El nivel no usa el número redondeado",
    text: "20 % exacto es nivel 1; 20,1 % ya es nivel 2. Redondear antes mueve empresas de tramo en la frontera.",
  },
  {
    title: "Cada bloque pesa igual",
    text: "La nota global es la media de los porcentajes de bloque, no de las preguntas. Un bloque largo no arrastra el resultado.",
  },
  {
    title: "Una casilla vacía no es un cero",
    text: "El diagnóstico no se calcula hasta responder todas. Un olvido no debe bajar la nota.",
  },
  {
    title: "La planta solo si hay planta",
    text: "El módulo industrial no aparece en un comercio. Si se activa y todo es «No aplica», tampoco penaliza.",
  },
  {
    title: "El gráfico compara porcentajes",
    text: "Con «No aplica» el máximo del bloque cambia. Comparar puntos brutos haría parecer peor a quien tiene menos preguntas útiles.",
  },
];

function Mark() {
  return (
    <svg viewBox="0 0 32 32" className="size-8" aria-hidden="true">
      <circle cx="16" cy="16" r="11" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 6v10l6 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="16" r="1.5" fill="var(--color-copper)" />
    </svg>
  );
}

export function DiagnosticApp() {
  const [state, setState] = useState<DiagnosticState>(freshState);
  const [ready, setReady] = useState(false);
  const [formError, setFormError] = useState("");
  const [gapId, setGapId] = useState<string | null>(null);

  useEffect(() => {
    const loaded = loadState();
    if (loaded) setState(loaded);
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveState(state);
  }, [state, ready]);

  const blocks = activeBlocks(state.profile);
  const blockIndex = Math.min(state.blockIndex, Math.max(0, blocks.length - 1));
  const block = blocks[blockIndex];
  const progress = progressOf(state.profile, state.answers);

  function goIntro() {
    setState((current) => ({ ...current, step: "intro" }));
  }

  function startBlank() {
    setFormError("");
    setState({ ...freshState(), step: "profile", profile: { ...emptyProfile(), caseType: "simulado" } });
  }

  function applyPreset(id: PresetId) {
    const preset = PRESETS[id];
    setGapId(null);
    setState({
      step: "result",
      blockIndex: 0,
      profile: preset.profile,
      answers: { ...preset.answers },
      completedAt: new Date().toISOString(),
      origin: id,
    });
  }

  function restart() {
    clearState();
    setGapId(null);
    setFormError("");
    setState(freshState());
  }

  function setProfile<K extends keyof Profile>(key: K, value: Profile[K]) {
    setState((current) => ({ ...current, profile: { ...current.profile, [key]: value } }));
  }

  function setAnswer(id: string, value: Answer) {
    setGapId((current) => (current === id ? null : current));
    setState((current) => ({ ...current, answers: { ...current.answers, [id]: value } }));
  }

  function continueProfile(event: FormEvent) {
    event.preventDefault();
    if (state.profile.alias.trim().length < 2) {
      setFormError("Pon un alias del negocio, sin el nombre de una persona.");
      return;
    }
    if (!state.profile.sector) {
      setFormError("Elige un sector.");
      return;
    }
    setFormError("");
    setState((current) => ({ ...current, step: "quiz", blockIndex: 0, profile: { ...current.profile, alias: current.profile.alias.trim() } }));
  }

  function openResults() {
    const diagnosis = scoreDiagnosis(state.profile, state.answers);
    if (!diagnosis.complete) {
      const gapBlock = blocks.findIndex((item) => item.questions.some((q) => !isAnswer(state.answers[q.id])));
      const question = blocks[gapBlock]?.questions.find((q) => !isAnswer(state.answers[q.id]));
      setState((current) => ({ ...current, step: "quiz", blockIndex: Math.max(0, gapBlock) }));
      setGapId(question?.id ?? null);
      if (question) {
        requestAnimationFrame(() => document.getElementById(question.id)?.scrollIntoView({ behavior: "smooth", block: "center" }));
      }
      return;
    }
    setGapId(null);
    setState((current) => ({ ...current, step: "result", completedAt: new Date().toISOString() }));
  }

  return (
    <div className="min-h-screen">
      <header className="no-print mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-5 md:px-8">
        <button type="button" onClick={goIntro} className="flex min-h-11 items-center gap-3 text-left">
          <Mark />
          <span className="font-serif text-xl tracking-tight">Meridiano</span>
        </button>
        {state.step !== "intro" ? (
          <p className="text-sm tabular-nums text-muted">
            {progress.done}/{progress.total}
          </p>
        ) : (
          <p className="text-sm text-muted">Madurez digital</p>
        )}
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pb-16 md:px-8">
        {state.step === "intro" ? <Intro onStart={startBlank} onPreset={applyPreset} /> : null}
        {state.step === "profile" ? (
          <ProfileForm
            profile={state.profile}
            error={formError}
            onChange={setProfile}
            onSubmit={continueProfile}
          />
        ) : null}
        {state.step === "quiz" && block ? (
          <Quiz
            state={state}
            blockIndex={blockIndex}
            totalBlocks={blocks.length}
            progress={progress}
            gapId={gapId}
            onAnswer={setAnswer}
            onBlock={(index) => setState((current) => ({ ...current, blockIndex: index }))}
            onBack={() => {
              if (blockIndex === 0) setState((current) => ({ ...current, step: "profile" }));
              else setState((current) => ({ ...current, blockIndex: blockIndex - 1 }));
            }}
            onNext={() => setState((current) => ({ ...current, blockIndex: Math.min(blocks.length - 1, blockIndex + 1) }))}
            onResults={openResults}
          />
        ) : null}
        {state.step === "result" ? <ResultView state={state} onQuiz={() => setState((current) => ({ ...current, step: "quiz", blockIndex: 0 }))} onRestart={restart} /> : null}
      </main>
    </div>
  );
}

function Intro({ onStart, onPreset }: { onStart: () => void; onPreset: (id: PresetId) => void }) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-medium text-copper">Diagnóstico por bloques</p>
      <h1 className="mt-2 font-serif text-4xl leading-tight md:text-6xl">La madurez no es tener más herramientas.</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
        Cuestionario de diez bloques —once si hay planta—, nota que ignora lo que no aplica y, al terminar, el mapa del
        negocio: nivel, gráficos y un plan de 90 días con una oportunidad de IA concreta.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={onStart} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-ink px-5 font-medium text-paper">
          Empezar en blanco
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </div>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">O abre un caso ya relleno</h2>
        <p className="mt-1 text-sm text-muted">Sirven para ver el informe y para comprobar que la fórmula cuadra.</p>
        <ul className="mt-4 grid gap-3">
          {(Object.keys(PRESETS) as PresetId[]).map((id) => {
            const preset = PRESETS[id];
            const diagnosis = scoreDiagnosis(preset.profile, preset.answers);
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => onPreset(id)}
                  className="flex w-full min-h-12 items-center justify-between gap-4 rounded-2xl border border-line bg-card px-4 py-3 text-left"
                >
                  <span>
                    <span className="block font-medium">{preset.profile.alias}</span>
                    <span className="block text-sm text-muted">{preset.badge}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block font-serif text-2xl tabular-nums text-copper">{formatPct(diagnosis.global ?? 0)} %</span>
                    <span className="block text-xs text-muted">Nivel {diagnosis.level?.id}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">Qué corrige este modelo</h2>
        <p className="mt-1 text-sm text-muted">
          La escala 0–4 y los tramos del enunciado se mantienen. Cambia la forma de calcular, donde el enunciado dejaba huecos.
        </p>
        <ol className="mt-4 space-y-4">
          {CORRECTIONS.map((item, index) => (
            <li key={item.title} className="grid grid-cols-[auto_1fr] gap-3">
              <span className="font-serif text-lg tabular-nums text-copper">{String(index + 1).padStart(2, "0")}</span>
              <span>
                <span className="block font-medium">{item.title}</span>
                <span className="block text-sm leading-relaxed text-muted">{item.text}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function ProfileForm({
  profile,
  error,
  onChange,
  onSubmit,
}: {
  profile: Profile;
  error: string;
  onChange: <K extends keyof Profile>(key: K, value: Profile[K]) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl">
      <h1 className="font-serif text-4xl">Ficha del negocio</h1>
      <p className="mt-2 text-muted">Sin nombres de personas ni datos de clientes. Un alias basta.</p>
      <div className="mt-8 space-y-5">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Alias</span>
          <input
            className="h-12 w-full rounded-xl border border-line bg-card px-3 text-base"
            value={profile.alias}
            onChange={(event) => onChange("alias", event.target.value)}
            maxLength={80}
            placeholder="Por ejemplo, Taller del norte"
            autoComplete="off"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Sector</span>
          <select
            className="h-12 w-full rounded-xl border border-line bg-card px-3 text-base"
            value={profile.sector}
            onChange={(event) => onChange("sector", event.target.value)}
          >
            <option value="">Selecciona un sector</option>
            {SECTORS.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Tamaño</legend>
          <div className="grid grid-cols-2 gap-2">
            {SIZES.map((size) => (
              <button
                key={size.id}
                type="button"
                aria-pressed={profile.size === size.id}
                onClick={() => onChange("size", size.id)}
                className={
                  "min-h-12 rounded-xl border px-3 text-sm " +
                  (profile.size === size.id ? "border-ink bg-ink text-paper" : "border-line bg-card")
                }
              >
                {size.label}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Tipo de caso</legend>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["simulado", "Simulado"],
                ["real", "Real anonimizado"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={profile.caseType === id}
                onClick={() => onChange("caseType", id)}
                className={
                  "min-h-12 rounded-xl border px-3 text-sm " +
                  (profile.caseType === id ? "border-ink bg-ink text-paper" : "border-line bg-card")
                }
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>
        <button
          type="button"
          aria-pressed={profile.industrial}
          onClick={() => onChange("industrial", !profile.industrial)}
          className="flex min-h-12 w-full items-center justify-between rounded-xl border border-line bg-card px-4 text-left"
        >
          <span>
            <span className="block text-sm font-medium">Empresa industrial</span>
            <span className="block text-sm text-muted">Añade el bloque de planta, sensores y trazabilidad.</span>
          </span>
          <span className={"ml-4 rounded-full px-3 py-1 text-sm " + (profile.industrial ? "bg-ink text-paper" : "bg-line")}>
            {profile.industrial ? "Sí" : "No"}
          </span>
        </button>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Contexto</span>
          <textarea
            className="min-h-28 w-full rounded-xl border border-line bg-card px-3 py-3 text-base"
            value={profile.context}
            onChange={(event) => onChange("context", event.target.value)}
            maxLength={600}
            placeholder="Qué hace, cuántas personas, si vende en tienda o solo online."
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Evidencias</span>
          <textarea
            className="min-h-28 w-full rounded-xl border border-line bg-card px-3 py-3 text-base"
            value={profile.evidence}
            onChange={(event) => onChange("evidence", event.target.value)}
            maxLength={600}
            placeholder="Qué se ha visto en la entrevista, sin datos personales."
          />
        </label>
      </div>
      {error ? <p className="mt-4 text-sm font-medium">{error}</p> : null}
      <button type="submit" className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-ink px-5 font-medium text-paper">
        Ir al cuestionario
        <ArrowRight className="size-4" aria-hidden="true" />
      </button>
    </form>
  );
}

function Quiz({
  state,
  blockIndex,
  totalBlocks,
  progress,
  gapId,
  onAnswer,
  onBlock,
  onBack,
  onNext,
  onResults,
}: {
  state: DiagnosticState;
  blockIndex: number;
  totalBlocks: number;
  progress: { done: number; total: number };
  gapId: string | null;
  onAnswer: (id: string, value: Answer) => void;
  onBlock: (index: number) => void;
  onBack: () => void;
  onNext: () => void;
  onResults: () => void;
}) {
  const blocks = activeBlocks(state.profile);
  const block = blocks[blockIndex];
  const last = blockIndex === blocks.length - 1;
  const ratio = progress.total === 0 ? 0 : (progress.done / progress.total) * 100;

  return (
    <div>
      <div className="mb-4 h-1 rounded-full bg-line" aria-hidden="true">
        <div className="h-1 rounded-full bg-copper" style={{ width: `${ratio}%` }} />
      </div>
      <div className="no-print -mx-4 flex gap-2 overflow-x-auto px-4 pb-4">
        {blocks.map((item, index) => {
          const filled = item.questions.every((q) => isAnswer(state.answers[q.id]));
          const current = index === blockIndex;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onBlock(index)}
              aria-current={current ? "step" : undefined}
              className={
                "min-h-11 shrink-0 rounded-full px-3 text-sm " +
                (current ? "bg-ink text-paper" : filled ? "border border-ink bg-card" : "border border-line bg-card text-muted")
              }
            >
              {item.numeral} {item.short}
            </button>
          );
        })}
      </div>
      <p className="text-sm text-muted">
        Bloque {block.numeral} · {blockIndex + 1} de {totalBlocks}
      </p>
      <h1 className="mt-1 font-serif text-4xl">{block.name}</h1>
      <p className="mt-2 max-w-2xl text-muted">{block.intent}</p>
      <p className="mt-4 max-w-2xl text-sm text-muted">
        «No aplica» solo si la pregunta no tiene sentido en este negocio. Si aún no se hace, la respuesta es 0, no «No aplica».
      </p>
      <ol className="mt-6 space-y-4">
        {block.questions.map((question, index) => {
          const selected = state.answers[question.id];
          const hint = SCALE.find((item) => item.value === selected)?.hint;
          const missing = gapId === question.id;
          return (
            <li key={question.id} id={question.id} className={"rounded-2xl border bg-card p-4 " + (missing ? "border-ink" : "border-line")}>
              <p className="text-sm text-muted">
                {index + 1} de {block.questions.length}
              </p>
              <h2 className="mt-1 font-serif text-xl leading-snug">{question.prompt}</h2>
              <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-6" role="radiogroup" aria-label={question.prompt}>
                {SCALE.map((option) => {
                  const on = selected === option.value;
                  return (
                    <label
                      key={String(option.value)}
                      className={
                        "flex min-h-12 cursor-pointer flex-col justify-center rounded-xl border px-2 py-2 " +
                        (on ? "border-ink bg-ink text-paper" : "border-line bg-paper text-ink")
                      }
                    >
                      <input
                        className="sr-only"
                        type="radio"
                        name={question.id}
                        value={String(option.value)}
                        checked={on}
                        onChange={() => onAnswer(question.id, option.value)}
                      />
                      <span className="text-sm font-medium">{option.name}</span>
                    </label>
                  );
                })}
              </div>
              <p className={"mt-3 text-sm " + (missing ? "font-medium" : "text-muted")}>
                {missing ? "Falta esta respuesta. " : ""}
                {hint ?? "0 no existe · 1 inicial · 2 parcial · 3 habitual · 4 integrada y medida."}
              </p>
            </li>
          );
        })}
      </ol>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={onBack} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-ink px-5 font-medium">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Atrás
        </button>
        <div className="flex flex-wrap gap-2">
          {!last ? (
            <button type="button" onClick={onNext} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-ink px-5 font-medium">
              Siguiente bloque
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          ) : null}
          <button type="button" onClick={onResults} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-ink px-5 font-medium text-paper">
            Ver diagnóstico
          </button>
        </div>
      </div>
      {progress.done < progress.total ? (
        <p className="mt-3 text-sm text-muted">
          Faltan {progress.total - progress.done} respuestas para calcular la nota.
        </p>
      ) : null}
    </div>
  );
}
