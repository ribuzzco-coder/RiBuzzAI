-- =========================================================
-- Tabla processing_jobs
-- Rastrea el estado async del procesamiento multi-agente
-- que corre en n8n. Permite mostrar progreso real al usuario.
-- =========================================================

create table if not exists public.processing_jobs (
  id              uuid primary key default gen_random_uuid(),
  diagnostic_id   uuid not null references public.diagnostics(id) on delete cascade,
  status          text not null default 'queued'
                    check (status in ('queued','running','completed','failed','cancelled')),
  current_phase   text,
  -- Fases posibles:
  -- fetching_data, calculating_metrics, synthesizing, scoring_pmf,
  -- scoring_monetizacion, scoring_adquisicion, scoring_operaciones,
  -- selecting_top_fugas, writing_report, designing_playbook,
  -- classifying_lead, quality_review, persisting, done
  progress_pct    int default 0 check (progress_pct between 0 and 100),
  error_message   text,
  webhook_id      text,      -- id de ejecución en n8n para trazabilidad
  started_at      timestamptz default now(),
  completed_at    timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists processing_jobs_diagnostic_id_idx
  on public.processing_jobs(diagnostic_id);
create index if not exists processing_jobs_status_idx
  on public.processing_jobs(status);

-- Trigger updated_at
drop trigger if exists processing_jobs_set_updated_at on public.processing_jobs;
create trigger processing_jobs_set_updated_at
before update on public.processing_jobs
for each row execute function public.set_updated_at();

-- RLS: usuario solo ve jobs de sus propios diagnósticos
alter table public.processing_jobs enable row level security;

drop policy if exists processing_jobs_own on public.processing_jobs;
create policy processing_jobs_own on public.processing_jobs
  for select using (
    diagnostic_id in (
      select d.id from public.diagnostics d
      join public.companies c on c.id = d.company_id
      where c.user_id = auth.uid()
    )
  );
