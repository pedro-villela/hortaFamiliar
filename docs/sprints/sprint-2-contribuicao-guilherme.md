# Relatório Individual de Contribuição Guilherme Assunção Barboza (RA [2840482423014])

**Papel nesta sprint:** Desenvolvimento / Backend

## O que fiz

| Item                                                                                       | PR/commit                                                                                                                                                      | Status    |
| ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
|CRUD de plantios (/api/plantios): relaciona cultura e canteiro existentes, registra data e status (padrão CRESCIMENTO) e retorna os nomes da cultura e do canteiro via JOIN| | Concluído |
|Criação e atribuição de tarefas (POST /api/tarefas, GET /api/tarefas): descrição, data, horário, canteiro opcional e responsável | | Concluído |
|Visualização das próprias tarefas (GET /api/tarefas/minhas) com filtro por status e detalhe da tarefa permitido apenas ao responsável ou ao ADMIN | | Concluído |
|Conclusão de tarefa (PATCH /api/tarefas/:id/concluir): só o responsável conclui, registra a data de conclusão e impede concluir duas vezes. | | Concluído |
|Visualização das próprias tarefas (GET /api/tarefas/minhas) com filtro por status e detalhe da tarefa permitido apenas ao responsável ou ao ADMIN | | Concluído |
|Criação e atribuição de tarefas (POST /api/tarefas, GET /api/tarefas): descrição, data, horário, canteiro opcional e responsável; | | Concluído |
|atualização do README (variáveis, db:setup, db:seed, testes), backlog atualizado e Relatório de Entrega das Sprints 1 e 2 | | Concluído |


## Dificuldades e o que aprendi
Como usar JOIN para devolver dados já relacionados em vez de apenas ids.
Como uma restrição EXCLUDE com a extensão btree_gist impede conflitos de horário diretamente no banco, e como traduzir esse erro para o usuário.
A diferença entre os códigos HTTP 400 (dado inválido), 403 (sem permissão), 404 (não existe) e 409 (conflito com o estado atual) e quando usar cada um.
A importância de fazer a atualização do status de forma atômica (WHERE status = 'PENDENTE'), evitando que duas requisições simultâneas concluam a mesma tarefa.
Que decisões de escopo precisam ser registradas e comunicadas (backlog e relatório), e não escondidas.
