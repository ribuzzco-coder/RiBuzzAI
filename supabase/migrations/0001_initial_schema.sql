-- =========================================================
-- RiBuzz AI - Esquema inicial
-- Ejecutar en Supabase SQL Editor o con `supabase db push`
-- =========================================================

-- Extensiones
create extension if not exists "pgcrypto";

-- ---------- users ----------
-- Nota: Supabase Auth ya crea auth.users. Esta tabla es el espejo
-- aplicativo enlazado por id = auth.uid().
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text unique not null,
  name        text not null,
  whatsapp    text,
  role        text default 'founder' check (role in ('founder','manager','admin')),
  created_at  timestamptz default now()
);

-- ---------- companies ----------
create table if not exists public.companies (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  name        text not null,
  sector      text not null check (sector in ('servicios_b2b','educacion','turismo','salud','comercio','otro')),
  city        text default 'Medellín',
  size        text check (size in ('1-5','6-10','11-20','21-50')),
  stage       text check (stage in ('ideacion','arranque','crecimiento','transformacion')),
  website     text,
  created_at  timestamptz default now()
);
create index if not exists companies_user_id_idx on public.companies(user_id);

-- ---------- diagnostics ----------
create table if not exists public.diagnostics (
  id                uuid primary key default gen_random_uuid(),
  company_id        uuid not null references public.companies(id) on delete cascade,
  status            text default 'in_progress' check (status in ('in_progress','completed','abandoned')),
  current_question  int default 1 check (current_question between 1 and 40),
  completed_at      timestamptz,
  duration_seconds  int,
  created_at        timestamptz default now()
);
create index if not exists diagnostics_company_id_idx on public.diagnostics(company_id);
create index if not exists diagnostics_status_idx on public.diagnostics(status);

-- ---------- diagnostic_answers ----------
create table if not exists public.diagnostic_answers (
  id                uuid primary key default gen_random_uuid(),
  diagnostic_id     uuid not null references public.diagnostics(id) on delete cascade,
  question_number   int  not null check (question_number between 1 and 40),
  variable_bd       text not null,
  question_text     text not null,
  answer_text       text,
  is_unknown        bool default false,
  is_fused          bool default false,
  created_at        timestamptz default now(),
  unique (diagnostic_id, question_number, variable_bd)
);
create index if not exists answers_diagnostic_id_idx on public.diagnostic_answers(diagnostic_id);

-- ---------- scores ----------
create table if not exists public.scores (
  id                    uuid primary key default gen_random_uuid(),
  diagnostic_id         uuid unique not null references public.diagnostics(id) on delete cascade,
  problema              int check (problema between 1 and 5),
  solucion              int check (solucion between 1 and 5),
  icp                   int check (icp between 1 and 5),
  cliente_actual        int check (cliente_actual between 1 and 5),
  oferta                int check (oferta between 1 and 5),
  ecuacion_valor        int check (ecuacion_valor between 1 and 5),
  ticket_medio          int check (ticket_medio between 1 and 5),
  recurrencia           int check (recurrencia between 1 and 5),
  canal_adquisicion     int check (canal_adquisicion between 1 and 5),
  cac                   int check (cac between 1 and 5),
  conversion            int check (conversion between 1 and 5),
  seguimiento           int check (seguimiento between 1 and 5),
  escalamiento          int check (escalamiento between 1 and 5),
  capacidad_ejecucion   int check (capacidad_ejecucion between 1 and 5),
  score_global          numeric(4,2),
  top_fugas             jsonb not null default '[]'::jsonb,
  calculated_metrics    jsonb,
  raw_ai_response       jsonb,
  created_at            timestamptz default now()
);

-- ---------- reports ----------
create table if not exists public.reports (
  id                    uuid primary key default gen_random_uuid(),
  diagnostic_id         uuid unique not null references public.diagnostics(id) on delete cascade,
  situacion_actual      text,
  lectura_principal     text,
  variables_fuertes     jsonb default '[]'::jsonb,
  variables_debiles     jsonb default '[]'::jsonb,
  recomendacion_general text,
  siguiente_paso        text,
  raw_ai_response       jsonb,
  created_at            timestamptz default now()
);

-- ---------- playbooks ----------
create table if not exists public.playbooks (
  id                    uuid primary key default gen_random_uuid(),
  diagnostic_id         uuid unique not null references public.diagnostics(id) on delete cascade,
  cliente_prioritario   text,
  oferta_recomendada    text,
  canal_sugerido        text,
  mensaje_base          text,
  acciones              jsonb default '[]'::jsonb,
  metricas_a_medir      jsonb default '[]'::jsonb,
  plan_30_dias          jsonb,
  raw_ai_response       jsonb,
  created_at            timestamptz default now()
);

-- ---------- leads (clasificación interna - P5) ----------
create table if not exists public.leads (
  id                    uuid primary key default gen_random_uuid(),
  diagnostic_id         uuid unique not null references public.diagnostics(id) on delete cascade,
  status                text check (status in ('mql','sql','no_fit','contacted','meeting_scheduled','won','lost')),
  fit_level             text check (fit_level in ('alto','medio','bajo')),
  urgency               text check (urgency in ('alta','media','baja')),
  payment_capacity      text check (payment_capacity in ('alta','media','baja')),
  execution_capacity    text check (execution_capacity in ('alta','media','baja')),
  suggested_route       text,
  justificacion         text,
  opening_message       text,
  internal_notes        text,
  next_action           text,
  next_action_at        timestamptz,
  raw_ai_response       jsonb,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);
create index if not exists leads_status_idx on public.leads(status);

-- Trigger para updated_at en leads
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
before update on public.leads
for each row execute function public.set_updated_at();
