# Diagramas UML — Horta Familiar

## 1. Diagrama de Casos de Uso

```mermaid
flowchart LR
  Admin((Administrador))
  Membro((Membro))
  Admin --> UC1[Fazer login]
  Membro --> UC1
  Admin --> UC2[Gerenciar culturas]
  Admin --> UC3[Gerenciar canteiros]
  Admin --> UC4[Gerenciar insumos]
  Admin --> UC5[Registrar plantio]
  Admin --> UC6[Agendar e atribuir tarefa]
  Admin --> UC7[Registrar utilização de insumos]
  Admin --> UC8[Visualizar dashboard de produção]
  Admin --> UC9[Visualizar resumo do estoque]
  Admin --> UC10[Aprovar tarefa sem estoque]
  Membro --> UC11[Visualizar minhas tarefas]
  Membro --> UC12[Registrar conclusão de tarefa]
  UC6 -.include.-> UC13[Validar estoque e conflitos de recursos]
```

## 2. Diagrama de Classes

```mermaid
classDiagram
  class Usuario {
    +idUsuario: int
    +nome: string
    +email: string
    +senha: string
    +perfil: enum
    +fazerLogin(email, senha) bool
  }
  
  class Cultura {
    +idCultura: int
    +nome: string
    +tempoMaturacaoDias: int
    +espacamentoIdeal: decimal
  }
  
  class Canteiro {
    +idCanteiro: int
    +identificacao: string
    +areaM2: decimal
    +isDisponivel(data, horaInicio, horaFim) bool
  }
  
  class Insumo {
    +idInsumo: int
    +nome: string
    +tipo: enum
    +quantidadeEstoque: decimal
    +estoqueMinimo: decimal
    +temSaldo(quantidade) bool
    +baixarEstoque(quantidade)
    +isEstoqueCritico() bool
  }
  
  class Plantio {
    +idPlantio: int
    +idCultura: int
    +idCanteiro: int
    +dataPlantio: date
    +status: enum
    +pesoColhido: decimal
    +atualizarStatus(novoStatus)
    +registrarColheita(peso)
  }
  
  class Tarefa {
    +idTarefa: int
    +idUsuario: int
    +idCanteiro: int
    +descricao: string
    +dataTarefa: date
    +horaInicio: time
    +horaFim: time
    +status: enum
    +concluir()
    +aprovarExcecao()
  }
  
  class PlantioInsumo {
    +idPlantio: int
    +idInsumo: int
    +quantidadeUtilizada: decimal
  }
  
  class TarefaInsumo {
    +idTarefa: int
    +idInsumo: int
    +quantidadeUtilizada: decimal
  }

  Usuario "1" -- "N" Tarefa : recebe
  Cultura "1" -- "N" Plantio : define
  Canteiro "1" -- "N" Plantio : abriga
  Canteiro "0..1" -- "N" Tarefa : envolve
  Plantio "1" -- "N" PlantioInsumo : utiliza
  Insumo "1" -- "N" PlantioInsumo : consumido em
  Tarefa "1" -- "N" TarefaInsumo : utiliza
  Insumo "1" -- "N" TarefaInsumo : consumido em
```

## 3. Rastreabilidade — caso de uso → história do backlog

| Caso de uso | História(s) relacionada(s) (E2) |
|---|---|
| Fazer login | #1 |
| Gerenciar culturas | #2 |
| Gerenciar canteiros | #3 |
| Gerenciar insumos | #4 |
| Registrar plantio | #5 |
| Agendar e atribuir tarefa + Validar estoque e conflitos | #6, #10, #11 |
| Visualizar minhas tarefas | #7 |
| Registrar conclusão de tarefa | #8 |
| Registrar utilização de insumos | #9 |
| Visualizar dashboard de produção | #12 |
| Visualizar resumo do estoque | #13 |
| Aprovar tarefa sem estoque | #14 |


