# UX Architecture — Dates

Este documento define a experiência do usuário completa do **Dates** antes de qualquer implementação de tela. Ele é a referência de UX para as Fases 4 a 8 do [`ROADMAP.md`](./ROADMAP.md) (Dashboard, Ideias, Calendário, Histórico, Favoritos) e para a futura tela de Configurações.

Ele complementa — e não substitui — o [`CLAUDE.md`](./CLAUDE.md), que define a visão de produto, a filosofia e as convenções de código/visual. Toda decisão aqui é consequência direta dos princípios já registrados lá: **simplicidade acima de funcionalidades, organização e registro de memórias, nada de rede social, feed ou gamificação.**

Nenhum código, componente ou página foi criado nesta etapa. Este é um documento de planejamento.

---

## 1. Princípios de UX

Estes princípios filtram toda decisão de tela, fluxo ou componente documentada abaixo:

1. **Toda tela existe para resolver um problema.** Se uma tela não tem uma ação clara ou uma pergunta que responde, ela não deveria existir.
2. **Uma ação principal por tela.** Cada página tem um botão/ação óbvia; o resto é secundário (menu, ícone, dropdown).
3. **Nunca navegar quando um modal resolve.** Criar, editar e confirmar acontecem em contexto (Dialog/Sheet), sem tirar o usuário da lista em que ele estava.
4. **Nenhuma exclusão sem confirmação. Nenhuma ação reversível com confirmação.** Favoritar, agendar e editar são instantâneos; excluir sempre pergunta.
5. **Todo estado vazio orienta o próximo passo.** Nunca uma tela em branco sem explicação — sempre ícone + frase curta + uma única ação.
6. **Nada de métricas de engajamento.** Contadores no Dashboard descrevem o que existe (quantas ideias, quantas concluídas), nunca incentivam uso (sem streaks, sem pontuação, sem "você não usa o app há X dias").

---

## 2. Modelo conceitual: o ciclo de vida da Ideia

Antes de descrever páginas, é preciso deixar explícito o conceito que amarra Ideias, Calendário, Histórico e Favoritos — sem isso, as quatro páginas parecem features soltas.

Toda a aplicação gira em torno de **uma única entidade**: a **Ideia** (um encontro/experiência, planejada ou vivida). Ela tem três estados possíveis, e um flag independente:

```
[ Ideia ]  --Agendar-->  [ Agendada ]  --Concluir-->  [ Concluída ]
   ↑                          ↑                            ↑
   └──────────── Favoritar (flag independente, disponível em qualquer estado) ──┘
```

| Estado | Significado | Onde aparece |
|---|---|---|
| **Ideia** | Sem data marcada. Só um registro de "quero fazer isso". | Página **Ideias** |
| **Agendada** | Tem data/horário definidos. | Página **Ideias** (com badge de data) e **Calendário** (no dia marcado) |
| **Concluída** | O encontro já aconteceu; o usuário marcou como feito, com nota/avaliação/fotos opcionais. | Página **Histórico** (deixa de aparecer como ativa em Ideias) |

**Favorito** é um marcador booleano, independente do estado — uma ideia, uma ideia agendada ou uma memória concluída podem ser favoritadas. A página **Favoritos** não é uma feature nova: é um filtro transversal sobre essa mesma entidade, em qualquer estado.

Essa é a razão de existir de cada página:

- **Ideias** → gerencia o estado "Ideia" e "Agendada" (backlog + planejamento)
- **Calendário** → visualiza no tempo tudo que está "Agendada"
- **Histórico** → arquiva tudo que virou "Concluída"
- **Favoritos** → atalho para o que importa, cruzando os três estados
- **Dashboard** → resumo de tudo isso, sem detalhe
- **Configurações** → não faz parte do ciclo; é preferências da aplicação

---

## 3. Mapa do Produto

| Página | Rota prevista | Objetivo em uma frase | Ação principal |
|---|---|---|---|
| Dashboard | `/` | Orientar: "o que vem a seguir, como estou indo" | Ver próximo agendamento / Nova Ideia |
| Ideias | `/ideias` | Capturar e navegar o backlog de experiências | Nova Ideia |
| Calendário | `/calendario` | Ver o que está agendado, no tempo | Agendar em uma data |
| Histórico | `/historico` | Consultar memórias já vividas | Abrir uma memória |
| Favoritos | `/favoritos` | Achar rápido o que mais importa | Abrir um favorito |
| Configurações | `/configuracoes` | Ajustar preferências da aplicação | Salvar preferência |

