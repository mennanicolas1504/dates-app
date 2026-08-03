-- Grants explícitos de tabela para as roles padrão do Supabase. As
-- migrations 001-008 rodaram como o role `postgres` (conexão direta do
-- `supabase db push`/CLI). Neste projeto, o default privilege de tabelas
-- criadas pelo `postgres` só concede TRUNCATE/REFERENCES/TRIGGER/MAINTAIN a
-- anon/authenticated/service_role — não SELECT/INSERT/UPDATE/DELETE. Isso é
-- diferente do default de tabelas criadas pelo `supabase_admin` (ex: via
-- Table Editor do Dashboard), que já vem com o conjunto completo. Resultado:
-- toda tabela do projeto ficou sem os verbos de CRUD para essas roles,
-- causando "permission denied for table X" antes mesmo de qualquer policy
-- de RLS ser avaliada.
--
-- RLS continua sendo a única camada que decide QUAIS linhas cada usuário
-- pode ver/mexer (ver 007_rls.sql) — os GRANTs abaixo só habilitam a role a
-- tentar a operação; sem uma policy que aprove, a operação continua negada
-- linha a linha exatamente como antes.

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on public.profiles to anon, authenticated, service_role;
grant select, insert, update, delete on public.spaces to anon, authenticated, service_role;
grant select, insert, update, delete on public.space_members to anon, authenticated, service_role;
grant select, insert, update, delete on public.experiences to anon, authenticated, service_role;
grant select, insert, update, delete on public.experience_images to anon, authenticated, service_role;

-- Sem isso, toda tabela nova criada por uma migration futura (que também
-- roda como `postgres`) repetiria o mesmo problema. Este é o padrão que o
-- Supabase recomenda para projetos gerenciados via CLI/migrations: fixar o
-- default privilege do role usado pelas migrations, não só corrigir as
-- tabelas já existentes.
alter default privileges for role postgres in schema public
  grant select, insert, update, delete on tables to anon, authenticated, service_role;
