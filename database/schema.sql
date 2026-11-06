
-- Horta Familiar

-- Restrição de conflito de horários requer a extensão btree_gist
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- =========================================
-- USUÁRIOS
-- =========================================

CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    perfil VARCHAR(20) NOT NULL
        CHECK (perfil IN ('ADMIN', 'OPERACIONAL'))
);

-- =========================================
-- CULTURAS
-- =========================================

CREATE TABLE cultura (
    id_cultura SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    tempo_maturacao_dias INT NOT NULL
        CHECK (tempo_maturacao_dias > 0),
    espacamento_ideal DECIMAL(6,2) NOT NULL
        CHECK (espacamento_ideal > 0)
);

-- =========================================
-- CANTEIROS
-- =========================================

CREATE TABLE canteiro (
    id_canteiro SERIAL PRIMARY KEY,
    identificacao VARCHAR(50) NOT NULL UNIQUE,
    area_m2 DECIMAL(8,2) NOT NULL
        CHECK (area_m2 > 0)
);

-- =========================================
-- INSUMOS
-- =========================================

CREATE TABLE insumo (
    id_insumo SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL
        CHECK (tipo IN ('SEMENTE', 'FERTILIZANTE', 'FERRAMENTA')),

    -- O saldo pode ficar negativo somente quando houver
    -- consumo excepcional autorizado por administrador.
    quantidade_estoque DECIMAL(10,2) NOT NULL,

    estoque_minimo DECIMAL(10,2) NOT NULL
        CHECK (estoque_minimo >= 0)
);

-- =========================================
-- PLANTIOS
-- =========================================

CREATE TABLE plantio (
    id_plantio SERIAL PRIMARY KEY,
    id_cultura INT NOT NULL REFERENCES cultura(id_cultura),
    id_canteiro INT NOT NULL REFERENCES canteiro(id_canteiro),
    data_plantio DATE NOT NULL,
    status VARCHAR(20) NOT NULL
        CHECK (status IN ('CRESCIMENTO', 'COLHIDO', 'PERDIDO')),
    peso_colhido DECIMAL(10,2)
        CHECK (peso_colhido >= 0)
);

-- =========================================
-- TAREFAS
-- =========================================

CREATE TABLE tarefa (
    id_tarefa SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL REFERENCES usuario(id_usuario),
    id_canteiro INT REFERENCES canteiro(id_canteiro),
    descricao VARCHAR(255) NOT NULL,
    data_tarefa DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,

    status VARCHAR(30) NOT NULL
        CHECK (
            status IN (
                'PENDENTE',
                'AGUARDANDO_APROVACAO',
                'CONCLUIDA',
                'CANCELADA'
            )
        ),

    data_conclusao TIMESTAMP,

    CONSTRAINT chk_tarefa_horario
        CHECK (hora_fim > hora_inicio)
);

-- =========================================
-- APROVAÇÃO EXCEPCIONAL DE ESTOQUE
-- História 14
-- =========================================

CREATE TABLE tarefa_aprovacao_estoque (
    id_aprovacao SERIAL PRIMARY KEY,

    id_tarefa INT NOT NULL
        REFERENCES tarefa(id_tarefa) ON DELETE CASCADE,

    id_admin INT NOT NULL
        REFERENCES usuario(id_usuario),

    data_aprovacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    observacao TEXT
);

CREATE INDEX idx_tarefa_aprovacao_estoque_tarefa
    ON tarefa_aprovacao_estoque (id_tarefa);

-- Garantir que somente usuários ADMIN sejam registrados
-- como responsáveis pela aprovação excepcional.
CREATE OR REPLACE FUNCTION fn_validar_aprovacao_admin()
RETURNS TRIGGER AS $$
DECLARE
    perfil_usuario VARCHAR(20);
BEGIN
    SELECT perfil
    INTO perfil_usuario
    FROM usuario
    WHERE id_usuario = NEW.id_admin;

    IF perfil_usuario IS DISTINCT FROM 'ADMIN' THEN
        RAISE EXCEPTION
            'Somente usuários ADMIN podem aprovar exceções de estoque.'
            USING ERRCODE = '23514';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_aprovacao_admin
    BEFORE INSERT ON tarefa_aprovacao_estoque
    FOR EACH ROW
    EXECUTE FUNCTION fn_validar_aprovacao_admin();

-- =========================================
-- INSUMOS UTILIZADOS EM PLANTIOS
-- =========================================

CREATE TABLE plantio_insumo (
    id_plantio INT NOT NULL REFERENCES plantio(id_plantio),
    id_insumo INT NOT NULL REFERENCES insumo(id_insumo),
    quantidade_utilizada DECIMAL(10,2) NOT NULL
        CHECK (quantidade_utilizada > 0),

    PRIMARY KEY (id_plantio, id_insumo)
);

-- =========================================
-- INSUMOS UTILIZADOS EM TAREFAS
-- =========================================

CREATE TABLE tarefa_insumo (
    id_tarefa INT NOT NULL REFERENCES tarefa(id_tarefa),
    id_insumo INT NOT NULL REFERENCES insumo(id_insumo),
    quantidade_utilizada DECIMAL(10,2) NOT NULL
        CHECK (quantidade_utilizada > 0),

    PRIMARY KEY (id_tarefa, id_insumo)
);

-- =========================================
-- INSUMOS PENDENTES DE APROVAÇÃO
-- História 14
-- =========================================

