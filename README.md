# RiBuzz AI — MVP

Plataforma de diagnóstico comercial productizado. Stack: **Next.js 14 (App Router) + Supabase + Claude API + Vercel**.

> Convierte información comercial dispersa en diagnóstico estructurado, score de 14 variables críticas, reporte de situación actual y playbook accionable — en menos de 15 minutos.

---

## Tabla de contenido

1. [Stack y arquitectura](#stack)
2. [Requisitos previos](#requisitos)
3. [Setup local](#setup-local)
4. [Configurar Supabase](#supabase)
5. [Configurar Claude API](#claude)
6. [Deploy en Vercel](#vercel)
7. [Estructura del proyecto](#estructura)
8. [Flujo de procesamiento (P1–P5)](#prompts)
9. [Checklist demo](#checklist)
10. [Notas para el desarrollador freelancer](#freelancer)

---

## 1. Stack y arquitectura <a id="stack"></a>

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 14 App Router + Tailwind CSS |
| Auth + DB | Supabase (Postgres 15 + RLS) |
| IA | Claude API (`claude-sonnet-4-5`) |
| Deploy | Vercel |
| Pagos (fase 4) | Wompi |

**Arquitectura clave:** procesamiento batch. El usuario completa las 40 preguntas, las respuestas se guardan en tiempo real, y al terminar se ejecuta en secuencia P1 → Code → P2 → P3 → P4 → P5 (~30–60s). Si algo falla, los datos siguen intactos y el endpoint se puede reintentar.

---

## 2. Requisitos previos <a id="requisitos"></a>

- Node.js ≥ 18.17
- Cuenta en [Supabase](https://supabase.com)
- API key de [Anthropic](https://console.anthropic.com)
- Cuenta en [Vercel](https://vercel.com) (para deploy)
- (Opcional) [Supabase CLI](https://supabase.com/docs/guides/cli) para migraciones

---

## 3. Setup local <a id="setup-local"></a>

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales reales

# 3. Aplicar el esquema en Supabase (ver sección 4)

# 4. Correr el dev server
npm run dev
# → http://localhost:3000
```

Comandos útiles:

- `npm run dev` — desarrollo
- `npm run build` — build de producción
- `npm run typecheck` — chequeo de tipos
- `npm run lint` — ESLint

---

## 4. Configurar Supabase <a id="supabase"></a>

1. Crea un proyecto nuevo en [supabase.com](https://supabase.com).
2. Ve a **Settings → API** y copia:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (⚠️ secreta — solo servidor)
3. Ejecuta las migraciones en orden en **SQL Editor**:
   - `supabase/migrations/0001_initial_schema.sql` — crea tablas
   - `supabase/migrations/0002_rls_policies.sql` — habilita RLS
   - `supabase/migrations/0003_user_trigger.sql` — sincroniza auth.users → public.users

   O usando la CLI:
   ```bash
   supabase link --project-ref <tu-ref>
   supabase db push
   ```
4. En **Authentication → Providers** habilita **Email** (la app usa email + password).
5. **Importante:** revisa que RLS esté ON en todas las tablas listadas en `0002_rls_policies.sql`.

---

## 5. Configurar Claude API <a id="claude"></a>

1. Crea una key en [console.anthropic.com](https://console.anthropic.com).
2. Cárgala en `.env.local`:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ANTHROPIC_MODEL=claude-sonnet-4-5
   ```
3. Esta key vive **solo del lado servidor** (API Routes). Nunca debe aparecer en código del cliente — verificable con:
   ```bash
   grep -rn "ANTHROPIC_API_KEY" app/ components/ lib/
   # Solo debería aparecer en lib/claude.ts y archivos bajo app/api/
   ```

---

## 6. Deploy en Vercel <a id="vercel"></a>

1. Sube este repo a GitHub.
2. En Vercel → **New Project** → importa el repo.
3. Framework preset: **Next.js** (autodetectado).
4. Carga las **Environment Variables** desde tu `.env.local` (no commitees `.env.local`).
5. Deploy. Configura el dominio (`ribuzz.ai` o el que uses) en **Settings → Domains**.
6. En Supabase **Authentication → URL Configuration**, agrega tu dominio Vercel a:
   - Site URL
   - Redirect URLs

> El endpoint `/api/diagnostic/process` declara `maxDuration = 120` (segundos). Vercel Hobby permite hasta 60s; Vercel Pro permite hasta 300s. Para producción, Pro es lo recomendado.

---

## 7. Estructura del proyecto <a id="estructura"></a>

```
ribuzz-ai/
├── app/
│   ├── (auth)/login, register/        # Auth pages
│   ├── (app)/diagnostic, processing,  # Flujo principal
│   │         results, profile/
│   ├── admin/                         # Panel interno
│   │   └── [id]/                      # Detalle de empresa
│   └── api/
│       ├── diagnostic/save, process/
│       └── admin/leads/
├── components/
│   ├── ui/                            # Button, Input, Badge, Card
│   ├── diagnostic/                    # QuestionCard, ProgressBar, AnswerInput
│   ├── results/                       # ScoreCard, FugasCard, PlaybookAccordion
│   └── admin/                         # LeadTable, StatusDropdown
├── lib/
│   ├── supabase/client.ts, server.ts
│   ├── claude.ts                      # Wrapper con retry + JSON validation
│   ├── formulas.ts                    # Nodo Code (cálculos puros)
│   ├── questions.ts                   # Las 40 preguntas del blueprint
│   ├── prompts/p1..p5 + rubrica.ts
│   ├── types.ts
│   └── utils.ts
├── supabase/migrations/               # Esquema + RLS + trigger
├── middleware.ts                      # Protección de rutas + admin guard
└── .env.example
```

---

## 8. Flujo de procesamiento (P1–P5) <a id="prompts"></a>

```
[ 40 respuestas ] ──► P1 Síntesis ──► [JSON estructurado]
                          │
                          ├──► nodo Code (formulas.ts) ──► [métricas]
                          ▼
                       P2 Scorer (14 vars · top 3 fugas)
                          ▼
                       P3 Reporte (narrativo · <400 palabras)
                          ▼
                       P4 Playbook (3 acciones · plan 30 días)
                          ▼
                       P5 Clasificación  ─► solo /admin (mql/sql/no_fit + msg WhatsApp)
```

Cada prompt se persiste con su `raw_ai_response` para auditoría.

---

## 9. Checklist demo <a id="checklist"></a>

- [ ] Registro de usuario funciona y crea fila en `users` + `companies`.
- [ ] Diagnóstico se puede pausar y reanudar (probar cerrando el navegador en Q15).
- [ ] Botón **No sé** registra `is_unknown=true`.
- [ ] Procesamiento batch completa en <60s con un diagnóstico de prueba.
- [ ] Resultados muestran score, top 3 fugas, reporte y playbook.
- [ ] `/admin` solo accesible para emails listados en `ADMIN_EMAILS`.
- [ ] Exportar CSV desde `/admin` funciona.
- [ ] No hay errores en consola del navegador.
- [ ] RLS verificado: con dos usuarios A y B, A no debe ver datos de B.

---

## 10. Notas para el desarrollador freelancer <a id="freelancer"></a>

**Lo que ya está hecho (este scaffold):**

- Estructura de proyecto completa.
- Esquema SQL con RLS y trigger de auth.
- Wrapper de Claude API con retry y validación JSON.
- Los 5 prompts P1–P5 con la rúbrica exacta del blueprint.
- Las 40 preguntas tipadas en `lib/questions.ts`.
- Nodo Code (`lib/formulas.ts`) con todas las fórmulas.
- Flujo end-to-end funcional: landing → registro → diagnóstico → procesamiento → resultados → panel admin.

**Lo que conviene mejorar antes de pilotos reales:**

- Tests E2E (Playwright) del flujo completo.
- Validación adicional de los JSON devueltos por Claude con Zod schemas (los tipos están listos en `lib/types.ts`).
- Manejo de race conditions en `/api/diagnostic/save` si se hace doble-click.
- Rate limiting en `/api/diagnostic/process` (un diagnóstico por usuario cada X minutos).
- Integración con n8n para follow-up (WhatsApp + email).
- Integración con Wompi (Fase 4).
- Analytics (Vercel Analytics + Posthog).
- Logging estructurado (Sentry o Axiom).
- Página de gracias / share-link para US-RE04.

**Convenciones del código:**

- Todo está en TypeScript estricto.
- Componentes en `"use client"` solo donde se necesita interactividad.
- API Routes validan input con Zod.
- Las variables `variable_bd` se guardan tal cual figuran en el blueprint — **no renombrar**, los prompts dependen de esos nombres.

---

**Contacto:** José David Barrientos · jose@ribuzz.co · Medellín
