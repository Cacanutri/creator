-- MVP Parcerias (reutilizando tabela campaigns)

-- 1) Ajustes em public.campaigns
alter table public.campaigns
  add column if not exists campaign_type text not null default 'SPONSORED_MENTION',
  add column if not exists compensation_model text not null default 'FIXED',
  add column if not exists platform text not null default 'tiktok',
  add column if not exists fixed_fee numeric(12,2),
  add column if not exists commission_rate numeric(5,2),
  add column if not exists products jsonb,
  add column if not exists deliverables jsonb,
  add column if not exists content_rules text,
  add column if not exists proof_required text,
  add column if not exists start_date date,
  add column if not exists end_date date,
  add column if not exists geo_country text default 'BR',
  add column if not exists geo_state text,
  add column if not exists geo_cities text[],
  add column if not exists status text not null default 'draft',
  add column if not exists inquiry_id uuid references public.offer_inquiries(id) on delete set null,
  add column if not exists creator_id uuid references public.profiles(id) on delete cascade,
  add column if not exists brand_id uuid references public.profiles(id) on delete cascade,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

-- 2) RLS (parcerias)
alter table public.campaigns enable row level security;

drop policy if exists "campaigns_select_owner" on public.campaigns;
create policy "campaigns_select_owner"
on public.campaigns
for select
using (brand_id = auth.uid() or creator_id = auth.uid());

drop policy if exists "campaigns_insert_brand" on public.campaigns;
create policy "campaigns_insert_brand"
on public.campaigns
for insert
to authenticated
with check (brand_id = auth.uid());

drop policy if exists "campaigns_update_owner" on public.campaigns;
create policy "campaigns_update_owner"
on public.campaigns
for update
to authenticated
using (brand_id = auth.uid() or creator_id = auth.uid())
with check (brand_id = auth.uid() or creator_id = auth.uid());

-- 3) Provas simples (opcional)
create table if not exists public.partnership_proofs (
  id uuid primary key default gen_random_uuid(),
  partnership_id uuid references public.campaigns(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  proof_url text,
  note text,
  created_at timestamptz default now()
);

alter table public.partnership_proofs enable row level security;

drop policy if exists "partnership_proofs_select_owner" on public.partnership_proofs;
create policy "partnership_proofs_select_owner"
on public.partnership_proofs
for select
using (
  exists (
    select 1
    from public.campaigns c
    where c.id = partnership_id
      and (c.brand_id = auth.uid() or c.creator_id = auth.uid())
  )
);

drop policy if exists "partnership_proofs_insert_owner" on public.partnership_proofs;
create policy "partnership_proofs_insert_owner"
on public.partnership_proofs
for insert
to authenticated
with check (
  exists (
    select 1
    from public.campaigns c
    where c.id = partnership_id
      and (c.brand_id = auth.uid() or c.creator_id = auth.uid())
  )
);
