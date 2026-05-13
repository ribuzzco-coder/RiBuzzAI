// =========================================================
// Rúbrica oficial del scorer - blueprint sección 4.2
// Se inyecta como contexto en P2 (Scorer).
// =========================================================

export const RUBRICA_SCORER = `
ESCALA: 1=Crítico · 2=Débil · 3=Funcional · 4=Fuerte · 5=Escalable

PROBLEMA
1 No puede articular el problema que resuelve
2 Describe síntomas genéricos sin impacto
3 Identifica el problema pero el impacto es vago
4 Problema claro + impacto concreto para el cliente
5 Problema urgente + consecuencia grave + lo cuantifica

SOLUCIÓN
1 No puede explicar cómo lo resuelve
2 Descripción vaga sin diferenciador
3 Explica la solución, diferenciador genérico
4 Solución clara + diferenciador específico
5 Solución única + diferenciador demostrable + evidencia

ICP / CLIENTE IDEAL
1 No sabe a quién le vende
2 Perfil muy amplio sin segmentación
3 Identifica un perfil pero sin patrón de cierre
4 Perfil claro + sabe por qué cierra rápido
5 ICP definido + cliente real alineado + patrón identificado

CLIENTE ACTUAL
1 Sin clientes activos, vende a cualquiera
2 Clientes muy distintos entre sí, sin patrón
3 Tiene clientes pero no sabe qué tienen en común
4 Sabe qué perfil le compra mejor
5 ICP ideal = cliente real + puede reproducir el patrón

OFERTA
1 Sin oferta definida, cotiza caso a caso
2 Tiene precio pero sin alcance ni resultado
3 Oferta con precio y alcance, sin resultado prometido
4 Precio + alcance + resultado + CTA definidos
5 Oferta productizada, niveles, precios públicos, propuesta clara

ECUACIÓN DE VALOR
1 No puede articular qué resultado obtiene el cliente
2 Resultado vago, sin CTA definido
3 Resultado claro pero CTA confuso o inexistente
4 Resultado concreto + CTA claro y accesible
5 Resultado medible + CTA automatizado + prueba social

TICKET MEDIO
1 Ticket tan bajo que no permite invertir en adquisición
2 Ticket cubre operación pero sin margen para crecer
3 Ticket con margen mínimo, limita inversión
4 Ticket permite invertir en adquisición con margen
5 Ticket alto + opciones de upsell + LTV calculado

RECURRENCIA
1 Venta 100% única, sin ningún cliente que vuelva
2 Algunos vuelven pero sin sistema para activarlo
3 Hay recompra espontánea sin proceso de retención
4 Proceso activo de retención con clientes recurrentes
5 Sistema documentado: suscripción, mantenimiento o reactivación

CANAL ADQUISICIÓN
1 Sin canal definido, cada cliente llega de forma distinta
2 Un canal pero impredecible (suerte o referidos)
3 Canal principal identificado pero no escalable
4 Canal predecible + sabe cómo invertir en él
5 Multi-canal con medición: sabe qué canal genera más cierres

CAC
1 No sabe cuánto le cuesta adquirir un cliente
2 CAC > 50% del ticket (negocio insostenible)
3 CAC entre 20-50% del ticket (margen ajustado)
4 CAC < 20% del ticket (margen saludable)
5 CAC calculado, optimizado y tendencia decreciente

CONVERSIÓN
1 No sabe su tasa de conversión
2 Tasa < 10% sin saber por qué
3 Tasa 10-25%, identifica algunos cuellos
4 Tasa > 25% con proceso identificado
5 Tasa > 40% con proceso documentado y mejora continua

SEGUIMIENTO
1 Sin seguimiento — si no compran de inmediato se pierden
2 Seguimiento espontáneo, sin sistema ni frecuencia
3 Proceso básico pero no documentado ni consistente
4 Proceso documentado con frecuencia y mensajes definidos
5 CRM + secuencia automatizada + registro de cada interacción

ESCALAMIENTO
1 Todo el proceso depende solo del fundador
2 La mayoría depende de él, delega solo operativo
3 Algunos procesos documentados, los críticos en él
4 La mitad del proceso documentado y delegado
5 80%+ del proceso documentado y ejecutable sin el fundador

CAPACIDAD EJECUCIÓN
1 Sin herramientas, sin tiempo, sin presupuesto
2 Herramientas mínimas, <2h/semana, sin presupuesto
3 Herramientas básicas, tiempo parcial, presupuesto mínimo
4 Herramientas adecuadas, tiempo asignado, algo de presupuesto
5 Stack completo, equipo con tiempo dedicado y presupuesto asignado

REGLA ESPECIAL: si is_unknown=true para una variable → score máximo 2.
TOP 3 FUGAS: seleccionar 3 variables con mayor impacto (40%) + urgencia (30%) + facilidad de mejora (30%).
Desempate: priorizar la de score más bajo.
`.trim();
