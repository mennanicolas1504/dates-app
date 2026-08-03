# CLAUDE.md

Este documento é a referência principal para qualquer trabalho de desenvolvimento neste repositório — humano ou IA. Ele descreve o que o produto é, como o código deve ser escrito e quais limites não podem ser cruzados sem autorização explícita.

Sempre leia este documento antes de propor ou implementar qualquer alteração.

---

## 1. Visão do Produto

**Dates** é uma plataforma privada para organizar ideias de encontros, agendar experiências e manter um histórico de tudo que já foi vivido.

O foco do produto é **organização e registro de memórias** — não interação social.

Dates **não é**:

- Um aplicativo de namoro.
- Uma rede social.
- Um produto com feed.
- Um produto com gamificação (pontos, badges, streaks, rankings).

O objetivo central é a **simplicidade**. A experiência deve ser sempre limpa, rápida e intuitiva, sem ruído visual ou funcional.

---

## 2. Filosofia do Produto

Estes princípios orientam toda decisão de produto e engenharia:

- **Simplicidade acima de quantidade de funcionalidades.** Menos telas e menos opções bem feitas superam muitas funcionalidades medianas.
- **Design minimalista.** Cada elemento na tela precisa justificar sua existência.
- **Experiência rápida.** Navegação e interações devem ser instantâneas, sem fricção.
- **Interface limpa.** Espaço em branco é parte do design, não um vazio a preencher.
- **Componentes reutilizáveis.** Nada é construído duas vezes.
- **Consistência visual.** Mesmos padrões de espaçamento, tipografia e cor em todo o produto.
- **Código limpo.** Legibilidade e previsibilidade acima de esperteza.
- **Arquitetura escalável.** A base precisa suportar crescimento sem exigir reescritas.

Toda nova funcionalidade deve ser avaliada contra o risco de aumentar complexidade sem entregar valor real. Na dúvida, não adicione.

---

## 3. Stack

### Atual

- **React** — biblioteca de UI
- **TypeScript** — tipagem estática
- **Vite** — build tool e dev server
- **Tailwind CSS v4** — estilização utilitária
- **shadcn/ui** — biblioteca de componentes (estilo `radix-nova`, base `radix`, ícones `lucide`)
- **React Router** — sistema de rotas
- **Framer Motion** — animações
- **Lucide Icons** — ícones

### Futuro (planejado, ainda não implementado)

- **Supabase** — backend, banco de dados e autenticação
- **Vercel** — deploy e hospedagem

Nenhuma peça da stack futura deve ser adicionada antecipadamente. Ela entra apenas quando a fase correspondente do roadmap for iniciada.

---

## 4. Estrutura do Projeto

```
src/
  app/            App raiz: compõe providers globais (tema, tooltip, router)
  providers/      Contexts globais (tema, sidebar) — estado compartilhado da aplicação
  components/
    layout/         Casco da aplicação: Header, Sidebar, AppLayout
    theme/          Componentes relacionados a tema (ex: theme toggle)
    ui/             Primitivos shadcn/ui — não editar manualmente, gerenciados via CLI
  routes/         Definição de rotas (router.tsx) e constantes de caminho (paths.ts)
  pages/          Componentes de página, um por rota — devem ser finos
  config/         Configuração estática da aplicação (nav, metadados do site)
  hooks/          Hooks reutilizáveis e agnósticos de domínio
  lib/            Utilitários puros (ex: cn())
  types/          Tipos compartilhados entre módulos
```

### Onde adicionar código novo

- **Nova rota/página** → criar em `src/pages/`, registrar em `src/routes/router.tsx` e `src/routes/paths.ts`.
- **Novo item de navegação** → `src/config/nav.ts`.
- **Novo componente de layout/casco** → `src/components/layout/`.
- **Novo componente shadcn/ui** → instalar via CLI (`npx shadcn add <componente>`), nunca criar manualmente dentro de `src/components/ui/`.
- **Nova lógica compartilhada sem estado de UI** → `src/hooks/` ou `src/lib/`.

### Domínios de negócio (`src/features/`)

Esta pasta **ainda não existe** — será criada quando a primeira funcionalidade de domínio real for implementada (ex: Ideias, Calendário, Histórico).

Quando surgir, cada domínio deve ser isolado em `src/features/<nome-do-dominio>/`, contendo seus próprios componentes, hooks e lógica específica. Apenas o que for genérico e reutilizável entre domínios permanece nas pastas compartilhadas (`components/`, `hooks/`, `lib/`).

