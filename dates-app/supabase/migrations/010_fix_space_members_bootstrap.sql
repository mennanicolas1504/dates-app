-- Corrige a dependência circular em `space_members_insert_owner_bootstrap`
-- (007_rls.sql): o `with check` original lia `public.spaces` diretamente
-- (`exists (select 1 from public.spaces where id = space_id and owner_id =
-- auth.uid())`), e essa leitura fica sujeita à RLS de `spaces`
-- (`spaces_select_member`, que exige `is_space_member`). No momento do
-- bootstrap a membership ainda não existe — é a própria linha sendo
-- inserida —, então `is_space_member` é falso, a subquery não enxerga a
-- linha de `spaces`, e o insert de `space_members` é rejeitado mesmo
-- quando quem está inserindo é de fato o dono do espaço.
--
-- Mesmo padrão já usado por `is_space_member` (ver 007_rls.sql): encapsular
-- a checagem numa função `security definer`, que roda com os privilégios do
-- dono da função (bypassa RLS internamente) e só responde verdadeiro/falso
-- sobre uma pergunta específica — nunca expõe linhas. A regra de negócio
-- não muda: continua sendo exatamente "space_id aponta para um space cujo
-- owner_id é o usuário atual" — a mesma condição de antes, só avaliada sem
-- passar pela RLS de `spaces`.

create function public.is_space_owner(target_space_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.spaces
    where id = target_space_id
      and owner_id = auth.uid()
  );
$$;

alter policy "space_members_insert_owner_bootstrap"
  on public.space_members
  with check (
    profile_id = auth.uid()
    and public.is_space_owner(space_id)
  );
