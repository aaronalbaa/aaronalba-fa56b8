-- Arcana · esquema para Supabase (pégalo en SQL Editor y pulsa Run)
-- Los datos de sincronización van CIFRADOS desde tu dispositivo (AES-GCM): el servidor solo ve texto ilegible.

create table if not exists public.blobs (
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  key        text not null check (char_length(key) <= 64),
  data       text not null check (char_length(data) <= 4000000),
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

create table if not exists public.profiles (
  user_id    uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  handle     text unique not null check (handle ~ '^[a-z0-9_]{3,20}$'),
  display    text not null default '' check (char_length(display) <= 40),
  card       jsonb not null default '{}'::jsonb,   -- ficha pública: nivel y libros leídos (tú decides qué se comparte)
  updated_at timestamptz not null default now()
);

create table if not exists public.friendships (
  id         bigint generated always as identity primary key,
  requester  uuid not null default auth.uid() references auth.users(id) on delete cascade,
  addressee  uuid not null references auth.users(id) on delete cascade,
  status     text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  check (requester <> addressee),
  unique (requester, addressee)
);

create table if not exists public.gifts (
  id         bigint generated always as identity primary key,
  from_user  uuid not null default auth.uid() references auth.users(id) on delete cascade,
  to_user    uuid not null references auth.users(id) on delete cascade,
  title      text not null check (char_length(title) <= 160),
  author     text not null default '' check (char_length(author) <= 120),
  message    text not null default '' check (char_length(message) <= 500),
  seen       boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.blobs       enable row level security;
alter table public.profiles    enable row level security;
alter table public.friendships enable row level security;
alter table public.gifts       enable row level security;

create or replace function public.are_friends(a uuid, b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.friendships f
    where f.status = 'accepted' and ((f.requester = a and f.addressee = b) or (f.requester = b and f.addressee = a)));
$$;

-- blobs: solo su dueño
drop policy if exists blobs_own on public.blobs;
create policy blobs_own on public.blobs for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- perfiles: el tuyo y el de tus amigos (para buscar por @usuario se usa find_profile)
drop policy if exists prof_read on public.profiles;
create policy prof_read on public.profiles for select to authenticated
  using (user_id = auth.uid() or public.are_friends(user_id, auth.uid()));
drop policy if exists prof_ins on public.profiles;
create policy prof_ins on public.profiles for insert to authenticated with check (user_id = auth.uid());
drop policy if exists prof_upd on public.profiles;
create policy prof_upd on public.profiles for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists prof_del on public.profiles;
create policy prof_del on public.profiles for delete to authenticated using (user_id = auth.uid());

-- amistades
drop policy if exists fr_read on public.friendships;
create policy fr_read on public.friendships for select to authenticated using (requester = auth.uid() or addressee = auth.uid());
drop policy if exists fr_ins on public.friendships;
create policy fr_ins on public.friendships for insert to authenticated with check (requester = auth.uid() and status = 'pending');
drop policy if exists fr_upd on public.friendships;
create policy fr_upd on public.friendships for update to authenticated using (addressee = auth.uid()) with check (addressee = auth.uid() and status = 'accepted');
drop policy if exists fr_del on public.friendships;
create policy fr_del on public.friendships for delete to authenticated using (requester = auth.uid() or addressee = auth.uid());

-- regalos: solo entre amigos
drop policy if exists gift_read on public.gifts;
create policy gift_read on public.gifts for select to authenticated using (from_user = auth.uid() or to_user = auth.uid());
drop policy if exists gift_ins on public.gifts;
create policy gift_ins on public.gifts for insert to authenticated with check (from_user = auth.uid() and public.are_friends(from_user, to_user));
drop policy if exists gift_upd on public.gifts;
create policy gift_upd on public.gifts for update to authenticated using (to_user = auth.uid()) with check (to_user = auth.uid());
drop policy if exists gift_del on public.gifts;
create policy gift_del on public.gifts for delete to authenticated using (from_user = auth.uid() or to_user = auth.uid());

-- buscar a alguien por su @usuario exacto (devuelve solo id, usuario y nombre, nunca la ficha)
create or replace function public.find_profile(h text) returns table (user_id uuid, handle text, display text)
language sql stable security definer set search_path = public as $$
  select p.user_id, p.handle, p.display from public.profiles p where p.handle = lower(h) limit 1;
$$;

-- nombres de quienes me han escrito o me han pedido amistad (para mostrar su @usuario)
create or replace function public.names_for(ids uuid[]) returns table (user_id uuid, handle text, display text)
language sql stable security definer set search_path = public as $$
  select p.user_id, p.handle, p.display from public.profiles p
  where p.user_id = any(ids) and (
    p.user_id = auth.uid() or public.are_friends(p.user_id, auth.uid()) or exists (
      select 1 from public.friendships f where f.status = 'pending' and ((f.addressee = auth.uid() and f.requester = p.user_id) or (f.requester = auth.uid() and f.addressee = p.user_id)))
    or exists (select 1 from public.gifts g where g.to_user = auth.uid() and g.from_user = p.user_id));
$$;

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.blobs, public.profiles, public.friendships, public.gifts to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant execute on function public.find_profile(text), public.names_for(uuid[]), public.are_friends(uuid, uuid) to authenticated;