---

## 5. Convenções de Código

- Utilizar **TypeScript fortemente tipado** em todo o código.
- **Nunca usar `any`.** Se o tipo é genuinamente desconhecido, modele-o corretamente ou use `unknown` com narrowing.
- Criar **componentes pequenos**, com responsabilidade única.
- **Evitar duplicação** — extrair para um componente, hook ou função compartilhada assim que o padrão se repetir.
- **Separar UI de lógica.** Componentes de apresentação não devem conter regras de negócio; lógica complexa vive em hooks.
- Criar **componentes reutilizáveis** por padrão, não como exceção.
- **Nomear arquivos de forma consistente**: `kebab-case.tsx` para arquivos, `PascalCase` para componentes exportados.
- **Não criar código morto.** Código não utilizado é removido, não comentado.
- **Não deixar comentários temporários** (`// TODO`, `// FIXME`, código comentado). Resolva antes de commitar ou registre como tarefa fora do código.

---

## 6. Convenções Visuais

O design deve seguir permanentemente estas diretrizes, independentemente de quem implementa:

- **Minimalista.** Menos elementos, mais clareza.
- **Muito espaço em branco.** Densidade baixa, respiro generoso.
- **Sem excesso de cores.** Paleta neutra baseada em **branco, preto, cinzas e slate** — sem cores de destaque saturadas.
- **Sem elementos chamativos.** Nada de badges piscando, banners ou CTAs agressivos.
- **Sem aparência romântica.** Nada de corações, tons rosados, gradientes exagerados ou linguagem visual "fofa".
- **Animações discretas.** Transições curtas e sutis (opacidade, leve deslocamento) — nunca decorativas ou chamativas.

### Referências de design

- Linear
- Notion
- Arc Browser
- Raycast
- Apple

Qualquer novo componente visual deve ser avaliado contra essas referências antes de ser aceito.

---

## 7. Regras para Alterações

**Nenhuma alteração estrutural pode ser feita sem autorização explícita do usuário.**

Isso inclui, sem exceção:

- `package.json`
- `vite.config.ts`
- `tsconfig*.json`
- Configuração do Tailwind
- Configuração do shadcn/ui (`components.json`)
- Providers globais (`src/providers/`)
- Sistema de rotas (`src/routes/`)
- Estrutura de pastas descrita na Seção 4
- Dependências principais da stack

Regras adicionais:

- **Não substituir bibliotecas existentes** por alternativas, mesmo que pareçam superiores.
- **Sempre preservar a arquitetura** definida neste documento.
- Alterações fora do escopo pedido não devem ser feitas "de brinde" — se identificar um problema não relacionado, reporte, não corrija sem pedir.

---

## 8. Organização do Desenvolvimento

- O projeto evolui **por fases**, conforme o roadmap da Seção 9.
- **Sempre concluir completamente uma fase antes de iniciar a próxima.**
- **Nunca misturar desenvolvimento de múltiplas funcionalidades** na mesma sessão de trabalho ou no mesmo commit.
- **Manter commits pequenos e coesos**, cada um representando uma unidade de trabalho compreensível isoladamente.

---

## 9. Roadmap Atual

| Fase | Nome |
|------|------|
| 1 | Fundação |
| 2 | Design System |
| 3 | Componentes Globais |
| 4 | Dashboard |
| 5 | Ideias |
| 6 | Calendário |
| 7 | Histórico |
| 8 | Favoritos |
| 9 | Backend |
| 10 | Deploy |

O status de cada fase deve ser acompanhado fora deste documento (ex: issues, board do projeto). Este roadmap define apenas a ordem e o escopo pretendido.

---

## 10. Objetivo de Longo Prazo

Dates deve crescer **mantendo simplicidade** como valor não-negociável.

Toda funcionalidade nova — em qualquer fase — deve ser avaliada considerando:

- **Utilidade real** — resolve um problema genuíno do usuário?
- **Impacto na experiência** — mantém a aplicação rápida e limpa?
- **Manutenção futura** — quanto custo de complexidade adiciona ao longo prazo?
- **Coerência com o restante do sistema** — segue os mesmos padrões visuais, arquiteturais e de código já estabelecidos?

Se uma funcionalidade não passa nesses quatro critérios, ela não deve ser implementada — independentemente de quão interessante pareça.
