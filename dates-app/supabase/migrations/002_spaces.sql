-- O Espaço — entidade central do produto (ver CLAUDE.md, "Filosofia", e
-- features/space/types.ts). Mesma forma que o tipo `Space` já usado pela
-- aplicação (id, name, createdAt, ownerId), agora como tabela real em vez de
-- `user_metadata`.
create table public.spaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.spaces is
  'O app pertence ao Espaço, não ao usuário individual. owner_id é só quem criou — não implica hierarquia de permissões entre membros.';

create trigger set_updated_at
  before update on public.spaces
  for each row execute function public.update_updated_at_column();