CREATE TABLE tarefa_insumo_pendente (
    id_tarefa INT NOT NULL
        REFERENCES tarefa(id_tarefa) ON DELETE CASCADE,

    id_insumo INT NOT NULL
        REFERENCES insumo(id_insumo),

    quantidade DECIMAL(10,2) NOT NULL
        CHECK (quantidade > 0),

    PRIMARY KEY (id_tarefa, id_insumo)
);

-- =========================================
-- RESERVAS DE FERRAMENTAS
-- =========================================

-- Reservas de ferramentas reutilizáveis.
-- Não possuem gatilho de consumo de estoque.
-- quantidade_estoque representa a capacidade disponível
-- para ferramentas do mesmo tipo.

CREATE TABLE tarefa_ferramenta (
    id_tarefa INT NOT NULL
        REFERENCES tarefa(id_tarefa) ON DELETE CASCADE,

    id_insumo INT NOT NULL
        REFERENCES insumo(id_insumo),

    quantidade DECIMAL(10,2) NOT NULL
        CHECK (quantidade > 0),

    inicio TIMESTAMP NOT NULL,
    fim TIMESTAMP NOT NULL,
    ativa BOOLEAN NOT NULL DEFAULT TRUE,

    PRIMARY KEY (id_tarefa, id_insumo),

    CONSTRAINT chk_tarefa_ferramenta_horario
        CHECK (fim > inicio)
);

CREATE INDEX idx_tarefa_ferramenta_periodo
    ON tarefa_ferramenta (id_insumo, inicio, fim)
    WHERE ativa = TRUE;

-- =========================================
-- CONFLITO DE AGENDAMENTO DE CANTEIROS
-- =========================================

ALTER TABLE tarefa
ADD CONSTRAINT excl_tarefa_canteiro_conflito
EXCLUDE USING gist (
    id_canteiro WITH =,
    tsrange(
        (data_tarefa + hora_inicio)::timestamp,
        (data_tarefa + hora_fim)::timestamp,
        '[)'
    ) WITH &&
)
WHERE (
    id_canteiro IS NOT NULL
    AND status NOT IN ('CANCELADA')
);

-- =========================================
-- ATUALIZAÇÃO E CONTROLE DE ESTOQUE
-- =========================================

CREATE OR REPLACE FUNCTION fn_atualiza_estoque()
RETURNS TRIGGER AS $$
DECLARE
    estoque_atual DECIMAL(10,2);
    possui_aprovacao BOOLEAN := FALSE;
BEGIN

    -- Em caso de exclusão ou atualização,
    -- devolver primeiro a quantidade anterior.
    IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN

        UPDATE insumo
        SET quantidade_estoque =
            quantidade_estoque + OLD.quantidade_utilizada
        WHERE id_insumo = OLD.id_insumo;

    END IF;

    -- Em caso de exclusão, finalizar após devolver o estoque.
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;

    -- Consultar o estoque atual e bloquear a linha
    -- para evitar alterações concorrentes.
    SELECT quantidade_estoque
    INTO estoque_atual
    FROM insumo
    WHERE id_insumo = NEW.id_insumo
    FOR UPDATE;

    -- Verificar se a tarefa possui aprovação excepcional.
    IF TG_TABLE_NAME = 'tarefa_insumo' THEN

        SELECT EXISTS (
            SELECT 1
            FROM tarefa_aprovacao_estoque
            WHERE id_tarefa = NEW.id_tarefa
        )
        INTO possui_aprovacao;

    END IF;

    -- Sem aprovação, não permitir consumo acima do estoque.
    IF estoque_atual < NEW.quantidade_utilizada
       AND NOT possui_aprovacao THEN

        RAISE EXCEPTION
            'Estoque insuficiente para realizar esta utilização.'
            USING ERRCODE = '23514';

    END IF;

    -- Com aprovação excepcional registrada,
    -- permitir o consumo mesmo que o saldo fique negativo.
    UPDATE insumo
    SET quantidade_estoque =
        quantidade_estoque - NEW.quantidade_utilizada
    WHERE id_insumo = NEW.id_insumo;

    RETURN NEW;

END;
$$ LANGUAGE plpgsql;

-- Controle de consumo em tarefas.
CREATE TRIGGER trg_estoque_tarefa
    AFTER INSERT OR UPDATE OR DELETE ON tarefa_insumo
    FOR EACH ROW
    EXECUTE FUNCTION fn_atualiza_estoque();

-- Controle de consumo em plantios.
-- Não permite saldo negativo por aprovação de tarefa.
CREATE TRIGGER trg_estoque_plantio
    AFTER INSERT OR UPDATE OR DELETE ON plantio_insumo
    FOR EACH ROW
    EXECUTE FUNCTION fn_atualiza_estoque();

-- =========================================
-- DASHBOARD DE PRODUÇÃO
-- =========================================

CREATE OR REPLACE VIEW vw_dashboard_producao AS
SELECT
    c.nome AS cultura,
    cn.identificacao AS canteiro,
    COUNT(p.id_plantio) AS total_plantios,
    COALESCE(SUM(p.peso_colhido), 0) AS produtividade_total_kg
FROM plantio p
JOIN cultura c
    ON p.id_cultura = c.id_cultura
JOIN canteiro cn
    ON p.id_canteiro = cn.id_canteiro
WHERE p.status = 'COLHIDO'
GROUP BY
    c.nome,
    cn.identificacao;
