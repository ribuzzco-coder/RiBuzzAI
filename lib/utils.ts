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
