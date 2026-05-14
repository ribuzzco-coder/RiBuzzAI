import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(value);
}

export function scoreColor(score: number) {
  if (score <= 1) return "bg-score-critico";
  if (score === 2) return "bg-score-debil";
  if (score === 3) return "bg-score-funcional";
  if (score === 4) return "bg-score-fuerte";
  return "bg-score-escalable";
}

export function scoreBadgeColor(score: number) {
  if (score <= 1) {
    return "border-score-critico/35 bg-score-critico/12 text-red-200";
  }
  if (score === 2) {
    return "border-score-debil/35 bg-score-debil/12 text-orange-200";
  }
  if (score === 3) {
    return "border-score-funcional/35 bg-score-funcional/12 text-yellow-100";
  }
  if (score === 4) {
    return "border-score-fuerte/35 bg-score-fuerte/12 text-lime-100";
  }
  return "border-score-escalable/35 bg-score-escalable/12 text-emerald-100";
}

export function scoreEstado(score: number): string {
  if (score <= 1) return "Crítico";
  if (score === 2) return "Débil";
  if (score === 3) return "Funcional";
  if (score === 4) return "Fuerte";
  return "Escalable";
}

export const VARIABLE_LABELS: Record<string, string> = {
  problema: "Problema",
  solucion: "Solución",
  icp: "ICP / Cliente ideal",
  cliente_actual: "Cliente actual",
  oferta: "Oferta",
  ecuacion_valor: "Ecuación de valor",
  ticket_medio: "Ticket medio",
  recurrencia: "Recurrencia",
  canal_adquisicion: "Canal de adquisición",
  cac: "CAC",
  conversion: "Conversión",
  seguimiento: "Seguimiento",
  escalamiento: "Escalamiento",
  capacidad_ejecucion: "Capacidad de ejecución"
};
