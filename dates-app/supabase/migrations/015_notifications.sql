-- Central de Notificações (Fase 20) — histórico das interações importantes
-- do parceiro dentro do espaço.
--
-- Decisão de arquitetura: tabela nova, não reaproveitamento de nenhuma
-- estrutura existente. Não há hoje nenhum "log de eventos" no schema — a
-- opção mais próxima seria inferir notificações lendo `experiences`/`media`/
-- `space_members`/`space_invites` diretamente (sem tabela própria), mas isso
-- não modela o que uma notificação precisa que essas tabelas não guardam:
-- quem é o destinatário, se já foi lida, e o texto congelado no momento do
-- evento (ver comentário de `title`/`body` abaixo). `notifications` é,
-- portanto, um domínio genuinamente novo, não um espelho de outro.
--
-- As próprias linhas nunca são inseridas pelo client (sem policy de
-- insert) — são geradas por triggers `security definer` em cada tabela de
-- origem, sempre que uma ação relevante acontece. Mesmo padrão já usado em
-- `handle_new_user` (001_profiles.sql) e `transfer_space_ownership`/
-- `redeem_space_invite` (014/013): centralizar a regra no banco garante que
-- a notificação é gerada não importa qual caminho do client disparou a
-- mudança, sem duplicar "criar notificação" espalhado por cada api.ts.
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces (id) on delete cascade,
  -- A quem a notificação pertence (quem vai vê-la e marcá-la como lida) —
  -- sempre "o outro membro do espaço", nunca quem executou a ação.
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  -- Quem executou a ação. Nullable + SET NULL (não RESTRICT): a notificação
  -- é um registro histórico do destinatário, não deve deixar de existir só
  -- porque o autor mais tarde excluiu a conta.
  actor_id uuid references public.profiles (id) on delete set null,

  -- Livre, sem `check` — mesmo padrão de `experiences.category`/`media.kind`
  -- (ver comentário de 011_media.sql): adicionar um novo tipo de notificação
  -- no futuro não exige migration, só um novo `case` no trigger de origem e
  -- uma entrada no mapa de ícones do client.
  type text not null,

  -- Texto pronto para exibir, gravado no momento do evento — não
  -- recalculado a partir de joins ao ler. Uma "ideia" pode ser renomeada ou
  -- excluída depois; o histórico deve continuar dizendo o que aconteceu
  -- naquele momento, não o estado atual (que pode nem existir mais).
  title text not null,
  body text,

  -- Referência opcional a "sobre o que" a notificação é, para a UI resolver
  -- miniatura (ver `resource_kind`) e navegar até o recurso. Não é uma FK de
  -- verdade pelo mesmo motivo de `media.resource_id` (011_media.sql):
  -- aponta para tabelas diferentes dependendo de `resource_kind`.
  resource_kind text,
  resource_id uuid,

  read_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.notifications is
  'Histórico de interações do parceiro dentro do espaço. Linhas só são criadas por triggers security definer (ver funções notify_* abaixo) — nunca diretamente pelo client.';

-- Lista "minhas notificações, mais recentes primeiro" — a única consulta de
-- listagem que a tela de Notificações faz.
create index idx_notifications_recipient_created
  on public.notifications (recipient_id, created_at desc);

-- Badge do sino ("quantas não lidas") — parcial, porque só interessa contar
-- linhas com read_at nulo (mesmo raciocínio de idx_experiences_scheduled_date
-- em 006_indexes.sql).
create index idx_notifications_recipient_unread
  on public.notifications (recipient_id)
  where read_at is null;

-- Mesmo motivo de idx_spaces_owner_id/idx_experiences_created_by_id
-- (006_indexes.sql): space_id é CASCADE e actor_id é SET NULL — sem índice,
-- excluir um space ou um profile vira seq scan de notifications.
create index idx_notifications_space_id on public.notifications (space_id);
create index idx_notifications_actor_id on public.notifications (actor_id);

alter table public.notifications enable row level security;

-- Cada um só vê/mexe nas próprias notificações — nunca as do parceiro, ainda
-- que do mesmo espaço (estado de leitura é individual).
create policy "notifications_select_recipient"
  on public.notifications for select
  to authenticated
  using (recipient_id = auth.uid());

-- Só "marcar como lida"/"marcar todas como lidas" (ver features/notifications/api.ts,
-- único ponto de update). Nada na RLS restringe a coluna a `read_at`
-- especificamente — mesmo padrão relaxado de `media_update_space_or_own`
-- (011_media.sql): a policy garante posse da linha, a API é quem só expõe
-- a operação pretendida.
create policy "notifications_update_recipient"
  on public.notifications for update
  to authenticated
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

-- Sem policy de insert: só as funções `security definer` abaixo escrevem
-- nesta tabela (mesmo padrão de `space_members`, que também não tem policy
-- de update para o client — ver 007_rls.sql).

