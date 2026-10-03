# Relatório Individual de Contribuição — Sprint 2 — Pedro Villela

**Papel nesta sprint:** Desenvolvedor Backend / Garantia da Qualidade (QA)

---

## 1. O que fiz
| Item | PR/commit | Status |
|---|---|---|
| Configuração do ambiente de testes automatizados no backend (Jest + Supertest) | PR #12 | Mergeado |
| Criação de testes unitários e de integração para autenticação e bloqueio de perfis (`auth.test.js` - CT01, CT02) | PR #14 | Mergeado |
| Implementação de tratamento de erros e testes para rejeição de estoque negativo e logs (`insumo.test.js` - CT04, CT08) | PR #16 | Mergeado |
| Criação de testes para regras de negócio críticas, como bloqueio de agendamento sem estoque e conflitos de canteiro (`tarefa.test.js` - CT09, CT10) | PR #18 | Mergeado |
| Implementação de testes para fluxos de culturas, plantios, dashboards e fluxo E2E completo (`cultura.test.js`, `plantio.test.js`, `dashboard.test.js`, `fluxo.e2e.test.js`) | PR #19 | Mergeado |

## 2. Rituais que participei
- [x] Dailies/weeklies (4 de 4)
- [x] Sprint Review
- [x] Retrospectiva

## 3. PRs de colegas que revisei
| PR | Autor | Comentário resumido |
|---|---|---|
| #15 (Baixa de Insumos - Backend) | [Nome do Colega] | Solicitei a inclusão de validação estrita para impedir que quantidades nulas afetassem o cálculo do estoque mínimo. |
| #20 (Dashboard de Produção) | [Nome do Colega] | Sugeri ajustes na query para otimizar o agrupamento por canteiros e culturas. |

## 4. Dificuldades e o que aprendi
# Relatório Individual de Contribuição — Sprint 2 — Pedro Villela

**Papel nesta sprint:** Desenvolvedor Backend / Garantia da Qualidade (QA)

---

## 1. O que fiz
| Item | PR/commit | Status |
|---|---|---|
| Configuração do ambiente de testes automatizados no backend (Jest + Supertest) | PR #12 | Mergeado |
| Criação de testes unitários e de integração para autenticação e bloqueio de perfis (`auth.test.js` - CT01, CT02) | PR #14 | Mergeado |
| Implementação de tratamento de erros e testes para rejeição de estoque negativo e logs (`insumo.test.js` - CT04, CT08) | PR #16 | Mergeado |
| Criação de testes para regras de negócio críticas, como bloqueio de agendamento sem estoque e conflitos de canteiro (`tarefa.test.js` - CT09, CT10) | PR #18 | Mergeado |
| Implementação de testes para fluxos de culturas, plantios, dashboards e fluxo E2E completo (`cultura.test.js`, `plantio.test.js`, `dashboard.test.js`, `fluxo.e2e.test.js`) | PR #19 | Mergeado |

## 2. Rituais que participei
- [x] Dailies/weeklies (4 de 4)
- [x] Sprint Review
- [x] Retrospectiva

## 3. PRs de colegas que revisei
| PR | Autor | Comentário resumido |
|---|---|---|
| #15 (Baixa de Insumos - Backend) | [Nome do Colega] | Solicitei a inclusão de validação estrita para impedir que quantidades nulas afetassem o cálculo do estoque mínimo. |
| #20 (Dashboard de Produção) | [Nome do Colega] | Sugeri ajustes na query para otimizar o agrupamento por canteiros e culturas. |

## 4. Dificuldades e o que aprendi
Nesta sprint, o principal desafio foi estruturar a base de testes automatizados do zero utilizando Jest e Supertest, lidando com a resolução de caminhos de módulos e a importação correta do servidor Express. Aprendi a implementar testes de integração eficientes criando utilitários de simulação de tokens JWT (`testHelpers.js`), além de utilizar mocks para espionar e validar o comportamento do sistema no tratamento de erros críticos e geração de logs em regras de negócio sensíveis (como controle de estoque e conflitos de agendamento de canteiros).
