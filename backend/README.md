| Servidor         |  Acesso    | Como roda                            |
| ---------------- | ---------- | ------------------------------------ |
| PostgreSQL       | porta 5432 | Instalado no computador como serviço |
| API Node/Express | porta 3000 | npm run dev                          |

A API se conecta ao PostgreSQL usando o endereço que está no .env

1. Instale o PostgreSQL
    - Baixe o [PostgreSQL](postgresql.org/download/windows). 
    - Durante a instalação, ele pede uma senha para o usuário postgres. Essa senha vai usar no .env
    - Deixe a porta padrão 5432 e marque o pgAdmin que é a interface gráfica
    - O servidor sobe sozinho como serviço, então não precisa ligar

2. Confirme que o servidor está rodando
    - Abra o pgAdmin, clique em Servers → PostgreSQL e digite a senha. Se abrir e mostrar o banco postgres, está funcionando

3. Configure o .env
    - Dentro da pasta backend, se ainda não tiver o .env crie um arquivo com o nome `.env` e copie .env.demo para o .env e edite
    - coloquem em SENHA a senha do passo 1, a que vc usou na hora da instalação.
    - Se ela tiver caracteres especiais (@, #, /), substitua se não o link quebra

|**Caractere**|**Função comum na URL**|**Código Seguro (URL Encoded)**|
|---|---|---|
|`@`|Separa usuário/senha do host|`%40`|
|`#`|Âncora para rolar a página|`%23`|
|`/`|Separação de rotas/pastas|`%2F`|
|`?`|Inicia parâmetros de busca (Query)|`%3F`|
|`&`|Separa múltiplos parâmetros|`%26`|
|`=`|Atribui valor a um parâmetro|`%3D`|
|`+`|Pode representar espaço|`%2B`|
|(espaço)|Não é permitido|`%20`|
|`:`|Define porta ou protocolo (`http:`)|`%3A`|

4. Crie o banco e as tabelas
    - No terminal, dentro da pasta backend:
    ```bash
    npm install
    npm run db:setup
    ```
    
    - o comando `npm run db:setup` cria o banco horta_familiar e todas as tabelas
    - pode usar `npm run db:seed` para insere os dados de exemplo

5. Suba a API
    - Para subir a API use o comando `npm run dev`
    - Se aparecer Conexão com o PostgreSQL estabelecida, está tudo conectado
    - Teste no navegador em http://localhost:3000/saude (deve aparecer algo como {"api":"ok","banco":"conectado"})

6. Veja os dados no banco
    - No pgAdmin: Databases → horta_familiar → Schemas → public → Tables. 
    - Clique com o botão direito em uma tabela → View/Edit Data → All Rows. 
    - Dá para ver as culturas, os usuários e o que mais a API gravar.