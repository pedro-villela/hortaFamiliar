# Documento de Visão e Escopo — Projeto Horta Familiaeer

## 1. Visão Geral do Projeto
O **Projeto Horta Familiaeer** tem como objetivo o desenvolvimento de um software de gestão voltado para hortas familiares e comunitárias. A plataforma visa otimizar o planejamento de plantio, o controle de insumos e colheitas, e o gerenciamento de tarefas entre os membros da família ou comunidade, promovendo a sustentabilidade e a eficiência na produção agrícola urbana ou doméstica.

## 2. Perfis de Usuário e Controle de Acesso
O sistema contará com autenticação de usuários e controle de acesso baseado em papéis (RBAC), contemplando pelo menos dois perfis distintos:
* **Administrador / Gestor da Horta:** Possui acesso total ao sistema, podendo cadastrar novas culturas, gerenciar usuários, definir regras de negócio, visualizar relatórios financeiros e de produção consolidados, e aprovar demandas críticas.
* **Membro / Operacional:** Possui acesso restrito para registrar atividades diárias (como rega, adubação e colheita), consultar o estoque de insumos e visualizar o cronograma de tarefas atribuídas a si.

## 3. Modelo de Dados (Mínimo de 6 Entidades)
O banco de dados relacional será estruturado contemplando as seguintes entidades principais:
1. **Usuario:** Armazena dados cadastrais e o perfil de acesso.
2. **Cultura:** Define os tipos de vegetais, hortaliças ou frutas cultivadas (ex: tempo médio de maturação, espaçamento ideal).
3. **Canteiro:** Representa os espaços físicos delimitados onde o plantio é realizado.
4. **Plantio:** Relaciona uma cultura a um canteiro específico em uma data de plantio (inclui o status atual: Crescimento, Colhido, Perdido).
5. **Insumo:** Gerencia os recursos disponíveis (sementes, fertilizantes, ferramentas).
6. **Tarefa:** Agenda atividades operacionais relacionadas aos canteiros ou insumos.

* **Relacionamento N:N:** Haverá um relacionamento do tipo **muitos para muitos (N:N)** entre as entidades **Insumo** e **Plantio** (ou **Tarefa**), indicando quais insumos foram aplicados em determinados plantios ao longo do tempo, intermediados por uma tabela de vínculo com atributos específicos (ex: quantidade utilizada).

## 4. Regra de Negócio Não Trivial
O sistema implementará uma regra de negócio avançada de **Controle de Estoque com Baixa Automática e Alerta de Ruptura** combinada com **Agendamento com Conflito de Recursos**:
* Sempre que uma *Tarefa* de adubação ou plantio for agendada utilizando um determinado *Insumo*, o sistema validará se há saldo suficiente em estoque.
* Caso o saldo seja insuficiente, o agendamento será rejeitado ou exigirá aprovação superior (fluxo de aprovação).
* Adicionalmente, o sistema verificará se ferramentas ou canteiros essenciais já estão alocados para outra tarefa no mesmo horário, impedindo conflitos de agendamento.

## 5. Consulta Agregada (Relatório / Dashboard)
Para a tomada de decisões, a plataforma disponibilizará um painel analítico (*Dashboard*) que exibirá uma consulta agregada utilizando operações avançadas de banco de dados:
* **Requisitos da Query:** Envolverá operações de `GROUP BY` e junção (`JOIN`) entre 3 ou mais tabelas (ex: junção entre *Canteiro*, *Plantio*, *Cultura* e *Insumos*).
* **Exemplo de Indicador:** Produtividade total (peso colhido) agrupada por tipo de cultura e por canteiro no último trimestre, permitindo identificar quais áreas possuem maior rendimento.

## 6. Validações de Integridade
A integridade e consistência dos dados serão garantidas em duas camadas:
* **Camada de Interface (Frontend):** Validação de preenchimento obrigatório, formatos de e-mail, senhas fortes e restrições de datas em formulários via componentes reativos.
* **Camada de Banco de Dados (Backend / SGBD):** Aplicação estrita de restrições como `NOT NULL`, chaves primárias e estrangeiras (`FK`), regras de unicidade (`UNIQUE`) para e-mails de usuários e *constraints* de validação (ex: quantidade de estoque nunca menor que zero).

## 7. Requisitos de Infraestrutura e Implantação
* **Deploy Público:** A aplicação será hospedada em ambiente de nuvem acessível publicamente por URL dedicada (ex: Render, Vercel, Railway ou Heroku), descartando execuções locais restritas.
* **Repositório e Documentação:** O código-fonte será versionado em repositório Git público ou compartilhado, acompanhado de um arquivo `README.md` completo, detalhado e estruturado para permitir que qualquer terceiro realize o clone e o deploy do projeto do zero sem fricções.