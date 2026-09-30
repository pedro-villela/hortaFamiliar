# E4 — Protótipo Navegável

## Link do protótipo

Acesse o protótipo navegável:
https://design.penpot.app/#/view?file-id=c514c1fb-1cda-8125-8008-a03514f73fc4&page-id=bed98bed-6467-80b3-8008-a0dea1bb676a&section=interactions&frame-id=7320864b-df74-8014-8008-a4072415cee9&index=0&share-id=c2516c12-6006-47f7-b641-c111e9154dd1

## Objetivo

O protótipo navegável apresenta as principais interfaces do sistema
Horta Familiar e demonstra os fluxos relacionados às histórias de
usuário classificadas como MUST no backlog da E2.

## Telas contempladas

| Tela | Perfil | História | Finalidade |
|---|---|---|---|
| Login | Ambos | 1 | Autenticação no sistema |
| Cadastro | Ambos | 1 | Cadastro de usuário |
| Dashboard | Administrador | 12 | Indicadores da horta |
| Culturas | Administrador | 2 | Gerenciamento de culturas |
| Nova Cultura | Administrador | 2 | Cadastro de cultura |
| Canteiros | Administrador | 3 | Gerenciamento dos canteiros |
| Insumos | Administrador | 4 e 10 | Estoque e disponibilidade |
| Plantios | Administrador | 5 | Visualização dos plantios |
| Novo Plantio | Administrador | 5 | Registro de plantio |
| Tarefas | Administrador | 6 | Gerenciamento das tarefas |
| Nova Tarefa | Administrador | 6, 10 e 11 | Criação e validação de tarefa |
| Validação de Recursos | Administrador | 10 e 11 | Verificação de disponibilidade |
| Conflito de Recursos | Administrador | 10 e 11 | Bloqueio de agendamento inválido |
| Minhas Tarefas | Membro | 7 | Consulta das tarefas atribuídas |
| Detalhes da Tarefa | Membro | 7 e 8 | Informações da tarefa |
| Conclusão da Tarefa | Membro | 8 | Registro da conclusão |
| Utilização de Insumos | Administrador | 9 | Registro e baixa de insumos |
| Relatórios/Produção | Administrador | 12 | Indicadores de produtividade |

## Fluxo do Administrador

Login → Dashboard → Cadastros → Plantios → Tarefas →
Verificação de disponibilidade → Confirmação da tarefa.

O administrador também poderá visualizar situações de conflito,
como estoque insuficiente ou indisponibilidade de recursos.

## Fluxo do Membro

Login → Minhas Tarefas → Detalhes da Tarefa →
Marcar como Concluída → Confirmação da Conclusão.

## Ferramenta utilizada

O protótipo navegável foi desenvolvido no Figma em formato desktop,
considerando que o sistema Horta Familiar será inicialmente uma
aplicação web para utilização em computadores.
