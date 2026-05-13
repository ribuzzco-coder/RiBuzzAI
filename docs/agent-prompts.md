# RiBuzz · System prompts de los 7 agentes

Documento canónico de los prompts del workflow multi-agente. Si actualizas un prompt en n8n, actualízalo aquí también — este archivo es la única fuente de verdad versionada en git. Si algún día migras de n8n a código (u otro orquestador), partes de aquí.

| Agente | Rol | Modelo | Max tokens | Entrada | Salida |
|---|---|---|---|---|---|
| 1 | Sintetizador | claude-sonnet-4-5 | 4096 | 40 respuestas + empresa | JSON estructurado por variable |
| 2A | Scorer PMF | claude-sonnet-4-5 | 3000 | P1 + métricas | 4 scores: problema, solucion, icp, cliente_actual |
| 2B | Scorer Monetización | claude-sonnet-4-5 | 3000 | P1 + métricas | 4 scores: oferta, ecuacion_valor, ticket_medio, recurrencia |
| 2C | Scorer Adquisición | claude-sonnet-4-5 | 3000 | P1 + métricas | 3 scores: canal_adquisicion, cac, conversion |
| 2D | Scorer Operaciones | claude-sonnet-4-5 | 3000 | P1 + métricas | 3 scores: seguimiento, escalamiento, capacidad_ejecucion |
| 3 | Top Fugas Selector | claude-sonnet-4-5 | 2000 | 14 scores + métricas | Array de 3 fugas priorizadas |
| 4 | Reporter | claude-sonnet-4-5 | 3000 | P1 + scores + top_fugas | Texto narrativo en JSON |
| 5 | Playbook Strategist | claude-sonnet-4-5 | 3500 | P1 + scores + top_fugas + empresa | Playbook 30 días en JSON |
| 6 | Lead Classifier | claude-sonnet-4-5 | 2000 | Todo lo anterior | Clasificación MQL/SQL + msg WhatsApp |
| 7 | Quality Reviewer | claude-sonnet-4-5 | 1500 | Outputs de 3-6 | `{ok, observaciones, severity}` |

---

## Agente 1 — Sintetizador

**Rol:** Toma las 40 respuestas crudas y las estructura en un JSON tipado por variable. Sin juicio de calidad — solo organización.

**Reglas clave:**
- `is_unknown=true` o respuesta vacía → registrar `"DESCONOCIDO"` + agregar a `flags[]`.
- Respuesta vaga o incompleta → guardar lo que hay + nota en `observaciones`.
- Nunca inventar información.
- Devolver solo JSON, sin texto extra.

**Schema de salida:**

```json
{
  "empresa": { "nombre": "", "sector": "", "etapa": "", "tamano": "" },
  "variables": {
    "problema": { "texto": "", "impacto": "", "completitud": 0, "is_unknown": false },
    "solucion": { "texto": "", "diferenciador": "", "completitud": 0, "is_unknown": false },
    "icp": { "texto": "", "completitud": 0, "is_unknown": false },
    "cliente_actual": { "texto": "", "completitud": 0, "is_unknown": false },
    "oferta": { "texto": "", "completitud": 0, "is_unknown": false },
    "ecuacion_valor": { "texto": "", "completitud": 0, "is_unknown": false },
    "ticket_medio": { "texto": "", "completitud": 0, "is_unknown": false },
    "recurrencia": { "texto": "", "completitud": 0, "is_unknown": false },
    "canal_adquisicion": { "texto": "", "completitud": 0, "is_unknown": false },
    "cac": { "texto": "", "completitud": 0, "is_unknown": false },
    "conversion": { "texto": "", "completitud": 0, "is_unknown": false },
    "seguimiento": { "texto": "", "completitud": 0, "is_unknown": false },
    "escalamiento": { "texto": "", "completitud": 0, "is_unknown": false },
    "capacidad_ejecucion": { "texto": "", "completitud": 0, "is_unknown": false }
  },
  "metricas_brutas": {
    "ventas_mes": 0, "clientes_actuales": 0, "clientes_nuevos": 0,
    "inversion_mes": 0, "leads_mes": 0, "tasa_conversion": 0
  },
  "objetivos": { "meta_3m": "", "obstaculo": "" },
  "flags": [],
  "observaciones": {}
}
```

