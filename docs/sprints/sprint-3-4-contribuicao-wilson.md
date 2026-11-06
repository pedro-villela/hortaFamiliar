# Relatório Individual de Contribuição — Sprint 4 — Wilson Lau Júnior RA: 2840482423013 

**Papel nesta sprint:** Desenvolvimento Backend / [confirmar papel oficial da equipe]

## 1. O que fiz

| Item | PR/commit | Status |
|---|---|---|
| Implementação do dashboard de produção, com consulta agrupada por cultura e canteiro e filtro por período | aabc992 | Implementado |
| Implementação do resumo de estoque, com identificação de insumos abaixo do estoque mínimo |aabc992 | Implementado |
| Implementação da aprovação administrativa para consumo excepcional de insumos | aabc992 | Implementado |
| Criação e atualização das estruturas do banco de dados para registrar aprovações e insumos pendentes | aabc992 | Implementado |
| Atualização das rotas de tarefas e integração das funcionalidades de aprovação de estoque | aabc992 | Implementado |
| Atualização da documentação técnica: README principal, README do backend, `.env.demo`, DER e UML | aabc992 | Atualizado |

**Observação:** A implementação foi realizada, mas a validação funcional das histórias ficou sob responsabilidade da equipe de testes.

## 2. Rituais que participei

- [x] Dailies/weeklies
- [x] Sprint Review
- [x] Retrospectiva

## 3. PRs de colegas que revisei

| PR | Autor | Comentário resumido |
|---|---|---|
| Não informado | Não informado | Não foram registradas revisões de PRs de colegas neste relatório. |

## 4. Dificuldades e o que aprendi

Durante a Sprint 4, o principal desafio foi implementar a aprovação excepcional de consumo de insumos sem comprometer a integridade do controle de estoque.

Foi necessário adaptar a estrutura do banco de dados, criar registros de insumos pendentes e implementar o controle de aprovação exclusivo para administradores. Também foi importante garantir que o consumo somente fosse efetivado após a aprovação.

Outro desafio foi integrar as novas funcionalidades às rotas existentes e manter a documentação técnica coerente com a evolução do sistema.

Como aprendizado, aprofundei meus conhecimentos sobre Node.js, Express, PostgreSQL, transações, integridade referencial, gatilhos de banco de dados e controle de acesso por perfil de usuário.
