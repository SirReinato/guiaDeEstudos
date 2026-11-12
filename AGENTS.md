# AGENTS.md — Guia de Engenharia e Governança para Agentes de IA | Guia de Estudos TI

> **🤖 LEIA ISTO PRIMEIRO.** Este arquivo é a fonte da verdade e o ponto de entrada obrigatório para qualquer modelo de IA ou agente autônomo (Cursor, Claude, Gemini, Copilot, Codex, ChatGPT etc.) que for analisar, criar ou modificar código neste projeto.
> Ele documenta a arquitetura, convenções, stack técnica, estrutura de pastas, regras operacionais, estratégia de testes, segurança e fluxo de tarefas. Leia-o **integralmente** antes de inspecionar ou alterar qualquer arquivo.

---

## ⚠️ REGRAS OBRIGATÓRIAS (ARQUIVO, GIT, GESTÃO & ESTRUTURAÇÃO)

### 1. Toda alteração estrutural DEVE atualizar este `AGENTS.md` no mesmo commit/tarefa

Considera-se "alteração estrutural" qualquer uma das seguintes ações (lista não exaustiva):

* Criar, renomear, mover ou remover arquivos e pastas em `src/`, `public/` ou na raiz.
* Criar, modificar ou remover **módulos de estudo, abas, componentes, contexts, hooks, services, utils, schemas SQL ou testes funcionais**.
* Adicionar, atualizar (major) ou remover **dependências** ou scripts no `package.json`.
* Adicionar ou alterar **variáveis de ambiente** (e espelhar no `.env.example`).
* Implementar ou alterar **regras de negócio**, modelos de dados (tabelas Supabase/SQLite), validações ou integrações com APIs (Gemini, Supabase, etc.).
* Adotar novas convenções de arquitetura, padrões de estilo, bibliotecas, regras de segurança ou fluxos de deploy/CI/CD.

