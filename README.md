# Horta Familiar

Sistema web para gerenciamento de uma horta familiar, permitindo o cadastro e autenticação de usuários, gestão de culturas, canteiros e insumos, acompanhamento de plantios, agendamento de tarefas, controle de estoque e visualização de indicadores de produtividade.

**Deploy:** ainda não publicado
**Equipe:** Thaynara Franco (RA 2840482423001) — Guilherme Assunção (RA 2840482423014) — Adriana Martelli (RA 2840482423026) — Wilson Lau (RA 2840482423013) — Pedro Villela (RA 2840482423009) · Laboratório de Engenharia de Software · ADS Fatec Ribeirão Preto

## Stack
- Frontend: React 18 + Vite 5
- Backend: Node.js 20 LTS
- Banco de dados: PostgreSQL 16
- Hospedagem / Deploy: Render / Railway e Vercel (Frontend)

## Como rodar localmente
### Pré-requisitos
- Node.js 20 LTS ou superior
- PostgreSQL 16 ou superior
- Git

### Passo a passo
1. Clone o repositório: `github.com/pedro-villela/hortaFamiliar`
2. Entre nas pastas do projeto e instale as dependências:
   - Frontend: `cd frontend && npm install`
   - Backend: `cd backend && npm install`
3. Configure as variáveis de ambiente (copie `.env.example` para `.env` e preencha):

   | Variável | Descrição |
   |---|---|
   | `DATABASE_URL` | URL de conexão com o banco PostgreSQL |
   | `PORT` | Porta utilizada pelo backend |
   | `VITE_API_URL` | URL da API utilizada pelo frontend |

4. Crie o banco e rode o schema: `npm run db:setup`
5. Rode as migrations/seed (se houver): `npm run db:migrate`
6. Suba o projeto:
   - Backend: `npm run dev`
   - Frontend: `npm run dev`
7. Acesse em `http://localhost:5173`

## Estrutura do repositório
```text
/frontend       — aplicação web desenvolvida em React + Vite
/backend        — API e regras de negócio desenvolvidas em Node.js
/database       — scripts, schema e migrations do PostgreSQL
/docs           — documentação do projeto
/tests          — testes automatizados
```

## Convenções da equipe
- Branches: `feature/nome-da-feature`, `fix/nome-do-problema`, `docs/nome-da-documentacao`
- Commits: Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`)
- Toda PR exige revisão de ao menos 1 integrante antes do merge.

## Testes
Como rodar: `npm test`

Os testes serão implementados conforme o desenvolvimento do sistema.

## Licença / Uso acadêmico
Projeto desenvolvido para a disciplina de Laboratório de Engenharia de Software — ADS, Fatec Ribeirão Preto, 2026.
