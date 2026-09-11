# Plano de Testes — Horta Familiar

## 1. Estratégia

O plano de testes tem como objetivo verificar o funcionamento das principais funcionalidades do sistema Horta Familiar, com foco nas regras de negócio, validações e integração entre aplicação e banco de dados.

Os testes serão realizados de forma progressiva ao longo das sprints, priorizando as funcionalidades essenciais do MVP.

| Tipo de teste    | O que cobre                                                                     | Ferramenta                                      | Quando roda                                      |
| ---------------- | ------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------ |
| Unitário         | Regras de negócio e validações do backend                                        | Jest                                            | Durante o desenvolvimento de cada funcionalidade |
| Integração       | Comunicação entre API, backend e banco de dados | Jest + Supertest + PostgreSQL | Após a implementação das funcionalidades        |
| Manual/aceitação | Fluxos principais do sistema e comportamento apresentado ao usuário             | Navegador + ApiDog                              | Ao final de cada sprint e antes da entrega       |

Os testes serão priorizados de acordo com o impacto da funcionalidade no funcionamento do sistema. Regras relacionadas a **autenticação, permissões, estoque, conflitos de recursos e integridade dos dados** terão maior prioridade.

## 2. Critério de bloqueio de merge

Um merge não deverá ser realizado quando:

* algum teste unitário ou de integração existente apresentar falha;
* uma regra de negócio crítica estiver funcionando de forma incorreta;
* houver possibilidade de estoque negativo;
* o sistema permitir o agendamento de uma tarefa sem estoque suficiente, quando a regra exigir bloqueio;
* o sistema permitir conflito de uso do mesmo canteiro no mesmo período;
* um usuário conseguir acessar funcionalidades que não pertencem ao seu perfil;
* uma funcionalidade essencial do MVP deixar de funcionar após uma alteração.

Falhas em funcionalidades secundárias ou melhorias não essenciais ao MVP poderão ser registradas para correção posterior, desde que não comprometam as funcionalidades principais.

## 3. Casos de teste planejados (cresce a cada sprint)

| ID   | História (E2) | Cenário                                                            | Entrada                                                        | Resultado esperado                                                                                                         | Prioridade |
| ---- | ------------- | ------------------------------------------------------------------ | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------- |
| CT01 | #1            | Usuário realiza login com dados válidos                            | E-mail e senha cadastrados                                     | Sistema autentica o usuário e apresenta as funcionalidades correspondentes ao seu perfil                                   | Alta       |
| CT02 | #1            | Usuário tenta acessar funcionalidade não permitida ao seu perfil   | Usuário OPERACIONAL acessando função exclusiva do ADMIN        | Acesso é bloqueado                                                                                                         | Alta       |
| CT03 | #2            | Administrador cadastra uma cultura                                 | Nome, tempo de maturação e espaçamento válidos                 | Cultura é cadastrada corretamente                                                                                          | Média      |
| CT04 | #3 e #4       | Administrador cadastra canteiro e insumo com dados inválidos       | Identificação duplicada ou quantidade de estoque negativa      | Sistema rejeita o cadastro e informa o problema                                                                            | Alta       |
| CT05 | #5            | Administrador registra um plantio                                  | Cultura e canteiro existentes, data e status válidos           | Plantio é registrado e relacionado corretamente à cultura e ao canteiro                                                    | Média      |
| CT06 | #6            | Administrador cria e atribui uma tarefa                            | Descrição, data, horário, canteiro e usuário válidos           | Tarefa é criada e atribuída ao membro selecionado                                                                          | Alta       |
| CT07 | #7 e #8       | Membro visualiza e conclui sua própria tarefa                      | Usuário autenticado com tarefa atribuída                       | Apenas suas tarefas são exibidas e a conclusão registra a tarefa como concluída                                            | Alta       |
| CT08 | #9            | Administrador registra utilização de insumo com estoque suficiente | Insumo e quantidade válida                                     | Utilização é registrada e o estoque é reduzido corretamente                                                                | Alta       |
| CT09 | #10           | Sistema tenta agendar tarefa sem estoque suficiente                | Insumo com quantidade inferior à necessária                    | Agendamento é bloqueado e o sistema informa a insuficiência de estoque                                                     | Alta       |
| CT10 | #11           | Sistema tenta agendar tarefas conflitantes no mesmo canteiro       | Duas tarefas para o mesmo canteiro e horário sobreposto        | Segunda tarefa é bloqueada e o conflito é informado                                                                        | Alta       |
| CT11 | #12           | Administrador consulta o dashboard de produção                     | Plantios e colheitas cadastrados                               | Dashboard apresenta os dados agrupados corretamente por cultura e canteiro                                                 | Média      |
| CT12 | #13           | Administrador consulta o resumo do estoque                         | Insumos com diferentes níveis de estoque                       | Sistema apresenta as quantidades atuais e identifica os itens abaixo do estoque mínimo                                     | Média      |
| CT13 | #1 a #13      | Execução do fluxo principal do sistema                             | Cadastro → plantio → tarefa → utilização de insumo → conclusão | O fluxo é concluído sem inconsistências entre as funcionalidades                                                           | Alta       |
| CT14 | #4, #9 e #13  | Alteração do estoque após utilização de insumo                     | Estoque inicial e quantidade utilizada                         | O estoque final corresponde ao estoque inicial menos a quantidade utilizada e os alertas são atualizados quando necessário | Alta       |

### Observação sobre a evolução dos testes

Os casos apresentados representam o conjunto inicial de testes do MVP. Novos casos poderão ser acrescentados conforme novas funcionalidades forem implementadas ou quando uma falha identificada durante o desenvolvimento exigir um novo teste de regressão.

As histórias classificadas como **Won't** no backlog não serão consideradas no plano inicial. A história **#14 — Aprovar tarefa sem estoque** poderá receber casos específicos caso seja implementada posteriormente.
