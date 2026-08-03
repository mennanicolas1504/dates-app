-- Índices que as chaves primárias/únicas não cobrem sozinhas — cada um
-- mapeado a um acesso real que a aplicação já faz ou vai fazer na próxima
-- fase (nunca especulativo).

-- "Em quais espaços eu estou?" — a consulta por trás de toda a UI depois do
-- login. A PK de space_members é (space_id, profile_id); sem este índice,
-- uma busca por profile_id sozinho faria table scan.
create index idx_space_members_profile_id on public.space_members (profile_id);

-- spaces.owner_id é RESTRICT: ao excluir um profile, o Postgres precisa
-- achar toda linha de spaces que o referencia para decidir se bloqueia a
-- exclusão. Sem índice, isso é um seq scan de spaces a cada tentativa.
create index idx_spaces_owner_id on public.spaces (owner_id);

-- Lista de Ideias de um espaço, com e sem filtro de status — cobre as duas
-- consultas porque um índice em (space_id, status) também serve buscas só
-- por space_id (prefixo esquerdo do btree). Um índice só em (space_id) à
-- parte seria redundante com este.
create index idx_experiences_space_status on public.experiences (space_id, status);

-- Mesmo motivo do índice em spaces.owner_id: created_by_id é SET NULL, e
-- achar as linhas a anular ao excluir um profile também precisa de índice
-- para não ser um seq scan de experiences.
create index idx_experiences_created_by_id on public.experiences (created_by_id);

-- Página Calendário / "próximo agendamento" do Dashboard: só interessa
-- quando há data marcada, por isso parcial.
create index idx_experiences_scheduled_date
  on public.experiences (space_id, scheduled_date)
  where scheduled_date is not null;

-- Galeria de uma experience, na ordem certa.
create index idx_experience_images_experience_id
  on public.experience_images (experience_id, position);
