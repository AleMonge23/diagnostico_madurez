export type BlockId =
  | "estrategia"
  | "infraestructura"
  | "procesos"
  | "software"
  | "datos"
  | "ia"
  | "personas"
  | "clientes"
  | "ciberseguridad"
  | "innovacion"
  | "industria";

export type Scale = 0 | 1 | 2 | 3 | 4;
export type Answer = Scale | "na";

export type Question = { id: string; prompt: string };

export type AiPlay = { title: string; body: string };

export type Block = {
  id: BlockId;
  numeral: string;
  name: string;
  short: string;
  intent: string;
  industrial?: boolean;
  questions: Question[];
  actionTitle: string;
  action: string;
  ai?: AiPlay;
};

export type SizeId = "micro" | "pequena" | "mediana" | "grande";
export type CaseType = "simulado" | "real";
export type PresetId = "optica" | "baja" | "alta" | "bar";

export type Profile = {
  alias: string;
  sector: string;
  size: SizeId;
  industrial: boolean;
  caseType: CaseType;
  context: string;
  evidence: string;
};

export type Step = "intro" | "profile" | "quiz" | "result";

export type DiagnosticState = {
  step: Step;
  blockIndex: number;
  profile: Profile;
  answers: Partial<Record<string, Answer>>;
  completedAt: string | null;
  origin: PresetId | null;
};

export const SCALE: { value: Answer; name: string; hint: string }[] = [
  { value: 0, name: "No existe", hint: "No existe o no se utiliza en absoluto" },
  { value: 1, name: "Inicial", hint: "Uso inicial, informal o solo de vez en cuando" },
  { value: 2, name: "Parcial", hint: "Implantado en algunos procesos, no en todos" },
  { value: 3, name: "Habitual", hint: "Uso habitual, organizado y conocido por el equipo" },
  { value: 4, name: "Integrada", hint: "Integrado, se mide y se mejora con datos" },
  { value: "na", name: "No aplica", hint: "No tiene sentido en este negocio (no es que aún no se haga)" },
];

export const SIZES: { id: SizeId; label: string }[] = [
  { id: "micro", label: "Micro (1–9)" },
  { id: "pequena", label: "Pequeña (10–49)" },
  { id: "mediana", label: "Mediana (50–249)" },
  { id: "grande", label: "Grande (250+)" },
];

export const SECTORS = [
  "Comercio minorista",
  "Hostelería",
  "Servicios profesionales",
  "Salud y bienestar",
  "Educación",
  "Industria y talleres",
  "Construcción",
  "Otro",
];

const IMPACT: BlockId[] = [
  "ciberseguridad",
  "procesos",
  "software",
  "clientes",
  "datos",
  "estrategia",
  "personas",
  "ia",
  "infraestructura",
  "innovacion",
  "industria",
];

function qs(block: string, prompts: string[]): Question[] {
  return prompts.map((prompt, i) => ({ id: `${block}-${i + 1}`, prompt }));
}

