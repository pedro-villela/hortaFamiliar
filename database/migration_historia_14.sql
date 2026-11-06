
BEGIN;

-- Permite registrar o estoque negativo em situações excepcionais,
-- desde que exista aprovação administrativa.
ALTER TABLE insumo
DROP CONSTRAINT IF EXISTS insumo_quantidade_estoque_check;

-- Inclui o estado de tarefa aguardando aprovação.
ALTER TABLE tarefa
DROP CONSTRAINT IF EXISTS tarefa_status_check;

ALTER TABLE tarefa
ADD CONSTRAINT chk_tarefa_status
CHECK (status IN (
    'PENDENTE',
    'AGUARDANDO_APROVACAO',
    'CONCLUIDA',
    'CANCELADA'
));

-- Registra as aprovações excepcionais de consumo.
CREATE TABLE IF NOT EXISTS tarefa_aprovacao_estoque (
    id_aprovacao SERIAL PRIMARY KEY,
    id_tarefa INT NOT NULL REFERENCES tarefa(id_tarefa) ON DELETE CASCADE,
    id_admin INT NOT NULL REFERENCES usuario(id_usuario),
    data_aprovacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observacao TEXT
);

CREATE INDEX IF NOT EXISTS idx_tarefa_aprovacao_estoque_tarefa
ON tarefa_aprovacao_estoque (id_tarefa);

-- Garante que somente um administrador possa registrar a aprovação.
CREATE OR REPLACE FUNCTION fn_validar_aprovacao_admin()
RETURNS TRIGGER AS $$
DECLARE
    v_perfil VARCHAR(20);
BEGIN
    SELECT perfil
    INTO v_perfil
    FROM usuario
    WHERE id_usuario = NEW.id_admin;

    IF v_perfil IS DISTINCT FROM 'ADMIN' THEN
        RAISE EXCEPTION 'Somente administradores podem aprovar consumo excepcional de estoque.'
            USING ERRCODE = '23514';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validar_aprovacao_admin
ON tarefa_aprovacao_estoque;

CREATE TRIGGER trg_validar_aprovacao_admin
BEFORE INSERT ON tarefa_aprovacao_estoque
FOR EACH ROW
EXECUTE FUNCTION fn_validar_aprovacao_admin();

-- Atualiza o estoque e permite saldo negativo somente
-- quando a tarefa possui aprovação administrativa registrada.
CREATE OR REPLACE FUNCTION fn_atualiza_estoque()
RETURNS TRIGGER AS $$
DECLARE
    v_estoque DECIMAL(10,2);
    v_aprovada BOOLEAN := FALSE;
BEGIN
    IF TG_OP IN ('DELETE', 'UPDATE') THEN
        UPDATE insumo
        SET quantidade_estoque = quantidade_estoque + OLD.quantidade_utilizada
        WHERE id_insumo = OLD.id_insumo;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;

    IF TG_TABLE_NAME = 'tarefa_insumo' THEN
        SELECT EXISTS (
            SELECT 1
            FROM tarefa_aprovacao_estoque
            WHERE id_tarefa = NEW.id_tarefa
        )
        INTO v_aprovada;
    END IF;

    SELECT quantidade_estoque
    INTO v_estoque
    FROM insumo
    WHERE id_insumo = NEW.id_insumo
    FOR UPDATE;

    IF v_estoque < NEW.quantidade_utilizada AND NOT v_aprovada THEN
        RAISE EXCEPTION 'Estoque insuficiente. É necessária aprovação administrativa para continuar.'
            USING ERRCODE = '23514';
    END IF;

    UPDATE insumo
    SET quantidade_estoque = quantidade_estoque - NEW.quantidade_utilizada
    WHERE id_insumo = NEW.id_insumo;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMIT;
