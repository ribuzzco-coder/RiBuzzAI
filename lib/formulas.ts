// =========================================================
// Nodo Code - Cálculos matemáticos puros (sin IA)
// Definidos en el blueprint sección 5.2
// =========================================================

import type { CalculatedMetrics, DiagnosticAnswersFlat } from "./types";

/**
 * Parser tolerante: acepta números, rangos ("100k - 200k"), strings
 * con símbolos ($, COP) y devuelve el valor numérico medio.
 */
function num(value: string | undefined, fallback = 0): number {
  if (!value) return fallback;
  const clean = value.toString().toLowerCase().replace(/[$,\s]/g, "");
  const matches = clean.match(/\d+(?:\.\d+)?(?:k|m|mm)?/g);
  if (!matches) return fallback;

  const nums = matches.map((m) => {
    let n = parseFloat(m);
    if (m.endsWith("mm") || m.endsWith("m")) n *= 1_000_000;
    else if (m.endsWith("k")) n *= 1_000;
    return n;
  });

  if (nums.length === 0) return fallback;
  // Si es rango, usar punto medio
  if (nums.length >= 2) return (nums[0] + nums[1]) / 2;
  return nums[0];
}

export function calcularMetricas(
  answers: DiagnosticAnswersFlat
): CalculatedMetrics {
  const ventas = num(answers.comercial_ventas_mes);
  const clientes = Math.max(num(answers.comercial_clientes_actuales, 1), 1);
  const nuevos = num(answers.comercial_clientes_nuevos);
  const inversion = num(answers.comercial_inversion_mes);
  const leads = Math.max(num(answers.comercial_leads_mes, 1), 1);
  const conv_pct = num(answers.comercial_tasa_conversion);

  // 1. Ticket medio
  const ticket_medio = ventas / clientes;

  // 2. CAC
  const cac = nuevos > 0 ? inversion / nuevos : inversion;

  // 3. LTV estimado (12 meses como supuesto MVP)
  const ltv = ticket_medio * 12;

  // 4. CAC / Ticket
  const ratio_cac_ticket =
    ticket_medio > 0 ? (cac / ticket_medio) * 100 : 100;

  // 5. CAC / LTV
  const ratio_cac_ltv = ltv > 0 ? (cac / ltv) * 100 : 100;

  // 6. Leads perdidos
  const leads_perdidos = Math.round(leads * (1 - conv_pct / 100));

  // 7. Ingreso potencial (si conversión sube +10pp)
  const conversion_actual = conv_pct / 100;
  const conversion_objetivo = Math.min(conversion_actual + 0.1, 1);
  const clientes_adicionales = Math.round(
    leads * (conversion_objetivo - conversion_actual)
  );
  const ingreso_potencial = clientes_adicionales * ticket_medio;

  // 8. Salud comercial (0-100)
  const s_ticket = Math.min(ticket_medio / 1_000_000, 1) * 100;
  const s_cac = Math.max(0, 100 - ratio_cac_ticket);
  const s_conv = Math.min(conv_pct * 2, 100);
  const s_ltv_cac = Math.max(0, 100 - ratio_cac_ltv);

  const salud_comercial = Math.round(
    s_ticket * 0.25 + s_cac * 0.3 + s_conv * 0.25 + s_ltv_cac * 0.2
  );

  return {
    ticket_medio: Math.round(ticket_medio),
    cac: Math.round(cac),
    ltv: Math.round(ltv),
    ratio_cac_ticket: Math.round(ratio_cac_ticket * 10) / 10,
    ratio_cac_ltv: Math.round(ratio_cac_ltv * 10) / 10,
    leads_perdidos,
    ingreso_potencial: Math.round(ingreso_potencial),
    salud_comercial
  };
}
