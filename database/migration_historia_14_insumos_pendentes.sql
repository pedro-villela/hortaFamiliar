
BEGIN;

CREATE TABLE IF NOT EXISTS tarefa_insumo_pendente (
    id_tarefa INT NOT NULL
        REFERENCES tarefa(id_tarefa) ON DELETE CASCADE,

    id_insumo INT NOT NULL
        REFERENCES insumo(id_insumo),

    quantidade DECIMAL(10,2) NOT NULL
        CHECK (quantidade > 0),

    PRIMARY KEY (id_tarefa, id_insumo)
);

COMMIT;
