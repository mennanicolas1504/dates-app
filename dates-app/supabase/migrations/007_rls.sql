-- Row Level Security — toda regra é "o usuário só vê/mexe no que pertence a
-- um espaço do qual ele é membro" (ver CLAUDE.md, "Filosofia": o app
-- pertence ao Espaço). Nenhuma policy depende de `created_by_id`/`owner_id`
-- para leitura — dentro de um espaço, os dados são do casal, não de quem
-- criou cada linha.

-- Helper reutilizado por toda policy abaixo. `security definer` é
-- necessário especificamente para as policies DA PRÓPRIA space_members: sem
-- isso, a policy de SELECT em space_members chamaria uma função que lê
-- space_members sob RLS, que chama a policy de novo — recursão infinita.
-- Rodar como definer aqui é seguro porque a função só responde
-- verdadeiro/falso sobre a membership do próprio auth.uid(), nunca expõe
-- linhas de outros usuários.
create function public.is_space_member(target_space_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.space_members
    where space_id = target_space_id
      and profile_id = auth.uid()
  );
$$;

alter table public.profiles enable row level security;
alter table public.spaces enable row level security;
alter table public.space_members enable row level security;
alter table public.experiences enable row level security;
alter table public.experience_images enable row level security;

-- profiles ---------------------------------------------------------------

-- Cada um vê o próprio perfil, mais o perfil de quem divide algum espaço
-- consigo (necessário para mostrar nome/e-mail de quem criou uma
-- experience, e para a futura lista de membros em Convites).
create policy "profiles_select_self_or_space_mate"
  on public.profiles for select
  to authenticated
  using (
    id = auth.uid()
    or exists (
      select 1
      from public.space_members mine
      join public.space_members theirs on theirs.space_id = mine.space_id
      where mine.profile_id = auth.uid()
        and theirs.profile_id = profiles.id
    )
  );

-- Inserção normalmente acontece via trigger (handle_new_user, security
-- definer — não passa por RLS). Esta policy só cobre o caso defensivo de
-- algum caminho futuro inserir pelo client autenticado.
create policy "profiles_insert_self"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

create policy "profiles_update_self"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Sem policy de delete: perfil é removido via cascade de auth.users, nunca
-- diretamente pelo usuário.

-- spaces -------------------------------------------------------------------

create policy "spaces_select_member"
  on public.spaces for select
  to authenticated
  using (public.is_space_member(id));

-- Criar um espaço não exige já ser membro (é o próprio ato que vai gerar a
-- primeira linha em space_members, num segundo insert — ver estratégia no
-- relatório da Fase 8). Só exige que o criador se declare dono.
create policy "spaces_insert_as_owner"
  on public.spaces for insert
  to authenticated
  with check (owner_id = auth.uid());

-- Qualquer membro pode editar o nome (não só o owner) — o produto não
-- modela hierarquia entre parceiros dentro do mesmo espaço.
create policy "spaces_update_member"
  on public.spaces for update
  to authenticated
  using (public.is_space_member(id))
  with check (public.is_space_member(id));

-- Excluir um espaço é destrutivo e ainda não tem UI — mantido restrito ao
-- dono como padrão seguro, não como modelo de permissões definitivo.
create policy "spaces_delete_owner"
  on public.spaces for delete
  to authenticated
  using (owner_id = auth.uid());

-- space_members --------------------------------------------------------

create policy "space_members_select_member"
  on public.space_members for select
  to authenticated
  using (public.is_space_member(space_id));

-- Cobre o fluxo atual (dono se auto-adiciona logo após criar o espaço).
-- Convites (próxima fase) vai precisar de um segundo caminho aqui — por
-- exemplo aceitar um convite pendente — que ainda não existe.
create policy "space_members_insert_owner_bootstrap"
  on public.space_members for insert
  to authenticated
  with check (
    profile_id = auth.uid()
    and exists (
      select 1 from public.spaces
      where id = space_id and owner_id = auth.uid()
    )
  );

-- Sem policy de update: mudar o próprio role não é uma ação do usuário
-- nesta fase (ninguém tem UI para isso ainda).

-- Um membro pode sair do espaço por conta própria.
create policy "space_members_delete_self"
  on public.space_members for delete
  to authenticated
  using (profile_id = auth.uid());

-- experiences ------------------------------------------------------------

create policy "experiences_select_member"
  on public.experiences for select
  to authenticated
  using (public.is_space_member(space_id));

create policy "experiences_insert_member"
  on public.experiences for insert
  to authenticated
  with check (public.is_space_member(space_id) and created_by_id = auth.uid());

create policy "experiences_update_member"
  on public.experiences for update
  to authenticated
  using (public.is_space_member(space_id))
  with check (public.is_space_member(space_id));

create policy "experiences_delete_member"
  on public.experiences for delete
  to authenticated
  using (public.is_space_member(space_id));

-- experience_images ------------------------------------------------------

create policy "experience_images_select_member"
  on public.experience_images for select
  to authenticated
  using (
    exists (
      select 1 from public.experiences
      where id = experience_images.experience_id
        and public.is_space_member(space_id)
    )
  );

create policy "experience_images_insert_member"
  on public.experience_images for insert
  to authenticated
  with check (
    exists (
      select 1 from public.experiences
      where id = experience_images.experience_id
        and public.is_space_member(space_id)
    )
  );

create policy "experience_images_delete_member"
  on public.experience_images for delete
  to authenticated
  using (
    exists (
      select 1 from public.experiences
      where id = experience_images.experience_id
        and public.is_space_member(space_id)
    )
  );

-- Sem policy de update: imagem é substituída (delete + insert), nunca
-- editada in-place.