---

## Agentes 2A-2D — Scorers especializados (paralelo)

Cada scorer evalúa entre 3 y 4 variables de su dominio. Escala 1-5: 1=Crítico, 2=Débil, 3=Funcional, 4=Fuerte, 5=Escalable.

**Regla universal:** si `is_unknown=true` para una variable → score máximo 2.

**Output por variable:**

```json
{
  "score": 1-5,
  "estado": "Crítico|Débil|Funcional|Fuerte|Escalable",
  "diagnostico": "1 frase: qué está pasando",
  "impacto": "1 frase: cómo afecta a ingresos",
  "recomendacion": "1 acción concreta y específica"
}
```

### 2A — Product-Market Fit

Variables: `problema, solucion, icp, cliente_actual`.

Rúbrica resumida (ver workflow n8n para texto literal):
- **Problema:** de "no articula" (1) a "cuantificado + urgente" (5).
- **Solución:** de "no explica" (1) a "único + demostrable" (5).
- **ICP:** de "no sabe a quién vende" (1) a "ICP + real alineados" (5).
- **Cliente actual:** de "sin clientes" (1) a "ICP = cliente real reproducible" (5).

### 2B — Monetización

Variables: `oferta, ecuacion_valor, ticket_medio, recurrencia`.

- **Oferta:** de "cotiza caso a caso" (1) a "productizada + pública" (5).
- **Ecuación de valor:** de "no articula resultado" (1) a "medible + automatizado + prueba social" (5).
- **Ticket medio:** ancla con las métricas calculadas (ratio_cac_ticket, ratio_cac_ltv).
- **Recurrencia:** de "100% única" (1) a "sistema documentado" (5).

### 2C — Adquisición

Variables: `canal_adquisicion, cac, conversion`.

- **Canal:** de "sin canal" (1) a "multi-canal medido" (5).
- **CAC:** ancla con `ratio_cac_ticket`. >50% = 2, 20-50% = 3, <20% = 4.
- **Conversión:** de "no sabe tasa" (1) a ">40% documentado" (5).

### 2D — Operaciones

Variables: `seguimiento, escalamiento, capacidad_ejecucion`.

- **Seguimiento:** de "sin proceso" (1) a "CRM + secuencia automatizada" (5).
- **Escalamiento:** de "100% fundador" (1) a "80%+ documentado y delegable" (5).
- **Capacidad ejecución:** combina herramientas + tiempo + presupuesto.

---

## Agente 3 — Top Fugas Selector

**Rol:** Recibe los 14 scores agregados y selecciona EXACTAMENTE 3 variables como top_fugas.

**Criterio de selección (pesos):**
- Impacto potencial en ingresos si se corrige: **40%**
- Urgencia del problema ahora: **30%**
- Facilidad real de mejora dado el contexto: **30%**

**Desempate:** la variable con score más bajo va primero.

**Output:**

```json
{
  "top_fugas": [
    {
      "variable": "seguimiento",
      "prioridad": 1,
      "diagnostico": "1 frase específica para esta empresa",
      "recomendacion": "1 acción concreta y ejecutable"
    },
    { "variable": "oferta", "prioridad": 2, ... },
    { "variable": "canal_adquisicion", "prioridad": 3, ... }
  ]
}
```

---

## Agente 4 — Reporter

**Rol:** Redacta el reporte que ve el fundador en `/results`. Tono honesto, sin jerga, claro en 2 minutos de lectura.

**Reglas:**
- Lenguaje simple, sin tecnicismos.
- No mencionar scores numéricos — usar estados (Crítico, Débil, etc.).
- Max 400 palabras en `situacion_actual`.
- `lectura_principal` = UNA frase impactante y honesta.
- `siguiente_paso` = ejecutable en 7 días.

**Output:**

```json
{
  "situacion_actual": "...",
  "lectura_principal": "La empresa tiene demanda pero está perdiendo ...",
  "variables_fuertes": ["oferta", "solucion"],
  "variables_debiles": ["seguimiento", "canal_adquisicion", "cac"],
  "recomendacion_general": "...",
  "siguiente_paso": "acción concreta para los próximos 7 días"
}
```

