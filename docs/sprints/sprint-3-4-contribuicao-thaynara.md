# Relatório Individual de Contribuição — Sprints 3 e 4 — Thaynara Franco (RA 2840482423001)

**Papel nesta sprint:** Qualidade / Integração Full Stack (Backend, Testes Automatizados e Integração Frontend)

## 1. O que fiz

| Item | PR/commit | Status |
|---|---|---|
| Correção crítica de autenticação no login (`await bcrypt.compare`) e liberação de CORS na API Express (`app.js`) | `3a0f31d` / PR #3 (`49e701b`) | Concluído |
| Complemento das rotas de Plantios e Tarefas (`GET` detalhado com insumos utilizados, `POST /api/plantios/:id/insumos`, `POST /api/tarefas/:id/insumos`, validação de horários e conflitos de canteiro/ferramenta — Histórias #9, #10 e #11) | `f369bf9` / PR #3 (`49e701b`) | Concluído |
| Tratamento de integridade referencial na exclusão de usuários (`23503`), validação de datas reais no calendário (`validacao.js` / `erros.js`) e arredondamento de indicadores no Dashboard (`dashboardRoutes.js` — Histórias #12 e #13) | `c3bd993` / PR #3 (`49e701b`) | Concluído |
| Reestruturação completa da suíte de testes automatizados com Jest + Supertest (`auth.test.js`, `cultura.test.js`, `insumo.test.js`, `plantio.test.js`, `tarefa.test.js`, `tarefa-complemento.test.js`, `dashboard.test.js`, `fluxo.e2e.test.js`) cobrindo os casos `CT01` a `CT15` das 14 Histórias de Usuário em execução sequencial (`--runInBand`) | `70edbfb` / `10787f4` / PR #3 (`49e701b`) | Concluído |
| Atualização e alinhamento da documentação técnica (`docs/der.md`, `docs/uml.md`, `docs/plano-de-testes.md`, `README.md` e evidências de teste) com o schema oficial do banco (`database/schema.sql`) | `94bd23f` / PR #3 (`49e701b`) | Concluído |
| Criação do cliente HTTP centralizado (`frontend/src/services/api.js`) com envio automático de token JWT (`Authorization: Bearer`) e proteção de rotas por perfil (`RotaProtegida` — `ADMIN` e `OPERACIONAL`) em `App.jsx` | `75aa43f` / `2c25476` | Concluído |
| Integração completa de todas as páginas do Frontend React + Vite com a API REST e banco PostgreSQL (`Login`, `Cadastro`, `Dashboard`, `Culturas`, `Canteiros`, `Insumos`, `Plantios`, `Tarefas`, `MinhasTarefas`, `Colheitas`, `Producao`, `Movimentacoes`, `Relatorios` e nova tela de `Usuarios`), substituindo o uso estático de `localStorage` | `71e8578` / `c9e87dc` / `2c25476` | Concluído |
| Padronização de boas práticas no Frontend (correção de regras do ESLint, validação de build de produção com Vite, melhoria no script `seed-db.js` e atualização do `frontend/README.md`) | `c9e87dc` / `2c25476` | Concluído |

## 2. Rituais que participei
- [x] Dailies/weeklies
- [x] Sprint Review
- [x] Retrospectiva

## 3. PRs de colegas que revisei

| PR | Autor | Comentário resumido |
|---|---|---|
| Branch `feature/frontend-inicial` (`d828ba1` / `3b34a49` / `2e77162`) | Equipe Frontend (Adriana Martelli) | Revisão de código e integração do protótipo React: alinhamento dos nomes de atributos (`snake_case`) e status (`CRESCIMENTO`/`COLHIDO`/`PERDIDO` e `PENDENTE`/`AGUARDANDO_APROVACAO`/`CONCLUIDA`/`CANCELADA`) com o banco PostgreSQL, correção do fluxo de navegação do menu lateral entre `ADMIN` e `OPERACIONAL` e conexão real com os endpoints da API. |
| Commits de Backend da Sprint 4 (`dashboardRoutes.js`, `tarefaRoutes.js` e migrations da História #14) | Equipe Backend (Wilson Lau / Pedro Villela) | Revisão das rotas de produção, resumo de estoque e aprovação excepcional de insumos, adicionando cobertura de testes automatizados (`CT13`, `CT14`, `CT15`) e integrando o botão de aprovação excepcional na interface de Tarefas. |

## 4. Dificuldades e o que aprendi

Durante as Sprints 3 e 4, um dos principais desafios foi garantir que todas as camadas do projeto (Banco de Dados PostgreSQL, API Backend em Node.js/Express, Suíte de Testes Automatizados e Frontend em React + Vite) conversassem sem divergências de nomes de campos, status ou regras de negócio.

Na etapa de testes e backend, identifiquei e corrigi problemas sutis, como a falta de `await` na comparação assíncrona de senha com `bcrypt.compare`, o bloqueio de requisições do navegador por falta de cabeçalhos CORS e a concorrência entre arquivos de teste no Jest ao acessar o mesmo banco de dados (resolvida com `--runInBand` e ajustes nos testes de integração para refletir fielmente o `schema.sql`).

Na integração do Frontend com o Backend, o maior desafio foi substituir o protótipo baseado em `localStorage` por chamadas reais à API autenticadas via JWT, adaptando os formulários e tabelas para respeitar as restrições (`CHECK` e chaves estrangeiras) do banco de dados, implementar o fluxo de aprovação excepcional de estoque (História #14) na tela de Tarefas e garantir que o controle de acesso por perfil (`ADMIN` vs. `OPERACIONAL`) funcionasse sem falhas de navegação.

Além disso, enfrentei e resolvi conflitos de merge entre branches no Git e GitHub (`correcoes`, `main` e `feature/frontend-inicial`), o que consolidou na prática meu aprendizado sobre fluxo de branches, Pull Requests, resolução de conflitos, testes de integração com Supertest e desenvolvimento Full Stack com React, Express e PostgreSQL.
