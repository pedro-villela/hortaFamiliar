# Backend — Horta Familiar

API desenvolvida com Node.js e Express, integrada ao banco de dados PostgreSQL.

## 1. Tecnologias e serviços

| Serviço | Acesso | Funcionamento |
|---|---|---|
| PostgreSQL | Porta 5432 | Executado como serviço no computador |
| API Node.js/Express | Porta 3000 | Executada pelo comando `npm run dev` |

A API utiliza as configurações do arquivo `.env` para estabelecer a conexão com o PostgreSQL.

## 2. Instalação do PostgreSQL

1. Baixe o PostgreSQL pelo site oficial: [PostgreSQL para Windows](https://www.postgresql.org/download/windows/).
2. Durante a instalação, defina uma senha para o usuário `postgres`.
3. Mantenha a porta padrão `5432`.
4. Instale também o pgAdmin, utilizado para administrar o banco de dados.

Após a instalação, o PostgreSQL será executado como serviço do Windows.

Para verificar se está funcionando, abra o pgAdmin, conecte-se ao servidor PostgreSQL e informe a senha definida durante a instalação.

## 3. Configuração do ambiente

Dentro da pasta `backend`, crie um arquivo chamado `.env`.

Configure as variáveis abaixo com os dados da instalação local:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=horta_familiar
DB_USER=postgres
DB_PASSWORD=sua_senha_do_postgresql

PORT=3000

DATABASE_URL=
DATABASE_URL_TEST=

JWT_SECRET=coloque_uma_chave_secreta_longa
JWT_EXPIRES_IN=1d
```

**Atenção:**
- Substitua `sua_senha_do_postgresql` pela senha definida na instalação.
- Cada integrante deve configurar seu próprio arquivo `.env`.
- Não compartilhe nem envie o arquivo `.env` para o GitHub.
- Não utilize a senha real de outro integrante.

O projeto permite utilizar `DATABASE_URL` como alternativa às variáveis individuais de conexão. Para a configuração local apresentada acima, mantenha `DATABASE_URL` vazio.

## 4. Instalação das dependências e configuração do banco

Abra o terminal na pasta `backend` e execute:

```bash
npm install
npm run db:setup
```

O comando `npm run db:setup`:

- Cria o banco de dados informado em `DB_NAME`, caso ainda não exista.
- Aplica o arquivo `database/schema.sql`, caso as tabelas ainda não existam.

Para inserir os dados de exemplo, execute:

```bash
npm run db:seed
```

**Importante:** o comando `db:setup` não atualiza automaticamente um banco que já possui tabelas. Para bancos existentes, as alterações posteriores devem ser aplicadas por meio dos arquivos de migração correspondentes.

## 5. Migrações do banco de dados

As migrações registram alterações realizadas no esquema após sua criação inicial.

Para a História 14, foram criados os seguintes arquivos:

- `database/migration_historia_14.sql`
- `database/migration_historia_14_insumos_pendentes.sql`

Em uma instalação que já possua o banco anterior, os arquivos devem ser executados no pgAdmin, conectados ao banco correspondente, respeitando a ordem apresentada.

Não execute novamente migrações que já tenham sido aplicadas.

O arquivo `database/schema.sql` representa a estrutura completa para novas instalações. Os arquivos de migração preservam o histórico das alterações para bancos já existentes.

## 6. Inicialização da API

Na pasta `backend`, execute:

```bash
npm run dev
```

Se a inicialização ocorrer corretamente, o terminal apresentará mensagens semelhantes a:

```text
API Horta Familiar rodando na porta 3000.
Conexão com o PostgreSQL estabelecida.
```

Para verificar a disponibilidade da API, acesse:

[http://localhost:3000/saude](http://localhost:3000/saude)

A resposta esperada é semelhante a:

```json
{
  "api": "ok",
  "banco": "conectado"
}
```

## 7. Visualização dos dados no pgAdmin

Para consultar os dados armazenados:

1. Abra o pgAdmin.
2. Acesse `Servers`.
3. Abra `Databases` e selecione o banco configurado em `DB_NAME`.
4. Acesse `Schemas → public → Tables`.
5. Clique com o botão direito sobre uma tabela.
6. Selecione `View/Edit Data → All Rows`.

Assim é possível visualizar culturas, canteiros, insumos, plantios, tarefas, usuários e demais registros utilizados pela aplicação.

## 8. Principais comandos

| Comando | Finalidade |
|---|---|
| `npm install` | Instala as dependências |
| `npm run db:setup` | Cria o banco e aplica o esquema inicial, se necessário |
| `npm run db:seed` | Insere dados de exemplo |
| `npm run dev` | Inicia a API em modo de desenvolvimento |
| `npm start` | Inicia a API em modo de execução normal |
| `npm test` | Executa os testes automatizados |

## 9. Principais rotas da API

| Recurso | Rota |
|---|---|
| Saúde da API | `GET /saude` |
| Culturas | `/api/culturas` |
| Canteiros | `/api/canteiros` |
| Insumos | `/api/insumos` |
| Plantios | `/api/plantios` |
| Tarefas | `/api/tarefas` |
| Usuários | `/api/usuarios` |
| Dashboard de produção | `GET /api/dashboard/producao` |
| Dashboard de estoque | `GET /api/dashboard/estoque` |

As rotas administrativas exigem autenticação e autorização conforme o perfil do usuário.

## 10. Observações

- A API depende do PostgreSQL estar em execução.
- As configurações de conexão devem corresponder ao ambiente local de cada integrante.
- O arquivo `.env` não deve ser versionado.
- Alterações no banco devem ser documentadas em arquivos de migração.
- A validação funcional das histórias deve seguir o plano de testes do projeto.