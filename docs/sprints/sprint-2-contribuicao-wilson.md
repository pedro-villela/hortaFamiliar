# Relatório Individual de Contribuição — Sprint 2 — Wilson Lau Júnior (RA 2840482423013)

**Papel nesta sprint:** Desenvolvimento / Backend

## O que fiz

| Item                                                                                                                           | PR/commit                                                                                                                                                      | Status    |
| ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| Implementação das funcionalidades relacionadas aos plantios, incluindo cadastro, consulta, atualização e exclusão de registros | [`4a549de`](https://github.com/pedro-villela/hortaFamiliar/commit/4a549de28f04cb682e8a2189dc84e33382b2773) — **Implementar funcionalidades das Sprints 1 e 2** | Concluído |
| Implementação das funcionalidades relacionadas às tarefas, incluindo cadastro, consulta, atualização e exclusão                | [`4a549de`](https://github.com/pedro-villela/hortaFamiliar/commit/4a549de28f04cb682e8a2189dc84e33382b2773)                                                     | Concluído |
| Implementação da consulta das tarefas do usuário autenticado e controle para conclusão de tarefas                              | [`4a549de`](https://github.com/pedro-villela/hortaFamiliar/commit/4a549de28f04cb682e8a2189dc84e33382b2773)                                                     | Concluído |
| Implementação do controle de acesso às operações de plantios e tarefas, diferenciando administradores e usuários operacionais  | [`4a549de`](https://github.com/pedro-villela/hortaFamiliar/commit/4a549de28f04cb682e8a2189dc84e33382b2773)                                                     | Concluído |
| Integração das novas funcionalidades ao backend e organização das rotas da API                                                 | [`4a549de`](https://github.com/pedro-villela/hortaFamiliar/commit/4a549de28f04cb682e8a2189dc84e33382b2773)                                                     | Concluído |

## Dificuldades e o que aprendi

Durante a Sprint 2, trabalhei na implementação das funcionalidades de plantio e tarefas, envolvendo diferentes entidades do banco de dados e suas respectivas relações.

Uma das principais dificuldades foi implementar as regras de negócio relacionadas ao acesso às funcionalidades, garantindo que determinadas operações fossem realizadas somente por administradores e que usuários operacionais pudessem consultar e concluir apenas suas próprias tarefas.

Também foi necessário trabalhar com consultas SQL envolvendo relacionamentos entre usuários, canteiros e plantios, além de tratar situações como registros inexistentes e referências entre entidades.

Com o desenvolvimento dessas funcionalidades, aprofundei meus conhecimentos em Node.js, Express, PostgreSQL, SQL, autenticação e autorização com JWT e organização de uma API REST.