export const BLOCKS: Block[] = [
  {
    id: "estrategia",
    numeral: "01",
    name: "Estrategia digital",
    short: "Estrategia",
    intent: "Si lo digital tiene objetivo, dueño, presupuesto e indicadores. No si hay muchas herramientas.",
    questions: qs("estrategia", [
      "¿Hay un objetivo digital escrito y ligado a un resultado del negocio (más ventas, menos tiempo de espera, mejor servicio)?",
      "¿Existe un plan del año con acciones concretas, plazos y un presupuesto asignado a digitalización?",
      "¿Una persona o un rol tiene la responsabilidad clara de ese plan, con tiempo real para llevarlo?",
      "¿Se revisan indicadores digitales con una periodicidad fija (cada mes o cada trimestre)?",
      "¿La dirección cambia inversiones o procesos a partir de esos indicadores, no solo los mira?",
    ]),
    actionTitle: "Una página de rumbo",
    action:
      "Escribir tres objetivos del año, un responsable y cuatro indicadores. Revisarlos 30 minutos al mes. Sin dueño, el resto del plan se dispersa.",
  },
  {
    id: "infraestructura",
    numeral: "02",
    name: "Infraestructura",
    short: "Infra",
    intent: "Si el día a día se sostiene: equipos, red, archivos, soporte y paradas. Nada de moda tecnológica.",
    questions: qs("infraestructura", [
      "¿Los puestos de trabajo tienen equipos suficientes para las herramientas que ya se usan?",
      "¿La conexión aguanta en las horas de actividad, sin cortes que paren la venta o el servicio?",
      "¿Archivos y aplicaciones críticas están en un sitio accesible y con permisos, no solo en un PC suelto?",
      "¿Cuando algo falla hay un soporte con un tiempo de respuesta conocido?",
      "¿Los sistemas críticos tienen pocas paradas no planificadas y se sabe cuáles fueron las últimas?",
    ]),
    actionTitle: "Estabilizar lo que ya sostiene el día",
    action:
      "Inventariar equipos críticos, fijar un soporte con plazo de respuesta y sacar los archivos imprescindibles de un único ordenador.",
  },
  {
    id: "procesos",
    numeral: "03",
    name: "Procesos y automatización",
    short: "Procesos",
    intent: "Si el trabajo repetido fluye o se vuelve a teclear. Distinto del software: aquí importa el flujo, no la marca.",
    questions: qs("procesos", [
      "¿Las tareas administrativas que se repiten (altas de clientes, avisos, recordatorios, cierres de caja) están digitalizadas?",
      "¿El proceso clave del negocio (pedido, reserva, comanda, cita o encargo) sigue un flujo digital de punta a punta?",
      "¿Los datos de ese proceso pasan de una herramienta a otra sin reescribirlos a mano?",
      "¿Se mide el tiempo o el número de errores de los procesos que ya están digitalizados?",
      "¿En el último año se ha quitado algún paso duplicado a partir de esa medición?",
    ]),
    actionTitle: "Un solo flujo, completo",
    action:
      "Elegir el proceso que más se repite, dibujarlo y quitar las reescrituras. No abrir cinco herramientas a la vez. Medir el tiempo de ese flujo durante un mes.",
    ai: {
      title: "Clasificar la bandeja de ese mismo flujo",
      body: "Cuando pedidos, citas o incidencias entren por un canal escrito, un modelo propone categoría, prioridad y un borrador del siguiente paso. No ejecuta el paso. Durante seis semanas se mide el tiempo de primera respuesta y las reescrituras. Si no bajan, se apaga.",
    },
  },
  {
    id: "software",
    numeral: "04",
    name: "Software de gestión",
    short: "Software",
    intent: "Si facturas, clientes y documentos viven en un sistema compartido o en copias paralelas.",
    questions: qs("software", [
      "¿La facturación se hace en un software, no en papel, correo o una hoja que solo usa una persona?",
      "¿Clientes, pedidos o citas están en un CRM, ERP o herramienta equivalente que usa el equipo?",
      "¿Contratos, albaranes o historiales se encuentran en un repositorio común en menos de dos minutos?",
      "¿Ese sistema está conectado con banco, tienda, agenda u otra herramienta que ya se usa?",
      "¿El equipo consulta una sola fuente, sin hojas paralelas que se contradicen?",
    ]),
    actionTitle: "Una sola fuente de clientes y facturas",
    action:
      "Elegir el sistema que ya se usa y acordar qué dato vive solo ahí: cliente, presupuesto y factura. Cerrar la hoja paralela en un mes, no «cuando se pueda».",
  },
  {
    id: "datos",
    numeral: "05",
    name: "Datos y analítica",
    short: "Datos",
    intent: "Si los números están completos, definidos y cambian decisiones. Un gráfico suelto no cuenta como analítica.",
    questions: qs("datos", [
      "¿Los datos de clientes, ventas u operaciones se registran completos, sin duplicados habituales?",
      "¿Cada indicador tiene fórmula, fuente y periodicidad escritas, no solo un nombre?",
      "¿Hay un informe o cuadro breve que reúne esos indicadores y alguien lo abre de verdad?",
      "¿Decisiones de precio, stock, turnos o campañas se apoyan en ese informe?",
      "¿Se revisan huecos y errores del dato con una cadencia, y se corrigen?",
    ]),
    actionTitle: "Cinco números que cambien una decisión",
    action:
      "Definir cinco indicadores (por ejemplo ventas, ticket, citas perdidas, impagados y plazo de entrega). Revisarlos el mismo día cada mes y corregir los campos vacíos del mes anterior.",
    ai: {
      title: "Señalar semanas anómalas en una sola serie",
      body: "Con al menos un año de ventas, citas o encargos, un modelo sencillo marca las semanas que se salen del patrón. Sirve para elegir qué mirar en la reunión, no para cambiar precios solo. Antes se contrasta con lo que el negocio ya sabe (fiestas, obras, vacaciones). Sin esa serie, el piloto es completarla, no predecir.",
    },
  },
  {
    id: "ia",
    numeral: "06",
    name: "Inteligencia artificial",
    short: "IA",
    intent: "Si hay un uso real, supervisado y con riesgos vistos. Probar un chat una vez no es madurez.",
    questions: qs("ia", [
      "¿Se ha elegido al menos un caso de uso de IA útil para este negocio, con un resultado esperado?",
      "¿Algún equipo usa IA generativa en trabajo real con una pauta escrita de qué se puede pegar y qué no?",
      "¿Se usa alguna predicción o clasificación (demanda, impagos, citas, calidad) en la operación?",
      "¿Una persona revisa las salidas de la IA antes de que lleguen al cliente o cambien una decisión?",
      "¿Se han nombrado los riesgos (datos personales, errores, dependencia) y hay una norma mínima?",
    ]),
    actionTitle: "Un caso de uso y una norma de una página",
    action:
      "Elegir una sola tarea (textos, clasificación o resúmenes). Escribir qué datos no se pegan, quién revisa y cómo se sabrá si ahorra tiempo. Sin esa página, el uso sigue siendo informal.",
    ai: {
      title: "Piloto de IA generativa con regla de paro",
      body: "Una tarea repetitiva de texto: descripciones, respuestas frecuentes o resúmenes internos. Se anota el tiempo que lleva hoy. Seis semanas con la norma de una página y una persona que revisa. Si el tiempo no baja o aparecen errores que el cliente ve, se cierra. No se abre un segundo caso hasta cerrar este.",
    },
  },
  {
    id: "personas",
    numeral: "07",
    name: "Personas y cultura",
    short: "Personas",
    intent: "Si el equipo sabe usar lo que ya está implantado y el cambio se acompaña. No un curso genérico.",
    questions: qs("personas", [
      "¿Las personas que usan cada herramienta saben hacer solas las tareas habituales, sin un único «entendido»?",
      "¿Hay formación digital de este año, aunque sea breve, con temas y horas definidas?",
      "¿La información de trabajo vive en canales comunes, no solo en móviles personales?",
      "¿Cuando se cambia una herramienta se explica, se prueba y se acompaña a quien la adopta?",
      "¿Quien dirige usa las mismas herramientas, no solo pide que otros las usen?",
    ]),
    actionTitle: "Dos sesiones sobre la herramienta que ya duele",
    action:
      "Dos sesiones de 45 minutos sobre el sistema que hoy genera más dudas (facturación, agenda o copias). Nombrar una persona de referencia interna. Nada de un curso genérico de «transformación».",
    ai: {
      title: "Consultar las instrucciones reales, no un chat genérico",
      body: "Reunir en un documento cómo se factura, cómo se pide cita y cómo se restaura una copia. Un asistente responde solo con ese material. La primera semana alguien contrasta las respuestas. No sustituye las sesiones presenciales: las acorta cuando la duda es repetida.",
    },
  },
  {
    id: "clientes",
    numeral: "08",
    name: "Clientes y canales",
    short: "Clientes",
    intent: "Si el cliente encuentra, pregunta y puede avanzar una compra o una cita por un canal digital.",
    questions: qs("clientes", [
      "¿El negocio está localizable y actualizado donde lo buscan sus clientes (Google Maps, web o redes)?",
      "¿Las consultas (WhatsApp, redes o correo) se responden con un plazo que el equipo conoce y cumple?",
      "¿Las acciones de marketing digital tienen un objetivo claro y un resultado que se mira después?",
      "¿Se puede iniciar una venta, reserva, comanda o cita por un canal digital, no solo informarse?",
      "¿La satisfacción se recoge de forma sistemática (encuesta, reseñas, feedback) y se actúa cuando la queja se repite?",
    ]),
    actionTitle: "Un canal que cierre, no solo que informe",
    action:
      "Actualizar ficha y horario real. Fijar en cuántas horas se responde. Permitir al menos un paso (reserva, encargo o presupuesto) sin depender de una llamada.",
    ai: {
      title: "Borradores de respuesta que envía una persona",
      body: "Horario, plazos y estado de un encargo pueden tener un borrador que alguien de tienda aprueba. El mensaje no sale solo. Se mide el tiempo de respuesta y si el cliente tiene que repreguntar. Si el canal es el móvil de una sola persona, primero hay que sacarlo de ahí.",
    },
  },
  {
    id: "ciberseguridad",
    numeral: "09",
    name: "Ciberseguridad",
    short: "Seguridad",
    intent: "Cinco controles mínimos: accesos, copias probadas, doble factor, parches y qué hacer si pasa algo.",
    questions: qs("ciberseguridad", [
      "¿Cada persona entra con su propia cuenta a correo, gestión y datos de clientes, sin contraseñas compartidas?",
      "¿Hay copias automáticas y se ha comprobado, al menos una vez, que se pueden restaurar?",
      "¿Correo, banca y administración usan verificación en dos pasos?",
      "¿Sistemas y aplicaciones se actualizan con una cadencia, no solo cuando algo ya ha fallado?",
      "¿Hay una pauta breve de qué hacer ante phishing, pérdida de acceso o un cifrado de archivos?",
    ]),
    actionTitle: "Tres controles antes que ninguna herramienta nueva",
    action:
      "Contraseñas individuales, verificación en dos pasos en correo y banca, y una copia automática cuya restauración se prueba una vez. Media página sobre qué hacer si llega un phishing.",
  },
  {
    id: "innovacion",
    numeral: "10",
    name: "Innovación",
    short: "Innovación",
    intent: "Si las mejoras se prueban en pequeño, con un número de éxito, y luego se quedan o se tiran.",
    questions: qs("innovacion", [
      "¿En el último año se ha probado alguna mejora digital en pequeño antes de implantarla del todo?",
      "¿Ese piloto tenía un criterio de éxito escrito antes de empezar?",
      "¿Se midió el resultado (tiempo, coste, ventas o errores) y se decidió seguir o parar?",
      "¿Lo que funcionó pasó al proceso habitual y no se quedó en una prueba aislada?",
      "¿Hay una revisión periódica de qué digitalizar después, ordenada por impacto y esfuerzo?",
    ]),
    actionTitle: "Un piloto con permiso para parar",
    action:
      "Una mejora de menos de seis semanas, con el número de éxito escrito antes (por ejemplo, un 20 % menos de citas perdidas). Al final se continúa o se cierra, en diez líneas.",
  },
  {
    id: "industria",
    numeral: "11",
    name: "Planta e industria",
    short: "Planta",
    industrial: true,
    intent: "Solo si hay producción propia. Orden, datos de máquina, mantenimiento, consumos y trazabilidad.",
    questions: qs("industria", [
      "¿Las órdenes, tiempos o incidencias de producción se registran en un sistema, no solo en papel de planta?",
      "¿Datos de máquina o sensores se consultan para decidir, no solo se archivan?",
      "¿El mantenimiento está planificado y el historial de averías es digital?",
      "¿Energía, mermas o consumos se miden y se usan para reducir desperdicio?",
      "¿La trazabilidad de lote o la calidad enlaza producción, almacén y expedición sin reescribir?",
    ]),
    actionTitle: "Un dato de planta que cambie el turno",
    action:
      "Registrar paradas o mermas de un solo proceso durante un mes y revisarlas en la reunión de producción. Los sensores, después de tener el hábito de mirar ese dato.",
    ai: {
      title: "Aviso de avería con el historial que ya existe",
      body: "Si hay partes de avería, un modelo simple avisa cuando una máquina se parece a las semanas previas a las últimas paradas. El técnico decide. No se para la máquina sola en el primer piloto. Si no hay historial, el paso es anotarlo un mes: sin eso la IA no tiene dónde apoyarse.",
    },
  },
];

