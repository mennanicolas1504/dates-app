-- Quem pertence a qual Espaço. Hoje só existe o dono (0 ou 1 linha por
-- espaço, criada junto com `spaces` — ver 007_rls.sql); a fase de Convites
-- passa a inserir uma segunda linha aqui quando alguém aceita um convite.
-- `role` já existe para não exigir migração de schema quando isso acontecer,
-- mas nenhuma regra de permissão diferencia owner/member ainda (ver
-- CLAUDE.md — o app não modela hierarquia dentro do casal).
create table public.space_members (
  space_id uuid not null references public.spaces (id) on delete cascade,
  -- Aponta para `profiles`, não para uma tabela `users` (essa só existe no
  -- schema `auth`, fora do alcance do client) — por isso `profile_id`, não
  -- `user_id`, mantendo o mesmo padrão de nomear a FK pela tabela public
  -- referenciada (ver `space_id`, `experience_id` no resto do schema).
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (space_id, profile_id)
);

comment on table public.space_members is
  'Associação usuário <-> espaço. Chave composta: um usuário tem no máximo uma linha por espaço.';
