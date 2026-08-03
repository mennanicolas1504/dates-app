-- A "Ideia" do domínio (ver UX_ARCHITECTURE.md, Seção 2: ciclo de vida
-- Ideia -> Agendada -> Concluída, mais o flag independente `favorite`).
-- Nome da tabela em inglês, como o restante do domínio no código
-- (`features/ideias/types.ts` já define `Idea`, `IdeaStatus`).
create table public.experiences (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces (id) on delete cascade,

  title text not null,
  category text not null,
  status text not null default 'idea' check (status in ('idea', 'scheduled', 'completed')),
  favorite boolean not null default false,

  -- Nullable de propósito: diferente de `spaces.owner_id` (RESTRICT — perder
  -- o dono perderia o espaço inteiro), aqui a experience pertence ao espaço,
  -- não a quem criou (ver comentário da tabela). Se o perfil for excluído, a
  -- experience continua existindo, só perde a atribuição.
  created_by_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  description text,
  location text,
  instagram text,
  website text,
  link text,
  city text,
  notes text,

  -- Presente quando status = 'scheduled' ou 'completed'.
  scheduled_date timestamptz,
  -- Presente quando status = 'completed'. Distinto de scheduled_date porque
  -- o UX_ARCHITECTURE.md (6.4) documenta mostrar as duas datas quando
  -- diferentes (reagendou e só depois concluiu).
  completed_at timestamptz,
  -- 1 a 5, preenchido só ao concluir (ver UX_ARCHITECTURE.md, 5.6). Nullable:
  -- concluir sem avaliação é um caminho explicitamente válido no fluxo.
  rating smallint check (rating between 1 and 5)
);

comment on table public.experiences is
  'Pertence ao Espaço, não ao usuário que criou. created_by_id é só atribuição (quem registrou), não dono — por isso é nullable com ON DELETE SET NULL, não RESTRICT.';

create trigger set_updated_at
  before update on public.experiences
  for each row execute function public.update_updated_at_column();