export const LEVELS: { id: 1 | 2 | 3 | 4 | 5; name: string; range: string; reading: string }[] = [
  {
    id: 1,
    name: "Muy bajo",
    range: "0–20 %",
    reading: "Digitalización escasa. Conviene asegurar facturación, copias y un canal de cliente antes de abrir frentes nuevos.",
  },
  {
    id: 2,
    name: "Básico",
    range: ">20–40 %",
    reading: "Hay herramientas aisladas. No se hablan entre sí ni responden a un plan. El salto es unificar un proceso completo.",
  },
  {
    id: 3,
    name: "En desarrollo",
    range: ">40–60 %",
    reading: "Parte de la operación ya es digital. Falta medirla y cerrar lo que sigue en papel o en mensajes sueltos.",
  },
  {
    id: 4,
    name: "Avanzado",
    range: ">60–80 %",
    reading: "Hay integración e indicadores. El margen está en lo que aún va aparte y en probar mejoras con un criterio de paro.",
  },
  {
    id: 5,
    name: "Optimizado",
    range: ">80–100 %",
    reading: "La mejora se apoya en datos. La prioridad es sostener esa disciplina y usar IA solo donde el dato ya es fiable.",
  },
];

export function levelFor(score: number) {
  const s = Math.min(100, Math.max(0, score));
  if (s <= 20) return LEVELS[0];
  if (s <= 40) return LEVELS[1];
  if (s <= 60) return LEVELS[2];
  if (s <= 80) return LEVELS[3];
  return LEVELS[4];
}

