
# Ata de Retrospectiva — Sprint 2 — Horta Familiar

**Data:** 02/10/2026  
**Presentes:** Thaynara Franco (2840482423001), Guilherme Assunção (2840482423014), Adriana Martelli (2840482423026), Wilson Lau (2840482423013), Pedro Villela (2840482423009)

---

## 1. Ações da retrospectiva anterior — foram aplicadas?

| Ação decidida | Aplicada? | Evidência/comentário |
|---|---|---|
| Melhorar a organização dos arquivos e diretórios no repositório do GitHub | Parcialmente | A equipe passou a compreender melhor a estrutura do repositório e a organização dos arquivos. Entretanto, ainda ocorreram dúvidas devido à pouca experiência prática da maioria dos integrantes com o GitHub. |
| Ampliar a familiaridade da equipe com GitHub e controle de versão | Parcialmente | Houve evolução no uso da plataforma durante a Sprint 2, inclusive com utilização do GitHub Codespaces. Ainda existem pontos que precisam ser aprimorados quanto ao fluxo de versionamento e organização do projeto. |
| Revisar as orientações da sprint antes de iniciar as atividades | Parcialmente | A equipe realizou as atividades propostas, porém, durante a validação dos testes, iniciou uma abordagem utilizando CI e banco de dados que, após nova leitura das orientações, foi identificada como diferente do objetivo esperado para a atividade. |
| Manter o alinhamento das atividades em reuniões semanais | Sim | As tarefas permaneceram distribuídas entre os integrantes e foram discutidas durante as reuniões, permitindo acompanhamento das entregas e auxílio entre os membros da equipe. |

---

## 2. O que funcionou bem

- A equipe manteve um perfil colaborativo durante a sprint. Mesmo com as funções e tarefas previamente definidas, os integrantes demonstraram disponibilidade para auxiliar os colegas diante de dúvidas e dificuldades técnicas.

- As reuniões semanais contribuíram para o alinhamento das atividades, acompanhamento das entregas e discussão dos problemas encontrados durante o desenvolvimento.

- O compartilhamento de conhecimento entre os integrantes foi positivo, principalmente diante das dificuldades técnicas relacionadas ao backend, banco de dados e testes automatizados.

- Os feedbacks recebidos pelo professor foram discutidos pela equipe, permitindo revisar as entregas e corrigir pontos identificados nas etapas anteriores.

- Houve evolução no conhecimento e utilização do GitHub, apesar da pouca experiência prática inicial de parte da equipe.

- Durante a Sprint 1, a implementação do backend e sua integração com o banco de dados PostgreSQL permitiram à equipe aprofundar conhecimentos sobre Node.js, Express, APIs REST, operações CRUD, consultas SQL, autenticação por JWT, criptografia de senhas e separação de responsabilidades no backend.

- Na Sprint 2, a implementação das funcionalidades relacionadas a plantios e tarefas contribuiu para uma melhor compreensão dos relacionamentos entre as entidades do banco de dados e das regras de negócio associadas ao sistema.

- A implementação das regras de autorização permitiu trabalhar de forma prática com diferentes perfis de acesso, garantindo que determinadas operações fossem exclusivas do administrador e que usuários operacionais acessassem somente as tarefas correspondentes às suas permissões.

- A criação da base de testes automatizados utilizando Jest e Supertest representou um avanço importante para a equipe, pois possibilitou validar o comportamento das rotas e das regras de negócio de maneira automatizada.

- A criação do arquivo `testHelpers.js` facilitou a simulação de tokens JWT e permitiu testar diferentes situações relacionadas à autenticação e à autorização de usuários.

- O uso de mocks possibilitou testar e observar comportamentos específicos do sistema, incluindo tratamento de erros críticos e geração de logs relacionados a regras de negócio sensíveis.

- Foram trabalhados cenários relacionados ao controle de estoque e conflitos de agendamento de canteiros, ampliando a compreensão da equipe sobre a importância de validar regras de negócio por meio de testes.

- A utilização do GitHub Codespaces para preparar o ambiente e executar o comando `npm test` auxiliou na validação dos testes automatizados.

---

## 3. O que não funcionou

- A pouca experiência prática da maior parte da equipe com o GitHub gerou dificuldades no início do desenvolvimento, incluindo criação desnecessária de diretórios e pastas e dúvidas sobre a organização correta dos arquivos no repositório.

- A organização das rotas da API apresentou uma curva de aprendizado maior do que a prevista, principalmente para implementar corretamente as regras de validação e controle de acesso definidas nos requisitos do projeto.

- A integração entre Node.js/Express e PostgreSQL também exigiu maior estudo por parte da equipe, principalmente no desenvolvimento das consultas SQL e no tratamento das relações entre as entidades.

- Durante a Sprint 2, algumas regras de negócio apresentaram maior complexidade do que inicialmente esperado, principalmente aquelas relacionadas à diferenciação das permissões entre usuários administradores e operacionais.

- As consultas SQL envolvendo relacionamentos entre usuários, canteiros, plantios e tarefas demandaram maior atenção, principalmente para tratar registros inexistentes e referências entre diferentes entidades.

- A estruturação da base de testes automatizados foi iniciada do zero, o que gerou dificuldades relacionadas à configuração do Jest e Supertest, à resolução dos caminhos dos módulos e à importação correta do servidor Express.

- Durante a validação dos testes, inicialmente foi utilizada uma abordagem envolvendo Integração Contínua e banco de dados. Após uma nova leitura das orientações da atividade, a equipe percebeu que essa não correspondia exatamente ao objetivo esperado para aquela etapa. Isso gerou retrabalho e mostrou a necessidade de validar melhor os requisitos antes de iniciar a implementação.

- Houve necessidade de dedicar um tempo maior do que o previsto para compreender a utilização de mocks, simulação de tokens JWT e tratamento dos diferentes cenários de teste.

---

## 4. Ações para a próxima sprint

| Ação | Responsável |
|---|---|
| Realizar uma leitura conjunta das orientações da próxima sprint antes da divisão e início das tarefas, registrando as dúvidas identificadas antes da implementação. | Toda a equipe |
| Padronizar a estrutura de diretórios e arquivos do repositório para evitar a criação desnecessária de pastas e manter uma organização única para todos os integrantes. | a definir |
| Revisar o fluxo de utilização do GitHub e estabelecer um padrão para commits, branches e organização das alterações realizadas no projeto. | a definir |
| Manter as reuniões semanais de acompanhamento das atividades e registrar os principais impedimentos encontrados durante a sprint. | Toda a equipe |
| Continuar a implementação dos testes automatizados utilizando Jest e Supertest e verificar se os casos de teste previstos no Plano de Testes possuem evidências de execução. | a definir |
| Executar os testes por meio do `npm test` antes da finalização das funcionalidades desenvolvidas na sprint. | a definir |
| Revisar as regras de autenticação e autorização para garantir que os diferentes perfis de usuário tenham acesso somente às funcionalidades previstas nos requisitos. | a definir |
| Revisar as consultas SQL envolvendo relacionamentos entre usuários, canteiros, plantios e tarefas, verificando o tratamento de registros inexistentes e referências inválidas. | a definir |
| Documentar dificuldades técnicas e respectivas soluções encontradas durante a sprint, permitindo que o conhecimento adquirido seja compartilhado entre os integrantes. | Toda a equipe |
| Realizar uma revisão coletiva das evidências e documentos antes da entrega da próxima sprint, verificando se todos os itens solicitados pelo professor foram atendidos. | Toda a equipe |
```
