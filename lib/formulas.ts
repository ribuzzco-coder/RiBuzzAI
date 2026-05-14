import type { CalculatedMetrics, DiagnosticAnswersFlat } from "./types";

function parseToken(token: string): number {
  const suffix = token.match(/(mm|m|k)$/)?.[1];
  let body = token.replace(/(mm|m|k)$/, "");

  if (body.includes(".") && body.includes(",")) {
    body = body.replace(/\./g, "").replace(",", ".");
  } else if (body.includes(",")) {
    body = body.replace(",", ".");
  } else if (/^\d{1,3}(?:\.\d{3})+$/.test(body)) {
    body = body.replace(/\./g, "");
  }

  let parsed = Number.parseFloat(body);
  if (!Number.isFinite(parsed)) return 0;
  if (suffix === "mm" || suffix === "m") parsed *= 1_000_000;
  if (suffix === "k") parsed *= 1_000;
  return parsed;
}

function num(value: string | number | undefined, fallback = 0): number {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;

  const normalized = value.toString().trim().toLowerCase();
  const ranges: Record<string, number> = {
    menos_10: 5,
    "10_30": 20,
    "31_100": 65,
    mas_100: 120,
    "0": 0,
    "1_5": 3,
    "6_15": 10.5,
    "16_30": 23,
    mas_30: 40,
    no_se: fallback
  };
  if (normalized in ranges) return ranges[normalized];

  const clean = normalized
    .replace(/cop|pesos|peso|aprox\.?|aproximadamente|~|\$/g, "")
    .replace(/\s+/g, "");
  const matches = clean.match(/\d+(?:[.,]\d+)*(?:mm|m|k)?/g);
  if (!matches) return fallback;

  const nums = matches.map(parseToken).filter((n) => Number.isFinite(n));
  if (nums.length === 0) return fallback;
  return nums.length >= 2 ? (nums[0] + nums[1]) / 2 : nums[0];
}

function clampPct(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(value, 100));
}

function safeRound(value: number): number {
  return Number.isFinite(value) ? Math.round(value) : 0;
}

export function calcularMetricas(
  answers: DiagnosticAnswersFlat
): CalculatedMetrics {
  const ventas = num(answers.comercial_ventas_mes);
  const clientes = Math.max(num(answers.comercial_clientes_actuales, 1), 1);
  const nuevos = num(answers.comercial_clientes_nuevos ?? answers.ventas_30d);
  const inversion = num(answers.comercial_inversion_mes);
  const leads = Math.max(num(answers.comercial_leads_mes ?? answers.interesados_30d, 1), 1);
  const conv_pct = clampPct(
    num(answers.comercial_tasa_conversion, leads > 0 ? (nuevos / leads) * 100 : 0)
  );

  const ticketDeclarado = num(answers.ticket_promedio);
  const ticket_medio = ticketDeclarado > 0 ? ticketDeclarado : ventas / clientes;
  const cac = nuevos > 0 ? inversion / nuevos : inversion;
  const ltv = ticket_medio * 12;
  const ratio_cac_ticket = ticket_medio > 0 ? (cac / ticket_medio) * 100 : 100;
  const ratio_cac_ltv = ltv > 0 ? (cac / ltv) * 100 : 100;
  const leads_perdidos = safeRound(leads * (1 - conv_pct / 100));
  const conversion_actual = conv_pct / 100;
  const conversion_objetivo = Math.min(conversion_actual + 0.1, 1);
  const clientes_adicionales = safeRound(leads * (conversion_objetivo - conversion_actual));
  const ingreso_potencial = clientes_adicionales * ticket_medio;
  const s_ticket = Math.min(ticket_medio / 1_000_000, 1) * 100;
  const s_cac = Math.max(0, 100 - ratio_cac_ticket);
  const s_conv = Math.min(conv_pct * 2, 100);
  const s_ltv_cac = Math.max(0, 100 - ratio_cac_ltv);
  const salud_comercial = s_ticket * 0.25 + s_cac * 0.3 + s_conv * 0.25 + s_ltv_cac * 0.2;

  return {
    ticket_medio: safeRound(ticket_medio),
    cac: safeRound(cac),
    ltv: safeRound(ltv),
    ratio_cac_ticket: Math.round(ratio_cac_ticket * 10) / 10,
    ratio_cac_ltv: Math.round(ratio_cac_ltv * 10) / 10,
    leads_perdidos,
    ingreso_potencial: safeRound(ingreso_potencial),
    salud_comercial: safeRound(salud_comercial)
  };
}
