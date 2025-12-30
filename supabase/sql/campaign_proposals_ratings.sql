-- Campaign proposals and ratings (MVP)

create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  message text,
  price numeric(12,2) not null,
  status text not null default 'sent',
  created_at timestamptz default now()
);

create unique index if not exists proposals_unique_creator_per_campaign
  on public.proposals (campaign_id, creator_id);

alter table public.proposals enable row level security;

drop policy if exists "proposals_select_participants" on public.proposals;
create policy "proposals_select_participants"
on public.proposals
for select
using (
  creator_id = auth.uid()
  or exists (
    select 1
    from public.campaigns c
    where c.id = campaign_id
      and (c.brand_id = auth.uid() or c.creator_id = auth.uid())
  )
);

drop policy if exists "proposals_insert_creator" on public.proposals;
create policy "proposals_insert_creator"
on public.proposals
for insert
to authenticated
with check (
  creator_id = auth.uid()
  and exists (
    select 1
    from public.campaigns c
    where c.id = campaign_id
      and c.status = 'open'
  )
);

drop policy if exists "proposals_update_brand_or_creator" on public.proposals;
create policy "proposals_update_brand_or_creator"
on public.proposals
for update
to authenticated
using (
  creator_id = auth.uid()
  or exists (
    select 1
    from public.campaigns c
    where c.id = campaign_id
      and c.brand_id = auth.uid()
  )
)
with check (
  creator_id = auth.uid()
  or exists (
    select 1
    from public.campaigns c
    where c.id = campaign_id
      and c.brand_id = auth.uid()
  )
);

create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  from_user_id uuid not null references public.profiles(id) on delete cascade,
  to_user_id uuid not null references public.profiles(id) on delete cascade,
  stars int not null check (stars >= 1 and stars <= 5),
  comment text,
  created_at timestamptz default now()
);

create unique index if not exists ratings_unique_per_campaign_from_user
  on public.ratings (campaign_id, from_user_id);

alter table public.ratings enable row level security;

drop policy if exists "ratings_select_participants" on public.ratings;
create policy "ratings_select_participants"
on public.ratings
for select
using (
  from_user_id = auth.uid()
  or to_user_id = auth.uid()
  or exists (
    select 1
    from public.campaigns c
    where c.id = campaign_id
      and (c.brand_id = auth.uid() or c.creator_id = auth.uid())
  )
);

drop policy if exists "ratings_insert_participants" on public.ratings;
create policy "ratings_insert_participants"
on public.ratings
for insert
to authenticated
with check (
  from_user_id = auth.uid()
  and exists (
    select 1
    from public.campaigns c
    where c.id = campaign_id
      and (c.brand_id = auth.uid() or c.creator_id = auth.uid())
      and c.status = 'closed'
  )
);
