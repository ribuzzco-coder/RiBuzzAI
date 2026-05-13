-- =========================================================
-- RiBuzz AI - Row Level Security
-- Cada usuario solo ve sus propios datos. El panel /admin
-- usa service_role (bypasea RLS).
-- =========================================================

alter table public.users              enable row level security;
alter table public.companies          enable row level security;
alter table public.diagnostics        enable row level security;
alter table public.diagnostic_answers enable row level security;
alter table public.scores             enable row level security;
alter table public.reports            enable row level security;
alter table public.playbooks          enable row level security;
alter table public.leads              enable row level security;

-- ---------- users ----------
drop policy if exists users_own on public.users;
create policy users_own on public.users
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- ---------- companies ----------
drop policy if exists companies_own on public.companies;
create policy companies_own on public.companies
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- diagnostics ----------
drop policy if exists diagnostics_own on public.diagnostics;
create policy diagnostics_own on public.diagnostics
  for all using (
    company_id in (select id from public.companies where user_id = auth.uid())
  ) with check (
    company_id in (select id from public.companies where user_id = auth.uid())
  );

-- ---------- diagnostic_answers ----------
drop policy if exists answers_own on public.diagnostic_answers;
create policy answers_own on public.diagnostic_answers
  for all using (
    diagnostic_id in (
      select d.id from public.diagnostics d
      join public.companies c on c.id = d.company_id
      where c.user_id = auth.uid()
    )
  ) with check (
    diagnostic_id in (
      select d.id from public.diagnostics d
      join public.companies c on c.id = d.company_id
      where c.user_id = auth.uid()
    )
  );

-- ---------- scores ----------
drop policy if exists scores_own on public.scores;
create policy scores_own on public.scores
  for select using (
    diagnostic_id in (
      select d.id from public.diagnostics d
      join public.companies c on c.id = d.company_id
      where c.user_id = auth.uid()
    )
  );

-- ---------- reports ----------
drop policy if exists reports_own on public.reports;
create policy reports_own on public.reports
  for select using (
    diagnostic_id in (
      select d.id from public.diagnostics d
      join public.companies c on c.id = d.company_id
      where c.user_id = auth.uid()
    )
  );

-- ---------- playbooks ----------
drop policy if exists playbooks_own on public.playbooks;
create policy playbooks_own on public.playbooks
  for select using (
    diagnostic_id in (
      select d.id from public.diagnostics d
      join public.companies c on c.id = d.company_id
      where c.user_id = auth.uid()
    )
  );

-- ---------- leads ----------
-- Los usuarios NO ven /leads. Solo service_role accede.
-- No definimos políticas de SELECT para usuarios = sin acceso.
-- (RLS habilitado y sin política = deny por defecto).
