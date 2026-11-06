# Horta Familiar

Sistema web para gerenciamento de uma horta familiar, permitindo o cadastro e a autenticação de usuários, a gestão de culturas, canteiros e insumos, o acompanhamento de plantios, o agendamento de tarefas, o controle de estoque e a visualização de indicadores de produtividade.

O sistema conta com funcionalidades administrativas para acompanhamento da produção, identificação de insumos com estoque baixo e aprovação excepcional de consumo de materiais.

**Deploy:** ainda não publicado.

**Equipe:** Thaynara Franco (RA 2840482423001) — Guilherme Assunção (RA 2840482423014) — Adriana Martelli (RA 2840482423026) — Wilson Lau (RA 2840482423013) — Pedro Villela (RA 2840482423009).

Laboratório de Engenharia de Software · ADS · Fatec Ribeirão Preto · 2026.

## Stack

- **Frontend:** React 18 + Vite 5
- **Backend:** Node.js + Express
- **Banco de dados:** PostgreSQL 16
- **Hospedagem / Deploy:** Render / Railway e Vercel (Frontend)

## Funcionalidades

### Gestão do sistema
- Cadastro e autenticação de usuários.
- Controle de acesso por perfil: ADMIN e OPERACIONAL.
- Cadastro e gerenciamento de culturas, canteiros e insumos.
- Registro e acompanhamento de plantios.
- Cadastro, consulta, conclusão e cancelamento de tarefas.

### Controle de estoque
- Registro do consumo de insumos em tarefas e plantios.
- Atualização automática das quantidades disponíveis.
- Verificação de disponibilidade antes do consumo.
- Identificação de insumos abaixo do estoque mínimo.
- Aprovação administrativa para consumo excepcional de insumos, com registro da autorização.

### Agendamento e recursos
- Agendamento de tarefas em canteiros.
- Verificação de conflitos de horários.
- Reserva e controle de disponibilidade de ferramentas.

### Indicadores e dashboards
- Dashboard de produção agrupado por cultura e canteiro.
- Consulta da produtividade total em quilogramas.
- Filtro de período para consulta dos indicadores.
- Resumo do estoque, com identificação de insumos em situação de risco.

## Como rodar localmente

### Pré-requisitos

- Node.js 20 LTS ou superior.
- PostgreSQL 16 ou superior.
- Git.

### Passo a passo

1. Clone o repositório:

   ```bash
   git clone https://github.com/pedro-villela/hortaFamiliar
   ```

2. Entre na pasta do projeto:

   ```bash
   cd hortaFamiliar
   ```

3. Instale as dependências:

   **Backend:**

   ```bash
   cd backend
   npm install
   ```

   **Frontend:** em outro terminal, na pasta principal:

   ```bash
   cd frontend
   npm install
   ```

4. Configure as variáveis de ambiente do backend. Copie o arquivo `.env.example` para `.env`, caso esteja disponível, e preencha os dados de conexão com o PostgreSQL.

   Principais variáveis:

   | Variável | Descrição |
   |---|---|
   | `DB_HOST` | Endereço do servidor PostgreSQL |
   | `DB_PORT` | Porta do PostgreSQL |
   | `DB_NAME` | Nome do banco de dados |
   | `DB_USER` | Usuário do banco |
   | `DB_PASSWORD` | Senha do banco |
   | `PORT` | Porta utilizada pelo backend |
   | `JWT_SECRET` | Chave utilizada para autenticação |
   | `JWT_EXPIRES_IN` | Tempo de validade do token |
   | `DATABASE_URL` | URL de conexão alternativa com o banco, quando utilizada |
   | `DATABASE_URL_TEST` | URL de conexão para testes, quando utilizada |
   | `VITE_API_URL` | URL da API utilizada pelo frontend |

5. Crie o banco de dados e execute o schema inicial, conforme os scripts disponíveis no backend:

   ```bash
   npm run db:setup
   ```

   Esse procedimento é destinado à configuração inicial de um banco novo.

6. Para bancos já existentes, aplique as migrações necessárias, na ordem indicada, utilizando o PostgreSQL:

   - `database/migration_historia_14.sql`
   - `database/migration_historia_14_insumos_pendentes.sql`

   Não execute novamente as migrações que já tenham sido aplicadas.

7. Inicie o backend:

   ```bash
   npm run dev
   ```

8. Inicie o frontend em outro terminal:

   ```bash
   npm run dev
   ```

9. Acesse a aplicação pelo endereço:

   `http://localhost:5173`

## Comandos documentados por pasta

### Backend (`/backend`)

| Comando | Descrição |
|---|---|
| `npm start` | Inicia o servidor em modo de produção |
| `npm run dev` | Inicia o servidor em modo de desenvolvimento |
| `npm test` | Executa a suíte de testes do backend |
| `npm run db:setup` | Executa a configuração inicial do banco e o schema, conforme o script disponível |
| `npm run db:migrate` | Executa as migrações e seeds, caso estejam configurados no projeto |

### Frontend (`/frontend`)

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia a aplicação em ambiente de desenvolvimento (Vite) |
| `npm run build` | Gera os arquivos otimizados para produção |
| `npm run preview` | Executa localmente o build gerado |

## Endpoints de destaque

As rotas administrativas exigem autenticação e autorização compatíveis com o perfil ADMIN.

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/dashboard/producao` | Consulta indicadores de produção por período |
| GET | `/api/dashboard/estoque` | Consulta o resumo do estoque e os insumos em risco |
| GET | `/api/insumos?estoque_baixo=true` | Lista insumos abaixo do estoque mínimo |
| POST | `/api/tarefas/:id/aprovar-estoque` | Aprova excepcionalmente o consumo de insumos de uma tarefa |

**Observação:** os indicadores de produção utilizam o período informado nos parâmetros `data_inicio` e `data_fim`. No modelo atual, o filtro considera a data de plantio.

## Estrutura do repositório

```text
/backend
    API e regras de negócio desenvolvidas em Node.js.

/frontend
    Aplicação web desenvolvida em React + Vite.

/database
    Scripts SQL, schema e migrações do PostgreSQL.

/docs
    Documentação técnica e funcional do projeto.

/tests
    Testes automatizados.
```

## Banco de dados e migrações

O arquivo `database/schema.sql` contém a estrutura completa do banco de dados para novas instalações.

Os arquivos de migração registram alterações realizadas durante o desenvolvimento e permitem atualizar bancos que já existiam:

- `migration_historia_14.sql`: estrutura de aprovação excepcional de estoque e atualização das regras de consumo.
- `migration_historia_14_insumos_pendentes.sql`: criação da tabela de insumos pendentes de aprovação.

As migrações devem ser aplicadas uma única vez em cada banco de dados.

## Convenções da equipe

- **Branches:** `feature/nome-da-feature`, `fix/nome-do-problema`, `docs/nome-da-documentacao`.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`).
- Toda Pull Request exige revisão de pelo menos um integrante antes do merge.

## Testes

A execução dos testes automatizados do backend pode ser realizada por:

```bash
npm test
```

## Licença e uso acadêmico

Projeto desenvolvido para a disciplina de Laboratório de Engenharia de Software — Curso de Análise e Desenvolvimento de Sistemas (ADS), Fatec Ribeirão Preto, 2026.