/** Quita ruido binario sin redondear al entero. Las fronteras 20/40/60/80 no se cruzan por un 40.0000001. */
export function stabilize(n: number): number {
  return Math.round(n * 10000) / 10000;
}

export function formatPct(n: number, digits = 1): string {
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
}

export function heroPct(n: number): { text: string; caution: boolean } {
  const one = Math.round(n * 10) / 10;
  const caution = levelFor(n).id !== levelFor(one).id;
  return { text: formatPct(n, caution ? 2 : 1), caution };
}

export function emptyProfile(): Profile {
  return {
    alias: "",
    sector: "",
    size: "micro",
    industrial: false,
    caseType: "simulado",
    context: "",
    evidence: "",
  };
}

export function freshState(): DiagnosticState {
  return {
    step: "intro",
    blockIndex: 0,
    profile: emptyProfile(),
    answers: {},
    completedAt: null,
    origin: null,
  };
}

export function activeBlocks(profile: Profile): Block[] {
  return BLOCKS.filter((b) => !b.industrial || profile.industrial);
}

export function isAnswer(value: unknown): value is Answer {
  return value === "na" || value === 0 || value === 1 || value === 2 || value === 3 || value === 4;
}

export type BlockScore = {
  id: BlockId;
  numeral: string;
  name: string;
  short: string;
  status: "scored" | "excluded";
  applicable: number;
  points: number;
  max: number;
  pct: number;
};

