-- Correção de `notify_media_insert` (015_notifications.sql), encontrada
-- ainda durante a Fase 20, antes do client consumir a tabela.
--
-- O trigger original gravava `resource_kind = 'media'` / `resource_id =
-- new.id` (a própria linha de mídia recém-criada) para memory_photos_added/
-- couple_photo_changed/space_cover_changed. Dois problemas:
--
-- 1. Navegação: ao abrir a notificação, a UI precisa do id do *recurso
--    dono* (a memória, para abrir no Álbum; o espaço, para abrir a
--    Personalização), não da linha de mídia em si — que troca a cada
--    upload e não serve como alvo de deep-link.
--
-- 2. Bug real no coalescing de `memory_photos_added`: a consulta que
--    procura uma notificação não lida pendente casa por
--    `n.resource_id = new.resource_id` (o id da memória — correto), mas o
--    branch de "já existe, só atualiza" reescrevia `resource_id` para
--    `new.id` (o id da mídia). Na segunda foto de um lote, a notificação já
--    ficava com `resource_id` de mídia; na terceira foto, a mesma consulta
--    não encontrava mais nada pra atualizar (porque `resource_id` não era
--    mais o id da memória) e voltava a inserir uma notificação nova — o
--    agrupamento silenciosamente parava de funcionar a partir da segunda
--    foto do mesmo lote.
--
-- Correção: `resource_id` passa a ser sempre o id do recurso dono
-- (`new.resource_id`, o mesmo valor já usado por `media.resource_id` — ver
-- 011_media.sql), nunca o id da própria linha de mídia. `resource_kind`
-- passa a ser `'experience'` (mesmo valor já usado pelas notificações de
-- Ideias — reaproveita a mesma resolução de miniatura/navegação, sem criar
-- um terceiro caminho só para fotos de memória) e `'space'` (novo, só para
-- foto do casal/capa — miniatura resolvida com `listMedia(kind, spaceId)`,
-- mesma chamada que `PersonalizationSlot` já faz).
create or replace function public.notify_media_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing_id uuid;
begin
  if new.kind = 'experience' then
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
      set created_at = now(), actor_id = new.created_by_id
      where id = v_existing_id;
    else
      perform public.notify_space_mates(
        new.space_id, new.created_by_id, 'memory_photos_added',
        public.notification_actor_name(new.created_by_id) || ' adicionou novas fotos em uma memória',
        null, 'experience', new.resource_id
      );
    end if;

  elsif new.kind = 'couple_photo' then
    perform public.notify_space_mates(
      new.space_id, new.created_by_id, 'couple_photo_changed',
      public.notification_actor_name(new.created_by_id) || ' alterou a foto do casal',
      null, 'space', new.space_id
    );

  elsif new.kind = 'space_cover' then
    perform public.notify_space_mates(
      new.space_id, new.created_by_id, 'space_cover_changed',
      public.notification_actor_name(new.created_by_id) || ' alterou a capa do espaço',
      null, 'space', new.space_id
    );
  end if;

  return new;
end;
$$;
