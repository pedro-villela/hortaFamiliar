# Documento de Visão — Projeto Horta Familiar

**Equipe:** Thaynara Franco (2840482423001), Guilherme Assunção (2840482423014), Adriana Martelli (2840482423026), Wilson Lau (2840482423013), Pedro Villela (2840482423009)  
**Trilha:** B  
**Origem do problema:** Banco de Temas nº 10  
**Data:** 21/08/2026  

---

## 1. Problema

A gestão de hortas, estufas e plantações de pequeno porte, familiares e comunitárias, pode depender de **anotações em papel, planilhas eletrônicas, mensagens ou comunicação verbal** entre os responsáveis, deixando as informações dispersas. Isso dificulta o acompanhamento centralizado dos plantios, das tarefas, do estoque de insumos e das colheitas.

Os principais problemas estão relacionados à dificuldade para saber **quais culturas estão plantadas em cada canteiro, quais atividades precisam ser realizadas, quem é responsável por cada função e quanto de cada insumo está disponível em estoque**. O controle manual também aumenta o risco de erros, como agendar uma atividade sem possuir insumo suficiente ou utilizar o mesmo canteiro ou ferramenta em tarefas simultâneas.

Na ausência de um sistema integrado, o responsável pela horta precisa consultar diferentes registros e se comunicar manualmente com os demais membros para organizar as atividades. Isso pode gerar **retrabalho, perda de informações, atrasos nas tarefas, desperdício de insumos e dificuldades para analisar a produtividade da horta**.

---

## 2. Público-alvo e perfis de usuário

O sistema contará com autenticação de usuários e controle de acesso baseado em papéis (**RBAC**), contemplando pelo menos dois perfis distintos:

| Perfil | Quem é | O que faz no sistema |
|---|---|---|
| **Administrador / Gestor da Horta** | Responsável pela administração da horta familiar ou comunitária, pelo planejamento da produção e pelo gerenciamento dos recursos e usuários. | Cadastra culturas, canteiros e insumos; gerencia usuários; acompanha plantios e tarefas; controla estoque; aprova demandas que apresentem problemas de disponibilidade de recursos; consulta relatórios financeiros e de produção; acompanha indicadores no dashboard. |
| **Membro / Operacional** | Pessoa que participa das atividades práticas de manutenção e produção da horta. | Consulta suas tarefas; registra atividades como rega, adubação e colheita; consulta a disponibilidade de insumos; atualiza informações das atividades realizadas e acompanha o cronograma de tarefas atribuídas. |

---

## 3. Visão da solução

O **Projeto Horta Familiar** será uma plataforma web para centralizar o gerenciamento de plantios familiares e comunitários, permitindo controlar usuários, culturas, canteiros, insumos e tarefas em um único sistema. A solução substituirá controles manuais e descentralizados, facilitando o acompanhamento das atividades e dos recursos disponíveis. O sistema realizará automaticamente validações de estoque e de conflitos de recursos durante o agendamento de tarefas, reduzindo erros e desperdícios. Além disso, disponibilizará indicadores de produção por meio de um dashboard, auxiliando o gestor na tomada de decisões.

---

## 4. Objetivos do MVP (o que o semestre entrega)

- **Centralizar 100% dos registros essenciais da horta** — usuários, culturas, canteiros, plantios, insumos e tarefas — em um único sistema.
- **Automatizar o controle de estoque**, impedindo o agendamento de tarefas quando não houver quantidade suficiente de insumos e permitindo a identificação de situações de possível ruptura.
- **Reduzir erros de planejamento**, realizando automaticamente a verificação de conflitos de canteiros, ferramentas e demais recursos utilizados em tarefas agendadas para o mesmo período.
- **Disponibilizar um dashboard de produção** com indicadores consolidados por cultura e canteiro, utilizando consultas com `JOIN` e `GROUP BY`.
- **Disponibilizar o sistema publicamente em ambiente de nuvem**, com código versionado em repositório Git e documentação para instalação e implantação.

---

## 5. Fora de escopo (explicitamente)