export type PlanItem = {
  id: BlockId;
  name: string;
  pct: number;
  priority: "Alta" | "Media" | "Baja";
  title: string;
  action: string;
};

export type AiOpportunity = {
  blockId: BlockId;
  blockName: string;
  pct: number;
  title: string;
  body: string;
  gate: "previa" | "paralelo" | "ok";
  gateText: string | null;
};

export type Diagnosis = {
  complete: boolean;
  missing: number;
  blocks: BlockScore[];
  global: number | null;
  level: (typeof LEVELS)[number] | null;
  strengths: BlockScore[];
  strengthMode: "firmes" | "relativas" | "ninguna";
  gaps: BlockScore[];
  plan: PlanItem[];
  ai: AiOpportunity | null;
};

function sortByScore(a: BlockScore, b: BlockScore): number {
  return a.pct - b.pct || IMPACT.indexOf(a.id) - IMPACT.indexOf(b.id);
}

function priorityFor(pct: number): PlanItem["priority"] {
  if (pct <= 40) return "Alta";
  if (pct <= 60) return "Media";
  return "Baja";
}

const AI_PREF: BlockId[] = ["procesos", "clientes", "datos", "ia", "personas", "industria"];

function pickAi(scored: BlockScore[]): AiOpportunity | null {
  const byId = new Map(scored.map((b) => [b.id, b]));
  const pool = AI_PREF.map((id) => byId.get(id)).filter((b): b is BlockScore => {
    return !!b && !!BLOCKS.find((block) => block.id === b.id)?.ai;
  });
  if (pool.length === 0) return null;
  pool.sort(sortByScore);
  let chosen = pool[0];
  if (chosen.id === "ia" && chosen.pct < 40) {
    const near = pool.find((b) => b.id !== "ia" && b.pct <= chosen.pct + 15 && (b.id === "procesos" || b.id === "clientes" || b.id === "datos"));
    if (near) chosen = near;
  }
  const block = BLOCKS.find((b) => b.id === chosen.id)!;
  const ciber = byId.get("ciberseguridad");
  let gate: AiOpportunity["gate"] = "ok";
  let gateText: string | null = null;
  if (ciber && ciber.pct <= 40) {
    gate = "previa";
    gateText =
      "Condición previa: cuentas individuales, doble factor en el correo y una copia cuya restauración se haya probado. Hasta entonces el piloto no empieza.";
  } else if (ciber && ciber.pct <= 60) {
    gate = "paralelo";
    gateText =
      "En paralelo conviene cerrar el doble factor y probar una restauración. El piloto no usa datos de clientes en una herramienta pública.";
  }
  return {
    blockId: chosen.id,
    blockName: block.name,
    pct: chosen.pct,
    title: block.ai!.title,
    body: block.ai!.body,
    gate,
    gateText,
  };
}

export function buildPlan(scored: BlockScore[]): BlockScore[] {
  const below = scored.filter((b) => b.pct < 80).sort(sortByScore);
  const base = below.length >= 3 ? below : [...scored].sort(sortByScore).slice(0, Math.min(3, scored.length));
  const guard = new Set<BlockId>(["ciberseguridad", "procesos", "software", "clientes"]);
  const must = base.filter((b) => guard.has(b.id) && b.pct <= 40).sort(sortByScore);
  const mustIds = new Set(must.map((b) => b.id));
  const rest = base.filter((b) => b.id !== "innovacion" && !mustIds.has(b.id));
  const innov = base.find((b) => b.id === "innovacion");
  const ordered = [...must, ...rest];
  if (innov) ordered.push(innov);
  const ciber = scored.find((b) => b.id === "ciberseguridad");
  if (ciber && ciber.pct <= 40 && !ordered.some((b) => b.id === "ciberseguridad")) {
    ordered.splice(Math.min(1, ordered.length), 0, ciber);
  }
  const capped = ordered.slice(0, 5);
  for (const item of must) {
    if (!capped.some((b) => b.id === item.id)) {
      capped.pop();
      capped.push(item);
    }
  }
  const mustIn = capped.filter((b) => mustIds.has(b.id)).sort(sortByScore);
  const innovIn = capped.filter((b) => b.id === "innovacion");
  const mid = capped.filter((b) => !mustIds.has(b.id) && b.id !== "innovacion").sort(sortByScore);
  return [...mustIn, ...mid, ...innovIn].slice(0, 5);
}

