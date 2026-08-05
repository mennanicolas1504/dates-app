-- Fase 14 (Perfil e Gerenciamento do Espaço).

-- Revogar/gerar novo convite (ver features/invites/api.ts,
-- regenerateSpaceInvite) precisa que o client marque o(s) convite(s)
-- ativo(s) anterior(es) como expirado — só isso, nenhuma outra coluna.
-- Mesma regra de posse de select/insert (is_space_member), já antecipada no
-- comentário de 013_space_invites.sql ("revogar/regenerar convite fica para
-- quando a área de Perfil existir").
create policy "space_invites_update_member"
  on public.space_invites for update
  to authenticated
  using (public.is_space_member(space_id))
  with check (public.is_space_member(space_id));

grant update on public.space_invites to anon, authenticated, service_role;

-- transfer_space_ownership -------------------------------------------
--
-- Trocar o dono do espaço mexe em duas tabelas (spaces.owner_id +
-- space_members.role de duas linhas) e precisa validar que só o dono atual
-- inicia a troca e que o alvo já é membro do mesmo espaço — a mesma razão
-- de redeem_space_invite ser uma function e não uma policy: validação
-- cruzada não cabe num `with check` de uma tabela só, e as duas escritas
-- precisam ser atômicas. space_members continua sem policy de update para
-- o client (ver 007_rls.sql, "mudar o próprio role não é uma ação do
-- usuário") — só esta function, security definer, pode mudar role.
create function public.transfer_space_ownership(p_space_id uuid, p_new_owner_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_space_owner(p_space_id) then
    raise exception 'Só o dono do espaço pode transferir a propriedade.' using errcode = 'P0001';
  end if;

  if p_new_owner_id = auth.uid() then
    raise exception 'Você já é o dono deste espaço.' using errcode = 'P0002';
  end if;

  if not exists (
    select 1 from public.space_members
    where space_id = p_space_id and profile_id = p_new_owner_id
  ) then
    raise exception 'O novo dono precisa já ser membro do espaço.' using errcode = 'P0003';
  end if;

  update public.spaces set owner_id = p_new_owner_id where id = p_space_id;

  update public.space_members set role = 'member'
    where space_id = p_space_id and profile_id = auth.uid();
  update public.space_members set role = 'owner'
    where space_id = p_space_id and profile_id = p_new_owner_id;
end;
$$;

grant execute on function public.transfer_space_ownership(uuid, uuid) to authenticated;