- **Aplicativo mobile nativo:** neste semestre será desenvolvida uma aplicação web, evitando a necessidade de manter versões específicas para Android e iOS.
- **Integração com dispositivos IoT e sensores agrícolas:** não serão implementados sensores para monitoramento automático de umidade do solo, temperatura ou irrigação, pois isso aumentaria a complexidade de hardware e integração do MVP.
- **Automação física da irrigação ou adubação:** o sistema registrará e organizará as atividades, mas não controlará equipamentos físicos.
- **Integração com sistemas financeiros ou bancários:** o controle financeiro será limitado aos recursos necessários para os relatórios previstos no projeto, sem integração com bancos ou plataformas de pagamento.
- **Previsão de produção utilizando Inteligência Artificial:** o MVP apresentará dados históricos e indicadores de produção, mas não terá modelos de previsão ou recomendação automatizada, devido ao tempo e à necessidade de dados históricos suficientes para treinamento e validação.

---

# 6. Requisitos mínimos

## 6.1. Perfis de Usuário e Controle de Acesso

O sistema contará com autenticação de usuários e controle de acesso baseado em papéis (**RBAC**), contemplando pelo menos dois perfis distintos:

- **Administrador / Gestor da Horta:** possui acesso total ao sistema, podendo cadastrar novas culturas, gerenciar usuários, definir regras de negócio, visualizar relatórios financeiros e de produção consolidados e aprovar demandas críticas.
- **Membro / Operacional:** possui acesso restrito para registrar atividades diárias, como rega, adubação e colheita, consultar o estoque de insumos e visualizar o cronograma de tarefas atribuídas a si.

---

## 6.2. Modelo de Dados (Mínimo de 6 Entidades)

O banco de dados relacional será estruturado contemplando as seguintes entidades principais:

1. **Usuario:** armazena dados cadastrais e o perfil de acesso.
2. **Cultura:** define os tipos de vegetais, hortaliças ou frutas cultivadas, incluindo informações como tempo médio de maturação e espaçamento ideal.
3. **Canteiro:** representa os espaços físicos delimitados onde o plantio é realizado.
4. **Plantio:** relaciona uma cultura a um canteiro específico em uma determinada data de plantio e inclui o status atual, como `Crescimento`, `Colhido` ou `Perdido`.
5. **Insumo:** gerencia os recursos disponíveis, como sementes, fertilizantes e ferramentas.
6. **Tarefa:** agenda atividades operacionais relacionadas aos canteiros ou insumos.

### Relacionamento N:N

Haverá um relacionamento do tipo **muitos para muitos (N:N)** entre as entidades **Insumo** e **Plantio** ou **Tarefa**, indicando quais insumos foram utilizados em determinados plantios ou atividades ao longo do tempo.

Esse relacionamento será intermediado por uma **tabela associativa**, que poderá armazenar atributos específicos, como a **quantidade utilizada**.

---

## 6.3. Regra de Negócio Não Trivial

O sistema implementará uma regra de negócio avançada de **Controle de Estoque com Baixa Automática e Alerta de Ruptura**, combinada com **Agendamento com Conflito de Recursos**.

- Sempre que uma **Tarefa** de adubação ou plantio for agendada utilizando determinado **Insumo**, o sistema validará se há saldo suficiente em estoque.
- Caso o saldo seja insuficiente, o agendamento será rejeitado ou exigirá aprovação superior, de acordo com as regras definidas pelo administrador.
- Após a utilização de um insumo, o sistema realizará a **baixa automática da quantidade utilizada no estoque**.
- O sistema deverá emitir um **alerta de ruptura ou baixo estoque** quando a quantidade disponível atingir o limite mínimo definido.
- Adicionalmente, o sistema verificará se ferramentas ou canteiros essenciais já estão alocados para outra tarefa no mesmo horário, impedindo conflitos de agendamento.

---

## 6.4. Consulta Agregada (Relatório / Dashboard)

Para a tomada de decisões, a plataforma disponibilizará um painel analítico (**Dashboard**) que exibirá consultas agregadas utilizando operações avançadas de banco de dados.

- **Requisito da Query:** deverá envolver operações de `GROUP BY` e junção (`JOIN`) entre **3 ou mais tabelas**.
- **Exemplo de indicador:** produtividade total, representada pelo peso colhido, agrupada por tipo de cultura e por canteiro no último trimestre.
- O indicador permitirá identificar quais culturas e áreas da horta apresentam maior rendimento.

---

## 6.5. Validações de Integridade

A integridade e consistência dos dados serão garantidas em duas camadas:

### Camada de Interface (Frontend)

Serão realizadas validações relacionadas a:

