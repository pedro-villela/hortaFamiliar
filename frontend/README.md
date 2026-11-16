# Horta Familiar — Frontend

## 1. Sobre o projeto

O **Horta Familiar** é um sistema web desenvolvido como projeto acadêmico da disciplina de Laboratório de Engenharia de Software da Fatec Ribeirão Preto.

O objetivo é auxiliar na organização e no gerenciamento de uma horta comunitária e familiar, permitindo o acompanhamento de culturas, canteiros, plantios, insumos, tarefas, colheitas, usuários e produtividade consolidada, integrado à API REST em `/backend` e ao banco de dados PostgreSQL.

## 2. Tecnologias utilizadas

- **React 18** — construção das interfaces e gerenciamento de estado.
- **Vite 5** — ambiente de desenvolvimento e compilação de produção.
- **React Router DOM 6** — roteamento e proteção de rotas por perfil (`ADMIN` e `OPERACIONAL`).
- **Fetch API + JWT (`src/services/api.js`)** — comunicação autenticada com o Backend (`Authorization: Bearer <token>`).
- **CSS3** — estilização responsiva das páginas e componentes.

## 3. Funcionalidades implementadas e integradas à API

### Autenticação e Controle de Acesso (História #1)
- **Login (`/login` -> `POST /api/auth/login`)**: Autentica o usuário, armazena o token JWT e redireciona automaticamente conforme o perfil (`ADMIN` -> `/dashboard`, `OPERACIONAL` -> `/minhas-tarefas`).
- **Cadastro (`/cadastro` -> `POST /api/auth/registro`)**: Permite o auto-registro de novos membros operacionais.
- **Proteção de Rotas (`RotaProtegida`)**: Bloqueia usuários não autenticados e impede que membros `OPERACIONAL` acessem rotas administrativas.

### Administração (`ADMIN`)
- **Dashboard (`/dashboard`)**: Indicadores em tempo real de culturas, canteiros disponíveis, plantios em crescimento, tarefas por status e alertas de estoque (`GET /api/dashboard/estoque` — História #13).
- **Culturas (`/culturas` — História #2)**: Listagem, busca, cadastro, edição e exclusão de culturas (`GET/POST/PUT/DELETE /api/culturas`) com tempo de maturação (dias) e espaçamento ideal (metros).
- **Canteiros (`/canteiros` — História #3)**: Listagem, busca, cadastro, edição e exclusão de canteiros (`GET/POST/PUT/DELETE /api/canteiros`) exibindo a cultura atual em cultivo.
- **Insumos (`/insumos` — Histórias #4 e #13)**: Controle de sementes, fertilizantes e ferramentas (`GET/POST/PUT/DELETE /api/insumos`) com destaque automático para itens com estoque abaixo ou igual ao mínimo (`quantidade_estoque <= estoque_minimo`).
- **Plantios (`/plantios` — Histórias #5 e #9)**: Registro e acompanhamento de plantios (`CRESCIMENTO`, `COLHIDO`, `PERDIDO`), previsão automática de colheita, peso colhido (kg) e vínculo opcional de insumos utilizados com baixa automática de estoque (`POST /api/plantios`).
- **Tarefas (`/tarefas` — Histórias #6, #9, #10, #11 e #14)**: Criação e atribuição de tarefas a membros e canteiros, verificação de conflitos de horário no canteiro (409) e conflitos de ferramentas (409), fluxo de exceção de estoque (`AGUARDANDO_APROVACAO`) e botão para **Aprovação Excepcional de Estoque** (`POST /api/tarefas/:id/aprovar-estoque`).
- **Usuários (`/usuarios` — História #1)**: Gestão completa de usuários e perfis (`GET/POST/PUT/DELETE /api/usuarios`).
- **Colheitas (`/colheitas`), Produção (`/producao`) e Relatórios (`/relatorios` — História #12)**: Registro de colheitas em kg e relatórios gerenciais filtrados por período (`GET /api/dashboard/producao?data_inicio=...&data_fim=...`).
- **Movimentações (`/movimentacoes`)**: Entradas, saídas manuais e estornos sincronizados com o saldo do banco de dados (`PUT /api/insumos/:id`).

### Área do Membro (`OPERACIONAL`)
- **Minhas Tarefas (`/minhas-tarefas` — Histórias #7 e #8)**: Exibe exclusivamente as tarefas atribuídas ao usuário logado (`GET /api/tarefas/minhas`), permitindo filtrar por status, consultar detalhes e registrar a conclusão da atividade (`PATCH /api/tarefas/:id/concluir`).

## 4. Como executar o projeto completo (Backend + Frontend)

### Passo 1 — Iniciar o Backend (Terminal 1)

```bash
cd backend
npm install
npm run db:setup
npm run db:seed
npm run dev
```
A API estará disponível em `http://localhost:3000`.

**Credenciais criadas pelo `db:seed`:**
- **Administrador (`ADMIN`):** `joao.admin@horta.com` / `Horta@123`
- **Membro (`OPERACIONAL`):** `maria.operacional@horta.com` / `Horta@123`

### Passo 2 — Iniciar o Frontend (Terminal 2)

```bash
cd frontend
npm install
npm run dev
```
Acesse no navegador: `http://localhost:5173`.

*(Opcional: Para apontar para outra URL de API, configure `VITE_API_URL=http://localhost:3000` em um arquivo `.env` na pasta `frontend`).*

### Passo 3 — Verificar Linter e Build de Produção

```bash
cd frontend
npm run lint
npm run build
```

## 5. Estrutura do frontend

```text
frontend/
├── public/
├── src/
│   ├── components/       # BarraSuperior, MenuLateral, MenuMembro, Formulários e Validação
│   ├── pages/            # Login, Cadastro, Dashboard, Culturas, Canteiros, Insumos, Plantios,
│   │                     # Tarefas, MinhasTarefas, Usuarios, Colheitas, Producao, Movimentacoes, Relatorios
│   ├── services/
│   │   └── api.js        # Cliente HTTP centralizado com envio de token JWT
│   ├── App.jsx           # Rotas públicas e protegidas por perfil (RotaProtegida)
│   └── main.jsx          # Ponto de entrada React
├── package.json
└── README.md
```
