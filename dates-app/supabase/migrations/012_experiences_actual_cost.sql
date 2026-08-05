-- Fase 11 (Experiências vividas): único campo que faltava na tabela pra
-- registrar uma experiência concluída — `completed_at` e `rating` já
-- existiam desde 004_experiences.sql, nunca usados até agora. Não há
-- nenhum campo livre reaproveitável para custo sem forçar um dado
-- semanticamente errado nele (diferente de `notes`/`location`, que já
-- eram texto livre reaproveitado entre estágios desde a Fase 10).
--
-- `numeric(10,2)`, não `integer`/`float`: valor monetário, evita erro de
-- ponto flutuante. Nullable — custo é opcional, nem toda experiência tem
-- (ou quer ter) um valor registrado.
alter table public.experiences add column actual_cost numeric(10, 2);

comment on column public.experiences.actual_cost is
  'Custo real da experiência, preenchido só ao concluir — opcional, sem relação com nenhum valor planejado (não existe estimativa de custo no fluxo).';