- preenchimento de campos obrigatórios;
- formato de e-mail;
- requisitos de senha;
- restrições de datas;
- valores numéricos válidos;
- quantidade de insumos informada nas operações.

### Camada de Banco de Dados (Backend / SGBD)

Serão aplicadas restrições de integridade, incluindo:

- `NOT NULL`;
- chaves primárias (`PRIMARY KEY`);
- chaves estrangeiras (`FOREIGN KEY`);
- regras de unicidade (`UNIQUE`) para e-mails de usuários;
- `CHECK CONSTRAINT` para garantir valores válidos;
- restrições para impedir que a quantidade de estoque seja inferior a zero.

---

## 6.6. Requisitos de Infraestrutura e Implantação

- **Deploy Público:** a aplicação será hospedada em ambiente de nuvem acessível publicamente por URL dedicada, utilizando uma plataforma adequada ao projeto, como Render, Vercel ou Railway.
- **Repositório e Documentação:** o código-fonte será versionado em repositório Git público ou compartilhado, acompanhado de um arquivo `README.md` completo, detalhado e estruturado para permitir que terceiros realizem o clone e o deploy do projeto.
- **Banco de Dados:** o banco de dados deverá estar disponível em ambiente compatível com a aplicação publicada, permitindo o funcionamento do sistema sem depender de recursos exclusivamente locais.
- **Configuração:** informações sensíveis, como credenciais e chaves de acesso, não deverão ser armazenadas diretamente no código-fonte, utilizando variáveis de ambiente quando necessário.

---

# 7. Riscos, Impactos e Mitigação

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| **Atraso no desenvolvimento** devido à complexidade das funcionalidades de estoque, agendamento e controle de conflitos. | Média | Alto | Priorizar as funcionalidades essenciais do MVP, dividir o desenvolvimento em etapas e acompanhar regularmente o progresso da equipe. |
| **Dificuldade na implementação das regras de negócio** relacionadas à baixa automática de estoque e conflitos de recursos. | Média | Alto | Definir previamente as regras e os cenários de uso, implementar testes para as principais situações e validar as regras antes da integração com as demais funcionalidades. |
| **Erros ou inconsistências no banco de dados** durante o cadastro, alteração ou exclusão de informações. | Média | Alto | Utilizar chaves primárias e estrangeiras, `NOT NULL`, `UNIQUE`, `CHECK CONSTRAINTS` e validações no frontend e backend. Realizar testes de integridade antes da publicação. |
| **Conflitos de agenda não identificados pelo sistema**, causando a utilização simultânea de um mesmo canteiro ou ferramenta. | Baixa | Alto | Implementar validação automática dos recursos e horários antes da confirmação de uma tarefa e realizar testes com diferentes cenários de conflito. |
| **Indisponibilidade do ambiente de hospedagem** durante a apresentação ou utilização do sistema. | Baixa | Alto | Utilizar uma plataforma de hospedagem confiável, realizar testes de deploy antecipadamente e manter uma versão estável do sistema no repositório Git. |
| **Perda de dados durante o desenvolvimento** por falhas ou alterações incorretas no banco de dados. | Baixa | Alto | Utilizar controle de versão no código, realizar backups periódicos do banco e testar alterações em ambiente de desenvolvimento antes de aplicá-las à versão publicada. |
| **Baixa adesão ou dificuldade de utilização pelos usuários**, principalmente por pessoas sem familiaridade com sistemas de gestão. | Média | Médio | Desenvolver uma interface simples e intuitiva, utilizar mensagens claras de erro e validação e disponibilizar instruções básicas de utilização no sistema ou no `README.md`. |
| **Escopo excessivamente amplo para o período do semestre**, comprometendo a entrega das funcionalidades principais. | Média | Alto | Manter os itens definidos como fora de escopo, priorizar os requisitos obrigatórios e evitar a inclusão de funcionalidades não essenciais durante o desenvolvimento do MVP. |
| **Falhas de segurança ou acesso indevido às funcionalidades** devido à configuração incorreta dos perfis de usuário. | Baixa | Alto | Implementar controle de acesso baseado em papéis (RBAC), validar permissões no backend e realizar testes com os diferentes perfis de usuário. |
| **Problemas de integração entre frontend, backend e banco de dados.** | Média | Médio | Definir previamente as interfaces entre as camadas, realizar testes de integração durante o desenvolvimento e utilizar um ambiente de desenvolvimento semelhante ao ambiente de produção. |

---

