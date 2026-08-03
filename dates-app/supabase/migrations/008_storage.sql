-- Bucket para fotos de experiences (galeria do Histórico — ver
-- UX_ARCHITECTURE.md, 5.6 e 6.4). Só a infraestrutura: upload ainda não é
-- chamado por nenhuma tela nesta fase.
--
-- Privado (não público) porque o produto é uma plataforma privada para o
-- casal (CLAUDE.md, Seção 1) — leitura exige sessão + membership do espaço,
-- nunca URL pública sem autenticação. Isso significa que exibir uma imagem
-- vai exigir signed URL (`createSignedUrl`) quando o upload for integrado.
--
-- Convenção de caminho dos objetos: `{space_id}/{experience_id}/{arquivo}`
-- — é exatamente o valor que `experience_images.storage_path` guarda (ver
-- 005_experience_images.sql). As policies abaixo dependem dessa convenção
-- para checar membership a partir do primeiro segmento do path.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'experience-images',
  'experience-images',
  false,
  5242880, -- 5MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
);

create policy "experience_images_storage_select_member"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'experience-images'
    and public.is_space_member((storage.foldername(name))[1]::uuid)
  );

create policy "experience_images_storage_insert_member"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'experience-images'
    and public.is_space_member((storage.foldername(name))[1]::uuid)
  );

create policy "experience_images_storage_delete_member"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'experience-images'
    and public.is_space_member((storage.foldername(name))[1]::uuid)
  );
