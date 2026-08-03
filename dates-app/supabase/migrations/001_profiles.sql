-- Espelho, em `public`, de cada usuário autenticado (`auth.users`).
--
-- Necessário porque o schema `auth` não é consultável pelo client (nem via
-- RLS de outras tabelas): sem esta tabela, um membro de um espaço não
-- consegue saber o nome/e-mail de outro membro do mesmo espaço. É a base
-- para `created_by_id` em `experiences` e, na próxima fase, para listar
-- membros de um espaço em Convites.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Um registro por usuário autenticado. Populado automaticamente no signup (ver handle_new_user).';

-- Mantém profiles.email em sincronia com auth.users, sem exigir que o
-- client insira nada manualmente no signup.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Compartilhada por toda tabela com `updated_at` (profiles, spaces,
-- experiences) — uma função só, em vez de repetir o mesmo corpo em cada
-- trigger. Definida aqui por ser a primeira migration a precisar dela.
create function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at_column();
