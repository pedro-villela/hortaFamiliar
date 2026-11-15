
# Horta Familiar — Frontend

## 1. Sobre o projeto

O Horta Familiar é um sistema web desenvolvido como projeto acadêmico da disciplina de Laboratório de Engenharia de Software da Fatec Ribeirão Preto.

O objetivo é auxiliar na organização e no gerenciamento de uma horta familiar, permitindo o acompanhamento de culturas, canteiros, plantios, insumos, tarefas, colheitas e produção.

Este diretório contém o frontend da aplicação, desenvolvido com React e Vite.

## 2. Tecnologias utilizadas

- React — construção das interfaces.
- Vite — ambiente de desenvolvimento e compilação.
- JavaScript — lógica e interatividade.
- CSS — estilização das páginas e componentes.
- React Router — navegação entre as telas.
- localStorage — armazenamento temporário dos dados durante o desenvolvimento.

## 3. Funcionalidades implementadas

### Administração

- Login e cadastro.
- Dashboard com indicadores gerais.
- Cadastro e gerenciamento de culturas.
- Cadastro e gerenciamento de canteiros.
- Controle de insumos.
- Registro de entradas e saídas de estoque.
- Cadastro e acompanhamento de plantios.
- Cadastro e gerenciamento de tarefas.
- Validação de recursos necessários para tarefas.
- Registro de colheitas.
- Acompanhamento da produção.
- Relatórios gerenciais.

### Área do Membro

- Visualização das tarefas atribuídas.
- Filtros por situação da tarefa.
- Consulta aos detalhes das atividades.
- Conclusão de tarefas.
- Registro da quantidade real de insumo utilizada.
- Atualização do estoque após a conclusão de tarefas.
- Registro automático da movimentação de saída de insumos.

## 4. Como executar o frontend

### Pré-requisitos

- Node.js e npm instalados.
- Git instalado, caso deseje clonar o repositório.

### Passo 1 — Clonar o repositório

```bash
git clone https://github.com/pedro-villela/hortaFamiliar.git
```

### Passo 2 — Acessar a branch do frontend

```bash
cd hortaFamiliar
git switch feature/frontend-inicial
```

### Passo 3 — Entrar na pasta do frontend

```bash
cd frontend
```

### Passo 4 — Instalar as dependências

```bash
npm install
```

### Passo 5 — Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

O terminal exibirá o endereço local da aplicação, normalmente:

http://localhost:5173

### Passo 6 — Gerar a versão de produção

```bash
npm run build
```

Esse comando gera os arquivos de produção na pasta `dist`.

## 5. Estrutura do frontend

```text
frontend/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── README.md
```

### Organização

- `components/`: componentes reutilizáveis da interface.
- `pages/`: páginas e funcionalidades do sistema.
- `App.jsx`: configuração das rotas.
- `main.jsx`: inicialização da aplicação.

## 6. Armazenamento de dados

Nesta etapa, o frontend utiliza o `localStorage` do navegador para simular a persistência de informações.

Entre as chaves utilizadas estão:

- `horta_culturas`
- `horta_canteiros`
- `horta_plantios`
- `horta_insumos`
- `horta_tarefas`
- `horta_movimentacoes`
- `horta_colheitas`

O armazenamento é local ao navegador e não representa uma integração definitiva com o banco de dados.

## 7. Integração futura com o backend

A integração com o backend deverá substituir as operações locais de leitura e gravação por requisições à API.

As principais áreas de integração são:

- Autenticação e autorização.
- Cadastros de culturas e canteiros.
- Gestão de plantios e colheitas.
- Gestão de tarefas.
- Controle de estoque.
- Registro de movimentações.
- Relatórios gerenciais.

As regras de negócio deverão ser validadas também pelo backend, especialmente aquelas relacionadas ao estoque e à conclusão de tarefas.

## 8. Testes realizados

Durante o desenvolvimento, foram realizados testes manuais de:

- Navegação entre as páginas.
- Cadastro e gerenciamento de tarefas.
- Validação de recursos e conflitos.
- Visualização e conclusão de tarefas pelo membro.
- Registro de utilização de insumos.
- Atualização de estoque e histórico de movimentações.
- Atualização dos indicadores do Dashboard.
- Atualização e filtragem dos relatórios.

Também foi executado com sucesso o comando:

```bash
npm run build
```

Os testes descritos são manuais, não constituindo uma suíte automatizada do frontend.

## 9. Repositório

Repositório principal:

https://github.com/pedro-villela/hortaFamiliar

Branch utilizada para desenvolvimento do frontend:

`feature/frontend-inicial`

## 10. Observações

O frontend encontra-se em desenvolvimento e utiliza dados simulados.

A integração definitiva com o backend e com o banco de dados será realizada em etapa posterior, em colaboração com a equipe do projeto.
