# ROADMAP

Guia de desenvolvimento do projeto **Dates**. Define a ordem de implementação e evita que funcionalidades sejam desenvolvidas fora de sequência.

Consulte também [`CLAUDE.md`](./CLAUDE.md) para princípios de produto, código e design que orientam cada fase abaixo.

---

## Status Atual

- **Versão atual:** `v0.3`
- **Objetivo atual:** Construção da interface — Componentes Globais quase concluídos (falta `FilterBar` e o container de `Timeline`); próximo passo: Dashboard
- **Backend:** ainda não iniciado

---

## Fase 1 — Fundação ✅

**Objetivo:** Criar uma arquitetura sólida e escalável.

- [x] Estrutura do projeto
- [x] Layout base
- [x] Sidebar
- [x] Header
- [x] Navegação
- [x] Responsividade
- [x] Tema Dark/Light
- [x] Providers
- [x] Configuração das bibliotecas
- [x] Organização das pastas

**Status:** Concluído.

---

## Fase 2 — Design System ✅

**Objetivo:** Criar toda a identidade visual da aplicação.

- [x] Tipografia
- [x] Paleta de cores
- [x] Espaçamentos
- [x] Botões
- [x] Inputs
- [x] Cards
- [x] Badges
- [x] Empty States
- [x] Skeletons
- [x] Modais
- [x] Dialogs
- [x] Dropdowns
- [x] Componentes reutilizáveis
- [x] Animações padrão

**Status:** Concluído.

---

## Fase 3 — Componentes Globais

**Objetivo:** Construir os componentes compartilhados por toda a aplicação.

- [x] PageHeader
- [x] PageContainer
- [x] SearchBar *(implementado como `SearchInput`)*
- [ ] FilterBar
- [x] StatCard
- [ ] Timeline *(item individual `TimelineItem` pronto; container de lista ainda não)*
- [x] Rating
- [x] Gallery
- [x] ConfirmDialog
- [x] Loading
- [x] Avatar
- [x] EmptyState

Também entregues nesta etapa, além da lista original — cobrindo lacunas identificadas no `UX_ARCHITECTURE.md`: **Toast** (sistema completo), **Calendar** + **CalendarEvent**, **DateBadge**, **CategoryBadge**, **PageTitle**, **SectionTitle**, **SearchEmpty**, **NotFoundState**.

**Status:** Quase concluído — faltam `FilterBar` e o container de `Timeline`.

---

## Fase 4 — Dashboard

**Objetivo:** Criar a página inicial da aplicação.

- [ ] Cards de resumo
- [ ] Próximos agendamentos
- [ ] Atividades recentes

Utilizar apenas dados mockados.

**Status:** Não iniciado.

---

## Fase 5 — Ideias

**Objetivo:** Construir a principal funcionalidade da aplicação.

- [ ] Lista de ideias
- [ ] Cards
- [ ] Pesquisa
- [ ] Categorias
- [ ] Modal Nova Ideia
- [ ] Favoritar
- [ ] Editar
- [ ] Excluir

Tudo utilizando dados mockados.

**Status:** Não iniciado.

---

## Fase 6 — Calendário

**Objetivo:** Criar a visualização mensal dos agendamentos.

- [ ] Calendário
- [ ] Agenda do dia
- [ ] Eventos futuros

Dados mockados.

**Status:** Não iniciado.

---

## Fase 7 — Histórico

**Objetivo:** Registrar experiências realizadas.

- [ ] Timeline
- [ ] Avaliação
- [ ] Comentários
- [ ] Galeria
- [ ] Página de detalhes

**Status:** Não iniciado.

---

## Fase 8 — Favoritos

**Objetivo:** Exibir experiências favoritas.

- [ ] Lista
- [ ] Pesquisa
- [ ] Filtros

**Status:** Não iniciado.

---

## Fase 9 — Backend

**Objetivo:** Integrar toda a interface.

- [ ] Supabase
- [ ] Autenticação
- [ ] Banco de dados
- [ ] Storage
- [ ] Regras de acesso
- [ ] Persistência

**Status:** Não iniciado.

---

## Fase 10 — Deploy

**Objetivo:** Preparar a primeira versão utilizável.

- [ ] Testes
- [ ] Responsividade final
- [ ] Performance
- [ ] SEO básico
- [ ] Deploy na Vercel

**Status:** Não iniciado.

---

## Regras de Desenvolvimento

- Nunca iniciar uma fase sem concluir a anterior.
- Não desenvolver funcionalidades fora do roadmap sem autorização.
- Sempre manter componentes reutilizáveis.
- Priorizar simplicidade.
- Fazer commits pequenos e organizados.
- Atualizar este roadmap sempre que uma fase for concluída ou quando novas fases forem adicionadas.