export function scoreDiagnosis(profile: Profile, answers: Partial<Record<string, Answer | undefined>>): Diagnosis {
  const blocksIn = activeBlocks(profile);
  let missing = 0;
  const blocks: BlockScore[] = blocksIn.map((block) => {
    const values = block.questions.map((q) => answers[q.id]);
    for (const value of values) if (!isAnswer(value)) missing += 1;
    const applicableValues = values.filter((v): v is Scale => typeof v === "number");
    const naCount = values.filter((v) => v === "na").length;
    if (applicableValues.length === 0 && naCount === block.questions.length) {
      return {
        id: block.id,
        numeral: block.numeral,
        name: block.name,
        short: block.short,
        status: "excluded",
        applicable: 0,
        points: 0,
        max: 0,
        pct: 0,
      };
    }
    const points = applicableValues.reduce<number>((sum, value) => sum + value, 0);
    const max = applicableValues.length * 4;
    const pct = max === 0 ? 0 : stabilize((points * 100) / max);
    return {
      id: block.id,
      numeral: block.numeral,
      name: block.name,
      short: block.short,
      status: "scored",
      applicable: applicableValues.length,
      points,
      max,
      pct,
    };
  });

  const complete = missing === 0;
  const scored = blocks.filter((b) => b.status === "scored");
  const global = complete && scored.length > 0 ? stabilize(scored.reduce((sum, b) => sum + b.pct, 0) / scored.length) : null;
  const level = global === null ? null : levelFor(global);
  const asc = [...scored].sort(sortByScore);
  const gaps = asc.slice(0, Math.min(3, asc.length));
  const gapIds = new Set(gaps.map((b) => b.id));
  const firm = [...scored].filter((b) => b.pct >= 60 && !gapIds.has(b.id)).sort((a, b) => sortByScore(b, a));
  let strengths = firm.slice(0, 4);
  let strengthMode: Diagnosis["strengthMode"] = firm.length ? "firmes" : "ninguna";
  if (strengths.length === 0) {
    const relative = [...scored].filter((b) => !gapIds.has(b.id)).sort((a, b) => sortByScore(b, a)).slice(0, 2);
    if (relative.length) {
      strengths = relative;
      strengthMode = "relativas";
    }
  }
  const plan: PlanItem[] = complete
    ? buildPlan(scored).map((b) => {
        const block = BLOCKS.find((item) => item.id === b.id)!;
        return {
          id: b.id,
          name: b.name,
          pct: b.pct,
          priority: priorityFor(b.pct),
          title: block.actionTitle,
          action: block.action,
        };
      })
    : [];

  return {
    complete,
    missing,
    blocks,
    global,
    level,
    strengths,
    strengthMode,
    gaps,
    plan,
    ai: complete ? pickAi(scored) : null,
  };
}

export function sizeLabel(id: SizeId): string {
  return SIZES.find((s) => s.id === id)?.label ?? id;
}

export function progressOf(profile: Profile, answers: Partial<Record<string, Answer | undefined>>): { done: number; total: number } {
  const questions = activeBlocks(profile).flatMap((b) => b.questions);
  const done = questions.filter((q) => isAnswer(answers[q.id])).length;
  return { done, total: questions.length };
}

function fill(id: string, values: Answer[]): Record<string, Answer> {
  return Object.fromEntries(values.map((value, index) => [`${id}-${index + 1}`, value]));
}

export type Preset = {
  id: PresetId;
  badge: string;
  profile: Profile;
  answers: Record<string, Answer>;
};