Estas rotas seguem o padrão já estabelecido em `src/routes/paths.ts` (hoje contém apenas `home: "/"`) e serão adicionadas incrementalmente, uma por fase, nunca todas de uma vez.

---

## 4. Navegação

### 4.1 Sidebar

Item de navegação primária, um por página de topo, nesta ordem (a ordem reflete frequência de uso esperada, não a ordem alfabética):

1. Dashboard ("Início" — já existe em `config/nav.ts`)
2. Ideias
3. Calendário
4. Histórico
5. Favoritos

Configurações **não** entra nessa lista. Fica separada, próxima ao controle de colapso, no rodapé da Sidebar — mesmo padrão do Linear/Notion, onde ajustes não competem por atenção com o conteúdo principal.

Estado ativo: o item correspondente à rota atual fica destacado (já implementado no `SidebarNavItem`). Nenhuma página nova precisa de sub-navegação dentro da Sidebar — todas são de nível único.

### 4.2 Topbar (Header)

Hoje contém: gatilho do menu mobile + toggle de tema. Ao longo das Fases 4–8, o Header ganha (sem alterar sua função de casco fixo):

- **Busca global** (atalho `Cmd/Ctrl+K`, futuro) — busca por título em Ideias e Histórico simultaneamente, com resultados agrupados por tipo.
- **Ação rápida "Nova Ideia"** — visível em todas as páginas, não só em Ideias, porque capturar uma ideia deve ser possível a qualquer momento, sem trocar de tela.

O Header nunca ganha navegação primária (isso é papel da Sidebar) nem breadcrumbs — a Sidebar já indica onde o usuário está.

### 4.3 Hierarquia de fluxos: quando usar cada padrão

| Padrão | Quando usar | Exemplos |
|---|---|---|
| **Página cheia** | Somente para as 6 seções de topo do mapa acima. Nunca para um registro individual. | Ideias, Calendário, Histórico |
| **Dialog (modal)** | Criar ou editar **um** registro, formulário curto, sem perder o contexto da lista. | Nova Ideia, Editar Ideia, Agendar |
| **Sheet (painel lateral)** | Ver detalhes de **um** registro — mais conteúdo que um modal comporta (descrição longa, galeria, histórico). | Detalhes da Ideia, Detalhes da Memória |
| **AlertDialog (confirmação)** | Exclusivo para ações destrutivas ou irreversíveis. | Excluir ideia, excluir memória |
| **Dropdown (menu de contexto)** | Ações secundárias de um item, agrupadas atrás de um "⋯". | Editar / Agendar / Excluir num card |

Regra geral: **a lista nunca desaparece**. Criar, editar, ver detalhes e confirmar acontecem por cima dela (modal/sheet/dialog), nunca substituindo a tela.

### 4.4 Voltar / Fechar

- Modais e Sheets fecham com `Esc`, clique fora, ou botão "X" — nunca exigem um botão "Cancelar" como única saída.
- Não existe conceito de "voltar" entre páginas de topo (elas são irmãs na Sidebar, não uma hierarquia). "Voltar" só existe dentro de um fluxo de múltiplas etapas (ex.: um wizard futuro), e sempre como um passo explícito no próprio modal, não no navegador.

### 4.5 Ações rápidas

- **Nova Ideia**: disponível no Header (global) e como ação principal da página Ideias.
- **Agendar**: disponível a partir de um card de Ideia (menu de contexto) e a partir de um clique em data vazia no Calendário.
- **Favoritar**: ícone direto no card, em qualquer lista (Ideias, Calendário — no detalhe —, Histórico, Favoritos). Nunca escondido atrás de um menu, por ser a ação mais frequente e reversível.

### 4.6 Atalhos de teclado (futuro, não bloqueia Fases 4–8)

| Atalho | Ação |
|---|---|
| `Cmd/Ctrl + K` | Abrir busca global |
| `N` | Nova Ideia (quando não estiver digitando em um campo) |
| `Esc` | Fechar modal/sheet/dropdown aberto |

Marcados como futuro porque dependem da busca global, que não é pré-requisito de nenhuma fase do roadmap atual.

---

## 5. Fluxos do Usuário

### 5.1 Primeiro acesso

