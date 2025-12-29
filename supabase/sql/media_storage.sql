-- 1) Adicionar colunas
alter table public.profiles
  add column if not exists avatar_path text;

alter table public.creator_offers
  add column if not exists cover_path text;

-- 2) Buckets (publicos para leitura simples)
-- Observacao: se ja existirem, o Supabase pode retornar erro; nesse caso, ignore.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('offer-covers', 'offer-covers', true)
on conflict (id) do nothing;

-- 3) Policies para storage.objects (upload restrito ao dono pelo 1º "folder" = userId)
-- AVATARS
drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
on storage.objects
for select
using (bucket_id = 'avatars');

drop policy if exists "avatars_user_write" on storage.objects;
create policy "avatars_user_write"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "avatars_user_update" on storage.objects;
create policy "avatars_user_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "avatars_user_delete" on storage.objects;
create policy "avatars_user_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- OFFER COVERS
drop policy if exists "covers_public_read" on storage.objects;
create policy "covers_public_read"
on storage.objects
for select
using (bucket_id = 'offer-covers');

drop policy if exists "covers_user_write" on storage.objects;
create policy "covers_user_write"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'offer-covers'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "covers_user_update" on storage.objects;
create policy "covers_user_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'offer-covers'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'offer-covers'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "covers_user_delete" on storage.objects;
create policy "covers_user_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'offer-covers'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- 4) (Opcional mas recomendado) permitir leitura publica de perfis SOMENTE de creators com ofertas publicas ativas
-- Atencao: isso libera SELECT de TODAS colunas da tabela profiles.
-- Use apenas se profiles nao tiver dados sensiveis.
alter table public.profiles enable row level security;

drop policy if exists "profiles_public_read_for_public_offers" on public.profiles;
create policy "profiles_public_read_for_public_offers"
on public.profiles
for select
using (
  exists (
    select 1
    from public.creator_offers o
    where o.creator_id = profiles.id
      and o.is_public = true
      and o.is_active = true
  )
);
