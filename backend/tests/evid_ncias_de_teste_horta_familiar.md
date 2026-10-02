# Evidências de Teste — Sprint 1 — Horta Familiar

| ID | Caso de teste | Tipo | Resultado | Evidência |
|---|---|---|---|---|
| CT01 | Login com dados válidos retorna acesso e funcionalidades do perfil | Integração | Passou | `backend/tests/auth.integration.test.js`, CI run #12 |
| CT02 | Usuário tenta acessar funcionalidade não permitida ao seu perfil | Unitário | Passou | `backend/tests/auth.test.js`, CI run #12 |
| CT03 | Administrador cadastra uma cultura com dados válidos | Unitário | Passou | `backend/tests/cultura.test.js`, CI run #14 |
| CT04 | Canteiro e insumo com dados inválidos (estoque negativo) rejeitado | Unitário + integração | Passou (após correção) | Falhou na 1ª execução (validação de estoque no DB); corrigido no PR #5. CI run #18 |
| CT05 | Administrador registra um plantio validando cultura e canteiro | Integração | Passou | `backend/tests/plantio.integration.test.js`, CI run #19 |
| CT06 | Administrador cria e atribui uma tarefa a um membro | Unitário | Passou | `backend/tests/tarefa.test.js`, CI run #21 |
| CT07 | Membro visualiza e conclui sua própria tarefa | Integração | Passou | `backend/tests/tarefa.integration.test.js`, CI run #21 |
| CT08 | Administrador registra utilização de insumo com estoque suficiente | Unitário | Passou | `backend/tests/estoque.test.js`, CI run #22 |
| CT09 | Sistema bloqueia agendamento de tarefa sem estoque suficiente | Unitário + integração | Passou | `backend/tests/tarefa.integration.test.js`, CI run #24 |
| CT10 | Sistema bloqueia agendamento de tarefas conflitantes no mesmo canteiro | Unitário | Passou (após correção) | Falhou na 1ª execução (sobreposição de horários não travava); corrigido no PR #8. CI run #27 |
| CT11 | Administrador consulta o dashboard de produção | Manual/aceitação | Passou | Testado via Navegador + ApiDog. Aprovado pelo QA. |
| CT12 | Administrador consulta o resumo do estoque e alertas | Manual/aceitação | Passou | Testado via Navegador. Aprovado pelo QA. |
| CT13 | Execução do fluxo principal do sistema sem inconsistências | Manual/aceitação | Passou | Validado no ambiente de staging. |
| CT14 | Alteração e atualização de alertas de estoque após utilização | Integração | Passou | `backend/tests/estoque.integration.test.js`, CI run #28 |
| — | Tratamento de erro 400 (Bad Request) padronizado para entradas inválidas | Unitário | Passou | `backend/tests/errorHandler.test.js`, CI run #30 |
| — | Registro de logs em operações críticas e tentativas de acesso negado | Integração | Passou | `backend/tests/logger.integration.test.js`, CI run #30 |

## Cobertura automatizada nesta sprint
CI (GitHub Actions) reporta 24 testes, 100% passando, cobertura de 68% nos módulos de autenticação, gestão de usuários, controle de estoque (insumos) e agendamento de tarefas (ainda não cobre exportação de relatórios e notificações por e-mail, que entram na Sprint 2).