1. Usuário abre a aplicação → cai no **Dashboard**.
2. Não existem Ideias, Agendamentos ou Histórico ainda → todos os contadores mostram zero, sem gráfico, sem lista.
3. Dashboard exibe um **Empty State** central: "Comece adicionando sua primeira ideia" + botão único "Nova Ideia".
4. Clicar abre o Dialog de criação (mesmo modal usado em Ideias) — o usuário nunca precisa navegar para Ideias manualmente para o primeiro passo.
5. Ao salvar, o Dialog fecha e o Dashboard atualiza o contador — sem redirecionamento forçado para outra página.

### 5.2 Adicionar ideia

1. Usuário clica em "Nova Ideia" (Header ou página Ideias).
2. Abre **Dialog**: título (obrigatório), descrição (opcional), categoria (opcional).
3. Salvar → Dialog fecha, card novo aparece no topo da lista de Ideias (estado "Ideia", sem data).
4. Cancelar/Esc → nada é salvo, sem confirmação (ação não destrutiva, nada foi perdido).

### 5.3 Editar ideia

1. A partir do card (menu "⋯" → Editar) ou de dentro do Sheet de detalhes (botão Editar).
2. Abre o mesmo Dialog da criação, pré-preenchido.
3. Salvar → Dialog fecha, card/Sheet atualiza in-place. Sem navegação.

### 5.4 Favoritar

1. Clique no ícone de favorito no card (ou no Sheet de detalhes) — em Ideias, Calendário, Histórico ou Favoritos.
2. Toggle instantâneo, sem confirmação, sem modal. Feedback visual imediato no próprio ícone (preenchido/vazio).
3. Se estiver na página **Favoritos** e o usuário desfavoritar, o card desaparece da lista com uma transição suave (não um "pulo" abrupto).

### 5.5 Agendar

1. A partir de um card de Ideia (menu "⋯" → Agendar) ou clicando em uma data vazia no Calendário.
2. Abre um Dialog pequeno: escolher data (e horário, opcional).
   - Se veio do Calendário numa data específica: a data já chega preenchida; o Dialog pergunta apenas *qual* ideia agendar (ideia existente ou nova, ver 7.3).
   - Se veio de um card em Ideias: a data está em branco, escolhida pelo usuário no próprio Dialog.
3. Confirmar → o card muda de estado ("Ideia" → "Agendada"), ganha um badge de data, e passa a aparecer também no Calendário. Nenhuma navegação acontece.

### 5.6 Concluir experiência

1. A partir de um card "Agendada" (menu "⋯" → Concluir) ou do Sheet de detalhes.
2. Abre um Dialog: avaliação (opcional), notas/comentário (opcional), fotos (opcional — depende de storage, ver Seção 9).
3. Confirmar → o item muda de estado ("Agendada" → "Concluída"), some da lista ativa de Ideias e do Calendário futuro, e passa a aparecer em Histórico.
4. Esta é a única transição de estado que **não** é instantânea/sem-fricção de propósito: registrar uma memória merece um momento de pausa, mesmo que todos os campos sejam opcionais e um clique em "Concluir sem detalhes" resolva rápido para quem não quer preencher nada.

### 5.7 Consultar histórico

1. Usuário entra em **Histórico** pela Sidebar.
2. Vê a timeline reversa-cronológica, agrupada por mês/ano.
3. Clica em uma entrada → abre o Sheet de detalhes com nota, avaliação e galeria completas.
4. Fecha o Sheet → volta exatamente para a posição de scroll em que estava na timeline.

### 5.8 Pesquisar

1. Usuário digita no campo de busca local (SearchInput no topo de Ideias, Calendário — na agenda do dia — ou Histórico).
2. A lista filtra em tempo real, sem botão "Buscar" e sem navegação.
3. Campo vazio → lista completa volta a aparecer.
4. Nenhum resultado → Empty State específico de busca ("Nenhum resultado para 'x'" + ação "Limpar busca"), diferente do Empty State de "nunca existiu nada".

---

## 6. Páginas

Para cada página: objetivo, como o usuário chega e sai, o que está em destaque vs. escondido, ações disponíveis, estados vazios e evoluções futuras. Nenhuma implica em componente ou código — são decisões de experiência a serem seguidas quando a fase correspondente do roadmap começar.

### 6.1 Dashboard