export const PRESETS: Record<PresetId, Preset> = {
  optica: {
    id: "optica",
    badge: "Caso simulado",
    profile: {
      alias: "Óptica Litoral",
      sector: "Salud y bienestar",
      size: "micro",
      industrial: false,
      caseType: "simulado",
      context:
        "Óptica independiente en una ciudad costera. Ocho personas. Venta en tienda, encargos de lentes y revisiones. Sin planta. Caso simulado para la aplicación: no identifica a un negocio real.",
      evidence:
        "Guion de entrevista simulado: facturación en software, agenda en papel, WhatsApp como canal principal, ficha de mapas a medias, copia de seguridad manual y uso puntual de IA generativa para redes, sin norma escrita.",
    },
    answers: {
      ...fill("estrategia", [2, 2, 1, 2, 1]),
      ...fill("infraestructura", [3, 3, 2, 2, 3]),
      ...fill("procesos", [2, 1, 1, 1, 0]),
      ...fill("software", [3, 2, 2, 1, 2]),
      ...fill("datos", [2, 2, 1, 2, 1]),
      ...fill("ia", [1, 2, 0, 1, 0]),
      ...fill("personas", [2, 2, 2, 2, 2]),
      ...fill("clientes", [2, 3, 2, 2, 1]),
      ...fill("ciberseguridad", [2, 2, 1, 2, 1]),
      ...fill("innovacion", [2, 2, 1, 1, 1]),
    },
  },
  baja: {
    id: "baja",
    badge: "Prueba · poca digitalización",
    profile: {
      alias: "Comercio del Puerto",
      sector: "Comercio minorista",
      size: "micro",
      industrial: false,
      caseType: "simulado",
      context: "Perfil ficticio de comprobación: comercio pequeño con herramientas sueltas y casi ningún proceso medido.",
      evidence: "Respuestas diseñadas para caer en el nivel 2. No procede de una entrevista real.",
    },
    answers: {
      ...fill("estrategia", [1, 1, 1, 1, 0]),
      ...fill("infraestructura", [2, 2, 2, 1, 1]),
      ...fill("procesos", [1, 1, 0, 0, 0]),
      ...fill("software", [2, 1, 1, 1, 1]),
      ...fill("datos", [1, 1, 0, 0, 0]),
      ...fill("ia", [0, 1, 0, 0, 0]),
      ...fill("personas", [2, 1, 2, 1, 1]),
      ...fill("clientes", [2, 2, 1, 1, 1]),
      ...fill("ciberseguridad", [2, 1, 0, 1, 1]),
      ...fill("innovacion", [1, 0, 0, 0, 0]),
    },
  },
  alta: {
    id: "alta",
    badge: "Prueba · avanzada",
    profile: {
      alias: "Grupo Nexara",
      sector: "Servicios profesionales",
      size: "mediana",
      industrial: false,
      caseType: "simulado",
      context: "Perfil ficticio de comprobación: servicios con sistemas integrados e indicadores. No es un caso real.",
      evidence: "Respuestas diseñadas para caer en el nivel 4. Sirve para verificar fórmulas, no como diagnóstico de una empresa.",
    },
    answers: {
      ...fill("estrategia", [4, 3, 3, 3, 3]),
      ...fill("infraestructura", [3, 4, 3, 3, 3]),
      ...fill("procesos", [3, 3, 2, 3, 2]),
      ...fill("software", [4, 3, 3, 3, 3]),
      ...fill("datos", [3, 3, 3, 2, 2]),
      ...fill("ia", [2, 2, 1, 3, 2]),
      ...fill("personas", [3, 3, 3, 3, 3]),
      ...fill("clientes", [4, 3, 3, 3, 3]),
      ...fill("ciberseguridad", [3, 3, 4, 3, 3]),
      ...fill("innovacion", [3, 3, 2, 2, 2]),
    },
  },
  bar: {
    id: "bar",
    badge: "Caso simulado · bar de copas",
    profile: {
      alias: "Bar La Terraza",
      sector: "Hostelería",
      size: "micro",
      industrial: false,
      caseType: "simulado",
      context:
        "Bar de copas en zona de ocio. Seis personas en turnos. Servicio en barra y terraza, reservas de grupos por WhatsApp, carta en papel y redes activas. Sin cocina propia. Caso simulado: no identifica a un negocio real.",
      evidence:
        "Guion simulado: TPV para cobros, caja en Excel al cierre, reservas y grupos por WhatsApp del encargado, ficha de Google a medias, Instagram activo sin plan, copia de TPV sin probar restauración, uso puntual de ChatGPT para textos de redes.",
    },
    answers: {
      ...fill("estrategia", [1, 1, 1, 1, 0]),
      ...fill("infraestructura", [3, 2, 2, 1, 2]),
      ...fill("procesos", [1, 1, 0, 0, 0]),
      ...fill("software", [3, 1, 1, 1, 1]),
      ...fill("datos", [1, 0, 0, 0, 0]),
      ...fill("ia", [1, 1, 0, 0, 0]),
      ...fill("personas", [2, 1, 1, 1, 1]),
      ...fill("clientes", [2, 2, 1, 1, 1]),
      ...fill("ciberseguridad", [1, 1, 0, 1, 0]),
      ...fill("innovacion", [1, 0, 0, 0, 0]),
    },
  },
};

const STORAGE_KEY = "meridiano-v1";

function asSize(value: unknown): SizeId {
  return value === "micro" || value === "pequena" || value === "mediana" || value === "grande" ? value : "micro";
}

function asCase(value: unknown): CaseType {
  return value === "real" ? "real" : "simulado";
}

