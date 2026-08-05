-- Fase 12 (Compartilhamento do Espaço) — convite por link, sem código
-- manual, sem PIN, sem QR Code. Domínio novo (não é mais um estágio de
-- `spaces`/`space_members`), por isso é a primeira tabela nova desde a
-- fundação do backend.
create table public.space_invites (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces (id) on delete cascade,
  -- uuid, não string customizada: mesma convenção de toda PK deste projeto
  -- (gen_random_uuid()), 122 bits de entropia — suficiente para nunca ser
  -- adivinhado, e encaixa direto num segmento de URL (/convite/:token).
  token uuid not null default gen_random_uuid() unique,
  created_by_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  used_at timestamptz,
  used_by_id uuid references public.profiles (id) on delete set null
);

comment on table public.space_invites is
  'Convites de uso único para entrar num espaço via link — nunca por código digitado. Ver public.redeem_space_invite().';

create index idx_space_invites_space_id on public.space_invites (space_id);

alter table public.space_invites enable row level security;

-- Só membros do espaço podem ver/criar convites dele — mesma regra de
-- posse de qualquer outro dado do espaço (ver is_space_member, 007_rls.sql).
-- Quem redime um convite (ainda não é membro) nunca lê esta tabela
-- diretamente: passa pela function abaixo, que roda como definer.
create policy "space_invites_select_member"
  on public.space_invites for select
  to authenticated
  using (public.is_space_member(space_id));

create policy "space_invites_insert_member"
  on public.space_invites for insert
  to authenticated
  with check (
    public.is_space_member(space_id)
    and created_by_id = auth.uid()
  );

-- Sem policy de update/delete: o único jeito de marcar um convite como
-- usado é via redeem_space_invite() (security definer, abaixo) — nenhuma
-- escrita direta do client é necessária nem permitida nesta fase (revogar/
-- regenerar convite fica para quando a área de Perfil existir).

grant select, insert on public.space_invites to anon, authenticated, service_role;

-- redeem_space_invite -----------------------------------------------------
--
-- RLS sozinha não resolve "entrar num espaço que não é meu": a policy de
-- insert em space_members precisaria confirmar que quem está inserindo
-- apresentou o token secreto correto, e uma cláusula `with check` não tem
-- como carregar "qual token este request específico apresentou" — só
-- consegue perguntar coisas sobre o próprio banco. Uma policy que apenas
-- checasse "existe algum convite válido pra esse espaço" (sem validar o
-- token em si) deixaria qualquer usuário autenticado entrar em qualquer
-- espaço com convite pendente, sem nunca ter visto o link — falha de
-- segurança. Por isso o fluxo inteiro (validar token → checar
-- usado/expirado/espaço cheio → inserir membership → marcar convite como
-- usado) vira uma única function security definer, atômica, que só aceita
-- o token como parâmetro. Mesmo padrão de is_space_member/is_space_owner,
-- aplicado a um problema nunca resolvido neste schema.
create function public.redeem_space_invite(p_token uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite public.space_invites%rowtype;
  v_member_count integer;
begin
  select * into v_invite
  from public.space_invites
  where token = p_token
  for update;

  if not found then
    raise exception 'Convite inválido.' using errcode = 'P0001';
  end if;

  if v_invite.used_at is not null then
    raise exception 'Este convite já foi utilizado.' using errcode = 'P0002';
  end if;

  if v_invite.expires_at < now() then
    raise exception 'Este convite expirou.' using errcode = 'P0003';
  end if;

  if exists (
    select 1 from public.space_members
    where space_members.space_id = v_invite.space_id
      and profile_id = auth.uid()
  ) then
    raise exception 'Você já faz parte deste espaço.' using errcode = 'P0004';
  end if;

  -- Espaço é de duas pessoas (CLAUDE.md, "Filosofia") — nenhuma trava
  -- disso existia até agora porque nunca houve como um terceiro entrar.
  select count(*) into v_member_count
  from public.space_members
  where space_members.space_id = v_invite.space_id;

  if v_member_count >= 2 then
    raise exception 'Este espaço já está completo.' using errcode = 'P0005';
  end if;

  insert into public.space_members (space_id, profile_id, role)
  values (v_invite.space_id, auth.uid(), 'member');

  update public.space_invites
  set used_at = now(), used_by_id = auth.uid()
  where id = v_invite.id;

  return v_invite.space_id;
end;
$$;

grant execute on function public.redeem_space_invite(uuid) to authenticated;
