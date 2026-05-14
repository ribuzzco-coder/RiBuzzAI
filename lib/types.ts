// =========================================================
// Tipos compartidos en todo el proyecto.
// Espejo del esquema SQL. Mantener sincronizado.
// =========================================================

export type Sector =
  | "servicios_b2b"
  | "educacion"
  | "turismo"
  | "salud"
  | "comercio"
  | "otro";

export type Size = "1-5" | "6-10" | "11-20" | "21-50";
export type Stage = "ideacion" | "arranque" | "crecimiento" | "transformacion";
export type DiagnosticStatus = "in_progress" | "completed" | "abandoned";

export interface User {
  id: string;
  email: string;
  name: string;
  whatsapp?: string | null;
  role: "founder" | "manager" | "admin";
  created_at: string;
}

export interface Company {
  id: string;
  user_id: string;
  name: string;
  sector: Sector;
  city?: string | null;
  size?: Size | null;
  stage?: Stage | null;
  website?: string | null;
  created_at: string;
}

export interface Diagnostic {
  id: string;
  company_id: string;
  status: DiagnosticStatus;
  current_question: number;
  completed_at?: string | null;
  duration_seconds?: number | null;
  created_at: string;
}

export interface DiagnosticAnswer {
  id: string;
  diagnostic_id: string;
  question_number: number;
  variable_bd: string;
  question_text: string;
  answer_text: string | null;
  is_unknown: boolean;
  is_fused: boolean;
  created_at: string;
}

// ---------- Nodo Code ----------
export interface DiagnosticAnswersFlat {
  comercial_ventas_mes?: string;
  comercial_clientes_actuales?: string;
  comercial_clientes_nuevos?: string;
  comercial_inversion_mes?: string;
  comercial_leads_mes?: string;
  comercial_tasa_conversion?: string;
  [key: string]: string | undefined;
}

export interface CalculatedMetrics {
  ticket_medio: number;
  cac: number;
  ltv: number;
  ratio_cac_ticket: number;
  ratio_cac_ltv: number;
  leads_perdidos: number;
  ingreso_potencial: number;
  salud_comercial: number;
}

// ---------- Variables del scorer ----------
export type ScorerVariable =
  | "problema"
  | "solucion"
  | "icp"
  | "cliente_actual"
  | "oferta"
  | "ecuacion_valor"
  | "ticket_medio"
  | "recurrencia"
  | "canal_adquisicion"
  | "cac"
  | "conversion"
  | "seguimiento"
  | "escalamiento"
  | "capacidad_ejecucion";

export type ScoreEstado =
  | "Crítico"
  | "Débil"
  | "Funcional"
  | "Fuerte"
  | "Escalable";

export type ScoreConfianza = "alta" | "media" | "baja";

export interface VariableScore {
  score: 1 | 2 | 3 | 4 | 5;
  estado: ScoreEstado;
  confianza?: ScoreConfianza;
  evidencia?: string;
  diagnostico: string;
  impacto: string;
  brecha?: string;
  recomendacion: string;
}

export interface TopFuga {
  variable: ScorerVariable;
  prioridad: 1 | 2 | 3;
  diagnostico: string;
  recomendacion: string;
}

export interface ScorerOutput {
  scores: Record<ScorerVariable, VariableScore>;
  score_global: number;
  top_fugas: TopFuga[];
}

// ---------- P1 Síntesis ----------
export interface SynthesizedDiagnostic {
  empresa: { nombre: string; sector: string; etapa: string; tamano: string };
  variables: Record<
    ScorerVariable,
    {
      texto?: string;
      diferenciador?: string;
      impacto?: string;
      completitud: number;
      is_unknown: boolean;
    }
  >;
  metricas_brutas: {
    ventas_mes: number;
    clientes_actuales: number;
    clientes_nuevos: number;
    inversion_mes: number;
    leads_mes: number;
    tasa_conversion: number;
  };
  objetivos: { meta_3m: string; obstaculo: string };
  flags: string[];
  observaciones: Record<string, string>;
}

// ---------- P3 Reporte ----------
export interface ReportOutput {
  reconocimiento?: string;         // v2: apertura emocional personalizada
  situacion_actual: string;
  fractura_silenciosa?: string;    // v2: problema real que el usuario no nombró
  lectura_principal: string;
  variables_fuertes: ScorerVariable[];
  variables_debiles: ScorerVariable[];
  recomendacion_general: string;
  siguiente_paso: string;
  conexion_sueno?: string;         // v2: cierre motivacional con sueño declarado
}

// ---------- P4 Playbook ----------
export interface PlaybookAccion {
  titulo: string;
  que_corregir: string;
  por_que: string;
  como: string;
  metrica: string;
  resultado_esperado: string;
  tiempo_estimado: string;
  prioridad: number;
}

export interface PlaybookOutput {
  cliente_prioritario: string;
  oferta_recomendada: string;
  canal_sugerido: string;
  mensaje_base: string;
  acciones: PlaybookAccion[];
  metricas_a_medir: string[];
  plan_30_dias: {
    semana_1: string;
    semana_2: string;
    semana_3: string;
    semana_4: string;
  };
}

// ---------- P5 Clasificación ----------
export interface ClassificationOutput {
  status: "mql" | "sql" | "no_fit";
  fit_level: "alto" | "medio" | "bajo";
  urgency: "alta" | "media" | "baja";
  payment_capacity: "alta" | "media" | "baja";
  execution_capacity: "alta" | "media" | "baja";
  suggested_route:
    | "diagnostico_premium"
    | "diseno_comercial"
    | "implementacion"
    | "growth_partner"
    | "no_fit";
  justificacion: string;
  opening_message: string;
}

// ---------- Pregunta del blueprint ----------
export type NodoTipo =
  | "Sintetizador"
  | "Scorer"
  | "Codigo"
  | "Diagnostico"
  | "Fit"
  | "Mayor";

// Blueprint v2: 9 bloques A-I (40 preguntas)
export type SeccionDiagnostico = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I";

export type InputType =
  | "text"
  | "textarea"
  | "number"
  | "select"        // selección única
  | "multi-select"  // selección múltiple (checkboxes)
  | "email"
  | "tel";

export interface Pregunta {
  numero: number;
  seccion: SeccionDiagnostico;
  texto: string;
  variables: string[];      // nombres de variable_bd
  nodo: NodoTipo;
  inputType: InputType;
  placeholder?: string;
  options?: { value: string; label: string }[];
  isFused?: boolean;        // se muestra fusionada con otra pregunta
  allowUnknown?: boolean;   // default: true
  conditional?: (ctx: { fit?: "alto" | "medio" | "bajo" }) => boolean;
}