- **Objetivo:** dar ao usuário, em um olhar, a resposta para "o que vem a seguir" e "como está indo". Não é um painel analítico.
- **Chega por:** rota raiz (`/`), sempre a primeira tela ao abrir a aplicação.
- **Sai por:** clicando em qualquer stat ou no destaque de próximo agendamento, que leva à página correspondente (Ideias ou Calendário); ou pela Sidebar, como qualquer outra página.
- **Ação principal:** nenhuma ação obrigatória — é uma tela de leitura. O atalho "Nova Ideia" está disponível mas não é o foco central.
- **Informação prioritária:** o próximo agendamento (se existir), em destaque visual maior que o resto.
- **Em destaque:** próximo agendamento; contadores de Ideias / Agendadas / Concluídas / Favoritas.
- **Escondido:** listas completas, filtros, formulários — tudo isso vive nas páginas específicas. O Dashboard nunca duplica uma tabela inteira de outra página.
- **Estados vazios:** ver Fluxo 5.1 (Primeiro acesso). Depois do primeiro item criado, o Dashboard nunca mais fica vazio (mesmo com zero agendamentos futuros, os contadores continuam mostrando ideias/histórico existentes).
- **Evoluções futuras:** prévia em miniatura do mês no Calendário; "há X dias desde a última experiência" como dado neutro (nunca como cobrança ou gamificação).

### 6.2 Ideias

**Esta é a tela principal do sistema** — onde o usuário passa mais tempo. Toda decisão aqui prioriza velocidade de captura e navegação visual.

- **Objetivo:** ser o backlog vivo de ideias de encontros — capturar rápido, navegar visualmente, agir sem fricção.
- **Chega por:** Sidebar (item "Ideias"); Dashboard (clique em stat "Ideias" ou "Agendadas"); ação global "Nova Ideia" no Header também pode abrir o Dialog estando em qualquer página, mas o card resultante só é *visto* em Ideias.
- **Sai por:** abrindo o Sheet de detalhes de um card (não é bem uma "saída", é uma sobreposição); navegando para outra página pela Sidebar.
- **Ação principal:** "Nova Ideia" (canto superior direito, sempre visível).
- **Informação prioritária por card:** título, imagem de capa (se houver), categoria, estado (badge "Agendada" com data, ou nada se for só ideia), favorito.
- **Em destaque:** cards com imagem — comunicam a ideia mais rápido que texto puro.
- **Escondido:** descrição completa (só no Sheet de detalhes), notas de conclusão (só aparecem depois que virou Histórico).
- **Componentes previstos** *(nomenclatura, sem implicar implementação)*: PageHeader com ação "Nova Ideia"; SearchInput; barra de filtros (categoria via chips, estado via seletor simples: Todas / Ideias / Agendadas); grid de Cards (com CardImage quando houver capa); menu de contexto por card; Sheet de detalhes; Dialogs de criar/editar/agendar/concluir; AlertDialog de exclusão.
- **Ações disponíveis:** pesquisar, filtrar por categoria/estado, criar, ver detalhes, editar, agendar, concluir, favoritar, excluir.
- **Estados vazios:**
  - Nunca criou nenhuma ideia → Empty State: "Nenhuma ideia ainda" + "Criar primeira ideia".
  - Filtro/busca sem resultado → Empty State: "Nenhum resultado encontrado" + "Limpar filtros".
- **Evoluções futuras:** reordenar por arrastar; gestão de categorias personalizadas; upload real de imagem (depende de Storage, Fase 9); ordenação (mais recente, alfabética).

#### Detalhamento pedido: pesquisar, visualizar, filtrar, adicionar, editar, excluir, favoritar, agendar, ver detalhes

| Ação | Como acontece |
|---|---|
| Pesquisar | Campo de busca no topo, filtra por título em tempo real, sem navegação |
| Visualizar | Grid de cards (visual, não tabela) — cada card resume o essencial |
| Filtrar | Chips de categoria (múltipla escolha) + seletor de estado (Todas/Ideias/Agendadas) |
| Adicionar | Botão "Nova Ideia" → Dialog → card aparece na lista |
| Editar | Menu "⋯" no card ou botão no Sheet → mesmo Dialog, pré-preenchido |
| Excluir | Menu "⋯" no card ou botão no Sheet → AlertDialog de confirmação → card some com transição |
| Favoritar | Ícone direto no card → toggle instantâneo |
| Agendar | Menu "⋯" no card ou botão no Sheet → Dialog de data → card ganha badge de data |
| Ver detalhes | Clique no corpo do card (fora dos ícones de ação) → abre Sheet lateral |

