# DER — Horta Familiar

## 1. Diagrama

```mermaid
derDiagram

    USUARIO ||--o{ TAREFA : "recebe"

    CULTURA ||--o{ PLANTIO : "define"

    CANTEIRO ||--o{ PLANTIO : "possui"

    CANTEIRO ||--o{ TAREFA : "envolve"

    PLANTIO ||--o{ PLANTIO_INSUMO : "utiliza"

    INSUMO ||--o{ PLANTIO_INSUMO : "é utilizado em"

    TAREFA ||--o{ TAREFA_INSUMO : "utiliza"

    INSUMO ||--o{ TAREFA_INSUMO : "é utilizado em"

    USUARIO {
        INT id_usuario PK
        VARCHAR nome
        VARCHAR email UK
        VARCHAR senha
        VARCHAR perfil
    }

    CULTURA {
        INT id_cultura PK
        VARCHAR nome UK
        INT tempo_maturacao_dias
        DECIMAL espacamento_ideal
    }

    CANTEIRO {
        INT id_canteiro PK
        VARCHAR identificacao UK
        DECIMAL area_m2
    }

    PLANTIO {
        INT id_plantio PK
        INT id_cultura FK
        INT id_canteiro FK
        DATE data_plantio
        VARCHAR status
        DECIMAL peso_colhido
    }

    INSUMO {
        INT id_insumo PK
        VARCHAR nome
        VARCHAR tipo
        DECIMAL quantidade_estoque
        DECIMAL estoque_minimo
    }

    TAREFA {
        INT id_tarefa PK
        INT id_usuario FK
        INT id_canteiro FK
        VARCHAR descricao
        DATE data_tarefa
        TIME hora_inicio
        TIME hora_fim
        VARCHAR status
    }

    PLANTIO_INSUMO {
        INT id_plantio PK, FK
        INT id_insumo PK, FK
        DECIMAL quantidade_utilizada
    }

    TAREFA_INSUMO {
        INT id_tarefa PK, FK
        INT id_insumo PK, FK
        DECIMAL quantidade_utilizada
    }
```

## 2. Dicionário de dados

### Tabela: usuario

| Campo      | Tipo         | Restrições       | Descrição                                    |
| ---------- | ------------ | ---------------- | -------------------------------------------- |
| id_usuario | INT          | PK, NOT NULL     | Identificador único do usuário               |
| nome       | VARCHAR(100) | NOT NULL         | Nome completo do usuário                     |
| email      | VARCHAR(150) | NOT NULL, UNIQUE | E-mail utilizado para identificação e acesso |
| senha      | VARCHAR(255) | NOT NULL         | Senha do usuário armazenada de forma segura  |
| perfil     | VARCHAR(20)  | NOT NULL, CHECK  | Perfil de acesso: ADMIN ou OPERACIONAL       |

### Tabela: cultura

| Campo                | Tipo         | Restrições          | Descrição                                         |
| -------------------- | ------------ | ------------------- | ------------------------------------------------- |
| id_cultura           | INT          | PK, NOT NULL        | Identificador único da cultura                    |
| nome                 | VARCHAR(100) | NOT NULL, UNIQUE    | Nome da cultura                                   |
| tempo_maturacao_dias | INT          | NOT NULL, CHECK > 0 | Tempo estimado para maturação da cultura, em dias |
| espacamento_ideal    | DECIMAL(6,2) | NOT NULL, CHECK > 0 | Espaçamento ideal entre as plantas, em metros     |

### Tabela: canteiro

| Campo         | Tipo         | Restrições          | Descrição                            |
| ------------- | ------------ | ------------------- | ------------------------------------ |
| id_canteiro   | INT          | PK, NOT NULL        | Identificador único do canteiro      |
| identificacao | VARCHAR(50)  | NOT NULL, UNIQUE    | Nome ou identificação do canteiro    |
| area_m2       | DECIMAL(8,2) | NOT NULL, CHECK > 0 | Área do canteiro em metros quadrados |

