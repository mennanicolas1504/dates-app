-- Remove `experience_images` (005_experience_images.sql) e o bucket
-- `experience-images` (008_storage.sql) — código morto de banco,
-- encontrado na auditoria da Fase 21 (QA Geral).
--
-- As duas foram a galeria original de fotos de uma experience, de antes do
-- Sistema de Mídia unificado (Fase 9.2, 011_media.sql) existir. Desde que
-- `media` (kind: "idea"/"experience"/...) entrou em uso, nenhuma tela do
-- client jamais voltou a ler/escrever nesta tabela ou neste bucket —
-- confirmado por busca no código-fonte (zero referências fora de
-- `types/database.ts`, que só espelha o schema) e por contagem no banco
-- (`experience_images`: 0 linhas; bucket `experience-images`: 0 objetos) —
-- não há dado real sendo descartado.
drop policy if exists "experience_images_select_member" on public.experience_images;
drop policy if exists "experience_images_insert_member" on public.experience_images;
drop policy if exists "experience_images_delete_member" on public.experience_images;

drop policy if exists "experience_images_storage_select_member" on storage.objects;
drop policy if exists "experience_images_storage_insert_member" on storage.objects;
drop policy if exists "experience_images_storage_delete_member" on storage.objects;

drop table if exists public.experience_images;

-- O bucket `experience-images` (0 objetos, confirmado) fica registrado —
-- `storage.buckets` não aceita DELETE direto por SQL ("Direct deletion
-- from storage tables is not allowed. Use the Storage API instead.");
-- removê-lo exige a Storage Management API/dashboard, fora do escopo de
-- uma migration. Sem RLS/policy nenhuma apontando pra ele depois deste
-- arquivo, ele fica inerte — inacessível a qualquer client.