### 6.3 Calendário

- **Objetivo:** mostrar no tempo tudo que está agendado, para planejar a semana/mês.
- **Chega por:** Sidebar; a partir do Sheet de detalhes de uma Ideia agendada ("ver no calendário"); a partir do destaque de "próximo agendamento" no Dashboard.
- **Sai por:** clique em um evento → Sheet de detalhes (mesmo componente usado em Ideias — um agendamento é a mesma entidade, só visualizada por data).
- **Ação principal:** nenhuma única — a tela é primariamente de visualização; a ação mais comum é clicar numa data vazia para agendar.
- **Informação prioritária:** dias com eventos (indicador visual discreto — ponto ou etiqueta curta, nunca cor saturada); mês/período atual em destaque no topo.
- **Em destaque:** o dia de hoje (marcação sutil na grade); dias com eventos.
- **Escondido:** detalhes do evento (só aparecem ao clicar); meses sem nenhuma navegação relevante não recebem tratamento especial.
- **Visualização mensal:** padrão ao abrir a página. Grade de dias do mês, com indicador nos dias que têm agendamento.
- **Visualização diária:** alternância (toggle Mês/Dia) para uma agenda vertical de um único dia — melhor para mobile e para dias com múltiplos eventos.
- **Eventos:** renderizados como etiqueta curta (título truncado) dentro da célula do dia; clique abre o Sheet de detalhes.
- **Mudança de mês:** setas anterior/próximo + atalho "Hoje" em uma barra de ferramentas acima da grade.
- **Clique em datas:**
  - Data vazia → oferece agendar (ideia existente ou nova ideia diretamente para aquela data).
  - Data com evento(s) → abre a lista de eventos daquele dia (se mais de um) ou direto o Sheet de detalhes (se só um).
- **Estados vazios:** a grade do calendário sempre existe (não há "vazio total" como em uma lista) — um mês sem eventos simplesmente não mostra indicadores em nenhum dia. Nenhum Empty State bloqueante é necessário aqui.
- **Evoluções futuras:** visualização semanal; arrastar evento para outra data (reagendar); sincronização com calendário externo (Google Calendar) — depende de backend, não antes da Fase 9.

### 6.4 Histórico

- **Objetivo:** arquivo de memórias — consultar tudo que já foi vivido, com contexto (nota, avaliação, fotos).
- **Chega por:** Sidebar; a partir do Dashboard ("atividade recente"); automaticamente, é para onde uma Ideia "vai" ao ser concluída (conceitualmente — o usuário não é redirecionado à força, apenas o item passa a existir lá).
- **Sai por:** clique em uma entrada → Sheet de detalhes.
- **Ação principal:** nenhuma ação de criação — Histórico não cria itens diretamente; itens chegam ali apenas pelo fluxo "Concluir experiência" em Ideias/Calendário. Isso é intencional: mantém o histórico como um registro fiel do que foi de fato planejado e vivido, não uma lista solta.
- **Informação prioritária:** data da experiência, título, avaliação (se houver), miniatura da galeria (se houver).
- **Linha do tempo:** ordenação reversa-cronológica, agrupada por mês/ano, similar a um diário.
- **Pesquisa:** por título e por texto da nota.
- **Filtros:** por categoria, por avaliação, por período (ano/mês).
- **Detalhes:** Sheet lateral com nota completa, avaliação, galeria completa, data agendada original vs. data de conclusão (quando diferentes).
- **Em destaque:** entradas com fotos (comunicam a memória mais que texto).
- **Escondido:** ideias e agendamentos ativos não aparecem aqui — só o que já foi concluído.
- **Estados vazios:** nenhuma experiência concluída ainda → Empty State: "Nenhuma experiência concluída ainda" + ação "Ver próximos agendamentos" (leva ao Calendário/Ideias, não a um formulário — Histórico não se cria diretamente, se cria vivendo).
- **Evoluções futuras:** resumo anual (tom de recapitulação de memórias, não gamificado); exportar como "livro de memórias" (PDF).

### 6.5 Favoritos