### Tabela: plantio

| Campo        | Tipo          | Restrições      | Descrição                                            |
| ------------ | ------------- | --------------- | ---------------------------------------------------- |
| id_plantio   | INT           | PK, NOT NULL    | Identificador único do plantio                       |
| id_cultura   | INT           | FK, NOT NULL    | Referência à cultura plantada                        |
| id_canteiro  | INT           | FK, NOT NULL    | Referência ao canteiro utilizado                     |
| data_plantio | DATE          | NOT NULL        | Data em que o plantio foi realizado                  |
| status       | VARCHAR(20)   | NOT NULL, CHECK | Situação do plantio: CRESCIMENTO, COLHIDO ou PERDIDO |
| peso_colhido | DECIMAL(10,2) | CHECK >= 0      | Peso obtido na colheita, em quilogramas              |

### Tabela: insumo

| Campo              | Tipo          | Restrições           | Descrição                                           |
| ------------------ | ------------- | -------------------- | --------------------------------------------------- |
| id_insumo          | INT           | PK, NOT NULL         | Identificador único do insumo                       |
| nome               | VARCHAR(100)  | NOT NULL             | Nome do insumo                                      |
| tipo               | VARCHAR(20)   | NOT NULL, CHECK      | Tipo do insumo: SEMENTE, FERTILIZANTE ou FERRAMENTA |
| quantidade_estoque | DECIMAL(10,2) | NOT NULL, CHECK >= 0 | Quantidade disponível no estoque                    |
| estoque_minimo     | DECIMAL(10,2) | NOT NULL, CHECK >= 0 | Quantidade mínima para geração de alerta de estoque |

### Tabela: tarefa

| Campo       | Tipo         | Restrições      | Descrição                                                    |
| ----------- | ------------ | --------------- | ------------------------------------------------------------ |
| id_tarefa   | INT          | PK, NOT NULL    | Identificador único da tarefa                                |
| id_usuario  | INT          | FK, NOT NULL    | Usuário responsável pela tarefa                              |
| id_canteiro | INT          | FK, NULL        | Canteiro relacionado à tarefa                                |
| descricao   | VARCHAR(255) | NOT NULL        | Descrição da atividade a ser realizada                       |
| data_tarefa | DATE         | NOT NULL        | Data prevista para realização da tarefa                      |
| hora_inicio | TIME         | NOT NULL        | Horário de início da tarefa                                  |
| hora_fim    | TIME         | NOT NULL        | Horário de término da tarefa                                 |
| status      | VARCHAR(20)  | NOT NULL, CHECK | Situação da tarefa: PENDENTE, CONCLUIDA ou CANCELADA         |
|             |              | CHECK           | O horário de término deve ser posterior ao horário de início |

### Tabela: plantio_insumo

| Campo                | Tipo          | Restrições          | Descrição                                 |
| -------------------- | ------------- | ------------------- | ----------------------------------------- |
| id_plantio           | INT           | PK, FK, NOT NULL    | Identificador do plantio relacionado      |
| id_insumo            | INT           | PK, FK, NOT NULL    | Identificador do insumo utilizado         |
| quantidade_utilizada | DECIMAL(10,2) | NOT NULL, CHECK > 0 | Quantidade do insumo utilizada no plantio |

### Tabela: tarefa_insumo

| Campo                | Tipo          | Restrições          | Descrição                                   |
| -------------------- | ------------- | ------------------- | ------------------------------------------- |
| id_tarefa            | INT           | PK, FK, NOT NULL    | Identificador da tarefa relacionada         |
| id_insumo            | INT           | PK, FK, NOT NULL    | Identificador do insumo utilizado na tarefa |
| quantidade_utilizada | DECIMAL(10,2) | NOT NULL, CHECK > 0 | Quantidade do insumo utilizada na tarefa    |
