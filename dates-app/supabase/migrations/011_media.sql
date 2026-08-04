-- Sistema de Mídia — fundação (Fase 9.2). Uma única tabela polimórfica,
-- não uma tabela por funcionalidade: `kind` diz a que domínio a mídia
-- pertence (idea, experience, album, space_cover, couple_photo,
-- app_background, user_avatar), `resource_id` é o id do recurso dono
-- dentro daquele domínio (id da idea/experience, ou o próprio space_id
-- para capa/plano de fundo/foto do casal, ou o user_id para avatar) — a
-- mídia pertence a um recurso do sistema, não necessariamente a um
-- usuário. Não é uma FK de verdade porque aponta para tabelas diferentes
-- dependendo de `kind` — validado na API (`src/lib/media/`), não no banco.
--
-- `kind` e `media_type` são `text` livre, sem `check` — mesmo padrão já
-- usado em `experiences.category` (ver 004_experiences.sql). Adicionar um
-- novo `kind` (ex: "planner_cover") ou um novo `media_type` (ex: "video")
-- no futuro não exige migration nenhuma, só um registro novo em
-- `src/lib/media/constraints.ts`.
--
-- Nenhuma funcionalidade usa esta tabela ainda nesta fase — é só a
-- infraestrutura (ver CLAUDE.md, Fase 9.2: "não integrar upload em nenhuma
-- funcionalidade").
create table public.media (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  -- null só para mídia dona de um usuário (hoje: user_avatar) — tudo o
  -- mais pertence a um espaço. A RLS abaixo é o que realmente decide quem
  -- pode ver/mexer; isto aqui é só o dado.
  space_id uuid references public.spaces(id) on delete cascade,
  resource_id uuid not null,
  media_type text not null default 'image',
  storage_bucket text not null,
  storage_path text not null,
  mime_type text not null,
  size_bytes integer not null,
  width integer,
  height integer,
  position smallint not null default 0,
  created_by_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.media is
  'Sistema de Mídia único da plataforma — toda mídia de toda funcionalidade passa por aqui. Ver src/lib/media/.';

create trigger set_updated_at
  before update on public.media
  for each row execute function public.update_updated_at_column();

-- Padrão de acesso: "dá pra listar/reordenar sem re-subir o arquivo" —
-- é a consulta que toda tela de mídia vai fazer (mídia de um recurso, em
-- ordem). `space_id` cobre o cascade de exclusão de espaço.
create index idx_media_kind_resource on public.media (kind, resource_id, position);
create index idx_media_space_id on public.media (space_id);

alter table public.media enable row level security;

-- Duas regras de posse, uma tabela: se `space_id` existe, vale a mesma
-- regra de qualquer outra tabela do espaço (`is_space_member`, ver
-- 007_rls.sql); se não existe, a mídia é do próprio usuário (hoje: avatar).
create policy "media_select_space_or_own"
  on public.media for select
  to authenticated
  using (
    (space_id is not null and public.is_space_member(space_id))
    or (space_id is null and resource_id = auth.uid())
  );

create policy "media_insert_space_or_own"
  on public.media for insert
  to authenticated
  with check (
    created_by_id = auth.uid()
    and (
      (space_id is not null and public.is_space_member(space_id))
      or (space_id is null and resource_id = auth.uid())
    )
  );

-- Update existe só para reordenar (`position`) — trocar a imagem em si é
-- sempre excluir + subir de novo (mesmo padrão de experience_images, ver
-- 007_rls.sql). Nada na RLS impede outros campos de serem atualizados; é a
-- API (`reorderMedia`, único ponto de update) que só expõe `position`.
create policy "media_update_space_or_own"
  on public.media for update
  to authenticated
  using (
    (space_id is not null and public.is_space_member(space_id))
    or (space_id is null and resource_id = auth.uid())
  )
  with check (
    (space_id is not null and public.is_space_member(space_id))
    or (space_id is null and resource_id = auth.uid())
  );

create policy "media_delete_space_or_own"
  on public.media for delete
  to authenticated
  using (
    (space_id is not null and public.is_space_member(space_id))
    or (space_id is null and resource_id = auth.uid())
  );

-- GRANTs explícitos, redundantes de propósito: a `alter default privileges`
-- de 009_grants.sql já deveria cobrir toda tabela nova criada pelo role
-- `postgres` a partir daquele ponto, mas depois do incidente de
-- "permission denied for table spaces" (ver 009_grants.sql) o custo de
-- confirmar aqui, explicitamente, é menor do que confiar cegamente de novo.
grant select, insert, update, delete on public.media to anon, authenticated, service_role;

-- Storage ----------------------------------------------------------------
--
-- Dois buckets, não um por funcionalidade — a mesma ideia da tabela única.
--
-- `media`: tudo que pertence a um espaço (ideas, experiences, álbum, capa,
-- plano de fundo, foto do casal). Convenção de caminho:
--   {space_id}/{kind}/{resource_id}/{media_id}.{extensão}
-- O primeiro segmento é sempre o space_id — mesma convenção de
-- `experience-images` (008_storage.sql), então a mesma checagem
-- (`is_space_member` a partir de `storage.foldername`) funciona sem
-- precisar de uma policy por `kind`.
--
-- `avatars`: mídia do próprio usuário (hoje: foto de perfil). Convenção:
--   {user_id}/{media_id}.{extensão}
-- Bucket separado porque a regra de posse é outra (auth.uid(), não
-- membership de espaço) — mais simples que ramificar isso dentro de uma
-- policy só, e mantém `media` só sobre dados do casal (ver CLAUDE.md,
-- "Filosofia": o app pertence ao Espaço).
--
-- Ambos privados: leitura sempre exige signed URL (ver
-- `src/lib/media/api.ts`), nunca URL pública — mesmo motivo de
-- `experience-images` (CLAUDE.md, Seção 1: "plataforma privada").
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('media', 'media', false, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/heic']),
  ('avatars', 'avatars', false, 4194304, array['image/jpeg', 'image/png', 'image/webp', 'image/heic']);

create policy "media_storage_select_member"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'media'
    and public.is_space_member((storage.foldername(name))[1]::uuid)
  );

create policy "media_storage_insert_member"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'media'
    and public.is_space_member((storage.foldername(name))[1]::uuid)
  );

create policy "media_storage_delete_member"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'media'
    and public.is_space_member((storage.foldername(name))[1]::uuid)
  );

create policy "avatars_storage_select_own"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1]::uuid = auth.uid()
  );

create policy "avatars_storage_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1]::uuid = auth.uid()
  );

create policy "avatars_storage_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1]::uuid = auth.uid()
  );
