# Relatório Individual de Contribuição Guilherme Assunção Barboza (RA [2840482423014])

**Papel nesta sprint:** Desenvolvimento / Backend

## O que fiz

| Item                                                                                       | PR/commit                                                                                                                                                      | Status    |
| ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| Estrutura inicial do backend: pastas (config, routes, middlewares, utils), server.js, app.js e rota de verificação GET / e GET /saude| | Concluído |
|Configuração do PostgreSQL: config/database.js, database/schema.sql, scripts npm run db:setup e npm run db:seed e .env.demo.| | Concluído |
|CRUD de culturas (/api/culturas) com validação de campos obrigatórios e bloqueio de nome duplicado | | Concluído |
|CRUD de canteiros (/api/canteiros) com identificação única e validação de área | | Concluído |
|CRUD de insumos (/api/insumos) para sementes, fertilizantes e ferramentas, rejeitando quantidades negativas | | Concluído |



## Dificuldades e o que aprendi
Como conectar uma API Express a um banco PostgreSQL e usar consultas parametrizadas para evitar SQL Injection.
Que as constraints do banco funcionam como uma segunda camada de validação, e que a API pode traduzir os códigos de erro do PostgreSQL.
A escrever testes de integração contra um banco de dados real, usando um banco separado (*_test) para não apagar os dados de desenvolvimento.