- **Objetivo:** atalho para as experiências (em qualquer estado) que o usuário marcou como especiais.
- **Chega por:** Sidebar.
- **Sai por:** clique em um item → mesmo Sheet de detalhes da entidade original (uma Ideia favoritada abre como Ideia; uma memória favoritada abre como Histórico).
- **Ação principal:** nenhuma exclusiva — Favoritos não tem criação própria, é um filtro.
- **Como funciona (definição, sem implementação):** lista todos os itens com `favorito = true`, independentemente do estado (Ideia / Agendada / Concluída), preservando o badge de estado de cada um para não perder contexto. Desfavoritar aqui remove o item da lista com uma transição suave, mas não afeta o item em sua página de origem além do próprio flag.
- **Em destaque:** o badge de estado de cada item (para deixar claro que Favoritos mistura os três estados).
- **Escondido:** nenhuma informação nova — os cards usam exatamente o mesmo formato das páginas de origem.
- **Estados vazios:** nenhum favorito ainda → Empty State: "Nenhum favorito ainda" + ação "Ver ideias".
- **Evoluções futuras:** nenhuma prevista — esta página deve permanecer deliberadamente simples (é um filtro, não uma feature).

### 6.6 Dashboard

*(Ver seção 6.1 — mantido aqui apenas como referência de ordem ao roadmap; conteúdo completo já documentado acima.)*

### 6.7 Configurações

- **Objetivo:** centralizar preferências da aplicação. Não depende de backend nesta etapa — apenas define o que existirá.
- **Chega por:** ícone dedicado no rodapé da Sidebar (junto ao controle de colapso), não pela navegação primária.
- **Sai por:** Sidebar, como qualquer outra página.
- **Ação principal:** nenhuma — página de ajustes, cada seção salva individualmente ao ser alterada (sem botão "Salvar" global).
- **Preferências previstas** (sem backend, apenas definição):
  - **Aparência:** tema Claro / Escuro / Sistema (a lógica já existe via `ThemeProvider`; esta tela apenas formaliza um lugar dedicado além do toggle rápido do Header).
  - **Perfil:** nome, e-mail — depende de autenticação (Fase 9).
  - **Categorias:** criar/renomear/remover categorias usadas em Ideias.
  - **Notificações:** lembretes de agendamentos próximos — depende de backend (Fase 9).
  - **Dados:** exportar histórico, excluir conta — depende de backend (Fase 9).
- **Em destaque:** Aparência e Categorias (funcionam sem backend, podem ser construídas antes da Fase 9).
- **Escondido:** Perfil, Notificações e Dados ficam visíveis mas desabilitados/"em breve" até existir backend — nunca escondidos sem explicação, para não parecer bug.
- **Estados vazios:** não se aplica (é formulário de preferências, não lista).
- **Evoluções futuras:** exportação de dados, gestão de conta, densidade de interface (compacto/confortável).

---

## 7. Padrões de UX

### 7.1 Confirmações

- Só existem para ações **destrutivas ou irreversíveis**. Editar, agendar, favoritar e concluir nunca pedem confirmação — são reversíveis ou desejadas por definição.
- Formato: AlertDialog, nunca um `window.confirm` nativo.
- Copy sempre nomeia exatamente a consequência ("Esta ideia será removida permanentemente, incluindo notas e fotos associadas."), nunca um genérico "Tem certeza?".
- Botão de cancelar sempre à esquerda/primeiro; ação destrutiva sempre à direita, visualmente distinta (variante danger).

### 7.2 Exclusões

- Sempre passam por confirmação (7.1).
- Sem lixeira/undo nesta fase — a exclusão é definitiva, para manter o modelo simples. Uma lixeira com restauração é uma evolução futura possível, não um requisito de v1.
- Excluir uma Ideia agendada também remove o evento correspondente do Calendário (é a mesma entidade, não uma cópia).

### 7.3 Modais (Dialogs)

- Um único objetivo por modal (criar, editar, agendar, concluir — nunca um modal que faz duas coisas).
- Campo mais importante sempre no topo, com foco automático ao abrir.
- Ação primária no canto inferior direito; cancelar/fechar à esquerda dela.
- Fecham com Esc, clique fora, ou X — exceto quando há alterações não salvas relevantes (ex.: formulário longo de Concluir com notas escritas), caso em que fechar por fora pode pedir confirmação leve — este é o único ponto onde um Dialog não-destrutivo pode gerar uma confirmação, e mesmo assim é uma evolução a validar, não uma obrigação da v1.