**Como atualizar este arquivo após uma alteração estrutural:**
1. Atualize a seção correspondente neste documento (árvore de pastas, tabela de rotas/abas, stack, variáveis, etc.).
2. Registre uma nova entrada na tabela de [Histórico de alterações deste arquivo](#-histórico-de-alterações-deste-arquivo) contendo data (YYYY-MM-DD) e resumo conciso do que mudou.
3. Se a alteração afetar a experiência direta do usuário ou a configuração do projeto, atualize também o `README.md`.

> ⛔ **Atenção:** Se uma IA finalizar uma tarefa estrutural sem atualizar este arquivo e seu histórico, **a tarefa é considerada incompleta e inválida**.

---

### 2. Fluxo obrigatório de Git: Nova Feature/Fix Branch + Push ao GitHub

Para garantir rastreabilidade, isolamento de escopo e facilidade em code reviews e auditorias:

* **NUNCA desenvolva ou commite diretamente na branch `main` (ou `master`) no dia a dia**.
* Toda nova implementação, melhoria, refatoração ou correção DEVE ser desenvolvida em uma branch dedicada:
  ```bash
  git checkout -b feature/nome-da-funcionalidade   # Para novas funcionalidades
  git checkout -b fix/nome-da-correcao            # Para correção de bugs
  git checkout -b refactor/nome-do-ajuste         # Para refatorações estruturais
  ```
* **Commits atômicos, granulares e semânticos (Conventional Commits)**:
  * Nunca crie commits genéricos ou vagos (como `"wip"`, `"update"`, `"ajustes"`, `"fix"`).
  * Use o padrão semântico: `feat:`, `fix:`, `refactor:`, `style:`, `docs:`, `chore:`, `test:`, `sec:`.
  * Descreva com clareza o escopo da alteração no título e, sempre que aplicável, inclua no corpo o *o quê* e o *porquê* da mudança.
* **Push obrigatório ao repositório remoto ao concluir**:
  ```bash
  git push -u origin <nome-da-branch>
  ```
  Isso viabiliza a criação imediata de Pull Requests e acompanhamento de versão.

> 🚀 **Exceção Única de Inicialização (`Initial Commit` na `main`):**
> Caso este `AGENTS.md` seja utilizado para iniciar um novo projeto do zero, a instalação inicial das dependências obrigatórias, expurgo de CSS do Vite e criação da estrutura de pastas/arquivos base PODE e DEVE ser commitada diretamente na branch `main` como o commit inaugural (`chore: initial project setup`). A partir desse primeiro commit na `main`, a proibição de commits diretos torna-se 100% rígida e irrevogável para qualquer tarefa subsequente.

---

### 3. Gestão e Decomposição de Demandas em Issues (Linear / MCP & Modo Copiável)

Sempre que uma nova atualização, funcionalidade ou refatoração for solicitada, o agente DEVE organizar o plano de execução em etapas antes ou durante o desenvolvimento:

1. **Decomposição em Etapas Lógicas e Funcionais**:
   * Divida a solicitação em issues granulares, sequenciais e independentes (ex: *Fase 1: Configuração do Serviço/Schema*, *Fase 2: Criação do Hook/Contexto*, *Fase 3: Interface e Componentes com styled-components*, *Fase 4: Integração de Dados e Teste Funcional*).
   * Cada issue deve ser autossuficiente e conter:
     - **Título claro e semântico** (ex: `feat(redacao): implementar cálculo de pontuação por critério da banca`).
     - **Objetivo funcional**: o que essa etapa entrega e por que é necessária.
     - **Passo a passo técnico**: arquivos exatos a criar/alterar e bibliotecas envolvidas.
     - **Critérios de aceitação (DoD)**: como validar que a etapa foi concluída com sucesso.

2. **Criação de Issues com Linear MCP Ativo**:
   * Se o ambiente possuir a integração do **Linear via MCP** habilitada, o agente deve **criar e registrar automaticamente essas issues** no projeto/time correspondente do Linear, associando labels, prioridades e estimativas adequadas.

3. **Formato Copiável para Agentes Sem Linear MCP**:
   * Em todas as respostas ou documentações de planejamento, forneça também um bloco claro com o conteúdo exato da **atividade do momento** e das etapas seguintes.
   * Esse bloco deve ser estruturado de forma que o desenvolvedor possa simplesmente **copiar e colar o texto em outro agente ou modelo de IA que não tenha o Linear MCP ativo**, e esse agente entenda perfeitamente o contexto, as restrições e o código que deve produzir sem precisar de instruções adicionais.

4. **Replanejamento e Adaptação Dinâmica de Planos Futuros**:
   * Se durante o desenvolvimento de uma etapa surgirem novos requisitos, bloqueios técnicos ou o usuário alterar decisões arquiteturais, o agente DEVE **atualizar imediatamente as issues e etapas futuras** (seja atualizando os cards no Linear via MCP, seja reescrevendo o roteiro no plano).
   * Nunca prossiga com um plano defasado; o backlog e as próximas etapas devem sempre refletir a realidade mais recente.

---

### 4. Proibição de Arquivos Markdown, Relatórios EGM e Testes na Raiz (`00-anything/`)

* **PROIBIDO** gerar, salvar ou descarregar arquivos de rascunho, drafts, specs temporárias, testes avulsos, relatórios de auditoria/crítica/síntese de agentes EGM (`critic_report.md`, `goldfish_review_report.md`, `implementation_readiness_report.md`, `intermediate_zoom_out_report.md`, `concepts_brief.md`, `design_draft.md` etc.) ou anotações na raiz do repositório.
* A raiz do repositório deve conter **exclusivamente** os arquivos de governança e configuração estruturais (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `README.md`, `package.json`, `vite.config.ts`, `.oxlintrc.json`, arquivos `.sql` essenciais e dotfiles).
* **Diretório Obrigatório (`00-anything/`)**: Todos os arquivos de ideação, design, reviews de EGM, relatórios de subagentes, artefatos de testes ou documentações exploratórias DEVEM ser alocados dentro do diretório `00-anything/` na raiz do projeto.
* **Padrão Obrigatório de Subpastas por Implementação**:
  Sempre que iniciar uma sessão de EGM, brainstorm, refatoração estrutural, suíte de testes ou planejamento de uma nova feature/implementação, o agente DEVE criar uma nova subpasta dentro de `00-anything/` seguindo rigorosamente o formato:
  ```text
  00-anything/{sequencial_2_digitos} - {nome-da-implementacao} {data-yyyy-mm-dd}/
  ```
  * Exemplo 1: `00-anything/01 - governanca agents 2026-11-12/`
  * Exemplo 2: `00-anything/02 - modulo discursivas gemini 2026-11-15/`
* **Isolamento Total do Escopo**: Todos os arquivos que essa estruturação, teste ou execução for produzir devem ser salvos exclusivamente dentro dessa subpasta correspondente. É terminantemente proibido espalhar arquivos auxiliares fora dela.
* **Numeração Sequencial Contínua**: Verifique as subpastas já existentes em `00-anything/` e incremente o numeral sequencial de 2 dígitos (`01`, `02`, `03`...) em ordem cronológica crescente.

---

### 5. Respeito Rigoroso ao Domínio do Projeto (Anti-Alucinação e Construção Contínua)

* **PROIBIÇÃO DE INFERIR OU DESVIRTUAR O DOMÍNIO DO PROJETO**: Este projeto possui um escopo bem delimitado: **Plataforma de Estudos para Certificações e Concursos de TI (Guia de Estudos)**. O agente **NUNCA** deve alucinar ou alterar o objetivo da aplicação (como tentar transformar o projeto em um portal de notícias, e-commerce ou outro nicho genérico).
* **CONSTRUÇÃO SOBRE O ECOSSISTEMA EXISTENTE**: Toda nova implementação deve se integrar harmonicamente aos módulos consolidados:
  - Módulos de estudo (Oficina de Discursivas, Mini-IDE, Ciclo 30/70, Dose Diária Anki, Flashcards, Editais, Provas Feitas).
  - Camada de autenticação e perfis (`AuthContext`, `profiles`, admin `SirReinato`).
  - Persistência híbrida Supabase (nuvem) e SQLite/sql.js (local/offline).
  - Tema oficial escuro e nobre (`src/theme/theme.ts`) com sufixo `Stl` obrigatório.

---

### 6. Dependência Obrigatória: `graphify` (Sincronização Contínua com `AGENTS.md`)

* **Instalação e Presença Obrigatória**: O projeto deve manter suporte ao mapeamento via `graphify` (`npx graphify`).
* **Simbiose e Complementaridade**: O `AGENTS.md` e o `graphify` agem sempre juntos: o `AGENTS.md` fornece o contexto semântico, arquitetural e as regras operacionais para as IAs, enquanto o `graphify` mapeia visualmente as relações estruturais e o grafo de dependências do código.
* **Regra de Atualização Simultânea**: Toda e qualquer alteração estrutural no projeto (criação de módulos, componentes, services, contexts ou hooks) DEVE acionar a atualização do mapa do `graphify` no mesmo ciclo/commit em que o `AGENTS.md` for atualizado.
* **Configuração no Git e Scripts**:
  - Script no `package.json`: `"graphify": "npx graphify"`
  - A pasta gerada pelo graphify (`graphify-out/`) deve constar obrigatoriamente no `.gitignore` para evitar poluição do repositório, mas ser mantida atualizada localmente para consumo das IAs.

---

## 1. Visão geral

O **Guia de Estudos TI** (`08-guiadeestudos`) é uma Single Page Application (SPA) reativa e de alta performance, desenvolvida em **React 19**, **TypeScript** e **styled-components**, voltada para a preparação de alto rendimento para concursos públicos e certificações avançadas de Tecnologia da Informação.

* **Objetivo do projeto:** Proporcionar um ecossistema completo de estudo ativo e resolução metódica de conteúdo programático, combinando teoria direcionada, repetição espaçada, resolução de questões, simulação de provas reais, desafios práticos de código e correção inteligente de redações discursivas via IA.
* **Público-alvo:** Candidatos a concursos públicos de alto nível (fisco, tribunais, bancos, agências reguladoras e carreiras policiais em TI) e profissionais em certificações técnicas de tecnologia.
* **Status atual:** Plataforma funcional e modular com autenticação Supabase, painel administrativo para aprovação de usuários, persistência híbrida (Supabase PostgreSQL + SQLite local), design system temático sofisticado (tons escuros e marfim), e 7 módulos de aprendizagem ativos.

### Módulos Centrais da Plataforma:
1. **Oficina de Discursivas / Laboratório de Redação (`RedacaoLaboratorio.tsx`)**: Treinamento de redações e estudos de caso com contagem de linhas, temas de editais, padrão de resposta oficial e avaliação pedagógica automatizada via Google Gemini AI (`@google/genai`).
2. **Mini-IDE Arena de Código (`MiniIDEArena.tsx`)**: Ambiente interativo com Monaco Editor para resolver desafios de programação e banco de dados (SQL, Python, JavaScript, Java), com execução em memória via `sql.js` e validação local (`codeValidator.ts`).
3. **Ciclo de Estudos 30/70 (`CicloEstudos3070.tsx`)**: Implementação rigorosa do método 30% teoria objetiva em Markdown (`teoria_resumos`) e 70% prática com questões de concurso comentadas (`questoes`).
4. **Dose Diária / Anki Streak (`DailyStreakPlayer.tsx`)**: Player de memorização rápida baseado no algoritmo de repetição espaçada SM-2 (SuperMemo-2), com controle de streak diário e meta mínima de revisão.
5. **Gerenciador de Flashcards (`FlashcardManager.tsx`)**: Criação, edição, filtragem por disciplina/tópico e exportação/importação de cartões de memória vinculados a editais.
6. **Cockpit e Gestor de Editais (`EditalManager.tsx` & `EditalSelectorBar.tsx`)**: Estruturação hierárquica (Edital > Disciplinas > Tópicos com relevância de 1 a 5), com extrator de conteúdo de editais em PDF via `pdfjs-dist`.
7. **Provas Feitas & Auditoria de Desempenho (`ProvaFeitaManager.tsx`)**: Registro de simulados e provas anteriores, cálculo ponderado de notas gerais e objetivas, conferência de gabaritos preliminares/definitivos e auditoria contra nota de corte.
8. **Painel de Governança e Administração (`AdminPanel.tsx`)**: Controle de aprovação de novos cadastros de usuários (`active`, `pending`, `rejected`) com acesso restrito ao admin supremo (`SirReinato`).

---

## 2. Stack técnica

| Camada | Tecnologia | Observações |
| ----- | ----- | ----- |
| **Build & Dev Tool** | **Vite** (v8+) | Bundler ultrarrápido ESM com plugins TypeScript e React |
| **Linguagem** | **TypeScript** (`~6.0`) | Tipagem estrita com contratos centralizados em `src/types/` |
| **UI Framework** | **React** (v19.2+) | Functional components, hooks nativos e React Compiler ready |
| **Estilização** | **styled-components** (v6+) | **REGRA ESTRITA: ZERO CSS DENTRO DE `src/`**. Proibido arquivos `.css`/`.scss`. Todo o reset, tipografia e temas residem em `src/theme/GlobalStyle.ts` e `src/theme/theme.ts`. |
| **Nomenclatura de Estilos** | **Sufixo `Stl` Obrigatório** | Todo styled-component DEVE terminar obrigatoriamente com o sufixo `Stl` (ex.: `AppLayoutStl`, `NavegacaoSegmentadaContainerStl`, `TabBotaoStl`, `CardStl`). |
| **Backend & Autenticação** | **Supabase** (`@supabase/supabase-js` v2) | PostgreSQL na nuvem, Auth com JWT, Row Level Security (RLS) e storage |
| **Banco Local & Offline** | **sql.js** (WASM) + **better-sqlite3** | Banco SQLite executado direto no navegador ou Node.js para resiliência offline e execução de queries na Mini-IDE |
| **Inteligência Artificial** | **Google GenAI SDK** (`@google/genai` v2) | Integração com Gemini API para avaliação de redações, feedback analítico e geração de questões |
| **Editor de Código** | **Monaco Editor** (`@monaco-editor/react`) | Engine do VS Code no browser para a Mini-IDE Arena com highlight para SQL, Python, JS e Java |
| **Leitura de Documentos** | **pdfjs-dist** | Extração e parse de conteúdo programático de editais e cadernos de provas em PDF |
| **Mapeamento de Arquitetura** | **graphify** | Geração e sincronização contínua do grafo de dependências do código |
| **Qualidade & Linting** | **oxlint** (`.oxlintrc.json`) | Linter ultrarrápido baseado em Rust para React e TypeScript |
| **Testes Funcionais / E2E** | **Playwright** (`@playwright/test`) | Suíte de testes headless pontuais reutilizando o Chromium global da máquina |
| **Segurança & SAST** | **Semgrep + npm audit + RLS** | Análise estática de código e governança estrita de permissões de banco de dados |

> 🚫 **Regra de Estilização Zero-CSS em `src/`:**
> Qualquer import de arquivo `.css` (como `import './App.css'`) dentro de `src/` é **estritamente proibido**. Todas as propriedades visuais devem ser expressas como styled-components ou injetadas pelo `<GlobalStyle />`.

---

## 3. Comandos principais

| Comando | Descrição |
| ----- | ----- |
| `npm install` | Instala todas as dependências do projeto |
| `npm run dev` | Inicia o servidor de desenvolvimento Vite (`http://localhost:5173`) |
| `npm run build` | Valida tipagens com `tsc -b` e compila os bundles de produção na pasta `dist/` |
| `npm run preview` | Executa o servidor local de visualização da build de produção |
| `npm run lint` | Executa o linter oxlint para validação estática de TypeScript e React |
| `npx graphify` | Mapeia as dependências arquiteturais e atualiza o grafo de arquivos |
| `npx playwright test` | Executa a suíte de testes funcionais pontuais em modo headless |
| `npx playwright test --ui` | Executa os testes no modo interativo visual com timeline e DOM snapshot |
| `npm audit` | Varre as dependências do `package.json` em busca de vulnerabilidades conhecidas |
| `npx semgrep scan --config auto` | Executa análise estática SAST local contra XSS, injeções e vazamento de chaves |

---

## 4. Variáveis de ambiente

As variáveis de ambiente do client-side seguem o prefixo `VITE_` e são carregadas via `import.meta.env`.

* Arquivo local de desenvolvimento: `.env.local` (nunca commitado, presente no `.gitignore`).
* Arquivo de exemplo/documentação: `.env.example` (versionado no Git, sem valores reais).

| Variável | Utilidade | Exemplo |
| ----- | ----- | ----- |
| `VITE_SUPABASE_URL` | URL da instância do Supabase PostgreSQL | `https://tfsvfipsijtrzovbmmeq.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Chave pública anônima do Supabase (protegida por RLS) | `eyJhbGciOi...` |
| `VITE_ADMIN_USERNAME` | Nome de usuário com privilégio de admin mestre | `SirReinato` |
| `VITE_ADMIN_PASSWORD` | Senha administrativa mestre para validação local | `sua_senha_segura` |
| `VITE_GEMINI_API_KEY` | Chave de API da Google Gemini para correção de discursivas | `AIzaSy...` |

> ⚠️ **Princípio de Zero Segredos:** Variáveis prefixadas com `VITE_` são expostas publicamente no bundle JS final do navegador. **NUNCA** coloque tokens secretos com permissão `service_role` do Supabase ou chaves master irrestritas no client-side.

---

## 5. Estrutura de pastas e arquivos

```text
guiaDeEstudos/
├── 00-anything/                    # Diretório OBRIGATÓRIO para drafts, specs, relatórios EGM e testes
│   └── 01 - governanca agents 2026-11-12/ # Subpasta de isolamento por tarefa/implementação
├── AGENTS.md                       # Ponto de entrada e guia vivo para IAs e agentes (este arquivo)
├── CLAUDE.md, GEMINI.md            # Arquivos ponteiro apontando para AGENTS.md (Claude Code / Gemini CLI)
├── .github/copilot-instructions.md # Arquivo ponteiro apontando para AGENTS.md (GitHub Copilot)
├── README.md                       # Apresentação do projeto e instruções de uso
├── package.json                    # Dependências, scripts e metadados
├── package-lock.json               # Lockfile do npm
├── vite.config.ts                  # Configuração do Vite com plugin React
├── tsconfig.json                   # Configuração mestre do TypeScript
├── tsconfig.app.json               # Configurações de tipagem da aplicação
├── tsconfig.node.json              # Configurações de tipagem dos scripts Node/Vite
├── .oxlintrc.json                  # Regras e plugins de linting do Oxlint
├── .gitignore                      # Arquivos ignorados (node_modules, .env.local, dist, graphify-out)
├── .env.example                    # Template público de variáveis de ambiente
├── index.html                      # Ponto de entrada HTML da SPA
├── vercel.json                     # Configuração de rewrites para deploy SPA na Vercel
│
├── sqlite_schema.sql               # Schema SQLite local (espelho para Provas Feitas e fallbacks offline)
├── supabase_schema.sql             # Schema completo do banco de dados PostgreSQL no Supabase
├── supabase_profiles_and_admin.sql # Tabela profiles, trigger de novos usuários e RLS
├── supabase_provas_feitas.sql      # Tabela public.provas_feitas e policies RLS
├── supabase_fix_rls_and_recursion.sql # Correções de recursão infinita em policies de admin
├── supabase_create_admin.sql       # Script de provisionamento do usuário mestre SirReinato
│
├── public/                         # Assets estáticos servidos diretamente
└── src/
    ├── main.tsx                    # Bootstrap: ThemeProvider + GlobalStyle + App
    ├── App.tsx                     # Orquestrador mestre: AuthProvider, EditalProvider, Navbar e Abas
    │
    ├── assets/                     # Imagens e ícones vetoriais locais (hero.png, react.svg, vite.svg)
    │
    ├── theme/                      # Design System oficial e tokens visuais
    │   ├── theme.ts                # Objeto de tema (paleta café/marfim, tipografia, gradientes e componentes Stl)
    │   └── GlobalStyle.ts          # Reset CSS completo e fontes Google Fonts via createGlobalStyle
    │
    ├── types/                      # Definições de tipos e interfaces TypeScript
    │   ├── database.ts             # Entidades de negócio (UserProfile, Edital, Questao, Flashcard, ProvaFeita, etc.)
    │   ├── styled.d.ts             # Declaração de tipos para integração do styled-components com o tema
    │   └── sqljs.d.ts              # Definições de tipagem para o interpretador WebAssembly sql.js
    │
    ├── contexts/                   # React Contexts para gerenciamento de estado compartilhado
    │   ├── AuthContext.tsx         # Estado de autenticação Supabase, profile do usuário e logout
    │   └── EditalContext.tsx       # Edital ativo selecionado, lista de editais e alternância de foco
    │
    ├── components/                 # Componentes visuais dos módulos de estudo e navegação
    │   ├── AppNavbar.tsx           # Barra superior com branding, status da conexão, botão admin e logout
    │   ├── AuthModal.tsx           # Modal de login/cadastro de novos usuários
    │   ├── AdminPanel.tsx          # Painel de aprovação de contas de usuários (exclusivo SirReinato)
    │   ├── EditalSelectorBar.tsx   # Barra de seleção rápida do edital ativo
    │   ├── EditalManager.tsx       # Gestor completo de editais, disciplinas e tópicos com upload PDF
    │   ├── CicloEstudos3070.tsx    # Módulo de estudo teórico (30%) e resolução de questões comentadas (70%)
    │   ├── DailyStreakPlayer.tsx   # Player da dose diária de flashcards com algoritmo SM-2 e streak
    │   ├── FlashcardManager.tsx    # Gerenciador de cartões de memória por disciplina/tópico
    │   ├── MiniIDEArena.tsx        # Arena de desafios de código (SQL/Python/JS/Java) com Monaco Editor
    │   ├── RedacaoLaboratorio.tsx  # Oficina de discursivas com análise e pontuação via Gemini AI
    │   └── ProvaFeitaManager.tsx   # Registro de provas anteriores, gabaritos e cálculo de notas de corte
    │
    ├── services/                   # Camada de comunicação com APIs externas e persistência
    │   ├── supabase.ts             # Cliente singleton configurado do Supabase
    │   ├── geminiService.ts        # Integração com Google Gemini SDK para correção pedagógica de discursivas
    │   ├── editaisService.ts       # Operações CRUD de editais, disciplinas, tópicos e resumos
    │   ├── flashcardsService.ts    # Operações de flashcards, algoritmo SM-2 e daily streak
    │   ├── cicloEstudosService.ts  # Busca de teoria e questões do ciclo 30/70
    │   ├── desafiosCodigoService.ts# Busca e submissão de desafios de código
    │   ├── redacoesService.ts      # Busca de temas e envio de redações discursivas
    │   ├── provasFeitasService.ts  # Persistência de provas feitas no Supabase
    │   ├── provasFeitasSQLiteService.ts    # Persistência de provas feitas no SQLite local
    │   └── provasFeitasLocalStorageService.ts # Fallback de emergência em localStorage
    │
    ├── lib/                        # Utilitários de baixo nível e provedores de engine
    │   ├── sqlite.ts               # Inicialização da base SQLite in-memory com sql.js
    │   └── sqliteProvider.tsx      # Provider React para disponibilizar a conexão SQLite na árvore de componentes
    │
    └── utils/                      # Funções utilitárias puras
        ├── codeValidator.ts        # Validador de sintaxe e regras de desafio de código
        ├── pdfExtractor.ts         # Extrator de texto e tópicos a partir de PDFs de editais
        └── sm2.ts                  # Implementação matemática pura do algoritmo SuperMemo-2 (SM-2)
```

### 5.1 Arquivos Ponteiro Multi-IA (Zero Duplicação de Regras)
Para garantir coerência imediata entre diferentes ferramentas de IA sem redundância:

* **`CLAUDE.md`** (Claude Code / Claude Desktop):
  ```markdown
  > Consulte integralmente as diretrizes arquiteturais, stack técnica, regras operacionais e convenções em [AGENTS.md](./AGENTS.md).
  ```
* **`GEMINI.md`** (Gemini CLI / Code Assist):
  ```markdown
  > Consulte integralmente as diretrizes arquiteturais, stack técnica, regras operacionais e convenções em [AGENTS.md](./AGENTS.md).
  ```
* **`.github/copilot-instructions.md`** (GitHub Copilot Chat):
  ```markdown
  > Consulte integralmente as diretrizes arquiteturais, stack técnica, regras operacionais e convenções em [AGENTS.md](../../AGENTS.md).
  ```

### 5.2 Estrutura Padronizada de Cores e Estilos (`src/theme/theme.ts`)
O projeto utiliza um design system de alto contraste baseado em 4 cores fundamentais e tipografia formal:

* **Paleta Nobre de Alto Rendimento**:
  - `preto`: `#000000` (fundo mais externo da aplicação).
  - `cafeProfundo`: `#1F150C` (fundo de cards, flashcards e modais).
  - `ambarQueimado`: `#412D15` (superfícies de destaque, headers e barras de ferramentas).
  - `marfim`: `#E1DCC9` (textos principais e fundos invertidos de leitura).
* **Tipografia**:
  - `titulos`: `'Aldrich', sans-serif` (títulos imponentes e modernos).
  - `paragrafos`: `'Almarai', sans-serif` (leitura densa e confortável).
  - `codigo`: `'JetBrains Mono', 'Fira Code', monospace` (para a Mini-IDE e snippets).
* **Gradientes Oficiais**:
  - `btnPrimario`: `linear-gradient(135deg, #412D15 0%, #1F150C 100%)`
  - `btnPrimarioHover`: `linear-gradient(135deg, #593D1E 0%, #2A1D11 100%)`
  - `btnSecundario`: `linear-gradient(135deg, #1F150C 0%, #000000 100%)`
  - `destaqueHorizontal`: `linear-gradient(90deg, #1F150C 0%, #412D15 50%, #E1DCC9 100%)`
* **Componentes Base Exportados pelo Tema (Sufixo `Stl`)**:
  `TitulosPrincipaisStl`, `TitulosSecundariosStl`, `ParagrafosStl`, `CardStl`, `GlassCardStl`, `PillBadgeStl`, `BotaoPrimarioStl`, `BotaoSecundarioStl`.

---

## 6. Arquitetura e fluxo de dados

O ciclo de vida da interface e da injeção de dependências segue a seguinte estrutura hierárquica:

```text
main.tsx
  └─ ThemeProvider (injeta theme.ts)
       └─ GlobalStyle (aplica reset CSS global e fontes Aldrich/Almarai via styled-components)
            └─ App
                 └─ AuthProvider (gerencia sessão Supabase, JWT e perfil do usuário)
                      └─ EditalProvider (armazena lista de editais e o editalAtivo)
                           └─ AppLayoutStl
                                ├─ AppNavbar (status online, alternância de admin e logout)
                                └─ MainContentWrapperStl
                                     ├─ AdminPanel (exibido apenas se usuário for admin e toggle ativo)
                                     ├─ Avisos de Bloqueio (se status = 'pending' ou 'rejected')
                                     └─ [Área de Estudos Liberada]
                                          ├─ EditalSelectorBar (seletor de edital foco)
                                          ├─ NavegacaoSegmentadaContainerStl (Tabs segmentadas)
                                          └─ Módulo Ativo:
                                               ├─ RedacaoLaboratorio (Oficina de Discursivas + Gemini)
                                               ├─ MiniIDEArena (Desafios Monaco Editor + sql.js)
                                               ├─ CicloEstudos3070 (Teoria Markdown + Questões comentadas)
                                               ├─ DailyStreakPlayer (Dose Diária Flashcards SM-2)
                                               ├─ FlashcardManager (Gestão e edição de cards)
                                               ├─ EditalManager (Disciplinas, tópicos e upload de editais)
                                               └─ ProvaFeitaManager (Registro de provas e cálculo de corte)
```

### Princípios de Responsabilidade:
1. **Componentes/Telas**: Focam na interface, captura de eventos e feedback visual ao estudante. Todos usam styled-components com sufixo `Stl`.
2. **Contexts (`contexts/`)**:
   - `AuthContext`: Mantém o estado reativo da sessão, perfil e papéis (`admin`/`user`).
   - `EditalContext`: Mantém a sincronização do edital ativo em toda a aplicação.
3. **Services (`services/`)**: Centralizam todas as operações de banco de dados (Supabase / SQLite) e chamadas a LLM (Gemini), com tratamento consistente de erros e tipagem estrita.
4. **Utils / Lib (`utils/` e `lib/`)**: Contêm algoritmos determinísticos e desacoplados de interface (ex.: `sm2.ts`, `pdfExtractor.ts`, `codeValidator.ts`).

---

## 7. Modelo de dados e estado

O modelo de dados suporta tanto o PostgreSQL no Supabase quanto réplicas/tabelas locais em SQLite (`sql.js`).

### Entidades principais (definidas em `src/types/database.ts`):

| Entidade | Tabela Supabase | Descrição |
| ----- | ----- | ----- |
| **`UserProfile`** | `public.profiles` | Perfil do estudante (`username`, `role`: `'admin' \| 'user'`, `status`: `'active' \| 'pending' \| 'rejected'`). |
| **`Edital`** | `public.editais` | Edital cadastrado (`titulo`, `banca`, `orgao`, `ano`, `arquivo_edital_url`). |
| **`Disciplina`** | `public.disciplinas` | Matéria vinculada a um edital (ex: "Banco de Dados", "Engenharia de Software"). |
| **`Topico`** | `public.topicos` | Assunto específico com `relevancia_banca` (1 a 5 estrelas). |
| **`TeoriaResumo`** | `public.teoria_resumos` | Resumo teórico objetivo em Markdown (Ciclo 30%). |
| **`Questao`** | `public.questoes` | Questões comentadas de concurso (`multipla_escolha` ou `certo_errado`), com gabarito e explicação detalhada. |
| **`Flashcard`** | `public.flashcards` | Cartão de memorização com parâmetros do algoritmo SM-2 (`intervalo_dias`, `fator_facilidade`, `repeticoes`, `proxima_revisao`). |
| **`DesafioCodigo`** | `public.desafios_codigo` | Desafio de programação para a Mini-IDE (`sql`, `python`, `javascript`, `java`) com solução esperada. |
| **`TemaRedacao`** | `public.temas_redacao` | Tema de redação discursiva/estudo de caso com limite de linhas e padrão de resposta oficial. |
| **`DailyStreak`** | `public.daily_streak` | Registro de constância diária do usuário (`cards_revisados`, `questoes_resolvidas`, `streak_dias`). |
| **`ProvaFeita`** | `public.provas_feitas` | Simulado ou prova real com cálculo de pesos gerais/objetivos, nota de corte e gabaritos preliminar/definitivo. |

---

## 8. Regras de negócio

1. **Ciclo de Estudos 30/70**:
   - Todo tópico de estudo divide o tempo em **30% Teoria Direcionada** (leitura rápida em Markdown sem prolixidade) e **70% Resolução de Questões Práticas** comentadas.
   - A interface do `CicloEstudos3070.tsx` deve sempre apresentar o progresso claro entre teoria concluída e taxa de acerto nas questões.
2. **Algoritmo de Repetição Espaçada SM-2 (`sm2.ts`)**:
   - Respostas aos flashcards utilizam 4 níveis de qualidade: `0` (Errei total), `3` (Difícil), `4` (Bom), `5` (Fácil).
   - O fator de facilidade inicial é `2.5`. Ele nunca pode decair abaixo de `1.3`.
   - Se a qualidade for menor que `3`, o contador de repetições reseta para `0` e o intervalo volta para `1 dia`.
3. **Avaliação Automatizada de Redação com Google Gemini (`geminiService.ts`)**:
   - A correção avalia o texto do estudante comparando-o rigorosamente com o `padrao_resposta` do tema e os critérios da banca examinadora (conteúdo técnico, clareza, coesão, gramática e obediência ao limite de linhas).
   - A resposta da IA deve retornar notas pontuadas por critério, pontos fortes, oportunidades de melhoria e nota final estimada.
4. **Execução Segura na Mini-IDE Arena**:
   - Queries SQL são executadas localmente em memória via `sql.js` (WebAssembly), sem permissão para executar comandos que afetem o banco real de dados da aplicação.
   - Código Python/JS/Java é submetido à validação de sintaxe e constraints locais via `codeValidator.ts`.
5. **Cálculo Ponderado de Provas Feitas (`ProvaFeitaManager.tsx`)**:
   - O cálculo da nota final considera:
     $$\text{Nota Final} = \frac{(\text{Acertos Gerais} \times \text{Peso Geral}) + (\text{Acertos Objetivos} \times \text{Peso Objetivo})}{\text{Peso Total}}$$
   - A prova é considerada aprovada se a nota final for maior ou igual à `nota_corte` configurada e atingir os mínimos exigidos em cada bloco.
6. **Governança de Perfis e Aprovação de Usuários**:
   - O usuário com username `SirReinato` possui autoridade suprema e papel `admin`.
   - Novos usuários criados pelo `AuthModal.tsx` entram com status `pending` e só conseguem acessar a área de estudos após aprovação explícita pelo administrador no `AdminPanel.tsx`.

---

## 9. Convenções de código e boas práticas

* **Nomenclatura Obrigatória de Styled-Components (Sufixo `Stl`)**:
  * **REGRA ESTRITA:** Todo e qualquer componente criado com styled-components DEVE obrigatoriamente terminar com o sufixo `Stl`.
  * **Exemplos válidos no projeto:**
    ```typescript
    export const AppLayoutStl = styled.div`...`;
    export const TabBotaoStl = styled.button<{ $ativa: boolean }>`...`;
    export const CardStl = styled.div<{ $destaque?: boolean }>`...`;
    export const NavegacaoSegmentadaContainerStl = styled.nav`...`;
    ```
  * **Proibido:** Declarar styled-components sem o sufixo `Stl` (como `const Container = styled.div`).
* **Props Transitórias (`$` prefix)**:
  * Todas as props customizadas passadas para styled-components para controle de estado visual DEVEM ser prefixadas com `$` (ex.: `$ativa`, `$fundoInvertido`, `$variante`, `$destaque`) para impedir vazamento de atributos para o DOM HTML.
* **Tipagem Estrita em TypeScript**:
  * Evite `any`. Todas as estruturas de dados de bancos e serviços devem usar interfaces de `src/types/database.ts`.
* **Zero CSS em `src/`**:
  * Nunca importe arquivos `.css` ou crie módulos CSS em `src/`. Todo estilo deve utilizar `styled-components` consumindo `theme.ts`.
* **Git e Commits Semânticos**:
  * Utilize Conventional Commits (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`, `sec:`).
  * Sempre crie uma branch dedicada (`feature/...` ou `fix/...`) e realize o push ao repositório remoto.

---

## 10. Estratégia de Testes Funcionais & E2E (Playwright Inteligente)

Para garantir máxima estabilidade dos fluxos críticos sem sobrecarregar o desenvolvimento, o projeto adota **testes funcionais inteligentes** com Playwright.

### 1. Detecção Dinâmica da Máquina Atual
O agente deve verificar o ambiente local para reutilizar os navegadores já instalados globalmente, evitando downloads redundantes de binários pesados:

| Parâmetro | Detecção da Máquina Atual |
| :--- | :--- |
| **Sistema Operacional Detectado** | Windows 11 (PowerShell) |
| **Caminho de Navegadores (`PLAYWRIGHT_BROWSERS_PATH`)** | `C:\Users\renato.lima\AppData\Local\ms-playwright` |
| **Binários de Navegador Detectados** | `chromium-1248`, `chromium-1254`, `chromium_headless_shell-1248`, `chromium_headless_shell-1254`, `ffmpeg-1013`, `winldd-1007` |
| **Reutilização Global Ativa** | Sim (não requer downloads pesados no `node_modules`) |

### 2. Matriz de Decisão: Quando Rodar Testes Funcionais

* ❌ **NÃO criar testes para:**
  - Ajustes visuais cosméticos de espaçamento ou cores em componentes `Stl`.
  - Correção de textos estáticos ou pequenos ajustes de labels.
*  **É OBRIGATÓRIO criar ou executar testes quando:**
  1. Alterar fluxos de autenticação, login e bloqueio de usuários pendentes (`AuthContext`, `AuthModal`, `AdminPanel`).
  2. Adicionar ou alterar regras de navegação entre as abas centrais do `App.tsx`.
  3. Modificar o algoritmo de persistência de Provas Feitas ou cálculo de notas de corte.
  4. Alterar os serviços centrais de integração com Supabase ou execução no Monaco Editor / `sql.js`.

---

## 11. Estratégia de Segurança (SAST, RLS & Proteção de Contexto)

1. **Supabase Row Level Security (RLS)**:
   - Todas as tabelas públicas (`editais`, `disciplinas`, `topicos`, `questoes`, `flashcards`, `provas_feitas`, `profiles`) possuem RLS ativado nos scripts SQL.
   - Usuários comuns só podem visualizar e alterar dados vinculados ao seu próprio `user_id`.
   - Apenas o perfil administrador (`SirReinato`) tem privilégio de atualizar o status de outros usuários em `public.profiles`.
2. **Proteção de Tokens e Chaves de API**:
   - A chave `VITE_GEMINI_API_KEY` deve ser mantida protegida em ambiente local. Caso o projeto seja publicado para múltiplos usuários externos, a chamada à API Gemini deve ser delegada a uma Edge Function serverless no Supabase para não expor a chave no frontend.
   - Nunca comite `.env.local` ou chaves com papel `service_role`.
3. **Prevenção contra XSS e Injeções**:
   - É proibido o uso de `dangerouslySetInnerHTML` sem prévia sanitização via biblioteca comprovada (ex.: DOMPurify).
   - O interpretador `sql.js` na Mini-IDE roda de forma isolada em WebAssembly no client, garantindo que queries submetidas por estudantes não tenham acesso à rede ou a outros contextos do navegador.
4. **Auditoria Contínua**:
   - Execute `npm audit` ao adicionar novas bibliotecas no `package.json`.
   - Execute `npx semgrep scan --config auto` sempre que novas integrações ou formulários complexos forem criados.

---

## 12. Cuidados e armadilhas comuns

1. **Esquecer o sufixo `Stl`**: Todo styled-component deve terminar com `Stl` (ex: `AppLayoutStl`, `BotaoPrimarioStl`). Componentes sem esse sufixo ferem o padrão arquitetural.
2. **Injeção de CSS cru**: Nunca crie arquivos `.css` dentro de `src/`. Utilize exclusivamente styled-components e o tema oficial.
3. **Desenvolver direto na branch `main`**: Crie sempre uma branch temática (`feature/...` ou `fix/...`) antes de alterar qualquer código.
4. **Vazamento de props no DOM**: Use props com prefixo `$` (ex: `$ativa`, `$destaque`) em styled-components para não gerar avisos de atributos inválidos no HTML.
5. **Esquecer de atualizar o AGENTS.md e o graphify**: Finalizar qualquer tarefa estrutural sem atualizar este arquivo e rodar o `graphify` invalida a tarefa.
6. **Arquivos soltos na raiz**: Nunca salve rascunhos, scripts avulsos ou relatórios na raiz. Use sempre subpastas em `00-anything/{sequencial} - {nome} {data}/`.
7. **Quebrar a persistência offline/online**: Ao alterar serviços de dados, certifique-se de que a camada de fallback (Supabase <-> SQLite/localStorage) continue funcional quando não houver conexão ativa.

---

## 13. Checklist para agentes ao finalizar uma tarefa

Antes de considerar qualquer tarefa concluída, o agente DEVE verificar e marcar os itens abaixo:

* [ ] **Branch dedicada utilizada**: O trabalho foi executado em uma branch dedicada (`feature/...` ou `fix/...`) e enviado ao remoto (`git push -u origin <branch>`), nunca direto na `main`.
* [ ] **Isolamento de artefatos na raiz**: Nenhum rascunho, relatório EGM ou teste temporário solto na raiz (todos alocados dentro de `00-anything/{sequencial} - {nome} {data}/`).
* [ ] **Fidelidade ao domínio do projeto**: Nenhuma criação de funcionalidades desvirtuadas do escopo de Guia de Estudos e Certificações de TI.
* [ ] **Sufixo `Stl` em 100% dos styled-components**: Todos os styled-components criados ou alterados terminam obrigatoriamente com o sufixo `Stl`.
* [ ] **Zero CSS em `src/`**: Nenhum arquivo `.css` foi criado ou importado dentro de `src/`.
* [ ] **Consistência de Tema**: Cores, fontes (Aldrich, Almarai, JetBrains Mono) e gradientes consumidos de `src/theme/theme.ts`.
* [ ] **Tipagem TypeScript íntegra**: Nenhuma violação grave de tipo ou uso desnecessário de `any`; interfaces atualizadas em `src/types/database.ts` quando aplicável.
* [ ] **Lint executado**: `npm run lint` ou `npx oxlint` sem erros impeditivos de sintaxe ou hooks.
* [ ] **Sincronização com o `graphify` realizada**: Mapa de dependências arquiteturais atualizado em conjunto com o `AGENTS.md`.
* [ ] **Testes funcionais verificados**: Playwright executado (`npx playwright test`) caso a alteração afete autenticação, navegação principal ou persistência.
* [ ] **Auditoria de segurança e dependências**: Zero segredos ou credenciais expostas em arquivos de código; `npm audit` limpo se novas dependências foram adicionadas.
* [ ] **Árvore de arquivos e histórico atualizados**: A Seção 5 e o Histórico de Alterações deste `AGENTS.md` refletem fielmente as mudanças implementadas.

---

## 📜 Histórico de alterações deste arquivo

| Data | Responsável | Alteração Realizada |
| ----- | ----- | ----- |
| 2026-11-03 | Agente IA | Criação inicial do modelo base universal `AGENTS.md` (regras mandatórias de Git, atualização contínua e styled-components). |
| 2026-11-04 | Agente IA | Inclusão de decomposição em issues (Linear MCP), Seção 10 de Playwright Inteligente e Seção 11 de Análise de Segurança SAST. |
| 2026-11-07 | Agente IA | Adição das regras obrigatórias de isolamento em `00-anything/`, sufixo `Stl`, sincronização obrigatória com `graphify` e orquestração de comandos dev. |
| 2026-11-12 | Agente IA | **Adaptação completa do `AGENTS.md` para a realidade do projeto `guiaDeEstudos`**: mapeamento da stack técnica (React 19, TypeScript, Supabase, SQLite/sql.js, Google Gemini GenAI SDK, Monaco Editor, pdfjs-dist), documentação de todos os 7 módulos centrais de estudo, schemas SQL (PostgreSQL Supabase e SQLite), modelo de dados (`src/types/database.ts`), regras de negócio (Ciclo 30/70, SM-2, Gemini Redações, Mini-IDE e Provas Feitas), paleta temática nobre e detecção do ambiente local Windows 11. |
