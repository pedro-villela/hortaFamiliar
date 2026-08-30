# Termo de Aceite do Projeto — Horta Familiar

**Equipe:** Thaynara Franco (RA 2840482423001), Guilherme Assunção (RA 2840482423014), Adriana Martelli (RA 2840482423026), Wilson Lau (RA 2840482423013), Pedro Villela (RA 2840482423009)
**Trilha:** B
**Origem:** Banco de Temas nº 10
**Data:** 28/08/2026

## 1. Escopo aceito para o semestre (funcionalidades Must + Should)
1. Cadastro e autenticação de usuários com controle de perfis (Administrador e Membro).
2. Gestão centralizada de culturas, canteiros e insumos: sementes, fertilizantes, ferramentas.
3. Registro e acompanhamento de plantios, vinculando cultura e canteiro.
4. Agendamento de tarefas operacionais (rega, adubação, colheita) com baixa automática de estoque.
5. Sistema automatizado de bloqueio de agendamento por conflito de recursos (canteiros/ferramentas) no mesmo horário.
6. Emissão de alertas automáticos em caso de ruptura ou baixo nível de estoque de insumos.
7. Painel analítico (Dashboard) exibindo indicadores de produtividade por cultura e canteiro.

## 2. Critérios de pronto do MVP
- [ ] Administrador e Membro conseguem realizar login e possuem acessos e permissões estritamente segregados.
- [ ] O fluxo de negócio funciona de ponta a ponta: cadastro do plantio → agendamento de tarefa → baixa de insumo → colheita.
- [ ] Validações de integridade ativas: o sistema impede agendamento sem estoque e barra tarefas com conflito de recursos simultâneos.
- [ ] Dashboard exibe dados consolidados reais (utilizando consultas com JOIN e GROUP BY entre 3 ou mais tabelas).
- [ ] Aplicação web e banco de dados publicados em ambiente de nuvem acessível publicamente por URL dedicada.
- [ ] Repositório Git público/compartilhado contendo README detalhado, permitindo implantação do zero por terceiros.

## 3. Stack tecnológica definida
| Camada              | Tecnologia Escolhida                 |
| ------------------- | ------------------------------------ |
| Frontend            | React + Vite (Web)                   |
| Backend             | Node.js                              |
| Banco de Dados      | PostgreSQL                           |
| Hospedagem / Deploy | Render / Railway e Vercel (Frontend) |

## 4. Papéis iniciais da equipe (Sprint 1)
| Integrante         | Papel Principal                        |
| ------------------ | -------------------------------------- |
| Wilson Lau         | Product Owner (Gestão de Requisitos)   |
| Thaynara Franco    | Scrum Master / Facilitador             |
| Adriana Martelli   | Desenvolvedora Frontend / UI           |
| Guilherme Assunção | Desenvolvedor Backend / Banco de Dados |
| Pedro Villela      | Analista de Qualidade / Deploy         |

## 5. Aprovação
- Professor: Lucas B. F. _________ Data: 28/08/2026