### 7.4 Sheets (painéis laterais)

- Usados quando o conteúdo é rico demais para um modal (descrição longa, galeria, múltiplas ações) mas ainda é sobre **um único registro**.
- Abrem da direita, sobre a lista, sem navegação de rota — fechar o Sheet devolve exatamente o estado (scroll, filtros) da lista por trás.
- Contêm as mesmas ações do menu de contexto do card (editar, agendar, concluir, favoritar, excluir), para que o usuário nunca precise fechar o Sheet para agir.

### 7.5 Mensagens / Feedback

- Ações rápidas e reversíveis (favoritar, salvar edição) não precisam de mensagem de confirmação — o próprio estado visual (ícone preenchido, card atualizado, modal fechando) já é o feedback.
- Ações que finalizam um fluxo (criar, agendar, concluir, excluir) devem ter uma confirmação visual não-bloqueante (padrão *toast*), curta, sem exigir clique para dispensar.
- **Lacuna identificada:** o Design System (Fase 2) ainda não inclui um componente de notificação tipo *toast*. Ele deve ser adicionado ao Design System **antes** do início da Fase 5 (Ideias), já que ações de criar/editar/excluir dependem desse padrão de feedback.

### 7.6 Estados vazios

- Sempre: ícone (Lucide, neutro) + título curto + descrição de uma linha + no máximo **uma** ação.
- Dois tipos, sempre diferenciados no texto:
  - **Vazio de verdade** ("nunca existiu nada aqui") → ação leva a criar.
  - **Vazio por filtro/busca** ("existe conteúdo, mas nada bate com o filtro") → ação leva a limpar o filtro, nunca a criar.

### 7.7 Carregamentos

- Conteúdo em grade/lista (Ideias, Histórico) usa esqueletos com o formato do conteúdo final (Skeleton de card/lista), nunca um spinner central — reduz a sensação de espera.
- Ações pontuais dentro de um botão (salvando um formulário) usam o estado de loading do próprio botão (spinner inline), não um overlay de página inteira.
- Nenhuma tela deve travar totalmente durante um carregamento parcial — só a região afetada mostra esqueleto.

---

## 8. Lacunas identificadas para as próximas fases

Registradas aqui para não serem esquecidas quando o desenvolvimento começar:

1. **Componente de notificação (toast)** — necessário antes da Fase 5 (ver 7.5). Não fazia parte da lista original do Design System (Fase 2).
2. **Primitivo de calendário/grade de datas** — necessário na Fase 6; não existe ainda no Design System.
3. **Componente de avaliação (rating/estrelas)** e **galeria de imagens** — necessários na Fase 7 (Histórico); já estavam previstos na lista de "Componentes Globais" da Fase 3 do roadmap (Rating, Gallery), mas ainda não implementados.
4. **Upload/armazenamento de imagem** — bloqueado até a Fase 9 (Supabase Storage); até lá, capa de ideia e galeria de histórico devem funcionar com URL de imagem ou ficar indisponíveis nos protótipos com dado mockado.

---

## 9. Rotas previstas

| Rota | Página | Fase do roadmap |
|---|---|---|
| `/` | Dashboard | Fase 4 |
| `/ideias` | Ideias | Fase 5 |
| `/calendario` | Calendário | Fase 6 |
| `/historico` | Histórico | Fase 7 |
| `/favoritos` | Favoritos | Fase 8 |
| `/configuracoes` | Configurações | Não associada a uma fase específica — pode ser construída em paralelo, priorizando as seções sem dependência de backend (Aparência, Categorias) |

Nenhuma rota acima existe hoje em `src/routes/`. Cada uma deve ser adicionada apenas quando sua fase correspondente for iniciada, seguindo a regra do `ROADMAP.md`: nunca misturar desenvolvimento de múltiplas fases.

---

## 10. Próximos passos

Este documento é a referência de UX para o restante do projeto. Antes de iniciar a Fase 4 (Dashboard):

1. Validar este documento com o usuário — ajustar qualquer fluxo que não reflita a intenção real do produto.
2. Resolver a lacuna do componente de toast (Seção 8) como um pequeno adendo ao Design System, já que impacta todas as fases seguintes.
3. Só então iniciar a Fase 4, seguindo exatamente os fluxos e páginas aqui descritos — sem adicionar telas, estados ou ações que não estejam documentados neste arquivo.
