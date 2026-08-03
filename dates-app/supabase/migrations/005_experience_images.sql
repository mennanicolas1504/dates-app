-- Hoje `Idea.images` é um array de URLs embutido no próprio registro.
-- Vira tabela própria por dois motivos: (1) as imagens passam a apontar
-- para o Storage privado (ver 008_storage.sql); (2) `position` preserva "a
-- primeira imagem é a miniatura" sem depender da ordem de um array JSON.
create table public.experience_images (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references public.experiences (id) on delete cascade,
  -- Caminho do objeto dentro do bucket `experience-images`
  -- (`{space_id}/{experience_id}/{arquivo}`, ver 008_storage.sql), não uma
  -- URL. O bucket é privado — não existe URL pública estável para guardar;
  -- a app resolve este path para uma signed URL (com expiração) só no
  -- momento de exibir a imagem, nunca no momento de gravar.
  storage_path text not null,
  position smallint not null default 0,
  created_at timestamptz not null default now()
);

comment on table public.experience_images is
  'Galeria de uma experience. position = 0 é a miniatura usada na listagem. storage_path é relativo ao bucket, não uma URL.';