grant select, insert, update on public.notifications to anon, authenticated, service_role;

-- Helpers ------------------------------------------------------------------

-- Nome de exibição de um perfil — espelha `profileDisplayName` do client
-- (src/lib/profile-display-name.ts): display_name se existir, senão o
-- usuário do e-mail. Reaproveitado por toda função notify_* abaixo para não
-- repetir o mesmo `coalesce`/`split_part` em cada uma.
create function public.notification_actor_name(p_actor_id uuid)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select coalesce(display_name, split_part(email, '@', 1)) from public.profiles where id = p_actor_id),
    'Alguém'
  );
$$;

-- Insere uma notificação para "todo membro do espaço, exceto quem agiu" —
-- num espaço de duas pessoas (ver redeem_space_invite, 013_space_invites.sql:
-- máximo 2 membros), isso resolve sempre para exatamente o parceiro, ou para
-- nenhum destinatário quando o usuário ainda está sozinho no espaço (ex:
-- criou o espaço, ainda sem convite aceito). Um único helper cobre os 12
-- tipos de notificação desta fase — inclusive a troca de dono (o "outro
-- membro" continua sendo, corretamente, o novo dono) e a saída do espaço
-- (chamado depois que a linha já foi removida de space_members, então a
-- exclusão de `p_actor_id` abaixo é redundante mas inofensiva).
create function public.notify_space_mates(
  p_space_id uuid,
  p_actor_id uuid,
  p_type text,
  p_title text,
  p_body text,
  p_resource_kind text,
  p_resource_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications
    (space_id, recipient_id, actor_id, type, title, body, resource_kind, resource_id)
  select p_space_id, sm.profile_id, p_actor_id, p_type, p_title, p_body, p_resource_kind, p_resource_id
  from public.space_members sm
  where sm.space_id = p_space_id
    and sm.profile_id is distinct from p_actor_id;
end;
$$;

-- space_members --------------------------------------------------------

create function public.notify_space_member_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.notify_space_mates(
    new.space_id, new.profile_id, 'member_joined',
    public.notification_actor_name(new.profile_id) || ' entrou no espaço',
    'Agora vocês dois fazem parte do mesmo espaço.',
    'profile', new.profile_id
  );
  return new;
end;
$$;

create trigger notify_on_space_member_insert
  after insert on public.space_members
  for each row execute function public.notify_space_member_insert();

create function public.notify_space_member_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.notify_space_mates(
    old.space_id, old.profile_id, 'member_left',
    public.notification_actor_name(old.profile_id) || ' saiu do espaço',
    null,
    'profile', old.profile_id
  );
  return old;
end;
$$;

create trigger notify_on_space_member_delete
  after delete on public.space_members
  for each row execute function public.notify_space_member_delete();

-- experiences (Ideias/Planejadas/Vividas) ---------------------------------

create function public.notify_experience_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.notify_space_mates(
    new.space_id, new.created_by_id, 'idea_created',
    public.notification_actor_name(new.created_by_id) || ' criou uma nova ideia',
    new.title,
    'experience', new.id
  );
  return new;
end;
$$;

create trigger notify_on_experience_insert
  after insert on public.experiences
  for each row execute function public.notify_experience_insert();

-- Diferente do insert, uma edição não tem uma coluna "quem alterou" em
-- `experiences` (ela pertence ao espaço, não a um autor único — ver
-- comentário de 004_experiences.sql) — por isso, só aqui, o ator é
-- `auth.uid()` (a sessão que está executando o UPDATE), não uma coluna da
-- linha. Um único trigger AFTER UPDATE decide qual dos 4 tipos disparar (ou
-- nenhum) comparando OLD/NEW — cobre exatamente os 4 eventos do roadmap
-- (editou/planejou/mudou data/marcou como vivido) sem duplicar trigger por
-- coluna.
create function public.notify_experience_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
begin
  if new.status = 'completed' and old.status is distinct from 'completed' then
    perform public.notify_space_mates(
      new.space_id, v_actor, 'idea_completed',
      public.notification_actor_name(v_actor) || ' marcou um encontro como vivido',
      new.title, 'experience', new.id
    );

  elsif new.status = 'scheduled' and old.status is distinct from 'scheduled' then
    perform public.notify_space_mates(
      new.space_id, v_actor, 'idea_planned',
      public.notification_actor_name(v_actor) || ' planejou um encontro',
      new.title, 'experience', new.id
    );

  elsif new.status = 'scheduled' and old.status = 'scheduled'
        and new.scheduled_date is distinct from old.scheduled_date then
    perform public.notify_space_mates(
      new.space_id, v_actor, 'idea_date_changed',
      public.notification_actor_name(v_actor) || ' alterou a data de um encontro',
      new.title, 'experience', new.id
    );

  elsif new.status = 'idea' and old.status = 'idea' and (
    new.title is distinct from old.title or
    new.category is distinct from old.category or
    new.description is distinct from old.description or
    new.location is distinct from old.location or
    new.instagram is distinct from old.instagram or
    new.website is distinct from old.website or
    new.link is distinct from old.link or
    new.city is distinct from old.city or
    new.notes is distinct from old.notes
  ) then
    perform public.notify_space_mates(
      new.space_id, v_actor, 'idea_updated',
      public.notification_actor_name(v_actor) || ' editou uma ideia',
      new.title, 'experience', new.id
    );
  end if;

  -- Toda outra alteração (favoritar, cancelar planejamento, editar
  -- avaliação/custo de uma memória já concluída) não tem um tipo de
  -- notificação previsto neste roadmap — silenciosa de propósito, para não
  -- gerar ruído fora do que foi pedido (CLAUDE.md, "Filosofia": nada de
  -- ruído visual ou funcional).
  return new;
end;
$$;

create trigger notify_on_experience_update
  after update on public.experiences
  for each row execute function public.notify_experience_update();

-- media (fotos de memória, foto do casal, capa do espaço) -----------------

create function public.notify_media_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_name text;
  v_existing_id uuid;
begin
  if new.kind = 'experience' then
    -- Coalesce com uma notificação não lida existente para a mesma
    -- memória: `uploadMediaBatch` (src/lib/media/api.ts) sobe um arquivo
    -- por vez, sequencialmente — várias fotos num único envio disparam
    -- várias linhas de INSERT, uma por foto. Sem isto, adicionar 5 fotos
    -- geraria 5 notificações idênticas ("adicionou novas fotos"), o
    -- oposto de "moderno e elegante". Se já existe uma não lida para a
    -- mesma memória, só atualiza (sobe pro topo, aponta pra foto mais
    -- recente); só insere uma linha nova se não houver nenhuma pendente
    -- (ex: já foi lida, ou é a primeira foto).
    select n.id into v_existing_id
    from public.notifications n
    where n.type = 'memory_photos_added'
      and n.resource_id = new.resource_id
      and n.read_at is null
      and n.recipient_id in (
        select sm.profile_id from public.space_members sm
        where sm.space_id = new.space_id and sm.profile_id is distinct from new.created_by_id
      )
    order by n.created_at desc
    limit 1;

    if v_existing_id is not null then
      update public.notifications
      set created_at = now(), actor_id = new.created_by_id, resource_id = new.id
      where id = v_existing_id;
    else
      perform public.notify_space_mates(
        new.space_id, new.created_by_id, 'memory_photos_added',
        public.notification_actor_name(new.created_by_id) || ' adicionou novas fotos em uma memória',
        null, 'media', new.id
      );
    end if;

  elsif new.kind = 'couple_photo' then
    v_actor_name := public.notification_actor_name(new.created_by_id);
    perform public.notify_space_mates(
      new.space_id, new.created_by_id, 'couple_photo_changed',
      v_actor_name || ' alterou a foto do casal', null, 'media', new.id
    );

  elsif new.kind = 'space_cover' then
    v_actor_name := public.notification_actor_name(new.created_by_id);
    perform public.notify_space_mates(
      new.space_id, new.created_by_id, 'space_cover_changed',
      v_actor_name || ' alterou a capa do espaço', null, 'media', new.id
    );
  end if;

  return new;
end;
$$;

create trigger notify_on_media_insert
  after insert on public.media
  for each row execute function public.notify_media_insert();

-- space_invites ------------------------------------------------------------

create function public.notify_space_invite_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.notify_space_mates(
    new.space_id, new.created_by_id, 'invite_created',
    public.notification_actor_name(new.created_by_id) || ' gerou um novo convite',
    null, null, null
  );
  return new;
end;
$$;

create trigger notify_on_space_invite_insert
  after insert on public.space_invites
  for each row execute function public.notify_space_invite_insert();

-- spaces (transferência de propriedade) ------------------------------------

create function public.notify_space_owner_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.notify_space_mates(
    new.id, old.owner_id, 'ownership_transferred',
    public.notification_actor_name(old.owner_id) || ' transferiu a propriedade do espaço para você',
    null, 'profile', old.owner_id
  );
  return new;
end;
$$;

-- `when` evita reavaliar em qualquer outro update de spaces (ex:
-- updateSpaceName, que também passa por aqui) — só dispara quando owner_id
-- de fato muda, exatamente como `transfer_space_ownership` (014_space_management.sql).
create trigger notify_on_space_owner_change
  after update on public.spaces
  for each row
  when (old.owner_id is distinct from new.owner_id)
  execute function public.notify_space_owner_change();