export function loadState(): DiagnosticState | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as {
      step?: string;
      blockIndex?: number;
      profile?: Partial<Profile>;
      answers?: Record<string, unknown>;
      completedAt?: unknown;
      origin?: unknown;
    };
    if (!data.profile || typeof data.profile.alias !== "string") return null;
    if (data.step !== "intro" && data.step !== "profile" && data.step !== "quiz" && data.step !== "result") return null;
    const answers: DiagnosticState["answers"] = {};
    for (const [key, value] of Object.entries(data.answers ?? {})) {
      if (isAnswer(value)) answers[key] = value;
    }
    const origin =
      data.origin === "optica" || data.origin === "baja" || data.origin === "alta" || data.origin === "bar"
        ? data.origin
        : null;
    return {
      step: data.step,
      blockIndex: Number.isInteger(data.blockIndex) ? data.blockIndex! : 0,
      profile: {
        ...emptyProfile(),
        alias: data.profile.alias,
        sector: typeof data.profile.sector === "string" ? data.profile.sector : "",
        size: asSize(data.profile.size),
        industrial: Boolean(data.profile.industrial),
        caseType: asCase(data.profile.caseType),
        context: typeof data.profile.context === "string" ? data.profile.context : "",
        evidence: typeof data.profile.evidence === "string" ? data.profile.evidence : "",
      },
      answers,
      completedAt: typeof data.completedAt === "string" ? data.completedAt : null,
      origin,
    };
  } catch {
    return null;
  }
}

export function saveState(state: DiagnosticState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}

function assert(cond: boolean, message: string) {
  if (!cond) throw new Error(message);
}

export function selfCheck(): void {
  assert(levelFor(0).id === 1, "0");
  assert(levelFor(20).id === 1, "20 debe ser nivel 1");
  assert(levelFor(20.0001).id === 2, "20.0001");
  assert(levelFor(40).id === 2, "40 debe ser nivel 2");
  assert(levelFor(40.0001).id === 3, "40.0001");
  assert(levelFor(60).id === 3, "60");
  assert(levelFor(60.0001).id === 4, "60.0001");
  assert(levelFor(80).id === 4, "80");
  assert(levelFor(80.0001).id === 5, "80.0001");
  assert(levelFor(100).id === 5, "100");

  const profile = emptyProfile();
  const na = scoreDiagnosis(profile, {
    ...fill("estrategia", [4, 4, 4, 4, "na"]),
    ...fill("infraestructura", ["na", "na", "na", "na", "na"]),
    ...fill("procesos", [0, 0, 0, 0, 0]),
    ...fill("software", [0, 0, 0, 0, 0]),
    ...fill("datos", [0, 0, 0, 0, 0]),
    ...fill("ia", [0, 0, 0, 0, 0]),
    ...fill("personas", [0, 0, 0, 0, 0]),
    ...fill("clientes", [0, 0, 0, 0, 0]),
    ...fill("ciberseguridad", [0, 0, 0, 0, 0]),
    ...fill("innovacion", [0, 0, 0, 0, 0]),
  });
  const estrategia = na.blocks.find((b) => b.id === "estrategia")!;
  const infra = na.blocks.find((b) => b.id === "infraestructura")!;
  assert(estrategia.pct === 100 && estrategia.max === 16, `NA parcial ${estrategia.pct}/${estrategia.max}`);
  assert(infra.status === "excluded", "bloque entero NA debe excluirse");
  assert(!na.blocks.some((b) => b.id === "industria"), "sin industria no hay bloque de planta");

  const expected: Record<PresetId, { global: number; level: number; plan: BlockId[] }> = {
    baja: {
      global: 21.5,
      level: 2,
      plan: ["procesos", "ciberseguridad", "software", "clientes", "ia"],
    },
    optica: {
      global: 41.5,
      level: 3,
      plan: ["procesos", "ciberseguridad", "ia", "datos", "estrategia"],
    },
    alta: {
      global: 71.5,
      level: 4,
      plan: ["ia", "procesos", "datos", "personas", "innovacion"],
    },
  };

  for (const id of ["baja", "optica", "alta"] as const) {
    const preset = PRESETS[id];
    const diagnosis = scoreDiagnosis(preset.profile, preset.answers);
    assert(diagnosis.complete, `${id} incompleto`);
    assert(diagnosis.global === expected[id].global, `${id} global ${diagnosis.global}`);
    assert(diagnosis.level?.id === expected[id].level, `${id} nivel ${diagnosis.level?.id}`);
    assert(
      diagnosis.plan.map((item) => item.id).join(",") === expected[id].plan.join(","),
      `${id} plan ${diagnosis.plan.map((item) => item.id).join(",")}`,
    );
  }

  const industrial = { ...emptyProfile(), industrial: true, alias: "Planta", sector: "Industria y talleres" };
  const withPlant = scoreDiagnosis(industrial, {
    ...PRESETS.baja.answers,
    ...fill("industria", ["na", "na", "na", "na", "na"]),
  });
  const bajaScore = scoreDiagnosis(PRESETS.baja.profile, PRESETS.baja.answers).global;
  assert(withPlant.blocks.find((b) => b.id === "industria")?.status === "excluded", "planta NA");
  assert(withPlant.global === bajaScore, "NA de planta no cambia la media");
}