---

## Agente 5 — Playbook Strategist

**Rol:** Diseña un playbook EJECUTABLE por la empresa SIN acompañamiento, adaptado a sector y tamaño.

**Reglas:**
- Solo recomienda acciones que la empresa puede ejecutar sola.
- Máximo 3 acciones priorizadas — no abrumar.
- Cada acción debe atacar UNA de las top_fugas.

**Output:**

```json
{
  "cliente_prioritario": "descripción del ICP recomendado",
  "oferta_recomendada": "estructura de oferta sugerida",
  "canal_sugerido": "canal principal + razón específica",
  "mensaje_base": "mensaje comercial base",
  "acciones": [
    {
      "titulo": "Crear proceso mínimo de seguimiento",
      "que_corregir": "...",
      "por_que": "...",
      "como": "...",
      "metrica": "...",
      "resultado_esperado": "...",
      "tiempo_estimado": "1 semana",
      "prioridad": 1
    }
  ],
  "metricas_a_medir": ["leads contactados/semana", "tasa de respuesta"],
  "plan_30_dias": {
    "semana_1": "foco y acción principal",
    "semana_2": "...",
    "semana_3": "...",
    "semana_4": "..."
  }
}
```

---

## Agente 6 — Lead Classifier

**Rol:** Clasificación interna del lead. Output **NUNCA** se muestra al cliente — solo `/admin`.

**Output:**

```json
{
  "status": "mql | sql | no_fit",
  "fit_level": "alto | medio | bajo",
  "urgency": "alta | media | baja",
  "payment_capacity": "alta | media | baja",
  "execution_capacity": "alta | media | baja",
  "suggested_route": "diagnostico_premium | diseno_comercial | implementacion | growth_partner | no_fit",
  "justificacion": "una frase explicando la clasificación",
  "opening_message": "mensaje WhatsApp para primer contacto, max 3 líneas, cálido y específico"
}
```

**Criterio de status:**
- `sql`: fit alto + urgency alta + payment alta.
- `mql`: fit medio o alto, pero falta señal de pago o urgencia.
- `no_fit`: incompatibilidad clara (negocio sin ventas, sin tiempo, sin presupuesto).

---

## Agente 7 — Quality Reviewer

**Rol:** Audita la consistencia de todos los outputs. No modifica nada — solo señala.

**Verifica:**

1. Las `top_fugas` reflejan los scores más bajos (no hay disonancia entre 2A-2D y 3).
2. El playbook ataca explícitamente las top_fugas.
3. `lectura_principal` del reporter es coherente con `score_global`.
4. `suggested_route` del classifier es coherente con `fit_level` + `payment_capacity` + `execution_capacity`.
5. Ninguna recomendación es genérica/copy-paste (todas mencionan algo específico de la empresa).

**Output:**

```json
{
  "ok": true,
  "observaciones": [],
  "severity": "low" 
}
```

O si hay inconsistencias:

```json
{
  "ok": false,
  "observaciones": [
    "El playbook recomienda crear oferta nueva pero la oferta NO está en las top_fugas",
    "El reporter dice que el negocio 'tiene demanda' pero el score de conversion es 1"
  ],
  "severity": "medium"
}
```

El review se guarda en `scores.raw_ai_response.review` para auditoría — no se muestra al cliente, pero el panel `/admin` puede mostrarlo para que el equipo RiBuzz revise diagnósticos marcados como `severity: high` antes de contactar al lead.

---

## Versionado

Cuando hagas cambios significativos a un prompt:

1. Edita el nodo en n8n.
2. Actualiza este archivo con el cambio.
3. Commit en git con mensaje del tipo `prompts(agent-4): tono más directo en lectura_principal`.
4. (Opcional) etiqueta con un changelog en este mismo archivo:

```
### 2025-12 → 2026-01
- Agente 4: subimos max_tokens a 3500 porque la situacion_actual se cortaba en empresas con muchas variables débiles.
- Agente 6: ajustamos el mensaje WhatsApp para no exceder 3 líneas (antes a veces salía con 5).
```
